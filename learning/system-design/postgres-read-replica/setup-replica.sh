#!/bin/sh
set -eo pipefail

# ==============================================================================
# PostgreSQL Read Replica Standby Setup Script
# Executed as the container entrypoint for the 'replica' service.
#
# Process:
# 1. Wait for the primary PostgreSQL instance to become healthy and reachable.
# 2. Check if the replica data directory is already populated.
# 3. If uninitialized, execute `pg_basebackup` from the primary.
#    - Flushes WAL and copies physical data blocks
#    - With `-R`, writes `standby.signal` and connection info to `postgresql.auto.conf`
# 4. Enforce strict permissions (0700) required by PostgreSQL.
# 5. Start the PostgreSQL daemon in standby recovery mode.
# ==============================================================================

echo "=========================================================="
echo ">> [Replica Init] Initializing PostgreSQL Standby Replica..."
echo "=========================================================="

DATA_DIR="/var/lib/postgresql/data"
PRIMARY_HOST="${PRIMARY_HOST:-primary}"
PRIMARY_PORT="${PRIMARY_PORT:-5432}"
REPL_USER="${REPL_USER:-replicator}"
export PGPASSWORD="${PGPASSWORD:-replicator_pass}"

# 1. Poll primary node until it is ready to accept replication connections
echo ">> [Replica Init] Polling Primary at ${PRIMARY_HOST}:${PRIMARY_PORT}..."
until pg_isready -h "$PRIMARY_HOST" -p "$PRIMARY_PORT" -U "$REPL_USER"; do
    echo ">> [Replica Init] Primary is not ready yet. Retrying in 2 seconds..."
    sleep 2
done

echo ">> [Replica Init] Primary is reachable and accepting connections."

# 2. Check whether data directory contains an existing database
if [ ! -s "$DATA_DIR/PG_VERSION" ]; then
    echo ">> [Replica Init] Target data directory is empty. Initiating base backup clone..."
    
    # Clean out any temporary files or lost+found directory
    rm -rf "${DATA_DIR:?}"/* "${DATA_DIR:?}"/.[!.]* 2>/dev/null || true

    # Run pg_basebackup:
    # -h: Primary hostname
    # -p: Primary port
    # -D: Destination data directory
    # -U: Replication user credentials
    # -Fp: Plain format (direct directory tree instead of tarball)
    # -Xs: Stream WAL during the backup to ensure an immediately consistent state
    # -R: Automatically write recovery configuration:
    #     - Creates standby.signal in data directory (activates hot standby mode)
    #     - Appends primary_conninfo to postgresql.auto.conf
    # -P: Report progress
    # -v: Verbose output for observability
    pg_basebackup \
        -h "$PRIMARY_HOST" \
        -p "$PRIMARY_PORT" \
        -D "$DATA_DIR" \
        -U "$REPL_USER" \
        -Fp \
        -Xs \
        -R \
        -P \
        -v

    echo ">> [Replica Init] Base backup completed successfully."
    echo ">> [Replica Init] Standby signal status: $(ls -l $DATA_DIR/standby.signal 2>/dev/null || echo 'not found')"
else
    echo ">> [Replica Init] Existing cluster found in $DATA_DIR. Skipping base backup."
fi

# 3. Ensure proper directory permissions (PostgreSQL refuses to start if permissions are lenient)
chmod 0700 "$DATA_DIR"
chown -R postgres:postgres "$DATA_DIR"

echo ">> [Replica Init] Starting PostgreSQL daemon in Hot Standby read-only mode..."

# 4. Hand off execution to postgres daemon dropping privileges to postgres user
if command -v gosu >/dev/null 2>&1; then
    exec gosu postgres postgres -D "$DATA_DIR"
elif command -v su-exec >/dev/null 2>&1; then
    exec su-exec postgres postgres -D "$DATA_DIR"
else
    exec su -s /bin/sh postgres -c "postgres -D $DATA_DIR"
fi

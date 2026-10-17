#!/bin/bash
set -eo pipefail

# ==============================================================================
# PostgreSQL Primary Node Initialization Script
# Executed automatically by the official PostgreSQL image during first-boot
# inside /docker-entrypoint-initdb.d/
#
# Objectives:
# 1. Create a dedicated replication user ('replicator') with REPLICATION role
# 2. Grant replication connection permissions in pg_hba.conf
# 3. Create application tables (comments, users) for read/write workload
# 4. Trigger configuration reload so replication permissions take immediate effect
# ==============================================================================

echo "=========================================================="
echo ">> [Primary Init] Initializing PostgreSQL Primary node..."
echo "=========================================================="

# 1. Create replication user and benchmark tables
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Dedicated replication role with LOGIN privilege
    CREATE ROLE replicator WITH REPLICATION LOGIN ENCRYPTED PASSWORD 'replicator_pass';

    -- Table for replication lag benchmarking & write throughput tests
    CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        author VARCHAR(100) DEFAULT 'anonymous',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- Sample users table for read/write routing demonstrations
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes to optimize read queries on replicas
    CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

    -- Insert initial seed records
    INSERT INTO comments (content, author) VALUES 
        ('Welcome to PostgreSQL Primary-Replica Cluster', 'system'),
        ('Streaming replication transmits WAL records continuously', 'wal_sender');

    INSERT INTO users (username, email) VALUES
        ('alice', 'alice@example.com'),
        ('bob', 'bob@example.com');
EOSQL

echo ">> [Primary Init] Schema and replication user initialized successfully."

# 2. Append replication rules to pg_hba.conf
# pg_hba.conf controls client authentication. By default, replication connections
# are rejected unless an explicit 'replication' entry exists.
# We permit both md5 and scram-sha-256 authentication across the docker network.
echo "# Replication access for standby standby containers" >> "$PGDATA/pg_hba.conf"
echo "host replication replicator 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"
echo "host replication replicator 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"
echo "host all all 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"
echo "host all all 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"

echo ">> [Primary Init] pg_hba.conf updated with replication rules."

# 3. Reload PostgreSQL configuration so pg_hba.conf changes are active
pg_ctl -D "$PGDATA" reload

echo ">> [Primary Init] Configuration reloaded. Primary is ready for standby replication."

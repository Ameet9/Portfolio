#!/usr/bin/env python3
"""
PostgreSQL Replication & Failover Simulator
--------------------------------------------
Demonstrates how primary-replica replication works under failure conditions:
1. Verifies connectivity to Primary (5432) and Replica (5433).
2. Proves the Replica is initially in read-only recovery mode (`pg_is_in_recovery() == True`).
3. Executes a test write on Primary and confirms read replication on Replica.
4. Simulates Primary outage or failover scenario.
5. Demonstrates manual promotion of the Replica using `SELECT pg_promote()`.
6. Confirms the promoted Replica now accepts write transactions (`pg_is_in_recovery() == False`).
7. Explains the Split-Brain risk and how consensus engines (Patroni / etcd) prevent it.
"""

import sys
import time
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

PRIMARY_CONFIG = {
    "dbname": "postgres",
    "user": "postgres",
    "password": "postgres_password",
    "host": "localhost",
    "port": 5432,
    "connect_timeout": 3
}

REPLICA_CONFIG = {
    "dbname": "postgres",
    "user": "postgres",
    "password": "postgres_password",
    "host": "localhost",
    "port": 5433,
    "connect_timeout": 3
}


def get_connection(config):
    try:
        conn = psycopg2.connect(**config)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except Exception as exc:
        return None


def is_in_recovery(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT pg_is_in_recovery();")
        return cur.fetchone()[0]


def get_current_lsn(conn, in_recovery):
    with conn.cursor() as cur:
        if in_recovery:
            cur.execute("SELECT pg_last_wal_replay_lsn();")
        else:
            cur.execute("SELECT pg_current_wal_lsn();")
        res = cur.fetchone()
        return res[0] if res else "N/A"


def run_simulation():
    print("=" * 70)
    print(" POSTGRESQL PRIMARY-REPLICA FAILOVER SIMULATION")
    print("=" * 70)

    print("\n[Step 1] Checking cluster status...")
    p_conn = get_connection(PRIMARY_CONFIG)
    r_conn = get_connection(REPLICA_CONFIG)

    if not p_conn and not r_conn:
        print("[-] Error: Neither Primary (5432) nor Replica (5433) is running.")
        print("    Run 'docker compose up -d' in this directory first.")
        sys.exit(1)

    if p_conn:
        p_recovery = is_in_recovery(p_conn)
        p_lsn = get_current_lsn(p_conn, p_recovery)
        print(f" [+] Primary (Port 5432): CONNECTED | In Recovery (Read-Only): {p_recovery} | WAL LSN: {p_lsn}")
    else:
        print(" [-] Primary (Port 5432): UNREACHABLE (Simulated failure or stopped)")

    if r_conn:
        r_recovery = is_in_recovery(r_conn)
        r_lsn = get_current_lsn(r_conn, r_recovery)
        print(f" [+] Replica (Port 5433): CONNECTED | In Recovery (Read-Only): {r_recovery} | WAL LSN: {r_lsn}")
    else:
        print(" [-] Replica (Port 5433): UNREACHABLE")
        sys.exit(1)

    # Step 2: Write test
    if p_conn and not is_in_recovery(p_conn):
        print("\n[Step 2] Executing write to Primary...")
        with p_conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS failover_test (
                    id serial PRIMARY KEY,
                    msg text,
                    ts timestamptz DEFAULT current_timestamp
                );
            """)
            cur.execute("INSERT INTO failover_test (msg) VALUES (%s) RETURNING id;", ("Write before failover",))
            inserted_id = cur.fetchone()[0]
            print(f" [+] Primary wrote row with ID: {inserted_id}")

        print(" [+] Verifying replication to Replica...")
        time.sleep(0.3)  # Allow small WAL transmission
        with r_conn.cursor() as cur:
            cur.execute("SELECT count(*) FROM failover_test WHERE id = %s;", (inserted_id,))
            replicated = cur.fetchone()[0] > 0
            print(f" [+] Replica found row {inserted_id}: {replicated}")

    # Step 3: Replica write rejection test
    print("\n[Step 3] Attempting write directly to Replica while in Standby mode...")
    try:
        with r_conn.cursor() as cur:
            cur.execute("INSERT INTO failover_test (msg) VALUES ('Illegal replica write');")
        print(" [-] UNEXPECTED: Replica accepted a write while in recovery!")
    except psycopg2.errors.ReadOnlySqlTransaction:
        print(" [+] EXPECTED: PostgreSQL rejected write with ReadOnlySqlTransaction.")
        print("     'cannot execute INSERT in a read-only transaction'")
    except Exception as exc:
        print(f" [+] Rejected: {exc}")

    # Step 4: Promotion scenario
    print("\n[Step 4] Failover: Promoting Replica to become the new Primary...")
    if is_in_recovery(r_conn):
        print("     Issuing 'SELECT pg_promote();' on Standby (equivalent to pg_ctl promote)...")
        with r_conn.cursor() as cur:
            cur.execute("SELECT pg_promote();")
            promoted = cur.fetchone()[0]
            print(f"     Promotion command returned: {promoted}")

        time.sleep(0.5)
        new_recovery_state = is_in_recovery(r_conn)
        print(f" [+] Replica In-Recovery status after promotion: {new_recovery_state}")
        if not new_recovery_state:
            print(" [+] SUCCESS: Replica is now a READ-WRITE PRIMARY!")
            with r_conn.cursor() as cur:
                cur.execute("INSERT INTO failover_test (msg) VALUES ('First write to promoted replica') RETURNING id;")
                new_id = cur.fetchone()[0]
                print(f" [+] Promoted node successfully accepted write with ID: {new_id}!")
    else:
        print(" [+] Replica is already promoted to Primary.")

    # Step 5: Post-failover architecture summary
    print("\n" + "=" * 70)
    print(" SYSTEM DESIGN LESSONS:")
    print(" 1. Split-Brain Prevention: If the old primary recovers now, both nodes")
    print("    would accept writes, creating irreconcilable WAL timeline divergence.")
    print(" 2. Fencing / STONITH: Production systems must physically isolate or kill")
    print("    the old primary before promoting a standby.")
    print(" 3. Consensus Orchestrators: Tools like Patroni + etcd or AWS Multi-AZ RDS")
    print("    automate this health detection, promotion, and virtual IP rerouting.")
    print("=" * 70)


if __name__ == "__main__":
    run_simulation()

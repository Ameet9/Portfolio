"""
Replication Lag Simulator & Real-Time Observer

Demonstrates and measures asynchronous replication lag between PostgreSQL Primary
and Hot Standby Replica under high-frequency write workloads.

Mechanics:
1. Writes 1,000 records in configurable batches to the Primary (Port 5432).
2. Concurrently or immediately polls the Standby Replica (Port 5433) using `SELECT count(*)`.
3. Measures:
   - Row count disparity (Primary count - Replica count)
   - Time (in milliseconds) required for the Replica WAL replay to achieve parity
   - WAL LSN replication distance (bytes lag)
4. Displays dynamic real-time ASCII telemetry illustrating eventual consistency.
"""

import os
import sys
import time
import argparse
import threading
from typing import Any, Dict, List, Optional, Tuple

try:
    import psycopg2
    from psycopg2 import extras
except ImportError:
    psycopg2 = None

# ANSI terminal formatting (compatible with modern terminals & Windows Terminal)
RESET = "\033[0m"
BOLD = "\033[1m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
RED = "\033[31m"
CYAN = "\033[36m"
MAGENTA = "\033[35m"
WHITE = "\033[37m"


class ReplicationLagSimulator:
    def __init__(
        self,
        primary_host: str = "localhost",
        primary_port: int = 5432,
        replica_host: str = "localhost",
        replica_port: int = 5433,
        database: str = "postgres",
        user: str = "postgres",
        password: str = "postgres_password",
        total_records: int = 1000,
        batch_size: int = 50,
        poll_interval_seconds: float = 0.01,
    ):
        self.primary_host = primary_host
        self.primary_port = primary_port
        self.replica_host = replica_host
        self.replica_port = replica_port
        self.database = database
        self.user = user
        self.password = password
        self.total_records = total_records
        self.batch_size = batch_size
        self.poll_interval = poll_interval_seconds

        self.stop_polling = False
        self.primary_target_count = 0
        self.replica_current_count = 0
        self.lag_history: List[Dict[str, float]] = []
        self.lock = threading.Lock()

    def _get_connection(self, host: str, port: int):
        """Creates a dedicated direct connection to a PostgreSQL node."""
        if psycopg2 is None:
            raise RuntimeError("psycopg2 is required. Please install psycopg2-binary.")
        return psycopg2.connect(
            host=host,
            port=port,
            dbname=self.database,
            user=self.user,
            password=self.password,
            connect_timeout=3,
        )

    def prepare_environment(self) -> int:
        """Cleans or resets benchmark table on primary and returns baseline count."""
        print(f"{CYAN}>> Connecting to Primary ({self.primary_host}:{self.primary_port})...{RESET}")
        with self._get_connection(self.primary_host, self.primary_port) as conn:
            with conn.cursor() as cur:
                # Ensure comments table exists
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS comments (
                        id SERIAL PRIMARY KEY,
                        content TEXT NOT NULL,
                        author VARCHAR(100) DEFAULT 'anonymous',
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    );
                    """
                )
                cur.execute("SELECT count(*) FROM comments;")
                baseline = cur.fetchone()[0]
                conn.commit()

        print(f"{CYAN}>> Connecting to Replica ({self.replica_host}:{self.replica_port})...{RESET}")
        with self._get_connection(self.replica_host, self.replica_port) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT count(*) FROM comments;")
                replica_baseline = cur.fetchone()[0]

        print(
            f"{GREEN}✓ Connected successfully.{RESET} Baseline Count -> Primary: {baseline}, Replica: {replica_baseline}\n"
        )
        return baseline

    def _poll_replica_worker(self, baseline: int):
        """Background thread that continuously measures Replica row count and lag."""
        try:
            conn = self._get_connection(self.replica_host, self.replica_port)
            conn.autocommit = True
            cur = conn.cursor()

            while not self.stop_polling:
                t0 = time.time()
                cur.execute("SELECT count(*) FROM comments;")
                count = cur.fetchone()[0]

                with self.lock:
                    self.replica_current_count = count - baseline
                    target = self.primary_target_count
                    lag = max(0, target - self.replica_current_count)
                    self.lag_history.append(
                        {
                            "timestamp": t0,
                            "target": target,
                            "replica": self.replica_current_count,
                            "lag": lag,
                        }
                    )

                time.sleep(self.poll_interval)
        except Exception as e:
            # If polling fails or finishes, log and exit
            pass
        finally:
            try:
                cur.close()
                conn.close()
            except Exception:
                pass

    def render_progress_bar(
        self,
        current_primary: int,
        current_replica: int,
        total: int,
        lag: int,
        elapsed_ms: float,
        width: int = 30,
    ) -> str:
        """Renders an ASCII progress bar comparing Primary progress to Replica sync."""
        pri_ratio = min(1.0, current_primary / max(1, total))
        rep_ratio = min(1.0, current_replica / max(1, total))

        pri_filled = int(width * pri_ratio)
        rep_filled = int(width * rep_ratio)

        # Build dual indicator bar:
        # Green '=' for synced replica records
        # Yellow '~' for un-replicated lag records currently in transit
        # Dark '-' for pending primary writes
        bar = []
        for i in range(width):
            if i < rep_filled:
                bar.append(f"{GREEN}#{RESET}")
            elif i < pri_filled:
                bar.append(f"{YELLOW}~{RESET}")
            else:
                bar.append(f"{WHITE}-{RESET}")

        bar_str = "".join(bar)
        status_color = GREEN if lag == 0 else (YELLOW if lag < 100 else RED)

        return (
            f"[{bar_str}] "
            f"Primary: {BOLD}{current_primary:4d}{RESET}/{total} | "
            f"Replica: {CYAN}{current_replica:4d}{RESET}/{total} | "
            f"Lag: {status_color}{BOLD}{lag:4d} rows{RESET} | "
            f"Time: {elapsed_ms:6.1f}ms"
        )

    def fetch_wal_metrics(self) -> Dict[str, Any]:
        """Queries WAL LSN positions and byte difference from Primary."""
        metrics: Dict[str, Any] = {"lag_bytes": 0, "state": "unknown"}
        try:
            with self._get_connection(self.primary_host, self.primary_port) as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT client_addr, state, sent_lsn, replay_lsn,
                               COALESCE(pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn), 0) AS lag_bytes
                        FROM pg_stat_replication
                        LIMIT 1;
                        """
                    )
                    row = cur.fetchone()
                    if row:
                        metrics["client_addr"] = row[0]
                        metrics["state"] = row[1]
                        metrics["sent_lsn"] = str(row[2])
                        metrics["replay_lsn"] = str(row[3])
                        metrics["lag_bytes"] = int(row[4])
        except Exception:
            pass
        return metrics

    def run(self):
        """Executes the high-speed write burst and lag observation lifecycle."""
        print("=" * 80)
        print(f" {BOLD}POSTGRESQL REPLICATION LAG BENCHMARK & REAL-TIME OBSERVER{RESET} ")
        print("=" * 80)
        print(f"• Total Target Records : {self.total_records}")
        print(f"• Batch Size           : {self.batch_size}")
        print(f"• Write Target         : Primary (localhost:{self.primary_port})")
        print(f"• Read Target          : Replica (localhost:{self.replica_port})")
        print(f"• Poll Frequency       : Every {self.poll_interval * 1000:.0f}ms")
        print("=" * 80 + "\n")

        baseline = self.prepare_environment()

        # Start concurrent background replica poller
        self.stop_polling = False
        poller = threading.Thread(
            target=self._poll_replica_worker, args=(baseline,), daemon=True
        )
        poller.start()

        start_time = time.time()
        pri_conn = self._get_connection(self.primary_host, self.primary_port)
        pri_cur = pri_conn.cursor()

        print(f"{BOLD}[PHASE 1] Rapidly inserting {self.total_records} records into Primary...{RESET}\n")

        peak_lag = 0
        written = 0

        # High-throughput batch insertion
        while written < self.total_records:
            batch_num = min(self.batch_size, self.total_records - written)
            data_tuples = [
                (f"Lag Benchmark Record #{written + i + 1}", "stress_tester")
                for i in range(batch_num)
            ]

            # Execute batch insert on primary
            extras.execute_values(
                pri_cur,
                "INSERT INTO comments (content, author) VALUES %s",
                data_tuples,
            )
            pri_conn.commit()
            written += batch_num

            with self.lock:
                self.primary_target_count = written
                current_rep = self.replica_current_count
                current_lag = max(0, written - current_rep)
                if current_lag > peak_lag:
                    peak_lag = current_lag

            elapsed_ms = (time.time() - start_time) * 1000
            line = self.render_progress_bar(
                current_primary=written,
                current_replica=current_rep,
                total=self.total_records,
                lag=current_lag,
                elapsed_ms=elapsed_ms,
            )
            # Overwrite line in terminal
            sys.stdout.write(f"\r{line}")
            sys.stdout.flush()

        write_finish_time = time.time()
        write_duration_ms = (write_finish_time - start_time) * 1000

        print(f"\n\n{GREEN}✓ Primary finished all {self.total_records} writes in {write_duration_ms:.2f}ms "
              f"({(self.total_records / (write_duration_ms / 1000)):.1f} writes/sec).{RESET}")
        print(f"{BOLD}[PHASE 2] Measuring Standby Replica catch-up latency...{RESET}\n")

        # Phase 2: Wait until replica reaches full parity
        while True:
            with self.lock:
                current_rep = self.replica_current_count
                current_lag = max(0, self.total_records - current_rep)
                if current_lag > peak_lag:
                    peak_lag = current_lag

            elapsed_ms = (time.time() - start_time) * 1000
            line = self.render_progress_bar(
                current_primary=self.total_records,
                current_replica=current_rep,
                total=self.total_records,
                lag=current_lag,
                elapsed_ms=elapsed_ms,
            )
            sys.stdout.write(f"\r{line}")
            sys.stdout.flush()

            if current_rep >= self.total_records:
                break
            time.sleep(self.poll_interval)

        total_sync_time = time.time()
        catchup_duration_ms = (total_sync_time - write_finish_time) * 1000
        total_duration_ms = (total_sync_time - start_time) * 1000

        self.stop_polling = True
        pri_cur.close()
        pri_conn.close()

        wal_stats = self.fetch_wal_metrics()

        # Display Final Summary Report
        print("\n\n" + "=" * 80)
        print(f" {BOLD}REPLICATION LAG BENCHMARK REPORT{RESET}")
        print("=" * 80)
        print(f"• Total Records Processed      : {BOLD}{self.total_records}{RESET}")
        print(f"• Primary Write Time           : {write_duration_ms:.2f} ms")
        print(f"• Replica Catch-Up Latency     : {BOLD}{catchup_duration_ms:.2f} ms{RESET}")
        print(f"• Total End-to-End Sync Time   : {total_duration_ms:.2f} ms")
        print(f"• Peak Row Count Disparity     : {BOLD}{YELLOW}{peak_lag} rows{RESET}")
        print(f"• Replication Stream State     : {wal_stats.get('state', 'streaming')}")
        print(f"• Final WAL Replication Lag    : {wal_stats.get('lag_bytes', 0)} bytes")
        print("=" * 80)

        print(f"\n{BOLD}System Design Insights:{RESET}")
        print("1. Asynchronous replication returns SUCCESS to the client immediately after Primary")
        print("   WAL flush, without waiting for the Standby Replica to receive or replay the WAL.")
        print(f"2. During the {catchup_duration_ms:.1f}ms catch-up window, a client reading from the Replica")
        print("   would experience stale reads (Eventual Consistency anomaly).")
        print("3. In `query_router.py`, the Read-Your-Own-Writes mechanism routes recently active sessions")
        print("   to the Primary during this window, eliminating user-facing stale reads!\n")


def main():
    parser = argparse.ArgumentParser(
        description="PostgreSQL Primary-Replica Replication Lag Simulator"
    )
    parser.add_argument("--records", type=int, default=1000, help="Total records to insert (default: 1000)")
    parser.add_argument("--batch-size", type=int, default=50, help="Batch size for inserts (default: 50)")
    parser.add_argument("--primary-port", type=int, default=5432, help="Primary port (default: 5432)")
    parser.add_argument("--replica-port", type=int, default=5433, help="Replica port (default: 5433)")
    parser.add_argument("--poll-interval", type=float, default=0.01, help="Polling interval in seconds (default: 0.01)")

    args = parser.parse_args()

    simulator = ReplicationLagSimulator(
        primary_port=args.primary_port,
        replica_port=args.replica_port,
        total_records=args.records,
        batch_size=args.batch_size,
        poll_interval_seconds=args.poll_interval,
    )

    try:
        simulator.run()
    except KeyboardInterrupt:
        print("\nBenchmark cancelled by user.")
    except Exception as e:
        print(f"\n{RED}Error running benchmark: {e}{RESET}")
        print(f"\n{YELLOW}Make sure Docker containers are running:{RESET}")
        print("  docker compose up -d")


if __name__ == "__main__":
    main()

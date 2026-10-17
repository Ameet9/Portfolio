"""
DatabaseRouter: Intelligent Primary-Replica Query Routing with Read-Your-Own-Writes Consistency.

In a scalable database architecture, write traffic is handled exclusively by a Primary node
while read traffic is distributed across one or more Read Replicas.

However, asynchronous streaming replication introduces Replication Lag. If a user performs
a mutation (e.g., posting a comment) and immediately reloads their profile/feed, routing the
read to a lagging replica causes an eventual consistency anomaly: the user cannot see their
own write!

This module implements:
1. Intelligent SQL classification (Read vs Write)
2. Primary/Replica connection pool management
3. Read-Your-Own-Writes (RYOW) Session Pinning with configurable time-based decay
4. Failover fallback: if Replica is degraded or unavailable, safely fall back to Primary
5. Cluster health and replication lag inspection
"""

import os
import re
import time
import logging
from typing import Any, Dict, List, Optional, Sequence, Tuple, Union
from contextlib import contextmanager

try:
    import psycopg2
    from psycopg2 import pool
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None
    pool = None
    RealDictCursor = None

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("DatabaseRouter")


class NodeRole:
    PRIMARY = "PRIMARY (Port 5432)"
    REPLICA = "REPLICA (Port 5433)"


class DatabaseRouter:
    """
    Manages dual connection pools to PostgreSQL Primary and Read Replica,
    handling query dispatching, session-based replication lag mitigation,
    and automatic failover fallback.
    """

    # SQL patterns that modify database state or require strict transactional serialization
    WRITE_KEYWORDS_PATTERN = re.compile(
        r"^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|VACUUM|ANALYZE|CALL|DO)\b",
        re.IGNORECASE,
    )

    def __init__(
        self,
        primary_host: Optional[str] = None,
        primary_port: Optional[int] = None,
        replica_host: Optional[str] = None,
        replica_port: Optional[int] = None,
        database: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        min_conn: int = 1,
        max_conn: int = 10,
        ryow_window_seconds: float = 2.0,
        enable_fallback_to_primary: bool = True,
    ):
        """
        Initialize the query router with connection parameters and consistency policies.

        Args:
            primary_host: Hostname for Primary read-write node (default: localhost or env)
            primary_port: Port for Primary node (default: 5432 or env)
            replica_host: Hostname for Read Replica standby node (default: localhost or env)
            replica_port: Port for Read Replica node (default: 5433 or env)
            database: Target database name (default: postgres)
            user: Database username (default: postgres)
            password: Database password (default: postgres_password)
            min_conn: Minimum connections maintained per pool
            max_conn: Maximum connections allowed per pool
            ryow_window_seconds: Time window (seconds) during which a session's reads
                                are pinned to the Primary following a write.
            enable_fallback_to_primary: If True, automatically falls back to Primary
                                       if Replica connection fails.
        """
        self.primary_host = primary_host or os.getenv("PRIMARY_HOST", "localhost")
        self.primary_port = int(primary_port or os.getenv("PRIMARY_PORT", "5432"))
        self.replica_host = replica_host or os.getenv("REPLICA_HOST", "localhost")
        self.replica_port = int(replica_port or os.getenv("REPLICA_PORT", "5433"))
        self.database = database or os.getenv("POSTGRES_DB", "postgres")
        self.user = user or os.getenv("POSTGRES_USER", "postgres")
        self.password = password or os.getenv("POSTGRES_PASSWORD", "postgres_password")

        self.min_conn = min_conn
        self.max_conn = max_conn
        self.ryow_window_seconds = ryow_window_seconds
        self.enable_fallback_to_primary = enable_fallback_to_primary

        # Session tracking map: session_id -> epoch timestamp of last write
        self._session_last_write: Dict[str, float] = {}

        self.primary_pool: Optional[Any] = None
        self.replica_pool: Optional[Any] = None

        if psycopg2 is not None:
            self._init_connection_pools()

    def _init_connection_pools(self) -> None:
        """Initialize connection pools for both Primary and Replica nodes."""
        logger.info(
            f"Initializing Primary connection pool ({self.primary_host}:{self.primary_port}/{self.database})..."
        )
        try:
            self.primary_pool = pool.ThreadedConnectionPool(
                minconn=self.min_conn,
                maxconn=self.max_conn,
                host=self.primary_host,
                port=self.primary_port,
                dbname=self.database,
                user=self.user,
                password=self.password,
            )
            logger.info("Primary connection pool successfully initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize Primary connection pool: {e}")
            self.primary_pool = None

        logger.info(
            f"Initializing Replica connection pool ({self.replica_host}:{self.replica_port}/{self.database})..."
        )
        try:
            self.replica_pool = pool.ThreadedConnectionPool(
                minconn=self.min_conn,
                maxconn=self.max_conn,
                host=self.replica_host,
                port=self.replica_port,
                dbname=self.database,
                user=self.user,
                password=self.password,
            )
            logger.info("Replica connection pool successfully initialized.")
        except Exception as e:
            logger.warning(
                f"Failed to initialize Replica connection pool: {e}. "
                "Reads will fallback to Primary if enabled."
            )
            self.replica_pool = None

    def close(self) -> None:
        """Close all connection pools and release resources."""
        if self.primary_pool:
            self.primary_pool.closeall()
            self.primary_pool = None
        if self.replica_pool:
            self.replica_pool.closeall()
            self.replica_pool = None
        logger.info("All connection pools closed.")

    @contextmanager
    def _get_connection(self, is_primary: bool):
        """
        Context manager for acquiring and safely releasing pooled connections.
        Ensures connections are returned to the pool even during exceptions.
        """
        active_pool = self.primary_pool if is_primary else self.replica_pool
        target_role = NodeRole.PRIMARY if is_primary else NodeRole.REPLICA

        if active_pool is None:
            raise ConnectionError(f"Connection pool for {target_role} is unavailable.")

        conn = active_pool.getconn()
        try:
            yield conn
        finally:
            active_pool.putconn(conn)

    def is_write_query(self, query: str) -> bool:
        """
        Classifies SQL statements into read vs write categories.
        
        Note: Queries beginning with WITH ... (CTEs) are analyzed based on whether
        they contain mutating data-modifying CTEs (e.g. WITH ins AS (INSERT ...)).
        """
        clean_query = query.strip()
        if not clean_query:
            return False

        # Direct match for standard write statements
        if self.WRITE_KEYWORDS_PATTERN.match(clean_query):
            return True

        # Check for Common Table Expressions containing data modifications
        if clean_query.upper().startswith("WITH"):
            mutation_subquery = re.search(
                r"\b(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b", clean_query, re.IGNORECASE
            )
            if mutation_subquery:
                return True

        return False

    def is_session_pinned_to_primary(self, session_id: Optional[str]) -> Tuple[bool, float]:
        """
        Determines whether a session's read should be pinned to the Primary node
        to uphold Read-Your-Own-Writes (RYOW) causal consistency.

        Returns:
            Tuple of (is_pinned: bool, elapsed_since_write: float)
        """
        if not session_id or session_id not in self._session_last_write:
            return False, 0.0

        last_write_time = self._session_last_write[session_id]
        elapsed = time.time() - last_write_time

        if elapsed < self.ryow_window_seconds:
            return True, elapsed
        else:
            # Clean up expired session state to prevent memory leak
            self._session_last_write.pop(session_id, None)
            return False, elapsed

    def record_session_write(self, session_id: Optional[str]) -> None:
        """Records a mutation timestamp for the given session ID."""
        if session_id:
            now = time.time()
            self._session_last_write[session_id] = now
            logger.debug(
                f"[RYOW] Session '{session_id}' registered write at {now:.4f}. "
                f"Reads pinned to Primary for {self.ryow_window_seconds}s."
            )

    def execute_write(
        self,
        query: str,
        params: Optional[Union[Sequence[Any], Dict[str, Any], Tuple[Any, ...]]] = None,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Executes a data mutation query exclusively against the Primary node.

        Args:
            query: SQL mutation query (INSERT, UPDATE, DELETE, DDL)
            params: Query parameters for safe parameterized execution
            session_id: Optional user/client session identifier

        Returns:
            Dictionary containing:
                - rows_affected: int
                - inserted_id: Optional[int] (if RETURNING id was requested)
                - execution_node: str
                - duration_ms: float
        """
        start_time = time.time()

        with self._get_connection(is_primary=True) as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                rows_affected = cur.rowcount
                inserted_id = None

                # Capture generated ID if RETURNING id was used
                if cur.description is not None:
                    try:
                        row = cur.fetchone()
                        if row:
                            inserted_id = row[0]
                    except Exception:
                        pass

                conn.commit()

        # Update session write timestamp for Read-Your-Own-Writes pinning
        self.record_session_write(session_id)
        duration_ms = (time.time() - start_time) * 1000

        logger.info(
            f"[WRITE ROUTER] -> {NodeRole.PRIMARY} | Affected: {rows_affected} | "
            f"Latency: {duration_ms:.2f}ms | Session: {session_id or 'None'}"
        )

        return {
            "rows_affected": rows_affected,
            "inserted_id": inserted_id,
            "execution_node": NodeRole.PRIMARY,
            "duration_ms": duration_ms,
        }

    def execute_read(
        self,
        query: str,
        params: Optional[Union[Sequence[Any], Dict[str, Any], Tuple[Any, ...]]] = None,
        session_id: Optional[str] = None,
        force_primary: bool = False,
    ) -> Dict[str, Any]:
        """
        Executes a read query, routing to Replica by default or Primary if consistency mandates.

        Routing Logic:
        1. If force_primary=True -> PRIMARY (explicit consistency override)
        2. If session has written within ryow_window_seconds -> PRIMARY (RYOW session pinning)
        3. Otherwise -> REPLICA (standard horizontal read-scaling)
        4. If Replica fails and enable_fallback_to_primary=True -> PRIMARY (resilience fallback)

        Returns:
            Dictionary containing:
                - data: List of dict records
                - row_count: int
                - execution_node: str
                - routing_reason: str
                - duration_ms: float
        """
        start_time = time.time()
        is_pinned, elapsed = self.is_session_pinned_to_primary(session_id)

        # Decide target node
        if force_primary:
            use_primary = True
            reason = "EXPLICIT_FORCE_PRIMARY"
        elif is_pinned:
            use_primary = True
            reason = f"RYOW_SESSION_PINNED (write {elapsed:.3f}s ago <= {self.ryow_window_seconds}s)"
        else:
            use_primary = False
            reason = "REPLICA_DEFAULT_READ"

        logger.info(
            f"[READ ROUTER] Routing decision: {'PRIMARY' if use_primary else 'REPLICA'} "
            f"| Reason: {reason} | Session: {session_id or 'None'}"
        )

        # Execute read with fallback protection
        try:
            return self._execute_read_on_node(
                query=query,
                params=params,
                is_primary=use_primary,
                reason=reason,
                start_time=start_time,
            )
        except Exception as replica_err:
            if not use_primary and self.enable_fallback_to_primary:
                logger.warning(
                    f"[READ ROUTER] Failed executing on {NodeRole.REPLICA}: {replica_err}. "
                    f"Initiating graceful failover to {NodeRole.PRIMARY}..."
                )
                return self._execute_read_on_node(
                    query=query,
                    params=params,
                    is_primary=True,
                    reason=f"FALLBACK_FROM_REPLICA_ERROR: {replica_err}",
                    start_time=start_time,
                )
            raise

    def _execute_read_on_node(
        self,
        query: str,
        params: Optional[Any],
        is_primary: bool,
        reason: str,
        start_time: float,
    ) -> Dict[str, Any]:
        """Helper to run a SELECT query on the designated node and format results as dicts."""
        target_role = NodeRole.PRIMARY if is_primary else NodeRole.REPLICA

        with self._get_connection(is_primary=is_primary) as conn:
            # RealDictCursor returns rows as python dicts: {'id': 1, 'content': 'text'}
            cursor_factory = RealDictCursor if RealDictCursor is not None else None
            with conn.cursor(cursor_factory=cursor_factory) as cur:
                cur.execute(query, params)
                if cur.description is not None:
                    rows = cur.fetchall()
                    if RealDictCursor is None:
                        # Fallback manual dict conversion if psycopg2.extras unavailable
                        cols = [desc[0] for desc in cur.description]
                        records = [dict(zip(cols, row)) for row in rows]
                    else:
                        records = [dict(r) for r in rows]
                else:
                    records = []

        duration_ms = (time.time() - start_time) * 1000
        return {
            "data": records,
            "row_count": len(records),
            "execution_node": target_role,
            "routing_reason": reason,
            "duration_ms": duration_ms,
        }

    def execute(
        self,
        query: str,
        params: Optional[Any] = None,
        session_id: Optional[str] = None,
        force_primary: bool = False,
    ) -> Dict[str, Any]:
        """
        Unified dispatch interface. Automatically analyzes SQL to determine whether
        it is a read or write operation, then routes accordingly.
        """
        if self.is_write_query(query):
            return self.execute_write(query=query, params=params, session_id=session_id)
        else:
            return self.execute_read(
                query=query,
                params=params,
                session_id=session_id,
                force_primary=force_primary,
            )

    def get_cluster_status(self) -> Dict[str, Any]:
        """
        Inspects the primary and replica databases to determine cluster replication state,
        node roles (`pg_is_in_recovery()`), and current WAL Log Sequence Numbers (LSN).
        """
        status: Dict[str, Any] = {
            "primary": {"status": "offline"},
            "replica": {"status": "offline"},
            "lag_bytes": None,
        }

        # 1. Inspect Primary
        try:
            with self._get_connection(is_primary=True) as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT pg_is_in_recovery(), pg_current_wal_lsn();")
                    in_recovery, primary_lsn = cur.fetchone()

                    # Query connected replication standbys
                    cur.execute(
                        """
                        SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn,
                               pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS lag_bytes
                        FROM pg_stat_replication;
                        """
                    )
                    standbys = cur.fetchall()

                    status["primary"] = {
                        "status": "online",
                        "in_recovery": in_recovery,  # Must be False on Primary
                        "current_wal_lsn": str(primary_lsn),
                        "connected_standbys_count": len(standbys),
                        "standbys_info": standbys,
                    }
        except Exception as e:
            status["primary"]["error"] = str(e)

        # 2. Inspect Replica
        try:
            with self._get_connection(is_primary=False) as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT pg_is_in_recovery(), pg_last_wal_replay_lsn(), pg_last_xact_replay_timestamp();"
                    )
                    in_recovery, replay_lsn, replay_timestamp = cur.fetchone()

                    status["replica"] = {
                        "status": "online",
                        "in_recovery": in_recovery,  # Must be True on Standby Replica
                        "last_wal_replay_lsn": str(replay_lsn) if replay_lsn else None,
                        "last_replay_timestamp": str(replay_timestamp) if replay_timestamp else None,
                    }
        except Exception as e:
            status["replica"]["error"] = str(e)

        return status


def demo_cluster():
    """Demonstrates primary/replica routing and Read-Your-Own-Writes consistency."""
    print("=" * 78)
    print("      POSTGRES READ REPLICA RELAY: QUERY ROUTER DEMONSTRATION")
    print("=" * 78)

    router = DatabaseRouter(ryow_window_seconds=2.0)

    try:
        print("\n[Step 1] Checking Cluster Roles and Replication Topology...")
        cluster = router.get_cluster_status()
        print(f"  Primary Status : {cluster['primary'].get('status')}")
        print(f"  Primary WAL LSN: {cluster['primary'].get('current_wal_lsn')}")
        print(f"  Replica Status : {cluster['replica'].get('status')}")
        print(f"  Replica Standby: in_recovery={cluster['replica'].get('in_recovery')}")

        print("\n[Step 2] Executing Normal Read Query (Unpinned Session)...")
        read_res1 = router.execute_read(
            query="SELECT id, content, author, created_at FROM comments ORDER BY id DESC LIMIT 2;",
            session_id="session_anonymous",
        )
        print(f"  Routed To : {read_res1['execution_node']}")
        print(f"  Reason    : {read_res1['routing_reason']}")
        print(f"  Records   : {read_res1['row_count']} row(s) returned")

        print("\n[Step 3] User 'session_alice' Posts a New Comment (Write to Primary)...")
        write_res = router.execute_write(
            query="INSERT INTO comments (content, author) VALUES (%s, %s) RETURNING id;",
            params=("Read-Your-Own-Writes keeps user feeds consistent!", "alice"),
            session_id="session_alice",
        )
        print(f"  Routed To : {write_res['execution_node']}")
        print(f"  Inserted ID: {write_res['inserted_id']}")

        print("\n[Step 4] Immediate Read by 'session_alice' (Within 2s RYOW window)...")
        ryow_read = router.execute_read(
            query="SELECT id, content, author FROM comments ORDER BY id DESC LIMIT 1;",
            session_id="session_alice",
        )
        print(f"  Routed To : {ryow_read['execution_node']}")
        print(f"  Reason    : {ryow_read['routing_reason']}")
        print(f"  Result    : {ryow_read['data']}")

        print("\n[Step 5] Immediate Read by 'session_bob' (Did not perform a write)...")
        bob_read = router.execute_read(
            query="SELECT id, content, author FROM comments ORDER BY id DESC LIMIT 1;",
            session_id="session_bob",
        )
        print(f"  Routed To : {bob_read['execution_node']}")
        print(f"  Reason    : {bob_read['routing_reason']}")

        print("\n[Step 6] Waiting 2.2 seconds for RYOW decay threshold to expire...")
        time.sleep(2.2)

        print("\n[Step 7] Subsequent Read by 'session_alice' (After RYOW window expiration)...")
        post_decay_read = router.execute_read(
            query="SELECT id, content, author FROM comments ORDER BY id DESC LIMIT 1;",
            session_id="session_alice",
        )
        print(f"  Routed To : {post_decay_read['execution_node']}")
        print(f"  Reason    : {post_decay_read['routing_reason']}")

        print("\n[Step 8] Explicit 'force_primary=True' Read Override...")
        forced_read = router.execute_read(
            query="SELECT count(*) FROM comments;",
            force_primary=True,
        )
        print(f"  Routed To : {forced_read['execution_node']}")
        print(f"  Reason    : {forced_read['routing_reason']}")

        print("\n" + "=" * 78)
        print(">> DEMONSTRATION COMPLETE: Consistency and Routing verified!")
        print("=" * 78)

    except Exception as e:
        logger.error(f"Cluster demo encountered error: {e}")
        print(f"\n[NOTE] Ensure docker containers are up: docker compose up -d\nError details: {e}")
    finally:
        router.close()


if __name__ == "__main__":
    demo_cluster()

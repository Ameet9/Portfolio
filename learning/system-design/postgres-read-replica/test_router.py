"""
Unit and Integration Tests for DatabaseRouter and Consistency Policies.

Tests verify:
1. SQL statement classification (Read vs Write vs CTE mutations)
2. Read-Your-Own-Writes (RYOW) session tracking and decay windows
3. Primary vs Replica connection routing
4. Explicit `force_primary` overrides
5. Graceful fallback to Primary upon Replica outage
"""

import time
import unittest
from unittest.mock import MagicMock, patch

from query_router import DatabaseRouter, NodeRole


class TestDatabaseRouterQueryClassification(unittest.TestCase):
    """Tests SQL parser logic to ensure correct classification of queries."""

    def setUp(self):
        # Initialize without initializing real psycopg2 pools
        self.router = DatabaseRouter(
            ryow_window_seconds=1.0,
            enable_fallback_to_primary=True,
        )

    def test_read_query_classification(self):
        read_queries = [
            "SELECT * FROM comments;",
            "select id, content from users where id = 1;",
            "  SELECT COUNT(*) FROM comments WHERE created_at > NOW();",
            "WITH recent AS (SELECT id, content FROM comments LIMIT 10) SELECT * FROM recent;",
        ]
        for q in read_queries:
            with self.subTest(query=q):
                self.assertFalse(
                    self.router.is_write_query(q),
                    f"Expected query to be classified as READ: {q}",
                )

    def test_write_query_classification(self):
        write_queries = [
            "INSERT INTO comments (content) VALUES ('hello');",
            "insert into users (username) values ('john');",
            "UPDATE comments SET content = 'updated' WHERE id = 1;",
            "DELETE FROM comments WHERE id = 5;",
            "CREATE TABLE test_tbl (id INT);",
            "DROP TABLE test_tbl;",
            "ALTER TABLE comments ADD COLUMN score INT;",
            "TRUNCATE TABLE comments;",
            "GRANT SELECT ON comments TO public;",
            "WITH moved AS (INSERT INTO archive SELECT * FROM comments RETURNING *) SELECT * FROM moved;",
        ]
        for q in write_queries:
            with self.subTest(query=q):
                self.assertTrue(
                    self.router.is_write_query(q),
                    f"Expected query to be classified as WRITE: {q}",
                )


class TestReadYourOwnWritesConsistency(unittest.TestCase):
    """Tests the session pinning mechanism that prevents stale reads following a write."""

    def setUp(self):
        self.router = DatabaseRouter(ryow_window_seconds=0.5)

    def test_unregistered_session_is_not_pinned(self):
        is_pinned, elapsed = self.router.is_session_pinned_to_primary("unseen_session")
        self.assertFalse(is_pinned)
        self.assertEqual(elapsed, 0.0)

    def test_none_session_is_not_pinned(self):
        is_pinned, elapsed = self.router.is_session_pinned_to_primary(None)
        self.assertFalse(is_pinned)

    def test_session_pinned_immediately_after_write(self):
        session_id = "user_42"
        self.router.record_session_write(session_id)

        is_pinned, elapsed = self.router.is_session_pinned_to_primary(session_id)
        self.assertTrue(is_pinned)
        self.assertLess(elapsed, 0.5)

    def test_session_unpinned_after_window_expires(self):
        session_id = "user_42"
        self.router.record_session_write(session_id)

        # Wait past the 0.5s window
        time.sleep(0.55)

        is_pinned, elapsed = self.router.is_session_pinned_to_primary(session_id)
        self.assertFalse(is_pinned)
        self.assertGreaterEqual(elapsed, 0.5)

        # Verify expired session was purged from memory
        self.assertNotIn(session_id, self.router._session_last_write)

    def test_multi_session_isolation(self):
        """Writing on session A must NOT pin session B."""
        sess_a = "user_alice"
        sess_b = "user_bob"

        self.router.record_session_write(sess_a)

        pinned_a, _ = self.router.is_session_pinned_to_primary(sess_a)
        pinned_b, _ = self.router.is_session_pinned_to_primary(sess_b)

        self.assertTrue(pinned_a, "Session A should be pinned to Primary")
        self.assertFalse(pinned_b, "Session B should route to Replica")


class TestRoutingExecutionWithMocks(unittest.TestCase):
    """Tests the query execution path using mocked connection pools."""

    def setUp(self):
        self.router = DatabaseRouter(
            ryow_window_seconds=1.0,
            enable_fallback_to_primary=True,
        )

        # Mock primary connection & cursor
        self.mock_primary_pool = MagicMock()
        self.mock_primary_conn = MagicMock()
        self.mock_primary_cursor = MagicMock()
        self.mock_primary_pool.getconn.return_value = self.mock_primary_conn
        self.mock_primary_conn.cursor.return_value.__enter__.return_value = (
            self.mock_primary_cursor
        )

        # Mock replica connection & cursor
        self.mock_replica_pool = MagicMock()
        self.mock_replica_conn = MagicMock()
        self.mock_replica_cursor = MagicMock()
        self.mock_replica_pool.getconn.return_value = self.mock_replica_conn
        self.mock_replica_conn.cursor.return_value.__enter__.return_value = (
            self.mock_replica_cursor
        )

        self.router.primary_pool = self.mock_primary_pool
        self.router.replica_pool = self.mock_replica_pool

    def test_execute_write_hits_primary(self):
        self.mock_primary_cursor.rowcount = 1
        self.mock_primary_cursor.description = [("id",)]
        self.mock_primary_cursor.fetchone.return_value = (101,)

        result = self.router.execute_write(
            query="INSERT INTO comments (content) VALUES (%s) RETURNING id;",
            params=("Test comment",),
            session_id="sess_write",
        )

        self.assertEqual(result["execution_node"], NodeRole.PRIMARY)
        self.assertEqual(result["rows_affected"], 1)
        self.assertEqual(result["inserted_id"], 101)
        self.mock_primary_conn.commit.assert_called_once()
        self.mock_primary_pool.putconn.assert_called_once_with(self.mock_primary_conn)

        # Ensure session was recorded for RYOW
        pinned, _ = self.router.is_session_pinned_to_primary("sess_write")
        self.assertTrue(pinned)

    def test_execute_read_unpinned_hits_replica(self):
        self.mock_replica_cursor.description = [("id",), ("content",)]
        self.mock_replica_cursor.fetchall.return_value = [{"id": 1, "content": "read"}]

        result = self.router.execute_read(
            query="SELECT id, content FROM comments;",
            session_id="unpinned_user",
        )

        self.assertEqual(result["execution_node"], NodeRole.REPLICA)
        self.assertEqual(result["routing_reason"], "REPLICA_DEFAULT_READ")
        self.mock_replica_pool.getconn.assert_called_once()
        self.mock_replica_pool.putconn.assert_called_once_with(self.mock_replica_conn)

    def test_execute_read_pinned_session_hits_primary(self):
        session_id = "recent_writer"
        self.router.record_session_write(session_id)

        self.mock_primary_cursor.description = [("id",), ("content",)]
        self.mock_primary_cursor.fetchall.return_value = [
            {"id": 1, "content": "fresh data"}
        ]

        result = self.router.execute_read(
            query="SELECT id, content FROM comments;",
            session_id=session_id,
        )

        self.assertEqual(result["execution_node"], NodeRole.PRIMARY)
        self.assertIn("RYOW_SESSION_PINNED", result["routing_reason"])
        self.mock_primary_pool.getconn.assert_called_once()

    def test_execute_read_force_primary_hits_primary(self):
        self.mock_primary_cursor.description = [("cnt",)]
        self.mock_primary_cursor.fetchall.return_value = [{"cnt": 42}]

        result = self.router.execute_read(
            query="SELECT count(*) FROM comments;",
            force_primary=True,
        )

        self.assertEqual(result["execution_node"], NodeRole.PRIMARY)
        self.assertEqual(result["routing_reason"], "EXPLICIT_FORCE_PRIMARY")
        self.mock_primary_pool.getconn.assert_called_once()

    def test_replica_failure_triggers_fallback_to_primary(self):
        # Configure replica to fail
        self.mock_replica_pool.getconn.side_effect = ConnectionError(
            "Replica network unreachable"
        )

        # Primary succeeds
        self.mock_primary_cursor.description = [("id",)]
        self.mock_primary_cursor.fetchall.return_value = [{"id": 1}]

        result = self.router.execute_read(
            query="SELECT id FROM comments;",
            session_id=None,
        )

        self.assertEqual(result["execution_node"], NodeRole.PRIMARY)
        self.assertIn("FALLBACK_FROM_REPLICA_ERROR", result["routing_reason"])
        self.mock_primary_pool.getconn.assert_called_once()

    def test_execute_auto_dispatch(self):
        # Auto dispatch write query
        self.mock_primary_cursor.rowcount = 1
        self.mock_primary_cursor.description = None

        write_res = self.router.execute(
            query="UPDATE comments SET content = 'new' WHERE id = 1;",
        )
        self.assertEqual(write_res["execution_node"], NodeRole.PRIMARY)

        # Auto dispatch read query
        self.mock_replica_cursor.description = [("id",)]
        self.mock_replica_cursor.fetchall.return_value = [{"id": 1}]

        read_res = self.router.execute(
            query="SELECT id FROM comments;",
        )
        self.assertEqual(read_res["execution_node"], NodeRole.REPLICA)


if __name__ == "__main__":
    unittest.main()

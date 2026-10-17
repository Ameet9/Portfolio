/**
 * Core type definitions for the Optimistic Comments Feed.
 *
 * Optimistic UI requires explicit tracking of an entity's lifecycle state:
 * - 'pending': Instantly injected into the UI before server confirmation.
 * - 'confirmed': Successfully persisted in the persistent datastore / API.
 * - 'failed': Server rejected the mutation; retained locally with an error so the user can retry.
 * - 'deleting': Marked for deletion while server mutation is in-flight.
 */

export type CommentStatus = 'confirmed' | 'pending' | 'failed' | 'deleting';

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  status: CommentStatus;
  error?: string;
}

/**
 * Optimistic actions dispatched to React 19's useOptimistic reducer.
 * Using a discriminated union allows handling multiple types of mutations
 * (insertions, deletions, retries) within a single coordinated optimistic view.
 */
export type OptimisticAction =
  | { type: 'add'; comment: Comment }
  | { type: 'delete'; id: string }
  | { type: 'retry'; id: string }
  | { type: 'mark_failed'; id: string; error: string };

/**
 * Configuration options for the simulated backend API.
 * Allows interactive experimentation with different network latency and failure rates.
 */
export interface ApiSimulationConfig {
  latencyMs: number;
  failureRate: number; // e.g., 0.3 for 30% failure rate
  simulateOffline: boolean;
}

/**
 * Toast notification model for informing the user about background mutation results.
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: number;
}

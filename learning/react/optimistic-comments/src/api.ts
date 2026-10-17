import { Comment, ApiSimulationConfig } from './types';

/**
 * Global mock configuration for network simulation.
 * By default:
 * - latencyMs: 800ms (typical 3G/4G or cross-region roundtrip)
 * - failureRate: 0.3 (30% failure to demonstrate rollbacks and retry states)
 */
let simulationConfig: ApiSimulationConfig = {
  latencyMs: 800,
  failureRate: 0.3,
  simulateOffline: false,
};

/**
 * Update the simulation configuration dynamically from UI controls.
 */
export function updateSimulationConfig(newConfig: Partial<ApiSimulationConfig>): void {
  simulationConfig = { ...simulationConfig, ...newConfig };
}

/**
 * Retrieve current simulation configuration.
 */
export function getSimulationConfig(): ApiSimulationConfig {
  return { ...simulationConfig };
}

/**
 * Helper to simulate asynchronous network latency with variable jitter.
 * Adding jitter (e.g. +/- 15%) makes network simulation behave like real-world HTTP traffic.
 */
const sleep = (baseMs: number): Promise<void> => {
  const jitter = (Math.random() - 0.5) * 0.3 * baseMs;
  const total = Math.max(100, Math.round(baseMs + jitter));
  return new Promise((resolve) => setTimeout(resolve, total));
};

/**
 * In-memory server database initialized with sample seed comments.
 */
let serverDatabase: Comment[] = [
  {
    id: 'srv-101',
    author: 'Sarah Chen',
    text: 'React 19 useOptimistic makes UI feel instantaneous! No more awkward loading spinners for standard user feedback.',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    status: 'confirmed',
  },
  {
    id: 'srv-102',
    author: 'Alex Rivera',
    text: 'Crucial thing to remember: optimistic UI is an illusion of speed. You MUST design compensating workflows when the network fails.',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    status: 'confirmed',
  },
  {
    id: 'srv-103',
    author: 'Elena Rostova',
    text: 'Notice how useOptimistic automatically reverts state when the transition finishes if you don\'t commit the mutation to actual state.',
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 mins ago
    status: 'confirmed',
  },
];

/**
 * Fetches the initial list of comments from the mock server.
 */
export async function fetchComments(): Promise<Comment[]> {
  await sleep(400);

  if (simulationConfig.simulateOffline) {
    throw new Error('Offline: Unable to contact comments server');
  }

  // Return a cloned copy to prevent external direct mutations
  return serverDatabase.map((comment) => ({ ...comment }));
}

/**
 * Posts a new comment to the server.
 *
 * Why this simulation matches real-world microservices:
 * - Network latency: Represents TCP handshake, TLS negotiation, and DB write.
 * - Random failure (~30%): Simulates sporadic packet loss, DB lock contention, or 503 service unavailable.
 * - Server ID generation: Real backends assign canonical UUIDs/auto-increment IDs that replace the client's temporary ID.
 */
export async function postComment(text: string, author: string): Promise<Comment> {
  await sleep(simulationConfig.latencyMs);

  if (simulationConfig.simulateOffline) {
    throw new Error('Network error: Device is offline');
  }

  // Simulate sporadic network / server error (default 30% failure rate)
  if (Math.random() < simulationConfig.failureRate) {
    throw new Error('Network timeout: failed to persist comment');
  }

  // Server assigns canonical timestamp and unique server-generated ID
  const savedComment: Comment = {
    id: `srv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    text: text.trim(),
    author: author.trim() || 'Anonymous Engineer',
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };

  serverDatabase.push(savedComment);
  return { ...savedComment };
}

/**
 * Deletes a comment from the server.
 *
 * Simulates real-world idempotent DELETE endpoint with potential failure.
 * If this fails, the frontend rolls back the optimistic deletion.
 */
export async function deleteComment(id: string): Promise<void> {
  await sleep(simulationConfig.latencyMs);

  if (simulationConfig.simulateOffline) {
    throw new Error('Network error: Device is offline');
  }

  if (Math.random() < simulationConfig.failureRate) {
    throw new Error('Network timeout: failed to delete comment');
  }

  const index = serverDatabase.findIndex((c) => c.id === id);
  if (index !== -1) {
    serverDatabase.splice(index, 1);
  }
}

/**
 * Reset server database back to initial seed data (useful for testing/demo).
 */
export function resetServerDatabase(): void {
  serverDatabase = [
    {
      id: 'srv-101',
      author: 'Sarah Chen',
      text: 'React 19 useOptimistic makes UI feel instantaneous! No more awkward loading spinners for standard user feedback.',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      status: 'confirmed',
    },
    {
      id: 'srv-102',
      author: 'Alex Rivera',
      text: 'Crucial thing to remember: optimistic UI is an illusion of speed. You MUST design compensating workflows when the network fails.',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      status: 'confirmed',
    },
    {
      id: 'srv-103',
      author: 'Elena Rostova',
      text: 'Notice how useOptimistic automatically reverts state when the transition finishes if you don\'t commit the mutation to actual state.',
      createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      status: 'confirmed',
    },
  ];
}

/**
 * Unit tests for Mock Backend API and Network Simulation.
 */

import {
  fetchComments,
  postComment,
  deleteComment,
  updateSimulationConfig,
  resetServerDatabase,
} from '../api';

describe('Mock Backend API & Chaos Simulation', () => {
  beforeEach(() => {
    resetServerDatabase();
    // Default config to 0% failure and low latency for fast deterministic testing
    updateSimulationConfig({
      latencyMs: 10,
      failureRate: 0,
      simulateOffline: false,
    });
  });

  it('fetchComments returns the initial seeded comments', async () => {
    const comments = await fetchComments();
    expect(comments.length).toBeGreaterThanOrEqual(3);
    expect(comments[0].status).toBe('confirmed');
    expect(comments[0].id).toContain('srv-');
  });

  it('postComment successfully appends and returns a comment with server-generated ID', async () => {
    const text = 'Testing optimistic post persistence';
    const author = 'Test Runner';

    const created = await postComment(text, author);

    expect(created.id).toMatch(/^srv-/);
    expect(created.text).toBe(text);
    expect(created.author).toBe(author);
    expect(created.status).toBe('confirmed');

    // Confirm it persists in subsequent fetch
    const current = await fetchComments();
    expect(current.some((c) => c.id === created.id)).toBe(true);
  });

  it('deleteComment removes a comment by ID', async () => {
    const comments = await fetchComments();
    const idToDelete = comments[0].id;

    await deleteComment(idToDelete);

    const afterDelete = await fetchComments();
    expect(afterDelete.some((c) => c.id === idToDelete)).toBe(false);
  });

  it('simulates network rejection when failureRate is set to 100%', async () => {
    updateSimulationConfig({ failureRate: 1.0 });

    await expect(postComment('Will fail', 'Tester')).rejects.toThrow(
      'Network timeout: failed to persist comment'
    );
  });

  it('simulates offline disconnection rejection when simulateOffline is true', async () => {
    updateSimulationConfig({ simulateOffline: true });

    await expect(fetchComments()).rejects.toThrow(
      'Offline: Unable to contact comments server'
    );
  });
});

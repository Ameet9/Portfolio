/**
 * Unit tests for the Optimistic State Reducer.
 *
 * Verifies that the reducer function passed to React 19's `useOptimistic` hook
 * behaves as a pure, deterministic state machine across all mutation lifecycles.
 */

import { Comment, OptimisticAction } from '../types';

/**
 * Pure optimistic reducer replicating the logic inside App.tsx
 */
function optimisticReducer(
  currentComments: Comment[],
  action: OptimisticAction,
  deleteMode: 'fade' | 'instant' = 'fade'
): Comment[] {
  switch (action.type) {
    case 'add':
      return [...currentComments, action.comment];

    case 'retry':
      return currentComments.map((c) =>
        c.id === action.id ? { ...c, status: 'pending', error: undefined } : c
      );

    case 'delete':
      if (deleteMode === 'instant') {
        return currentComments.filter((c) => c.id !== action.id);
      } else {
        return currentComments.map((c) =>
          c.id === action.id ? { ...c, status: 'deleting' } : c
        );
      }

    case 'mark_failed':
      return currentComments.map((c) =>
        c.id === action.id ? { ...c, status: 'failed', error: action.error } : c
      );

    default:
      return currentComments;
  }
}

describe('Optimistic Comments Reducer', () => {
  const initialComments: Comment[] = [
    {
      id: 'srv-1',
      author: 'Alice',
      text: 'First confirmed comment',
      createdAt: '2026-10-17T00:00:00.000Z',
      status: 'confirmed',
    },
    {
      id: 'srv-2',
      author: 'Bob',
      text: 'Second confirmed comment',
      createdAt: '2026-10-17T00:05:00.000Z',
      status: 'confirmed',
    },
  ];

  it('should optimistically append a pending comment without mutating original state', () => {
    const newPendingComment: Comment = {
      id: 'temp-123',
      author: 'Charlie',
      text: 'Hello from optimistic world!',
      createdAt: '2026-10-17T00:10:00.000Z',
      status: 'pending',
    };

    const nextState = optimisticReducer(initialComments, {
      type: 'add',
      comment: newPendingComment,
    });

    // Verify immutability
    expect(initialComments.length).toBe(2);
    expect(nextState.length).toBe(3);
    expect(nextState[2]).toEqual(newPendingComment);
    expect(nextState[2].status).toBe('pending');
  });

  it('should mark a comment as "deleting" in fade mode', () => {
    const nextState = optimisticReducer(
      initialComments,
      { type: 'delete', id: 'srv-1' },
      'fade'
    );

    expect(nextState.length).toBe(2);
    expect(nextState.find((c) => c.id === 'srv-1')?.status).toBe('deleting');
    expect(nextState.find((c) => c.id === 'srv-2')?.status).toBe('confirmed');
  });

  it('should immediately filter out a comment in instant deletion mode', () => {
    const nextState = optimisticReducer(
      initialComments,
      { type: 'delete', id: 'srv-1' },
      'instant'
    );

    expect(nextState.length).toBe(1);
    expect(nextState.find((c) => c.id === 'srv-1')).toBeUndefined();
    expect(nextState[0].id).toBe('srv-2');
  });

  it('should mark an in-flight comment as failed with an error reason', () => {
    const stateWithPending: Comment[] = [
      ...initialComments,
      {
        id: 'temp-999',
        author: 'Dave',
        text: 'This will fail',
        createdAt: '2026-10-17T00:15:00.000Z',
        status: 'pending',
      },
    ];

    const nextState = optimisticReducer(stateWithPending, {
      type: 'mark_failed',
      id: 'temp-999',
      error: 'Network timeout: 504 Gateway Timeout',
    });

    const failedItem = nextState.find((c) => c.id === 'temp-999');
    expect(failedItem?.status).toBe('failed');
    expect(failedItem?.error).toBe('Network timeout: 504 Gateway Timeout');
  });

  it('should transition a failed comment back to pending on retry', () => {
    const stateWithFailed: Comment[] = [
      ...initialComments,
      {
        id: 'temp-999',
        author: 'Dave',
        text: 'Failed attempt',
        createdAt: '2026-10-17T00:15:00.000Z',
        status: 'failed',
        error: 'Network timeout',
      },
    ];

    const nextState = optimisticReducer(stateWithFailed, {
      type: 'retry',
      id: 'temp-999',
    });

    const retryingItem = nextState.find((c) => c.id === 'temp-999');
    expect(retryingItem?.status).toBe('pending');
    expect(retryingItem?.error).toBeUndefined();
  });
});

import React, { useState, useTransition, useOptimistic, useEffect } from 'react';
import { Comment, OptimisticAction, ToastNotification } from './types';
import {
  fetchComments,
  postComment,
  deleteComment,
  resetServerDatabase,
} from './api';
import { Header } from './components/Header';
import { NetworkSimulatorControls } from './components/NetworkSimulatorControls';
import { CommentForm } from './components/CommentForm';
import { CommentItem } from './components/CommentItem';
import { ToastContainer } from './components/Toast';

export const App: React.FC = () => {
  // Real, confirmed state representing persistent server data + persisted failure entries
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [deleteMode, setDeleteMode] = useState<'fade' | 'instant'>('fade');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // React 19 Concurrent Transition hook for managing asynchronous mutations
  const [isPending, startTransition] = useTransition();

  /**
   * React 19 native `useOptimistic` hook.
   *
   * Coordinates UI responsiveness by immediately reflecting intent before the async
   * transition completes. If the transition fails and we don't commit to `comments`,
   * React automatically rolls back to the source of truth (`comments`).
   */
  const [optimisticComments, setOptimisticComments] = useOptimistic<Comment[], OptimisticAction>(
    comments,
    (currentComments, action) => {
      switch (action.type) {
        case 'add':
          // Instantly append the pending comment to the feed
          return [...currentComments, action.comment];

        case 'retry':
          // Re-flag a failed comment back to pending while retrying network request
          return currentComments.map((c) =>
            c.id === action.id ? { ...c, status: 'pending', error: undefined } : c
          );

        case 'delete':
          if (deleteMode === 'instant') {
            // Instant disappearance: remove comment immediately from optimistic list
            return currentComments.filter((c) => c.id !== action.id);
          } else {
            // Visual fade: retain comment but transition status to 'deleting'
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
  );

  /**
   * Toast notification helper.
   */
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastNotification = { id, type, message, timestamp: Date.now() };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Initial data fetch on mount.
   */
  const loadInitialComments = async () => {
    try {
      setIsLoadingInitial(true);
      const data = await fetchComments();
      setComments(data);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch comments';
      addToast('error', errMsg);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialComments();
  }, []);

  /**
   * Post comment handler wrapped in startTransition with optimistic UI.
   *
   * Flow:
   * 1. Create a client-side temporary Comment with status: 'pending'.
   * 2. Inside startTransition:
   *    a. Immediately dispatch optimistic addition (user sees comment instantly).
   *    b. Await postComment(text, author).
   *    c. On success: update persistent state `comments` with server-assigned ID & status 'confirmed'.
   *    d. On error: catch error, update `comments` with status 'failed' & error message.
   *       The failed comment remains visible with an inline "Failed to post — tap to retry" button.
   */
  const handlePostComment = (text: string, author: string) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const pendingComment: Comment = {
      id: tempId,
      text,
      author,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    startTransition(async () => {
      // 1. Instantly update the optimistic layer
      setOptimisticComments({ type: 'add', comment: pendingComment });

      try {
        // 2. Perform async network request
        const savedComment = await postComment(text, author);

        // 3. Commit confirmed comment to state
        setComments((prev) => [...prev, savedComment]);
        addToast('success', 'Comment posted and persisted on server!');
      } catch (err) {
        // 4. Handle failure: persist in state as 'failed' so user can retry or discard
        const errorMsg = err instanceof Error ? err.message : 'Network timeout: failed to persist comment';
        setComments((prev) => [
          ...prev,
          {
            ...pendingComment,
            status: 'failed',
            error: errorMsg,
          },
        ]);
        addToast('error', `Failed to post: ${errorMsg}`);
      }
    });
  };

  /**
   * Retry posting a previously failed comment.
   */
  const handleRetryComment = (commentToRetry: Comment) => {
    startTransition(async () => {
      // Mark as pending optimistically
      setOptimisticComments({ type: 'retry', id: commentToRetry.id });

      try {
        const savedComment = await postComment(commentToRetry.text, commentToRetry.author);
        // Replace failed comment entry with the confirmed server comment
        setComments((prev) =>
          prev.map((c) => (c.id === commentToRetry.id ? savedComment : c))
        );
        addToast('success', 'Retry succeeded: Comment posted!');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Network timeout: failed to persist comment';
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentToRetry.id
              ? { ...c, status: 'failed', error: errorMsg }
              : c
          )
        );
        addToast('error', `Retry failed: ${errorMsg}`);
      }
    });
  };

  /**
   * Discard an unposted / failed comment permanently from local state.
   */
  const handleDiscardComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    addToast('info', 'Failed comment discarded');
  };

  /**
   * Delete comment handler with optimistic deletion and automatic rollback.
   *
   * Flow:
   * 1. Inside startTransition:
   *    a. Dispatch optimistic deletion (either instantly removed or faded with "Deleting...").
   *    b. Await deleteComment(id).
   *    c. On success: remove comment from real state `comments`.
   *    d. On error: do NOT remove from `comments`. When the transition ends,
   *       useOptimistic naturally rolls back to `comments`, restoring the item!
   */
  const handleDeleteComment = (id: string) => {
    // If it's a failed comment that never reached the server, just discard it locally
    const existing = comments.find((c) => c.id === id);
    if (existing?.status === 'failed') {
      handleDiscardComment(id);
      return;
    }

    startTransition(async () => {
      // 1. Optimistic removal / fade
      setOptimisticComments({ type: 'delete', id });

      try {
        // 2. Perform backend deletion
        await deleteComment(id);

        // 3. Confirm deletion in persistent state
        setComments((prev) => prev.filter((c) => c.id !== id));
        addToast('info', 'Comment deleted from server.');
      } catch (err) {
        // 4. Server rejected deletion: By not altering `comments`, React rolls back
        // to the original state automatically when this transition completes!
        const errorMsg = err instanceof Error ? err.message : 'Network timeout: failed to delete comment';
        addToast('error', `Rollback triggered: ${errorMsg}`);
      }
    });
  };

  /**
   * Reset seed data to fresh state.
   */
  const handleResetSeed = async () => {
    resetServerDatabase();
    await loadInitialComments();
    addToast('info', 'Server database reset to default state');
  };

  // Metrics for header
  const confirmedCount = comments.filter((c) => c.status === 'confirmed').length;
  const pendingCount = optimisticComments.filter((c) => c.status === 'pending' || c.status === 'deleting').length;
  const failedCount = optimisticComments.filter((c) => c.status === 'failed').length;

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="main-wrapper">
        {/* Header & Architecture Status */}
        <Header
          isPending={isPending}
          totalComments={confirmedCount}
          pendingCount={pendingCount}
          failedCount={failedCount}
        />

        {/* Network & Chaos Simulation Controls */}
        <NetworkSimulatorControls
          onResetSeed={handleResetSeed}
          deleteMode={deleteMode}
          onToggleDeleteMode={setDeleteMode}
        />

        {/* Post Comment Input Form */}
        <section className="form-section" aria-label="Add a comment">
          <CommentForm onSubmit={handlePostComment} isPending={isPending} />
        </section>

        {/* Comments Feed List */}
        <main className="feed-section" aria-label="Comments feed">
          <div className="feed-section-header">
            <h2 className="feed-heading">
              Discussion Feed
              <span className="feed-count">({optimisticComments.length})</span>
            </h2>
            {isPending && (
              <span className="live-transition-indicator">
                <span className="pulse-dot" /> Updating UI Optimistically...
              </span>
            )}
          </div>

          {isLoadingInitial ? (
            <div className="loading-state">
              <span className="spinner-large" />
              <p>Fetching server comments...</p>
            </div>
          ) : optimisticComments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No comments yet</h3>
              <p>Be the first to post using the optimistic form above!</p>
            </div>
          ) : (
            <div className="comments-list">
              {optimisticComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onRetry={handleRetryComment}
                  onDiscard={handleDiscardComment}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

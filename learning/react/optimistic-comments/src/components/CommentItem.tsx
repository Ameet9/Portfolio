import React from 'react';
import { Comment } from '../types';

interface CommentItemProps {
  comment: Comment;
  onRetry: (comment: Comment) => void;
  onDiscard: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Format timestamp into human-readable relative string.
 */
function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 5) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

/**
 * Generate a consistent avatar hue based on the author's name string hash.
 */
function getAuthorColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [210, 150, 280, 25, 190, 330, 45];
  const hue = hues[Math.abs(hash) % hues.length];
  return `hsl(${hue}, 70%, 45%)`;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onRetry,
  onDiscard,
  onDelete,
}) => {
  const isPending = comment.status === 'pending';
  const isFailed = comment.status === 'failed';
  const isDeleting = comment.status === 'deleting';
  const isConfirmed = comment.status === 'confirmed';

  const avatarColor = getAuthorColor(comment.author);
  const initials = comment.author
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`comment-card status-${comment.status} ${isPending ? 'is-pending' : ''} ${isFailed ? 'is-failed' : ''} ${isDeleting ? 'is-deleting' : ''}`}
      data-testid={`comment-${comment.id}`}
      id={`comment-${comment.id}`}
    >
      <div className="comment-layout">
        {/* Author Avatar */}
        <div
          className="comment-avatar"
          style={{ backgroundColor: avatarColor }}
          aria-hidden="true"
        >
          {initials || '?'}
        </div>

        {/* Comment Body */}
        <div className="comment-content-area">
          <div className="comment-header-row">
            <div className="comment-meta">
              <span className="comment-author">{comment.author}</span>
              <span className="comment-timestamp">
                {isPending ? 'Sending...' : formatTimeAgo(comment.createdAt)}
              </span>
            </div>

            {/* Lifecycle Status Pill */}
            <div className="comment-status-pill">
              {isPending && (
                <span className="status-badge badge-pending">
                  <span className="spinner-mini" />
                  <span>Sending...</span>
                </span>
              )}
              {isConfirmed && (
                <span className="status-badge badge-confirmed">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Confirmed</span>
                </span>
              )}
              {isFailed && (
                <span className="status-badge badge-failed">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Failed</span>
                </span>
              )}
              {isDeleting && (
                <span className="status-badge badge-deleting">
                  <span className="spinner-mini spinner-red" />
                  <span>Deleting...</span>
                </span>
              )}
            </div>
          </div>

          {/* Comment Text */}
          <p className="comment-text">{comment.text}</p>

          {/* Error & Retry Panel for Failed Comments */}
          {isFailed && (
            <div className="comment-error-box animate-shake">
              <div className="error-message-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="error-text">
                  {comment.error || 'Network timeout: failed to persist comment'}
                </span>
              </div>

              <div className="error-actions-row">
                <button
                  type="button"
                  className="btn-retry"
                  onClick={() => onRetry(comment)}
                  title="Retry posting this comment"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  Failed to post — tap to retry
                </button>
                <button
                  type="button"
                  className="btn-discard"
                  onClick={() => onDiscard(comment.id)}
                  title="Discard this failed comment"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Footer actions for confirmed comments */}
          {isConfirmed && !isDeleting && (
            <div className="comment-footer-actions">
              <span className="comment-id-hint">ID: {comment.id}</span>
              <button
                type="button"
                className="btn-delete"
                onClick={() => onDelete(comment.id)}
                title="Delete comment (optimistic)"
                aria-label={`Delete comment by ${comment.author}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

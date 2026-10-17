import React from 'react';

interface HeaderProps {
  isPending: boolean;
  totalComments: number;
  pendingCount: number;
  failedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isPending,
  totalComments,
  pendingCount,
  failedCount,
}) => {
  return (
    <header className="feed-header">
      <div className="header-badge-row">
        <span className="badge badge-react">React 19 Native</span>
        <span className="badge badge-hook">useOptimistic + useTransition</span>
        {isPending ? (
          <span className="badge badge-pending-pulse">
            <span className="pulse-dot"></span> In-Flight Network Sync
          </span>
        ) : (
          <span className="badge badge-synced">
            <span className="status-dot-green"></span> All Changes Settled
          </span>
        )}
      </div>

      <div className="header-title-row">
        <div>
          <h1 className="feed-title">Optimistic Comments Feed</h1>
          <p className="feed-subtitle">
            Zero-latency user experience powered by React 19 concurrent transitions and automatic rollback compensation.
          </p>
        </div>
      </div>

      <div className="metrics-strip">
        <div className="metric-item">
          <span className="metric-label">Total Confirmed</span>
          <span className="metric-value">{totalComments}</span>
        </div>
        <div className="metric-divider" />
        <div className="metric-item">
          <span className="metric-label">Optimistic In-Flight</span>
          <span className={`metric-value ${pendingCount > 0 ? 'text-amber' : ''}`}>
            {pendingCount}
          </span>
        </div>
        <div className="metric-divider" />
        <div className="metric-item">
          <span className="metric-label">Compensation Required</span>
          <span className={`metric-value ${failedCount > 0 ? 'text-red' : ''}`}>
            {failedCount}
          </span>
        </div>
      </div>
    </header>
  );
};

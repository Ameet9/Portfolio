import React, { useState } from 'react';
import { ApiSimulationConfig } from '../types';
import { updateSimulationConfig, getSimulationConfig } from '../api';

interface NetworkSimulatorControlsProps {
  onResetSeed: () => void;
  deleteMode: 'fade' | 'instant';
  onToggleDeleteMode: (mode: 'fade' | 'instant') => void;
}

export const NetworkSimulatorControls: React.FC<NetworkSimulatorControlsProps> = ({
  onResetSeed,
  deleteMode,
  onToggleDeleteMode,
}) => {
  const [config, setConfig] = useState<ApiSimulationConfig>(getSimulationConfig());
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const handleFailureRateChange = (rate: number) => {
    const updated = { failureRate: rate };
    updateSimulationConfig(updated);
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleLatencyChange = (ms: number) => {
    const updated = { latencyMs: ms };
    updateSimulationConfig(updated);
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleOfflineToggle = () => {
    const updated = { simulateOffline: !config.simulateOffline };
    updateSimulationConfig(updated);
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="simulator-panel">
      <div className="simulator-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="simulator-header-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
          </svg>
          <span>Network & Chaos Controls</span>
          <span className="simulator-badge">
            {config.simulateOffline ? 'OFFLINE' : `${Math.round(config.failureRate * 100)}% Failure / ${config.latencyMs}ms`}
          </span>
        </div>
        <button
          type="button"
          className="simulator-toggle-btn"
          aria-label={isExpanded ? 'Collapse simulator controls' : 'Expand simulator controls'}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <div className="simulator-body animate-fade-in">
          {/* Failure Rate Preset Buttons */}
          <div className="control-group">
            <label className="control-label">
              Simulated Failure Rate (Chaos Injection):
            </label>
            <div className="button-group">
              <button
                type="button"
                className={`btn-pill ${config.failureRate === 0 && !config.simulateOffline ? 'active' : ''}`}
                onClick={() => handleFailureRateChange(0)}
              >
                0% (Always Succeed)
              </button>
              <button
                type="button"
                className={`btn-pill ${config.failureRate === 0.3 && !config.simulateOffline ? 'active' : ''}`}
                onClick={() => handleFailureRateChange(0.3)}
              >
                30% (Spec Default)
              </button>
              <button
                type="button"
                className={`btn-pill danger-pill ${config.failureRate === 1.0 && !config.simulateOffline ? 'active' : ''}`}
                onClick={() => handleFailureRateChange(1.0)}
              >
                100% (Guaranteed Rollback)
              </button>
            </div>
          </div>

          {/* Latency Selection */}
          <div className="control-group">
            <label className="control-label">Network Latency (RTT):</label>
            <div className="button-group">
              <button
                type="button"
                className={`btn-pill ${config.latencyMs === 300 ? 'active' : ''}`}
                onClick={() => handleLatencyChange(300)}
              >
                300ms (Fast WiFi)
              </button>
              <button
                type="button"
                className={`btn-pill ${config.latencyMs === 800 ? 'active' : ''}`}
                onClick={() => handleLatencyChange(800)}
              >
                800ms (Spec ~800ms)
              </button>
              <button
                type="button"
                className={`btn-pill ${config.latencyMs === 1800 ? 'active' : ''}`}
                onClick={() => handleLatencyChange(1800)}
              >
                1800ms (Slow 3G)
              </button>
            </div>
          </div>

          {/* Optimistic Deletion Mode & Offline Toggle */}
          <div className="control-row">
            <div className="control-group-compact">
              <label className="control-label">Optimistic Deletion Style:</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`btn-pill ${deleteMode === 'fade' ? 'active' : ''}`}
                  onClick={() => onToggleDeleteMode('fade')}
                >
                  Fade with "Deleting..."
                </button>
                <button
                  type="button"
                  className={`btn-pill ${deleteMode === 'instant' ? 'active' : ''}`}
                  onClick={() => onToggleDeleteMode('instant')}
                >
                  Instant Disappearance
                </button>
              </div>
            </div>

            <div className="control-group-actions">
              <button
                type="button"
                className={`btn-toggle-offline ${config.simulateOffline ? 'offline-active' : ''}`}
                onClick={handleOfflineToggle}
              >
                {config.simulateOffline ? '🔌 Restore Connection' : '📡 Cut Network (Offline)'}
              </button>

              <button
                type="button"
                className="btn-reset"
                onClick={onResetSeed}
                title="Reset mock database to initial seed data"
              >
                🔄 Reset Seed Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

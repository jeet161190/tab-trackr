import { useState } from 'react';
import { useTabTrackingData } from '../../hooks/use-tab-tracking-data';
import { useTrackingActions } from '../../hooks/use-tracking-actions';
import { logger } from '../../lib/logger';
import { SettingsPanel } from './_components/settings-panel';
import './app.css';

type TabSession = {
  url: string;
  domain: string;
  title: string;
  startTime: number;
  lastActive: number;
  totalTime: number;
  isActive: boolean;
};

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function getStatusText(isTrackingEnabled: boolean, currentSession: TabSession | null): string {
  if (isTrackingEnabled) {
    return currentSession ? 'Tracking' : 'Idle';
  }
  return 'Disabled';
}

function getToggleButtonText(isToggling: boolean, isTrackingEnabled: boolean): string {
  if (isToggling) {
    return '...';
  }
  return isTrackingEnabled ? 'ON' : 'OFF';
}

function getTopDomains(domains: Record<string, number>, limit = 5) {
  return Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain, time]) => ({ domain, time }));
}

function getCurrentSessionTime(currentSession: TabSession | null): number {
  if (!currentSession) {
    return 0;
  }
  const now = Date.now();
  return currentSession.totalTime + (now - currentSession.lastActive);
}

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { dailyStats, currentSession, isTrackingEnabled, syncStatus, isLoading, loadData } =
    useTabTrackingData();

  const actions = useTrackingActions({
    loadData,
    onError: setError,
  });

  if (isLoading && !dailyStats) {
    logger.debug('Rendering loading state', { component: 'PopupApp' });
    return (
      <div className="popup-container">
        <div className="header">
          <h1>TabTrackr</h1>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    logger.warn('Rendering error state', {
      component: 'PopupApp',
      errorMessage: error,
    });

    return (
      <div className="popup-container">
        <div className="header">
          <h1>TabTrackr</h1>
        </div>
        <div className="error">{error}</div>
        <button
          className="retry-btn"
          onClick={() => {
            logger.info('User clicked retry button', { component: 'PopupApp' });
            setError(null);
            loadData();
          }}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  const topDomains = dailyStats ? getTopDomains(dailyStats.domains) : [];

  logger.debug('Rendering main popup UI', {
    component: 'PopupApp',
    hasStats: !!dailyStats,
    hasSession: !!currentSession,
    topDomainsCount: topDomains.length,
    totalTime: dailyStats?.totalTime,
    isTrackingEnabled,
    showSettings,
  });

  return (
    <div className="popup-container">
      <div className="header">
        <h1>TabTrackr</h1>
        <div className="header-controls">
          <div className="status">
            <div
              className={`status-indicator ${isTrackingEnabled && currentSession ? 'active' : 'inactive'}`}
            />
            <span>{getStatusText(isTrackingEnabled, currentSession)}</span>
          </div>
          <button
            className={`toggle-btn ${isTrackingEnabled ? 'enabled' : 'disabled'}`}
            disabled={actions.isToggling}
            onClick={actions.toggleTracking}
            title={isTrackingEnabled ? 'Disable tracking' : 'Enable tracking'}
            type="button"
          >
            {getToggleButtonText(actions.isToggling, isTrackingEnabled)}
          </button>
          <button
            className="settings-btn"
            onClick={() => {
              const newShowSettings = !showSettings;
              logger.info('User toggled settings panel', {
                component: 'PopupApp',
                showSettings: newShowSettings,
              });
              setShowSettings(newShowSettings);
            }}
            title="Settings"
            type="button"
          >
            ⚙️
          </button>
        </div>
      </div>

      {showSettings && (
        <SettingsPanel
          getToggleButtonText={getToggleButtonText}
          isAuthenticating={actions.isAuthenticating}
          isSyncing={actions.isSyncing}
          isToggling={actions.isToggling}
          isTrackingEnabled={isTrackingEnabled}
          onAuthenticateGoogle={actions.authenticateGoogle}
          onClearData={actions.clearData}
          onExportData={actions.exportData}
          onForceSync={actions.forceSync}
          onSignOut={actions.signOut}
          onToggleTracking={actions.toggleTracking}
          syncStatus={syncStatus}
        />
      )}

      {currentSession && (
        <div className="current-session">
          <h3>Currently Active</h3>
          <div className="session-info">
            <div className="session-domain">{currentSession.domain}</div>
            <div className="session-time">{formatTime(getCurrentSessionTime(currentSession))}</div>
          </div>
        </div>
      )}

      <div className="daily-summary">
        <h3>Today's Summary</h3>
        <div className="total-time">
          <span className="time-label">Total Active Time:</span>
          <span className="time-value">{dailyStats ? formatTime(dailyStats.totalTime) : '0s'}</span>
        </div>

        {topDomains.length > 0 && (
          <div className="top-sites">
            <h4>Top Sites</h4>
            <div className="sites-list">
              {topDomains.map(({ domain, time }) => (
                <div className="site-item" key={domain}>
                  <div className="site-domain">{domain}</div>
                  <div className="site-time">{formatTime(time)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="footer">
        <button
          className="dashboard-btn"
          onClick={() => browser.tabs.create({ url: '/dashboard.html' })}
          type="button"
        >
          View Full Dashboard
        </button>
      </div>
    </div>
  );
}

export default App;

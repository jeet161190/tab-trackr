import { useCallback, useEffect, useState } from 'react';
import { logger } from '../../lib/logger';
import './App.css';

interface TabSession {
  url: string;
  domain: string;
  title: string;
  startTime: number;
  lastActive: number;
  totalTime: number;
  isActive: boolean;
}

interface DailyStats {
  date: string;
  domains: Record<string, number>;
  totalTime: number;
  sessions: TabSession[];
}

interface SyncStatus {
  lastSync: string | null;
  isOnline: boolean;
  pendingSessions: number;
}

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
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [currentSession, setCurrentSession] = useState<TabSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = useCallback(async () => {
    logger.debug('Loading popup data', { component: 'PopupApp' });
    logger.time('PopupApp Data Load');

    try {
      setIsLoading(true);
      setError(null);

      // Get daily stats
      logger.trace('Requesting daily stats', { component: 'PopupApp' });
      const statsResponse = (await browser.runtime.sendMessage({
        action: 'GET_DAILY_STATS',
      })) as DailyStats | null;
      setDailyStats(statsResponse);
      logger.debug('Daily stats loaded', {
        component: 'PopupApp',
        hasStats: !!statsResponse,
        totalTime: statsResponse?.totalTime,
        sessionsCount: statsResponse?.sessions.length,
        domainsCount: statsResponse ? Object.keys(statsResponse.domains).length : 0,
      });

      // Get current session
      logger.trace('Requesting current session', { component: 'PopupApp' });
      const sessionResponse = (await browser.runtime.sendMessage({
        action: 'GET_CURRENT_SESSION',
      })) as TabSession | null;
      setCurrentSession(sessionResponse);
      logger.debug('Current session loaded', {
        component: 'PopupApp',
        hasSession: !!sessionResponse,
        ...(sessionResponse?.domain && { domain: sessionResponse.domain }),
        ...(sessionResponse?.totalTime !== undefined && { sessionTime: sessionResponse.totalTime }),
        ...(sessionResponse?.isActive !== undefined && { isActive: sessionResponse.isActive }),
      });

      // Get tracking status
      logger.trace('Requesting tracking status', { component: 'PopupApp' });
      const trackingResponse = (await browser.runtime.sendMessage({
        action: 'GET_TRACKING_STATUS',
      })) as boolean;
      setIsTrackingEnabled(trackingResponse);
      logger.debug('Tracking status loaded', {
        component: 'PopupApp',
        trackingEnabled: trackingResponse,
      });

      // Get sync status
      logger.trace('Requesting sync status', { component: 'PopupApp' });
      const syncResponse = (await browser.runtime.sendMessage({
        action: 'GET_SYNC_STATUS',
      })) as SyncStatus;
      setSyncStatus(syncResponse);
      logger.debug('Sync status loaded', {
        component: 'PopupApp',
        lastSync: syncResponse.lastSync,
        isOnline: syncResponse.isOnline,
        pendingSessions: syncResponse.pendingSessions,
      });

      logger.timeEnd('PopupApp Data Load');
      logger.info('Popup data loaded successfully', {
        component: 'PopupApp',
        hasStats: !!statsResponse,
        hasSession: !!sessionResponse,
        trackingEnabled: trackingResponse,
      });
    } catch (err) {
      logger.timeEnd('PopupApp Data Load');
      logger.error('Failed to load popup data', err as Error, {
        component: 'PopupApp',
      });
      setError('Failed to load tracking data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    logger.info('Popup App initialized', {
      component: 'PopupApp',
      timestamp: Date.now(),
    });

    loadData();

    // Refresh data every 5 seconds
    logger.debug('Setting up data refresh interval', {
      component: 'PopupApp',
      intervalMs: 5000,
    });

    const interval = setInterval(() => {
      logger.trace('Auto-refreshing popup data', { component: 'PopupApp' });
      loadData();
    }, 5000);

    return () => {
      logger.debug('Cleaning up popup data refresh interval', {
        component: 'PopupApp',
      });
      clearInterval(interval);
    };
  }, [loadData]);

  const toggleTracking = useCallback(async () => {
    const currentStatus = isTrackingEnabled;
    logger.info('User toggling tracking', {
      component: 'PopupApp',
      currentStatus,
      requestedAction: currentStatus ? 'disable' : 'enable',
    });

    try {
      setIsToggling(true);
      const newStatus = (await browser.runtime.sendMessage({
        action: 'TOGGLE_TRACKING',
      })) as boolean;

      setIsTrackingEnabled(newStatus);
      logger.info('Tracking toggled successfully', {
        component: 'PopupApp',
        previousStatus: currentStatus,
        newStatus,
        changed: currentStatus !== newStatus,
      });

      // Refresh data after toggling
      await loadData();
    } catch (err) {
      logger.error('Failed to toggle tracking', err as Error, {
        component: 'PopupApp',
        attemptedAction: currentStatus ? 'disable' : 'enable',
      });
      setError('Failed to toggle tracking');
    } finally {
      setIsToggling(false);
    }
  }, [loadData, isTrackingEnabled]);

  const clearData = useCallback(async () => {
    logger.warn('User requested data clear', {
      component: 'PopupApp',
      timestamp: Date.now(),
    });

    try {
      logger.debug('Sending clear data request', { component: 'PopupApp' });
      await browser.runtime.sendMessage({ action: 'CLEAR_DATA' });

      logger.info('Data cleared successfully', { component: 'PopupApp' });
      await loadData();
    } catch (err) {
      logger.error('Failed to clear data', err as Error, { component: 'PopupApp' });
      setError('Failed to clear data');
    }
  }, [loadData]);

  const exportData = useCallback(async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    logger.info('User requested data export', {
      component: 'PopupApp',
      dateString: timestamp,
    });

    try {
      logger.debug('Requesting export data from background', { component: 'PopupApp' });
      const data = await browser.runtime.sendMessage({ action: 'EXPORT_DATA' });

      const dataStr = JSON.stringify(data, null, 2);
      const dataSize = dataStr.length;

      logger.debug('Data export received', {
        component: 'PopupApp',
        dataSize,
        dataSizeKB: Math.round(dataSize / 1024),
      });

      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const fileName = `tabtrackr-data-${timestamp}.json`;
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logger.info('Data export completed successfully', {
        component: 'PopupApp',
        fileName,
        dataSize,
      });
    } catch (err) {
      logger.error('Failed to export data', err as Error, {
        component: 'PopupApp',
        dateString: timestamp,
      });
      setError('Failed to export data');
    }
  }, []);

  const authenticateGoogle = useCallback(async () => {
    logger.info('User requested Google authentication', { component: 'PopupApp' });

    try {
      setIsAuthenticating(true);
      const success = (await browser.runtime.sendMessage({
        action: 'AUTHENTICATE_GOOGLE',
      })) as boolean;

      if (success) {
        logger.info('Google authentication successful', { component: 'PopupApp' });
        await loadData(); // Refresh data after auth
      } else {
        logger.warn('Google authentication failed', { component: 'PopupApp' });
        setError('Failed to authenticate with Google');
      }
    } catch (err) {
      logger.error('Authentication error', err as Error, { component: 'PopupApp' });
      setError('Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  }, [loadData]);

  const signOut = useCallback(async () => {
    logger.info('User requested sign out', { component: 'PopupApp' });

    try {
      await browser.runtime.sendMessage({ action: 'SIGN_OUT' });
      logger.info('Sign out successful', { component: 'PopupApp' });
      await loadData(); // Refresh data after sign out
    } catch (err) {
      logger.error('Sign out error', err as Error, { component: 'PopupApp' });
      setError('Failed to sign out');
    }
  }, [loadData]);

  const forceSync = useCallback(async () => {
    logger.info('User requested force sync', { component: 'PopupApp' });

    try {
      setIsSyncing(true);
      const success = (await browser.runtime.sendMessage({
        action: 'FORCE_SYNC',
      })) as boolean;

      if (success) {
        logger.info('Force sync successful', { component: 'PopupApp' });
        await loadData(); // Refresh data after sync
      } else {
        logger.warn('Force sync failed', { component: 'PopupApp' });
        setError('Sync failed');
      }
    } catch (err) {
      logger.error('Force sync error', err as Error, { component: 'PopupApp' });
      setError('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [loadData]);

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
            disabled={isToggling}
            onClick={toggleTracking}
            title={isTrackingEnabled ? 'Disable tracking' : 'Enable tracking'}
            type="button"
          >
            {getToggleButtonText(isToggling, isTrackingEnabled)}
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
        <div className="settings-panel">
          <h3>Settings</h3>
          <div className="settings-group">
            <div className="setting-item">
              <span>Tracking</span>
              <button
                className={`mini-toggle ${isTrackingEnabled ? 'enabled' : 'disabled'}`}
                disabled={isToggling}
                onClick={toggleTracking}
                type="button"
              >
                {getToggleButtonText(isToggling, isTrackingEnabled)}
              </button>
            </div>
          </div>
          <div className="settings-group">
            <h4>Cloud Sync</h4>
            {syncStatus && (
              <div className="sync-status">
                <div className="sync-indicator">
                  <span className={`status-dot ${syncStatus.isOnline ? 'online' : 'offline'}`} />
                  <span className="status-text">
                    {syncStatus.isOnline ? 'Synced' : 'Offline'}
                    {syncStatus.pendingSessions > 0 && ` (${syncStatus.pendingSessions} pending)`}
                  </span>
                </div>
                {syncStatus.lastSync && (
                  <div className="last-sync">
                    Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
                  </div>
                )}
              </div>
            )}
            <div className="sync-actions">
              {syncStatus?.isOnline ? (
                <>
                  <button
                    className="action-btn sync-btn"
                    disabled={isSyncing}
                    onClick={forceSync}
                    type="button"
                  >
                    {isSyncing ? '🔄 Syncing...' : '🔄 Sync Now'}
                  </button>
                  <button className="action-btn signout-btn" onClick={signOut} type="button">
                    🚪 Sign Out
                  </button>
                </>
              ) : (
                <button
                  className="action-btn auth-btn"
                  disabled={isAuthenticating}
                  onClick={authenticateGoogle}
                  type="button"
                >
                  {isAuthenticating ? '🔄 Signing in...' : '🔐 Sign in with Google'}
                </button>
              )}
            </div>
          </div>

          <div className="settings-group">
            <h4>Data Management</h4>
            <div className="settings-actions">
              <button
                className="action-btn export-btn"
                onClick={() => {
                  logger.info('User clicked export data button', { component: 'PopupApp' });
                  exportData();
                }}
                type="button"
              >
                📤 Export Data
              </button>
              <button
                className="action-btn clear-btn"
                onClick={() => {
                  logger.warn('User clicked clear data button', { component: 'PopupApp' });
                  clearData();
                }}
                type="button"
              >
                🗑️ Clear Data
              </button>
            </div>
          </div>
        </div>
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

import { logger } from '../../../lib/logger';

type SyncStatus = {
  lastSync: string | null;
  isOnline: boolean;
  pendingSessions: number;
};

type SettingsPanelProps = {
  isTrackingEnabled: boolean;
  isToggling: boolean;
  syncStatus: SyncStatus | null;
  isAuthenticating: boolean;
  isSyncing: boolean;
  onToggleTracking: () => void;
  onAuthenticateGoogle: () => void;
  onSignOut: () => void;
  onForceSync: () => void;
  onExportData: () => void;
  onClearData: () => void;
  getToggleButtonText: (isToggling: boolean, isTrackingEnabled: boolean) => string;
};

export function SettingsPanel({
  isTrackingEnabled,
  isToggling,
  syncStatus,
  isAuthenticating,
  isSyncing,
  onToggleTracking,
  onAuthenticateGoogle,
  onSignOut,
  onForceSync,
  onExportData,
  onClearData,
  getToggleButtonText,
}: SettingsPanelProps) {
  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      <div className="settings-group">
        <div className="setting-item">
          <span>Tracking</span>
          <button
            className={`mini-toggle ${isTrackingEnabled ? 'enabled' : 'disabled'}`}
            disabled={isToggling}
            onClick={onToggleTracking}
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
                onClick={onForceSync}
                type="button"
              >
                {isSyncing ? '🔄 Syncing...' : '🔄 Sync Now'}
              </button>
              <button className="action-btn signout-btn" onClick={onSignOut} type="button">
                🚪 Sign Out
              </button>
            </>
          ) : (
            <button
              className="action-btn auth-btn"
              disabled={isAuthenticating}
              onClick={onAuthenticateGoogle}
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
              logger.info('User clicked export data button', { component: 'SettingsPanel' });
              onExportData();
            }}
            type="button"
          >
            📤 Export Data
          </button>
          <button
            className="action-btn clear-btn"
            onClick={() => {
              logger.warn('User clicked clear data button', { component: 'SettingsPanel' });
              onClearData();
            }}
            type="button"
          >
            🗑️ Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}

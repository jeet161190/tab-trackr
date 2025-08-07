import { useCallback, useState } from 'react';
import { logger } from '../lib/logger';

export interface UseTrackingActionsReturn {
  isToggling: boolean;
  isAuthenticating: boolean;
  isSyncing: boolean;
  toggleTracking: () => Promise<void>;
  clearData: () => Promise<void>;
  exportData: () => Promise<void>;
  authenticateGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  forceSync: () => Promise<void>;
  setError: (error: string) => void;
}

interface UseTrackingActionsProps {
  loadData: () => Promise<void>;
  onError: (error: string) => void;
}

export function useTrackingActions({
  loadData,
  onError,
}: UseTrackingActionsProps): UseTrackingActionsReturn {
  const [isToggling, setIsToggling] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const toggleTracking = useCallback(async () => {
    logger.info('User toggling tracking', { component: 'useTrackingActions' });

    try {
      setIsToggling(true);
      await browser.runtime.sendMessage({ action: 'TOGGLE_TRACKING' });
      await loadData();
    } catch (err) {
      logger.error('Failed to toggle tracking', err as Error, { component: 'useTrackingActions' });
      onError('Failed to toggle tracking');
    } finally {
      setIsToggling(false);
    }
  }, [loadData, onError]);

  const clearData = useCallback(async () => {
    logger.warn('User requested data clear', { component: 'useTrackingActions' });

    try {
      await browser.runtime.sendMessage({ action: 'CLEAR_DATA' });
      await loadData();
    } catch (err) {
      logger.error('Failed to clear data', err as Error, { component: 'useTrackingActions' });
      onError('Failed to clear data');
    }
  }, [loadData, onError]);

  const exportData = useCallback(async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    logger.info('User requested data export', { component: 'useTrackingActions' });

    try {
      const data = await browser.runtime.sendMessage({ action: 'EXPORT_DATA' });
      const dataStr = JSON.stringify(data, null, 2);
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
        component: 'useTrackingActions',
        fileName,
      });
    } catch (err) {
      logger.error('Failed to export data', err as Error, { component: 'useTrackingActions' });
      onError('Failed to export data');
    }
  }, [onError]);

  const authenticateGoogle = useCallback(async () => {
    logger.info('User requested Google authentication', { component: 'useTrackingActions' });

    try {
      setIsAuthenticating(true);
      const success = (await browser.runtime.sendMessage({
        action: 'AUTHENTICATE_GOOGLE',
      })) as boolean;

      if (success) {
        await loadData();
      } else {
        onError('Failed to authenticate with Google');
      }
    } catch (err) {
      logger.error('Authentication error', err as Error, { component: 'useTrackingActions' });
      onError('Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  }, [loadData, onError]);

  const signOut = useCallback(async () => {
    logger.info('User requested sign out', { component: 'useTrackingActions' });

    try {
      await browser.runtime.sendMessage({ action: 'SIGN_OUT' });
      await loadData();
    } catch (err) {
      logger.error('Sign out error', err as Error, { component: 'useTrackingActions' });
      onError('Failed to sign out');
    }
  }, [loadData, onError]);

  const forceSync = useCallback(async () => {
    logger.info('User requested force sync', { component: 'useTrackingActions' });

    try {
      setIsSyncing(true);
      const success = (await browser.runtime.sendMessage({ action: 'FORCE_SYNC' })) as boolean;

      if (success) {
        await loadData();
      } else {
        onError('Sync failed');
      }
    } catch (err) {
      logger.error('Force sync error', err as Error, { component: 'useTrackingActions' });
      onError('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [loadData, onError]);

  return {
    isToggling,
    isAuthenticating,
    isSyncing,
    toggleTracking,
    clearData,
    exportData,
    authenticateGoogle,
    signOut,
    forceSync,
    setError: onError,
  };
}

import { useCallback, useEffect, useState } from 'react';
import { logger } from '../lib/logger';

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

export interface UseTabTrackingDataReturn {
  dailyStats: DailyStats | null;
  currentSession: TabSession | null;
  isTrackingEnabled: boolean;
  syncStatus: SyncStatus | null;
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
}

export function useTabTrackingData(): UseTabTrackingDataReturn {
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [currentSession, setCurrentSession] = useState<TabSession | null>(null);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    logger.debug('Loading popup data', { component: 'useTabTrackingData' });
    logger.time('TabTrackingData Load');

    try {
      setIsLoading(true);
      setError(null);

      const [statsResponse, sessionResponse, trackingResponse, syncResponse] = await Promise.all([
        browser.runtime.sendMessage({ action: 'GET_DAILY_STATS' }) as Promise<DailyStats | null>,
        browser.runtime.sendMessage({
          action: 'GET_CURRENT_SESSION',
        }) as Promise<TabSession | null>,
        browser.runtime.sendMessage({ action: 'GET_TRACKING_STATUS' }) as Promise<boolean>,
        browser.runtime.sendMessage({ action: 'GET_SYNC_STATUS' }) as Promise<SyncStatus>,
      ]);

      setDailyStats(statsResponse);
      setCurrentSession(sessionResponse);
      setIsTrackingEnabled(trackingResponse);
      setSyncStatus(syncResponse);

      logger.timeEnd('TabTrackingData Load');
      logger.info('Tab tracking data loaded successfully', {
        component: 'useTabTrackingData',
        hasStats: !!statsResponse,
        hasSession: !!sessionResponse,
        trackingEnabled: trackingResponse,
      });
    } catch (err) {
      logger.timeEnd('TabTrackingData Load');
      logger.error('Failed to load tab tracking data', err as Error, {
        component: 'useTabTrackingData',
      });
      setError('Failed to load tracking data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      logger.trace('Auto-refreshing tab tracking data', { component: 'useTabTrackingData' });
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadData]);

  return {
    dailyStats,
    currentSession,
    isTrackingEnabled,
    syncStatus,
    isLoading,
    error,
    loadData,
  };
}

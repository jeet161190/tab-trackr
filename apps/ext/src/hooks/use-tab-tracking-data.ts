import { useCallback, useEffect, useState } from 'react';
import { logger } from '../lib/logger';

type TabSession = {
  url: string;
  domain: string;
  title: string;
  startTime: number;
  lastActive: number;
  totalTime: number;
  isActive: boolean;
};

type DailyStats = {
  date: string;
  domains: Record<string, number>;
  totalTime: number;
  sessions: TabSession[];
};

type SyncStatus = {
  lastSync: string | null;
  isOnline: boolean;
  pendingSessions: number;
};

export type UseTabTrackingDataReturn = {
  dailyStats: DailyStats | null;
  currentSession: TabSession | null;
  isTrackingEnabled: boolean;
  syncStatus: SyncStatus | null;
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
};

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

    const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Timed out: ${label}`));
        }, ms);
        promise.then(
          (value) => {
            clearTimeout(timer);
            resolve(value);
          },
          (reason) => {
            clearTimeout(timer);
            reject(reason);
          }
        );
      });
    };

    try {
      setIsLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        withTimeout(
          browser.runtime.sendMessage({ action: 'GET_DAILY_STATS' }) as Promise<DailyStats | null>,
          3000,
          'GET_DAILY_STATS'
        ),
        withTimeout(
          browser.runtime.sendMessage({
            action: 'GET_CURRENT_SESSION',
          }) as Promise<TabSession | null>,
          3000,
          'GET_CURRENT_SESSION'
        ),
        withTimeout(
          browser.runtime.sendMessage({ action: 'GET_TRACKING_STATUS' }) as Promise<boolean>,
          3000,
          'GET_TRACKING_STATUS'
        ),
        withTimeout(
          browser.runtime.sendMessage({ action: 'GET_SYNC_STATUS' }) as Promise<SyncStatus>,
          3000,
          'GET_SYNC_STATUS'
        ),
      ]);

      const [statsRes, sessionRes, trackingRes, syncRes] = results;

      if (statsRes.status === 'fulfilled') {
        setDailyStats(statsRes.value);
      } else {
        logger.warn('Popup data: failed to load daily stats', {
          component: 'useTabTrackingData',
          reason: (statsRes.reason as Error)?.message,
        });
      }

      if (sessionRes.status === 'fulfilled') {
        setCurrentSession(sessionRes.value);
      } else {
        logger.warn('Popup data: failed to load current session', {
          component: 'useTabTrackingData',
          reason: (sessionRes.reason as Error)?.message,
        });
      }

      if (trackingRes.status === 'fulfilled') {
        setIsTrackingEnabled(trackingRes.value);
      } else {
        logger.warn('Popup data: failed to load tracking status', {
          component: 'useTabTrackingData',
          reason: (trackingRes.reason as Error)?.message,
        });
      }

      if (syncRes.status === 'fulfilled') {
        setSyncStatus(syncRes.value);
      } else {
        logger.warn('Popup data: failed to load sync status', {
          component: 'useTabTrackingData',
          reason: (syncRes.reason as Error)?.message,
        });
      }

      logger.timeEnd('TabTrackingData Load');
      logger.info('Tab tracking data loaded (partial ok)', {
        component: 'useTabTrackingData',
        hasStats: statsRes.status === 'fulfilled' && !!statsRes.value,
        hasSession: sessionRes.status === 'fulfilled' && !!sessionRes.value,
        trackingEnabled:
          trackingRes.status === 'fulfilled' ? Boolean(trackingRes.value) : undefined,
      });

      if (results.some((r) => r.status === 'rejected')) {
        setError('Some data failed to load. Try again.');
      }
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

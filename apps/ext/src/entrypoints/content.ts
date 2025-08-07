import { logger } from '../lib/logger';

interface ActivityData {
  type: 'activity' | 'idle' | 'visibility';
  timestamp: number;
  data?: {
    isVisible?: boolean;
    isActive?: boolean;
    activityType?: string;
  };
}

class ContentActivityTracker {
  isActive = true;
  lastActivity = Date.now();
  private idleTimer: number | null = null;
  isPageVisible = !document.hidden;

  private readonly IDLE_THRESHOLD = 30_000; // 30 seconds
  private readonly ACTIVITY_REPORT_INTERVAL = 5000; // Report every 5 seconds
  private reportTimer: number | null = null;

  constructor() {
    logger.info('ContentActivityTracker initialized', {
      component: 'ContentActivityTracker',
      url: window.location.href,
      domain: window.location.hostname,
    });

    this.setupEventListeners();
    this.startReporting();

    logger.debug('Activity tracking setup completed', {
      component: 'ContentActivityTracker',
      idleThreshold: this.IDLE_THRESHOLD,
      reportInterval: this.ACTIVITY_REPORT_INTERVAL,
    });
  }

  private setupEventListeners() {
    logger.debug('Setting up event listeners', {
      component: 'ContentActivityTracker',
      url: window.location.href,
    });

    // Activity detection events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    for (const eventType of activityEvents) {
      document.addEventListener(eventType, () => this.onActivity(eventType), {
        passive: true,
        capture: true,
      });
    }

    logger.trace('Activity event listeners registered', {
      component: 'ContentActivityTracker',
      events: activityEvents,
    });

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;

      logger.debug('Page visibility changed', {
        component: 'ContentActivityTracker',
        isVisible: this.isPageVisible,
        visibilityState: document.visibilityState,
      });

      this.sendActivityUpdate('visibility', {
        isVisible: this.isPageVisible,
      });

      if (this.isPageVisible) {
        this.onActivity('visibility-change');
      } else {
        this.markAsIdle();
      }
    });

    // Window focus/blur events
    window.addEventListener('focus', () => {
      logger.debug('Window focused', { component: 'ContentActivityTracker' });
      this.onActivity('window-focus');
    });

    window.addEventListener('blur', () => {
      logger.debug('Window blurred', { component: 'ContentActivityTracker' });
      this.markAsIdle();
    });

    logger.debug('All event listeners set up successfully', {
      component: 'ContentActivityTracker',
    });
  }

  private onActivity(activityType: string) {
    const now = Date.now();
    const wasIdle = !this.isActive;
    this.lastActivity = now;

    logger.trace('User activity detected', {
      component: 'ContentActivityTracker',
      activityType,
      wasIdle,
      timeSinceLastActivity: now - this.lastActivity,
    });

    // If we were idle, mark as active again
    if (!this.isActive) {
      this.isActive = true;
      logger.debug('User became active after being idle', {
        component: 'ContentActivityTracker',
        activityType,
        idleDuration: now - this.lastActivity,
      });

      this.sendActivityUpdate('activity', {
        isActive: true,
        activityType,
      });
    }

    // Reset idle timer
    this.resetIdleTimer();
  }

  private resetIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    this.idleTimer = setTimeout(() => {
      this.markAsIdle();
    }, this.IDLE_THRESHOLD) as unknown as number;
  }

  private markAsIdle() {
    if (this.isActive) {
      this.isActive = false;
      const idleTime = Date.now() - this.lastActivity;

      logger.debug('User marked as idle', {
        component: 'ContentActivityTracker',
        idleTime,
        isPageVisible: this.isPageVisible,
      });

      this.sendActivityUpdate('idle', {
        isActive: false,
      });
    } else {
      logger.trace('Already idle, no change needed', {
        component: 'ContentActivityTracker',
      });
    }
  }

  private sendActivityUpdate(type: ActivityData['type'], data?: ActivityData['data']) {
    const activityData: ActivityData = {
      type,
      timestamp: Date.now(),
      ...(data && { data }),
    };

    logger.trace('Sending activity update to background', {
      component: 'ContentActivityTracker',
      type,
      data,
      url: window.location.href,
    });

    // Send to background script
    browser.runtime
      .sendMessage({
        action: 'CONTENT_ACTIVITY_UPDATE',
        data: activityData,
      })
      .then(() => {
        logger.trace('Activity update sent successfully', {
          component: 'ContentActivityTracker',
          type,
        });
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.warn('Failed to send activity update to background', {
          component: 'ContentActivityTracker',
          type,
          errorMessage,
        });
      });
  }

  private startReporting() {
    logger.debug('Starting periodic reporting', {
      component: 'ContentActivityTracker',
      interval: this.ACTIVITY_REPORT_INTERVAL,
    });

    // Send periodic activity reports
    this.reportTimer = setInterval(() => {
      if (this.isPageVisible) {
        logger.trace('Sending periodic activity report', {
          component: 'ContentActivityTracker',
          isActive: this.isActive,
          timeSinceLastActivity: Date.now() - this.lastActivity,
        });

        this.sendActivityUpdate('activity', {
          isActive: this.isActive,
          activityType: 'periodic-check',
        });
      } else {
        logger.trace('Skipping periodic report - page not visible', {
          component: 'ContentActivityTracker',
        });
      }
    }, this.ACTIVITY_REPORT_INTERVAL) as unknown as number;
  }

  cleanup() {
    logger.debug('Cleaning up ContentActivityTracker', {
      component: 'ContentActivityTracker',
      url: window.location.href,
      hadIdleTimer: !!this.idleTimer,
      hadReportTimer: !!this.reportTimer,
    });

    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }

    logger.debug('ContentActivityTracker cleanup completed', {
      component: 'ContentActivityTracker',
    });
  }
}

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    const currentUrl = window.location.href;
    const currentProtocol = window.location.protocol;

    logger.debug('Content script starting', {
      component: 'ContentScript',
      url: currentUrl,
      protocol: currentProtocol,
      readyState: document.readyState,
    });

    // Don't track on extension pages or invalid URLs
    if (
      currentProtocol === 'chrome-extension:' ||
      currentProtocol === 'moz-extension:' ||
      currentProtocol === 'chrome:' ||
      currentProtocol === 'about:' ||
      currentUrl === 'about:blank'
    ) {
      logger.debug('Content script skipped - invalid URL or extension page', {
        component: 'ContentScript',
        url: currentUrl,
        protocol: currentProtocol,
      });
      return;
    }

    let tracker: ContentActivityTracker | null = null;

    const initializeTracker = () => {
      logger.debug('Initializing content activity tracker', {
        component: 'ContentScript',
        url: currentUrl,
        timestamp: Date.now(),
      });

      try {
        tracker = new ContentActivityTracker();
        logger.info('Content activity tracker initialized successfully', {
          component: 'ContentScript',
          url: currentUrl,
        });
      } catch (error) {
        logger.error('Failed to initialize content activity tracker', error as Error, {
          component: 'ContentScript',
          url: currentUrl,
        });
      }
    };

    // Initialize immediately if DOM is ready
    if (document.readyState === 'loading') {
      logger.debug('DOM still loading, waiting for DOMContentLoaded', {
        component: 'ContentScript',
      });
      document.addEventListener('DOMContentLoaded', initializeTracker);
    } else {
      logger.debug('DOM already loaded, initializing immediately', {
        component: 'ContentScript',
      });
      initializeTracker();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      logger.debug('Page unloading, cleaning up tracker', {
        component: 'ContentScript',
        url: currentUrl,
      });
      tracker?.cleanup();
    });

    // Listen for messages from background script
    browser.runtime.onMessage.addListener((message: unknown) => {
      const msg = message as { action: string };

      logger.trace('Content script received message', {
        component: 'ContentScript',
        action: msg.action,
        hasTracker: !!tracker,
      });

      if (msg.action === 'GET_CONTENT_STATUS') {
        const status = {
          isActive: tracker?.isActive ?? false,
          lastActivity: tracker?.lastActivity ?? Date.now(),
          isVisible: tracker?.isPageVisible ?? document.visibilityState === 'visible',
        };

        logger.debug('Returning content status', {
          component: 'ContentScript',
          status,
        });

        return Promise.resolve(status);
      }

      logger.trace('Unknown message action', {
        component: 'ContentScript',
        action: msg.action,
      });

      return false;
    });

    logger.info('Content script initialization completed', {
      component: 'ContentScript',
      url: currentUrl,
    });
  },
});

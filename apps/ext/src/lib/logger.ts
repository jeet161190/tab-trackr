type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  component?: string;
  tab?: number;
  session?: string;
  domain?: string;
  action?: string;
  duration?: number;
  error?: Error;
  timestamp?: number;
  [key: string]: unknown;
}

class ExtensionLogger {
  private readonly isDevelopment: boolean;
  private readonly minLogLevel: LogLevel;
  private readonly logLevels: Record<LogLevel, number> = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5,
  };

  constructor() {
    // Check if we're in development mode
    // In production builds, __DEV__ will be replaced with false
    this.isDevelopment = import.meta.env.DEV ?? false;
    this.minLogLevel = this.isDevelopment ? 'trace' : 'error';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) {
      // In production, only log fatal errors to avoid console pollution
      return level === 'fatal';
    }
    return this.logLevels[level] >= this.logLevels[this.minLogLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const component = context?.component ? `[${context.component}]` : '';
    const baseMessage = `[${timestamp}] ${level.toUpperCase()} ${component} ${message}`;

    if (context) {
      const contextStr = Object.entries(context)
        .filter(([key]) => key !== 'component' && key !== 'error')
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(' ');

      if (contextStr) {
        return `${baseMessage} ${contextStr}`;
      }
      return baseMessage;
    }

    return baseMessage;
  }

  private logToConsole(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);
    const consoleMethod = this.getConsoleMethod(level);

    if (error) {
      consoleMethod(formattedMessage, error);
    } else {
      consoleMethod(formattedMessage);
    }
  }

  private getConsoleMethod(level: LogLevel) {
    switch (level) {
      case 'trace':
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
      case 'fatal':
        return console.error;
      default:
        return console.log;
    }
  }

  trace(message: string, context?: LogContext) {
    this.logToConsole('trace', message, context);
  }

  debug(message: string, context?: LogContext) {
    this.logToConsole('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.logToConsole('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.logToConsole('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.logToConsole('error', message, context, error);
  }

  fatal(message: string, error?: Error, context?: LogContext) {
    this.logToConsole('fatal', message, context, error);
  }

  // Utility methods for common logging patterns
  sessionStart(session: { domain: string; url: string; title: string }, context?: LogContext) {
    this.info('Session started', {
      ...context,
      action: 'session_start',
      domain: session.domain,
      url: session.url,
      title: session.title,
    });
  }

  sessionEnd(session: { domain: string; totalTime: number }, context?: LogContext) {
    this.info('Session ended', {
      ...context,
      action: 'session_end',
      domain: session.domain,
      duration: session.totalTime,
    });
  }

  activityUpdate(activityType: string, isActive: boolean, context?: LogContext) {
    this.debug('Activity update', {
      ...context,
      action: 'activity_update',
      activityType,
      isActive,
    });
  }

  dataOperation(operation: string, success: boolean, context?: LogContext) {
    const level = success ? 'debug' : 'warn';
    this.logToConsole(level, `Data operation: ${operation}`, {
      ...context,
      action: 'data_operation',
      operation,
      success,
    });
  }

  messageHandling(messageAction: string, success: boolean, context?: LogContext) {
    const level = success ? 'trace' : 'error';
    this.logToConsole(level, `Message handled: ${messageAction}`, {
      ...context,
      action: 'message_handling',
      messageAction,
      success,
    });
  }

  initializationStep(step: string, success: boolean, context?: LogContext) {
    const level = success ? 'info' : 'error';
    this.logToConsole(level, `Initialization: ${step}`, {
      ...context,
      action: 'initialization',
      step,
      success,
    });
  }

  performanceMetric(metric: string, value: number, unit: string, context?: LogContext) {
    this.debug(`Performance: ${metric}`, {
      ...context,
      action: 'performance',
      metric,
      value,
      unit,
    });
  }

  // Group logging for related operations
  group(title: string) {
    if (this.isDevelopment && this.shouldLog('debug')) {
      console.group(`[${new Date().toISOString()}] ${title}`);
    }
  }

  groupEnd() {
    if (this.isDevelopment && this.shouldLog('debug')) {
      console.groupEnd();
    }
  }

  // Table logging for data structures
  table(data: unknown, label?: string) {
    if (this.isDevelopment && this.shouldLog('debug')) {
      if (label) {
        console.log(`[${new Date().toISOString()}] ${label}:`);
      }
      console.table(data);
    }
  }

  // Time tracking for performance
  time(label: string) {
    if (this.isDevelopment && this.shouldLog('debug')) {
      console.time(`[TIMER] ${label}`);
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment && this.shouldLog('debug')) {
      console.timeEnd(`[TIMER] ${label}`);
    }
  }

  // Development mode check
  get isDev() {
    return this.isDevelopment;
  }
}

// Create singleton instance
const logger = new ExtensionLogger();

export { logger, type LogContext };

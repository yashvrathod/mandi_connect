// ==================== Production-Ready Logger ====================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = __DEV__;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | any, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error?.message || error,
      stack: error?.stack,
    };
    console.error(this.formatMessage('error', message, errorContext));
  }

  // API specific logging
  apiRequest(endpoint: string, method: string, data?: any) {
    this.debug(`API Request: ${method} ${endpoint}`, { data });
  }

  apiResponse(endpoint: string, status: number, data?: any) {
    this.debug(`API Response: ${endpoint} - ${status}`, { data });
  }

  apiError(endpoint: string, error: any) {
    this.error(`API Error: ${endpoint}`, error);
  }
}

export const logger = new Logger();
export default logger;

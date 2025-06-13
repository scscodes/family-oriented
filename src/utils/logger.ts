export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function getEnvLogLevel(): LogLevel {
  const level = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
  if (level && levelPriority[level]) return level;
  return 'info';
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = getEnvLogLevel();
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return levelPriority[level] >= levelPriority[this.level];
  }

  debug(...args: unknown[]) {
    if (this.shouldLog('debug')) console.debug(...args);
  }

  info(...args: unknown[]) {
    if (this.shouldLog('info')) console.info(...args);
  }

  warn(...args: unknown[]) {
    if (this.shouldLog('warn')) console.warn(...args);
  }

  error(...args: unknown[]) {
    if (this.shouldLog('error')) console.error(...args);
  }
}

export const logger = new Logger();


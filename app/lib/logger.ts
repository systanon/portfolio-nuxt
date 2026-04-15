const TIME_START = 11
const TIME_END = 19
const LEVELS = ['error', 'info', 'log', 'warn'] as const
type LogLevelType = (typeof LEVELS)[number]

const COLOR: Record<LogLevelType, string> = {
  error: '#ffffff',
  info: '#ffffff',
  log: '#ffffff',
  warn: '#222222',
}
const BG_COLOR: Record<LogLevelType, string> = {
  error: '#940303',
  info: '#2d014f',
  log: '#014d6e',
  warn: '#786002',
}
const SUFFIX: Record<LogLevelType, string> = {
  error: 'Err',
  info: 'Info',
  log: 'Log',
  warn: 'Warn',
}

declare global {
  interface Window {
    logLevel: LogLevel
  }
}

class LogLevel {
  private _levels: LogLevelType[] = []
  constructor(levels: readonly LogLevelType[] = LEVELS) {
    this.set(levels)
  }
  public get levels() {
    return this._levels
  }
  public set(levels: readonly LogLevelType[]) {
    if (!Array.isArray(levels)) return
    this._levels = levels.filter((level) => LEVELS.includes(level))
  }
  public isAllowed(level: LogLevelType) {
    return this._levels.includes(level)
  }
  public onAll() {
    this.set(LEVELS)
  }
  public offAll() {
    this.set([])
  }
}
if (import.meta.client) {
  Object.defineProperty(window, 'logLevel', {
    value: new LogLevel(),
    writable: false,
  })
}

export class Logger {
  private source: string
  constructor(source = 'App') {
    this.source = source
  }

  public error(message: string = '', ...args: unknown[]) {
    if (!this.isAllowed('error')) return
    console.error(...this.format('error', message), ...args)
    console.trace(message)
  }
  public info(message: string, ...args: unknown[]) {
    if (!this.isAllowed('info')) return
    console.info(...this.format('info', message), ...args)
  }
  public log(message: string, ...args: unknown[]) {
    if (!this.isAllowed('log')) return
    console.log(...this.format('log', message), ...args)
  }
  public warn(message: string, ...args: unknown[]) {
    if (!this.isAllowed('warn')) return
    console.warn(...this.format('warn', message), ...args)
  }

  private isAllowed(level: LogLevelType): boolean {
    if (typeof window === 'undefined') return true
    return window.logLevel.isAllowed(level)
  }

  private format(type: LogLevelType, message: string) {
    const timestamp = new Date().toISOString().slice(TIME_START, TIME_END)
    return [
      `%c${timestamp} %c${this.source} ${SUFFIX[type]}:%c ${message}`,
      'line-height: 24px',
      `background: ${BG_COLOR[type]}; color: ${COLOR[type]}; padding: 2px; display: inline-block; border-radius: 5px; width: min-content; white-space: nowrap`,
      'display: inline-block; margin-top: 4px',
    ]
  }
}

type ErrorOptions = {
  cause?: unknown
}

export function isHttpError(
  error: any,
): error is { status: number; data: any } {
  return error && typeof error.status === 'number'
}

export type APIError = {
  _type: string
  status: number
  data: string | object
}

export class AppBase extends Error {
  public override cause?: unknown
  public readonly type: 'error' | 'info' | 'success' | 'silent'
  constructor(
    message?: string,
    type: 'error' | 'info' | 'success' | 'silent' = 'silent',
    options?: ErrorOptions,
  ) {
    super(message)
    this.name = this.constructor.name
    this.type = type
    this.cause = options?.cause
  }
}
export class AppError extends AppBase {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, 'error', options)
  }
}

export class AppInfo extends AppBase {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, 'info', options)
  }
}

export class AppSuccess<T = unknown> extends AppBase {
  public data?: T
  constructor(message?: string, data?: T) {
    super(message, 'success')
    this.data = data
  }
}

export class AppSilentError extends AppBase {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, 'silent', options)
  }
}
export class AppRateLimitError extends AppBase {
  public readonly retryAfter: number
  constructor(message: string, retryAfter: number, options?: ErrorOptions) {
    super(message, 'error', options)
    this.retryAfter = retryAfter
  }
}

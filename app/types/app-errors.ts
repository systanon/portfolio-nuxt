type ErrorOptions = {
  cause?: unknown
}

export class AppBaseError extends Error {
  public override cause?: unknown
  public readonly type: 'error' | 'silent'
  constructor(
    message?: string,
    type: 'error' | 'silent' = 'silent',
    options?: ErrorOptions,
  ) {
    super(message)
    this.name = this.constructor.name
    this.type = type
    this.cause = options?.cause
  }
}

export class AppError extends AppBaseError {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, 'error', options)
  }
}

export class AppSilentError extends AppBaseError {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, 'silent', options)
  }
}

export class AppRateLimitError extends AppBaseError {
  public readonly retryAfter: number
  constructor(message: string, retryAfter: number, options?: ErrorOptions) {
    super(message, 'error', options)
    this.retryAfter = retryAfter
  }
}

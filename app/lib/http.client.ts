import type { $Fetch, NitroFetchOptions } from 'nitropack'
import type { ErrorResponse, SuccessResponse } from '~/types/api'
import { AppError, AppRateLimitError, AppSilentError } from '~/types/app-errors'
import { AppSuccess } from '~/types/app.types'
import { Logger } from './logger'

export interface RetryableOptions extends NitroFetchOptions<'json'> {
  _retry?: boolean
}

export type RequestInterceptor = (
  url: string,
  options: NitroFetchOptions<'json'>,
) => Promise<void> | void

export type RawFetchResponse<T = unknown> = {
  _data: T
  headers: Headers
  status: number
  statusText?: string
}

export type ResponseInterceptor = (
  response: RawFetchResponse,
) => Promise<void> | void

export type ErrorInterceptorContext = {
  url: string
}

export type ErrorInterceptor = (
  error: unknown,
  retry: () => Promise<unknown>,
  options: NitroFetchOptions<'json'>,
  context: ErrorInterceptorContext,
) => Promise<boolean | undefined> | boolean | undefined

const MAX_ERROR_PIPELINE_RETRIES = 5

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isFetchError(error: unknown): error is {
  response: RawFetchResponse<ErrorResponse | unknown>
  message?: string
} {
  if (!isRecord(error)) return false
  const response = error.response
  if (!isRecord(response)) return false
  return (
    typeof response.status === 'number' &&
    response.headers instanceof Headers &&
    '_data' in response
  )
}

export class HTTPClient {
  private fetcher: $Fetch

  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []
  private logger = new Logger('HTTPClient')

  constructor(fetcher: $Fetch) {
    this.fetcher = fetcher
  }

  addRequestInterceptor(fn: RequestInterceptor): () => void {
    this.requestInterceptors.push(fn)
    return () => this.removeFrom(this.requestInterceptors, fn)
  }

  addResponseInterceptor(fn: ResponseInterceptor): () => void {
    this.responseInterceptors.push(fn)
    return () => this.removeFrom(this.responseInterceptors, fn)
  }

  addErrorInterceptor(fn: ErrorInterceptor): () => void {
    this.errorInterceptors.push(fn)
    return () => this.removeFrom(this.errorInterceptors, fn)
  }

  async do<T>(
    url: string,
    options: NitroFetchOptions<'json'> = {},
  ): Promise<AppSuccess<T> | AppError | AppRateLimitError | AppSilentError> {
    return this.execWithRetry<AppSuccess<T>>(url, options, (response) => {
      const data = response._data as SuccessResponse<T>
      if (!data || data.success !== true) {
        this.logger.error(`Unexpected response shape from ${url}`, data)
        return new AppError('Unexpected response shape')
      }
      return new AppSuccess<T>(data.data, response.headers, data.message)
    })
  }

  async download(
    url: string,
    options: NitroFetchOptions<'json'> = {},
  ): Promise<Blob | AppError | AppRateLimitError | AppSilentError> {
    return this.execWithRetry<Blob>(
      url,
      { ...options, responseType: 'blob' },
      (response) => response._data as Blob,
    )
  }

  private async execWithRetry<R>(
    url: string,
    options: NitroFetchOptions<'json'>,
    extractResult: (response: RawFetchResponse) => R | AppError,
  ): Promise<R | AppError | AppRateLimitError | AppSilentError> {
    let pipelineRetries = 0

    const exec = async (): Promise<
      R | AppError | AppRateLimitError | AppSilentError
    > => {
      try {
        await this.runRequestInterceptors(url, options)

        const response = await this.rawFetch(url, options)

        await this.runResponseInterceptors(response)

        return extractResult(response)
      } catch (error) {
        if (pipelineRetries >= MAX_ERROR_PIPELINE_RETRIES) {
          return this.handleError(error, url)
        }

        for (const interceptor of this.errorInterceptors) {
          const shouldRetry = await interceptor(error, exec, options, { url })
          if (shouldRetry) {
            pipelineRetries += 1
            this.logger.warn(
              `Retrying request to ${url} (attempt ${pipelineRetries})`,
            )
            return exec()
          }
        }

        return this.handleError(error, url)
      }
    }

    return exec()
  }

  private async runRequestInterceptors(
    url: string,
    options: NitroFetchOptions<'json'>,
  ): Promise<void> {
    this.logger.log(`Making request to ${url} with options`, options)
    for (const interceptor of this.requestInterceptors) {
      await interceptor(url, options)
    }
  }

  private async runResponseInterceptors(
    response: RawFetchResponse,
  ): Promise<void> {
    this.logger.log('Received response with status', response.status)
    for (const interceptor of this.responseInterceptors) {
      await interceptor(response)
    }
  }

  private rawFetch(
    url: string,
    options: unknown,
  ): Promise<RawFetchResponse<unknown>> {
    return (
      this.fetcher.raw as (
        url: string,
        options: unknown,
      ) => Promise<RawFetchResponse<unknown>>
    )(url, options)
  }

  private removeFrom<T>(list: T[], fn: T): void {
    const i = list.indexOf(fn)
    if (i !== -1) list.splice(i, 1)
  }

  private async handleError(error: unknown, url: string) {
    if (isFetchError(error)) {
      const data = await this.parseErrorData(error.response._data)
      const err = data?.error

      if (err?.code === 'RATE_LIMIT') {
        this.logger.warn(
          `Rate limit hit, retry after ${error.response.headers.get('Retry-After')}s`,
        )
        return new AppRateLimitError(
          err.message,
          Number(error.response.headers.get('Retry-After')),
        )
      }

      if (err?.code === 'UNAUTHORIZED') {
        this.logger.warn(`Unauthorized request to ${url}`)
        return new AppSilentError(err.message, { cause: err })
      }

      this.logger.error(
        `Request failed: ${err?.message ?? 'Unknown error'}`,
        err,
      )

      return new AppError(err?.message ?? 'Unknown error', {
        cause: err ?? data,
      })
    }

    if (error instanceof Error) {
      this.logger.error(error.message, error)
      return new AppError(error.message, { cause: error })
    }

    return new AppError('Unknown error', { cause: error })
  }

  private async parseErrorData(
    rawData: unknown,
  ): Promise<ErrorResponse | undefined> {
    if (rawData instanceof Blob) {
      try {
        const text = await rawData.text()
        return JSON.parse(text) as ErrorResponse
      } catch {
        return undefined
      }
    }
    return rawData as ErrorResponse | undefined
  }
}

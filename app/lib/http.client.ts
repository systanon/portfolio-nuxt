import type { $Fetch, NitroFetchOptions } from 'nitropack'
import type { ErrorResponse, SuccessResponse } from '~/types/api'
import { AppError, AppRateLimitError, AppSilentError } from '~/types/app-errors'
import { AppSuccess } from '~/types/app.types'

export interface RetryableOptions extends NitroFetchOptions<'json'> {
  _retry?: boolean
}

type RequestInterceptor = (
  url: string,
  options: NitroFetchOptions<'json'>,
) => Promise<void> | void

export type RawFetchResponse<T = unknown> = {
  _data: T
  headers: Headers
  status: number
  statusText?: string
}

type ResponseInterceptor = (response: RawFetchResponse) => Promise<void> | void

export type ErrorInterceptorContext = {
  url: string
}

type ErrorInterceptor = (
  error: unknown,
  retry: () => Promise<unknown>,
  options: NitroFetchOptions<'json'>,
  context: ErrorInterceptorContext,
) => Promise<boolean | void> | boolean | void

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
  return 'status' in response && 'headers' in response && '_data' in response
}

export class HTTPClient {
  private fetcher: $Fetch

  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

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
    let pipelineRetries = 0

    const exec = async (): Promise<
      AppSuccess<T> | AppError | AppRateLimitError | AppSilentError
    > => {
      try {
        await this.runRequestInterceptors(url, options)

        const response = (await this.fetcher.raw(
          url,
          options,
        )) as RawFetchResponse<unknown>

        await this.runResponseInterceptors(response)

        const data = response._data as SuccessResponse<T>
        return new AppSuccess<T>(data.data, response.headers, data.message)
      } catch (error) {
        if (pipelineRetries >= MAX_ERROR_PIPELINE_RETRIES) {
          return this.handleError(error)
        }

        for (const interceptor of this.errorInterceptors) {
          const shouldRetry = await interceptor(error, exec, options, { url })
          if (shouldRetry) {
            pipelineRetries += 1
            return exec()
          }
        }

        return this.handleError(error)
      }
    }

    return exec()
  }

  async download(
    url: string,
    options: NitroFetchOptions<'json'> = {},
  ): Promise<Blob | AppError | AppRateLimitError | AppSilentError> {
    let pipelineRetries = 0

    const exec = async (): Promise<
      Blob | AppError | AppRateLimitError | AppSilentError
    > => {
      try {
        await this.runRequestInterceptors(url, options)

        const response = (await this.fetcher.raw(url, {
          ...options,
          responseType: 'blob',
        })) as RawFetchResponse<unknown>

        await this.runResponseInterceptors(response)

        return response._data as Blob
      } catch (error) {
        if (pipelineRetries >= MAX_ERROR_PIPELINE_RETRIES) {
          return this.handleError(error)
        }

        for (const interceptor of this.errorInterceptors) {
          const shouldRetry = await interceptor(error, exec, options, { url })
          if (shouldRetry) {
            pipelineRetries += 1
            return exec()
          }
        }

        return this.handleError(error)
      }
    }

    return exec()
  }

  private async runRequestInterceptors(
    url: string,
    options: NitroFetchOptions<'json'>,
  ): Promise<void> {
    for (const interceptor of this.requestInterceptors) {
      await interceptor(url, options)
    }
  }

  private async runResponseInterceptors(
    response: RawFetchResponse,
  ): Promise<void> {
    for (const interceptor of this.responseInterceptors) {
      await interceptor(response)
    }
  }

  private removeFrom<T>(list: T[], fn: T): void {
    const i = list.indexOf(fn)
    if (i !== -1) list.splice(i, 1)
  }

  private handleError(error: unknown) {
    if (isFetchError(error)) {
      const data = error.response._data as ErrorResponse | undefined
      const err = data?.error

      if (err?.code === 'RATE_LIMIT') {
        return new AppRateLimitError(
          err.message,
          Number(error.response.headers.get('Retry-After')),
        )
      }

      if (err?.code === 'UNAUTHORIZED') {
        return new AppSilentError(err.message, { cause: err })
      }

      return new AppError(err?.message ?? 'Unknown error', {
        cause: err ?? data,
      })
    }

    if (error instanceof Error) {
      return new AppError(error.message, { cause: error })
    }

    return new AppError('Unknown error', { cause: error })
  }
}

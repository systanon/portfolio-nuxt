import type { $Fetch, NitroFetchOptions } from 'nitropack'
import type { ErrorResponse, SuccessResponse } from '~/types/api'
import { AppError, AppRateLimitError, AppSilentError } from '~/types/app-errors'
import { AppSuccess } from '~/types/app.types'

type RequestInterceptor = (
  url: string,
  options: NitroFetchOptions<'json'>,
) => Promise<void> | void

export interface RetryableOptions extends NitroFetchOptions<'json'> {
  _retry?: boolean
}

type ResponseInterceptor = (response: Response) => Promise<void> | void

type ErrorInterceptor = (
  error: any,
  retry: () => Promise<any>,
  options: NitroFetchOptions<'json'>,
) => Promise<boolean | void> | boolean | void

export class HTTPClient {
  private fetcher: $Fetch

  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  constructor(fetcher: $Fetch) {
    this.fetcher = fetcher
  }

  addRequestInterceptor(fn: RequestInterceptor) {
    this.requestInterceptors.push(fn)
  }

  addResponseInterceptor(fn: ResponseInterceptor) {
    this.responseInterceptors.push(fn)
  }

  addErrorInterceptor(fn: ErrorInterceptor) {
    this.errorInterceptors.push(fn)
  }

  async do<T>(
    url: string,
    options: NitroFetchOptions<'json'> = {},
  ): Promise<AppSuccess<T> | AppError | AppRateLimitError | AppSilentError> {
    const exec = async () => {
      try {
        for (const i of this.requestInterceptors) {
          await i(url, options)
        }

        const response = await this.fetcher.raw(url, options)

        for (const i of this.responseInterceptors) {
          await i(response)
        }

        const data = response._data as SuccessResponse<T>
        return new AppSuccess<T>(data.data, response.headers, data.message)
      } catch (error) {
        for (const i of this.errorInterceptors) {
          const shouldRetry = await i(error, exec, options)
          if (shouldRetry) return exec()
        }

        return this.handleError(error)
      }
    }

    return exec()
  }

  async download(
    url: string,
    options: NitroFetchOptions<'json'> = {},
  ): Promise<Blob | AppError> {
    try {
      for (const i of this.requestInterceptors) {
        await i(url, options)
      }

      const response = await this.fetcher.raw(url, {
        ...options,
        responseType: 'blob',
      })

      for (const i of this.responseInterceptors) {
        await i(response)
      }

      return response._data as Blob
    } catch (error) {
      return this.handleError(error)
    }
  }

  private handleError(error: any) {
    if (this.isFetchError(error)) {
      const data = error.response._data as ErrorResponse

      if (data.error.code === 'RATE_LIMIT') {
        return new AppRateLimitError(
          data.error.message,
          Number(error.response.headers.get('Retry-After')),
        )
      }

      if (data.error.code === 'UNAUTHORIZED') {
        return new AppSilentError(data.error.message, { cause: data.error })
      }

      return new AppError(data.error.message ?? 'Unknown error', {
        cause: data.error,
      })
    }

    if (error instanceof Error) {
      return new AppError(error.message, { cause: error })
    }

    return new AppError('Unknown error', { cause: error })
  }

  private isFetchError(error: any): error is {
    response: { _data?: ErrorResponse; status: number; headers: Headers }
  } {
    return error && error.response
  }
}

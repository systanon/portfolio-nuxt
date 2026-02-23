import type { $Fetch, NitroFetchOptions } from 'nitropack'
import type { ErrorResponse, SuccessResponse } from '~/types/api'
import { AppError, AppRateLimitError, AppSilentError } from '~/types/app-errors'

import { AppSuccess } from '~/types/app.types'

export class HTTPClient {
  private fetcher: $Fetch

  constructor(fetch: $Fetch) {
    this.fetcher = fetch
  }

  public async do<T>(
    url: string,
    options: NitroFetchOptions<'json'> = {},
  ): Promise<AppSuccess<T> | AppError | AppRateLimitError | AppSilentError> {
    try {
      const response = await this.fetcher.raw(url, options)
      const data = response._data as SuccessResponse<T>
      return new AppSuccess<T>(data.data, response.headers, data.message)
    } catch (error: unknown) {
      if (this.isFetchError(error)) {
        const data = error.response._data as ErrorResponse
        if (data.error.code === 'RATE_LIMIT') {
          return new AppRateLimitError(
            data.error.message,
            Number(error.response.headers.get('Retry-After')),
          )
        } else if (data.error.code === 'UNAUTHORIZED') {
          return new AppSilentError(data.error.message, { cause: data.error })
        } else {
          return new AppError(data.error.message ?? 'Unknown error', {
            cause: data.error,
          })
        }
      }
      if (error instanceof Error) {
        return new AppError(error.message, { cause: error })
      }
      return new AppError('Unknown error', { cause: error })
    }
  }

  private isFetchError(error: any): error is {
    response: {
      _data?: ErrorResponse
      status: number
      headers: Headers
    }
  } {
    return error && error.response
  }
}

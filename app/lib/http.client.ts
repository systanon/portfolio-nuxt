import type { $Fetch, NitroFetchOptions } from 'nitropack'
import type { ErrorResponse, SuccessResponse } from '~/types/api'
import { AppError, AppRateLimitError } from '~/types/app-errors'

import { AppSuccess } from '~/types/app.types'

export class HTTPClient {
  private fetcher: $Fetch

  constructor(fetch: $Fetch) {
    this.fetcher = fetch
  }

  public async do<T>(
    url: string,
    options: NitroFetchOptions<'json'> = {},
  ): Promise<AppSuccess<T> | AppError | AppRateLimitError> {
    try {
      const response = await this.fetcher.raw(url, options)
      if (!response.ok) {
        const data = response._data as ErrorResponse
        if (data.error.code === 'RATE_LIMIT') {
          return new AppRateLimitError(
            data.error.message,
            Number(response.headers.get('Retry-After')),
          )
        } else {
          return new AppError(data.error.message)
        }
      } else {
        const data = response._data as SuccessResponse<T>
        return new AppSuccess<T>(data.data, response.headers, data.message)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return new AppError(error.message, { cause: error })
      }
      return new AppError('Unknown error', { cause: error })
    }
  }
}

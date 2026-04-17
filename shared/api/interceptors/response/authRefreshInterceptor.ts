import {
  isFetchError,
  type ErrorInterceptor,
  type ErrorInterceptorContext,
  type RetryableOptions,
} from '~/lib/http.client'
import { AppSuccess } from '~/types/app.types'

export const createAuthRefreshInterceptor = (
  application: { refresh: () => Promise<unknown> },
  excludeUrls: string[],
): ErrorInterceptor => {
  return async (
    error: unknown,
    retry,
    options: RetryableOptions,
    { url }: ErrorInterceptorContext,
  ): Promise<void | boolean> => {
    if (excludeUrls.some((excludeUrl) => url.includes(excludeUrl))) return

    const status = isFetchError(error) ? error.response.status : undefined

    if (status !== 401 || options._retry) return

    options._retry = true

    const response = await application.refresh()

    if (response instanceof AppSuccess) {
      return true
    }

    return false
  }
}

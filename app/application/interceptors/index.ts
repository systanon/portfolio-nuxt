import type { Ref } from 'vue'
import {
  isFetchError,
  type ErrorInterceptor,
  type ErrorInterceptorContext,
  type RequestInterceptor,
  type RetryableOptions,
} from '~/lib/http.client'
import { AppSuccess } from '~/types/app.types'
import type { AuthApplication } from '../auth.application'

export const createAuthHeaderInterceptor = (
  accessToken: Ref<string | null | undefined>,
): RequestInterceptor => {
  return (_url, options) => {
    if (options.credentials !== 'include') return

    const token = accessToken.value
    if (!token) return

    const headers = new Headers(options.headers as HeadersInit | undefined)
    headers.set('Authorization', token)
    options.headers = headers
  }
}

export const createCookieForwardingInterceptor = (
  cookie: string | undefined,
): RequestInterceptor => {
  return (_url, options) => {
    if (!cookie) return
    const headers = new Headers(options.headers)
    headers.set('cookie', cookie)
    options.headers = headers
  }
}

export const createAuthRefreshInterceptor = (
  authApplication: AuthApplication,
  excludeUrls: string[],
): ErrorInterceptor => {
  return async (
    error: unknown,
    retry,
    options: RetryableOptions,
    { url }: ErrorInterceptorContext,
  ): Promise<undefined | boolean> => {
    if (excludeUrls.some((excludeUrl) => url.includes(excludeUrl))) return

    const status = isFetchError(error) ? error.response.status : undefined

    if (status !== 401 || options._retry) return

    options._retry = true

    const response = await authApplication.refresh()
    if (response instanceof AppSuccess) {
      return true
    }

    return false
  }
}

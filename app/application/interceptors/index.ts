import type { Ref } from 'vue'
import {
  isFetchError,
  type ErrorInterceptor,
  type ErrorInterceptorContext,
  type RetryableOptions,
} from '~/lib/http.client'
import { AppSuccess } from '~/types/app.types'
import type { RequestInterceptor } from '~/lib/http.client'
import { HTTPClient } from '~/lib/http.client'
import type { AuthResponse } from '~/types/auth'

export const createAuthHeaderInterceptor = (
  getToken: () => string | null | undefined,
): RequestInterceptor => {
  return (_url, options) => {
    if (options.credentials !== 'include') return

    const token = getToken()
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
  httpClient: HTTPClient,
  setToken: (newToken: string) => void,
  excludeUrls: string[],
  refreshUrl: string,
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

    const response = await httpClient.do<AuthResponse>(refreshUrl, {
      method: 'POST',
    })

    if (response instanceof AppSuccess) {
      const access_token = response.data.access_token
      setToken(access_token)
      return true
    }

    return false
  }
}

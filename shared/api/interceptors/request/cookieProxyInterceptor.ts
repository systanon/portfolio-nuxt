import type { RequestInterceptor } from '~/lib/http.client'

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

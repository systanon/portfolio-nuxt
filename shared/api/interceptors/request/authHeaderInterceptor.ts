import type { Ref } from 'vue'
import type { RequestInterceptor } from '~/lib/http.client'

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

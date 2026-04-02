import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { $Fetch } from 'nitropack'
import { HTTPClient, isFetchError } from '~/lib/http.client'
import { AppError, AppRateLimitError, AppSilentError } from '~/types/app-errors'
import { AppSuccess } from '~/types/app.types'

function successBody<T>(data: T, message = 'ok') {
  return {
    success: true as const,
    data,
    message,
  }
}

function makeFetchResponse<T>(body: T, headers = new Headers()) {
  return {
    _data: body,
    headers,
    status: 200,
    statusText: 'OK',
  }
}

function makeFetchError(
  status: number,
  body: { success: false; error: { code: string; message: string } },
  headers = new Headers(),
) {
  return {
    response: {
      _data: body,
      status,
      headers,
    },
  }
}

describe('isFetchError', () => {
  it('returns true for ofetch-style errors', () => {
    expect(
      isFetchError(
        makeFetchError(400, {
          success: false,
          error: { code: 'X', message: 'm' },
        }),
      ),
    ).toBe(true)
  })

  it('returns false for plain Error', () => {
    expect(isFetchError(new Error('x'))).toBe(false)
  })

  it('returns false for non-objects', () => {
    expect(isFetchError(null)).toBe(false)
    expect(isFetchError('err')).toBe(false)
  })
})

describe('HTTPClient', () => {
  let raw: ReturnType<typeof vi.fn>
  let fetcher: $Fetch
  let client: HTTPClient

  beforeEach(() => {
    raw = vi.fn()
    fetcher = { raw } as unknown as $Fetch
    client = new HTTPClient(fetcher)
  })

  describe('do', () => {
    it('returns AppSuccess when raw resolves with API success shape', async () => {
      const payload = successBody({ id: 1, name: 'test' })
      raw.mockResolvedValueOnce(
        makeFetchResponse(payload, new Headers({ 'x-custom': '1' })),
      )

      const result = await client.do<{ id: number; name: string }>('/api/x')

      expect(raw).toHaveBeenCalledWith('/api/x', {})
      expect(result).toBeInstanceOf(AppSuccess)
      if (result instanceof AppSuccess) {
        expect(result.data).toEqual({ id: 1, name: 'test' })
        expect(result.message).toBe('ok')
        expect(result.headers.get('x-custom')).toBe('1')
      }
    })

    it('runs request then response interceptors in order', async () => {
      const order: string[] = []
      raw.mockImplementationOnce(async () => {
        order.push('raw')
        return makeFetchResponse(successBody(null))
      })

      client.addRequestInterceptor(() => {
        order.push('req')
      })
      client.addResponseInterceptor(() => {
        order.push('res')
      })

      await client.do('/x')
      expect(order).toEqual(['req', 'raw', 'res'])
    })

    it('maps fetch error body to AppError', async () => {
      raw.mockRejectedValueOnce(
        makeFetchError(400, {
          success: false,
          error: { code: 'BAD', message: 'bad request' },
        }),
      )

      const result = await client.do('/x')
      expect(result).toBeInstanceOf(AppError)
      if (result instanceof AppError) {
        expect(result.message).toBe('bad request')
      }
    })

    it('maps RATE_LIMIT to AppRateLimitError', async () => {
      const headers = new Headers({ 'Retry-After': '42' })
      raw.mockRejectedValueOnce(
        makeFetchError(
          429,
          {
            success: false,
            error: { code: 'RATE_LIMIT', message: 'slow down' },
          },
          headers,
        ),
      )

      const result = await client.do('/x')
      expect(result).toBeInstanceOf(AppRateLimitError)
      if (result instanceof AppRateLimitError) {
        expect(result.message).toBe('slow down')
        expect(result.retryAfter).toBe(42)
      }
    })

    it('maps UNAUTHORIZED to AppSilentError', async () => {
      raw.mockRejectedValueOnce(
        makeFetchError(401, {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'nope' },
        }),
      )

      const result = await client.do('/x')
      expect(result).toBeInstanceOf(AppSilentError)
      if (result instanceof AppSilentError) {
        expect(result.message).toBe('nope')
      }
    })

    it('maps plain Error to AppError', async () => {
      raw.mockRejectedValueOnce(new Error('network down'))

      const result = await client.do('/x')
      expect(result).toBeInstanceOf(AppError)
      if (result instanceof AppError) {
        expect(result.message).toBe('network down')
      }
    })

    it('retries once when error interceptor returns true', async () => {
      raw
        .mockRejectedValueOnce(
          makeFetchError(401, {
            success: false,
            error: { code: 'BAD', message: 'first' },
          }),
        )
        .mockResolvedValueOnce(makeFetchResponse(successBody({ ok: true })))

      client.addErrorInterceptor(async (_err, _retry, _opts, ctx) => {
        expect(ctx.url).toBe('/retry-me')
        return true
      })

      const result = await client.do<{ ok: boolean }>('/retry-me')
      expect(raw).toHaveBeenCalledTimes(2)
      expect(result).toBeInstanceOf(AppSuccess)
      if (result instanceof AppSuccess) {
        expect(result.data).toEqual({ ok: true })
      }
    })

    it('passes request URL to error interceptor', async () => {
      raw.mockRejectedValueOnce(
        makeFetchError(500, {
          success: false,
          error: { code: 'X', message: 'm' },
        }),
      )

      const spy = vi.fn()
      client.addErrorInterceptor((_e, _r, _o, ctx) => {
        spy(ctx.url)
      })

      await client.do('/path?q=1')
      expect(spy).toHaveBeenCalledWith('/path?q=1')
    })

    it('stops retrying after MAX_ERROR_PIPELINE_RETRIES', async () => {
      raw.mockRejectedValue(
        makeFetchError(401, {
          success: false,
          error: { code: 'BAD', message: 'fail' },
        }),
      )

      client.addErrorInterceptor(() => true)

      const result = await client.do('/x')
      expect(raw).toHaveBeenCalledTimes(6)
      expect(result).toBeInstanceOf(AppError)
    })

    it('removes request interceptor when unsubscribe is called', async () => {
      raw.mockResolvedValue(makeFetchResponse(successBody(null)))

      const spy = vi.fn()
      const unsub = client.addRequestInterceptor(spy)

      await client.do('/a')
      expect(spy).toHaveBeenCalledTimes(1)

      unsub()
      await client.do('/b')
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('download', () => {
    it('returns blob and passes responseType blob to raw', async () => {
      const blob = new Blob(['x'], { type: 'text/plain' })
      raw.mockResolvedValueOnce({
        _data: blob,
        headers: new Headers(),
        status: 200,
      })

      const result = await client.download('/file')

      expect(raw).toHaveBeenCalledWith('/file', { responseType: 'blob' })
      expect(result).toBeInstanceOf(Blob)
      if (result instanceof Blob) {
        expect(await result.text()).toBe('x')
      }
    })

    it('runs error interceptors on failure', async () => {
      raw
        .mockRejectedValueOnce(
          makeFetchError(401, {
            success: false,
            error: { code: 'BAD', message: 'first' },
          }),
        )
        .mockResolvedValueOnce({
          _data: new Blob(['ok']),
          headers: new Headers(),
          status: 200,
        })

      client.addErrorInterceptor(() => true)

      const result = await client.download('/f')
      expect(raw).toHaveBeenCalledTimes(2)
      expect(result).toBeInstanceOf(Blob)
    })
  })
})

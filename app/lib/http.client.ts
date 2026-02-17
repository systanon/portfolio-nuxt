import type { $Fetch, NitroFetchOptions } from 'nitropack'

export class HTTPClient {
  private fetcher: $Fetch

  constructor(fetch: $Fetch) {
    this.fetcher = fetch
  }

  public async do<T>(
    url: string,
    options: NitroFetchOptions<any> = {},
  ): Promise<{ data: T; headers: Headers }> {
    const response = await this.fetcher.raw<T>(url, options)
    if (response.ok) {
      return {
        data: response._data as T,
        headers: response.headers,
      }
    }
    return Promise.reject(response)
  }

  public async jsonDo<T>(
    url: string,
    options: NitroFetchOptions<any> = {},
  ): Promise<T> {
    return this.fetcher(url, options) as Promise<T>
  }
}

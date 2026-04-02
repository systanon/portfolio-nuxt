export type PaginateResult<T> = {
  data: Array<T>
  total: number
  pages: number
}

export type GetAllParams = {
  page?: number
  perPage?: number
  offset?: number
  limit?: number
  completed?: boolean
  q?: string
  sortOrder?: 'ASC' | 'DESC'
}

export class AppBase {
  public readonly type: 'info' | 'success'
  public readonly message: string

  constructor(type: 'info' | 'success', message?: string) {
    this.type = type
    this.message = message || ''
  }
}

export class AppInfo extends AppBase {
  constructor(message: string) {
    super('info', message)
  }
}

export class AppSuccess<T = unknown> extends AppBase {
  public readonly data: T
  public readonly headers: Headers
  constructor(data: T, headers: Headers, message?: string) {
    super('success', message)
    this.data = data
    this.headers = headers
  }
}

export type StatisticDTO = {
  contact_name: string
  company_name: string
  email: string
}

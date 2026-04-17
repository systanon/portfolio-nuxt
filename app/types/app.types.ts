import type { AppError } from './app-errors'
import type { AuthResponse } from './auth'
import type { Note } from './note'
import type { Todo } from './todo'
import type { Profile } from './user.types'

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

export interface BaseApplication {
  getAllNotes(
    params: GetAllParams,
  ): Promise<AppSuccess<PaginateResult<Note>> | AppError>
  getAllTodos(params: GetAllParams): Promise<PaginateResult<Todo> | AppError>
  getOneNote(id: number): Promise<AppSuccess<Note> | AppError>
  getOneTodo(id: number): Promise<AppSuccess<Todo> | AppError>
  refresh(): Promise<AppSuccess<AuthResponse> | AppError>
  logout(): Promise<void | AppError>
  getProfile(): Promise<AppSuccess<Profile> | AppError>
}

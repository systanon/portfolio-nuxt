import { HTTPClient } from '~/lib/http.client'
import type {
  CreateTodoDTO,
  Todo,
  ReplaceTodoDTO,
  UpdateTodoDTO,
  CreateTodoResponse,
} from '~/types/todo'
import { AppError } from '~/types/app-errors'
import type { ID } from '~/types/general'
import {
  AppSuccess,
  type GetAllParams,
  type PaginateResult,
} from '~/types/app.types'
import { getTotalPages } from '~/utils/getTotalPages'
import { API_URL } from '~/constants'
import type { WSClientLike, WSHandler } from '~/lib/ws.client'

export class TodoService {
  private readonly httpClient: HTTPClient

  constructor(httpClient: HTTPClient) {
    this.httpClient = httpClient
  }

  async create(
    dto: CreateTodoDTO,
  ): Promise<AppSuccess<CreateTodoResponse> | AppError> {
    const url = API_URL.todos
    const body = JSON.stringify(dto)
    return this.httpClient.do<CreateTodoResponse>(url, {
      method: 'POST',
      body,
    })
  }

  async getAll(
    params?: GetAllParams,
  ): Promise<PaginateResult<Todo> | AppError> {
    const url = API_URL.todos
    const response = await this.httpClient.do<Todo[]>(url, { params })
    if (response instanceof AppSuccess) {
      return {
        ...getTotalPages(response.headers),
        data: response.data,
      }
    } else {
      return new AppError(response.message)
    }
  }

  async getOne(id: ID): Promise<AppSuccess<Todo> | AppError> {
    const url = `${API_URL.todos}/${id}`
    return this.httpClient.do<Todo>(url)
  }

  async replace(id: ID, dto: ReplaceTodoDTO): Promise<void | AppError> {
    const url = `${API_URL.todos}/${id}`
    const body = JSON.stringify(dto)
    const result = await this.httpClient.do<null>(url, {
      method: 'PUT',
      body,
    })
    if (result instanceof AppError) {
      return result
    }
  }

  async update(id: ID, dto: UpdateTodoDTO): Promise<void | AppError> {
    const url = `${API_URL.todos}/${id}`
    const body = JSON.stringify(dto)
    const result = await this.httpClient.do<null>(url, {
      method: 'PATCH',
      body,
    })
    if (result instanceof AppError) {
      return result
    }
  }

  async delete(id: ID): Promise<void | AppError> {
    const url = `${API_URL.todos}/${id}`
    const result = await this.httpClient.do<null>(url, {
      method: 'DELETE',
    })
    if (result instanceof AppError) {
      return result
    }
  }
}

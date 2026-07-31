import { API_URL } from '~/constants'
import type { HTTPClient } from '~/lib/http.client'
import { AppError } from '~/types/app-errors'
import {
  AppSuccess,
  type GetAllParams,
  type PaginateResult,
} from '~/types/app.types'
import type { CreateNoteDTO, Note, UpdateNoteDTO } from '~/types/note'

export class NotesService {
  private readonly httpClient: HTTPClient

  constructor(httpClient: HTTPClient) {
    this.httpClient = httpClient
  }

  async getAll(
    params?: GetAllParams,
  ): Promise<AppSuccess<PaginateResult<Note>> | AppError> {
    const url = API_URL.notes
    const response = await this.httpClient.do<Note[]>(url, {
      params,
      credentials: 'include',
    })
    if (response instanceof AppSuccess) {
      return new AppSuccess(
        {
          ...getTotalPages(response.headers),
          data: response.data,
        },
        response.headers,
      )
    } else {
      return new AppError(response.message)
    }
  }

  async create(dto: CreateNoteDTO): Promise<AppSuccess<Note> | AppError> {
    const url = API_URL.notes
    const body = JSON.stringify(dto)

    return this.httpClient.do<Note>(url, {
      method: 'POST',
      body,
      credentials: 'include',
    })
  }

  async getOne(id: number): Promise<AppSuccess<Note> | AppError> {
    const url = `${API_URL.notes}/${id}`
    return this.httpClient.do<Note>(url, { credentials: 'include' })
  }

  async update(
    id: number,
    dto: UpdateNoteDTO,
  ): Promise<AppSuccess<Note> | AppError> {
    const url = `${API_URL.notes}/${id}`
    const body = JSON.stringify(dto)

    return this.httpClient.do<Note>(url, {
      method: 'PATCH',
      body,
      credentials: 'include',
    })
  }

  async delete(id: number): Promise<AppSuccess<null> | AppError> {
    const url = `${API_URL.notes}/${id}`
    return this.httpClient.do<null>(url, {
      method: 'DELETE',
      credentials: 'include',
    })
  }
}

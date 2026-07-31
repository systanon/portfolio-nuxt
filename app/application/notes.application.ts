import { AppError } from '~/types/app-errors'
import type {
  AppSuccess,
  GetAllParams,
  PaginateResult,
} from '~/types/app.types'
import type { CreateNoteDTO, Note, UpdateNoteDTO } from '~/types/note'
import type { NotesService } from './services/note.service'
import type { NotificationModule } from './modules/notification/notification.module'

export class NotesApplication {
  private notesService: NotesService
  private notifier: NotificationModule

  constructor(notesService: NotesService, notifier: NotificationModule) {
    this.notesService = notesService
    this.notifier = notifier
  }

  private notifyError(res: AppError) {
    this.notifier.notify('error', res.message)
  }

  async getAll(
    params?: GetAllParams,
  ): Promise<AppSuccess<PaginateResult<Note>> | AppError> {
    const res = await this.notesService.getAll(params)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }

  async create(dto: CreateNoteDTO): Promise<AppSuccess<Note> | AppError> {
    const res = await this.notesService.create(dto)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }

  async getOne(id: number): Promise<AppSuccess<Note> | AppError> {
    const res = await this.notesService.getOne(id)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }

  async update(
    id: number,
    dto: UpdateNoteDTO,
  ): Promise<AppSuccess<Note> | AppError> {
    const res = await this.notesService.update(id, dto)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }

  async delete(id: number): Promise<AppSuccess<null> | AppError> {
    const res = await this.notesService.delete(id)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }
}

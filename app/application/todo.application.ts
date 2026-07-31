import { AppError } from '~/types/app-errors'
import type {
  AppSuccess,
  GetAllParams,
  PaginateResult,
} from '~/types/app.types'
import type {
  CreateTodoDTO,
  CreateTodoResponse,
  ReplaceTodoDTO,
  Todo,
  UpdateTodoDTO,
} from '~/types/todo'
import type { ID } from '~/types/general'
import type { TodoService } from './services/todo.service'
import type { NotificationModule } from './modules/notification/notification.module'

export class TodoApplication {
  private todoService: TodoService
  private notifier: NotificationModule

  constructor(todoService: TodoService, notifier: NotificationModule) {
    this.todoService = todoService
    this.notifier = notifier
  }

  private notifyError(res: AppError) {
    this.notifier.notify('error', res.message)
  }

  async create(
    dto: CreateTodoDTO,
  ): Promise<AppSuccess<CreateTodoResponse> | AppError> {
    const res = await this.todoService.create(dto)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }

  async getAll(
    params?: GetAllParams,
  ): Promise<PaginateResult<Todo> | AppError> {
    const res = await this.todoService.getAll(params)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }

  async getOne(id: ID): Promise<AppSuccess<Todo> | AppError> {
    const res = await this.todoService.getOne(id)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }

  async replace(id: ID, dto: ReplaceTodoDTO): Promise<undefined | AppError> {
    const res = await this.todoService.replace(id, dto)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }

  async update(id: ID, dto: UpdateTodoDTO): Promise<undefined | AppError> {
    const res = await this.todoService.update(id, dto)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }

  async delete(id: ID): Promise<undefined | AppError> {
    const res = await this.todoService.delete(id)
    if (res instanceof AppError) this.notifyError(res)
    return res
  }
}

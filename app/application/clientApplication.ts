import EventEmitter from 'eventemitter3'
import type {
  CreateTodoDTO,
  ReplaceTodoDTO,
  Todo,
  UpdateTodoDTO,
} from '~/types/todo'
import type { TodoService } from '~/application/services/shared/todo.service'
import type { ID } from '~/types/general'
import { AppError, AppRateLimitError, AppSilentError } from '~/types/app-errors'

import {
  AppSuccess,
  type BaseApplication,
  type GetAllParams,
  type PaginateResult,
  type StatisticDTO,
} from '~/types/app.types'
import type { AuthService } from '~/application/services/shared/auth.service'
import type {
  AuthResponse,
  ForgotPasswordDto,
  ResendConfirmEmailDto,
  SignInDto,
  SignUpDto,
} from '~/types/auth'
import type { StatisticService } from './services/client/statistic.service'
import type { Profile, ProfileDTO } from '~/types/user.types'
import type { UserService } from './services/shared/user.service'
import type { NotificationService } from './services/client/notification.service'
import type { NotesService } from './services/shared/note.service'
import type { CreateNoteDTO, Note, UpdateNoteDTO } from '~/types/note'
import type { ISyncModule } from '~/types/sync'
import { Logger } from '~/lib/logger'
import type { BaseEventTypes } from '~/types/events'

export interface ClientEventTypes extends BaseEventTypes {
  'auth:login': []
  'auth:logout': []
  'data:loading': [isLoading: boolean]
}

export class ClientApplication implements BaseApplication {
  private ee = new EventEmitter<ClientEventTypes>()
  private todoService: TodoService
  private notesService: NotesService
  private authService: AuthService
  private userService: UserService
  private statisticService: StatisticService
  private readonly accessToken: Ref<string | null | undefined>
  private logger = new Logger('Application')
  resolveProfileLoading: (() => void) | null = null
  profileLoading: Promise<void> = Promise.resolve()
  private readonly syncModule: ISyncModule

  notificationService: NotificationService

  appLoading: Promise<void>
  private resolveApp!: () => void

  constructor(
    todoService: TodoService,
    notesService: NotesService,
    authService: AuthService,
    userService: UserService,
    statisticService: StatisticService,
    notificationService: NotificationService,
    syncModule: ISyncModule,
    accessToken: Ref<string | null | undefined>,
  ) {
    this.todoService = todoService
    this.notesService = notesService
    this.authService = authService
    this.userService = userService
    this.statisticService = statisticService
    this.notificationService = notificationService
    this.accessToken = accessToken
    this.syncModule = syncModule
    this.syncModule.on('profile:loaded', (res: any) => {
      this.ee.emit('profile:loaded', res)
    })
    this.syncModule.on('logout', () => {
      this.ee.emit('auth:logout')
    })
    this.appLoading = new Promise((resolve) => {
      this.resolveApp = resolve
    })
  }

  public on<T extends EventEmitter.EventNames<ClientEventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<ClientEventTypes, T>,
    context?: unknown,
  ): EventEmitter<ClientEventTypes> {
    return this.ee.on(event, fn, context)
  }

  public off<T extends EventEmitter.EventNames<ClientEventTypes>>(
    event: T,
    fn?: EventEmitter.EventListener<ClientEventTypes, T>,
    context?: unknown,
    once?: boolean,
  ): EventEmitter<ClientEventTypes> {
    return this.ee.off(event, fn, context, once)
  }

  public async getProfile(): Promise<
    AppError | AppSilentError | AppSuccess<Profile>
  > {
    this.profileLoading = new Promise((resolve) => {
      this.resolveProfileLoading = resolve
    })
    const res = await this.userService.getProfile()

    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    if (res instanceof AppSilentError) {
      this.notificationService.notify('info', res.message)
    }
    if (res instanceof AppSuccess) {
      this.ee.emit('profile:loaded', res.data)
      this.syncModule.emit('profile:loaded', res.data)
    }
    this.resolveProfileLoading?.()
    return res
  }

  async signIn(dto: SignInDto): Promise<void | AppError> {
    const res = await this.authService.authorization(dto)
    if (res instanceof AppSuccess) {
      const access_token = res.data.access_token
      this.accessToken.value = access_token
      this.syncModule.emit('login', access_token)
    }
    if (res instanceof AppError) {
      this.logger.warn(`Sign in failed: ${res.message}`)
      this.notificationService.notify('error', res.message)

      return res
    }
    const profile = await this.getProfile()
    if (profile instanceof AppSuccess) {
      this.logger.log('User signed in')
      this.ee.emit('auth:login')
    }
  }

  async signUp(dto: SignUpDto): Promise<void | AppError> {
    const res = await this.authService.registration(dto)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)

      return res
    }
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<void | AppRateLimitError> {
    const res = await this.authService.forgotPassword(dto)
    if (res instanceof AppRateLimitError) {
      this.notificationService.notify('error', res.message)

      return res
    }
  }

  async resendConfirmEmail(
    dto: ResendConfirmEmailDto,
  ): Promise<void | AppRateLimitError> {
    const res = await this.authService.resendConfirmEmail(dto)
    if (res instanceof AppRateLimitError) {
      this.notificationService.notify('error', res.message)
      return res
    }
  }

  async updateProfile(dto: ProfileDTO): Promise<AppSuccess<null> | AppError> {
    const res = await this.userService.updateProfile(dto)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }

    return res
  }

  async logout(): Promise<void | AppError> {
    const res = await this.authService.logout()
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)

      return res
    }
    // TODO: also return AppSuccess
    this.logger.log('User logged out')
    this.ee.emit('auth:logout')
  }

  public async createTodo(dto: CreateTodoDTO): Promise<ID | AppError> {
    const res = await this.todoService.create(dto)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }

    return res
  }

  public async getAllTodos(
    params?: GetAllParams,
  ): Promise<PaginateResult<Todo> | AppError> {
    this.ee.emit('data:loading', true)
    const res = await this.todoService.getAll(params)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    // this.ee.emit('todo:loaded', res)
    this.ee.emit('data:loading', false)
    return res
  }

  public async getOneTodo(id: ID): Promise<AppSuccess<Todo> | AppError> {
    const res = await this.todoService.getOne(id)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    return res
  }

  public async replaceTodo(
    id: ID,
    dto: ReplaceTodoDTO,
  ): Promise<void | AppError> {
    const res = await this.todoService.replace(id, dto)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }

    return res
  }

  public async updateTodo(
    id: ID,
    dto: UpdateTodoDTO,
  ): Promise<void | AppError> {
    const res = await this.todoService.update(id, dto)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    return res
  }

  public async deleteTodo(id: ID): Promise<void | AppError> {
    const res = await this.todoService.delete(id)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    return res
  }

  async saveStatistic(dto: StatisticDTO): Promise<void | AppError> {
    const res = await this.statisticService.save(dto)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    return res
  }

  public async getAllNotes(
    params?: GetAllParams,
  ): Promise<AppSuccess<PaginateResult<Note>> | AppError> {
    const res = await this.notesService.getAll(params)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    return res
  }

  public async createNote(
    dto: CreateNoteDTO,
  ): Promise<AppSuccess<Note> | AppError> {
    const res = await this.notesService.create(dto)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    return res
  }

  public async getOneNote(id: number): Promise<AppSuccess<Note> | AppError> {
    const res = await this.notesService.getOne(id)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    return res
  }

  public async updateNote(
    id: number,
    dto: UpdateNoteDTO,
  ): Promise<AppSuccess<Note> | AppError> {
    const res = await this.notesService.update(id, dto)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    return res
  }

  public async deleteNote(id: number): Promise<AppSuccess<null> | AppError> {
    const res = await this.notesService.delete(id)
    if (res instanceof AppError) {
      this.notificationService.notify('error', res.message)
    }
    return res
  }

  public async refresh(): Promise<AppSuccess<AuthResponse> | AppError> {
    const res = await this.authService.refresh()
    if (res instanceof AppSuccess) {
      const access_token = res.data.access_token
      this.accessToken.value = access_token
    }
    return res
  }

  async init() {
    this.logger.log('Initializing')
    this.resolveApp()
    this.logger.log('Ready')
  }
}

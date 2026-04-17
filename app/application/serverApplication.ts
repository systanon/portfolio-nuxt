import EventEmitter from 'eventemitter3'
import type { Todo } from '~/types/todo'
import type { TodoService } from '~/application/services/shared/todo.service'
import type { ID } from '~/types/general'
import { AppError, AppRateLimitError, AppSilentError } from '~/types/app-errors'

import {
  AppSuccess,
  type BaseApplication,
  type GetAllParams,
  type PaginateResult,
} from '~/types/app.types'
import type { AuthService } from '~/application/services/shared/auth.service'
import type {
  AuthResponse,
  ForgotPasswordDto,
  ResendConfirmEmailDto,
  SignInDto,
  SignUpDto,
} from '~/types/auth'
import type { Profile, ProfileDTO } from '~/types/user.types'
import type { UserService } from './services/shared/user.service'
import type { NotesService } from './services/shared/note.service'
import type { Note } from '~/types/note'
import { Logger } from '~/lib/logger'
import type { BaseEventTypes } from '~/types/events'

export class ServerApplication implements BaseApplication {
  private ee = new EventEmitter<BaseEventTypes>()
  private todoService: TodoService
  private notesService: NotesService
  private authService: AuthService
  private userService: UserService
  private readonly accessToken: Ref<string | null | undefined>
  private logger = new Logger('Application')
  resolveProfileLoading: (() => void) | null = null
  profileLoading: Promise<void> = Promise.resolve()
  constructor(
    todoService: TodoService,
    notesService: NotesService,
    authService: AuthService,
    userService: UserService,
    accessToken: Ref<string | null | undefined>,
  ) {
    this.todoService = todoService
    this.notesService = notesService
    this.authService = authService
    this.userService = userService
    this.accessToken = accessToken
  }

  public on<T extends EventEmitter.EventNames<BaseEventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<BaseEventTypes, T>,
    context?: unknown,
  ): EventEmitter<BaseEventTypes> {
    return this.ee.on(event, fn, context)
  }

  public off<T extends EventEmitter.EventNames<BaseEventTypes>>(
    event: T,
    fn?: EventEmitter.EventListener<BaseEventTypes, T>,
    context?: unknown,
    once?: boolean,
  ): EventEmitter<BaseEventTypes> {
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
    }
    if (res instanceof AppSilentError) {
    }
    if (res instanceof AppSuccess) {
      this.ee.emit('profile:loaded', res.data)
    }
    this.resolveProfileLoading?.()
    return res
  }

  async logout(): Promise<void | AppError> {
    const res = await this.authService.logout()
    if (res instanceof AppError) {
      return res
    }
    // TODO: also return AppSuccess
    this.logger.log('User logged out')
    this.ee.emit('auth:logout')
  }

  public async getAllTodos(
    params?: GetAllParams,
  ): Promise<PaginateResult<Todo> | AppError> {
    this.ee.emit('data:loading', true)
    const res = await this.todoService.getAll(params)
    // this.ee.emit('todo:loaded', res)
    this.ee.emit('data:loading', false)
    return res
  }

  public async getOneTodo(id: ID): Promise<AppSuccess<Todo> | AppError> {
    return this.todoService.getOne(id)
  }

  public async getAllNotes(
    params?: GetAllParams,
  ): Promise<AppSuccess<PaginateResult<Note>> | AppError> {
    return this.notesService.getAll(params)
  }

  public async getOneNote(id: number): Promise<AppSuccess<Note> | AppError> {
    return this.notesService.getOne(id)
  }

  public async refresh(): Promise<AppSuccess<AuthResponse> | AppError> {
    const res = await this.authService.refresh()
    if (res instanceof AppSuccess) {
      const access_token = res.data.access_token
      this.accessToken.value = access_token
    }
    return res
  }
}

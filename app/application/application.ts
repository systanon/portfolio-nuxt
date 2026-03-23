import EventEmitter from 'eventemitter3'
import type {
  CreateTodoDTO,
  ReplaceTodoDTO,
  Todo,
  UpdateTodoDTO,
} from '~/types/todo'
import type { TodoService } from '~/application/services/todo.service'
import type { ID } from '~/types/general'
import { AppError, AppRateLimitError, AppSilentError } from '~/types/app-errors'

import {
  AppSuccess,
  type GetAllParams,
  type PaginateResult,
  type StatisticDTO,
} from '~/types/app.types'
import type { AuthService } from '~/application/services/auth.service'
import type {
  ForgotPasswordDto,
  ResendConfirmEmailDto,
  SignInDto,
  SignUpDto,
} from '~/types/auth'
import type { StatisticService } from './services/statistic.service'
import type { Profile, ProfileDTO } from '~/types/user.types'
import type { WSHandler } from '~/lib/ws.client'
import type { UserService } from './services/user.service'

export class Application<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
  EventContext extends any = any,
> {
  #ee: EventEmitter = new EventEmitter()
  #todoService: TodoService
  #authService: AuthService
  #userService: UserService
  #statisticService: StatisticService
  resolveProfileLoading: (() => void) | null = null
  profileLoading: Promise<void> = Promise.resolve()

  appLoading: Promise<void>
  #resolveApp!: () => void

  constructor(
    todoService: TodoService,
    authService: AuthService,
    userService: UserService,
    statisticService: StatisticService,
  ) {
    this.#todoService = todoService
    this.#authService = authService
    this.#userService = userService
    this.#statisticService = statisticService
    this.appLoading = new Promise((resolve) => {
      this.#resolveApp = resolve
    })
  }

  public on<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>,
    context?: EventContext,
  ): EventEmitter {
    return this.#ee.on(event, fn, context)
  }

  public off<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn?: EventEmitter.EventListener<EventTypes, T>,
    context?: EventContext,
    once?: boolean,
  ): EventEmitter {
    return this.#ee.off(event, fn, context, once)
  }

  public async getProfile(): Promise<
    AppError | AppSilentError | AppSuccess<Profile>
  > {
    this.profileLoading = new Promise((resolve) => {
      this.resolveProfileLoading = resolve
    })
    const res = await this.#userService.getProfile()

    if (res instanceof AppError) {
      //TODO: handle error (e.g. show notification)
    }
    if (res instanceof AppSilentError) {
      //TODO: handle silent error (e.g. show notification)
    }
    if (res instanceof AppSuccess) {
      this.#ee.emit('profile:loaded', res.data)
    }
    this.resolveProfileLoading?.()
    return res
  }

  async signIn(dto: SignInDto): Promise<void | AppError> {
    const res = await this.#authService.authorization(dto)
    if (res instanceof AppError) {
      return res
    }
    const profile = await this.getProfile()
    if (profile instanceof AppSuccess) {
      this.#ee.emit('auth:login')
    }
  }

  async signUp(dto: SignUpDto): Promise<void | AppError> {
    const res = await this.#authService.registration(dto)
    if (res instanceof AppError) {
      return res
    }
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<void | AppRateLimitError> {
    const res = await this.#authService.forgotPassword(dto)
    if (res instanceof AppRateLimitError) {
      return res
    }
  }

  async resendConfirmEmail(
    dto: ResendConfirmEmailDto,
  ): Promise<void | AppRateLimitError> {
    const res = await this.#authService.resendConfirmEmail(dto)
    if (res instanceof AppRateLimitError) {
      return res
    }
  }

  async updateProfile(dto: ProfileDTO): Promise<AppSuccess<null> | AppError> {
    const res = await this.#userService.updateProfile(dto)
    return res
  }

  async logout(): Promise<void | AppError> {
    const res = await this.#authService.logout()
    if (res instanceof AppError) {
      return res
    }
    this.#ee.emit('auth:logout')
  }

  public async createTodo(dto: CreateTodoDTO): Promise<ID | AppError> {
    const res = await this.#todoService.create(dto)
    return res
  }

  public async getAllTodos(
    params?: GetAllParams,
  ): Promise<PaginateResult<Todo> | AppError> {
    this.#ee.emit('data:loading', true)
    const res = await this.#todoService.getAll(params)
    this.#ee.emit('todo:loaded', res)
    this.#ee.emit('data:loading', false)
    return res
  }

  public async getOneTodo(id: ID): Promise<Todo | AppError> {
    const res = await this.#todoService.getOne(id)
    return res
  }

  public async replaceTodo(
    id: ID,
    dto: ReplaceTodoDTO,
  ): Promise<void | AppError> {
    const res = await this.#todoService.replace(id, dto)
    return res
  }

  public async updateTodo(
    id: ID,
    dto: UpdateTodoDTO,
  ): Promise<void | AppError> {
    const res = await this.#todoService.update(id, dto)
    return res
  }

  public async deleteTodo(id: ID): Promise<void | AppError> {
    const res = await this.#todoService.delete(id)
    return res
  }

  async saveStatistic(dto: StatisticDTO): Promise<void | AppError> {
    const res = await this.#statisticService.save(dto)
    return res
  }

  async init() {
    await this.#resolveApp()
  }

  subscribe<T = any>(topic: string, handler: WSHandler<T>) {
    return this.#todoService.subscribe(topic, handler)
  }
}

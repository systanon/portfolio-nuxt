import EventEmitter from 'eventemitter3'
import type {
  CreateTodoDTO,
  ReplaceTodoDTO,
  Todo,
  UpdateTodoDTO,
} from '~/types/todo'
import type { TodoService } from '~/services/todo.service'
import type { ID } from '~/types/general'
import { AppError, AppSilentError } from '~/types/app-errors'

import {
  AppSuccess,
  type GetAllParams,
  type PaginateResult,
} from '~/types/app.types'
import type { AuthService } from '~/services/auth.service'
import type { AuthResponse, SignInDto, SignUpDto } from '~/types/auth'

export class Application<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
  EventContext extends any = any,
> {
  #ee: EventEmitter = new EventEmitter()
  #todoService: TodoService
  #authService: AuthService
  resolveProfileLoading: (() => void) | null = null
  profileLoading: Promise<void> = Promise.resolve()

  constructor(todoService: TodoService, authService: AuthService) {
    this.#todoService = todoService
    this.#authService = authService
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

  public async getProfile(): Promise<void> {
    this.profileLoading = new Promise((resolve) => {
      this.resolveProfileLoading = resolve
    })
    const res = await this.#authService.getProfile()

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
  }

  async signIn(dto: SignInDto): Promise<void | AppError> {
    const res = await this.#authService.authorization(dto)
    if (res instanceof AppError) {
      return res
    }
  }
  async signUp(dto: SignUpDto): Promise<void | AppError> {
    const res = await this.#authService.registration(dto)
    if (res instanceof AppError) {
      return res
    }
  }

  async refresh(): Promise<AppSuccess<AuthResponse> | AppError> {
    const res = await this.#authService.refresh()
    return res
  }

  public async createTodo(dto: CreateTodoDTO): Promise<ID | AppError> {
    const res = await this.#todoService.create(dto)
    return res
  }

  public async getAllTodos(
    params?: GetAllParams,
  ): Promise<PaginateResult<Todo> | AppError> {
    const res = await this.#todoService.getAll(params)
    this.#ee.emit('todo:loaded', res)
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
}

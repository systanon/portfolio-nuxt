import { ref, type Ref } from 'vue'
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
import type { AuthResponse, SignInDto } from '~/types/auth'

export class Application<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
  EventContext extends any = any,
> {
  #ee: EventEmitter = new EventEmitter()
  #todoService: TodoService
  #authService: AuthService
  #loading: Ref<boolean> = ref(false)
  private _pageTitle: Ref<string | null> = ref(null)
  resolveProfileLoading: (() => void) | null = null
  profileLoading: Promise<void> = Promise.resolve()

  constructor(todoService: TodoService, authService: AuthService) {
    this.#todoService = todoService
    this.#authService = authService
  }

  public get loading(): boolean {
    return this.#loading.value
  }

  public get pageTitle() {
    return this._pageTitle.value
  }

  public setPageTitle(title: string) {
    this._pageTitle.value = title
  }

  public clearPageTitle() {
    this._pageTitle.value = null
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
      //TODO: handle success (e.g. set user profile in the state)
    }

    this.resolveProfileLoading?.()
  }

  async signIn(dto: SignInDto): Promise<void | AppError> {
    const res = await this.#authService.authorization(dto)
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
    this.#loading.value = true
    const res = await this.#todoService.getAll(params)
    this.#loading.value = false
    return res
  }

  public async getOneTodo(id: ID): Promise<Todo | AppError> {
    const res = await this.#todoService.getOne(id)
    if (!(res instanceof AppError)) {
      this.setPageTitle(res.title)
    }
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

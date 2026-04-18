import { AppError } from '~/types/app-errors'
import {
  AppSuccess,
  type GetAllParams,
  type PaginateResult,
} from '~/types/app.types'

import { eventBus } from '~/utils/event-bus'
import type { Todo, UpdateTodoDTO } from '~/types/todo'
import type { ID } from '~/types/general'

export const useTodos = () => {
  const { $api } = useNuxtApp()
  const { notify } = useNotification()

  const getAll = async (
    params?: GetAllParams,
  ): Promise<PaginateResult<Todo> | AppError> => {
    eventBus.emit('data:loading', true)
    const res = await $api.todo.getAll(params)
    if (res instanceof AppError) {
      notify('error', res.message)
    }
    // eventBus.emit('todo:loaded', res)
    eventBus.emit('data:loading', false)
    return res
  }

  const getOne = async (id: ID): Promise<AppSuccess<Todo> | AppError> => {
    const res = await $api.todo.getOne(id)
    if (res instanceof AppError) {
      notify('error', res.message)
    }
    return res
  }

  const update = async (
    id: ID,
    dto: UpdateTodoDTO,
  ): Promise<void | AppError> => {
    const res = await $api.todo.update(id, dto)
    if (res instanceof AppError) {
      notify('error', res.message)
    }
    return res
  }

  const remove = async (id: ID): Promise<void | AppError> => {
    const res = await $api.todo.delete(id)
    if (res instanceof AppError) {
      notify('error', res.message)
    }
    return res
  }

  return {
    getAll,
    getOne,
    update,
    remove,
  }
}

import type { WSMessage } from '~/lib/ws.client'
import { AppError } from '~/types/app-errors'
import type { GetAllParams } from '~/types/app.types'
import type { CreateTodoDTO, Todo, UpdateTodoDTO } from '~/types/todo'

export const useTodoStore = defineStore('todos', () => {
  const { $ws } = useNuxtApp()
  const app = useApp()

  const rows: Ref<Todo[]> = ref([])
  const indexID = ref(new Map<number, Todo>())
  const total = ref<number>(0)
  const pages = ref<number>(0)
  let currentPage = 0

  function messageHandler(message: WSMessage) {
    switch (message.event) {
      case 'create':
        _create(message.data)
        break
      case 'update':
        _update(message.data)
        break
      case 'delete':
        _delete(message.data)
        break
    }
  }

  async function getAll(params?: GetAllParams) {
    try {
      const {
        data,
        total: _total,
        pages: _pages,
      } = await app.getAllTodos(params)

      rows.value = data.map((todo) => {
        indexID.value.set(todo.id, todo)
        return todo
      })
      total.value = _total
      pages.value = _pages
      currentPage = params?.page ?? 1
    } catch (error) {
      rows.value = []
      indexID.value = new Map()
      total.value = 0
      pages.value = 0
    }
  }

  function _update(todo: Todo): void {
    const _todo = indexID.value.get(todo.id)
    if (!_todo) {
      return
    }
    Object.assign(_todo, todo)
  }

  function _create(todo: Todo): void {
    indexID.value.set(todo.id, todo)
    if (currentPage === 1) {
      rows.value.unshift(todo)
    }
    total.value++
  }

  function _delete(id: number): void {
    const _todo = indexID.value.get(id)
    if (!_todo) {
      return
    }
    rows.value = rows.value.filter(({ id }) => id !== _todo.id)
    indexID.value.delete(_todo.id)
  }

  async function create(payload: CreateTodoDTO): Promise<AppError | void> {
    const res = await app.createTodo(payload)
    if (res instanceof AppError) {
      return res
    }
  }

  async function update(
    _id: number,
    payload: UpdateTodoDTO,
  ): Promise<AppError | void> {
    const res = await app.updateTodo(_id, payload)
    if (res instanceof AppError) {
      return res
    }
  }

  async function remove(id: number): Promise<AppError | void> {
    const res = await app.deleteTodo(id)
    if (res instanceof AppError) {
      return res
    }
  }

  function initWS() {
    $ws.subscribe('todos', messageHandler)
  }

  function destroyWS() {
    $ws.unsubscribe('todos', messageHandler)
  }

  return {
    getAll,
    indexID,
    update,
    create,
    remove,
    total,
    pages,
    rows,
    initWS,
    destroyWS,
  }
})

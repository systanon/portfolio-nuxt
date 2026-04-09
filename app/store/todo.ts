import type { WSMessage } from '~/lib/ws.client'
import { AppError } from '~/types/app-errors'
import type { GetAllParams } from '~/types/app.types'
import type { CreateTodoDTO, Todo, UpdateTodoDTO } from '~/types/todo'
import { PAGINATION_CONFIG } from '~/constants/pagination'

export const useTodoStore = defineStore('todos', () => {
  const app = useApp()
  const wsClient = useWsClient()

  const rows: Ref<Todo[]> = ref([])
  const currentTodo: Ref<Todo | null> = ref(null)
  const indexID = ref(new Map<number, Todo>())
  const total = ref<number>(0)
  const pages = ref<number>(0)
  let unsubscribe: (() => void) | null = null
  let currentPage = 0
  let currentPerPage = 0

  function messageHandler(message: WSMessage<Todo | number>) {
    switch (message.event) {
      case 'create':
        _create(message.data as Todo)
        break
      case 'update':
        _update(message.data as Todo)
        break
      case 'delete':
        _delete(message.data as number)
        break
    }
  }

  async function getAll(params?: GetAllParams) {
    const res = await app.getAllTodos(params)

    if (res instanceof AppError) {
      rows.value = []
      indexID.value = new Map()
      total.value = 0
      pages.value = 0
    } else {
      rows.value =
        res.data?.map((todo) => {
          indexID.value.set(todo.id, todo)
          return todo
        }) ?? []
      total.value = res.total
      pages.value = res.pages
      currentPage = params?.page ?? 1
      currentPerPage = params?.perPage ?? PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
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
    if (indexID.value.has(todo.id)) return

    indexID.value.set(todo.id, todo)
    if (currentPage === 1) {
      rows.value.unshift(todo)
      rows.value = rows.value.slice(0, currentPerPage)
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
    total.value--
    pages.value = Math.ceil(total.value / currentPerPage)
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
    unsubscribe = wsClient.subscribe('todos', messageHandler)
  }

  function destroyWS() {
    unsubscribe?.()
  }

  function setCurrentTodo(todo: Todo | null) {
    currentTodo.value = todo
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
    currentTodo,
    setCurrentTodo,
    destroyWS,
  }
})

import { AppError } from '@/types/app-errors'
import type { CreateNoteDTO, Note, UpdateNoteDTO } from '~/types/note'
import type { GetAllParams } from '@/types/app.types'
import { PAGINATION_CONFIG } from '~/constants/pagination'
import type { WSMessage } from '~/application/services/client/ws.service'

export const useNoteStore = defineStore('notes', () => {
  const application = useApp()
  const rows: Ref<Note[]> = ref([])
  const indexID = ref(new Map<number, Note>())
  const total = ref<number>(0)
  const pages = ref<number>(0)
  let unsubscribe: (() => void) | null = null
  let currentPage = 0
  let currentPerPage = 0

  const messageHandler = function messageHandler(
    message: WSMessage<Note | number>,
  ) {
    switch (message.event) {
      case 'create':
        _create(message.data as Note)
        break
      case 'update':
        _update(message.data as Note)
        break
      case 'delete':
        _delete(message.data as number)
        break
    }
  }

  async function getAll(params: GetAllParams) {
    const res = await application.getAllNotes(params)

    if (res instanceof AppError) {
      rows.value = []
      indexID.value = new Map()
      total.value = 0
      pages.value = 0
    } else {
      const { data = [], total: _total, pages: _pages } = res.data
      rows.value = data.map((note) => {
        indexID.value.set(note.id, note)
        return note
      })
      total.value = _total
      pages.value = _pages
      currentPage = params.page ?? 1
      currentPerPage = params.perPage ?? PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
    }
  }

  function _update(note: Note): void {
    const _note = indexID.value.get(note.id)
    if (!_note) {
      return
    }
    Object.assign(_note, note)
  }

  function _create(note: Note): void {
    if (indexID.value.has(note.id)) return

    indexID.value.set(note.id, note)
    if (currentPage === 1) {
      rows.value.unshift(note)
      rows.value = rows.value.slice(0, currentPerPage)
    }
    total.value++
  }

  function _delete(id: number): void {
    const _note = indexID.value.get(id)
    if (!_note) {
      return
    }
    rows.value = rows.value.filter(({ id }) => id !== _note.id)
    indexID.value.delete(_note.id)
    total.value--
    pages.value = Math.ceil(total.value / currentPerPage)
  }

  async function update(_id: number, payload: UpdateNoteDTO) {
    const res = await useClientApp().updateNote(_id, payload)
    if (res instanceof AppError) {
      return res
    }
  }

  async function create(payload: CreateNoteDTO) {
    const res = await useClientApp().createNote(payload)
    if (res instanceof AppError) {
      return res
    }
  }

  async function remove(id: number) {
    const res = await useClientApp().deleteNote(id)
    if (res instanceof AppError) {
      return res
    }
  }

  function initWS() {
    unsubscribe = useWsService().subscribe('notes', messageHandler)
  }

  function destroyWS() {
    unsubscribe?.()
  }

  return {
    getAll,
    rows,
    indexID,
    update,
    create,
    remove,
    total,
    pages,
    initWS,
    destroyWS,
    messageHandler,
  }
})

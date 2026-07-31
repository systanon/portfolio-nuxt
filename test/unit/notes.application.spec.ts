/// <reference types="node" />
import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { NotesApplication } from '../../app/application/notes.application'
import { NotificationModule } from '../../app/application/modules/notification/notification.module'
import { AppError } from '../../app/types/app-errors'
import { AppSuccess } from '../../app/types/app.types'
import type { NotesService } from '../../app/application/services/note.service'
import type { CreateNoteDTO, UpdateNoteDTO } from '../../app/types/note'

describe('NotesApplication', () => {
  let notifier: NotificationModule

  beforeEach(() => {
    notifier = new NotificationModule()
  })

  afterEach(() => {
    notifier.clear()
  })

  function expectNoNotify() {
    assert.strictEqual(notifier.notifications.size, 0)
  }

  function expectNotifiedError(message: string) {
    assert.strictEqual(notifier.notifications.size, 1)
    const [n] = [...notifier.notifications.values()]
    assert.strictEqual(n.type, 'error')
    assert.strictEqual(n.message, message)
  }

  describe('getAll', () => {
    it('returns AppSuccess without notifying', async () => {
      const success = new AppSuccess(
        { data: [], total: 0, pages: 0 },
        new Headers(),
      )
      const service = { getAll: async () => success } as unknown as NotesService
      const app = new NotesApplication(service, notifier)

      const result = await app.getAll()

      assert.strictEqual(result, success)
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('list failed')
      const service = { getAll: async () => err } as unknown as NotesService
      const app = new NotesApplication(service, notifier)

      const result = await app.getAll({ page: 1 })

      assert.strictEqual(result, err)
      expectNotifiedError('list failed')
    })
  })

  describe('create', () => {
    const dto: CreateNoteDTO = { title: 'title', description: 'desc' }

    it('forwards the dto and returns AppSuccess without notifying', async () => {
      const success = new AppSuccess({ id: 1 }, new Headers())
      const calls: unknown[] = []
      const service = {
        create: async (arg: CreateNoteDTO) => {
          calls.push(arg)
          return success
        },
      } as unknown as NotesService
      const app = new NotesApplication(service, notifier)

      const result = await app.create(dto)

      assert.strictEqual(result, success)
      assert.deepStrictEqual(calls, [dto])
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('create failed')
      const service = { create: async () => err } as unknown as NotesService
      const app = new NotesApplication(service, notifier)

      const result = await app.create(dto)

      assert.strictEqual(result, err)
      expectNotifiedError('create failed')
    })
  })

  describe('getOne', () => {
    it('returns AppSuccess without notifying', async () => {
      const success = new AppSuccess({ id: 1 }, new Headers())
      const service = { getOne: async () => success } as unknown as NotesService
      const app = new NotesApplication(service, notifier)

      const result = await app.getOne(1)

      assert.strictEqual(result, success)
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('not found')
      const service = { getOne: async () => err } as unknown as NotesService
      const app = new NotesApplication(service, notifier)

      const result = await app.getOne(999)

      assert.strictEqual(result, err)
      expectNotifiedError('not found')
    })
  })

  describe('update', () => {
    const dto: UpdateNoteDTO = { title: 'new title' }

    it('returns AppSuccess without notifying', async () => {
      const success = new AppSuccess({ id: 1 }, new Headers())
      const service = { update: async () => success } as unknown as NotesService
      const app = new NotesApplication(service, notifier)

      const result = await app.update(1, dto)

      assert.strictEqual(result, success)
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('update failed')
      const service = { update: async () => err } as unknown as NotesService
      const app = new NotesApplication(service, notifier)

      const result = await app.update(1, dto)

      assert.strictEqual(result, err)
      expectNotifiedError('update failed')
    })
  })

  describe('delete', () => {
    it('returns AppSuccess without notifying', async () => {
      const success = new AppSuccess(null, new Headers())
      const service = { delete: async () => success } as unknown as NotesService
      const app = new NotesApplication(service, notifier)

      const result = await app.delete(1)

      assert.strictEqual(result, success)
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('delete failed')
      const service = { delete: async () => err } as unknown as NotesService
      const app = new NotesApplication(service, notifier)

      const result = await app.delete(1)

      assert.strictEqual(result, err)
      expectNotifiedError('delete failed')
    })
  })
})

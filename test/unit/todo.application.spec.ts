/// <reference types="node" />
import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { TodoApplication } from '../../app/application/todo.application'
import { NotificationModule } from '../../app/application/modules/notification/notification.module'
import { AppError } from '../../app/types/app-errors'
import { AppSuccess } from '../../app/types/app.types'
import type { TodoService } from '../../app/application/services/todo.service'
import type {
  CreateTodoDTO,
  ReplaceTodoDTO,
  UpdateTodoDTO,
} from '../../app/types/todo'

describe('TodoApplication', () => {
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

  describe('create', () => {
    const dto: CreateTodoDTO = { title: 'title', description: 'desc' }

    it('forwards the dto and returns AppSuccess without notifying', async () => {
      const success = new AppSuccess({ id: 1 }, new Headers())
      const calls: unknown[] = []
      const service = {
        create: async (arg: CreateTodoDTO) => {
          calls.push(arg)
          return success
        },
      } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.create(dto)

      assert.strictEqual(result, success)
      assert.deepStrictEqual(calls, [dto])
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('create failed')
      const service = { create: async () => err } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.create(dto)

      assert.strictEqual(result, err)
      expectNotifiedError('create failed')
    })
  })

  describe('getAll', () => {
    it('returns the paginated result without notifying', async () => {
      const success = { data: [], total: 0, pages: 0 }
      const service = { getAll: async () => success } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.getAll()

      assert.strictEqual(result, success)
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('list failed')
      const service = { getAll: async () => err } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.getAll({ page: 1 })

      assert.strictEqual(result, err)
      expectNotifiedError('list failed')
    })
  })

  describe('getOne', () => {
    it('returns AppSuccess without notifying', async () => {
      const success = new AppSuccess({ id: 1 }, new Headers())
      const service = { getOne: async () => success } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.getOne(1)

      assert.strictEqual(result, success)
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('not found')
      const service = { getOne: async () => err } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.getOne(999)

      assert.strictEqual(result, err)
      expectNotifiedError('not found')
    })
  })

  describe('replace', () => {
    const dto: ReplaceTodoDTO = {
      title: 't',
      description: 'd',
      completed: false,
    }

    it('returns undefined without notifying on success', async () => {
      const service = {
        replace: async () => undefined,
      } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.replace(1, dto)

      assert.strictEqual(result, undefined)
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('replace failed')
      const service = { replace: async () => err } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.replace(1, dto)

      assert.strictEqual(result, err)
      expectNotifiedError('replace failed')
    })
  })

  describe('update', () => {
    const dto: UpdateTodoDTO = { completed: true }

    it('returns undefined without notifying on success', async () => {
      const service = {
        update: async () => undefined,
      } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.update(1, dto)

      assert.strictEqual(result, undefined)
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('update failed')
      const service = { update: async () => err } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.update(1, dto)

      assert.strictEqual(result, err)
      expectNotifiedError('update failed')
    })
  })

  describe('delete', () => {
    it('returns undefined without notifying on success', async () => {
      const service = {
        delete: async () => undefined,
      } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.delete(1)

      assert.strictEqual(result, undefined)
      expectNoNotify()
    })

    it('notifies "error" and returns the AppError on failure', async () => {
      const err = new AppError('delete failed')
      const service = { delete: async () => err } as unknown as TodoService
      const app = new TodoApplication(service, notifier)

      const result = await app.delete(1)

      assert.strictEqual(result, err)
      expectNotifiedError('delete failed')
    })
  })
})

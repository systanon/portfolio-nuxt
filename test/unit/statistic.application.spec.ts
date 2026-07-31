/// <reference types="node" />
import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { StatisticApplication } from '../../app/application/statistic.application'
import { NotificationModule } from '../../app/application/modules/notification/notification.module'
import { AppError } from '../../app/types/app-errors'
import type { StatisticService } from '../../app/application/services/statistic.service'
import type { StatisticDTO } from '../../app/types/app.types'

describe('StatisticApplication', () => {
  let notifier: NotificationModule

  beforeEach(() => {
    notifier = new NotificationModule()
  })

  afterEach(() => {
    notifier.clear()
  })

  const dto: StatisticDTO = {
    contact_name: 'Jane',
    company_name: 'Acme',
    email: 'jane@acme.com',
  }

  it('forwards the dto and returns undefined without notifying on success', async () => {
    const calls: unknown[] = []
    const service = {
      save: async (arg: StatisticDTO) => {
        calls.push(arg)
        return undefined
      },
    } as unknown as StatisticService
    const app = new StatisticApplication(service, notifier)

    const result = await app.save(dto)

    assert.strictEqual(result, undefined)
    assert.deepStrictEqual(calls, [dto])
    assert.strictEqual(notifier.notifications.size, 0)
  })

  it('notifies "error" and returns the AppError on failure', async () => {
    const err = new AppError('download failed')
    const service = { save: async () => err } as unknown as StatisticService
    const app = new StatisticApplication(service, notifier)

    const result = await app.save(dto)

    assert.strictEqual(result, err)
    assert.strictEqual(notifier.notifications.size, 1)
    const [n] = [...notifier.notifications.values()]
    assert.strictEqual(n.type, 'error')
    assert.strictEqual(n.message, 'download failed')
  })
})

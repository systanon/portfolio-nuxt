/// <reference types="node" />
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { NotificationModule } from '../../app/application/modules/notification/notification.module'

describe('NotificationModule', () => {
  it('adds a notification and removes it after timeout', async () => {
    const s = new NotificationModule()
    s.notify('info', 'Hello', 40)
    assert.strictEqual(s.notifications.size, 1)
    await new Promise((r) => setTimeout(r, 120))
    assert.strictEqual(s.notifications.size, 0)
  })

  it('pause stops the timer; resume completes remaining time', async () => {
    const s = new NotificationModule()
    const id = s.notify('success', 'Paused', 60)
    const payload = s.notifications.get(id)
    assert.ok(payload)
    payload!.pause()
    await new Promise((r) => setTimeout(r, 150))
    assert.strictEqual(s.notifications.size, 1)
    payload!.resume()
    await new Promise((r) => setTimeout(r, 120))
    assert.strictEqual(s.notifications.size, 0)
  })

  it('remove clears the pending timeout', async () => {
    const s = new NotificationModule()
    const id = s.notify('error', 'Dismissed', 10_000)
    assert.strictEqual(s.notifications.size, 1)
    s.remove(id)
    assert.strictEqual(s.notifications.size, 0)
    await new Promise((r) => setTimeout(r, 50))
    assert.strictEqual(s.notifications.size, 0)
  })

  it('clear removes all notifications and timers', async () => {
    const s = new NotificationModule()
    s.notify('info', 'A', 10_000)
    s.notify('info', 'B', 10_000)
    assert.strictEqual(s.notifications.size, 2)
    s.clear()
    assert.strictEqual(s.notifications.size, 0)
    await new Promise((r) => setTimeout(r, 50))
    assert.strictEqual(s.notifications.size, 0)
  })

  it('timeout 0 does not schedule auto-remove', async () => {
    const s = new NotificationModule()
    s.notify('info', 'Sticky', 0)
    assert.strictEqual(s.notifications.size, 1)
    await new Promise((r) => setTimeout(r, 50))
    assert.strictEqual(s.notifications.size, 1)
    s.clear()
    assert.strictEqual(s.notifications.size, 0)
  })
})

/// <reference types="node" />
import { describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { notifyOAuthOpener } from '../../app/utils/notifyOAuthOpener'
import type { Profile } from '../../app/types/user.types'

const profile = { id: 1, email: 'a@a.com' } as Profile

function createWindow(opener: unknown) {
  const close = mock.fn()
  return {
    win: { opener, close } as { opener: unknown; close: () => void },
    close,
  }
}

describe('notifyOAuthOpener', () => {
  it('emits sync:login and closes the window when opened as a popup with a profile', () => {
    const { win, close } = createWindow({})
    const syncEmit = mock.fn()

    const result = notifyOAuthOpener(win, syncEmit, profile)

    assert.strictEqual(result, true)
    assert.strictEqual(syncEmit.mock.callCount(), 1)
    assert.deepStrictEqual(syncEmit.mock.calls[0]?.arguments, [
      'sync:login',
      profile,
    ])
    assert.strictEqual(close.mock.callCount(), 1)
  })

  it('does nothing when there is no opener (normal, non-popup visit)', () => {
    const { win, close } = createWindow(null)
    const syncEmit = mock.fn()

    const result = notifyOAuthOpener(win, syncEmit, profile)

    assert.strictEqual(result, false)
    assert.strictEqual(syncEmit.mock.callCount(), 0)
    assert.strictEqual(close.mock.callCount(), 0)
  })

  it('does nothing when opener is the window itself', () => {
    const win = { close: mock.fn() } as unknown as {
      opener: unknown
      close: () => void
    }
    win.opener = win
    const syncEmit = mock.fn()

    const result = notifyOAuthOpener(win, syncEmit, profile)

    assert.strictEqual(result, false)
    assert.strictEqual(syncEmit.mock.callCount(), 0)
  })

  it('does nothing when there is an opener but no profile yet', () => {
    const { win, close } = createWindow({})
    const syncEmit = mock.fn()

    const result = notifyOAuthOpener(win, syncEmit, null)

    assert.strictEqual(result, false)
    assert.strictEqual(syncEmit.mock.callCount(), 0)
    assert.strictEqual(close.mock.callCount(), 0)
  })
})

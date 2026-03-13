import { describe, it } from 'node:test'
import assert from 'node:assert'
import { canUserAccess } from '../../app/utils/canUserAccess'
import type { RouteLocationNormalized } from 'vue-router'

function createRoute(meta: { accessMode?: string }): RouteLocationNormalized {
  return {
    path: '/',
    name: 'test',
    meta: { ...meta },
    matched: [],
    params: {},
    query: {},
    hash: '',
    redirectedFrom: undefined,
    fullPath: '/',
  } as RouteLocationNormalized
}

describe('canUserAccess', () => {
  describe('accessMode: public', () => {
    it('allows access when accessMode is "public" (authenticated)', () => {
      const route = createRoute({ accessMode: 'public' })
      assert.strictEqual(canUserAccess(route, true), true)
    })

    it('allows access when accessMode is "public" (unauthenticated)', () => {
      const route = createRoute({ accessMode: 'public' })
      assert.strictEqual(canUserAccess(route, false), true)
    })

    it('allows access when accessMode is undefined (defaults to public)', () => {
      const route = createRoute({})
      assert.strictEqual(canUserAccess(route, true), true)
      assert.strictEqual(canUserAccess(route, false), true)
    })
  })

  describe('accessMode: only-for-unauthorized', () => {
    it('allows access when user is not authenticated', () => {
      const route = createRoute({ accessMode: 'only-for-unauthorized' })
      assert.strictEqual(canUserAccess(route, false), true)
    })

    it('denies access when user is authenticated', () => {
      const route = createRoute({ accessMode: 'only-for-unauthorized' })
      assert.strictEqual(canUserAccess(route, true), false)
    })
  })

  describe('accessMode: private', () => {
    it('denies access when user is not authenticated', () => {
      const route = createRoute({ accessMode: 'private' })
      assert.strictEqual(canUserAccess(route, false), false)
    })

    it('allows access when user is authenticated', () => {
      const route = createRoute({ accessMode: 'private' })
      assert.strictEqual(canUserAccess(route, true), true)
    })
  })

  describe('unknown accessMode', () => {
    it('denies access for unrecognized accessMode', () => {
      const route = createRoute({ accessMode: 'unknown' })
      assert.strictEqual(canUserAccess(route, true), false)
      assert.strictEqual(canUserAccess(route, false), false)
    })
  })
})

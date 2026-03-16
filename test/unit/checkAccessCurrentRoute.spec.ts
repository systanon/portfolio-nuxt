/// <reference types="node" />
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { checkAccessCurrentRoute } from '../../app/router/checkAccessCurrentRoute'
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'

function createRoute(meta: {
  accessMode?: string
}): RouteLocationNormalizedLoaded {
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
  } as RouteLocationNormalizedLoaded
}

function createMockRouter(route: RouteLocationNormalizedLoaded) {
  const pushCalls: string[] = []
  return {
    push: (path: string) => pushCalls.push(path),
    currentRoute: { value: route },
    _pushCalls: pushCalls,
  }
}

describe('checkAccessCurrentRoute', () => {
  it('does not redirect when user can access the route (public)', () => {
    const route = createRoute({ accessMode: 'public' })
    const mockRouter = createMockRouter(route)
    checkAccessCurrentRoute(mockRouter as unknown as Router, false)
    assert.strictEqual(mockRouter._pushCalls.length, 0)
  })

  it('does not redirect when user can access the route (private, authenticated)', () => {
    const route = createRoute({ accessMode: 'private' })
    const mockRouter = createMockRouter(route)
    checkAccessCurrentRoute(mockRouter as unknown as Router, true)
    assert.strictEqual(mockRouter._pushCalls.length, 0)
  })

  it('does not redirect when user can access the route (only-for-unauthorized, not authenticated)', () => {
    const route = createRoute({ accessMode: 'only-for-unauthorized' })
    const mockRouter = createMockRouter(route)
    checkAccessCurrentRoute(mockRouter as unknown as Router, false)
    assert.strictEqual(mockRouter._pushCalls.length, 0)
  })

  it('redirects to /sign-in when private route and user not authenticated', () => {
    const route = createRoute({ accessMode: 'private' })
    const mockRouter = createMockRouter(route)
    checkAccessCurrentRoute(mockRouter as unknown as Router, false)
    const calls = mockRouter._pushCalls
    assert.strictEqual(calls.length, 1)
    assert.strictEqual(calls[0], '/sign-in')
  })

  it('redirects to /profile when only-for-unauthorized route and user is authenticated', () => {
    const route = createRoute({ accessMode: 'only-for-unauthorized' })
    const mockRouter = createMockRouter(route)
    checkAccessCurrentRoute(mockRouter as unknown as Router, true)
    const calls = mockRouter._pushCalls
    assert.strictEqual(calls.length, 1)
    assert.strictEqual(calls[0], '/profile')
  })
})

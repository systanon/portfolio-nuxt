/// <reference types="node" />
import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { ref } from 'vue'
import { AuthApplication } from '../../app/application/auth.application'
import { TokenManager } from '../../app/application/token.manager'
import { NotificationModule } from '../../app/application/modules/notification/notification.module'
import {
  AppError,
  AppSilentError,
  AppRateLimitError,
} from '../../app/types/app-errors'
import { AppSuccess } from '../../app/types/app.types'
import type { AuthService } from '../../app/application/services/auth.service'
import type { UserService } from '../../app/application/services/user.service'
import type { Profile } from '../../app/types/user.types'

function createTokenManager() {
  return new TokenManager(ref<string | null | undefined>(null))
}

describe('AuthApplication', () => {
  let notifier: NotificationModule

  beforeEach(() => {
    notifier = new NotificationModule()
  })

  afterEach(() => {
    notifier.clear()
  })

  describe('signIn', () => {
    it('notifies "error" and skips the profile fetch when authorization fails', async () => {
      const err = new AppError('bad creds')
      let profileCalls = 0
      const authService = {
        authorization: async () => err,
      } as unknown as AuthService
      const userService = {
        getProfile: async () => {
          profileCalls++
          return new AppSuccess({} as Profile, new Headers())
        },
      } as unknown as UserService
      const tokenManager = createTokenManager()
      const app = new AuthApplication(
        authService,
        userService,
        tokenManager,
        notifier,
      )

      const result = await app.signIn({ email: 'a@a.com', password: 'pw' })

      assert.strictEqual(result, err)
      assert.strictEqual(profileCalls, 0)
      assert.strictEqual(tokenManager.getToken().value, null)
      assert.strictEqual(notifier.notifications.size, 1)
      const [n] = [...notifier.notifications.values()]
      assert.strictEqual(n.type, 'error')
      assert.strictEqual(n.message, 'bad creds')
    })

    it('sets the token and returns the profile without notifying on success', async () => {
      const authResponse = new AppSuccess(
        { access_token: 'tok-123' },
        new Headers(),
      )
      const profileResponse = new AppSuccess(
        { id: 1 } as Profile,
        new Headers(),
      )
      const authService = {
        authorization: async () => authResponse,
      } as unknown as AuthService
      const userService = {
        getProfile: async () => profileResponse,
      } as unknown as UserService
      const tokenManager = createTokenManager()
      const app = new AuthApplication(
        authService,
        userService,
        tokenManager,
        notifier,
      )

      const result = await app.signIn({ email: 'a@a.com', password: 'pw' })

      assert.strictEqual(result, profileResponse)
      assert.strictEqual(tokenManager.getToken().value, 'tok-123')
      assert.strictEqual(notifier.notifications.size, 0)
    })

    it('notifies "info" (not "error") when the token is set but the profile fetch fails silently', async () => {
      const authResponse = new AppSuccess(
        { access_token: 'tok-456' },
        new Headers(),
      )
      const silent = new AppSilentError('session expired')
      const authService = {
        authorization: async () => authResponse,
      } as unknown as AuthService
      const userService = {
        getProfile: async () => silent,
      } as unknown as UserService
      const tokenManager = createTokenManager()
      const app = new AuthApplication(
        authService,
        userService,
        tokenManager,
        notifier,
      )

      const result = await app.signIn({ email: 'a@a.com', password: 'pw' })

      assert.strictEqual(result, silent)
      assert.strictEqual(tokenManager.getToken().value, 'tok-456')
      assert.strictEqual(notifier.notifications.size, 1)
      const [n] = [...notifier.notifications.values()]
      assert.strictEqual(n.type, 'info')
    })
  })

  describe('signUp', () => {
    it('does not notify on success', async () => {
      const success = new AppSuccess(undefined, new Headers())
      const authService = {
        registration: async () => success,
      } as unknown as AuthService
      const app = new AuthApplication(
        authService,
        {} as UserService,
        createTokenManager(),
        notifier,
      )

      const result = await app.signUp({ email: 'a@a.com', password: 'pw' })

      assert.strictEqual(result, success)
      assert.strictEqual(notifier.notifications.size, 0)
    })

    it('notifies "error" on failure', async () => {
      const err = new AppError('email taken')
      const authService = {
        registration: async () => err,
      } as unknown as AuthService
      const app = new AuthApplication(
        authService,
        {} as UserService,
        createTokenManager(),
        notifier,
      )

      const result = await app.signUp({ email: 'a@a.com', password: 'pw' })

      assert.strictEqual(result, err)
      assert.strictEqual(notifier.notifications.size, 1)
    })
  })

  describe('confirmEmail', () => {
    it('does not notify on success', async () => {
      const success = new AppSuccess({ access_token: 'tok' }, new Headers())
      const authService = {
        confirmEmail: async () => success,
      } as unknown as AuthService
      const app = new AuthApplication(
        authService,
        {} as UserService,
        createTokenManager(),
        notifier,
      )

      const result = await app.confirmEmail({ token: 'x' })

      assert.strictEqual(result, success)
      assert.strictEqual(notifier.notifications.size, 0)
    })

    it('notifies "error" on failure', async () => {
      const err = new AppError('invalid token')
      const authService = {
        confirmEmail: async () => err,
      } as unknown as AuthService
      const app = new AuthApplication(
        authService,
        {} as UserService,
        createTokenManager(),
        notifier,
      )

      const result = await app.confirmEmail({ token: 'x' })

      assert.strictEqual(result, err)
      assert.strictEqual(notifier.notifications.size, 1)
    })
  })

  describe('resendConfirmEmail', () => {
    it('does not notify on success', async () => {
      const success = new AppSuccess(undefined, new Headers())
      const authService = {
        resendConfirmEmail: async () => success,
      } as unknown as AuthService
      const app = new AuthApplication(
        authService,
        {} as UserService,
        createTokenManager(),
        notifier,
      )

      const result = await app.resendConfirmEmail({ email: 'a@a.com' })

      assert.strictEqual(result, success)
      assert.strictEqual(notifier.notifications.size, 0)
    })

    it('notifies "error" when rate limited', async () => {
      const rateLimit = new AppRateLimitError('slow down', 30)
      const authService = {
        resendConfirmEmail: async () => rateLimit,
      } as unknown as AuthService
      const app = new AuthApplication(
        authService,
        {} as UserService,
        createTokenManager(),
        notifier,
      )

      const result = await app.resendConfirmEmail({ email: 'a@a.com' })

      assert.strictEqual(result, rateLimit)
      assert.strictEqual(notifier.notifications.size, 1)
      const [n] = [...notifier.notifications.values()]
      assert.strictEqual(n.type, 'error')
    })
  })

  describe('forgotPassword', () => {
    it('does not notify on success', async () => {
      const success = new AppSuccess(undefined, new Headers())
      const authService = {
        forgotPassword: async () => success,
      } as unknown as AuthService
      const app = new AuthApplication(
        authService,
        {} as UserService,
        createTokenManager(),
        notifier,
      )

      const result = await app.forgotPassword({ email: 'a@a.com' })

      assert.strictEqual(result, success)
      assert.strictEqual(notifier.notifications.size, 0)
    })

    it('notifies "error" when rate limited', async () => {
      const rateLimit = new AppRateLimitError('slow down', 30)
      const authService = {
        forgotPassword: async () => rateLimit,
      } as unknown as AuthService
      const app = new AuthApplication(
        authService,
        {} as UserService,
        createTokenManager(),
        notifier,
      )

      const result = await app.forgotPassword({ email: 'a@a.com' })

      assert.strictEqual(result, rateLimit)
      assert.strictEqual(notifier.notifications.size, 1)
    })
  })

  describe('resetPassword', () => {
    it('does not notify on success', async () => {
      const success = new AppSuccess(undefined, new Headers())
      const authService = {
        resetPassword: async () => success,
      } as unknown as AuthService
      const app = new AuthApplication(
        authService,
        {} as UserService,
        createTokenManager(),
        notifier,
      )

      const result = await app.resetPassword({ password: 'pw', token: 't' })

      assert.strictEqual(result, success)
      assert.strictEqual(notifier.notifications.size, 0)
    })

    it('notifies "error" on failure', async () => {
      const err = new AppError('invalid token')
      const authService = {
        resetPassword: async () => err,
      } as unknown as AuthService
      const app = new AuthApplication(
        authService,
        {} as UserService,
        createTokenManager(),
        notifier,
      )

      const result = await app.resetPassword({ password: 'pw', token: 't' })

      assert.strictEqual(result, err)
      assert.strictEqual(notifier.notifications.size, 1)
    })
  })

  describe('refresh', () => {
    it('updates the token and does not notify on success', async () => {
      const success = new AppSuccess(
        { access_token: 'fresh-tok' },
        new Headers(),
      )
      const authService = {
        refresh: async () => success,
      } as unknown as AuthService
      const tokenManager = createTokenManager()
      const app = new AuthApplication(
        authService,
        {} as UserService,
        tokenManager,
        notifier,
      )

      const result = await app.refresh()

      assert.strictEqual(result, success)
      assert.strictEqual(tokenManager.getToken().value, 'fresh-tok')
      assert.strictEqual(notifier.notifications.size, 0)
    })

    it('leaves the token untouched and notifies "error" on failure', async () => {
      const err = new AppError('refresh failed')
      const authService = { refresh: async () => err } as unknown as AuthService
      const tokenManager = createTokenManager()
      tokenManager.setToken('existing-tok')
      const app = new AuthApplication(
        authService,
        {} as UserService,
        tokenManager,
        notifier,
      )

      const result = await app.refresh()

      assert.strictEqual(result, err)
      assert.strictEqual(tokenManager.getToken().value, 'existing-tok')
      assert.strictEqual(notifier.notifications.size, 1)
    })
  })

  describe('logout', () => {
    it('clears the token and does not notify on success', async () => {
      const success = new AppSuccess(undefined, new Headers())
      const authService = {
        logout: async () => success,
      } as unknown as AuthService
      const tokenManager = createTokenManager()
      tokenManager.setToken('existing-tok')
      const app = new AuthApplication(
        authService,
        {} as UserService,
        tokenManager,
        notifier,
      )

      const result = await app.logout()

      assert.strictEqual(result, success)
      assert.strictEqual(tokenManager.getToken().value, null)
      assert.strictEqual(notifier.notifications.size, 0)
    })

    it('leaves the token untouched and notifies "error" on failure', async () => {
      const err = new AppError('logout failed')
      const authService = { logout: async () => err } as unknown as AuthService
      const tokenManager = createTokenManager()
      tokenManager.setToken('existing-tok')
      const app = new AuthApplication(
        authService,
        {} as UserService,
        tokenManager,
        notifier,
      )

      const result = await app.logout()

      assert.strictEqual(result, err)
      assert.strictEqual(tokenManager.getToken().value, 'existing-tok')
      assert.strictEqual(notifier.notifications.size, 1)
    })
  })
})

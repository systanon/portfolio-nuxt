import { AppError, AppRateLimitError, AppSilentError } from '~/types/app-errors'
import { AppSuccess } from '~/types/app.types'
import type {
  ForgotPasswordDto,
  ResendConfirmEmailDto,
  SignInDto,
  SignUpDto,
} from '~/types/auth'
import { useProfile } from './useProfile'
import { eventBus } from '~/utils/event-bus'

export const useAuth = () => {
  const { $api } = useNuxtApp()
  const { getProfile } = useProfile()
  const { notify } = useNotification()

  const signIn = async (dto: SignInDto): Promise<void | AppError> => {
    const res = await $api.auth.signIn(dto)
    if (res instanceof AppError) {
      // this.logger.warn(`Sign in failed: ${res.message}`)
      notify('error', res.message)

      return res
    } else if (res instanceof AppSilentError) {
      // this.logger.warn(`Sign in failed: ${res.message}`)
      notify('info', res.message)
    } else if (res instanceof AppSuccess) {
      // this.logger.log('User signed in')
      eventBus.emit('auth:login', res.data)
      $api.sync.emit('sync:login', res.data)
    }
  }

  const signUp = async (dto: SignUpDto): Promise<void | AppError> => {
    const res = await $api.auth.signUp(dto)
    if (res instanceof AppError) {
      notify('error', res.message)

      return res
    }
  }

  const forgotPassword = async (
    dto: ForgotPasswordDto,
  ): Promise<void | AppRateLimitError> => {
    const res = await $api.auth.forgotPassword(dto)
    if (res instanceof AppRateLimitError) {
      notify('error', res.message)

      return res
    }
  }

  const resendConfirmEmail = async (
    dto: ResendConfirmEmailDto,
  ): Promise<void | AppRateLimitError> => {
    const res = await $api.auth.resendConfirmEmail(dto)
    if (res instanceof AppRateLimitError) {
      notify('error', res.message)
      return res
    }
  }

  const logout = async (): Promise<void | AppError> => {
    const res = await $api.auth.logout()
    if (res instanceof AppError) {
      notify('error', res.message)

      return res
    }

    // this.logger.log('User logged out')
    eventBus.emit('auth:logout')
    $api.sync.emit('sync:logout')
  }

  return {
    getProfile,
    signIn,
    signUp,
    forgotPassword,
    resendConfirmEmail,
    logout,
  }
}

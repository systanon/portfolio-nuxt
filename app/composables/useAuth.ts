import { AppError, AppRateLimitError } from '~/types/app-errors'
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
  const { setToken } = useAccess()
  const { getProfile } = useProfile()
  const { notify } = useNotification()

  const signIn = async (dto: SignInDto): Promise<void | AppError> => {
    const res = await $api.auth.authorization(dto)
    if (res instanceof AppError) {
      // this.logger.warn(`Sign in failed: ${res.message}`)
      notify('error', res.message)

      return res
    }
    setToken(res.data.access_token)
    const profile = await getProfile()
    if (profile instanceof AppSuccess) {
      // this.logger.log('User signed in')
      eventBus.emit('auth:login', profile.data)
    }
  }
  const signUp = async (dto: SignUpDto): Promise<void | AppError> => {
    const res = await $api.auth.registration(dto)
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
    // TODO: also return AppSuccess
    // this.logger.log('User logged out')
    eventBus.emit('auth:logout')
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

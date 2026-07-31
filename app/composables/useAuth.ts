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
  const { getProfile } = useProfile()

  const signIn = async (dto: SignInDto): Promise<undefined | AppError> => {
    const res = await $api.auth.signIn(dto)
    if (res instanceof AppSuccess) {
      eventBus.emit('auth:login', res.data)
      $api.sync.emit('sync:login', res.data)
      return
    }
    if (res instanceof AppError) {
      return res
    }
  }

  const signUp = async (dto: SignUpDto): Promise<undefined | AppError> => {
    const res = await $api.auth.signUp(dto)
    if (res instanceof AppError) {
      return res
    }
  }

  const forgotPassword = async (
    dto: ForgotPasswordDto,
  ): Promise<undefined | AppRateLimitError> => {
    const res = await $api.auth.forgotPassword(dto)
    if (res instanceof AppRateLimitError) {
      return res
    }
  }

  const resendConfirmEmail = async (
    dto: ResendConfirmEmailDto,
  ): Promise<undefined | AppRateLimitError> => {
    const res = await $api.auth.resendConfirmEmail(dto)
    if (res instanceof AppRateLimitError) {
      return res
    }
  }

  const logout = async (): Promise<undefined | AppError> => {
    const res = await $api.auth.logout()
    if (res instanceof AppError) {
      return res
    }

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

import { AppError, AppSilentError } from '~/types/app-errors'
import { AppSuccess } from '~/types/app.types'

import type { Profile, ProfileDTO } from '~/types/user.types'

export const useProfile = () => {
  const { $api } = useNuxtApp()
  const app = useApp()
  const { notify } = useNotification()

  const getProfile = async (): Promise<
    AppError | AppSilentError | AppSuccess<Profile>
  > => {
    app.startProfileLoading()

    const res = await $api.user.getProfile()

    if (res instanceof AppError) {
      notify('error', res.message)
    }
    if (res instanceof AppSilentError) {
      notify('info', res.message)
    }
    if (res instanceof AppSuccess) {
      // this.ee.emit('profile:loaded', res.data)
      // this.syncModule.emit('profile:loaded', res.data)
    }
    app.finishProfileLoading()
    return res
  }

  const updateProfile = async (
    dto: ProfileDTO,
  ): Promise<AppSuccess<null> | AppError> => {
    const res = await $api.user.updateProfile(dto)
    if (res instanceof AppError) {
      notify('error', res.message)
    }

    return res
  }

  return {
    getProfile,
    updateProfile,
  }
}

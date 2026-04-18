import { useAppStore } from '~/store/application'
import { canUserAccess } from '~/router/canUserAccess'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const application = useApp()
  const appStore = useAppStore()

  await application.profileLoading
  const canAccessTo = canUserAccess(to, appStore.isLogged)

  if (!canAccessTo) {
    const canAccessFrom = canUserAccess(from, appStore.isLogged)
    if (!canAccessFrom) {
      return navigateTo('/')
    }

    return false
  }

  return true
})

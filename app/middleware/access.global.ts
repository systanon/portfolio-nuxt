import { useAppStore } from '~/store/application'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const application = useApp()
  const appStore = useAppStore()

  const { accessMode = 'public' } = to.meta
  if (from.fullPath === to.fullPath && from.name === to.name) return false

  if (accessMode === 'public') return true

  await application.profileLoading

  const canAccessTo = await canUserAccess(to, appStore.isLogged)
  if (!canAccessTo) {
    const canAccessFrom = await canUserAccess(from, appStore.isLogged)
    if (!canAccessFrom) {
      return navigateTo('/')
    }

    return false
  }

  return true
})

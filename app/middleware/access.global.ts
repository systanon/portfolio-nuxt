import { useAppStore } from '~/store/application'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const application = useApp()
  const appStore = useAppStore()

  const { accessMode = 'public' } = to.meta
  if (from.fullPath === to.fullPath && from.name === to.name) return false

  if (accessMode === 'public') return true

  await application.profileLoading

  const canAccess = await canUserAccess(to, appStore.isLogged)
  if (!canAccess) {
    const canAccess = await canUserAccess(from, appStore.isLogged)
    if (!canAccess) {
      return navigateTo('/')
    }

    return false
  }

  return true
})

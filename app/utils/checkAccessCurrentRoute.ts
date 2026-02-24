import type { Router } from 'vue-router'

export const checkAccessCurrentRoute = async (
  router: Router,
  isLogged: boolean,
) => {
  const route = router.currentRoute.value
  const { accessMode = 'public' } = route.meta
  if (accessMode === 'public') return

  const canAccess = await canUserAccess(route, isLogged)
  if (canAccess) return

  if (accessMode === 'private') router.push({ name: 'sign-in' })
  if (accessMode === 'only-for-unauthorized') router.push({ name: 'profile' })
}

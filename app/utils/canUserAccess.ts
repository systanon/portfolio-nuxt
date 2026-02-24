import type { RouteLocationNormalized } from 'vue-router'

export const canUserAccess = async (
  to: RouteLocationNormalized,
  isAuthenticated: boolean,
) => {
  const { accessMode = 'public' } = to.meta

  if (accessMode === 'only-for-unauthorized' && !isAuthenticated) {
    return true
  }
  if (accessMode === 'only-for-unauthorized' && isAuthenticated) {
    return false
  }
  if (accessMode === 'private' && !isAuthenticated) {
    return false
  }
  if (accessMode === 'private' && isAuthenticated) {
    return true
  }

  return false
}

import type { RouteLocationNormalized } from 'vue-router'

export function canUserAccess(
  to: RouteLocationNormalized,
  isAuthenticated: boolean,
): boolean {
  const { accessMode = 'public' } = to.meta

  if (accessMode === 'public') {
    return true
  }
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

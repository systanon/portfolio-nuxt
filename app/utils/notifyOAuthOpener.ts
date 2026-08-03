import type { Profile } from '~/types/user.types'

export interface OAuthOpenerWindow {
  opener: unknown
  close: () => void
}

export function notifyOAuthOpener(
  win: OAuthOpenerWindow,
  syncEmit: (event: string, ...args: unknown[]) => void,
  profile: Profile | null | undefined,
): boolean {
  if (!win.opener || win.opener === win || !profile) return false

  syncEmit('sync:login', profile)
  win.close()
  return true
}

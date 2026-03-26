export function useGoogleAuth() {
  const config = useRuntimeConfig()

  const openGoogleAuth = () => {
    const url = config.public.googleAuthURL

    if (!url) return

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return {
    openGoogleAuth,
  }
}

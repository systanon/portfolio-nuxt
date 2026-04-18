export const useAccess = () => {
  const cookie = useCookie<string | null>('access_token')

  const token = useState<string | null>(
    'access_token',
    () => cookie.value ?? null,
  )

  const setToken = (newToken: string) => {
    token.value = newToken
    cookie.value = newToken
  }

  const clearToken = () => {
    token.value = null
    cookie.value = null
  }

  return { token, setToken, clearToken }
}

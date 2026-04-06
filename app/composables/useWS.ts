export const useWS = () => {
  const { $wsClient } = useNuxtApp()
  return $wsClient
}

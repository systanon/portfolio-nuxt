export const useWsClient = () => {
  const { $wsClient } = useNuxtApp()
  return $wsClient
}

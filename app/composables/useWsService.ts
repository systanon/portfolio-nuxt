export const useWsService = () => {
  const { $wsService } = useNuxtApp()
  return $wsService
}

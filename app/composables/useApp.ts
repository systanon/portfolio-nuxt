export const useApp = () => {
  const { $appInstance } = useNuxtApp()
  return $appInstance
}

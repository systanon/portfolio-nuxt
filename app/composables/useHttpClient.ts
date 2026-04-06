export const useHttpClient = () => {
  const { $httpClient } = useNuxtApp()
  return $httpClient
}

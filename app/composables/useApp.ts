import { ClientApplication } from '~/application/clientApplication'

export const useApp = () => {
  const { $application } = useNuxtApp()
  return $application
}

export const useClientApp = () => {
  const { $application } = useNuxtApp()
  if (!($application instanceof ClientApplication)) {
    throw new Error('useClientApp called on server')
  }
  return $application as ClientApplication
}

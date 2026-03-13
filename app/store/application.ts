import type { Application } from '~/services/application.service'
import type { Profile } from '~/types/user.types'

export const useAppStore = defineStore('app', () => {
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const pageTitle = ref<string | null>(null)

  const isLogged = computed(() => profile.value !== null)

  function bindApplicationEvents(application: Application) {
    application.on('profile:loaded', (data: Profile) => {
      profile.value = data
    })

    application.on('profile:error', () => {
      profile.value = null
    })

    application.on('auth:logout', () => {
      profile.value = null
    })

    application.on('data:loading', (isLoading: boolean) => {
      loading.value = isLoading
    })
  }

  return {
    profile,
    loading,
    pageTitle,
    isLogged,
    bindApplicationEvents,
  }
})

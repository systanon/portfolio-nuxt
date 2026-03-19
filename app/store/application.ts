import type { Application } from '~/application/application'
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

  function updateField<K extends keyof Profile>(key: K, value: Profile[K]) {
    profile.value![key] = value
  }

  return {
    profile,
    loading,
    pageTitle,
    isLogged,
    updateField,
    bindApplicationEvents,
  }
})

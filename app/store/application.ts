import type { Profile } from '~/types/user.types'

export const useAppStore = defineStore('app', () => {
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const pageTitle = ref<string | null>(null)

  const isLogged = computed(() => profile.value !== null)

  function updateField<K extends keyof Profile>(key: K, value: Profile[K]) {
    profile.value![key] = value
  }

  function setProfile(data: Profile) {
    profile.value = data
  }

  function clearProfile() {
    profile.value = null
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading
  }
  return {
    profile,
    loading,
    pageTitle,
    isLogged,
    updateField,
    setProfile,
    setLoading,
    clearProfile,
  }
})

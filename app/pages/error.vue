<template>
  <div class="error-page">
    <h1 class="error-page__title">Authorization Failed</h1>

    <p class="error-page__status">
      <strong>Status:</strong> {{ errorCode || 'unknown' }}
    </p>
    <p class="error-page__message">
      <strong>Message:</strong> {{ errorMessage }}
    </p>

    <div class="error-page__actions">
      <UiButton label="Go To Home" @click="goHome" />
      <UiButton label="Try Again" @click="openGoogleAuth" />
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Authorization Error',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const { openGoogleAuth } = useGoogleAuth()
const errorCode = ref<number | null>(null)
const errorMessage = ref<string>('Unknown error')

const errorMap: Record<string, string> = {
  oauth_failed: 'Authorization failed. Please try again.',
  oauth_verify_email_failed: 'Your email is not verified.',
  oauth_empty_email_failed: 'Email is missing. Try another account.',
}

onMounted(() => {
  const queryCode = route.query.code
  const queryError = route.query.error

  if (queryCode) {
    errorCode.value = parseInt(queryCode as string, 10)
  }

  if (queryError) {
    errorMessage.value =
      errorMap[queryError as string] || (queryError as string)
  }
})

const goHome = () => navigateTo('/')
</script>

<style scoped lang="scss">
.error-page {
  max-width: rem(500);
  margin: 0 auto;
  padding: rem(24);
  background-color: var(--backdrop);
  &__title {
    color: var(--error);
    margin-bottom: rem(20);
  }
  &__actions {
    margin-top: rem(20);
    display: flex;
    justify-content: end;
    gap: rem(20);
  }
}
</style>

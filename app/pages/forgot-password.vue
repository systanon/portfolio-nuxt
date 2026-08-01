<template>
  <div class="forgot-pass-page">
    <form class="forgot-pass-page__form" @submit.prevent="submitHandler">
      <h2 class="forgot-pass-page__title">Forgot password</h2>
      <UiInput
        v-model="email"
        label="Email"
        placeholder="Enter email"
        :validation="v$.email"
      />
      <div class="forgot-pass-page__redirect">
        <AppLink
          class="forgot-pass-page__redirect-link"
          to="resend-email-verification"
          inactive-class="link-secondary"
          active-class="link-secondary--active"
          @navigate="(navigate) => navigate()"
          >Resend verification email?</AppLink
        >
      </div>
      <UiButton type="submit" label="Submit" :disabled="isBlocked" />
      <ProgressBar
        v-if="showProgressBar"
        ref="progressBarRef"
        :progress="false"
      >
        <span>{{ time }}</span>
      </ProgressBar>
    </form>
  </div>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import { AppRateLimitError } from '~/types/app-errors'

useSeoMeta({
  title: 'Forgot Password',
  robots: 'noindex, nofollow',
})

const { forgotPassword } = useAuth()
const email = ref<string>('')

const { emailRules } = useValidationRules()
const { isBlocked, showProgressBar, time, startRateLimit, progressBarRef } =
  useRateLimit()

const rules = {
  email: emailRules,
}

const v$ = useVuelidate(rules, {
  email,
})

const submitHandler = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) return
  const payload = {
    email: email.value,
  }

  const res = await forgotPassword(payload)
  if (res instanceof AppRateLimitError) {
    await startRateLimit(res.retryAfter)
  }
}
</script>

<style scoped lang="scss">
.forgot-pass-page {
  display: flex;
  justify-content: center;
  &__title {
    text-align: center;
  }
  &__form {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: rem(15);
    background-color: var(--bg-primary);
    padding: rem(30);
    border-radius: rem(15);
    width: 100%;
    max-width: rem(500);
  }
  &__redirect {
    text-align: end;
    padding-bottom: rem(15);
  }
}
</style>

<template>
  <section class="page-sign-in">
    <form class="page-sign-in__form" @submit.prevent="submit">
      <h2 class="page-sign-in__form-title">Sign in</h2>
      <UiInput
        v-model="email"
        label="Email"
        placeholder="Enter email"
        :validation="v$.email"
        autocomplete="email"
      />
      <UiInput
        v-model="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        :validation="v$.password"
        autocomplete="current-password"
      />
      <div class="page-sign-in__redirect">
        <AppLink
          class="page-sign-in__redirect-link"
          inactive-class="link-secondary"
          active-class="link-secondary--active"
          to="forgot-password"
          @navigate="(navigate) => navigate()"
        >
          Forgot password?</AppLink
        >
      </div>
      <UiButtonIcon
        class="page-sign-in__auth"
        type="submit"
        icon-name="google-logo"
        icon-size="medium"
        @click="openGoogleAuth"
      >
        <template #append>
          <span class="page-sign-in__auth-text">Continue with Google</span>
        </template>
      </UiButtonIcon>

      <UiButton type="submit" label="Submit" />
    </form>
  </section>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'

definePageMeta({
  accessMode: 'only-for-unauthorized',
})

useSeoMeta({
  title: 'Sign In',
  robots: 'noindex, nofollow',
})

const { signIn } = useAuth()

const { openGoogleAuth } = useGoogleAuth()

const email = ref('')
const password = ref('')

const { emailRules, passwordRules } = useValidationRules()

const rules = {
  email: emailRules,
  password: passwordRules,
}

const v$ = useVuelidate(rules, { email, password })

async function submit(): Promise<void> {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  signIn({ email: email.value, password: password.value })
}
</script>

<style scoped lang="scss">
.page-sign-in {
  display: flex;
  justify-content: center;
  &__form {
    display: flex;
    flex-direction: column;
    gap: rem(15);
    background-color: var(--bg-primary);
    padding: rem(30);
    border-radius: rem(15);
    width: 100%;
    max-width: rem(400);
    &-title {
      text-align: center;
    }
  }
  &__redirect {
    display: flex;
    flex-direction: column;
    gap: rem(20);
    align-items: flex-end;
    padding-bottom: rem(15);
  }
  &__auth {
    margin-bottom: rem(15);
    :deep(.ui-button-icon) {
      gap: unset;
    }
    &-text {
      margin: 0 auto;
    }
  }
}
</style>

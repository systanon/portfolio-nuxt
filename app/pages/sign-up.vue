<template>
  <section class="page-sign-up">
    <form class="page-sign-up__form" @submit.prevent="submitHandler">
      <h2 class="page-sign-up__form-title">Sign up</h2>
      <UiInput
        v-model="email"
        label="Email"
        placeholder="Enter email"
        autocomplete="email"
        :validation="v$.email"
      />
      <UiInput
        v-model="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        :validation="v$.password"
        autocomplete="new-password"
      />
      <UiInput
        v-model="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="Confirm your password"
        autocomplete="new-password"
        :validation="v$.confirmPassword"
      />
      <div class="page-sign-up__redirect">
        <span class="page-sign-up__redirect-text"
          >Already have an account?</span
        >

        <AppLink
          to="/sign-in"
          inactive-class="link-secondary"
          active-class="link-secondary--active"
          @navigate="(navigate) => navigate()"
          >Sign In</AppLink
        >
      </div>
      <UiButton type="submit" label="Submit" />
    </form>
  </section>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'

definePageMeta({
  accessMode: 'only-for-unauthorized',
})

const app = useApp()

const email = ref<string>('')
const password = ref<string>('')
const confirmPassword = ref<string>('')
const { emailRules, passwordRules, confirmPasswordRules } = useValidationRules()
const rules = {
  password: passwordRules,
  email: emailRules,
  confirmPassword: confirmPasswordRules(password),
}
const v$ = useVuelidate(rules, {
  email,
  password,
  confirmPassword,
})

const submitHandler = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) return
  const payload = {
    email: email.value,
    password: password.value,
  }

  app.signUp(payload)
}
</script>

<style scoped lang="scss">
.page-sign-up {
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
    text-align: center;
    padding-bottom: rem(15);
    &-text {
      padding-right: rem(10);
    }
  }
}
</style>

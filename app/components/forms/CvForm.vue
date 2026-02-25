<template>
  <UiInput
    v-model="statistic.company_name"
    placeholder="Company name"
    :validation="v$.company_name"
  />
  <UiInput
    v-model="statistic.contact_name"
    placeholder="Contact name"
    :validation="v$.contact_name"
  />
  <UiInput
    v-model="statistic.email"
    placeholder="Email"
    :validation="v$.email"
  />
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core'
import type { StatisticDTO } from '~/types/app.types'

const { emailRules, contactNameRules, companyNameRules } = useValidationRules()

const statistic = reactive<StatisticDTO>({
  company_name: '',
  contact_name: '',
  email: '',
})

const rules = {
  company_name: companyNameRules,
  contact_name: contactNameRules,
  email: emailRules,
}

const v$ = useVuelidate(rules, statistic)

const validateAndGet = async (): Promise<StatisticDTO | null> => {
  const isValid = await v$.value.$validate()
  if (!isValid) return null
  return { ...statistic }
}

defineExpose({ validateAndGet })
</script>

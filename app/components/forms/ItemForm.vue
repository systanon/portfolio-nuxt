<template>
  <div class="todo-form">
    <UiInput
      v-model="localTodo.title"
      placeholder="Title"
      :validation="v$.title"
    />

    <UiTextarea
      v-model="localTodo.description"
      placeholder="Description"
      :validation="v$.description"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import useVuelidate from '@vuelidate/core'
import { useValidationRules } from '@/composables/useValidationRules'
import UiInput from '@/components/ui/fields/UiInput.vue'
import UiTextarea from '@/components/ui/fields/UiTextarea.vue'
import type { TodoDTO } from '@/types/todo'

type TodoProp = {
  title?: string
  description?: string
}

const props = defineProps<TodoProp>()

const localTodo = reactive({
  title: props.title ?? '',
  description: props.description ?? '',
})

watch(
  () => [props.title, props.description],
  ([title, description]) => {
    localTodo.title = title ?? ''
    localTodo.description = description ?? ''
  },
)

const { titleRules, descriptionRules } = useValidationRules()

const rules = {
  title: titleRules,
  description: descriptionRules,
}

const v$ = useVuelidate(rules, localTodo)

const submit = async (): Promise<TodoDTO | null> => {
  const isValid = await v$.value.$validate()
  if (!isValid) return null
  return { ...localTodo }
}

defineExpose({ submit })
</script>

<template>
  <BaseField :label="label" :validation="validation">
    <template #default="{ id }">
      <label class="ui-checkbox">
        <input
          v-bind="$attrs"
          :id="id"
          type="checkbox"
          class="ui-checkbox__input"
          :checked="modelValue"
          :disabled="disabled"
          @change="onChange"
        >
        <span class="ui-checkbox__text">
          <slot>{{ label }}</slot>
        </span>
      </label>
    </template>
  </BaseField>
</template>

<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core'

interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
  validation?: BaseValidation
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue' | 'change', value: boolean): void
}>()

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
  emit('change', target.checked)
}
</script>

<style scoped lang="scss">
.ui-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  &__input {
    width: rem(20);
    height: rem(20);
    cursor: pointer;
    accent-color: var(--bg-tertiary);
    margin: 0;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__text {
    color: var(--text-color-secondary);
  }
}
</style>

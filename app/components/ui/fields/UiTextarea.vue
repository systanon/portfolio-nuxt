<template>
  <BaseField :label="label" :validation="validation">
    <template #default="{ id }">
      <textarea
        v-bind="$attrs"
        :id="id"
        v-model="modelValueProxy"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'ui-textarea__field',
          { 'ui-textarea__field--error': $v?.$error },
        ]"
        @blur="emit('blur')"
      />
    </template>
  </BaseField>
</template>

<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  disabled?: boolean
  validation?: BaseValidation
}

defineOptions({ name: 'UiTextarea' })

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
}>()

const { modelValueProxy, $v } = useField(props, emit)
</script>

<style scoped lang="scss">
.ui-textarea {
  position: relative;
  display: flex;
  flex-direction: column;
  color: var(--text-color-secondary);
  padding-bottom: rem(18);

  &__field {
    padding: rem(16);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: rem(18);
    width: 100%;
    min-height: 6rem;
    resize: vertical;

    &--error {
      border-color: var(--error);
    }
    &:disabled {
      color: var(--text-color-secondary);
    }
  }
}
</style>

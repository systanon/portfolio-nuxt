<template>
  <BaseField :label="label" :validation="validation">
    <template #default="{ id }">
      <input
        v-bind="$attrs"
        :id="id"
        v-model="modelValueProxy"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="{ 'ui-input__field--error': $v?.$error }"
        class="ui-input__field"
        @blur="emit('blur')"
      />

      <UiButtonIcon
        v-if="iconName"
        class="ui-input__icon"
        :icon-name="iconName"
        :aria-label="iconAriaLabel"
        :with-border="false"
        @click="$emit('iconClick')"
      />
    </template>
  </BaseField>
</template>

<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core'

interface Props {
  modelValue: string
  label?: string
  iconName?: string
  iconAriaLabel?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  validation?: BaseValidation
}

defineOptions({ name: 'UiInput' })

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  iconName: undefined,
  iconAriaLabel: undefined,
  placeholder: undefined,
  type: undefined,
  disabled: undefined,
  validation: undefined,
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'iconClick' | 'blur'): void
}>()

const { modelValueProxy, $v } = useField(props, emit)
</script>

<style scoped lang="scss">
.ui-input__field {
  padding: rem(16) rem(36) rem(16) rem(16);
  border: 1px solid var(--border-color);
  border-radius: rem(6);
  font-size: rem(18);
  width: 100%;

  &--error {
    border-color: var(--error);
  }

  &:disabled {
    color: var(--text-color-secondary);
  }
}

.ui-input__icon {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  color: var(--todo-checked);
}
</style>

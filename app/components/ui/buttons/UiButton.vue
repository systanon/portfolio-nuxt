<template>
  <button
    :disabled="disabled"
    :class="['ui-button', { _active: active }]"
    :type="type"
  >
    <slot name="prepend"></slot>
    <slot name="default">
      {{ label }}
    </slot>
    <slot name="append"></slot>
  </button>
</template>

<script lang="ts" setup>
export type ButtonType = 'button' | 'submit' | 'reset'

withDefaults(
  defineProps<{
    label?: string | number
    disabled?: boolean
    type?: ButtonType
    active?: boolean
  }>(),
  {
    label: '',
    disabled: false,
    type: 'button',
    active: false,
  },
)
</script>

<style lang="scss" scoped>
.ui-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-color-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  padding: 0 rem(18);
  border-radius: rem(6);
  font-size: rem(18);
  height: rem(60);
  min-width: rem(60);

  &._active {
    color: var(--text-color-primary);
    box-shadow: inset 0 0 0 1px var(--border-hover-color);
  }
  &:hover:not(._active) {
    box-shadow: inset 0 0 0 1px var(--border-hover-color);
  }
  &:disabled {
    opacity: $disabled-opacity;
    pointer-events: none;
  }
}
</style>

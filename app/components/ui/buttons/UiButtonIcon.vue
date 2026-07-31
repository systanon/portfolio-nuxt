<template>
  <button
    :disabled="disabled"
    :class="[
      'ui-button-icon',
      { _bordered: withBorder, '_only-icon': onlyIcon },
    ]"
  >
    <slot name="prepend"/>
    <UiIcon :name="iconName" :size="iconSize" :color="iconColor" />
    <slot name="append"/>
  </button>
</template>

<script lang="ts" setup>
import type { IconColor, IconSize } from '~/components/ui/icons/UiIcon.vue'

defineSlots<{
  prepend(): void
  append(): void
}>()

withDefaults(
  defineProps<{
    iconName: string
    disabled?: boolean
    iconSize?: IconSize
    withBorder?: boolean
    iconColor?: IconColor
    onlyIcon?: boolean
  }>(),
  {
    disabled: false,
    withBorder: true,
    onlyIcon: false,
    iconSize: 'large',
    iconColor: 'primary',
  },
)
</script>

<style lang="scss" scoped>
.ui-button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;
  padding: 0 rem(18);
  border-radius: rem(6);
  font-size: rem(18);
  height: rem(60);
  min-width: rem(60);
  gap: rem(15);

  &._only-icon {
    padding: 0;
    height: unset;
    min-width: unset;
  }
  &._bordered {
    border: 1px solid var(--border-color);
    &:hover {
      box-shadow: inset 0 0 0 1px var(--border-hover-color);
    }
  }
  &:disabled {
    pointer-events: none;
    opacity: $disabled-opacity;
  }
  &:not(._bordered) {
    &:hover {
      :deep(.ui-icon) {
        color: var(--icon-hover-primary);
      }
    }
  }
}
</style>

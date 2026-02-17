<template>
  <svg
    :class="['ui-icon', sizeClass, colorClass]"
    :width="width"
    :height="height"
    aria-hidden="true"
    focusable="false"
  >
    <use :href="localHref" height="100%" width="100%" />
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

defineOptions({
  name: 'UIIcon',
})

export type IconSize = 'small' | 'medium' | 'large'
export type IconColor = 'primary' | 'secondary' | 'tertiary'

type UiIcon = {
  href?: string
  name?: string
  size?: IconSize
  width?: number | string
  height?: number | string
  color?: IconColor
}

const props = withDefaults(defineProps<UiIcon>(), {
  size: 'large',
  name: 'default',
  color: 'primary',
})
const localHref = computed(() => props.href || `#${props.name}`)

const sizeClass = computed(() =>
  props.width && props.height ? null : `_${props.size}`,
)
const colorClass = computed(() => `_${props.color}-color`)
</script>

<style lang="scss" scoped>
.ui-icon {
  &._primary-color {
    color: var(--icon-color-primary);
    fill: currentColor;
  }

  &._secondary-color {
    color: var(--icon-color-secondary);
    fill: currentColor;
  }

  &._tertiary-color {
    color: var(--icon-color-tertiary);
    fill: currentColor;
  }

  &._small {
    width: rem(16);
    height: rem(16);
  }

  &._medium {
    width: rem(24);
    height: rem(24);
  }

  &._large {
    width: rem(32);
    height: rem(32);
  }
}
</style>

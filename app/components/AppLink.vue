<template>
  <NuxtLink
    :to="to"
    custom
    v-slot="{ href, navigate, isActive, isExactActive }"
  >
    <a
      :href="href"
      :aria-disabled="disabled"
      :class="[
        inactiveClass,
        isActive && activeClass,
        isExactActive && exactActiveClass,
        disabled && 'link--disabled',
      ]"
      @click.prevent="handleClick(navigate)"
    >
      <slot />
    </a>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to: string

    disabled?: boolean

    inactiveClass?: string
    activeClass?: string
    exactActiveClass?: string
  }>(),

  {
    disabled: false,

    inactiveClass: '',
    activeClass: 'is-active',
    exactActiveClass: 'is-exact-active',
  },
)

const emit = defineEmits<{
  (e: 'navigate', navigate: () => void): void
}>()

const handleClick = (navigate: () => void) => {
  if (props.disabled) return

  emit('navigate', navigate)
}
</script>

<style lang="scss" scoped>
.link {
  color: var(--text-color-secondary);
  &--active {
    color: var(--text-active-primary);
  }
  &:hover {
    opacity: $hover;
  }
}
.link-secondary {
  color: var(--text-color-tertiary);

  &:hover {
    opacity: $hover;
  }
}
.link--disabled {
  pointer-events: none;
  cursor: default;
  opacity: 0.6;
}
</style>

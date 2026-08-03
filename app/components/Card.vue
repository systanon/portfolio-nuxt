<template>
  <div
    ref="rootRef"
    :class="['card-component', { _hoverable: isHover }]"
    :role="isHover ? 'button' : undefined"
    :tabindex="isHover ? 0 : undefined"
    @keydown.enter="onActivate"
    @keydown.space.prevent="onActivate"
  >
    <UiIcon
      :name="iconName"
      color="secondary"
      :width="rem(width)"
      :height="rem(height)"
    />
    <slot />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  iconName: string
  width: number
  height: number
  isHover?: boolean
}>()

const rootRef = ref<HTMLElement | null>(null)

function onActivate() {
  rootRef.value?.click()
}
</script>

<style lang="scss" scoped>
.card-component {
  display: flex;
  flex-direction: column;
  background: var(--backdrop-color);
  backdrop-filter: blur($blur-filter);
  -webkit-backdrop-filter: blur($blur-filter);
  align-items: center;
  flex: 1;
  padding: rem(55);
  gap: rem(30);

  &._hoverable {
    cursor: pointer;

    &:hover {
      background:
        linear-gradient(
          180deg,
          rgba(0, 0, 0, 0) 0%,
          rgba(255, 195, 0, 0.2) 100%
        ),
        rgba(10, 11, 9, 0.6);
    }

    backdrop-filter: blur(5.9px);
  }
}
</style>

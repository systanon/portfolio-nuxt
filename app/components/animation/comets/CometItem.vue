<template>
  <div ref="root" class="comet">
    <div ref="tail" class="comet__tail" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Comet } from '~/animations/cometEngine'

const props = defineProps<{
  comet: Comet
}>()

const emit = defineEmits<{
  (e: 'register', id: number, root: HTMLElement, tail: HTMLElement): void
  (e: 'unregister', id: number): void
}>()
const root = ref<HTMLElement | null>(null)
const tail = ref<HTMLElement | null>(null)

onMounted(() => {
  if (root.value && tail.value) {
    emit('register', props.comet.id, root.value, tail.value)
  }
})

onUnmounted(() => {
  emit('unregister', props.comet.id)
})
</script>
<style scoped lang="scss">
.comet {
  position: absolute;
  width: rem(4);
  height: rem(4);
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.8);

  &__tail {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: rem(2);
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.9)
    );
    pointer-events: none;
  }
}
</style>

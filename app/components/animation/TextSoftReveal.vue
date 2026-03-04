<template>
  <span ref="textSoftReveal" class="text-reveral">
    {{ text }}
  </span>
</template>

<script lang="ts" setup>
import { createTextSoftReveal } from '~/utils/animations'
import { animationController } from '~/utils/animations/animationController'

defineProps<{
  text: string
}>()

const textSoftReveal = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!textSoftReveal.value) return
  await animationController.waitAll()
  createTextSoftReveal(textSoftReveal.value)
})
</script>

<style lang="scss" scoped>
.text-reveral {
  opacity: 0;
  will-change: transform, opacity, filter;
}
</style>

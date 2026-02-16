<template>
  <span ref="textSoftReveal">
    {{ text }}
  </span>
</template>

<script lang="ts" setup>
import { onMounted, ref, type ComponentPublicInstance } from 'vue'
import { createTextSoftReveal } from '~/utils/animations'

defineProps<{
  text: string
}>()
const textSoftReveal = ref<ComponentPublicInstance | null>(null)

onMounted(() => {
  if (!textSoftReveal.value) return
  createTextSoftReveal(textSoftReveal.value)
})
</script>

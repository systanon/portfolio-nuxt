<template>
  <span v-for="(char, i) in chars" ref="charList" :key="i" class="char">
    {{ char === ' ' ? '\u00A0' : char }}
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type ComponentPublicInstance } from 'vue'
import { createTextAssembly } from '~/animations'
import { animationController } from '~/animations/animationController'

const props = defineProps<{
  text: string
}>()

const charList = ref<ComponentPublicInstance[]>([])

const chars = computed(() => {
  return props.text.split('')
})

onMounted(async () => {
  await animationController.waitAll()
  createTextAssembly(charList.value)
})
</script>

<style scoped>
.char {
  display: inline-block;
  opacity: 0;
  will-change: transform, opacity, filter;
}
</style>

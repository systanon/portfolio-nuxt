<template>
  <span ref="charList" v-for="(char, i) in chars" :key="i" class="char">
    {{ char === ' ' ? '\u00A0' : char }}
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type ComponentPublicInstance } from 'vue'
import { createTextAssembly } from '~/utils/animations'

const props = defineProps<{
  text: string
}>()

const charList = ref<ComponentPublicInstance[]>([])

const chars = computed(() => {
  return props.text.split('')
})

onMounted(() => {
  createTextAssembly(charList.value)
})
</script>

<style scoped>
.char {
  display: inline-block;
  will-change: transform, opacity, filter;
}
</style>

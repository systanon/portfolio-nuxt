<template>
  <canvas ref="canvasRef" class="universe"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Universe } from '~/utils/canvas/universe'

const canvasRef = ref<HTMLCanvasElement | null>(null)

let universe: Universe | null = null

onMounted(() => {
  const canvas = canvasRef.value!

  universe = new Universe(canvas)
  universe.start()
})

onBeforeUnmount(() => {
  universe?.destroy()
})
</script>

<style scoped>
.universe {
  position: fixed;
  inset: 0;
  background: var(--space-bg);
}
</style>

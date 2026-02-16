<template>
  <div class="comets-field">
    <CometItem
      v-for="comet in comets"
      :key="comet.id"
      :comet="comet"
      @register="handleRegister"
      @unregister="handleUnregister"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { type Comet } from '~/utils/animations/cometEngine'
import { cometsEngine } from '~/utils/animations'

const comets = ref<Comet[]>([])
let unsubscribe: (() => void) | null = null

const handleRegister = (id: number, root: HTMLElement, tail: HTMLElement) => {
  cometsEngine.registerCometElement(id, root, tail)
}
const handleUnregister = (id: number) => {
  cometsEngine.unregisterCometElement(id)
}

onMounted(async () => {
  unsubscribe = cometsEngine.subscribe((updated) => {
    comets.value = updated
  })

  cometsEngine.start()
})

onUnmounted(() => {
  cometsEngine.stop()
  unsubscribe?.()
})
</script>

<style scoped lang="scss">
.comets-field {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: -5;
}
</style>

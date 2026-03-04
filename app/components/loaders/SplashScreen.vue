<template>
  <div class="splash-screen" ref="splashRef">
    <Universe />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { animationController } from '~/utils/animations/animationController'
import { delay } from '~/utils/delay'
import { createSplash } from '~/utils/animations'

const emit = defineEmits<{
  (e: 'finished'): void
}>()

const application = useApp()

const splashRef = ref<HTMLElement | null>(null)

const { hideSplash } = createSplash()

application.profileLoading.finally(() => {
  animationController.start(
    (async () => {
      await delay(600)
      await hideSplash(splashRef.value)
      emit('finished')
    })(),
  )
})
</script>

<style scoped lang="scss">
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  will-change: transform, opacity;
}
</style>

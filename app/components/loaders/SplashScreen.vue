<template>
  <div class="splash-screen" ref="splashRef">
    <Universe />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { animationController } from '~/utils/animations/animationController'
import { createSplash } from '~/utils/animations'
import { ensureMinDelay } from '~/utils/ensureMinDelay'

const emit = defineEmits<{
  (e: 'finished'): void
}>()

const application = useApp()

const splashRef = ref<HTMLElement | null>(null)

const { hideSplash } = createSplash()

onMounted(() => {
  const animation = (async () => {
    await ensureMinDelay(application.appLoading, 600)
    await hideSplash(splashRef.value)
    emit('finished')
  })()

  animationController.start(animation)
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

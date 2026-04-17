<template>
  <div class="splash-screen" ref="splashRef">
    <Universe />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { animationController } from '~/animations/animationController'
import { createSplash } from '~/animations'
import { ensureMinDelay } from '~/utils/ensureMinDelay'

const emit = defineEmits<{
  (e: 'finished'): void
}>()

const splashRef = ref<HTMLElement | null>(null)

const { hideSplash } = createSplash()

onMounted(() => {
  const application = useClientApp()
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
  z-index: var(--z-splash-screen);
  will-change: transform, opacity;
}
</style>

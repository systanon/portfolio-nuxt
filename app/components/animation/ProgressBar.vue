<template>
  <div :class="['progress-bar', { _progress: progress }]" ref="progressBar">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { createProgressAnimation } from '~/utils/animations'

export interface IProgressBar {
  play: (
    duration: number,
    onComplete?: () => void,
    update?: (tween: gsap.core.Tween) => void,
  ) => void
  reset: () => void
  pause: () => void
  resume: () => void
  seek: () => void
  getTween: () => gsap.core.Tween
}

const props = withDefaults(
  defineProps<{
    progress?: boolean
  }>(),
  {
    progress: true,
  },
)

const play = ref<
  (
    duration: number,
    onComplete?: () => void,
    update?: (tween: gsap.core.Tween) => void,
  ) => void
>(() => {})
const reset = ref<() => void>(() => {})
const pause = ref<() => void>(() => {})
const resume = ref<() => void>(() => {})
const seek = ref<(progress: number) => void>(() => {})
const getTween = ref<() => gsap.core.Tween | null>()
const progressBar = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (!progressBar.value) return
  const progress = createProgressAnimation(progressBar.value, props.progress)

  play.value = progress.play
  reset.value = progress.reset
  pause.value = progress.pause
  resume.value = progress.resume
  seek.value = progress.seek
  getTween.value = progress.getTween
})

defineExpose({
  play: (
    duration: number,
    onComplete?: () => void,
    update?: (tween: gsap.core.Tween) => void,
  ) => play.value(duration, onComplete, update),
  pause: () => pause.value(),
  resume: () => resume.value(),
  seek: (progress: number) => seek.value(progress),
  reset: () => reset.value(),
  getTween: () => getTween.value?.(),
})
</script>

<style scoped lang="scss">
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  max-height: rem(15);
  background-color: var(--bg-progress-bar);
  width: 100%;
  &._progress {
    width: 0;
  }
}
</style>

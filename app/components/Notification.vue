<template>
  <article
    :class="['notification', `_${payload.type}`]"
    role="status"
    @mouseenter="onPointerEnter"
    @mouseleave="onPointerLeave"
  >
    <div class="notification__body">
      <p class="notification__message">{{ payload.message }}</p>
      <UiButtonIcon
        icon-name="close-square"
        @click="dismiss"
        only-icon
        :with-border="false"
      />
    </div>
    <ProgressBar
      ref="progressBarEl"
      class="notification__progress-bar"
      :progress="false"
      aria-hidden="true"
    />
  </article>
</template>

<script lang="ts" setup>
import type { NotificationPayload } from '~/application/services/notification.service'
import type { IProgressBar } from './animation/ProgressBar.vue'

const props = defineProps<{
  payload: NotificationPayload
}>()

const emit = defineEmits<{
  (e: 'close', id: string): void
}>()

const progressBarEl = ref<IProgressBar | null>(null)

onMounted(() => {
  progressBarEl.value?.play(props.payload.durationMs / 1000)
})

onUnmounted(() => {
  progressBarEl.value?.reset()
})

function onPointerEnter() {
  props.payload.pause()
  progressBarEl.value!.pause()
}

function onPointerLeave() {
  props.payload.resume()
  progressBarEl.value!.resume()
}

function dismiss() {
  emit('close', props.payload.id)
}
</script>

<style scoped lang="scss">
.notification {
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: rem(8);
  border: 1px solid var(--border-color);

  &__body {
    display: flex;
    align-items: flex-start;
    align-items: center;
    gap: rem(12);
    padding: rem(14) rem(12) rem(14) rem(16);
  }

  &__message {
    flex: 1;
    font-size: rem(15);
    color: var(--text-color-secondary);
  }
  &__progress-bar {
    height: rem(5);
  }

  &._success {
    background-color: var(--success);
  }

  &._error {
    background-color: var(--error);
  }

  &._info {
    background-color: var(--info);
  }
}
</style>

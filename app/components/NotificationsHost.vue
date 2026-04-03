<template>
  <Teleport to="body">
    <div
      class="notifications-host"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      <Notification
        v-for="item in items"
        :key="item.id"
        :payload="item"
        @close="handleClose"
      />
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
const notificationService = useNotification()
const handleClose = (id: string) => {
  notificationService.remove(id)
}
const items = computed(() => [...notificationService.notifications.values()])
</script>

<style scoped lang="scss">
.notifications-host {
  position: fixed;
  top: rem(72);
  left: 50%;
  transform: translateX(-50%);
  width: min(100%, rem(380));
  display: flex;
  flex-direction: column;
  gap: rem(10);
  pointer-events: none;
  z-index: var(--z-notification);
  :deep(.notification) {
    pointer-events: auto;
  }
}
</style>

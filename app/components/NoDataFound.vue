<template>
  <div class="no-data-found">
    <span class="no-data-found__label">{{ label }}</span>
  </div>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'No data found',
  },
)
</script>

<style lang="scss" scoped>
.no-data-found {
  text-align: center;
  padding-top: rem(100);
  &__label {
    color: var(--text-color-primary);
    font-size: rem(22);
  }
}
</style>

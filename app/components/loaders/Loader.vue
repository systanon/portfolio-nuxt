<template>
  <div class="loader">
    <UiIcon name="quantum-loader" :width="rem(80)" :height="rem(80)" />
  </div>
</template>
<script lang="ts" setup>
import { rem } from '@/utils/rem'
</script>

<style scoped>
.loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

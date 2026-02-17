<template>
  <AppLink to="/" @navigate="(navigate) => navigate()">
    <UiIcon name="logo" :width="rem(109)" :height="rem(97)" />
  </AppLink>
</template>

<script lang="ts" setup>
import { rem } from '@/utils/rem'
</script>

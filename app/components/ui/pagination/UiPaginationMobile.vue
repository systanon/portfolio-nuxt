<template>
  <div v-if="pages > 1" class="ui-pagination-mobile">
    <UiButtonIcon
      @click="$emit('prevPage')"
      :disabled="page <= 1"
      iconName="left-arrow"
      :withBorder="false"
      class="ui-pagination-mobile__arrow"
    />

    <span class="ui-pagination-mobile__info"> {{ page }} / {{ pages }} </span>

    <UiButtonIcon
      @click="$emit('nextPage')"
      :disabled="page >= pages"
      iconName="right-arrow"
      :withBorder="false"
      class="ui-pagination-mobile__arrow"
    />
  </div>
</template>

<script lang="ts" setup>
import UiButtonIcon from '@/components/ui/buttons/UiButtonIcon.vue'

interface Pagination {
  page: number
  pages: number
}

withDefaults(defineProps<Pagination>(), {
  page: 1,
  pages: 1,
})
</script>

<style lang="scss" scoped>
.ui-pagination-mobile {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: rem(16);
  padding: rem(20) 0;

  &__info {
    color: var(--text-active-primary);
  }
}
</style>

<template>
  <section v-if="pages > 1" class="ui-pagination">
    <div v-if="isMobile || isTablet" class="ui-pagination__mobile">
      <UiButtonIcon
        :disabled="page <= 1"
        icon-name="left-arrow"
        :with-border="false"
        class="ui-pagination__mobile-arrow"
        @click="$emit('prevPage')"
      />

      <span class="ui-pagination__mobile-info"> {{ page }} / {{ pages }} </span>

      <UiButtonIcon
        :disabled="page >= pages"
        icon-name="right-arrow"
        :with-border="false"
        class="ui-pagination__mobile-arrow"
        @click="$emit('nextPage')"
      />
    </div>
    <div v-else class="ui-pagination__desktop">
      <UiButtonIcon
        :disabled="page <= 1"
        icon-name="left-arrow"
        :with-border="false"
        class="ui-pagination__desktop-arrows arrow-left"
        @click="$emit('firstPage')"
      />

      <UiButton
        v-if="pages > VISIBLE_PAGES"
        label="1"
        class="ui-pagination__desktop-buttons"
        :active="page === 1"
        @click="$emit('btnPage', 1)"
      />

      <span
        v-if="pages > VISIBLE_PAGES && page > range + 2"
        class="ui-pagination__desktop-dots"
        >...</span
      >

      <UiButton
        v-for="_page in visiblePages"
        :key="_page"
        class="ui-pagination__desktop-buttons"
        :active="page === _page"
        :label="_page"
        @click="$emit('btnPage', _page)"
      />

      <span
        v-if="pages > VISIBLE_PAGES && page < pages - (range + 1)"
        class="ui-pagination__desktop-dots"
        >...</span
      >

      <UiButton
        v-if="pages > VISIBLE_PAGES"
        class="ui-pagination__desktop-buttons"
        :active="page === pages"
        :label="pages"
        @click="$emit('btnPage', pages)"
      />

      <UiButtonIcon
        :disabled="page >= pages"
        :with-border="false"
        class="ui-pagination__desktop-arrows arrow-right"
        icon-name="right-arrow"
        @click="$emit('latestPage')"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
const VISIBLE_PAGES = 7

interface Pagination {
  page?: number
  pages?: number
  range?: number
}

const props = withDefaults(defineProps<Pagination>(), {
  page: 1,
  pages: 1,
  range: 2,
})

defineEmits<{
  (e: 'prevPage' | 'nextPage' | 'firstPage' | 'latestPage'): void
  (e: 'btnPage', page: number): void
}>()

const { isTablet, isMobile } = useWindowResize()

const visiblePages = computed(() => {
  if (props.pages <= VISIBLE_PAGES) {
    return Array.from({ length: props.pages }, (_, i) => i + 1)
  }

  const start = Math.max(2, props.page - props.range)
  const end = Math.min(props.pages - 1, props.page + props.range)

  const range: number[] = []
  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  return range
})
</script>

<style lang="scss" scoped>
.ui-pagination {
  &__desktop {
    width: 100%;
    display: flex;
    justify-content: center;
    text-align: center;
    gap: rem(16);
    padding: rem(30) 0;
    &-dots {
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-size: rem(40);
    }
  }
  &__mobile {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: rem(16);
    padding: rem(20) 0;

    &-info {
      color: var(--text-active-primary);
    }
  }
}
</style>

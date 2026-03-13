<template>
  <section v-if="pages > 1" class="ui-pagination">
    <div v-if="isMobile || isTablet" class="ui-pagination__mobile">
      <UiButtonIcon
        @click="$emit('prevPage')"
        :disabled="page <= 1"
        iconName="left-arrow"
        :withBorder="false"
        class="ui-pagination__mobile-arrow"
      />

      <span class="ui-pagination__mobile-info"> {{ page }} / {{ pages }} </span>

      <UiButtonIcon
        @click="$emit('nextPage')"
        :disabled="page >= pages"
        iconName="right-arrow"
        :withBorder="false"
        class="ui-pagination__mobile-arrow"
      />
    </div>
    <div v-else class="ui-pagination__desktop">
      <UiButtonIcon
        @click="$emit('firstPage')"
        :disabled="page <= 1"
        iconName="left-arrow"
        :withBorder="false"
        class="ui-pagination__desktop-arrows arrow-left"
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
        @click="$emit('btnPage', _page)"
        :label="_page"
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
        @click="$emit('latestPage')"
        :disabled="page >= pages"
        :withBorder="false"
        class="ui-pagination__desktop-arrows arrow-right"
        iconName="right-arrow"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
const VISIBLE_PAGES = 7

interface Pagination {
  page: number
  pages: number
  range?: number
}

const props = withDefaults(defineProps<Pagination>(), {
  page: 1,
  pages: 1,
  range: 2,
})
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

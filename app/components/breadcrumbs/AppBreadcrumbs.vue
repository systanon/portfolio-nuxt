<template>
  <ul class="app-breadcrumbs" v-if="breadcrumbs.length > 1">
    <li
      class="app-breadcrumbs__item"
      v-for="({ disabled, label, id, path, name }, index) in breadcrumbs"
      :key="id"
    >
      <AppLink
        :to="path"
        :disabled="disabled"
        inactive-class="link"
        exactActiveClass="link--active"
        @navigate="(navigate: () => void) => navigate()"
      >
        {{ resolveLabel(label) }}
      </AppLink>
      <span
        v-if="index < breadcrumbs.length - 1"
        class="app-breadcrumbs__item-separator"
      >
        /
      </span>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import {
  breadcrumbsConfig,
  type BreadcrumbsItem,
  type Breadcrumbs,
  type BreadcrumbLabel,
} from '~/components/breadcrumbs/breadcrumbs'
import AppLink from '~/components/AppLink.vue'

const route = useRoute()
const routes = breadcrumbsConfig

function resolveLabel(label: BreadcrumbLabel): string {
  return typeof label === 'function' ? label() : label
}

function createBreadcrumbs(current: BreadcrumbsItem | undefined): Breadcrumbs {
  if (!current) return []

  const parent = routes.find((r) => r.id === current.parentId)

  return [current].concat(createBreadcrumbs(parent))
}

const breadcrumbs = computed<Breadcrumbs>(() => {
  const currentRoute = routes.find((r) => r.name === route.name)
  if (!currentRoute) return []

  return createBreadcrumbs(currentRoute)
    .map((item, index) => ({
      ...item,
      disabled: index === 0,
    }))
    .reverse()
})
</script>

<style lang="scss" scoped>
.app-breadcrumbs {
  padding-top: rem(20);
  display: flex;
  flex-wrap: wrap;
  gap: rem(5);
}
</style>

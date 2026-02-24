<template>
  <nav class="navigation-menu">
    <div class="navigation-menu__items _left">
      <AppLink
        v-for="{ path, text } in left"
        :key="path"
        :to="path"
        inactive-class="link"
        exactActiveClass="link--active"
        @navigate="onLinkNavigate"
      >
        {{ text }}
      </AppLink>
    </div>
    <Logo />
    <div class="navigation-menu__items _right">
      <AppLink
        v-for="{ path, text } in right"
        :key="path"
        :to="path"
        inactive-class="link"
        exactActiveClass="link--active"
        @navigate="onLinkNavigate"
      >
        {{ text }}
      </AppLink>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { byAuthorized, rightSide, leftSide } from '~/config/main-menu'
import { useAppStore } from '~/store/application'

const appStore = useAppStore()

const right = computed(() => {
  return rightSide.filter(byAuthorized(appStore.isLogged))
})

const left = computed(() => {
  return leftSide.filter(byAuthorized(appStore.isLogged))
})

const onLinkNavigate = (navigate: () => void) => {
  navigate()
}
</script>
<style scoped lang="scss">
.navigation-menu {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;

  &__items {
    display: flex;
    gap: rem(25);
  }
  & ._left {
    justify-content: flex-start;
  }
  & ._right {
    justify-content: flex-end;
  }
}
</style>

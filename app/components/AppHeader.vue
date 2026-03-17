<template>
  <header class="app-header">
    <div class="container">
      <div class="app-header__wrapper">
        <ClientOnly>
          <template v-if="isMobile || isTablet">
            <Logo />
            <NavigationMenuMobile />
          </template>
          <NavigationMenu v-else />
        </ClientOnly>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
const { isTablet, isMobile } = useWindowResize()
</script>

<style scoped lang="scss">
.app-header {
  padding: rem(16);

  &__wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
@include media-query('tablet') {
  .app-header {
    padding: rem(32);
  }
}
</style>

<template>
  <header class="app-header">
    <div class="container">
      <div class="app-header__wrapper">
        header
      </div>
    </div>
  </header>
</template>

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

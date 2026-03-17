<template>
  <div class="app-footer">
    <MainFooter />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.app-footer {
  position: relative;

  &:before {
    background-image: url('~/assets/images/moon-planet.webp');
    content: '';
    position: fixed;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    transform: translateY(30%);
    z-index: -1;
  }
}

@media screen and (min-width: 1921px) {
  .app-footer {
    &:before {
      background-size: cover;
      background-repeat: no-repeat;
    }
  }
}
</style>

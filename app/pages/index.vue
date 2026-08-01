<template>
  <div class="home-page">
    <h2 class="home-page__sub-title">
      <TextAssembly text="Frontend Developer (Vue.js)" />
    </h2>
    <h1 class="home-page__title">
      <TextSoftReveal text="Serhii Tustanovskyi" />
    </h1>

    <section class="home-page__tech">
      <h2 class="home-page__tech-title">My common stack</h2>
      <CardListPulse :tech-list="techList" />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Tech } from '~/components/animation/CardListPulse.vue'

definePageMeta({
  accessMode: 'public',
})

useHead({ titleTemplate: '%s' })
useSeoMeta({
  title: 'Serhii Tustanovskyi — Frontend Developer (Vue.js)',
  description:
    'Frontend Developer specializing in Vue.js, TypeScript and Nuxt, with hands-on experience in Golang and REST APIs. See my stack and get in touch.',
})

const techList: Tech[] = [
  {
    icon: 'vue-logo',
    text: 'Vue.js',
    width: 40,
    height: 35,
  },
  {
    icon: 'typescript-logo',
    text: 'TypeScript',
    width: 55,
    height: 35,
  },
  {
    icon: 'golang-logo',
    text: 'Golang',
    width: 96,
    height: 35,
  },
  {
    icon: 'person-logo',
    text: 'About me',
    width: 35,
    height: 35,
    hasIcon: true,
  },
]
</script>

<style scoped lang="scss">
.home-page {
  text-align: center;
  &__title {
    padding-bottom: rem(100);
    & * {
      color: var(--text-color-primary);
    }
  }
  &__sub-title {
    padding-bottom: rem(25);
    color: var(--text-color-secondary);
  }
  &__description {
    background-color: var(--bg-primary);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(16);
    margin: 0 auto;
    padding: rem(45);
    max-width: rem(550);
    &-text {
      line-height: rem(35);
      font-size: rem(18);
    }
  }
  &__action-btn {
    background-color: var(--btn-bg-color-primary);
  }
  &__tech-title {
    padding-bottom: rem(70);
  }
}
@include media-query('tablet') {
  .home-page {
    &__title {
      font-size: rem(110);
    }
    &__sub-title {
      font-size: rem(45);
    }
  }
}
</style>

<template>
  <section class="about-page">
    <h2 class="about-page__title">About Me</h2>

    <div class="about-page__description">
      <p class="about-page__description-text">
        My name is Serhii Tustanovskyi. I am a Front-End Developer with over 5
        years of professional experience, specializing in building complex web
        applications. I have worked on crypto trading platforms, e-commerce
        systems, and internal frameworks. My primary stack includes Vue.js,
        TypeScript, and modern frontend tooling. I focus on clean UI/UX,
        pixel-perfect layouts, reusable components, and maintainable
        architecture. I apply best practices such as SOLID, DRY, and KISS to
        build scalable and reliable solutions. I also have hands-on experience
        with Golang and REST APIs, which helps me collaborate effectively with
        backend and DevOps teams and understand the full application
        architecture. For a detailed overview of my experience and technical
        skills, you can download my CV.
      </p>
      <UiButtonIcon icon-name="download" @click="openForm">
        <template #prepend> <span>Download CV</span> </template>
      </UiButtonIcon>
    </div>
  </section>

  <UiModal ref="cvModalRef" title="Download CV">
    <CvForm ref="cvFormRef" />
    <template #actions="{ close }">
      <UiButton label="Cancel" @click="close" />
      <UiButton label="Submit" @click="submitForm" />
    </template>
  </UiModal>
</template>
<script setup lang="ts">
import type { IModalOpen } from '~/components/ui/modals/UiModal.vue'
import { AppError } from '~/types/app-errors'

definePageMeta({
  accessMode: 'public',
})

useSeoMeta({
  title: 'About Me',
  description:
    'Serhii Tustanovskyi — Front-End Developer with 5+ years of experience building complex web applications with Vue.js and TypeScript. Download my CV.',
})

const { $api } = useNuxtApp()

const cvModalRef = ref<IModalOpen | null>(null)
const cvFormRef = ref()

const submitForm = async () => {
  const data = await cvFormRef.value?.validateAndGet()
  if (!data) return

  const res = await $api.statistic.save(data)
  if (!(res instanceof AppError)) {
    cvModalRef.value?.confirm(true)
  }
}

const openForm = async () => {
  await cvModalRef.value?.open()
}
</script>

<style scoped lang="scss">
.about-page {
  text-align: center;
  &__title {
    color: var(--text-color-primary);
    text-shadow: var(--text-shadow);
    padding-bottom: rem(40);
  }
  &__description {
    background-color: var(--bg-primary);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(16);
    margin: 0 auto;
    padding: rem(45);
  }
  &__description-text {
    line-height: rem(35);
    font-size: rem(18);
  }
}
</style>

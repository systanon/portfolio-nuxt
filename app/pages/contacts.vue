<template>
  <section class="contacts-page">
    <div class="contacts-page__wrapper backdrop">
      <h2 class="contacts-page__title">My Contacts</h2>
      <p class="contacts-page__subtitle">
        If you want to discuss a project, collaboration, or have any questions —
        feel free to contact me.
      </p>

      <ul class="contacts-page__list">
        <li
          v-for="({ label, text, href, external }, index) of socialLinks"
          :key="index"
          class="contacts-page__list-item"
        >
          <span class="contacts-page__list-item-label">{{ label }}:</span>
          <a
            class="contacts-page__list-item-link"
            :href="href"
            :target="external ? '_blank' : undefined"
            :rel="external ? 'noopener noreferrer' : undefined"
            >{{ text }}</a
          >
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { socialLinks } from '~/config/social-links'
definePageMeta({
  accessMode: 'public',
})

useSeoMeta({
  title: 'Contacts',
  description:
    'Get in touch with Serhii Tustanovskyi for project collaboration, freelance work, or questions — email, LinkedIn, Telegram, WhatsApp and GitHub.',
})
</script>

<style scoped lang="scss">
.contacts-page {
  display: flex;
  justify-content: center;
  &__wrapper {
    padding: rem(15);
    width: 100%;
    max-width: rem(800);
  }
  &__title {
    text-align: center;
    padding-bottom: rem(20);
  }
  &__subtitle {
    padding-bottom: rem(20);
  }
  &__list {
    display: flex;
    flex-direction: column;
    gap: rem(15);
    padding-bottom: rem(15);
  }
  &__list-item {
    display: grid;
    grid-auto-flow: row;
    gap: rem(10);
  }
}

@include media-query('tablet') {
  .contacts-page {
    &__list-item {
      grid-template-columns: 0.2fr 1fr;
      grid-auto-flow: column;
    }
  }
}
</style>

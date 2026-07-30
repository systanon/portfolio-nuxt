// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // global ignores: no `files`/`rules` here on purpose — a bare `ignores`
    // block applies project-wide, same as the old .eslintignore
    ignores: [
      'notes/**',
      'app/assets/sprite/gen/**',
      'app/application/modules/sync/sync.mock.ts',
    ],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Vue 3 fully supports multi-root templates; this project intentionally
      // renders page content + modal(s) as sibling roots in several pages.
      'vue/no-multiple-template-root': 'off',
    },
  },
  {
    // Single-word names are intentional for these generic/shared components;
    // scoped to just these files so we don't clobber the base preset's own
    // (correct) handling of pages/layouts and other components.
    files: [
      'app/components/Card.vue',
      'app/components/Logo.vue',
      'app/components/Notification.vue',
    ],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
)

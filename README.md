# Serhii Tustanovskyi — Portfolio

Personal portfolio site, built with Nuxt 4 / Vue 3 / TypeScript. Live at [tustanovskyi.com](https://tustanovskyi.com).

Besides the portfolio pages (home, about, contacts), the app ships a small full-stack demo — Google/email auth, a Todos app and a Notes app with real-time updates and cross-tab sync — as a way to show the stack in practice rather than just describe it.

## Tech stack

- **Framework:** Nuxt 4, Vue 3 (Composition API, `<script setup>`), TypeScript (strict)
- **State:** Pinia
- **Forms/validation:** Vuelidate
- **Styling:** SCSS
- **Linting/formatting:** ESLint (`@nuxt/eslint`, flat config) + Prettier
- **Testing:** Vitest (`@nuxt/test-utils`, component/integration tests) and Node's built-in test runner (unit tests for the application layer)
- **Git hooks:** Husky + lint-staged (pre-commit) and full lint+test (pre-push)

## Architecture

Requests flow through a layered structure:

```
HTTP client (lib/http.client.ts)
  → Services (application/services/*.ts)       — pure data access, no side effects
    → Application classes (application/*.application.ts) — orchestration, error notifications
      → Composables (composables/use*.ts)
        → Pinia stores (store/*.ts)
          → Components / Pages
```

Dependency injection happens via numbered Nuxt plugins (`plugins/01.application.ts`, `02.http.ts`, `03.services.ts`, `04.application-listeners.ts`, …) that control load order.

Real-time updates use a single `WSService` WebSocket connection (topic-based pub/sub, exponential-backoff reconnect), combined with a `SharedWorker`-backed sync module that keeps auth state and events in sync across browser tabs.

### MVVM

Vue itself follows MVVM: the `<template>` is the View, and each component's `<script setup>` (reactive refs/computed/methods) is the ViewModel that the View binds to declaratively. This project makes that explicit and extends it by splitting the Model further:

- **Model** — `Services` (pure data access), `Application` classes (business rules, error notifications), and Pinia `stores` (state)
- **ViewModel** — composables (`useAuth`, `useFilters`, `usePaginatedRoute`, …) and each component's own reactive state, which adapt the Model for binding
- **View** — the `<template>` blocks

## Getting started

Requires Node `>=22.22.2` and pnpm `>=10.0.0`.

```bash
pnpm install
```

Create a `.env` file (see `.env` in the repo for the full list) with at least:

```bash
API_BASE=/api/v1
GO_BACKEND_URL=http://127.0.0.1:3000
GO_BACKEND_INTERNAL=http://127.0.0.1:3000/v1
WS_API=ws://127.0.0.1:3000/v1/ws
GOOGLE_AUTH_URL=http://127.0.0.1:3000/v1/auth/google
```

The app expects a compatible Go backend for auth, todos, notes and WebSocket features; without it, the static/portfolio pages (home, about, contacts) still work fine.

Start the dev server on `http://localhost:3001`:

```bash
pnpm dev
```

## Scripts

| Script                         | Description                                            |
| ------------------------------ | ------------------------------------------------------ |
| `pnpm dev`                     | Start the dev server                                   |
| `pnpm build`                   | Production build                                       |
| `pnpm generate`                | Static site generation                                 |
| `pnpm preview`                 | Preview a production build locally                     |
| `pnpm lint` / `lint:fix`       | Run ESLint / auto-fix                                  |
| `pnpm format` / `format:check` | Run Prettier / check formatting                        |
| `pnpm test`                    | Run the full test suite (unit + component/integration) |
| `pnpm test:unit`               | Node test runner — application layer unit tests        |
| `pnpm test:ui`                 | Vitest — component and integration tests               |

## Project structure

```
app/
  application/    business logic: services, application classes, sync/notification modules
  components/     Vue components (incl. ui/ design-system primitives)
  composables/    use*.ts composables
  layouts/        page layouts
  pages/          file-based routes
  plugins/        Nuxt plugins (DI, listeners, WS init)
  store/          Pinia stores
  types/          shared TypeScript types
test/
  unit/           node:test — application layer
  nuxt/           vitest — components, lib
```

## Contact

- Email: [serhii.tustanovskyi88@gmail.com](mailto:serhii.tustanovskyi88@gmail.com)
- LinkedIn: [serhii-tustanovskyi-b38055181](https://www.linkedin.com/in/serhii-tustanovskyi-b38055181/)
- GitHub: [github.com/systanon](https://github.com/systanon)

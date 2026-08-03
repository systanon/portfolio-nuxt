# Serhii Tustanovskyi — Portfolio

Personal portfolio site, built with Nuxt 4 / Vue 3 / TypeScript. Live at [app.tustanovskyi.com](https://app.tustanovskyi.com), server-rendered (SSR).

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

Create a `.env` file (see `.env.example` for the full list, including the production/VPS variant) with at least:

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

## Deployment (CI/CD)

This automates what was previously a manual `pnpm build` + `scp` to the VPS. `.github/workflows/deploy.yml` runs on every push to `master` (or manually via "Run workflow"):

1. Install, lint, test
2. `pnpm build` → produces `.output/`
3. `scp` `.output/`, `Dockerfile`, `deploy.sh` to `VPS_DEPLOY_PATH` on the VPS over SSH
4. SSH into the VPS and run `deploy.sh`, which rebuilds the `nuxt-ssr-app` Docker image, restarts the `nuxt_app` container (env vars from `nuxt.env`, already on the VPS — not touched by CI) and reconnects it to the `go-backend_default` Docker network

`nuxt.env` lives only on the VPS (next to `Dockerfile`/`deploy.sh` in `VPS_DEPLOY_PATH`) and is never committed or uploaded by CI.

**Runtime vs. build-time config matters here.** `nuxt.config.ts`'s `runtimeConfig` defaults are read via `process.env.X` — but that code only runs at `pnpm build` time, on whichever machine does the build. Nitro separately supports overriding `runtimeConfig` at container **startup**, but only via env vars prefixed `NUXT_`/`NUXT_PUBLIC_` (matching the key path, e.g. `runtimeConfig.public.googleAuthURL` → `NUXT_PUBLIC_GOOGLE_AUTH_URL`). Plain names like `GOOGLE_AUTH_URL` do **not** override anything at runtime — they only affect what gets baked in if they happen to be set correctly wherever the build ran. `nuxt.env` on the VPS must use the prefixed names so production always reflects `nuxt.env`, regardless of what the build machine's environment looked like:

```bash
NUXT_API_INTERNAL=http://go_app:3000/v1
NUXT_PUBLIC_API_BASE=/api/v1
NUXT_PUBLIC_WS_URL=wss://tustanovskyi.com/v1/ws
NUXT_PUBLIC_API_URL=https://tustanovskyi.com
NUXT_PUBLIC_GOOGLE_AUTH_URL=https://app.tustanovskyi.com/v1/auth/google
NUXT_PUBLIC_SITE_URL=https://app.tustanovskyi.com
```

`GO_BACKEND_URL` is the one value that can't work this way — `routeRules['/api/**']` in `nuxt.config.ts` is resolved into static Nitro route rules at build time, with no runtime-override mechanism, so it must be set correctly wherever `pnpm build` runs. In CI that's the `GO_BACKEND_URL` **repository variable**; for a manual local build, export it in the shell first.

**Required in the GitHub repo settings (Settings → Secrets and variables → Actions):**

| Name              | Type     | Value                                                   |
| ----------------- | -------- | ------------------------------------------------------- |
| `VPS_HOST`        | Secret   | VPS IP or hostname                                      |
| `VPS_USER`        | Secret   | SSH user on the VPS (e.g. `root`)                       |
| `VPS_SSH_KEY`     | Secret   | Private key with access to the VPS                      |
| `VPS_SSH_PORT`    | Secret   | SSH port, if not `22` (optional)                        |
| `VPS_DEPLOY_PATH` | Secret   | Directory on the VPS with `nuxt.env` (`/usr/local/ssr`) |
| `GO_BACKEND_URL`  | Variable | `https://tustanovskyi.com`                              |

`VPS_SSH_KEY` can be the same key you already use for manual `scp` deploys (`~/.ssh/id_newkey_contabo_v2`) — paste its private key contents into the secret. If you'd rather not give CI the same key you use interactively, generate a deploy-only pair instead and add its public half to `authorized_keys` on the VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N ""
```

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

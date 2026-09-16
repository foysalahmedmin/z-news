# Z-News Monorepo

pnpm workspace with two apps and a shared infra folder:

- `apps/frontend` — Next.js public website (will also host the admin dashboard under `(dashboard)/admin`)
- `apps/backend` — Express/MongoDB API server
- `infra/` — Docker, nginx, and monitoring config for `apps/backend` (see `infra/docker/`)

Each app under `apps/` was merged from a previously separate repository, with full commit history preserved (`git log -- apps/backend` etc. only shows the merge commit itself — see `git log <merge-commit>^2` for the pre-merge history of each app). `apps/adminpanel` is a legacy standalone Vite + React Router admin panel being ported into `apps/frontend` and will be removed once that migration is complete.

## Getting started

```bash
pnpm install
pnpm dev:frontend   # apps/frontend on its own dev server
pnpm dev:backend    # apps/backend on its own dev server
```

## Backend infra

```bash
cd apps/backend
pnpm docker:dev        # lightweight dev stack: app + redis (+ mongo-express/mailhog)
pnpm docker:dev:full   # full dev stack: + kafka + rabbitmq + prometheus/grafana
pnpm docker:prod       # production stack (resource limits, healthcheck, optional nginx)
```

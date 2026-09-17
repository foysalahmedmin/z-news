# Z-News Monorepo

pnpm workspace with two apps and a shared infra folder:

- `apps/frontend` — Next.js public website and admin dashboard (public pages under `(primary)`, admin under `(dashboard)/admin`, protected by `middleware.ts`)
- `apps/backend` — Express/MongoDB API server
- `infra/` — Docker, nginx, and monitoring config for `apps/backend` (see `infra/docker/`)

Each app under `apps/` was merged from a previously separate repository, with full commit history preserved (`git log -- apps/backend` etc. only shows the merge commit itself — see `git log <merge-commit>^2` for the pre-merge history of each app). The standalone Vite + React Router admin panel that used to live at `apps/adminpanel` has been fully ported into `apps/frontend`'s `(dashboard)/admin` route group — every page, the shared UI kit, auth, and the data layer. The `apps/adminpanel` folder itself is superseded and staged for removal (`git rm -r apps/adminpanel`); its pre-merge history will remain reachable the same way, from the commit that deletes it.

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

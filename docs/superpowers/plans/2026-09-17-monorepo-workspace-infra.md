# Monorepo Workspace & Infra Extraction — Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the bare `apps/{website,server,adminpanel}` folders into a proper pnpm workspace with `apps/frontend` + `apps/backend` (naming convention requested by the repo owner), a single root lockfile, and one canonical `infra/` folder at the repo root (Docker, nginx, monitoring) extracted out of the backend app.

**Architecture:** Rename the two apps that survive as-is (`website`→`frontend`, `server`→`backend`) with `git mv` to preserve history; leave `apps/adminpanel` in place untouched (it gets ported into `apps/frontend` in a later phase, then deleted). Add `pnpm-workspace.yaml` + a thin root `package.json` at repo root. Reconcile the backend's two drifted Docker setups (a stale top-level `Dockerfile`/`docker-compose.yml` on port 3000 vs. a more complete `infra/docker/*` on port 5000) into one canonical set, move it to root `infra/`, and fix the relative paths that break when it's no longer nested inside `apps/backend`.

**Tech Stack:** pnpm workspaces, Docker Compose (Compose Spec / BuildKit), no build orchestrator (no Turborepo/Nx — plain `pnpm --filter`).

---

## Context for the engineer (read before starting)

This repo was itself just assembled from 3 separate git repos via `git subtree`, so `apps/website`, `apps/server`, `apps/adminpanel` each carry their own full commit history and their own `pnpm-lock.yaml`. There is currently **no root `pnpm-workspace.yaml`, no root `package.json`, no root lockfile** — the repo root only has `README.md` and `apps/`.

Inside `apps/server` there are **two divergent Docker setups**:
- `apps/server/Dockerfile` + `apps/server/docker-compose.yml` — the one actually wired to `package.json`'s `docker:*` scripts. Stale: `EXPOSE 3000`, healthcheck hits port 3000, no Husky fix on the prod install step.
- `apps/server/infra/docker/*` — a fuller, more correct copy. `EXPOSE 5000` (matches `.env.example`'s `PORT=5000`), `ENV HUSKY=0` + `--ignore-scripts` on the prod install (avoids a Husky-install failure in a git-less Docker build context), plus `docker-compose.dev.yml` (full stack: kafka/rabbitmq/monitoring) and `docker-compose.prod.yml` (resource limits, healthcheck, logging, optional nginx) that aren't wired to any npm script today.

Canonical choice for this plan: **the `infra/docker/` versions win** (they're the ones that actually match `.env.example`'s port and don't have the Husky bug). The stale top-level `Dockerfile`/`docker-compose.yml`/`.dockerignore` get deleted. `docker-compose.prod.yml` becomes the real target of the `docker:prod` script (today that script just re-runs the dev compose file with env var overrides and silently skips resource limits/healthcheck/nginx — this plan fixes that).

`.dockerignore` stays inside `apps/backend/` (not inside `infra/`), because Docker reads `.dockerignore` from the **build context** directory, and the build context stays `apps/backend` — only the `Dockerfile` and compose orchestration move out to `infra/`. This requires `dockerfile:` in the compose files to point outside the build context (`../../infra/docker/Dockerfile`), which Compose supports via BuildKit (default in Docker Engine 23+/Docker Desktop).

---

## Task 1: Rename apps with git mv (preserve history)

**Files:**
- Rename: `apps/website/` → `apps/frontend/`
- Rename: `apps/server/` → `apps/backend/`

- [ ] **Step 1: Rename both folders**

```bash
cd /Users/mac/Developer/Othors/z-news/z-news
git mv apps/website apps/frontend
git mv apps/server apps/backend
```

- [ ] **Step 2: Verify history followed the rename**

Run: `git log --oneline --follow -- apps/frontend/package.json | head -3`
Expected: shows recent website commits (e.g. the "Update" commit), not empty.

Run: `git log --oneline --follow -- apps/backend/package.json | head -3`
Expected: shows recent server commits (e.g. "docs: update README...").

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: rename apps/website to apps/frontend, apps/server to apps/backend"
```

---

## Task 2: Rename package.json "name" fields to match

**Files:**
- Modify: `apps/frontend/package.json:2`
- Modify: `apps/backend/package.json:2`

- [ ] **Step 1: Rename frontend package name**

In `apps/frontend/package.json`, change:
```json
  "name": "z-news-website",
```
to:
```json
  "name": "z-news-frontend",
```

- [ ] **Step 2: Rename backend package name**

In `apps/backend/package.json`, change:
```json
  "name": "z-news",
```
to:
```json
  "name": "z-news-backend",
```

(The old name `"z-news"` collides with the root workspace package we're about to create — it also wasn't descriptive next to `z-news-adminpanel`/`z-news-website`.)

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/package.json apps/backend/package.json
git commit -m "chore: rename package.json names to z-news-frontend / z-news-backend"
```

---

## Task 3: Create the pnpm workspace root

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `.npmrc`
- Create: `.gitignore`

- [ ] **Step 1: Write the workspace manifest**

`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
```

- [ ] **Step 2: Write the root package.json**

`package.json`:
```json
{
  "name": "z-news",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev:frontend": "pnpm --filter z-news-frontend dev",
    "dev:backend": "pnpm --filter z-news-backend dev",
    "build:frontend": "pnpm --filter z-news-frontend build",
    "build:backend": "pnpm --filter z-news-backend build",
    "lint": "pnpm -r run lint",
    "lint:fix": "pnpm -r run lint:fix"
  }
}
```

- [ ] **Step 3: Write root .npmrc**

`.npmrc`:
```
engine-strict=true
```

- [ ] **Step 4: Write root .gitignore**

`.gitignore`:
```
node_modules/
.DS_Store
*.log
```

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml package.json .npmrc .gitignore
git commit -m "chore: add pnpm workspace root"
```

---

## Task 4: Consolidate to a single root lockfile

**Files:**
- Delete: `apps/frontend/pnpm-lock.yaml`
- Delete: `apps/backend/pnpm-lock.yaml`
- Delete: `apps/adminpanel/pnpm-lock.yaml`
- Create: `pnpm-lock.yaml` (generated, repo root)

- [ ] **Step 1: Remove the three per-app lockfiles**

```bash
git rm apps/frontend/pnpm-lock.yaml apps/backend/pnpm-lock.yaml apps/adminpanel/pnpm-lock.yaml
```

- [ ] **Step 2: Install from the workspace root to generate one lockfile**

```bash
cd /Users/mac/Developer/Othors/z-news/z-news
pnpm install
```
Expected: a single `pnpm-lock.yaml` appears at the repo root; `node_modules` created at root with workspace symlinks into each `apps/*`. No `ERR_PNPM_*` errors.

- [ ] **Step 3: Verify each app still resolves its own deps**

Run: `pnpm --filter z-news-frontend exec next --version`
Expected: prints a `15.x` version.

Run: `pnpm --filter z-news-backend exec tsc --version`
Expected: prints a `5.x` version.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: consolidate to a single root pnpm-lock.yaml"
```

---

## Task 5: Delete the stale top-level Docker files in apps/backend

**Files:**
- Delete: `apps/backend/Dockerfile`
- Delete: `apps/backend/docker-compose.yml`

- [ ] **Step 1: Remove them**

```bash
cd /Users/mac/Developer/Othors/z-news/z-news
git rm apps/backend/Dockerfile apps/backend/docker-compose.yml
```

(Keep `apps/backend/.dockerignore` — it stays, per the Context note above.)

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: remove stale port-3000 Dockerfile/compose superseded by infra/docker"
```

---

## Task 6: Move infra/ to the repo root with corrected paths

**Files:**
- Move: `apps/backend/infra/docker/Dockerfile` → `infra/docker/Dockerfile`
- Move: `apps/backend/infra/docker/docker-compose.dev.yml` → `infra/docker/docker-compose.dev.yml`
- Move: `apps/backend/infra/docker/docker-compose.prod.yml` → `infra/docker/docker-compose.prod.yml`
- Move: `apps/backend/infra/docker/docker-compose.kafka.yml` → `infra/docker/docker-compose.kafka.yml`
- Move: `apps/backend/infra/docker/docker-compose.rabbitmq.yml` → `infra/docker/docker-compose.rabbitmq.yml`
- Delete: `apps/backend/infra/docker/docker-compose.yml` (redundant duplicate of the old top-level one, unused by any script)
- Delete: `apps/backend/infra/docker/.dockerignore` (duplicate; `apps/backend/.dockerignore` is the one Docker actually reads)
- Create: `infra/docker/docker-compose.yml` (rewritten from the old `apps/backend/docker-compose.yml`, now deleted in Task 5 — recreated here with corrected paths)
- Move: `apps/backend/infra/nginx/nginx.conf` → `infra/nginx/nginx.conf`
- Move: `apps/backend/infra/monitoring/prometheus.yml` → `infra/monitoring/prometheus.yml`
- Move: `apps/backend/infra/monitoring/grafana/datasources/prometheus.yml` → `infra/monitoring/grafana/datasources/prometheus.yml`

- [ ] **Step 1: git mv the reusable pieces**

```bash
cd /Users/mac/Developer/Othors/z-news/z-news
mkdir -p infra
git mv apps/backend/infra/docker infra/docker
git mv apps/backend/infra/nginx infra/nginx
git mv apps/backend/infra/monitoring infra/monitoring
rmdir apps/backend/infra 2>/dev/null || true
git rm infra/docker/docker-compose.yml infra/docker/.dockerignore
```

- [ ] **Step 2: Rewrite infra/docker/Dockerfile's EXPOSE/healthcheck (already correct — verify only)**

Read `infra/docker/Dockerfile` and confirm it still has `EXPOSE 5000 9229`, `EXPOSE 5000`, and `CMD curl -f http://localhost:5000/health || exit 1` (it does — this file was already the corrected one, just moved). No edit needed, this step is a verification checkpoint only.

- [ ] **Step 3: Recreate infra/docker/docker-compose.yml as the canonical dev-lite compose**

Create `infra/docker/docker-compose.yml`:
```yaml
version: '3.8'

services:
  # Main Application
  app:
    build:
      context: ../../apps/backend
      dockerfile: ../../infra/docker/Dockerfile
      target: ${TARGET:-development}
    container_name: z-news-backend-app
    restart: unless-stopped
    ports:
      - '${APP_PORT:-5000}:5000'
      - '${DEBUG_PORT:-9229}:9229' # Debug port (dev only)
    env_file:
      - ../../apps/backend/.env
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      - REDIS_URL=redis://redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD:-redis123}
      - REDIS_ENABLED=${REDIS_ENABLED:-true}
      - PORT=5000
    depends_on:
      - redis
    networks:
      - app-network
    volumes:
      # Development: Mount source code for hot reload
      - ${DEV_VOLUME_MOUNT:-../../apps/backend/src:/app/src}
      - ${DEV_VOLUME_MOUNT:-../../apps/backend/package.json:/app/package.json}
      # Logs directory for both dev and prod
      - ../../apps/backend/logs:/app/logs
    command: ${DOCKER_CMD:-pnpm run start:dev}

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: z-news-backend-redis
    restart: unless-stopped
    ports:
      - '${REDIS_PORT:-6379}:6379'
    command: redis-server --requirepass ${REDIS_PASSWORD:-redis123}
    volumes:
      - redis_data:/data
    networks:
      - app-network
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', '${REDIS_PASSWORD:-redis123}', 'ping']
      interval: 30s
      timeout: 10s
      retries: 3

  # MongoDB Express (Development only)
  mongo-express:
    image: mongo-express:latest
    container_name: z-news-backend-mongo-express
    restart: unless-stopped
    ports:
      - '${MONGO_EXPRESS_PORT:-8081}:8081'
    environment:
      - ME_CONFIG_MONGODB_URL=${DATABASE_URL}
      - ME_CONFIG_BASICAUTH_USERNAME=${MONGO_EXPRESS_USER:-admin}
      - ME_CONFIG_BASICAUTH_PASSWORD=${MONGO_EXPRESS_PASS:-admin123}
    networks:
      - app-network
    profiles:
      - dev # Only start in development

  # Mailhog (Development only)
  mailhog:
    image: mailhog/mailhog:latest
    container_name: z-news-backend-mailhog
    restart: unless-stopped
    ports:
      - '${MAILHOG_SMTP_PORT:-1025}:1025'
      - '${MAILHOG_WEB_PORT:-8025}:8025'
    networks:
      - app-network
    profiles:
      - dev # Only start in development

networks:
  app-network:
    driver: bridge

volumes:
  redis_data:
    driver: local
```

(Changes from the pre-move version: `context`/`dockerfile`/`env_file`/volumes rewritten from `.`/`Dockerfile`/`.env` to `../../apps/backend/...` and `../../infra/docker/Dockerfile`, since this file now lives in `infra/docker/` instead of `apps/backend/`; container names prefixed `z-news-backend-*` instead of the old bare `z-news-*`, since this is now one of several apps in the monorepo.)

- [ ] **Step 4: Fix the `../../` paths in docker-compose.dev.yml**

In `infra/docker/docker-compose.dev.yml`, replace every `../../` with `../../apps/backend/` for the `app` service's `context`, `env_file`, and `volumes` entries. Concretely:

```yaml
  app:
    build:
      context: ../../apps/backend
      dockerfile: ../../infra/docker/Dockerfile
      target: development
    container_name: zaaz-server-app
    restart: unless-stopped
    ports:
      - '${APP_PORT:-5000}:5000'
      - '${DEBUG_PORT:-9229}:9229'
    env_file:
      - ../../apps/backend/.env
    environment:
      - NODE_ENV=development
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD:-redis123}
      - REDIS_ENABLED=true
      - RABBITMQ_URL=amqp://${RABBITMQ_USER:-admin}:${RABBITMQ_PASS:-admin123}@rabbitmq:5672
      - RABBITMQ_ENABLED=true
      - KAFKA_BROKERS=kafka:9093
      - KAFKA_ENABLED=true
      - PORT=5000
    depends_on:
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      kafka:
        condition: service_healthy
    networks:
      - dev-network
    volumes:
      - ../../apps/backend/src:/app/src
      - ../../apps/backend/package.json:/app/package.json
      - ../../apps/backend/logs:/app/logs
    command: pnpm run start:dev
```

Everything else in the file (redis, redis-commander, rabbitmq, zookeeper, kafka, kafka-ui, mongo-express, mailhog, prometheus, grafana services, networks, volumes) is unchanged — their `../monitoring/...` references stay correct since `monitoring/` is still a sibling of `docker/` under `infra/`.

- [ ] **Step 5: Fix the `../../` paths in docker-compose.prod.yml**

In `infra/docker/docker-compose.prod.yml`, apply the same rewrite to the `app` and `nginx` services:

```yaml
  app:
    build:
      context: ../../apps/backend
      dockerfile: ../../infra/docker/Dockerfile
      target: production
    container_name: zaaz-server-prod
    restart: always
    ports:
      - '${APP_PORT:-5000}:5000'
    env_file:
      - ../../apps/backend/.env.production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - REDIS_ENABLED=true
      - RABBITMQ_URL=amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@rabbitmq:5672
      - RABBITMQ_ENABLED=${RABBITMQ_ENABLED:-false}
      - KAFKA_BROKERS=kafka:9093
      - KAFKA_ENABLED=${KAFKA_ENABLED:-false}
      - CLUSTER_ENABLED=true
      - PORT=5000
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - prod-network
    volumes:
      - ../../apps/backend/logs:/app/logs:rw
      - ../../apps/backend/public:/app/public:ro
```

And further down, the `nginx` service's app-context volume:
```yaml
  nginx:
    image: nginx:alpine
    container_name: zaaz-nginx-prod
    restart: always
    depends_on:
      app:
        condition: service_healthy
    ports:
      - '${NGINX_HTTP_PORT:-80}:80'
      - '${NGINX_HTTPS_PORT:-443}:443'
    volumes:
      - ../nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ../nginx/ssl:/etc/nginx/ssl:ro
      - ../../apps/backend/public:/usr/share/nginx/html:ro
```

(`../nginx/nginx.conf` is unchanged — sibling folder under `infra/`, unaffected by the move. Only the `../../` → `../../apps/backend` app-path references change.)

Everything else (redis, rabbitmq, zookeeper, kafka, resource limits, healthchecks, logging, profiles, networks, volumes) is unchanged.

- [ ] **Step 6: docker-compose.kafka.yml and docker-compose.rabbitmq.yml need no path changes**

These two files have no `../../` app-context references (they're standalone broker stacks with no `app` service) — confirm with:
```bash
grep -n '\.\./\.\./' infra/docker/docker-compose.kafka.yml infra/docker/docker-compose.rabbitmq.yml
```
Expected: no output (no matches).

- [ ] **Step 7: Validate every compose file parses**

```bash
cd /Users/mac/Developer/Othors/z-news/z-news
docker compose -f infra/docker/docker-compose.yml config --quiet && echo OK: docker-compose.yml
docker compose -f infra/docker/docker-compose.dev.yml config --quiet && echo OK: docker-compose.dev.yml
docker compose -f infra/docker/docker-compose.prod.yml config --quiet && echo OK: docker-compose.prod.yml
docker compose -f infra/docker/docker-compose.kafka.yml config --quiet && echo OK: docker-compose.kafka.yml
docker compose -f infra/docker/docker-compose.rabbitmq.yml config --quiet && echo OK: docker-compose.rabbitmq.yml
```
Expected: each prints `OK: <file>` with no YAML/interpolation errors. (If the `docker` CLI isn't installed in this environment, skip this step and note it as a manual follow-up before first real deploy.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: extract infra/ (docker, nginx, monitoring) to repo root, fix relative paths"
```

---

## Task 7: Update apps/backend/package.json docker scripts

**Files:**
- Modify: `apps/backend/package.json` (scripts section)

- [ ] **Step 1: Replace the docker:* scripts**

Change:
```json
    "docker:dev": "TARGET=development NODE_ENV=development docker compose --profile dev up -d --build",
    "docker:dev:stop": "TARGET=development NODE_ENV=development docker compose --profile dev down",
    "docker:dev:logs": "TARGET=development NODE_ENV=development docker compose --profile dev logs -f",
    "docker:dev:shell": "docker exec -it z-news-app sh",
    "docker:dev:restart": "npm run docker:dev:stop && npm run docker:dev",
    "docker:prod": "TARGET=production NODE_ENV=production DOCKER_CMD='pnpm start' docker compose up -d --build",
    "docker:prod:stop": "TARGET=production NODE_ENV=production docker compose down",
    "docker:prod:logs": "TARGET=production NODE_ENV=production docker compose logs -f",
    "docker:prod:shell": "docker exec -it z-news-app sh",
    "docker:prod:restart": "npm run docker:prod:stop && npm run docker:prod",
    "docker:compose:up": "docker-compose -f docker-compose.yml up -d --build",
    "docker:compose:down": "docker-compose -f docker-compose.yml down",
    "docker:compose:logs": "docker-compose -f docker-compose.yml logs -f"
```
to:
```json
    "docker:dev": "TARGET=development NODE_ENV=development docker compose -f ../../infra/docker/docker-compose.yml --profile dev up -d --build",
    "docker:dev:stop": "TARGET=development NODE_ENV=development docker compose -f ../../infra/docker/docker-compose.yml --profile dev down",
    "docker:dev:logs": "TARGET=development NODE_ENV=development docker compose -f ../../infra/docker/docker-compose.yml --profile dev logs -f",
    "docker:dev:shell": "docker exec -it z-news-backend-app sh",
    "docker:dev:restart": "npm run docker:dev:stop && npm run docker:dev",
    "docker:dev:full": "docker compose -f ../../infra/docker/docker-compose.dev.yml up -d --build",
    "docker:dev:full:stop": "docker compose -f ../../infra/docker/docker-compose.dev.yml down",
    "docker:dev:full:logs": "docker compose -f ../../infra/docker/docker-compose.dev.yml logs -f",
    "docker:prod": "docker compose -f ../../infra/docker/docker-compose.prod.yml up -d --build",
    "docker:prod:stop": "docker compose -f ../../infra/docker/docker-compose.prod.yml down",
    "docker:prod:logs": "docker compose -f ../../infra/docker/docker-compose.prod.yml logs -f",
    "docker:prod:shell": "docker exec -it zaaz-server-prod sh",
    "docker:prod:restart": "npm run docker:prod:stop && npm run docker:prod"
```

(Dropped the redundant `docker:compose:*` aliases — they pointed at the same file as `docker:dev`/`docker:prod` did before, now covered by those. Added `docker:dev:full` for the kafka/rabbitmq/monitoring stack in `docker-compose.dev.yml`. `docker:prod` now genuinely targets `docker-compose.prod.yml` instead of silently reusing the dev compose file — this is a real behavior fix, flag it to whoever owns deployment.)

- [ ] **Step 2: Commit**

```bash
git add apps/backend/package.json
git commit -m "fix: point backend docker:* scripts at relocated infra/docker compose files"
```

---

## Task 8: Update root README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the content**

```markdown
# Z-News Monorepo

pnpm workspace with two apps and a shared infra folder:

- `apps/frontend` — Next.js public website (will also host the admin dashboard under `(dashboard)/admin`)
- `apps/backend` — Express/MongoDB API server
- `infra/` — Docker, nginx, and monitoring config for `apps/backend` (see `infra/docker/`)

Each app under `apps/` was merged from a previously separate repository, with full commit history preserved (`git log -- apps/backend` etc. only shows the merge commit itself — see `git log <merge-commit>^2` for the pre-merge history of each app).

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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update root README for the pnpm workspace and infra layout"
```

---

## Task 9: Final verification pass

- [ ] **Step 1: Confirm the top-level layout**

```bash
cd /Users/mac/Developer/Othors/z-news/z-news
find . -maxdepth 2 -not -path '*/node_modules*' -not -path './.git*' | sort
```
Expected: `apps/adminpanel`, `apps/backend`, `apps/frontend`, `infra`, `pnpm-workspace.yaml`, `package.json`, `pnpm-lock.yaml`, `.npmrc`, `.gitignore`, `README.md`.

- [ ] **Step 2: Confirm no `apps/backend/infra` remains**

```bash
ls apps/backend/infra 2>&1
```
Expected: `No such file or directory`.

- [ ] **Step 3: Confirm workspace member count**

```bash
pnpm -r list --depth -1
```
Expected: lists `z-news-frontend`, `z-news-backend`, `z-news-adminpanel` (3 workspace packages).

- [ ] **Step 4: Backend still builds**

```bash
pnpm --filter z-news-backend build
```
Expected: `tsc` completes, `apps/backend/dist/index.js` exists, exit code 0.

- [ ] **Step 5: Frontend still lints**

```bash
pnpm --filter z-news-frontend lint
```
Expected: exits 0 (or only pre-existing warnings unrelated to this move — do not fix unrelated lint issues here).

- [ ] **Step 6: git history is intact for both renamed apps**

```bash
git log --oneline de99baa^2 | wc -l   # server pre-merge history — expect 218
git log --oneline 7a4ecab^2 | wc -l   # website pre-merge history — expect 88
```
(Commit hashes `de99baa`/`7a4ecab` are the original subtree-merge commits from when this monorepo was first assembled — confirms the rename didn't disturb them.)

- [ ] **Step 7: Final commit if anything is outstanding**

```bash
git status --short
```
Expected: clean. If not, `git add -A && git commit -m "chore: finish phase 0 workspace/infra verification"`.

---

## Out of scope for this phase (flagged, not fixed here)

- `apps/backend/src/config/env.ts` loads `.env` via `path.join(process.cwd(), '.env')` — cwd-relative, not file-relative. Still correct as long as the process is launched with cwd `apps/backend` (true for `pnpm --filter z-news-backend ...` and the Docker `WORKDIR /app`), but fragile if that ever changes. Not touched here.
- Container naming inconsistency across `docker-compose.dev.yml`/`docker-compose.prod.yml` (`zaaz-*` prefix) vs. the new `docker-compose.yml` (`z-news-backend-*` prefix) — left as-is; renaming those touches Prometheus scrape targets and Grafana dashboards too and isn't required for the extraction itself.
- `apps/adminpanel` is untouched in this phase — it still has its own `pnpm-lock.yaml` removed (folded into the root lockfile via Task 4) but otherwise keeps running exactly as before via `pnpm --filter z-news-adminpanel dev` until the later migration phase ports it into `apps/frontend`.

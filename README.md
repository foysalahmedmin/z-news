<div align="center">

# Z-News

**A full-stack, role-aware news publishing platform** — editorial workflow, real-time community engagement, gamification, and role-based analytics dashboards, delivered as one pnpm monorepo.

[Backend README](apps/backend/README.md) · [Frontend README](apps/frontend/README.md)

</div>

---

## What This Is

Z-News is an end-to-end news portal: a public reading experience, a multi-stage editorial workflow for producing content, and role-based admin/reader dashboards for everyone from a `super-admin` down to an anonymous `guest`. Three roles use the system very differently, and the platform is built around that distinction rather than papering over it:

- **Readers** browse, react, comment, bookmark, vote in polls, and track their own reputation/badges/reading lists on a personal dashboard.
- **Editorial staff** (`author`/`contributor`/`editor`) write, review, and publish through a multi-stage approval workflow, with a dashboard tailored to _their own_ content and moderation queue.
- **Admins** (`admin`/`super-admin`) manage the whole platform — users, taxonomy, moderation, gamification, notifications — from a site-wide analytics dashboard.

Every one of those experiences is served by the same Next.js app and the same Express API, gated by role rather than split into separate deployments.

---

## Repository Structure

```text
z-news/
├── apps/
│   ├── frontend/     # Next.js 16 — public site + admin panel + reader dashboard
│   └── backend/      # Express + MongoDB — REST API, 24 domain modules
├── infra/            # Docker, nginx, and monitoring config for apps/backend
└── pnpm-workspace.yaml
```

Each app was originally a separate repository (frontend, backend, and a standalone admin panel) and was merged into this monorepo with full commit history preserved — `git log -- apps/backend` etc. shows the merge commit; `git log <merge-commit>^2` reaches the pre-merge history. The standalone admin panel no longer exists as a separate app: every page, the shared UI kit, auth, and the data layer were ported into `apps/frontend`'s `(dashboard)/admin` route group.

---

## System Architecture

<div align="center">

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': {'primaryColor': '#ffffff', 'primaryBorderColor': '#333333', 'primaryTextColor': '#111111', 'lineColor': '#555555', 'secondaryColor': '#f5f5f5', 'tertiaryColor': '#e5e5e5'}}}%%
graph TB
    subgraph "Clients"
        Reader[Reader / Public Visitor]
        Editorial["Editorial Staff (author/contributor/editor)"]
        Admin["Admin (admin/super-admin)"]
    end

    subgraph "apps/frontend — Next.js 16"
        Public["(primary) — public site"]
        AdminUI["(dashboard)/admin — role-branched panel"]
        UserUI["(dashboard)/user — reader dashboard"]
        Proxy[proxy.ts — auth + role gating]
    end

    subgraph "apps/backend — Express API"
        Routes["/api/* — 24 domain modules"]
        Auth[JWT + Guest sessions]
        Cache[(Redis Cache)]
        DB[(MongoDB)]
        Storage[GCS / Local File Storage]
    end

    Reader --> Public
    Reader --> UserUI
    Editorial --> AdminUI
    Editorial --> UserUI
    Admin --> AdminUI

    Public --> Proxy
    AdminUI --> Proxy
    UserUI --> Proxy
    Proxy --> Routes

    Routes --> Auth
    Routes --> Cache
    Routes --> DB
    Routes --> Storage
```

</div>

**Frontend** — one Next.js app, three experiences gated by route group and role (see the [frontend README](apps/frontend/README.md) for the full route/role matrix).
**Backend** — one Express API, 24 domain modules behind a consistent REST convention (list/detail/create/update/soft-delete/permanent-delete/restore), see the [backend README](apps/backend/README.md) for the complete module and endpoint breakdown.

---

## Platform Capabilities at a Glance

<div align="center">

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': {'primaryColor': '#ffffff', 'primaryBorderColor': '#333333', 'primaryTextColor': '#111111', 'lineColor': '#555555', 'secondaryColor': '#f5f5f5', 'tertiaryColor': '#e5e5e5'}}}%%
graph TB
    Root((Z-News))

    Root --> Editorial
    subgraph Editorial["Editorial"]
        E1["Article lifecycle (draft to published to archived)"]
        E2[Multi-stage approval workflow]
        E3[Version history / audit trail]
        E4[Headlines & Breaking News]
        E5[Content templates]
    end

    Root --> Community
    subgraph Community["Community"]
        C1[Threaded comments + guest participation]
        C2[5-type reactions]
        C3["Polls, incl. anonymous voting"]
        C4[Bookmarks & public reading lists]
    end

    Root --> Gamification
    subgraph Gamification["Gamification"]
        G1["Badges (criteria-based, auto or manual award)"]
        G2[Reputation score]
        G3[Public leaderboard]
        G4[Follow authors / categories / topics]
    end

    Root --> Notifications
    subgraph Notifications["Notifications"]
        N1[Per-user inbox]
        N2[Admin broadcast composer]
        N3[Web / push / email channels]
    end

    Root --> Analytics
    subgraph Analytics["Analytics"]
        A1[Admin-tier dashboard]
        A2[Editorial-tier dashboard]
        A3[Reader-tier dashboard]
        A4[Consolidated, cached aggregation endpoints]
    end

    Root --> Platform
    subgraph Platform["Platform"]
        P1[RBAC — 7 roles + guest]
        P2[Redis caching]
        P3[Cloud + local file storage]
        P4[Optional RabbitMQ / Kafka]
    end
```

</div>

---

## Role-Based Experience

<div align="center">

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': {'primaryColor': '#ffffff', 'primaryBorderColor': '#333333', 'primaryTextColor': '#111111', 'lineColor': '#555555', 'secondaryColor': '#f5f5f5', 'tertiaryColor': '#e5e5e5'}}}%%
graph LR
    subgraph Roles
        SA[super-admin]
        AD[admin]
        ED[editor]
        AU[author]
        CO[contributor]
        SU[subscriber]
        US[user]
        GU[guest]
    end

    SA & AD --> DashAdmin["/admin — Admin-tier dashboard\nsite-wide statistics"]
    ED & AU & CO --> DashEdit["/admin — Editorial-tier dashboard\nmy content + moderation queue"]
    SU & US --> DashReader["/user — Reader dashboard\npersonal stats, badges, following"]
    GU --> PublicOnly["Public site only\ncan comment/react/vote where allowed"]

    SA & AD & ED & AU & CO & SU & US --> PublicOnly
```

</div>

This is enforced end-to-end, not just visually: the frontend's `proxy.ts` middleware derives required roles per admin route from the sidebar menu tree, and the backend's `auth()` middleware independently re-checks the same role list on every request — the UI never being the only gate.

---

## Tech Stack Overview

| Layer        | Stack                                                                                                                                          |
| :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · `@tanstack/react-query` · `react-hook-form` + `zod` · `recharts` |
| **Backend**  | Express 5 · TypeScript · MongoDB + Mongoose 8 · Redis · Socket.io · Zod                                                                        |
| **Auth**     | JWT access/refresh rotation, httpOnly refresh cookie, Google OAuth, guest sessions                                                             |
| **Infra**    | Docker (dev/full/prod stacks), nginx, Prometheus/Grafana monitoring, optional RabbitMQ/Kafka                                                   |
| **Testing**  | Jest — 49 suites / 408 tests (backend)                                                                                                         |

Full per-app breakdowns (dependencies, directory maps, ER diagrams, sequence diagrams) live in each app's own README — this document is the project-level map, not a duplicate of either.

---

## Getting Started

```bash
pnpm install

# Run each app's own dev server
pnpm dev:frontend
pnpm dev:backend
```

### Backend infrastructure (Docker)

```bash
cd apps/backend
pnpm docker:dev        # lightweight dev stack: app + redis (+ mongo-express/mailhog)
pnpm docker:dev:full    # full dev stack: + kafka + rabbitmq + prometheus/grafana
pnpm docker:prod        # production stack (resource limits, healthcheck, optional nginx)
```

See `infra/docker/`, `infra/nginx/`, and `infra/monitoring/` for the underlying configuration.

### Linting the whole workspace

```bash
pnpm lint       # runs each app's own lint script
pnpm lint:fix
```

---

## Documentation Map

| Document                                              | Covers                                                                                                                             |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [`apps/backend/README.md`](apps/backend/README.md)     | Every domain module, security posture, full ER diagram, API endpoint reference, workflow sequence diagrams, production checklist |
| [`apps/frontend/README.md`](apps/frontend/README.md)   | Route/role architecture, dual API client design, auth flow, full page routing matrix, directory map                              |

---

## License

Proprietary and Confidential. Unauthorized duplication or distribution is strictly prohibited.

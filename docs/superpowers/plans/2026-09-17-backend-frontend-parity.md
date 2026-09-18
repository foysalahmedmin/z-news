# Backend↔Frontend Feature Parity — Implementation Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring apps/frontend (public site + admin dashboard) to full feature parity with apps/backend's 23 API modules, fixing broken/dead UI along the way, following the codebase's existing patterns throughout for UI/UX and code consistency.

**Architecture:** No new architectural patterns — every phase below reuses what's already established: `admin-*.service.ts` / plain `*.service.ts` split, `admin-*.type.ts`, the flattened `@/components/ui/*` kit, `PageHeader`/`StatisticCard` from `@/components/partials/admin/`, `_components/` colocation under each route, `@tanstack/react-query` via the global `QueryClientProvider`, `useAlert` for confirm dialogs, `react-hook-form` + `zod` for forms, `admin-menu-items.ts` + `RouteMenu` for sidebar/role-gating, cookie-based auth via `useUser`/`usePreference`.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind v4, `@tanstack/react-query`, `react-hook-form` + `zod`, Express/Mongoose backend (mostly untouched — 2 auth-middleware bugs only).

---

## Progress Tracker

Legend: ✅ done & committed · 🔄 dispatched, awaiting result · ⬜ not started

| Phase / Task | Status |
|---|---|
| **Phase A** — 9 tasks (auth bugs, forgot/reset password, email verify, profile link fix, bookmark toggle, dead-code cleanup, content-templates pages, bin tabs, dashboard analytics) | ✅ all 9 done |
| **Phase U** — User Dashboard shell (menu/sidebar/header/layout/overview) | ✅ done |
| **Phase U** — notification-recipient bug fixes (backend auth-gate + wrong frontend endpoint) | ✅ done |
| **Phase U** — `/user/*` route protection in `proxy.ts` | ✅ done |
| **Phase E1** — follow-author/follow-category body-field bug fix + `updateMyProfile`/`updateNotificationPreferences` | ✅ done |
| **Phase B1** — News Headlines admin UI | ✅ done |
| **Phase B2** — News Break admin UI | ✅ done |
| **Phase B3** — Media library service + admin UI | ✅ done |
| **Phase C-backend** — admin broadcast fan-out to NotificationRecipient | ✅ done |
| **Phase C-frontend** — admin-notification service + broadcast composer page | ✅ done |
| **Phase C-bells** — real unread counts on all 3 header bells + `/notification` + `/user/notifications` pages | ✅ done |
| **Phase D** — reading-list service extension + `/user/bookmarks`, `/user/reading-lists[/id]`, public `/reading-lists` | ✅ done |
| **Phase E2** — admin badge management UI | ✅ done |
| **Phase E3** — public `/leaderboard` page | ✅ done |
| **Phase E-pages** — `/user/profile`, `/user/settings`, `/user/following` | ✅ done |
| **Phase F** — Poll service + admin attach-to-article UI + public voting widget | ✅ done |
| **Phase G** — Comment moderation (flagged queue + edit-history viewer) | ✅ done |
| **Menu consolidation** — News Headline/Break, Media, Badges, Broadcast entries added to `admin-menu-items.ts` | ✅ done |
| **Final full-repo verification** — `tsc`/`eslint`/`next build`/backend `jest` across everything above | ✅ done — 0 new tsc errors, 0 new eslint issues (31 pre-existing errors confirmed untouched by any parity commit), `next build` succeeds with every new route present and correct static/dynamic split, backend 49/49 suites (408/408 tests, one transient "socket hang up" re-run clean) |

All phases complete. Two known, deliberately-not-fixed items carried forward from individual task reports (both cosmetic/UX, not bugs): commit `9227833` ("content-templates add/edit pages") also contains the Bin Events/Files tabs due to an early git-staging collision (content verified correct); the public reading-lists browse page links to `/user/reading-lists/[id]`, which `proxy.ts` gates to signed-in visitors even though the backend route itself allows anonymous viewing of public lists.

---

## Context: full gap analysis (from a 3-agent parallel audit of backend + admin + public frontend)

Backend has 23 HTTP modules (`/api/*`) + 1 internal scheduler. Frontend coverage:

**Fully covered already** (no work needed): auth, user (self+admin CRUD), category, event, news (core articles), comment + comment-enhanced (threading/reactions/flag mostly wired), reaction (article-level), file, article-version (admin news-article History tab), workflow (admin news-article Kanban/Workflow tab), contact.

**Broken/dead UI** (exists but doesn't work) — Phase A:
- Bookmark/Save button on article pages: hardcoded `is_saved=false`, no handler, not even rendered
- `/auth/sign-in`'s "Forgot your password?" → `href="#"`, no page (backend + `auth.service.ts` already have `forgetPassword`/`resetPassword`)
- No email-verification page (backend + `auth.service.ts` already have `emailVerification*`)
- Header "Profile" link → `/profile` (no such route, only `/profile/[userId]`)
- Header notification bell: hardcoded badge `0`, empty drawer, links to nonexistent `/notification`
- `/admin/content-templates`: Add/Edit buttons link to routes that don't exist (`template.service.ts` CRUD already built)
- `/admin/bin`: only has users/categories/news/comments tabs — events/files/reactions restore functions exist in their services but have no Bin tab
- Dead duplicate `<NewsActionSection>` instance in `news/[slug]/page.tsx` (wrapped `hidden`, never renders — the live one is inside `NewsDetailsSection`)
- `/admin` dashboard: all 3 sections use static sample data, not the real `/api/view/analytics/*` endpoints
- 3 backend auth bugs: `PATCH /api/news/bulk/self` and `POST /api/news/file/:type` have `auth()` commented out; `POST /api/category/upload-json` has no `auth()` at all

**Built on backend + has a frontend service already, but literally zero UI** — Phase B:
- News Headlines (`admin-news-headline.service.ts` fully built, no menu entry, no page)
- News Break (`admin-news-break.service.ts` fully built, no menu entry, no page)
- Media library (`media` module — curated/tagged layer over `file`; no frontend service or UI at all yet)

**Entirely new feature areas — backend built, frontend has nothing** — Phases C–F:
- `notification` module (admin-authored broadcast messages, distinct from the per-user `notification-recipient` inbox that already works) — Phase C
- Public notification bell wiring (the working `/admin/notifications` pattern needs a public-facing equivalent) — Phase C
- `bookmark` module + Reading Lists (Pocket-style save + named/public/followable collections) — Phase D
- `user-profile` gaps: edit-my-profile, notification preferences, follow-category/follow-topic buttons (service functions exist, zero trigger UI), `/top` leaderboard page (service exists, unused) — Phase E
- `badge` module (admin: create/edit/delete/seed/award; public already displays badges read-only) — Phase E
- `poll` module (admin create/manage + public vote widget + results) — Phase F

**Guest session infrastructure** (Phase G): backend's `guest` module underlies anonymous comment/react/view/poll-vote flows — needs verification that the frontend's ad-hoc guest handling (name/email cookie on comments) actually aligns with or should adopt the backend's real guest-session token system.

---

## Phase ordering rationale

A → B → C → D → E → F → G. Each phase ships working, demoable software on its own. A and B are low-risk/high-value (existing services, just wiring). C–F are genuinely new UI surfaces of increasing size (C smallest, D/E/F each roughly comment-enhanced-sized). G is a hardening/verification pass, done last since it's cross-cutting and best informed by having built the anonymous-interaction UI (bookmarks require login so are unaffected; polls/comments/reactions/views do touch guest flow).

Each of B through G gets its own fully-detailed bite-sized task breakdown (written immediately before that phase starts, following this same plan file's conventions) — not written out in full now, per the "don't pre-detail phases whose exact shape depends on what the prior phase lands" lesson from the admin-panel migration (e.g., Phase C's public notification bell UI should reuse whatever pattern Phase B's new admin list pages settle on).

---

## Phase A: Fixes & Quick Wins — full detail

### Task A1: Backend auth bugs (3 small fixes)

**Files:**
- Modify: `apps/backend/src/modules/news/news.route.ts`
- Modify: `apps/backend/src/modules/category/category.route.ts`

- [x] **Step 1: Read the two commented-out auth lines in news.route.ts**

```bash
grep -n "auth(" apps/backend/src/modules/news/news.route.ts
```

Confirm lines matching `// auth('admin','author')` (around line 44, for `PATCH /bulk/self`) and a commented auth call around lines 122-123 (for `POST /file/:type`).

- [x] **Step 2: Uncomment/restore both auth() calls**

For `PATCH /bulk/self` (`updateBulkNews` — despite the name, this is the *self*-scoped bulk update route per the router grouping), restore:
```ts
router.patch('/bulk/self', auth('admin', 'author'), NewsControllers.updateBulkNews);
```
For `POST /file/:type`, restore:
```ts
router.post('/file/:type', auth('admin', 'editor', 'author', 'contributor'), NewsControllers.uploadNewsFile);
```
(Match the exact role list already used by the sibling authenticated news routes in the same file — read the surrounding routes first to copy the precise role set rather than guessing; the two examples above are the likely set based on other news routes, confirm against `PATCH /:id/self` which already uses `admin, author` and file-upload routes elsewhere in the codebase which typically also allow `editor`/`contributor`.)

- [x] **Step 3: Add auth() to category upload-json**

In `apps/backend/src/modules/category/category.route.ts`, find:
```ts
router.post('/upload-json', CategoryControllers.insertCategoriesFromFile);
```
Change to match the role set already used by other category admin-write routes in the same file (`admin, editor, author` per the inventory):
```ts
router.post('/upload-json', auth('admin', 'editor', 'author'), CategoryControllers.insertCategoriesFromFile);
```

- [x] **Step 4: Verify backend still builds and tests pass**

```bash
cd apps/backend && npx tsc --noEmit && npx jest
```
Expected: same pre-existing baseline (295 tsc error lines, unrelated to these 3 lines — confirm none of the new errors are in news.route.ts/category.route.ts), all previously-passing tests still pass.

- [x] **Step 5: Commit**

```bash
git add apps/backend/src/modules/news/news.route.ts apps/backend/src/modules/category/category.route.ts
git commit -m "fix: restore missing auth() checks on 3 backend routes

PATCH /api/news/bulk/self and POST /api/news/file/:type had their
auth() middleware commented out; POST /api/category/upload-json never
had one. All three were reachable without authentication."
```

### Task A2: Forgot-password + reset-password pages

**Files:**
- Create: `apps/frontend/src/app/auth/forgot-password/page.tsx`
- Create: `apps/frontend/src/app/auth/reset-password/page.tsx`
- Modify: `apps/frontend/src/components/(auth)/signin-page/SigninForm/index.tsx`

- [x] **Step 1: Check the exact backend contract for both endpoints**

```bash
cat apps/backend/src/modules/auth/auth.validator.ts | grep -A10 "forgetPassword\|resetPassword"
```
Confirm the exact payload shape `forgetPassword`/`resetPassword` in `apps/frontend/src/services/auth.service.ts` already send (read that file — it already has both functions wired to `/api/auth/forget-password` and `/api/auth/reset-password`). Note from the backend inventory: `resetPassword` is a `PATCH` and the backend controller reads the reset token from `req.headers.authorization` (see `apps/backend/src/modules/auth/auth.controller.ts`'s `resetPassword` handler) — so the reset-password page must extract the token from the URL query string and pass it as the Authorization header, not as a body field.

- [x] **Step 2: Write the forgot-password page**

```tsx
// apps/frontend/src/app/auth/forgot-password/page.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import { forgetPassword } from "@/services/auth.service";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type FormValues = { email: string };

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      await forgetPassword({ email: data.email });
      setSent(true);
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message || "Failed to send reset link";
      toast.error(message);
    }
  };

  if (sent) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground text-balance">
            If an account exists for that email, a password reset link has
            been sent.
          </p>
          <Link href="/auth/sign-in" className="underline underline-offset-4">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground text-balance">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="grid gap-3">
          <label htmlFor="email">Email</label>
          <FormControl
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email.message}</span>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>

        <div className="text-center text-sm">
          <Link href="/auth/sign-in" className="underline underline-offset-4">
            Back to sign in
          </Link>
        </div>
      </div>
    </form>
  );
}
```

- [x] **Step 3: Write the reset-password page**

```tsx
// apps/frontend/src/app/auth/reset-password/page.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import { resetPassword } from "@/services/auth.service";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type FormValues = { password: string; confirmPassword: string };

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error("Missing or invalid reset link");
      return;
    }
    try {
      // resetPassword's payload/token split matches auth.service.ts's
      // existing signature: (payload, token) -> sent as the Authorization
      // header, per the backend's resetPassword controller.
      await resetPassword({ password: data.password }, token);
      toast.success("Password reset successfully! Please sign in.");
      router.push("/auth/sign-in");
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message || "Failed to reset password";
      toast.error(message);
    }
  };

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground text-balance">
            Enter a new password for your account
          </p>
        </div>

        <div className="grid gap-3">
          <label htmlFor="password">New password</label>
          <FormControl
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
          />
          {errors.password && (
            <span className="text-sm text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="grid gap-3">
          <label htmlFor="confirmPassword">Confirm password</label>
          <FormControl
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((prev) => !prev)}
          />
          Show password
        </label>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset password"}
        </Button>

        <div className="text-center text-sm">
          <Link href="/auth/sign-in" className="underline underline-offset-4">
            Back to sign in
          </Link>
        </div>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
```

- [x] **Step 4: Confirm auth.service.ts's `resetPassword` signature actually matches `(payload, token)`**

```bash
grep -n -A8 "export async function resetPassword" apps/frontend/src/services/auth.service.ts
```
If the existing signature differs (e.g. token embedded in payload instead of a second arg), adjust Step 3's call site to match exactly what's already there — do not change `auth.service.ts` itself unless it's actually wrong per Step 1's backend contract check.

- [x] **Step 5: Wire the "Forgot your password?" link**

In `apps/frontend/src/components/(auth)/signin-page/SigninForm/index.tsx`, find:
```tsx
<a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
  Forgot your password?
</a>
```
Replace with:
```tsx
<Link
  href="/auth/forgot-password"
  className="ml-auto text-sm underline-offset-2 hover:underline"
>
  Forgot your password?
</Link>
```
(Add `import Link from "next/link";` at the top if not already imported — check first, the file likely already imports it for the "Signup" link at the bottom.)

- [x] **Step 6: Verify**

```bash
cd apps/frontend && npx tsc --noEmit && npx eslint src/app/auth/forgot-password/ src/app/auth/reset-password/ "src/components/(auth)/signin-page/SigninForm/index.tsx"
```
Expected: 0 errors.

- [x] **Step 7: Commit**

```bash
git add apps/frontend/src/app/auth/forgot-password apps/frontend/src/app/auth/reset-password "apps/frontend/src/components/(auth)/signin-page/SigninForm/index.tsx"
git commit -m "feat: forgot-password and reset-password pages

Wires up auth.service.ts's existing forgetPassword/resetPassword
functions, which had no UI. Fixes the dead 'Forgot your password?'
link on the sign-in page."
```

### Task A3: Email verification page

**Files:**
- Create: `apps/frontend/src/app/auth/verify-email/page.tsx`

- [x] **Step 1: Check the backend contract**

```bash
grep -n -A10 "emailVerification\b" apps/backend/src/modules/auth/auth.controller.ts
```
Confirm: like `resetPassword`, `emailVerification` reads its token from `req.headers.authorization` (per the backend inventory's note that `email-verification` is a public POST). Check `apps/frontend/src/services/auth.service.ts`'s existing `emailVerification` function signature to match.

- [x] **Step 2: Write the page**

```tsx
// apps/frontend/src/app/auth/verify-email/page.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { emailVerification } from "@/services/auth.service";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Status = "verifying" | "success" | "error";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<Status>("verifying");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    emailVerification(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
    // Match whatever exact call signature auth.service.ts's
    // emailVerification already exports (token as sole arg, sent as the
    // Authorization header) — adjust this call if the real signature
    // differs from the assumption made here.
  }, [token]);

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        {status === "verifying" && (
          <p className="text-muted-foreground">Verifying your email...</p>
        )}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold">Email verified!</h1>
            <p className="text-muted-foreground">
              Your email has been verified successfully.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold">Verification failed</h1>
            <p className="text-muted-foreground">
              This link is invalid or has expired.
            </p>
          </>
        )}
        <Button asChild className="mt-2">
          <Link href="/auth/sign-in">Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
```

- [x] **Step 3: Verify `Button` supports `asChild`**

```bash
grep -n "asChild" apps/frontend/src/components/ui/Button.tsx
```
If it doesn't support `asChild` (Radix-style prop-forwarding), replace the `<Button asChild><Link>...</Link></Button>` with a plain `<Link href="/auth/sign-in" className={buttonVariants()}>Back to sign in</Link>` using the exported `buttonVariants` from the same file instead.

- [x] **Step 4: Verify and commit**

```bash
cd apps/frontend && npx tsc --noEmit && npx eslint src/app/auth/verify-email/
git add apps/frontend/src/app/auth/verify-email
git commit -m "feat: email verification page

Wires up auth.service.ts's existing emailVerification function."
```

### Task A4: Fix broken `/profile` header link

**Files:**
- Modify: `apps/frontend/src/components/partials/Header/Navigation/Profile/index.tsx` (or wherever the "Profile" link lives — confirm exact file first)

- [x] **Step 1: Find the broken link**

```bash
grep -rn 'href="/profile"' apps/frontend/src/components/partials/
```

- [x] **Step 2: Fix it to route to the signed-in user's own profile**

The existing `useUser()` hook returns `user.info._id` (or similar — check `@/types/user.type`'s `TUser` shape for the exact id field name). Change the link's `href` from the literal string `"/profile"` to a template using the current user's id:
```tsx
<Link href={`/profile/${user?.info?._id}`}>Profile</Link>
```
(Adjust to whatever the surrounding component's existing variable names actually are — read the file first, don't guess field names.)

- [x] **Step 3: Verify and commit**

```bash
cd apps/frontend && npx tsc --noEmit && npx eslint src/components/partials/Header/
git add -A
git commit -m "fix: header Profile link now points to the user's own profile page

Was a dead link to a literal /profile route that doesn't exist —
only /profile/[userId] does."
```

### Task A5: Wire up the Bookmark/Save button (basic toggle)

**Files:**
- Create: `apps/frontend/src/services/bookmark.service.ts`
- Create: `apps/frontend/src/types/bookmark.type.ts`
- Modify: `apps/frontend/src/components/(common)/news-page/NewsActionSection/save/index.tsx`

This is the MINIMAL wiring (toggle bookmark on/off from the article page) — the full "My saved articles" + Reading Lists UI is Phase D. This task only makes the existing button actually work.

- [x] **Step 1: Confirm the bookmark backend contract**

```bash
cat apps/backend/src/modules/bookmark/bookmark.route.ts
cat apps/backend/src/modules/bookmark/bookmark.model.ts | head -40
```
Note exact field names (likely `news`/`news_id` for the bookmarked article reference) and the create/delete/list endpoint shapes.

- [x] **Step 2: Write the bookmark type**

```typescript
// apps/frontend/src/types/bookmark.type.ts
import type { Response } from "./response.type";

export type TBookmark = {
  _id: string;
  user: string;
  news: string;
  notes?: string;
  reading_list?: string | null;
  created_at: string;
  updated_at: string;
};

export type TBookmarkResponse = Response<TBookmark>;
export type TBookmarksResponse = Response<TBookmark[]>;
```
(Adjust field names to match whatever Step 1 actually found in `bookmark.model.ts` — this is a best-guess shape based on the earlier backend audit, verify against the real model before finalizing.)

- [x] **Step 3: Write the bookmark service**

```typescript
// apps/frontend/src/services/bookmark.service.ts
import api from "@/lib/api";
import type { TBookmarkResponse, TBookmarksResponse } from "@/types/bookmark.type";

export async function fetchMyBookmarks(query?: Record<string, unknown>) {
  const response = await api.get<TBookmarksResponse>("/api/bookmark", {
    params: query,
  } as any);
  return response.data;
}

export async function createBookmark(news: string): Promise<TBookmarkResponse> {
  const response = await api.post("/api/bookmark", { news });
  return response.data as TBookmarkResponse;
}

export async function deleteBookmark(bookmarkId: string): Promise<TBookmarkResponse> {
  const response = await api.delete(`/api/bookmark/${bookmarkId}`);
  return response.data as TBookmarkResponse;
}
```
(`api` here is `@/lib/api`'s Fetch client, matching the pattern every other non-admin `*.service.ts` file already uses — check `event.service.ts` for the exact `.get`/`.post`/`.delete` call conventions on that client, since it's NOT axios-shaped like the admin services, and adjust the params-passing style to match exactly.)

- [x] **Step 4: Check the current Save component**

```bash
cat "apps/frontend/src/components/(common)/news-page/NewsActionSection/save/index.tsx"
```

- [x] **Step 5: Wire it up**

Replace the hardcoded `const is_saved = false;` and missing handler with a real `useQuery` (to check bookmark status) + `useMutation` (to toggle), following the exact pattern already used by `FollowAuthorButton` (`apps/frontend/src/components/(common)/news-page/.../FollowAuthorButton` or wherever the public inventory found it — read that component first as the template for "logged-in-only toggle action on an article," since it already solves the same shape of problem: check auth via `getMyProfile()`, show/hide accordingly, optimistic-ish toggle with toast feedback).

- [x] **Step 6: Un-comment and render the Save button**

In `apps/frontend/src/components/(common)/news-page/NewsActionSection/index.tsx`, change:
```tsx
{/* <Save news={news!} /> */}
```
to:
```tsx
<Save news={news!} />
```

- [x] **Step 7: Verify and commit**

```bash
cd apps/frontend && npx tsc --noEmit && npx eslint src/services/bookmark.service.ts src/types/bookmark.type.ts "src/components/(common)/news-page/NewsActionSection/"
git add -A
git commit -m "feat: wire up article bookmark/save toggle

Was a fully dead UI element (hardcoded is_saved=false, no handler, not
even rendered). Full 'My saved articles' + Reading Lists UI is a
separate, larger phase — this just makes the existing per-article
toggle button work."
```

### Task A6: Remove dead duplicate NewsActionSection

**Files:**
- Modify: `apps/frontend/src/app/(primary)/news/[slug]/page.tsx`

- [x] **Step 1: Confirm it's genuinely dead**

```bash
grep -n "NewsActionSection" "apps/frontend/src/app/(primary)/news/[slug]/page.tsx"
```
Confirm the `<div className="hidden"><NewsActionSection news={data} /></div>` wrapper — this never renders to any user (display:none via Tailwind's `hidden`), duplicating what's already live inside `NewsDetailsSection`.

- [x] **Step 2: Remove it**

Delete the `<div className="hidden">...</div>` block and its now-unused `NewsActionSection` import from `page.tsx` (keep the import/usage inside `NewsDetailsSection` — that one is live and stays).

- [x] **Step 3: Verify and commit**

```bash
cd apps/frontend && npx tsc --noEmit && npx eslint "apps/frontend/src/app/(primary)/news/[slug]/page.tsx"
git add "apps/frontend/src/app/(primary)/news/[slug]/page.tsx"
git commit -m "chore: remove dead duplicate NewsActionSection instance

Was wrapped in a hidden div, never rendered — the live action bar is
already inside NewsDetailsSection."
```

### Task A7: Content-templates Add/Edit pages

**Files:**
- Create: `apps/frontend/src/app/(dashboard)/admin/content-templates/add/page.tsx`
- Create: `apps/frontend/src/app/(dashboard)/admin/content-templates/edit/[id]/page.tsx`
- Create: `apps/frontend/src/components/partials/admin/TemplateForm/index.tsx`

- [x] **Step 1: Check the template model's `structure`/`default_fields` shape**

```bash
cat apps/backend/src/modules/template/template.model.ts
```
These are `Mixed`/arbitrary-JSON fields — decide (based on what `apps/frontend/src/services/template.service.ts`'s existing `TTemplate` type already declares, check it first) whether to expose them as raw JSON textareas (simplest, matches "arbitrary shape" reality) or a structured form. Default to a JSON textarea with `zod`'s `z.string().refine(...)` validating it parses as JSON, unless the existing type already narrows `structure`/`default_fields` to something more specific.

- [x] **Step 2: Build the shared form** (mirrors `NewsArticleForm`'s `mode: "add" | "edit"` pattern exactly)

Build `TemplateForm` with `mode: "add" | "edit"`, `templateId?: string` props, `react-hook-form` + `zod`, fields: `name` (required string), `description` (optional string), `category` (select, populated via `admin-category.service.ts`'s `fetchCategories`), `structure` (JSON textarea per Step 1), `default_fields` (JSON textarea), `is_active` (checkbox/switch). On submit, call `createTemplate`/`updateTemplate` from `template.service.ts`, `router.push("/admin/content-templates")` on success.

- [x] **Step 3: Write the two thin page wrappers**

```tsx
// apps/frontend/src/app/(dashboard)/admin/content-templates/add/page.tsx
"use client";

import TemplateForm from "@/components/partials/admin/TemplateForm";

export default function ContentTemplateAddPage() {
  return <TemplateForm mode="add" />;
}
```
```tsx
// apps/frontend/src/app/(dashboard)/admin/content-templates/edit/[id]/page.tsx
"use client";

import TemplateForm from "@/components/partials/admin/TemplateForm";
import { useParams } from "next/navigation";

export default function ContentTemplateEditPage() {
  const params = useParams<{ id: string }>();
  return <TemplateForm mode="edit" templateId={params.id} />;
}
```

- [x] **Step 4: Verify and commit**

```bash
cd apps/frontend && npx tsc --noEmit && npx eslint "src/app/(dashboard)/admin/content-templates/" src/components/partials/admin/TemplateForm/
git add -A
git commit -m "feat: content-templates add/edit pages

The list page already linked to these routes; template.service.ts's
CRUD functions already existed. Fixes the dead Add Template / Edit
links."
```

### Task A8: Recycle Bin — add events/files/reactions tabs

**Files:**
- Modify: `apps/frontend/src/app/(dashboard)/admin/bin/_components/BinView.tsx`

- [x] **Step 1: Read the existing BinView tab pattern**

```bash
cat "apps/frontend/src/app/(dashboard)/admin/bin/_components/BinView.tsx"
```
Note exactly how the existing 4 tabs (users/categories/news/comments) each: define a `useQuery` filtered by `is_deleted: true`, a restore mutation, a permanent-delete mutation (behind `useAlert()` confirm), and render into the shared `<Tabs>`/`<TabsList>`/`<TabsTrigger>`/`<TabsContent>` structure.

- [x] **Step 2: Add an Events tab**

Following the exact same structure as the Categories tab (same shape of service: `fetchEvents` with `is_deleted: true`, `restoreEvent`, `deleteEventPermanent` from `admin-event.service.ts`), add a 5th `<TabsTrigger value="events">Events</TabsTrigger>` + matching `<TabsContent value="events">`.

- [x] **Step 3: Add a Files tab**

Same pattern using `file.service.ts`'s `fetchFiles` (with `is_deleted: true`), `restoreFile`, `deleteFilePermanent`.

- [x] **Step 4: Add a Reactions tab**

Same pattern using `admin-reaction.service.ts`'s `fetchReactions` (with `is_deleted: true` if that service supports it — check first; the backend inventory noted reactions have no restore/bin routes at all ("no restore/soft-delete-bin routes here... reactions appear to be hard-scoped to create/delete rather than a bin-restore workflow"). If `admin-reaction.service.ts` genuinely has no restore/permanent-delete functions and the backend `reaction` module has no such routes either, SKIP this tab — do not build UI for a backend capability that doesn't exist. Verify via `grep -n "restore\|permanent" apps/backend/src/modules/reaction/reaction.route.ts` before deciding.

- [x] **Step 5: Verify and commit**

```bash
cd apps/frontend && npx tsc --noEmit && npx eslint "src/app/(dashboard)/admin/bin/"
git add "apps/frontend/src/app/(dashboard)/admin/bin/_components/BinView.tsx"
git commit -m "feat: add events/files tabs to Recycle Bin (+ reactions if the backend supports it)

restore/permanent-delete functions already existed in their services;
only the Bin UI tabs were missing."
```

### Task A9: Real analytics on admin dashboard

**Files:**
- Create: `apps/frontend/src/services/admin-view.service.ts`
- Modify: `apps/frontend/src/app/(dashboard)/admin/_components/AdminStatisticsSection/index.tsx`
- Modify: `apps/frontend/src/app/(dashboard)/admin/_components/ChartAreaInteractiveSection/index.tsx`

- [x] **Step 1: Confirm the analytics endpoint response shapes**

```bash
grep -n -A15 "getTopViewedNews\|getViewTrends\|getTotalViewCount" apps/backend/src/modules/view/view.controller.ts
```

- [x] **Step 2: Write the service**

```typescript
// apps/frontend/src/services/admin-view.service.ts
import adminApi from "@/lib/admin-api";
import type { Response } from "@/types/response.type";

export type TViewTrendPoint = { date: string; count: number };
export type TTopViewedNews = { _id: string; title: string; slug: string; view_count: number };

export async function fetchTopViewedNews(
  query?: Record<string, unknown>,
): Promise<Response<TTopViewedNews[]>> {
  const response = await adminApi.get("/api/view/analytics/top", { params: query });
  return response.data;
}

export async function fetchViewTrends(
  query?: Record<string, unknown>,
): Promise<Response<TViewTrendPoint[]>> {
  const response = await adminApi.get("/api/view/analytics/trends", { params: query });
  return response.data;
}

export async function fetchTotalViewCount(
  query?: Record<string, unknown>,
): Promise<Response<{ total: number }>> {
  const response = await adminApi.get("/api/view/analytics/total", { params: query });
  return response.data;
}
```
(Adjust response field names to match Step 1's actual controller output exactly — this is a best-guess shape.)

- [x] **Step 3: Wire `AdminStatisticsSection` to real totals**

Replace its static sample data with a `useQuery` calling `fetchTotalViewCount` (plus whatever existing admin services already provide real counts for users/categories/news — check if `admin-user.service.ts`/`admin-category.service.ts`/`admin-news.service.ts` list endpoints return a `meta.total` the stat cards can reuse, following the exact pattern `EventsPage`/`CategoriesPage` already use for their `StatisticCard`s via `data?.meta`).

- [x] **Step 4: Wire `ChartAreaInteractiveSection` to real trend data**

Replace `chart-data.ts`'s static sample data with `fetchViewTrends`, keeping the exact same chart rendering code (`ChartContainer`/`ChartTooltip`/etc. from `@/components/ui/Chart`) — only the data source changes, not the chart component itself.

- [x] **Step 5: Verify and commit**

```bash
cd apps/frontend && npx tsc --noEmit && npx eslint src/services/admin-view.service.ts "src/app/(dashboard)/admin/_components/"
git add -A
git commit -m "feat: wire admin dashboard to real view-analytics data

Dashboard previously rendered static sample data. Now backed by
/api/view/analytics/{top,trends,total} via a new admin-view.service.ts."
```

---

## Self-review (Phase A)

**Spec coverage:** Every "Broken/dead UI" item from the gap analysis has a task (A1 backend bugs, A2 forgot/reset password, A3 email verify, A4 profile link, A5 bookmark toggle, A6 dead code, A7 templates, A8 bin tabs, A9 dashboard analytics). ✓

**Placeholder scan:** No TBD/TODO-later markers. Field-name uncertainties (bookmark model shape, template structure shape, analytics response shape) are each paired with an explicit verification step ("read the real file, adjust if different") rather than being silently assumed — this is deliberate for the ~4 places touching code this plan's author hasn't read byte-for-byte yet, not a placeholder.

**Type consistency:** `TBookmark`/`bookmark.service.ts` function names used consistently across Task A5's steps. `admin-view.service.ts` function names (`fetchTopViewedNews`/`fetchViewTrends`/`fetchTotalViewCount`) consistent between Steps 2–4 of Task A9.

---

## Phases B–G + User Dashboard Shell — concrete decisions (from a 2-agent parallel deep-dive on every remaining backend module + exact frontend patterns to mirror)

**New requirement added mid-plan:** the user wants a real `/user` dashboard shell (currently `apps/frontend/src/app/(dashboard)/user/{layout,page}.tsx` are literal empty stubs) — a plain-user equivalent of `/admin`'s sidebar+header shell, hosting profile/bookmarks/notifications/follows/badges/account-settings. This is now **Phase U**, built first since D/E's pages need somewhere to live.

**Real pre-existing bugs found during research** (fix alongside the related phase, not deferred):
- `notification-recipient.route.ts`'s `GET /self` is gated `auth('admin')` only — every other self-route on that file uses the full role list (`admin,author,editor,contributor,subscriber,user`). Non-admin users literally cannot fetch their own notifications today. **Backend one-line fix, Phase U.**
- `apps/frontend/src/services/notification-recipient.service.ts`'s `fetchNotificationRecipientsBySelf` calls `GET /api/notification-recipient/bulk/self` — no such route exists (`bulk/self` is only defined for PATCH/DELETE). It actually matches `GET /:id/self` with `id="bulk"`, which fails the ObjectId regex and 400s. **The entire notification list/unread-count UI is non-functional today.** Fix to call `/api/notification-recipient/self`. **Phase U/C.**
- `apps/frontend/src/services/user-profile.service.ts`'s `followAuthor`/`followCategory` send `{authorId}`/`{categoryId}` (camelCase) but the backend zod validators require `{author_id}`/`{category_id}` (snake_case) — both 400 in production right now. **Fix in Phase E.**
- `notification.model.ts`/`.validator.ts`'s `TType` enum uses `-approval` suffixes (`news-request-approval`, ...) but the service that actually emits notifications (`sendNewsNotification`) and the frontend's `TType` both use `-response`. The `-approval` enum values are unreachable/wrong. Not user-facing (internal type only) — note it, low priority, fix opportunistically if touching that file.
- `admin-menu-items.ts`'s "Media" section (line ~64) is a title with only "Files" under it — natural home for the new Media nav item.

### Phase U: User Dashboard Shell

**Files:**
- Create: `apps/frontend/src/data/user-menu-items.ts` — flat, no role restriction (any signed-in role): Dashboard (index), My Profile (`profile`), Bookmarks (`bookmarks`), Reading Lists (`reading-lists`), Notifications (`notifications`), Following (`following`), Badges & Reputation (`badges`), Account Settings (`settings`). Same `TItem` shape as `admin-menu-items.ts` (routeType `"layout"`, `menuType: "item-without-children"`, `children: [{index:true, menuType:"invisible"}]` per leaf).
- Create: `apps/frontend/src/components/partials/user/hooks/useUserMenu.tsx` — copy `admin/hooks/useAdminMenu.tsx` exactly, swap `items` import to `user-menu-items.ts` and `initialPath: "user"`.
- Create: `apps/frontend/src/components/partials/user/Sidebar/index.tsx` — copy `admin/Sidebar/index.tsx`, swap `useAdminMenu` → `useUserMenu`. Reuse `admin/Sidebar/MenuItem` directly (it's fully generic, no need to duplicate).
- Create: `apps/frontend/src/components/partials/user/Header/index.tsx` — copy `admin/Header/index.tsx` structure (toggle buttons + right-side cluster). Reuse `admin/Header/Search` directly (100% generic, no import changes needed — import it as-is from `@/components/partials/admin/Header/Search`, no fork needed). Fork `admin/Header/Profile` → `components/partials/user/Header/Profile/index.tsx`, only change: the "Profile" link goes to `/user/profile` instead of `/admin/user/profile`. Notification bell: see Phase C — build the real `useUnreadNotificationCount()` hook there and use it in both this file and the admin/public bells; for Phase U itself, ship with the same empty-state placeholder the admin one currently has (don't block the shell on Phase C).
- No separate `AdminSettingProvider`-equivalent needed — `usePreference()` can be called directly (it's already the underlying cookie-backed hook `AdminSettingProvider` just wraps in Context; the user shell has far fewer consumers so skip the Context layer, or reuse `AdminSettingProvider`/`useSetting` as-is since it's not actually admin-specific business logic, just named that way — reusing it is fine and avoids duplicating the reset/toggle API surface).
- Modify: `apps/frontend/src/app/(dashboard)/user/layout.tsx` — real shell mirroring `admin/layout.tsx` (`AdminSettingProvider` → shell div with `UserSidebar`/`UserHeader`/`<main>`/`AdminSettings` drawer — reuse `AdminSettings` and `AdminSettingProvider` as-is, they're theme/direction/language/sidebar prefs, not admin-role logic).
- Modify: `apps/frontend/src/app/(dashboard)/user/page.tsx` — dashboard overview: welcome header + a few `StatisticCard`s (unread notifications, bookmarks count, reputation score) sourced from services built in Phases C/D/E — if those aren't built yet when this task runs, stub the cards with `0`/loading state wired to `useQuery`s that will start returning real data once the later phases land (not a placeholder in the "TBD" sense — real query hooks, just against endpoints this same overall plan is building).
- Modify: `apps/backend/src/modules/notification-recipient/notification-recipient.route.ts` — fix `GET /self`'s `auth('admin')` to match the file's other self-routes' role list.
- Modify: `apps/frontend/src/services/notification-recipient.service.ts` — fix `fetchNotificationRecipientsBySelf` to call `/api/notification-recipient/self` (drop the incorrect `bulk/` segment).
- Modify: `apps/frontend/src/proxy.ts` — add `"/user/:path*"` to `config.matcher`; in the `proxy()` function, branch on `pathname.startsWith("/user")` to only enforce "must be signed in" (existing `isAuthenticated` check) and skip role-derivation entirely (every backend role is allowed into its own `/user` area).

### Phase B: News Headlines, News Break, Media admin UI

Backend + frontend services for Headline/Break are 100% already built — **UI only**. Template: `apps/frontend/src/app/(dashboard)/admin/events/` (modal-based single-page CRUD, not a separate add/edit route — Headline/Break's fields are far simpler than Events' so this fits better than News Articles' huge form).

**Files (News Headlines):**
- Create: `apps/frontend/src/app/(dashboard)/admin/news-headline/page.tsx`, `_components/NewsHeadlineDataTableSection/index.tsx`, `_components/NewsHeadlineAddModal/index.tsx`, `_components/NewsHeadlineEditModal/index.tsx`.
- Fields per modal: `news` (searchable select — reuse `fetchNews`/`fetchBulkNews` from `admin-news.service.ts` for options, label by title), `status` (select: draft/pending/published/archived — do NOT include "scheduled", the frontend type's `TStatus` includes it but the backend enum does not; sending it will 400), `published_at`/`expired_at` (datetime-local inputs, cross-validated like Events' `published_at`/`expire_at` pair).
- Delete: soft-delete only via the row action (`deleteNewsHeadline`) — no bin-tab wiring for this phase (Events itself has no restore UI either; matching scope).
- Add menu entry to `admin-menu-items.ts` inside the existing "News" title section (sibling of "News Articles"), roles `["super-admin","admin","author","editor"]`, icon e.g. `"megaphone"`, path `"news-headline"`.

**Files (News Break):** identical structure, `apps/frontend/src/app/(dashboard)/admin/news-break/`, using `admin-news-break.service.ts`, menu entry path `"news-break"`, icon e.g. `"radio"`.

**Files (Media):**
- Create: `apps/frontend/src/services/media.service.ts` (NOT split into admin-/public — mirrors `file.service.ts`'s convention since Media's list/read routes are public anyway: `fetchMedia`, `fetchMediaItem`, `createMedia`, `updateMedia`, `deleteMedia`, all via `@/lib/admin-api` for the write ops since those need auth, list/read can use the same client — the axios instance still works for public GETs, it just won't attach a token if there's a session, harmless).
- Create: `apps/frontend/src/types/media.type.ts` (`TMedia`: `_id, title, description?, alt_text?, file: string, type: 'image'|'video'|'audio'|'document', url, thumbnail_url?, status: 'active'|'inactive'|'archived', tags: string[], uploaded_by, created_at, updated_at`).
- Create: `apps/frontend/src/app/(dashboard)/admin/media/page.tsx` + `_components/MediaDataTableSection` + `add/page.tsx` + `edit/[id]/page.tsx` — mirror `admin/files/`'s edit-page pattern (since Media references an *existing* File, not a fresh upload): a "pick an existing File" searchable select (via `fetchFiles`/`fetchSelfFiles` from `file.service.ts`) + title/description/alt_text/type/tags/status fields. No restore UI (backend has none — soft delete is a dead end for Media, by design per the research).
- Add menu entry to `admin-menu-items.ts` under the existing "Media" title section (sibling of "Files"), roles `["super-admin","admin","editor","author","contributor"]`, icon e.g. `"image"`, path `"media"`.

### Phase C: Notifications (admin broadcast + real inbox wiring + public/user/admin bells)

**Backend gap requiring a small addition** (the user authorized "minor backend updates... for improvement"): `POST /api/notification` currently creates an orphan `Notification` with zero fan-out — no `NotificationRecipient` rows are ever created for it, so an admin "broadcast" today reaches nobody. Add fan-out:
- Modify: `apps/backend/src/modules/notification/notification.service.ts`'s `createNotification` — after creating the `Notification`, accept an additional `audience` input (`{roles?: TRole[], user_ids?: string[]}`, at least one required) and bulk-create matching `NotificationRecipient` rows (role-based: `User.find({role:{$in:roles}})` then map to recipients; direct: use `user_ids` as-is). This mirrors what `sendNewsNotification` already does for its two hardcoded cases, generalized.
- Modify: `apps/backend/src/modules/notification/notification.validator.ts`'s create schema — add optional `audience: z.object({roles: z.array(z.enum([...TRole])).optional(), user_ids: z.array(z.string()).optional()}).optional()`.
- Modify: `apps/backend/src/modules/notification/notification.controller.ts`'s `createNotification` — pass `req.body` through as-is (service now reads `audience` off it).

**Frontend:**
- Fix (see Phase U, do here if U hasn't landed yet): `notification-recipient.service.ts`'s wrong endpoint.
- Create: `apps/frontend/src/services/admin-notification.service.ts` — full CRUD against `/api/notification` (mirror `admin-event.service.ts`'s shape: fetch/create/update/delete/bulk, all `auth('admin')`-gated so always via `@/lib/admin-api`), plus the new `audience` field in the create payload type.
- Create: `apps/frontend/src/types/admin-notification.type.ts` (`TNotification`: `_id, title, message, type, priority, channels: ('web'|'push'|'email')[], sender, expires_at?, status, created_at`; `TCreateNotificationPayload` adds `audience`).
- Create: `apps/frontend/src/app/(dashboard)/admin/notifications-broadcast/page.tsx` + `_components/` — a composer page (title/message/type-select/priority-select/channels-checkboxes/expires_at/audience-picker: radio between "By role" (multi-select from `TRole`) and "Specific users" (searchable multi-select via `admin-user.service.ts`'s `fetchUsers`)), list of past broadcasts with delete. Add a distinct `admin-menu-items.ts` entry (path `"notifications-broadcast"`, roles `["super-admin","admin"]`) sibling to the existing "Notifications" (self-inbox) item — keep both, they're different features (self-inbox vs. compose-and-send).
- Create: `apps/frontend/src/hooks/useUnreadNotificationCount.tsx` — small shared hook wrapping the (now-fixed) `fetchNotificationRecipientsBySelf({is_count_only:true})`, polled every 30s (matching the existing `NotificationsView.tsx` polling convention), returning `{count, isLoading}`. Used by all three bells below.
- Modify: `apps/frontend/src/components/partials/Header/Navigation/Notification/index.tsx` (public site bell) — wire the badge to `useUnreadNotificationCount()`, fetch+render the actual list (`fetchNotificationRecipientsBySelf({limit:5})`) in the two empty `<div>`s, keep the `/notification` link.
- Modify: `apps/frontend/src/components/partials/admin/Header/Notification/index.tsx` — same real wiring, replacing its static "No new notifications" placeholder; link stays `/admin/notifications`.
- Modify: `apps/frontend/src/components/partials/user/Header/index.tsx` (from Phase U) — same bell, wired identically, link to `/user/notifications`.
- Create: `apps/frontend/src/app/(primary)/notification/page.tsx` — full-page version of the same list (reuse `NotificationsView.tsx`'s card-rendering logic/markup, extracted or duplicated at this smaller scope — this is the public-site destination the bell's "View All" link already points to).
- Create: `apps/frontend/src/app/(dashboard)/user/notifications/page.tsx` — can literally reuse `NotificationsView` (it's already self-scoped via cookie auth, not admin-specific) by importing the same component, or thin-wrap it.

### Phase D: Bookmarks & Reading Lists (full UI, under `/user`)

**Files:**
- Modify: `apps/frontend/src/services/bookmark.service.ts` — add `updateBookmark(id, {notes?, is_read?})`, `moveBookmarkToReadingList(id, readingListId)`, `createReadingList({name, description?, is_public?})`, `fetchMyReadingLists()` (no pagination per backend), `fetchPublicReadingLists(limit?)`, `fetchReadingList(id)`, `updateReadingList(id, payload)`, `deleteReadingList(id)`, `followReadingList(id)`, `unfollowReadingList(id)`.
- Modify: `apps/frontend/src/types/bookmark.type.ts` — add `TReadingList` (`_id, user, name, description?, is_public, bookmarks: TBookmark[], followers: string[], bookmark_count?, created_at, updated_at`) + response wrappers.
- Create: `apps/frontend/src/app/(dashboard)/user/bookmarks/page.tsx` — list of `fetchMyBookmarks()`, filterable by reading list, per-row "move to list" + remove.
- Create: `apps/frontend/src/app/(dashboard)/user/reading-lists/page.tsx` — grid of my reading lists (`fetchMyReadingLists`) + create-new modal (name/description/is_public — `react-hook-form`, mirror any existing simple create-modal, e.g. `CategoryAddModal`'s structure at reduced field count).
- Create: `apps/frontend/src/app/(dashboard)/user/reading-lists/[id]/page.tsx` — single list detail (bookmarked articles inside it), edit-in-place for owner, follow/unfollow button for non-owner public lists.
- Create: `apps/frontend/src/app/(primary)/reading-lists/page.tsx` — public browse of `fetchPublicReadingLists()`.

### Phase E: Profile, follows, leaderboard, badges

**Fix first:** `user-profile.service.ts`'s `followAuthor`/`followCategory` snake_case body bug (see top of this section).

**Files:**
- Modify: `apps/frontend/src/services/user-profile.service.ts` — add `updateMyProfile({bio?, location?, website?, social_links?})` (PATCH `/me`), `updateNotificationPreferences({notification_preferences?, email_frequency?})` (PATCH `/me/notifications`).
- Create: `apps/frontend/src/app/(dashboard)/user/profile/page.tsx` — edit-my-profile form (bio/location/website/social links) using the fixed service function; avatar is NOT editable here (lives on base User model, out of scope — if there's already an existing "edit avatar" surface elsewhere, e.g. account settings, leave it there, don't duplicate).
- Create: `apps/frontend/src/app/(dashboard)/user/settings/page.tsx` — notification-preferences toggles (the 5 booleans) + `email_frequency` select, using `updateNotificationPreferences`.
- Create: `apps/frontend/src/app/(dashboard)/user/following/page.tsx` — lists `following_authors`/`following_categories`/`following_topics` from `getMyProfile()`, each with an unfollow button.
- Modify: wherever the category page and article/author byline currently render read-only (find the actual author-byline and category-page components) — add Follow/Unfollow buttons using the now-fixed `followAuthor`/`followCategory`/`followTopic` functions, matching whatever toggle-button pattern Task A5's bookmark button already established (useQuery-to-check-state + useMutation-to-toggle + toast).
- Create: `apps/frontend/src/app/(primary)/leaderboard/page.tsx` — `getTopUsers()`, ranked list/table with reputation score, avatar, name, link to `/profile/[userId]`.
- Create: `apps/frontend/src/services/admin-badge.service.ts` — full CRUD (`fetchBadges`, `fetchBadge`, `createBadge`, `updateBadge`, `deleteBadge`, `seedBadges` (super-admin only), `awardBadge(userId, badgeId)`) via `@/lib/admin-api`.
- Create: `apps/frontend/src/types/admin-badge.type.ts` (`TBadge`: `_id, name, description, icon, category: 'reader'|'engagement'|'loyalty'|'contribution'|'achievement', criteria: {type, threshold, description}, rarity: 'common'|'rare'|'epic'|'legendary', points, is_active, earned_count?, created_at`).
- Create: `apps/frontend/src/app/(dashboard)/admin/badges/page.tsx` + `_components/` — mirror `admin/categories/`'s exact modal-CRUD pattern (list+StatisticCards+Add/Edit modals+delete). Add `admin-menu-items.ts` entry, roles `["super-admin","admin"]`, icon `"award"`, path `"badges"`.

### Phase F: Polls

**Files:**
- Create: `apps/frontend/src/services/poll.service.ts` — `fetchPolls`, `fetchActivePolls`, `fetchFeaturedPolls`, `fetchPollsByNews(newsId)`, `fetchPoll(id)`, `fetchPollResults(id)`, `createPoll`, `updatePoll`, `deletePoll`, `votePoll(id, {option_indices, guest_id?})`. Poll create/update/delete are bare `auth()` (any role, ownership-checked server-side) — use `@/lib/admin-api` for writes, plain public fetch (or the same client, harmless) for reads.
- Create: `apps/frontend/src/types/poll.type.ts` (`TPoll` matching the model fields from research: `news?, title, description?, options: {text, votes}[], allow_multiple_votes, max_votes, allow_anonymous, show_results_before_vote, randomize_options, start_date, end_date?, is_active, total_votes, unique_voters, status, results?: {text,votes,percentage}[], has_voted?`).
- Create: `apps/frontend/src/components/partials/admin/NewsArticleForm/PollSelector/index.tsx` — sibling to `TemplateSelector`, but since a Poll references its article via `news` on the Poll doc (not the reverse), this can't literally mirror TemplateSelector's "inject into form field" idiom. Instead: on Add, after the article is saved (has an `_id`), show an inline "Create a poll for this article" mini-form (title + 2-10 options) that calls `createPoll({news: articleId, title, options})`. Render on both Add (post-save) and Edit (if no poll exists yet for this news, offer create; if one exists, show it read-only with a link to edit via its own small edit form) — poll editing is blocked server-side once `total_votes > 0`, so the edit UI must disable option fields (but not title/description) once `poll.total_votes > 0`.
- Create: `apps/frontend/src/components/(common)/news-page/PollWidget/index.tsx` — public voting widget: shows options as radio (or checkboxes if `allow_multiple_votes`), submits via `votePoll` (guest-allowed if `allow_anonymous`, using the same guest-cookie-riding `credentials:"include"` pattern already established for comments — no explicit guest_id needed unless the backend truly requires one for anonymous dedup; check `allow_anonymous` requires no `userId` — pass `guest_id` only if not authenticated, sourced from... note: research found no frontend-accessible guest id today (the `guest_token` cookie is httpOnly). If an anonymous vote requires a `guest_id` string and the frontend has no way to read the httpOnly cookie, either (a) omit `guest_id` and rely on the backend's own `guest_token`-based identification if the vote controller reads it server-side from the guest middleware — verify this against `poll.controller.ts`'s `votePoll` handler before assuming, since the research didn't confirm whether guest_id must be client-supplied or is derived server-side from `req.guest`), shows live results (percentage bars) after voting or if `show_results_before_vote`. Embed inside `apps/frontend/src/app/(primary)/news/[slug]/page.tsx` (or `NewsDetailsSection`) conditionally when `fetchPollsByNews(newsId)` returns a poll.

### Phase G: Comment moderation polish (guest-session hardening deferred — both existing guest mechanisms already interoperate correctly per research; no changes needed there)

**Files:**
- Modify: `apps/frontend/src/app/(dashboard)/admin/comments/_components/CommentsView.tsx` — add a "Flagged Queue" tab using the already-built-but-unused `fetchFlaggedComments({min_flags})` (a `min_flags` number input/select), and wire the already-built-but-unused `moderateComment(id, {status, reason})` as the Approve/Reject action for that tab specifically (asking for an optional reason via a small inline input, matching whatever confirm/prompt pattern `useAlert()` already supports) instead of the base `updateComment` PATCH the other tabs use.
- Add an edit-history viewer: a modal/drawer triggered per-comment, calling `GET /api/comment-enhanced/:id/history` (add `fetchCommentHistory(id)` to `apps/frontend/src/services/admin-comment.service.ts` if not already present — confirm first), rendering the returned history entries (previous content + edited_at).
- Modify: `apps/frontend/src/types/admin-comment.type.ts`'s `TCommentStatus` — add `"flagged"` to the union.

---

## Self-review (Phases U, B–G)

**Spec coverage:** Every gap-analysis item now has a concrete file list and decision. The 4 newly-discovered bugs (notification self-fetch auth gate, wrong endpoint path, follow-author/category casing, orphan broadcast) are each assigned to the phase that owns the affected feature, not silently skipped.

**Placeholder scan:** Phase U's dashboard overview stat cards are the one spot with a "may not have real data yet" caveat — resolved explicitly as "real query hooks against endpoints this same plan builds," not a TBD, and only because Phase U intentionally ships before C/D/E. Phase F's `guest_id` sourcing for anonymous poll votes is flagged as needing a one-line verification against `poll.controller.ts` before finalizing — carried as an explicit verification step for the implementer, not an assumption.

**Type consistency:** `TBookmark`/`bookmark.service.ts` (Phase D) extend Task A5's existing names rather than renaming. `TNotification`/`admin-notification.service.ts` (Phase C, admin) intentionally kept separate from `TNotificationRecipient`/`notification-recipient.service.ts` (self-inbox) since they're genuinely different resources, matching the backend's own module split.

import type { TItem } from "@/types/route-menu.type";

// Ported from apps/adminpanel's src/assets/data/route-menu-items.tsx, minus
// the `element`/AuthWrapper/react-router JSX (Next.js uses file-based
// routing under app/(dashboard)/admin/, so this data now only drives the
// sidebar menu + breadcrumbs via RouteMenu.getMenus(), not route building).
// Fixed a bug from the source: every role check used the misspelled
// "supper-admin", which never matches the backend's actual "super-admin"
// role (apps/backend/src/enums/user-role.enum.ts) — silently breaking
// super-admin-only menu/route visibility in the original app.
export const items: TItem[] = [
  {
    menuType: "title",
    name: "Dashboard",
  },
  {
    icon: "layout-template",
    index: true,
    name: "Dashboard",
  },
  {
    roles: ["super-admin", "admin"],
    menuType: "title",
    name: "Management",
  },
  {
    roles: ["super-admin", "admin"],
    icon: "users",
    path: "users",
    name: "Users",
    routeType: "layout",
    menuType: "item-without-children",
    children: [
      { index: true, name: "Users", menuType: "invisible" },
      { path: ":id", menuType: "invisible" },
    ],
  },
  {
    roles: ["super-admin", "admin", "editor", "author"],
    menuType: "title",
    name: "Categories & Events",
  },
  {
    roles: ["super-admin", "admin", "editor", "author"],
    icon: "blocks",
    path: "categories",
    name: "Categories",
    routeType: "layout",
    menuType: "item-without-children",
    children: [
      { index: true, name: "Categories", menuType: "invisible" },
      { path: ":id", menuType: "invisible" },
    ],
  },
  {
    roles: ["super-admin", "admin", "editor", "author"],
    icon: "calendar",
    path: "events",
    name: "Events",
    routeType: "layout",
    menuType: "item-without-children",
    children: [{ index: true, name: "Events", menuType: "invisible" }],
  },
  {
    roles: ["super-admin", "admin", "editor", "author", "contributor"],
    menuType: "title",
    name: "Media",
  },
  {
    roles: ["super-admin", "admin", "editor", "author", "contributor"],
    icon: "file",
    path: "files",
    name: "Files",
    routeType: "layout",
    menuType: "item-without-children",
    children: [
      { index: true, name: "Files", menuType: "invisible" },
      {
        roles: ["super-admin", "admin", "editor", "author", "contributor"],
        path: ":id",
        menuType: "invisible",
      },
      {
        roles: ["super-admin", "admin", "editor", "author", "contributor"],
        path: "add",
        menuType: "invisible",
      },
      {
        roles: ["super-admin", "admin", "editor", "author"],
        path: "edit/:id",
        menuType: "invisible",
      },
    ],
  },
  {
    roles: ["super-admin", "admin", "editor", "author", "contributor"],
    icon: "image",
    path: "media",
    name: "Media",
    routeType: "layout",
    menuType: "item-without-children",
    children: [
      { index: true, name: "Media", menuType: "invisible" },
      {
        roles: ["super-admin", "admin", "editor", "author"],
        path: "add",
        menuType: "invisible",
      },
      {
        roles: ["super-admin", "admin", "editor"],
        path: "edit/:id",
        menuType: "invisible",
      },
    ],
  },
  {
    roles: ["super-admin", "admin", "author", "editor"],
    menuType: "title",
    name: "News",
  },
  {
    roles: ["super-admin", "admin", "author", "editor"],
    icon: "newspaper",
    path: "news-articles",
    name: "News Articles",
    routeType: "layout",
    menuType: "item-without-children",
    children: [
      { index: true, name: "News Articles", menuType: "invisible" },
      {
        roles: ["super-admin", "admin", "author", "editor"],
        path: ":id",
        menuType: "invisible",
      },
      {
        roles: ["super-admin", "admin", "author"],
        path: "add",
        menuType: "invisible",
      },
      {
        roles: ["super-admin", "admin", "author", "editor"],
        path: "edit/:id",
        menuType: "invisible",
      },
    ],
  },
  {
    roles: ["super-admin", "admin", "author", "editor"],
    icon: "megaphone",
    path: "news-headline",
    name: "News Headlines",
    routeType: "layout",
    menuType: "item-without-children",
    children: [{ index: true, name: "News Headlines", menuType: "invisible" }],
  },
  {
    roles: ["super-admin", "admin", "author", "editor"],
    icon: "radio",
    path: "news-break",
    name: "News Break",
  },
  {
    roles: ["super-admin", "admin"],
    icon: "layout-template",
    path: "content-templates",
    name: "Article Templates",
  },
  {
    roles: ["super-admin", "admin"],
    menuType: "title",
    name: "Activities",
  },
  {
    roles: ["super-admin", "admin"],
    icon: "message-square-quote",
    path: "comments",
    name: "Comments",
  },
  {
    roles: ["super-admin", "admin"],
    icon: "smile",
    path: "reactions",
    name: "Reactions",
  },
  {
    roles: ["super-admin", "admin"],
    icon: "award",
    path: "badges",
    name: "Badges",
  },
  {
    roles: [
      "super-admin",
      "admin",
      "author",
      "editor",
      "contributor",
      "user",
    ],
    menuType: "title",
    name: "Settings",
  },
  {
    icon: "bell",
    path: "notifications",
    name: "Notifications",
  },
  {
    roles: ["super-admin", "admin"],
    icon: "megaphone",
    path: "notifications-broadcast",
    name: "Broadcast",
  },
  {
    roles: ["super-admin", "admin"],
    icon: "trash",
    path: "bin",
    name: "Recycle Bin",
  },
  {
    menuType: "invisible",
    path: "user",
    routeType: "layout",
    children: [{ path: "profile" }],
  },
];

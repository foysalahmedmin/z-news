import type { TItem } from "@/types/route-menu.type";

// Sidebar menu for the plain-signed-in-user dashboard shell (`/user/*`).
// Unlike admin-menu-items.ts, no item here carries a `roles` restriction —
// every signed-in role (user/subscriber/contributor/author/editor/admin/
// super-admin) sees the same personal-account menu, since this is about the
// user's own account, not role-gated administration.
export const items: TItem[] = [
  { menuType: "title", name: "Dashboard" },
  { icon: "layout-dashboard", index: true, name: "Dashboard" },
  { menuType: "title", name: "My Content" },
  {
    icon: "bookmark",
    path: "bookmarks",
    name: "Bookmarks",
    routeType: "layout",
    menuType: "item-without-children",
    children: [{ index: true, name: "Bookmarks", menuType: "invisible" }],
  },
  {
    icon: "list",
    path: "reading-lists",
    name: "Reading Lists",
    routeType: "layout",
    menuType: "item-without-children",
    children: [{ index: true, name: "Reading Lists", menuType: "invisible" }],
  },
  {
    icon: "users",
    path: "following",
    name: "Following",
    routeType: "layout",
    menuType: "item-without-children",
    children: [{ index: true, name: "Following", menuType: "invisible" }],
  },
  { menuType: "title", name: "Account" },
  {
    icon: "user",
    path: "profile",
    name: "My Profile",
    routeType: "layout",
    menuType: "item-without-children",
    children: [{ index: true, name: "My Profile", menuType: "invisible" }],
  },
  {
    icon: "bell",
    path: "notifications",
    name: "Notifications",
    routeType: "layout",
    menuType: "item-without-children",
    children: [{ index: true, name: "Notifications", menuType: "invisible" }],
  },
  {
    icon: "award",
    path: "badges",
    name: "Badges & Reputation",
    routeType: "layout",
    menuType: "item-without-children",
    children: [
      { index: true, name: "Badges & Reputation", menuType: "invisible" },
    ],
  },
  {
    icon: "settings",
    path: "settings",
    name: "Account Settings",
    routeType: "layout",
    menuType: "item-without-children",
    children: [
      { index: true, name: "Account Settings", menuType: "invisible" },
    ],
  },
];

"use client";

import { RouteMenu } from "@/builder/RouteMenu";
import { items } from "@/data/user-menu-items";
import useUser from "@/hooks/states/useUser";
import { useMemo } from "react";

// Computes the personal-account sidebar menu for the `/user/*` dashboard
// shell. Mirrors useAdminMenu.tsx, but user-menu-items.ts carries no `roles`
// restrictions, so every signed-in role sees the same menu regardless of
// `role`. initialPath: "user" makes RouteMenu produce "/user",
// "/user/bookmarks", etc., matching the real app/(dashboard)/user/* routes.
const useUserMenu = () => {
  const { user } = useUser();
  const role = user?.info?.role;

  const { menus, breadcrumbsMap } = useMemo(() => {
    const routeMenu = new RouteMenu(items);
    return routeMenu.getMenus({ role, initialPath: "user" });
  }, [role]);

  return { menus, breadcrumbsMap };
};

export default useUserMenu;

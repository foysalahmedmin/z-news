"use client";

import { RouteMenu } from "@/builder/RouteMenu";
import { items } from "@/data/admin-menu-items";
import useUser from "@/hooks/states/useUser";
import { useMemo } from "react";

// Computes the role-filtered admin sidebar menu directly from the signed-in
// user's role — no Redux needed, mirroring how the sidebar's active/open
// state is already derived straight from usePathname() rather than a
// dispatched indexesMap (see Sidebar/MenuItem). initialPath: "admin" makes
// RouteMenu produce "/admin", "/admin/users", etc., matching the real
// app/(dashboard)/admin/* routes.
const useAdminMenu = () => {
  const { user } = useUser();
  const role = user?.info?.role;

  const { menus, breadcrumbsMap } = useMemo(() => {
    const routeMenu = new RouteMenu(items);
    return routeMenu.getMenus({ role, initialPath: "admin" });
  }, [role]);

  return { menus, breadcrumbsMap };
};

export default useAdminMenu;

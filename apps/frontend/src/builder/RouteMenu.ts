import type {
  TBreadcrumbs,
  TItem,
  TNavigationConfig,
  TProcessedMenu,
  TRouteType,
} from "@/types/route-menu.type";

// Ported from apps/adminpanel's src/builder/RouteMenu.ts, menu-only. The
// original also built a react-router route tree (getRoutes/RouteProcessor);
// Next.js's App Router is file-based, so that half doesn't apply here and
// was dropped rather than ported dead.

class PathUtils {
  private static readonly TRIM_REGEX = /^\/|\/$/g;

  static trim(path: string = ""): string {
    return path?.replace(this.TRIM_REGEX, "") ?? "";
  }

  static join(paths: readonly string[] = []): string {
    if (!paths.length) return "";
    const processedPaths = paths.map((path) => this.trim(path)).filter(Boolean);
    return this.trim(processedPaths.join("/"));
  }

  static buildFullPath(
    initialPath: string = "/",
    path?: string,
    index?: true,
  ): string | undefined {
    if (index === true) return "/" + this.trim(initialPath);
    if (!path && path !== "") return undefined;
    if (path.includes(":")) return undefined;
    return "/" + this.join([initialPath, path]);
  }
}

class PermissionValidator {
  static checkRole(
    allowedRoles: readonly string[] | undefined,
    userRole: string | undefined,
    defaultResult: boolean = true,
  ): boolean {
    return !allowedRoles?.length
      ? defaultResult
      : Boolean(userRole && allowedRoles.includes(userRole));
  }

  static checkCategory(
    allowedCategories: readonly string[] | undefined,
    routeCategory: string | undefined,
    defaultResult: boolean = true,
  ): boolean {
    return !allowedCategories?.length
      ? defaultResult
      : Boolean(routeCategory && allowedCategories.includes(routeCategory));
  }

  static isItemAccessible(
    item: TItem,
    userRole?: string,
    category?: string,
  ): boolean {
    return (
      this.checkRole(item.roles, userRole) &&
      this.checkCategory(item.categories, category)
    );
  }
}

class ItemValidator {
  static isValidMenu(menu: TItem): boolean {
    const hasValidPath =
      (menu.path || menu.path === "") && !menu.path.includes(":");
    const hasChildren = Boolean(menu.children?.length);
    const hasName = Boolean(menu.name);
    const isParameterizedWithoutVisible =
      !!menu.path?.includes(":") && !hasChildren && menu.menuType === "visible";

    return (
      (hasValidPath || hasChildren || hasName) && !isParameterizedWithoutVisible
    );
  }

  static shouldHideMenu(
    item: TItem,
    userRole?: string,
    category?: string,
  ): boolean {
    return (
      item.hidden ||
      item.menuType === "invisible" ||
      !this.isValidMenu(item) ||
      !PermissionValidator.isItemAccessible(item, userRole, category)
    );
  }
}

abstract class BaseProcessor<T> {
  protected readonly userRole?: string;
  protected readonly category?: string;

  constructor(config: TNavigationConfig = {}) {
    this.userRole = config.role;
    this.category = config.category;
  }

  protected abstract processItem(item: TItem, config: TNavigationConfig): T[];

  public process(items: readonly TItem[], config: TNavigationConfig = {}): T[] {
    if (!items?.length) return [];

    const mergedConfig = {
      ...config,
      role: config.role ?? this.userRole,
      category: config.category ?? this.category,
    };

    return items.flatMap((item) => this.processItem(item, mergedConfig));
  }
}

class MenuProcessor extends BaseProcessor<TProcessedMenu> {
  protected processItem(
    item: TItem,
    config: TNavigationConfig,
  ): TProcessedMenu[] {
    if (ItemValidator.shouldHideMenu(item, config.role, config.category)) {
      return [];
    }

    const elements = this.buildMenuElement(item, config);

    if (!item.children?.length) {
      return [elements];
    }

    return this.processItemWithChildren(item, elements, config);
  }

  private buildMenuElement(
    item: TItem,
    config: TNavigationConfig,
  ): TProcessedMenu {
    const {
      icon,
      name,
      description,
      path,
      index,
      badge,
      badges,
      roles,
      routeType,
      menuType,
      status,
      categories,
    } = item;
    const processedPath = PathUtils.buildFullPath(
      config.initialPath,
      path,
      index,
    );

    return {
      name: name || path || "",
      ...(description && { description: description }),
      ...(processedPath && { path: processedPath }),
      ...(icon && { icon }),
      ...(badge && { badge }),
      ...(badges?.length && { badges: [...badges] }),
      ...(routeType && { routeType }),
      ...(menuType && { menuType }),
      ...(status && { status }),
      ...(roles?.length && { roles: [...roles] }),
      ...(categories?.length && { categories: [...categories] }),
    };
  }

  private processItemWithChildren(
    item: TItem,
    elements: TProcessedMenu,
    config: TNavigationConfig,
  ): TProcessedMenu[] {
    const { children, routeType, menuType, path } = item;

    if (menuType === "title" || menuType === "item-without-children") {
      return [elements];
    }

    if (routeType === "layout" && children?.length) {
      const nextConfig = this.createNextConfig(config, routeType, path);

      if (menuType === "item" || menuType === "item-without-path") {
        return [{ ...elements, children: this.process(children!, nextConfig) }];
      } else {
        return this.process(children!, nextConfig);
      }
    }

    if (children?.length) {
      const nextConfig = this.createNextConfig(config, routeType, path);
      return [{ ...elements, children: this.process(children!, nextConfig) }];
    }

    return [elements];
  }

  private createNextConfig(
    config: TNavigationConfig,
    routeType?: TRouteType,
    path?: string,
  ): TNavigationConfig {
    if (routeType !== "layout" || !path) {
      return config;
    }

    const newInitialPath =
      PathUtils.buildFullPath(config.initialPath, path)?.substring(1) ||
      config.initialPath;
    return { ...config, initialPath: newInitialPath };
  }
}

export class RouteMenu {
  private readonly items: readonly TItem[];
  private readonly menuProcessor: MenuProcessor;

  constructor(items: readonly TItem[]) {
    this.items = Object.freeze([...items]);
    this.menuProcessor = new MenuProcessor();
  }

  public getMenus(config: TNavigationConfig = {}): {
    menus: TProcessedMenu[];
    indexesMap: Record<string, number[]>;
    breadcrumbsMap: Record<string, TBreadcrumbs[]>;
  } {
    const menuConfig = { initialPath: "/", ...config };
    const menus = this.menuProcessor.process(this.items, menuConfig);

    const indexesMap: Record<string, number[]> = {};
    const breadcrumbsMap: Record<string, TBreadcrumbs[]> = {};

    const processMap = (
      items: readonly TProcessedMenu[],
      indexTrail: number[] = [],
      breadcrumbTrail: TBreadcrumbs[] = [],
    ): void => {
      items.forEach((item, idx) => {
        const currentIndexTrail = [...indexTrail, idx];
        const breadcrumbItem: TBreadcrumbs = {
          index: idx,
          name: item.name,
          ...(item.description && { description: item.description }),
          ...(item.icon && { icon: item.icon }),
          ...(item.path && { path: item.path }),
        };
        const currentBreadcrumbTrail = [...breadcrumbTrail, breadcrumbItem];

        if (item.path) {
          indexesMap[item.path] = currentIndexTrail;
          breadcrumbsMap[item.path] = currentBreadcrumbTrail;
        }

        if (item.children?.length) {
          processMap(item.children, currentIndexTrail, currentBreadcrumbTrail);
        }
      });
    };

    processMap(menus);
    return { menus, indexesMap, breadcrumbsMap };
  }

  public getItemsByRole(role: string): TItem[] {
    const filterByRole = (routes: readonly TItem[]): TItem[] => {
      return routes.reduce<TItem[]>((acc, route) => {
        if (PermissionValidator.checkRole(route.roles, role)) {
          const filteredChildren = route.children
            ? filterByRole(route.children)
            : undefined;
          acc.push({
            ...route,
            ...(filteredChildren && { children: filteredChildren }),
          });
        }
        return acc;
      }, []);
    };

    return filterByRole(this.items);
  }
}

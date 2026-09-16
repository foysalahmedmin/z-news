import type {
  IProcessedRoute,
  TBreadcrumbs,
  TItem,
  TNavigationConfig,
  TProcessedMenu,
  TRouteType,
} from "@/types/route-menu.type";

// ----------------------------
// Abstract Classes & Interfaces
// ----------------------------

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

// ----------------------------
// Utility Classes
// ----------------------------

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
  static isValidRoute(route: TItem): boolean {
    return (
      typeof route.path !== "undefined" ||
      Boolean(route.element) ||
      Boolean(route.children?.length)
    );
  }

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

  static shouldHideRoute(
    item: TItem,
    userRole?: string,
    category?: string,
  ): boolean {
    return (
      item.hidden ||
      item.menuType === "title" ||
      !this.isValidRoute(item) ||
      !PermissionValidator.isItemAccessible(item, userRole, category)
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

// ----------------------------
// Processors
// ----------------------------

class RouteProcessor extends BaseProcessor<IProcessedRoute> {
  protected processItem(
    item: TItem,
    config: TNavigationConfig,
  ): IProcessedRoute[] {
    if (ItemValidator.shouldHideRoute(item, config.role, config.category)) {
      return [];
    }

    const { path, element, children, loader, action, index, routeType } = item;

    const baseRoute = {
      ...(typeof path !== "undefined" && { path }),
      ...(element && { element }),
      ...(loader && { loader }),
      ...(action && { action }),
    };

    // Index route (no children allowed)
    if (index) {
      return [{ ...baseRoute, index: true } as IProcessedRoute];
    }

    // Layout route with children
    if (children?.length && routeType === "layout") {
      return [
        {
          ...baseRoute,
          children: this.process(children, config),
        } as IProcessedRoute,
      ];
    }

    // Regular nested children (not layout)
    if (children?.length) {
      return this.process(children, config);
    }

    // Regular route without index and children
    return [baseRoute as IProcessedRoute];
  }
}

class MenuProcessor extends BaseProcessor<TProcessedMenu> {
  protected processItem(
    item: TItem,
    config: TNavigationConfig,
  ): TProcessedMenu[] {
    // Early exit for invalid items
    if (ItemValidator.shouldHideMenu(item, config.role, config.category)) {
      return [];
    }

    const elements = this.buildMenuElement(item, config);

    // Early return if no children
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

    // Non-layout routes with children always return the element
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

// ----------------------------
// Main Navigation System
// ----------------------------

export class RouteMenu {
  private readonly items: readonly TItem[];
  private readonly routeProcessor: RouteProcessor;
  private readonly menuProcessor: MenuProcessor;

  constructor(items: readonly TItem[]) {
    this.items = Object.freeze([...items]);
    this.routeProcessor = new RouteProcessor();
    this.menuProcessor = new MenuProcessor();
  }

  public getRoutes(config: Pick<TNavigationConfig, "role"> = {}): {
    routes: IProcessedRoute[];
  } {
    return { routes: this.routeProcessor.process(this.items, config) };
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

  public getItems(): readonly TItem[] {
    return this.items;
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

  public getItemsByCategory(category: string): TItem[] {
    const filterByCategory = (routes: readonly TItem[]): TItem[] => {
      return routes.reduce<TItem[]>((acc, route) => {
        if (PermissionValidator.checkCategory(route.categories, category)) {
          const filteredChildren = route.children
            ? filterByCategory(route.children)
            : undefined;
          acc.push({
            ...route,
            ...(filteredChildren && { children: filteredChildren }),
          });
        }
        return acc;
      }, []);
    };

    return filterByCategory(this.items);
  }

  public findItemByPath(path: string): TItem | undefined {
    const findRoute = (
      routes: readonly TItem[],
      targetPath: string,
    ): TItem | undefined => {
      for (const route of routes) {
        if (route.path === targetPath) return route;
        if (route.children) {
          const found = findRoute(route.children, targetPath);
          if (found) return found;
        }
      }
      return undefined;
    };

    return findRoute(this.items, path);
  }

  public validateItems(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const paths = new Set<string>();

    const validateItem = (route: TItem, parentPath = ""): void => {
      const fullPath = route.path
        ? PathUtils.join([parentPath, route.path])
        : parentPath;

      if (fullPath && paths.has(fullPath)) {
        errors.push(`Duplicate path found: ${fullPath}`);
      }

      if (fullPath) paths.add(fullPath);

      // Check Name only if it's not an index route
      if (route.index !== true && !route.name) {
        errors.push(`Route with path "${fullPath}" is missing a Name`);
      }

      route.children?.forEach((child) => validateItem(child, fullPath));
    };

    this.items.forEach((item) => validateItem(item));

    return { valid: errors.length === 0, errors };
  }
}

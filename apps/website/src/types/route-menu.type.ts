export type TItemStatus = "active" | "inactive" | "deprecated" | "beta";
export type TRouteType = "layout" | "page" | "redirect" | "external";
export type TMenuType =
  | "visible"
  | "invisible"
  | "title"
  | "item"
  | "item-without-path"
  | "item-without-children";

export type TRouteMeta = {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
};

export type TItem = {
  readonly name?: string;
  readonly description?: string;
  readonly icon?: string;
  readonly path?: string;
  readonly index?: true;
  readonly status?: TItemStatus;
  readonly routeType?: TRouteType;
  readonly menuType?: TMenuType;
  readonly element?: React.ReactElement;
  readonly loader?: () => Promise<unknown> | unknown;
  readonly action?: () => Promise<unknown> | unknown;
  readonly badge?: string;
  readonly badges?: readonly string[];
  readonly children?: readonly TItem[];
  readonly roles?: readonly string[];
  readonly categories?: readonly string[];
  readonly hidden?: boolean;
  readonly meta?: TRouteMeta;
};

export type TProcessedWithIndexRoute = {
  path?: string;
  element?: React.ReactElement;
  loader?: () => Promise<unknown> | unknown;
  action?: () => Promise<unknown> | unknown;
  index?: true;
  children?: undefined;
};

export type TProcessedWithoutIndexRoute = {
  path?: string;
  element?: React.ReactElement;
  loader?: () => Promise<unknown> | unknown;
  action?: () => Promise<unknown> | unknown;
  index?: false;
  children?: IProcessedRoute[];
};

export type IProcessedRoute =
  | TProcessedWithIndexRoute
  | TProcessedWithoutIndexRoute;

export type TProcessedMenu = {
  name: string;
  description?: string;
  path?: string;
  icon?: string;
  badge?: string;
  badges?: string[];
  routeType?: TRouteType;
  menuType?: TMenuType;
  status?: TItemStatus;
  roles?: string[];
  categories?: string[];
  children?: TProcessedMenu[];
};

export type TNavigationConfig = {
  readonly role?: string;
  readonly category?: string;
  readonly initialPath?: string;
};

export type TBreadcrumbs = {
  index: number;
  name: string;
  description?: string;
  icon?: string;
  path?: string;
};

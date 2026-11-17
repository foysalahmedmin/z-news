import { ENV } from "@/config";
import { getInternalHeaders } from "@/lib/api";
import { TCategoriesResponse, TCategoryResponse } from "@/types/category.type";

// 5 min + on-demand expiry via the "categories" tag (app/api/revalidate).
const CATEGORY_CACHE = { revalidate: 300, tags: ["categories"] };

// 404 -> { data: null } (page calls notFound()); other failures throw so ISR
// keeps the last good page.
export async function fetchCategory(
  slug: string,
  query?: Record<string, any>,
): Promise<TCategoryResponse> {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/category/${encodeURIComponent(slug)}/public${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getInternalHeaders(),
    next: CATEGORY_CACHE,
  });

  if (response.status === 404) {
    return { data: null, message: "Category not found", success: false } as any;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch category "${slug}": ${response.status}`);
  }

  return response.json() as Promise<TCategoryResponse>;
}

export async function fetchCategories(
  query?: Record<string, any>,
): Promise<TCategoriesResponse> {
  try {
    const queryString = query
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : "";

    const url = `${ENV.api_url}/api/category/public${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getInternalHeaders(),
      next: CATEGORY_CACHE,
    });

    if (!response.ok) {
      return {
        data: [],
        message: "Failed to fetch categories",
        success: false,
      };
    }

    return response.json() as Promise<TCategoriesResponse>;
  } catch (error) {
    return { data: [], message: "Failed to fetch categories", success: false };
  }
}

export async function fetchCategoriesTree(
  query?: Record<string, any>,
): Promise<TCategoriesResponse> {
  try {
    const queryString = query
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : "";

    const url = `${ENV.api_url}/api/category/tree/public${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getInternalHeaders(),
      next: CATEGORY_CACHE,
    });

    if (!response.ok) {
      return {
        data: [],
        message: "Failed to fetch categories",
        success: false,
      };
    }

    return response.json() as Promise<TCategoriesResponse>;
  } catch (error) {
    return { data: [], message: "Failed to fetch categories", success: false };
  }
}

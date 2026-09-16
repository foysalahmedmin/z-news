import { ENV } from "@/config";
import { TCategoriesResponse, TCategoryResponse } from "@/types/category.type";

export async function fetchCategory(
  slug: string,
  query?: Record<string, any>,
): Promise<TCategoryResponse> {
  try {
    const queryString = query
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : "";

    const url = `${ENV.api_url}/api/category/${slug}/public${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      next: { revalidate: 60 * 0.5 },
    });

    if (!response.ok) {
      return {
        data: null,
        message: "Failed to fetch category",
        success: false,
      } as any;
    }

    return response.json() as Promise<TCategoryResponse>;
  } catch (error) {
    return {
      data: null,
      message: "Failed to fetch category",
      success: false,
    } as any;
  }
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
      next: { revalidate: 60 * 0.5 },
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
      next: { revalidate: 60 * 0.5 },
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

"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, X } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { Badge } from "@/components/ui/Badge";
import { FormControlLabel } from "@/components/ui/FormControl";
import { fetchCategoriesTree } from "@/services/admin-category.service";
import type { TCategory } from "@/types/admin-category.type";
import type { NewsFormData } from "../schema";

// Ported from apps/adminpanel's
// news-articles-mutation-page/AdditionalCategoriesInput/index.tsx.
// `category.service` (public in this app) -> `admin-category.service`
// (authenticated admin CRUD), matching the rest of the admin dashboard.
const AdditionalCategoriesInput = () => {
  const { setValue, watch } = useFormContext<NewsFormData>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const categories = watch("categories") || [];

  const { data: options } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      fetchCategoriesTree({ sort: "sequence", limit: 25, status: "active" }),
  });
  const createCategoryMap = (
    categories: TCategory[],
  ): Record<string, string> => {
    const map: Record<string, string> = {};

    const addToMap = (category: TCategory) => {
      map[category._id] = category.name;
      if (category.children) {
        category.children.forEach(addToMap);
      }
    };

    categories.forEach(addToMap);
    return map;
  };

  const categoryMap = options?.data ? createCategoryMap(options.data) : {};

  const findCategoryName = (id: string): string => {
    return categoryMap[id] || id;
  };

  const toggleCategory = (categoryId: string) => {
    if (categories.includes(categoryId)) {
      // Remove category
      setValue(
        "categories",
        categories.filter((cat) => cat !== categoryId),
      );
    } else {
      // Add category
      setValue("categories", [...categories, categoryId]);
    }

    setIsDropdownOpen(false);
  };

  const removeCategory = (categoryToRemove: string) => {
    setValue(
      "categories",
      categories.filter((cat) => cat !== categoryToRemove),
    );
  };

  const renderCategoryOptions = (
    category: TCategory,
    prefix = "",
  ): JSX.Element[] => {
    const options: JSX.Element[] = [
      <div
        key={category._id}
        className={`hover:bg-muted flex cursor-pointer items-center justify-between border-s border-transparent px-3 py-2 ${
          categories.includes(category._id)
            ? "bg-muted-foreground/25 border-foreground"
            : ""
        }`}
        onClick={() => toggleCategory(category._id)}
      >
        <span>{prefix + category.name}</span>
        {categories.includes(category._id) && (
          <span className="text-primary">✓</span>
        )}
      </div>,
    ];

    if (category.children) {
      category.children.forEach((child) => {
        options.push(...renderCategoryOptions(child, prefix + "-- "));
      });
    }

    return options;
  };

  return (
    <div>
      <FormControlLabel>Additional Categories</FormControlLabel>

      {/* Custom Dropdown */}
      <div className="relative mt-1">
        <div
          className="bg-card flex min-h-[38px] cursor-pointer items-center justify-between rounded-md border px-3 py-2"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="text-gray-500">
            {categories.length === 0
              ? "Select categories..."
              : `${categories.length} categories selected`}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
          />
        </div>

        {isDropdownOpen && (
          <div className="bg-card absolute z-10 mt-1 max-h-96 w-full overflow-y-auto rounded-md border shadow-lg">
            {options?.data
              ?.map((category) => renderCategoryOptions(category))
              .flat()}
          </div>
        )}
      </div>

      {/* Selected Categories Display */}
      <div className="mt-2 flex flex-wrap gap-2">
        {categories?.map((cat) => (
          <Badge key={cat} className="bg-muted-foreground/25 text-foreground">
            {findCategoryName(cat)}
            <X
              className="ml-1 h-3 w-3 cursor-pointer"
              onClick={() => removeCategory(cat)}
            />
          </Badge>
        ))}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default AdditionalCategoriesInput;

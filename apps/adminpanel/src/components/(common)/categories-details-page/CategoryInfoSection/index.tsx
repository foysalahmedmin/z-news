import Icon from "@/components/ui/Icon";
import type { TCategory, TStatus } from "@/types/category.type";
import { Calendar, Eye, EyeOff, Star, Tag } from "lucide-react";
import React from "react";

const getStatusColor = (status?: TStatus) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status?: TStatus) => {
  switch (status) {
    case "active":
      return <Eye className="h-4 w-4" />;
    case "inactive":
      return <EyeOff className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

type CategoryInfoSectionProps = {
  category?: Partial<TCategory>;
};

const CategoryInfoSection: React.FC<CategoryInfoSectionProps> = ({
  category,
}) => {
  return (
    <>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {category?.thumbnail ? (
            <img
              src={category?.thumbnail}
              alt={category?.name}
              className="size-24 rounded-md object-cover"
            />
          ) : (
            <div className="bg-muted flex size-24 items-center justify-center rounded-md">
              <Icon className="size-12" name={category?.icon} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {category?.name}
            </h2>
            {category?.is_featured && (
              <div className="flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-500">
                <Star className="size-4 fill-current" />
                Featured
              </div>
            )}
          </div>
          <div className="text-muted-foreground flex items-center space-x-4 text-sm">
            <span className="flex items-center">
              <Tag className="mr-1 h-4 w-4" />
              {category?.slug}
            </span>
            <span>Sequence: {category?.sequence}</span>
          </div>
          <div
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(category?.status)}`}
          >
            {getStatusIcon(category?.status)}
            <span className="ml-1 capitalize">{category?.status}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryInfoSection;

import type { TCategory } from "@/types/category.type";
import { FileText } from "lucide-react";
import React from "react";

export type TCategoryOverviewSectionProps = {
  category?: Partial<TCategory>;
};

const CategoryOverviewSection: React.FC<TCategoryOverviewSectionProps> = ({
  category,
}) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      {category?.description && (
        <div>
          <h3 className="text-foreground mb-3 flex items-center text-lg font-semibold">
            <FileText className="mr-2 h-5 w-5" />
            Description
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {category.description}
          </p>
        </div>
      )}

      {/* Category Details */}
      <div>
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          Category Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 text-sm">
              Category ID
            </div>
            <div className="text-foreground font-mono text-sm">
              {category?._id}
            </div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 text-sm">
              Parent Category
            </div>
            <div className="text-foreground text-sm">
              {category?.category || "None"}
            </div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 text-sm">
              Layout Type
            </div>
            <div className="text-foreground flex items-center text-sm">
              {category?.layout || "Default"}
            </div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 text-sm">
              Subcategories
            </div>
            <div className="text-foreground text-sm">
              {category?.children?.length || 0} items
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryOverviewSection;

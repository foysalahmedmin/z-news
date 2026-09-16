import { ActiveLink } from "@/components/ui/ActiveLink";
import Icon from "@/components/ui/Icon";
import { TCategory } from "@/types/category.type";
import React from "react";

type CategoryNewsPageHeaderSectionProps = {
  category?: Partial<TCategory>;
};
const CategoryNewsPageHeaderSection: React.FC<
  CategoryNewsPageHeaderSectionProps
> = ({ category }) => {
  return (
    <section>
      <div className="bg-accent text-accent-foreground shadow">
        <div className="space-y-4 py-6">
          <div className="container flex items-center gap-2 md:gap-4">
            {category?.icon && (
              <Icon className="size-8 md:size-10" name={category?.icon || ""} />
            )}
            <h1 className="text-xl font-bold md:text-3xl">{category?.name}</h1>
          </div>
          {category?.children && category?.children.length > 0 && (
            <div className="container">
              <hr />
            </div>
          )}
          {category?.children && category?.children.length > 0 && (
            <div className="container flex flex-wrap items-center gap-4">
              {category?.children?.map((category) => (
                <div key={category._id}>
                  <ActiveLink
                    className="underline-effect foreground hover:underline-effect-active text-sm whitespace-nowrap uppercase transition-colors duration-200"
                    activeClassName="underline-effect-active"
                    href={`/category/${category.slug}`}
                  >
                    {category.name}
                  </ActiveLink>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryNewsPageHeaderSection;

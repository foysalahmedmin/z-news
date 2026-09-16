// components/NewsActions.tsx
"use client";

import { TNews } from "@/types/news.type";
import Print from "./print";
import Reaction from "./reaction";
import Share from "./share";
import View from "./view";

type NewsActionSectionProps = {
  news?: Partial<TNews>;
};

const NewsActionSection: React.FC<NewsActionSectionProps> = ({ news }) => {
  return (
    <div className="container mx-auto">
      <div className="bg-card rounded-md border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Reaction news={news!} />
            {/* <Save news={news!} /> */}
            <Print news={news!} />
            <Share news={news!} />
          </div>

          {/* View Count */}
          <div className="flex items-center gap-4">
            <View news={news!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsActionSection;

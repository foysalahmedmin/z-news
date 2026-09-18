import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Folder, Tag, Users } from "lucide-react";
import Link from "next/link";

// Presentational summary widget for the Reader dashboard's "following"
// counts (part of the consolidated fetchReaderDashboard() response).
// Icons match the ones already used per-type on `/user/following`
// (Users/Folder/Tag), which is the full-list page this card links out to.
type FollowingSummaryCardProps = {
  data: {
    authors_count: number;
    categories_count: number;
    topics_count: number;
  };
};

const FollowingSummaryCard = ({ data }: FollowingSummaryCardProps) => {
  const stats = [
    { label: "Authors", value: data.authors_count, icon: Users },
    { label: "Categories", value: data.categories_count, icon: Folder },
    { label: "Topics", value: data.topics_count, icon: Tag },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Following</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: StatIcon }) => (
            <div
              key={label}
              className="bg-muted/50 flex flex-col items-center gap-1.5 rounded-md border p-4 text-center"
            >
              <StatIcon className="text-muted-foreground size-4" />
              <span className="text-xl font-semibold tabular-nums">{value}</span>
              <span className="text-muted-foreground text-xs">{label}</span>
            </div>
          ))}
        </div>
        <Link
          href="/user/following"
          className="text-primary self-end text-sm font-medium hover:underline"
        >
          View full list
        </Link>
      </CardContent>
    </Card>
  );
};

export default FollowingSummaryCard;

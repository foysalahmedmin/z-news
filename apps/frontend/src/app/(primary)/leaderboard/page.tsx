import { getTopUsers } from "@/services/user-profile.service";
import type { TUserProfile } from "@/types/user-profile.type";
import { Award, Medal, Star, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export const metadata = {
  title: "Leaderboard — Z-News",
  description: "Top contributors on Z-News, ranked by reputation score.",
};

const RANK_STYLES: Record<number, string> = {
  1: "bg-gradient-to-br from-yellow-400 to-amber-500 text-white",
  2: "bg-gradient-to-br from-gray-300 to-gray-400 text-white",
  3: "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
};

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank <= 3) {
    return (
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-sm ${RANK_STYLES[rank]}`}
      >
        <Trophy className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className="bg-muted text-muted-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold">
      #{rank}
    </div>
  );
};

const TopBadge = ({ profile }: { profile: TUserProfile }) => {
  if (!profile.badges || profile.badges.length === 0) return null;

  const top = profile.badges.reduce((best, current) =>
    (current.badge_id?.points || 0) > (best.badge_id?.points || 0)
      ? current
      : best,
  );

  return (
    <div
      className="bg-muted text-muted-foreground flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      title={top.badge_id?.description}
    >
      {top.badge_id?.icon ? (
        <span>{top.badge_id.icon}</span>
      ) : (
        <Award className="h-3 w-3 text-yellow-500" />
      )}
      <span className="max-w-[6rem] truncate">
        {top.badge_id?.name || "Badge"}
      </span>
      {profile.badges.length > 1 && (
        <span className="text-muted-foreground">
          +{profile.badges.length - 1}
        </span>
      )}
    </div>
  );
};

const LeaderboardPage = async () => {
  let profiles: TUserProfile[] = [];
  try {
    const res = await getTopUsers(20);
    profiles = res?.data ?? [];
  } catch {
    profiles = [];
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-yellow-500 text-white shadow-sm">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">
            Top contributors ranked by reputation score
          </p>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center gap-2 rounded-2xl border p-12 text-center shadow-sm">
          <Medal className="text-muted-foreground h-10 w-10" />
          <p className="font-medium">No contributors yet</p>
          <p className="text-muted-foreground text-sm">
            Check back soon to see the top-ranked members of the community.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {profiles.map((profile, index) => {
            const rank = index + 1;
            const user = profile.user;

            return (
              <li
                key={profile._id}
                className="bg-card flex items-center gap-4 rounded-2xl border p-4 shadow-sm"
              >
                <RankBadge rank={rank} />

                <div className="bg-muted relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/profile/${user?._id}`}
                    className="truncate font-semibold hover:underline"
                  >
                    {user?.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <TopBadge profile={profile} />
                    {profile.badges && profile.badges.length > 0 && (
                      <span className="text-muted-foreground text-xs">
                        {profile.badges.length}{" "}
                        {profile.badges.length === 1 ? "badge" : "badges"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-shrink-0 flex-col items-center rounded-xl border bg-gradient-to-br from-orange-50 to-yellow-50 px-4 py-2 text-center">
                  <Star className="h-4 w-4 text-orange-500" />
                  <span className="text-lg font-bold text-orange-600">
                    {profile.reputation_score}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    Reputation
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
};

export default LeaderboardPage;

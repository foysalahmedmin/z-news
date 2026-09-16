import { getPublicProfile } from "@/services/user-profile.service";
import type { TUserProfile } from "@/types/user-profile.type";
import {
  Award,
  BookOpen,
  ExternalLink,
  Facebook,
  Flame,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  ThumbsUp,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ userId: string }>;
};

export const generateMetadata = async ({ params }: Props) => {
  const { userId } = await params;
  try {
    const { data } = await getPublicProfile(userId);
    if (!data) return { title: "Profile Not Found" };
    return {
      title: `${data.user?.name} — Z-News Profile`,
      description: data.bio || `View ${data.user?.name}'s profile on Z-News`,
    };
  } catch {
    return { title: "Profile Not Found" };
  }
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) => (
  <div className="bg-card flex flex-col items-center gap-1 rounded-xl border p-4 shadow-sm">
    <Icon className={`h-5 w-5 ${color}`} />
    <span className="text-2xl font-bold">{value}</span>
    <span className="text-muted-foreground text-xs">{label}</span>
  </div>
);

const getBadgeColor = (points: number) => {
  if (points >= 100) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (points >= 50) return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const ProfilePage = async ({ params }: Props) => {
  const { userId } = await params;

  let profile: TUserProfile | null = null;
  try {
    const res = await getPublicProfile(userId);
    profile = res?.data ?? null;
  } catch {
    notFound();
  }

  if (!profile) notFound();

  const user = profile.user;
  const socialLinks = profile.social_links;

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      {/* Profile Header */}
      <section className="bg-card mb-8 overflow-hidden rounded-2xl border shadow-sm">
        {/* Cover gradient */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-12 left-6">
            <div className="border-background bg-muted relative h-24 w-24 overflow-hidden rounded-full border-4 shadow-lg">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="pt-16">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  {profile.is_verified_reader && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  {profile.is_premium && (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                      <Star className="h-3 w-3" />
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{user?.email}</p>

                {profile.location && (
                  <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </div>
                )}
              </div>

              {/* Reputation Score */}
              <div className="flex flex-col items-center rounded-xl border bg-gradient-to-br from-orange-50 to-yellow-50 p-4 text-center shadow-sm">
                <Star className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-orange-600">
                  {profile.reputation_score}
                </span>
                <span className="text-muted-foreground text-xs">
                  Reputation
                </span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 text-sm leading-relaxed">{profile.bio}</p>
            )}

            {/* Links */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={`https://twitter.com/${socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-500 hover:text-sky-600"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {socialLinks?.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={`https://instagram.com/${socialLinks.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Activity Stats Grid */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Activity Stats</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={MessageSquare}
            label="Comments"
            value={profile.total_comments}
            color="text-blue-500"
          />
          <StatCard
            icon={ThumbsUp}
            label="Reactions"
            value={profile.total_reactions}
            color="text-green-500"
          />
          <StatCard
            icon={BookOpen}
            label="Articles Read"
            value={profile.articles_read}
            color="text-purple-500"
          />
          <StatCard
            icon={Flame}
            label="Day Streak"
            value={profile.reading_streak}
            color="text-orange-500"
          />
        </div>
      </section>

      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Award className="h-5 w-5 text-yellow-500" />
            Badges & Achievements
          </h2>
          <div className="flex flex-wrap gap-3">
            {profile.badges.map((b, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${getBadgeColor(b.badge_id?.points || 0)}`}
                title={b.badge_id?.description}
              >
                {b.badge_id?.icon ? (
                  <span>{b.badge_id.icon}</span>
                ) : (
                  <Award className="h-3.5 w-3.5" />
                )}
                {b.badge_id?.name || "Badge"}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Following Categories */}
      {profile.following_categories &&
        profile.following_categories.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Following Categories</h2>
            <div className="flex flex-wrap gap-2">
              {profile.following_categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className="bg-muted rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

      {/* Following Authors */}
      {profile.following_authors && profile.following_authors.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Following Authors</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {profile.following_authors.map((author) => (
              <div
                key={author._id}
                className="bg-card flex items-center gap-3 rounded-xl border p-3 shadow-sm"
              >
                <div className="bg-muted relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                  {author.image ? (
                    <Image
                      src={author.image}
                      alt={author.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                      {author.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{author.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {author.email}
                  </p>
                </div>
                <ExternalLink className="text-muted-foreground h-4 w-4 flex-shrink-0" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Following Topics */}
      {profile.following_topics && profile.following_topics.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Following Topics</h2>
          <div className="flex flex-wrap gap-2">
            {profile.following_topics.map((topic, i) => (
              <span
                key={i}
                className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
              >
                #{topic}
              </span>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProfilePage;

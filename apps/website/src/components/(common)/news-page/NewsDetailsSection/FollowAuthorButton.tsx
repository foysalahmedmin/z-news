"use client";

import {
  followAuthor,
  getMyProfile,
  unfollowAuthor,
} from "@/services/user-profile.service";
import { Bell, BellOff, Loader2, UserCheck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

type TFollowAuthorButtonProps = {
  authorId: string;
  authorName: string;
  className?: string;
  compact?: boolean;
};

const FollowAuthorButton: React.FC<TFollowAuthorButtonProps> = ({
  authorId,
  authorName,
  className = "",
  compact = false,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await getMyProfile();
        if (profileRes?.data) {
          setIsLoggedIn(true);
          const alreadyFollowing = profileRes.data.following_authors?.some(
            (a) => a._id === authorId,
          );
          setIsFollowing(!!alreadyFollowing);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  }, [authorId]);

  // Don't render if not logged in or still initializing
  if (!isInitialized || !isLoggedIn) return null;

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowAuthor(authorId);
        setIsFollowing(false);
      } else {
        await followAuthor(authorId);
        setIsFollowing(true);
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        title={isFollowing ? `Unfollow ${authorName}` : `Follow ${authorName}`}
        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200 disabled:opacity-60 ${
          isFollowing
            ? "border-gray-300 bg-gray-100 text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
        } ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isFollowing ? (
          <UserCheck className="h-3 w-3" />
        ) : (
          <UserPlus className="h-3 w-3" />
        )}
        {isFollowing ? "Following" : "Follow"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-60 ${
        isFollowing
          ? "border-gray-300 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {isFollowing ? "Following" : "Follow Author"}
    </button>
  );
};

export default FollowAuthorButton;

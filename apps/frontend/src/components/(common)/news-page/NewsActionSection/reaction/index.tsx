"use client";

import { cn } from "@/lib/utils";
import {
  createReaction,
  deleteReaction,
  fetchNewsReaction,
  updateReaction,
} from "@/services/reaction.service";
import { TNews } from "@/types/news.type";
import { TReaction } from "@/types/reaction.type";
import { formatCount } from "@/utils/formatCount";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import React, { useEffect, useState } from "react";

type ReactionProps = {
  news: Partial<TNews>;
  className?: string;
};

const Reaction: React.FC<ReactionProps> = ({ news, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);

  const [reaction, setReaction] = useState<Partial<TReaction>>({});
  const is_liked = reaction?.type === "like";
  const is_disliked = reaction?.type === "dislike";

  const handleReaction = async (type: "like" | "dislike") => {
    if (!news?._id) return;
    setIsLoading(true);

    try {
      if (reaction?._id) {
        if (reaction.type === type) {
          await deleteReaction(reaction._id);
          setReaction({});
          if (type === "like") setLikesCount((c) => c - 1);
          else setDislikesCount((c) => c - 1);
          return;
        }
        await updateReaction(reaction._id, { type });
        if (type === "like") {
          setLikesCount((c) => c + 1);
          setDislikesCount((c) => c - 1);
        } else {
          setLikesCount((c) => c - 1);
          setDislikesCount((c) => c + 1);
        }
        setReaction((prev) => ({ ...prev, type }));
      } else {
        const { data } = await createReaction({ news: news._id, type });
        if (type === "like") setLikesCount((c) => c + 1);
        else setDislikesCount((c) => c + 1);
        setReaction(data || {});
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!news?._id) return;
    const getReaction = async () => {
      try {
        if (!news?._id) return;
        setIsLoading(true);

        const { data, meta } = await fetchNewsReaction(news?._id);
        const { likes = 0, dislikes = 0 } = meta || {};
        setLikesCount((likes as number) || 0);
        setDislikesCount((dislikes as number) || 0);
        setReaction(data || {});
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getReaction();
  }, [news]);

  return (
    <div
      className={cn(
        "divide-muted-foreground/25 bg-muted flex h-10 items-center divide-x rounded-md p-1",
        className,
      )}
    >
      <button
        disabled={isLoading}
        onClick={() => handleReaction("like")}
        className="flex h-full cursor-pointer items-center gap-1 px-2"
      >
        <ThumbsUp
          className={cn("size-5", {
            "fill-current": is_liked,
          })}
        />
        <span className="text-lg leading-0">{formatCount(likesCount)}</span>
      </button>
      <button
        disabled={isLoading}
        onClick={() => handleReaction("dislike")}
        className="flex h-full cursor-pointer items-center gap-1 px-2"
      >
        <ThumbsDown
          className={cn("size-5", {
            "fill-current": is_disliked,
          })}
        />
        <span className="text-lg leading-0">{formatCount(dislikesCount)}</span>
      </button>
    </div>
  );
};

export default Reaction;

"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface VideoThumbnailPlayerProps {
  url: string; // Video link (YouTube or direct)
  thumbnail: string; // Thumbnail image
  alt?: string; // Alt text
  width?: number;
  height?: number;
  className?: string;
  isDirectVideo?: boolean;
}

export default function VideoThumbnailPlayer({
  url,
  thumbnail,
  alt = "Video thumbnail",
  width = 800,
  height = 450,
  className = "",
  isDirectVideo = false,
}: VideoThumbnailPlayerProps) {
  const [playVideo, setPlayVideo] = useState(false);

  if (playVideo) {
    if (isDirectVideo) {
      return (
        <video
          width="100%"
          height={height}
          src={url}
          controls
          autoPlay
          className="aspect-video h-auto w-full rounded-md shadow"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <iframe
        width="100%"
        height={height}
        src={url}
        title={alt}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video h-auto w-full rounded-md shadow"
      ></iframe>
    );
  }

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      style={{ width: "100%", maxWidth: width }}
      onClick={() => {
        if (!url) return;
        setPlayVideo(true);
      }}
    >
      <Image
        src={thumbnail}
        alt={alt}
        width={width}
        height={height}
        className="aspect-video h-auto w-full rounded-md object-cover shadow"
      />
      <div className="absolute inset-0 m-auto flex aspect-square h-1/3 items-center justify-center rounded-full border bg-black/25 text-white backdrop-blur-xs">
        <Play className="size-1/2" strokeWidth={2} />
      </div>
    </div>
  );
}

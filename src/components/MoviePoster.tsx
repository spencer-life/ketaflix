"use client";

import { useState } from "react";
import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb";

interface MoviePosterProps {
  posterPath: string | null;
  title: string;
  voteAverage?: number;
  sizes?: string;
}

export default function MoviePoster({
  posterPath,
  title,
  voteAverage,
  sizes = "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw",
}: MoviePosterProps) {
  const [failed, setFailed] = useState(false);
  const src = posterPath ? tmdbImage(posterPath, "w342") : null;
  const showImage = src && !failed;

  return (
    <div className="poster-frame aspect-[2/3] overflow-hidden">
      {/* Always render title fallback underneath */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-white/[0.06] to-transparent p-3 text-center">
        <span className="line-clamp-3 text-sm font-semibold leading-tight text-white/45">
          {title}
        </span>
      </div>
      {/* Image layers on top when available */}
      {showImage && (
        <Image
          src={src}
          alt={title}
          fill
          className="relative z-10 object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={sizes}
          onError={() => setFailed(true)}
        />
      )}
      {voteAverage !== undefined && voteAverage > 0 && (
        <div className="absolute bottom-2 right-2 z-20 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/80 backdrop-blur-xl">
          {voteAverage.toFixed(1)}
        </div>
      )}
    </div>
  );
}

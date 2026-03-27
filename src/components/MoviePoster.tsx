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
      {showImage ? (
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={sizes}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.06] to-transparent p-3 text-center">
          <span className="line-clamp-3 text-sm font-semibold leading-tight text-white/40">
            {title}
          </span>
        </div>
      )}
      {voteAverage !== undefined && voteAverage > 0 && (
        <div className="absolute bottom-1.5 right-1.5 rounded-full border border-white/10 bg-black/40 px-1.5 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-md">
          {voteAverage.toFixed(1)}
        </div>
      )}
    </div>
  );
}

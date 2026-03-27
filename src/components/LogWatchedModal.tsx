"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { logWatched, getCrewMembers } from "@/lib/db";
import { tmdbImage } from "@/lib/tmdb";
import { VIBE_TAGS } from "@/types";
import type { KetaqueueItem } from "@/types";

interface LogWatchedModalProps {
  item: KetaqueueItem;
  roomCode: string;
  username: string;
  onClose: () => void;
  onLogged: () => void;
}

export default function LogWatchedModal({
  item,
  roomCode,
  username,
  onClose,
  onLogged,
}: LogWatchedModalProps) {
  const movie = item.movie;
  const [members, setMembers] = useState<string[]>([username]);
  const [pickedBy, setPickedBy] = useState(item.added_by);
  const [ratings, setRatings] = useState<Record<string, number>>({
    [username]: 0,
  });
  const [notes, setNotes] = useState("");
  const [vibeTags, setVibeTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCrewMembers(roomCode).then((m) => {
      const resolvedMembers = m.length ? m : [username];
      setMembers(resolvedMembers);
      const initial: Record<string, number> = {};
      resolvedMembers.forEach((u) => (initial[u] = 0));
      setRatings(initial);
    });
  }, [roomCode, username]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    import("animejs").then(({ animate }) => {
      animate(panel, {
        translateY: ["100%", "0%"],
        duration: 400,
        easing: "easeOutExpo",
      });
    });
  }, []);

  function toggleVibe(tag: string) {
    setVibeTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const ratingsList = Object.entries(ratings)
        .filter(([, score]) => score > 0)
        .map(([u, score]) => ({ username: u, score }));

      await logWatched({
        roomCode,
        movieId: item.movie_id,
        pickedBy,
        ratings: ratingsList,
        notes: notes.trim() || undefined,
        vibeTags,
        ketaqueueId: item.id,
      });

      onLogged();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        className="surface-card mt-auto flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] rounded-b-none"
      >
        <div className="flex items-center justify-between border-b border-white/8 p-4 sm:p-5">
          <div>
            <p className="meta">Ketalog Entry</p>
            <h2 className="mt-2 text-xl font-semibold">Log as watched</h2>
          </div>
          <button onClick={onClose} className="btn-ghost px-4 py-3 text-sm">
            Cancel
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-5">
          <div className="surface-soft flex gap-4 p-4">
            {movie?.poster_path && (
              <Image
                src={tmdbImage(movie.poster_path, "w92")!}
                alt={movie.title}
                width={56}
                height={84}
                className="rounded-xl object-cover"
              />
            )}
            <div>
              <p className="meta">{movie?.release_year}</p>
              <p className="mt-2 text-lg font-semibold">{movie?.title}</p>
              <p className="mt-2 text-sm text-white/50">
                Turn the Ketaqueue item into a ketalog entry.
              </p>
            </div>
          </div>

          <div>
            <label className="meta mb-2 block">Who picked it?</label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m}
                  onClick={() => setPickedBy(m)}
                  className={`vibe-tag ${pickedBy === m ? "active" : ""}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="meta mb-3 block">Ratings</label>
            <div className="flex flex-col gap-3">
              {members.map((member) => (
                <div
                  key={member}
                  className="surface-soft flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm">{member}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setRatings((prev) => ({
                            ...prev,
                            [member]: prev[member] === star ? 0 : star,
                          }))
                        }
                        className="text-xl transition-transform hover:scale-110"
                        style={{
                          color:
                            star <= (ratings[member] ?? 0)
                              ? "#ff9f1c"
                              : "rgba(255,255,255,0.2)",
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="meta mb-2 block">Vibe Tags</label>
            <div className="flex flex-wrap gap-2">
              {VIBE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleVibe(tag)}
                  className={`vibe-tag ${vibeTags.includes(tag) ? "active" : ""}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="meta mb-2 block">Notes (optional)</label>
            <textarea
              className="keta-input resize-none"
              rows={2}
              placeholder="Any thoughts on the movie..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "Logging..." : "Save Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

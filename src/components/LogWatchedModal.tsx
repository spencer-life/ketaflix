"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { logWatched, getRoomMembers } from "@/lib/db";
import { tmdbImage } from "@/lib/tmdb";
import { VIBE_TAGS } from "@/types";
import type { WatchlistItem } from "@/types";

interface LogWatchedModalProps {
  item: WatchlistItem;
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
  const [ratings, setRatings] = useState<Record<string, number>>({ [username]: 0 });
  const [notes, setNotes] = useState("");
  const [vibeTags, setVibeTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRoomMembers(roomCode).then((m) => {
      setMembers(m.length ? m : [username]);
      const initial: Record<string, number> = {};
      m.forEach((u) => (initial[u] = 0));
      setRatings(initial);
    });

    import("animejs").then((mod) => {
      const anime = mod.default ?? mod;
      if (panelRef.current) {
        anime({
          targets: panelRef.current,
          translateY: ["100%", "0%"],
          duration: 380,
          easing: "easeOutExpo",
        });
      }
    });
  }, [roomCode, username]);

  function toggleVibe(tag: string) {
    setVibeTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
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
        watchlistId: item.id,
      });

      // Confetti!
      import("canvas-confetti").then((m) => {
        const confetti = m.default;
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c084fc", "#ffffff"],
        });
      });

      onLogged();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(10,10,15,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        ref={panelRef}
        className="flex flex-col max-h-[92dvh] mt-auto rounded-t-2xl overflow-hidden"
        style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.08)",
          transform: "translateY(100%)",
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <h2 className="font-semibold">Log as Watched</h2>
          <button
            onClick={onClose}
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Cancel
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          {/* Movie header */}
          <div className="flex gap-3 items-center">
            {movie?.poster_path && (
              <Image
                src={tmdbImage(movie.poster_path, "w92")!}
                alt={movie.title}
                width={48}
                height={72}
                className="rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-semibold">{movie?.title}</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {movie?.release_year}
              </p>
            </div>
          </div>

          {/* Who picked it */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
              Who picked it?
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m}
                  onClick={() => setPickedBy(m)}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all"
                  style={{
                    background: pickedBy === m ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)",
                    color: pickedBy === m ? "#a78bfa" : "rgba(255,255,255,0.6)",
                    border: `1px solid ${pickedBy === m ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
              Ratings
            </label>
            <div className="flex flex-col gap-3">
              {members.map((member) => (
                <div key={member} className="flex items-center justify-between">
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
                          color: star <= (ratings[member] ?? 0) ? "#f59e0b" : "rgba(255,255,255,0.2)",
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

          {/* Vibe tags */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
              Vibe Tags
            </label>
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

          {/* Notes */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "rgba(255,255,255,0.5)" }}>
              Notes (optional)
            </label>
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
            className="btn-primary"
          >
            {submitting ? "Logging..." : "🎉 Log it!"}
          </button>
        </div>
      </div>
    </div>
  );
}

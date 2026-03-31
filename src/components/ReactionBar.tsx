"use client";

import { useRef, useState } from "react";
import { REACTION_EMOJIS } from "@/types";
import type { ReactionSummary, ReactionEmoji } from "@/types";

interface ReactionBarProps {
  reactions: ReactionSummary[];
  onReact: (emoji: ReactionEmoji) => void;
}

const ALL_EMOJIS = Object.keys(REACTION_EMOJIS) as ReactionEmoji[];

export default function ReactionBar({ reactions, onReact }: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  function handleReact(emoji: ReactionEmoji) {
    onReact(emoji);
    setShowPicker(false);

    // Pop animation on the pill
    import("animejs").then(({ animate }) => {
      const pill = barRef.current?.querySelector(`[data-emoji="${emoji}"]`);
      if (pill) {
        animate(pill, {
          scale: [1.3, 1],
          duration: 300,
          easing: "easeOutExpo",
        });
      }
    });
  }

  const activeReactions = reactions.filter((r) => r.count > 0);

  return (
    <div ref={barRef} className="relative flex flex-wrap items-center gap-1.5">
      {activeReactions.map((r) => (
        <button
          key={r.emoji}
          data-emoji={r.emoji}
          onClick={(e) => {
            e.stopPropagation();
            handleReact(r.emoji);
          }}
          title={r.usernames.join(", ")}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
            r.hasReacted
              ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
              : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <span>{REACTION_EMOJIS[r.emoji]}</span>
          <span className="font-mono">{r.count}</span>
        </button>
      ))}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowPicker((prev) => !prev);
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/60"
      >
        +
      </button>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-0 z-50 mb-1 flex gap-1 rounded-xl border border-white/10 bg-[var(--surface-card)] p-1.5 shadow-xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {ALL_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="rounded-lg p-1.5 text-base transition-transform hover:scale-125 hover:bg-white/10"
              title={emoji}
            >
              {REACTION_EMOJIS[emoji]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

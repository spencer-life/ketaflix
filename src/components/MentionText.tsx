"use client";

interface MentionTextProps {
  text: string;
  className?: string;
}

export default function MentionText({ text, className }: MentionTextProps) {
  const parts = text.split(/(@\w+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        /^@\w+$/.test(part) ? (
          <span
            key={i}
            className="font-medium text-[var(--accent)]"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

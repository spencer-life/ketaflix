"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  members: string[];
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function MentionTextarea({
  value,
  onChange,
  members,
  placeholder,
  rows = 2,
  className,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredMembers = members.filter((m) =>
    m.toLowerCase().startsWith(mentionQuery.toLowerCase()),
  );

  const checkForMention = useCallback(
    (text: string, cursorPos: number) => {
      const textBeforeCursor = text.slice(0, cursorPos);
      const atIndex = textBeforeCursor.lastIndexOf("@");

      if (atIndex === -1) {
        setShowDropdown(false);
        return;
      }

      // @ must be at start or preceded by whitespace
      if (atIndex > 0 && !/\s/.test(textBeforeCursor[atIndex - 1])) {
        setShowDropdown(false);
        return;
      }

      const query = textBeforeCursor.slice(atIndex + 1);
      // No spaces in the partial mention
      if (/\s/.test(query)) {
        setShowDropdown(false);
        return;
      }

      setMentionStart(atIndex);
      setMentionQuery(query);
      setSelectedIndex(0);
      setShowDropdown(true);
    },
    [],
  );

  function insertMention(username: string) {
    const before = value.slice(0, mentionStart);
    const after = value.slice(
      mentionStart + 1 + mentionQuery.length,
    );
    const newValue = `${before}@${username} ${after}`;
    onChange(newValue);
    setShowDropdown(false);

    // Restore focus after React re-render
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = mentionStart + username.length + 2; // @username + space
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
      }
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;
    onChange(newValue);
    checkForMention(newValue, e.target.selectionStart ?? newValue.length);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!showDropdown || filteredMembers.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredMembers.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredMembers.length - 1,
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(filteredMembers[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  function handleClick() {
    const textarea = textareaRef.current;
    if (textarea) {
      checkForMention(value, textarea.selectionStart ?? value.length);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className={className ?? "keta-input resize-none"}
        rows={rows}
        placeholder={placeholder ?? "Type @ to mention crew members..."}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
      />

      {showDropdown && filteredMembers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 z-50 mb-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[var(--surface-card)] shadow-xl backdrop-blur-xl"
        >
          {filteredMembers.map((member, i) => (
            <button
              key={member}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(member);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                i === selectedIndex
                  ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "text-white/80 hover:bg-white/5"
              }`}
            >
              <span className="font-medium">@{member}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

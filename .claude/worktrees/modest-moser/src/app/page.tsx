"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateRoom } from "@/lib/db";
import { joinRoom } from "@/lib/db";
import { setSession, getSession } from "@/lib/supabase";
import { generateRoomCode } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"join" | "create">("join");
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.push(`/room/${session.roomCode}`);
    }
  }, [router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string;
    }[] = [];

    const colors = ["#8b5cf6", "#a78bfa", "#7c3aed", "#c084fc", "#6d28d9"];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((q) => {
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      particles.forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize); };
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    import("animejs").then((animeModule) => {
      const anime = animeModule.default ?? animeModule;
      if (titleRef.current) {
        const text = titleRef.current.innerText;
        titleRef.current.innerHTML = text.split("").map((c) =>
          `<span class="char" style="display:inline-block;opacity:0">${c === " " ? "&nbsp;" : c}</span>`
        ).join("");
        anime({ targets: titleRef.current.querySelectorAll(".char"), opacity: [0, 1], translateY: [30, 0], delay: anime.stagger(60), duration: 800, easing: "easeOutExpo" });
      }
      if (cardRef.current) {
        anime({ targets: cardRef.current, opacity: [0, 1], translateY: [40, 0], duration: 900, delay: 400, easing: "easeOutExpo" });
      }
      cleanup = () => {};
    });
    return () => cleanup?.();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const u = username.trim();
    if (!u || u.length < 2) { setError("Username must be at least 2 characters"); return; }
    const code = mode === "create" ? generateRoomCode() : roomCode.trim().toUpperCase();
    if (!code || code.length < 4) { setError("Enter a valid room code"); return; }
    setLoading(true);
    try {
      await getOrCreateRoom(code, u);
      await joinRoom(u, code);
      setSession({ username: u, roomCode: code });
      router.push(`/room/${code}`);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <canvas ref={canvasRef} id="particles" />
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.04] z-0" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <path d="M200,600 C200,600 180,520 190,480 C200,440 220,420 240,400 C250,380 245,360 250,340 C255,320 270,310 275,290 C280,270 270,250 280,240 C290,230 310,235 320,220 C330,205 325,185 335,175 C345,165 365,170 370,155 C375,140 360,120 370,110 C380,100 400,105 410,95 C420,85 415,65 425,60 C430,80 425,95 435,105 C445,115 460,110 465,125 C470,140 455,155 460,170 C465,185 480,185 485,200 C490,215 480,230 485,245 C490,260 510,265 510,280 C510,295 495,305 500,320 C505,335 525,335 525,350 C525,370 505,380 510,400 C515,420 535,425 535,445 C535,465 515,475 520,495 C525,515 545,520 540,540 C535,560 510,560 505,580 C500,600 515,615 510,635" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M800,650 C800,650 785,570 792,530 C800,490 818,470 835,450 C845,430 838,410 843,390 C848,370 862,358 866,338 C870,318 861,298 870,287 C879,276 900,280 910,265 C920,250 914,230 923,220 C932,210 952,214 957,199 C962,184 947,164 956,154 C966,144 986,148 994,138 C1002,128 997,108 1007,103 C1012,123 1006,138 1016,148 C1026,158 1042,152 1047,167 C1052,182 1036,197 1041,212 C1046,227 1062,227 1067,242 C1072,257 1062,272 1067,287 C1072,302 1093,307 1093,322 C1093,337 1077,348 1082,363 C1087,378 1107,377 1107,393 C1107,413 1086,422 1091,443 C1096,463 1117,468 1117,488 C1117,508 1096,519 1101,539 C1106,559 1127,563 1121,583 C1115,603 1090,603 1085,624 C1080,644 1094,658 1089,679" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>

      <div ref={cardRef} className="relative z-10 w-full max-w-sm" style={{ opacity: 0 }}>
        <div className="text-center mb-8">
          <h1 ref={titleRef} className="text-5xl font-bold gradient-text tracking-tight mb-2">Ketaflix</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Watch movies. Log the vibes.</p>
        </div>

        <div className="glass p-6">
          <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
            {(["join", "create"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
                style={{ background: mode === m ? "rgba(139,92,246,0.3)" : "transparent", color: mode === m ? "#a78bfa" : "rgba(255,255,255,0.4)" }}>
                {m === "join" ? "Join Room" : "Create Room"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>Your Name</label>
              <input className="keta-input" placeholder="e.g. Spencer" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} autoComplete="off" />
            </div>
            {mode === "join" ? (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "rgba(255,255,255,0.5)" }}>Room Code</label>
                <input className="keta-input font-mono tracking-widest uppercase" placeholder="ABCD1" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} maxLength={6} autoComplete="off" />
              </div>
            ) : (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>A unique room code will be generated for you to share with friends.</p>
            )}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? "Loading..." : mode === "join" ? "Join Room →" : "Create Room →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>No account needed. Just a name.</p>
      </div>
    </div>
  );
}

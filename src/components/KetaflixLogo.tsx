import { type SVGProps } from "react";

/** Concept-3 horse head paths (512x512 viewBox, facing left with flowing mane) */
const MANE_BASE =
  "M 338 56 C 360 38, 396 38, 424 62 C 450 86, 464 124, 464 170 C 464 216, 448 262, 428 304 C 410 340, 400 374, 404 404 C 406 420, 412 432, 420 440 C 410 446, 396 442, 384 428 C 372 414, 366 394, 366 370 C 366 346, 372 320, 384 294 C 396 266, 410 236, 416 204 C 422 172, 420 142, 410 116 C 400 92, 382 74, 360 66 C 346 60, 340 58, 338 56 Z";
const MANE_WAVE_1 =
  "M 350 52 C 368 42, 392 46, 412 66 C 430 86, 440 116, 442 152 C 444 188, 434 226, 418 262 C 404 294, 396 324, 396 352 C 396 376, 402 396, 412 412 C 404 408, 396 396, 392 378 C 388 360, 390 338, 398 314 C 408 288, 420 258, 428 226 C 434 194, 436 162, 430 134 C 424 108, 412 86, 396 72 C 380 58, 366 52, 356 52 L 350 52 Z";
const MANE_WAVE_2 =
  "M 408 58 C 426 54, 444 68, 456 96 C 466 124, 468 160, 462 200 C 456 240, 440 278, 424 312 C 410 344, 404 372, 406 398 C 408 416, 414 430, 422 438 C 416 434, 410 422, 406 406 C 402 388, 404 366, 412 340 C 422 312, 436 280, 446 246 C 454 212, 458 178, 454 146 C 450 116, 440 90, 426 74 C 416 60, 410 58, 408 58 Z";
const HEAD_NECK =
  "M 300 46 C 292 38, 278 32, 266 38 C 254 44, 244 56, 236 72 C 228 88, 218 104, 206 118 C 194 132, 178 142, 160 152 C 140 162, 120 176, 104 194 C 88 212, 76 234, 68 258 C 60 282, 58 306, 64 324 C 70 338, 80 348, 94 352 C 106 356, 116 350, 124 340 C 134 326, 148 314, 164 306 C 180 298, 198 294, 216 296 C 232 298, 244 306, 254 318 C 264 332, 272 350, 280 370 C 288 388, 298 404, 312 416 C 328 428, 346 434, 366 434 C 384 434, 398 428, 408 418 C 416 408, 420 394, 418 380 C 416 366, 408 352, 396 342 C 384 332, 370 324, 358 318 C 348 314, 340 308, 336 300 C 332 290, 330 278, 332 266 C 334 252, 340 238, 350 222 C 360 204, 368 184, 372 164 C 376 142, 374 120, 368 102 C 362 86, 352 72, 340 62 C 330 52, 316 46, 306 44 L 300 46 Z";
const EAR =
  "M 300 46 C 296 32, 290 14, 282 4 C 278 -2, 274 2, 272 10 C 270 22, 272 34, 278 42 C 284 46, 292 46, 300 46 Z";

function HorseHead() {
  return (
    <>
      <path d={MANE_BASE} fill="#239b6e" />
      <path d={MANE_WAVE_1} fill="#2ab383" />
      <path d={MANE_WAVE_2} fill="#2ab383" />
      <path d={HEAD_NECK} fill="#34d399" />
      <path d={EAR} fill="#34d399" />
      <circle cx={192} cy={192} r={13} fill="#1a7a56" />
      <circle cx={192} cy={192} r={7} fill="#0d4f38" />
      <circle cx={189} cy={189} r={3} fill="#5ceaad" />
      <ellipse
        cx={76}
        cy={318}
        rx={8}
        ry={5.5}
        fill="#2ab383"
        transform="rotate(-20, 76, 318)"
      />
    </>
  );
}

interface KetaflixLogoProps extends SVGProps<SVGSVGElement> {
  /** Width in pixels — height auto-scales */
  size?: number;
  /** Show only the horse icon (no text) */
  iconOnly?: boolean;
}

export default function KetaflixLogo({
  size = 160,
  iconOnly = false,
  className,
  ...props
}: KetaflixLogoProps) {
  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <HorseHead />
      </svg>
    );
  }

  const aspectRatio = 4;
  const height = size / aspectRatio;

  return (
    <svg
      viewBox="0 0 400 100"
      width={size}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ketaflix"
      {...props}
    >
      <defs>
        <linearGradient
          id="kf-text-g"
          x1="110"
          y1="30"
          x2="390"
          y2="74"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.88)" />
        </linearGradient>
      </defs>

      {/* Horse icon — scaled to fit left portion */}
      <g transform="translate(-6, -2) scale(0.21)">
        <HorseHead />
      </g>

      {/* Wordmark */}
      <text
        x="112"
        y="67"
        fill="url(#kf-text-g)"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontWeight="700"
        fontSize="52"
        letterSpacing="-1.5"
      >
        Keta
        <tspan fill="#34d399">flix</tspan>
      </text>
    </svg>
  );
}

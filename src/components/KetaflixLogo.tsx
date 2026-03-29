import { type SVGProps } from "react";

/** UXWing horse head — facing right, mane/mouth/eye detail, 122.88x109.03 viewBox (CC0) */
const HORSE_PATH =
  "M21.2,72.04c4.63,1.68,11.49-2.09,22-14.74c3.98,1.47,7.1,4.73,8.46,11.72c2.58,13.31-1.52,21.83-7.22,33.54c-1.06,2.17-2.12,4.32-3.15,6.48h81.29l-0.25-0.2c5.55-39.24-31.98-58.51-4.56-46.4c-11.78-28.52-48.09-37.8-22.47-34.84C82.12,15.55,65.5,8.89,41.87,13.1C36.85,5.77,24.84-9.86,28.52,8.86L22.5,3.49l-0.33,18.89C15.01,27.84,11.1,46.03,5.56,57.86c-4.74,4.7-6.56,10.32-5.05,19.06C7.89,86.43,19.54,84.07,21.2,72.04z";

const HORSE_VB = "0 0 122.88 109.03";
const HORSE_RATIO = 122.88 / 109.03; // width / height ≈ 1.127

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
    const iconH = size / HORSE_RATIO;
    return (
      <svg
        viewBox={HORSE_VB}
        width={size}
        height={iconH}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <g transform="translate(122.88, 0) scale(-1, 1)">
          <path d={HORSE_PATH} fill="#34d399" />
        </g>
      </svg>
    );
  }

  const aspectRatio = 3.8;
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
      <svg viewBox={HORSE_VB} x="0" y="5" width="100" height="90">
        <g transform="translate(122.88, 0) scale(-1, 1)">
          <path d={HORSE_PATH} fill="#34d399" />
        </g>
      </svg>

      {/* Wordmark */}
      <text
        x="108"
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

import { type SVGProps } from "react";

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
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <defs>
          <linearGradient
            id="kf-icon-g"
            x1="16"
            y1="2"
            x2="48"
            y2="58"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="55%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <HorsePath gradientId="kf-icon-g" />
      </svg>
    );
  }

  const aspectRatio = 3.6;
  const height = size / aspectRatio;

  return (
    <svg
      viewBox="0 0 380 100"
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
          id="kf-logo-g"
          x1="8"
          y1="2"
          x2="64"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="55%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient
          id="kf-text-g"
          x1="100"
          y1="30"
          x2="370"
          y2="74"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.88)" />
        </linearGradient>
      </defs>

      {/* Horse icon — scaled into left portion */}
      <g transform="translate(0, 3) scale(1.45)">
        <HorsePath gradientId="kf-logo-g" />
      </g>

      {/* Wordmark */}
      <text
        x="104"
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

/**
 * Horse head silhouette — chess knight style, facing left.
 * 64x64 viewBox. Uses STRAIGHT LINES for the face profile (ear, forehead,
 * nose, muzzle, jaw) for instant recognition, and CURVES for the neck.
 */
function HorsePath({ gradientId }: { gradientId: string }) {
  return (
    <>
      <path
        d="M52 60 C58 45 56 25 50 12 L46 4 L40 14 L34 6 L30 18 C20 15 15 22 12 30 C8 35 8 43 14 47 C24 51 34 46 38 36 C42 48 40 55 36 60 Z"
        fill={`url(#${gradientId})`}
      />

      {/* Eye */}
      <circle cx="24" cy="22" r="2.2" fill="#050608" />
      <circle cx="23.3" cy="21.3" r="0.65" fill="rgba(255,255,255,0.5)" />

      {/* Nostril */}
      <ellipse cx="12" cy="35" rx="1.2" ry="1.5" fill="#050608" opacity="0.3" />
    </>
  );
}

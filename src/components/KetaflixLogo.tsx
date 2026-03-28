import { type SVGProps } from "react";

/**
 * Font Awesome horse-head path (CC BY 4.0).
 * viewBox 0 0 640 512. Facing right.
 * @see https://fontawesome.com/icons/horse-head
 */
const HORSE_PATH =
  "M64 464l0-147.1c0-108.4 68.3-205.1 170.5-241.3L404.2 15.5C425.6 7.9 448 23.8 448 46.4c0 11-5.5 21.2-14.6 27.3L400 96c48.1 0 91.2 29.8 108.1 74.9l48.6 129.5c11.8 31.4 4.1 66.8-19.6 90.5c-16 16-37.8 25.1-60.5 25.1l-3.4 0c-26.1 0-50.9-11.6-67.6-31.7l-32.3-38.7c-11.7 4.1-24.2 6.4-37.3 6.4c0 0 0 0-.1 0c0 0 0 0 0 0c-6.3 0-12.5-.5-18.6-1.5c-3.6-.6-7.2-1.4-10.7-2.3c0 0 0 0 0 0c-28.9-7.8-53.1-26.8-67.8-52.2c-4.4-7.6-14.2-10.3-21.9-5.8s-10.3 14.2-5.8 21.9c24 41.5 68.3 70 119.3 71.9l47.2 70.8c4 6.1 6.2 13.2 6.2 20.4c0 20.3-16.5 36.8-36.8 36.8L112 512c-26.5 0-48-21.5-48-48zM392 224a24 24 0 1 0 0-48 24 24 0 1 0 0 48z";

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
    const iconH = size * (512 / 640);
    return (
      <svg
        viewBox="0 0 640 512"
        width={size}
        height={iconH}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <defs>
          <linearGradient
            id="kf-icon-g"
            x1="64"
            y1="0"
            x2="560"
            y2="512"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="55%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <path d={HORSE_PATH} fill="url(#kf-icon-g)" />
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
          x1="0"
          y1="0"
          x2="90"
          y2="100"
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

      {/* Horse icon — scaled to fit left portion */}
      <g transform="translate(-2, 5) scale(0.14)">
        <path d={HORSE_PATH} fill="url(#kf-logo-g)" />
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

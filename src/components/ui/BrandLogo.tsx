import React from "react";

export interface BrandLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
  iconClassName?: string;
}

/**
 * Official Veyra Brand Logo & Icon Mark.
 * Faithfully matches the exact signature folded-ribbon V silhouette
 * and dual-spectrum periwinkle-to-violet linear gradients with origami facet.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 32,
  showWordmark = true,
  className = "",
  wordmarkClassName = "",
  iconClassName = "",
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* V Icon Mark */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${iconClassName}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Veyra V Logo"
      >
        <defs>
          {/* Left Wing Gradient: Luminous Periwinkle to Royal Indigo */}
          <linearGradient id="brandVeyraLeftGrad" x1="15%" y1="0%" x2="65%" y2="100%">
            <stop offset="0%" stopColor="#9EB4FD" />
            <stop offset="45%" stopColor="#8296F8" />
            <stop offset="100%" stopColor="#6072DE" />
          </linearGradient>

          {/* Right Wing Gradient: Radiant Lavender to Twilight Purple */}
          <linearGradient id="brandVeyraRightGrad" x1="80%" y1="0%" x2="20%" y2="100%">
            <stop offset="0%" stopColor="#B2ABFB" />
            <stop offset="45%" stopColor="#9488EE" />
            <stop offset="100%" stopColor="#6F5FD4" />
          </linearGradient>

          {/* Fold Crease Gradient for origami 3D depth at the apex */}
          <linearGradient id="brandVeyraFoldGrad" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#4B539A" />
            <stop offset="100%" stopColor="#2D3367" />
          </linearGradient>
        </defs>

        {/* Main Left Sweeping Arm with rounded top and curved outer contour */}
        <path
          d="M 16 22
             C 13 25 12 30 14 36
             C 18 48 27 68 37 83
             C 41 89 45 92 49 91
             C 53 90 56 86 55.5 80
             C 55 74 51.5 67 47 61
             C 40 51 31 35 26 23
             C 24 19 19 19 16 22 Z"
          fill="url(#brandVeyraLeftGrad)"
        />

        {/* Origami Fold Facet at the apex */}
        <path
          d="M 39 84
             C 43 90 46.5 92.5 49.5 91
             C 52.5 89.5 56 85 55.5 80
             C 55 74 51.5 67 47 61
             C 44 67 41 76 39 84 Z"
          fill="url(#brandVeyraFoldGrad)"
        />

        {/* Detached Floating Right Pill / Capsule */}
        <rect
          x="57"
          y="17"
          width="17.5"
          height="45"
          rx="8.75"
          transform="rotate(20 65.75 39.5)"
          fill="url(#brandVeyraRightGrad)"
        />
      </svg>

      {/* Styled Wordmark "VEYRA." */}
      {showWordmark && (
        <span
          className={`font-sans font-black tracking-[-0.035em] text-white flex items-baseline leading-none ${
            size >= 40 ? "text-2xl" : size >= 32 ? "text-xl" : "text-base"
          } ${wordmarkClassName}`}
        >
          <span>VEYRA</span>
          <span 
            className="inline-block rounded-full bg-[#8194F8] shrink-0 shadow-[0_0_8px_rgba(129,148,248,0.6)]"
            style={{
              width: size >= 40 ? "6.5px" : size >= 32 ? "5px" : "4px",
              height: size >= 40 ? "6.5px" : size >= 32 ? "5px" : "4px",
              marginLeft: size >= 40 ? "4px" : "3px",
              marginBottom: size >= 40 ? "2px" : "1.5px",
            }}
            aria-hidden="true"
          />
        </span>
      )}
    </div>
  );
};

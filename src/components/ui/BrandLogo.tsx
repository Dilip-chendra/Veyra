import React from "react";

export interface BrandLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
  iconClassName?: string;
}

/**
 * Authentic Veyra Brand Logo & Icon Mark.
 * Faithfully matches the exact stylized aerodynamic dual-wing V silhouette
 * and dual-spectrum periwinkle-to-violet linear gradients.
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
          {/* Left Wing Gradient: Luminous Periwinkle to Indigo */}
          <linearGradient id="brandVeyraLeftGrad" x1="10%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="#9DB7FD" />
            <stop offset="25%" stopColor="#8EA4FA" />
            <stop offset="55%" stopColor="#7C8CEA" />
            <stop offset="80%" stopColor="#6974CB" />
            <stop offset="100%" stopColor="#555EA8" />
          </linearGradient>

          {/* Right Wing Gradient: Radiant Lavender to Twilight Indigo */}
          <linearGradient id="brandVeyraRightGrad" x1="85%" y1="0%" x2="35%" y2="100%">
            <stop offset="0%" stopColor="#BEB9FA" />
            <stop offset="28%" stopColor="#A39DEE" />
            <stop offset="60%" stopColor="#8378D8" />
            <stop offset="85%" stopColor="#5D52AE" />
            <stop offset="100%" stopColor="#3C317A" />
          </linearGradient>

          {/* Fold Crease Gradient for authentic 3D depth at the bottom curve */}
          <linearGradient id="brandVeyraFoldGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#3E4485" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#363A75" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#2D3064" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Left Main Wing: Sweeping V stroke with natural flare and rounded base */}
        <path
          d="M 5 6.5
             C 2 7 1 9.5 2 13
             C 4 20 9.5 35 16 51
             C 21.5 64 27 77.5 33.5 88
             C 36.5 93 40.5 96.5 44.5 96.5
             C 48 96.5 51.5 93 54.5 88
             C 57.5 83 61.5 78 64.5 75.5
             C 66.5 73.5 66 70.5 64 69.5
             C 61.5 68 57.5 68 54 65
             C 49 61 44 49 38 35
             C 31.5 21 24.5 11 19.5 8
             C 15.5 5.5 9.5 6 5 6.5 Z"
          fill="url(#brandVeyraLeftGrad)"
        />

        {/* Authentic Dimensional Crease / Under-fold */}
        <path
          d="M 43.5 96.5
             C 47.5 96.5 51 93 54 88
             C 57 83 61 78 64 75.5
             C 65.5 74 65.5 71.5 64 70
             C 61.5 68.5 57 68.5 53.5 65
             C 48.5 60.5 44 56 40.5 62
             C 38 67 40 85 43.5 96.5 Z"
          fill="url(#brandVeyraFoldGrad)"
        />

        {/* Right Floating Wing / Petal */}
        <path
          d="M 82 3
             C 87 3.5 92 6 93 10
             C 93.5 14 90.5 25 85 38
             C 79.5 49 73.5 58.5 67 61
             C 62 62.5 58 59.5 57.5 54.5
             C 57 49 60.5 37.5 66.5 25
             C 71.5 14 77 5 82 3 Z"
          fill="url(#brandVeyraRightGrad)"
        />
      </svg>

      {/* Wordmark "VEYRA" */}
      {showWordmark && (
        <span
          className={`font-mono font-bold tracking-tight text-white ${
            size >= 40 ? "text-2xl" : size >= 32 ? "text-lg" : "text-base"
          } ${wordmarkClassName}`}
        >
          VEYRA<span className="text-indigo-400">.</span>
        </span>
      )}
    </div>
  );
};

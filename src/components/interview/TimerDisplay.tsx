"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerDisplayProps {
  initialMinutes: number;
  onTimeExpired?: () => void;
  className?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  initialMinutes,
  onTimeExpired,
  className = "",
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeExpired) onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialMinutes, onTimeExpired]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isLow = secondsRemaining < 300; // less than 5 minutes

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold border ${
        isLow
          ? "bg-rose-950/60 border-rose-800 text-rose-300 animate-pulse"
          : "bg-slate-900 border-slate-800 text-slate-200"
      } ${className}`}
    >
      <Clock className={`w-3.5 h-3.5 ${isLow ? "text-rose-400" : "text-indigo-400"}`} />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};

import React from "react";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  showText?: boolean;
}

const AssignifyLogo = ({ size = "md", variant = "dark", showText = true }: Props) => {
  const iconSize = size === "sm" ? 28 : size === "md" ? 36 : size === "lg" ? 48 : 64;
  const textClass =
    size === "sm" ? "text-base" :
    size === "md" ? "text-xl" :
    size === "lg" ? "text-2xl" : "text-4xl";

  const primary = "#0a846b";
  const accent = "#1abb9b";
  const bg = variant === "light" ? "rgba(255,255,255,0.15)" : "#e6f5f0";
  const textColor = variant === "light" ? "text-white" : "text-foreground";

  return (
    <div className="flex items-center gap-2.5">
      <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="11" fill={bg} />
        <polygon points="24,9 10,17 24,23 38,17" fill={primary} opacity="0.95" />
        <polygon points="24,9 10,17 24,20 38,17" fill={accent} opacity="0.45" />
        <ellipse cx="24" cy="23" rx="9" ry="3" fill={primary} />
        <rect x="15" y="21" width="18" height="5" fill={primary} />
        <ellipse cx="24" cy="26" rx="9" ry="3" fill="#076b56" />
        <line x1="36" y1="17" x2="39" y2="27" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="39" cy="28.5" r="1.8" fill={accent} />
        <circle cx="24" cy="37" r="7" fill="none" stroke={accent} strokeWidth="1.8" />
        <polyline points="20,37 23,40 29,33" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showText && (
        <span className={`font-display italic ${textClass} ${textColor} tracking-tight`} style={{ fontFamily: "'Instrument Serif', serif" }}>
          Assignify
        </span>
      )}
    </div>
  );
};

export default AssignifyLogo;
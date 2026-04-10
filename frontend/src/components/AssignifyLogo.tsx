import React from "react";

interface Props {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showText?: boolean;
}

const AssignifyLogo = ({ size = "md", variant = "dark", showText = true }: Props) => {
  const iconSize = size === "sm" ? 32 : size === "md" ? 40 : 52;
  const textClass = size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-3xl";
  const color = variant === "light" ? "#ffffff" : "hsl(168, 85%, 28%)";
  const textColor = variant === "light" ? "text-white" : "text-foreground";

  return (
    <div className="flex items-center gap-2.5">
      <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill={variant === "light" ? "rgba(255,255,255,0.15)" : "#e6f5f0"} />
        <path d="M24 10L8 18L24 26L40 18L24 10Z" fill={color} opacity="0.9"/>
        <path d="M14 22V32C14 32 18 37 24 37C30 37 34 32 34 32V22L24 27L14 22Z" fill={color}/>
        <path d="M38 18V28" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="38" cy="29.5" r="2" fill={color}/>
        <path d="M19 31.5L22.5 34.5L29 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {showText && (
        <span className={`font-display italic font-normal ${textClass} ${textColor} tracking-tight`}>
          Assignify
        </span>
      )}
    </div>
  );
};

export default AssignifyLogo;

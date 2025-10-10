import React from "react";

export type BadgeTone = "default" | "primary" | "success" | "warning" | "error";

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  default: "border-black text-black",
  primary: "border-primary text-primary",
  success: "border-success text-success",
  warning: "border-warning text-warning",
  error: "border-error text-error",
};

export const Badge: React.FC<BadgeProps> = ({ children, tone = "default", className = "" }) => {
  return (
    <span className={`inline-block border ${toneClasses[tone]} px-1 py-0.5 body text-xs ${className}`}>
      {children}
    </span>
  );
};



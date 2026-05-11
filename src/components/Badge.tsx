import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "neutral";
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-emerald-100 text-emerald-800 border bg-emerald-50 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
    destructive: "bg-red-100 text-red-800 border border-red-200",
    neutral: "bg-blue-50 text-blue-800 border border-blue-200",
  };

  return (
    <div
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)}
      {...props}
    />
  );
}

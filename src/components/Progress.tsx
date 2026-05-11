import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, max = 100, className, indicatorClassName }: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-100", className)}>
      <motion.div
        className={cn("h-full w-full flex-1 bg-emerald-600 transition-all", indicatorClassName)}
        initial={{ x: "-100%" }}
        animate={{ x: `-${100 - percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

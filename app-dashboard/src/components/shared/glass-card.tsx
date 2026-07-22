"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.ComponentProps<typeof motion.div> {
  glow?: "none" | "primary" | "accent" | "success";
  interactive?: boolean;
}

export function GlassCard({
  className,
  glow = "none",
  interactive = true,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      whileHover={interactive ? { y: -2 } : undefined}
      className={cn(
        "glass-panel relative overflow-hidden rounded-xl p-5 transition-shadow",
        glow === "primary" && "glow-primary",
        glow === "accent" && "glow-accent",
        glow === "success" && "glow-success",
        interactive && "hover:border-white/[0.16]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

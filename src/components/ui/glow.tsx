
import React from "react";
import { cn } from "@/lib/utils";

interface GlowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "top" | "bottom";
}

export function Glow({ className, variant = "default", ...props }: GlowProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        {
          "left-0 top-0 h-full w-full": variant === "default",
          "left-0 top-0 h-[150%] w-full": variant === "top",
          "bottom-0 left-0 h-[150%] w-full": variant === "bottom",
        },
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-[100%] z-0 opacity-50 blur-[100px]",
          {
            "bg-primary": variant === "default",
            "bg-gradient-to-b from-primary to-transparent": variant === "top",
            "bg-gradient-to-t from-primary to-transparent": variant === "bottom",
          }
        )}
      />
    </div>
  );
}

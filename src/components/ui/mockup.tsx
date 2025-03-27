
import React from "react";
import { cn } from "@/lib/utils";

interface MockupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "window" | "browser" | "responsive";
  padding?: boolean;
}

export function Mockup({
  className,
  children,
  type = "window",
  padding = true,
  ...props
}: MockupProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card shadow-sm",
        {
          "p-4": padding && type === "window",
          "overflow-hidden": type === "browser" || type === "responsive",
        },
        className
      )}
      {...props}
    >
      {type === "browser" && (
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            example.com
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

interface MockupFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large" | "full";
  shadow?: boolean;
}

export function MockupFrame({
  className,
  children,
  size = "medium",
  shadow = true,
  ...props
}: MockupFrameProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-background p-3",
        {
          "w-full max-w-[400px]": size === "small",
          "w-full max-w-[600px]": size === "medium",
          "w-full max-w-[900px]": size === "large",
          "w-full": size === "full",
          "shadow-xl": shadow,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

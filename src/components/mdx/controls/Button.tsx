"use client";

import { cn } from "@/lib/utils";
import "./controls.css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "md" | "sm";
}

export function Button({
  children,
  className,
  disabled,
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "mdx-control-button",
        size === "sm" ? "mdx-control-button--sm" : "mdx-control-button--md",
        className
      )}
      disabled={disabled}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

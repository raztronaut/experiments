import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/lib/utils";

const pillVariants = cva(
  "inline-flex items-center justify-center rounded-md px-2 py-0.5 font-medium text-xs",
  {
    variants: {
      variant: {
        info: "bg-blue-500/10 text-blue-500",
        success: "bg-emerald-500/10 text-emerald-500",
        warning: "bg-amber-500/10 text-amber-500",
        danger: "bg-red-500/10 text-red-500",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {}

export function Pill({ className, variant, ...props }: PillProps) {
  return (
    <span className={cn(pillVariants({ variant }), className)} {...props} />
  );
}

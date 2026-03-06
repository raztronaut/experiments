import type React from "react";

interface CodeStepProps {
  children: React.ReactNode;
  step: number;
  title: string;
}

export function CodeStep({ step, title, children }: CodeStepProps) {
  return (
    <div className="relative my-8 pl-10">
      <div className="absolute top-0 left-0 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted font-bold text-foreground text-xs">
        {step}
      </div>
      <h3 className="mb-3 font-semibold text-base">{title}</h3>
      <div className="[&>p]:text-muted-foreground [&>p]:text-sm [&>pre]:mt-3">
        {children}
      </div>
    </div>
  );
}

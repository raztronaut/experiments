"use client";

import dynamic from "next/dynamic";

const ThemeAwareWaves = dynamic(
  () =>
    import("./ThemeAwareWaves").then((m) => ({
      default: m.ThemeAwareWaves,
    })),
  {
    ssr: false,
    loading: () => <div className="h-full w-full" />,
  }
);

interface DeferredThemeAwareWavesProps {
  className?: string;
}

export function DeferredThemeAwareWaves({
  className,
}: DeferredThemeAwareWavesProps) {
  return <ThemeAwareWaves className={className} />;
}

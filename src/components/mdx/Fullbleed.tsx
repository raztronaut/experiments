import type React from "react";

export interface FullbleedProps {
  children: React.ReactNode;
}

export function Fullbleed({ children }: FullbleedProps) {
  return (
    <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen">
      {children}
    </div>
  );
}

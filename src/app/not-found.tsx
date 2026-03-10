"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import "@/app/(main)/globals.css";

const NotFound404 = dynamic(
  () => import("@/components/experiments/404-not-found/404NotFound"),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-white" />,
  }
);

export default function NotFound() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99_999,
        overflow: "hidden",
      }}
    >
      <NotFound404 />
      <div className="absolute top-6 left-6 z-[100] flex cursor-pointer items-center justify-center rounded-full p-2 transition-transform hover:scale-110 active:scale-95">
        <Link
          className="rounded-full border border-black/10 bg-black/5 px-4 py-2 font-medium text-black/60 text-sm backdrop-blur-sm transition-colors hover:bg-black/10 hover:text-black/90"
          href="/"
        >
          Return to Experiments
        </Link>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-center overflow-hidden">
        <span className="translate-y-[-5%] font-black text-[45vw] text-black/[0.03] leading-none tracking-tighter">
          404
        </span>
      </div>
    </div>
  );
}

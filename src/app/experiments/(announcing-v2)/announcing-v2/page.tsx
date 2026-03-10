"use client";

import dynamic from "next/dynamic";

const AnnouncingV2 = dynamic(
  () => import("@/components/experiments/announcing-v2/AnnouncingV2"),
  { ssr: false }
);

export default function Page() {
  return <AnnouncingV2 />;
}

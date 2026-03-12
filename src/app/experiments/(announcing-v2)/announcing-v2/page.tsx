import { Suspense } from "react";
import AnnouncingV2 from "@/components/experiments/announcing-v2/AnnouncingV2";

export default function Page() {
  return (
    <Suspense>
      <AnnouncingV2 />
    </Suspense>
  );
}

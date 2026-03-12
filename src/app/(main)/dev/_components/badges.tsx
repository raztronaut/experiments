import { Badge } from "@/components/ui/badge";
import type {
  ExperimentComplexity,
  ExperimentListing,
  ExperimentProfile,
  ExperimentStatus,
} from "@/lib/experiments";
import { cn } from "@/lib/utils";
import {
  COMPLEXITY_COLORS,
  LISTING_COLORS,
  PROFILE_COLORS,
  SURFACE_COLORS,
} from "./types";

export function StatusBadge({ status }: { status: ExperimentStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        status === "shipped"
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-amber-500/15 text-amber-400"
      )}
    >
      {status}
    </Badge>
  );
}

export function ListingBadge({
  listing,
  explicit,
}: {
  listing: ExperimentListing;
  explicit: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", LISTING_COLORS[listing])}
    >
      {listing}
      {!explicit && (
        <span className="ml-1 text-muted-foreground" title="Implicit default">
          *
        </span>
      )}
    </Badge>
  );
}

export function ProfileBadge({ profile }: { profile: ExperimentProfile }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        PROFILE_COLORS[profile] ?? "bg-zinc-500/15 text-zinc-400"
      )}
    >
      {profile}
    </Badge>
  );
}

export function ComplexityBadge({
  complexity,
}: {
  complexity: ExperimentComplexity;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        COMPLEXITY_COLORS[complexity] ?? "bg-zinc-500/15 text-zinc-400"
      )}
    >
      {complexity}
    </Badge>
  );
}

export function SurfacePill({ surface }: { surface: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full text-[10px]",
        SURFACE_COLORS[surface] ?? "bg-zinc-800 text-zinc-400"
      )}
    >
      {surface}
    </Badge>
  );
}

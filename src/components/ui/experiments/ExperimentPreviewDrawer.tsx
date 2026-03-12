"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Experiment } from "@/lib/experiments";

// macOS Traffic Light Icons
const CloseIcon = () => (
  <svg
    className="h-2 w-2"
    fill="none"
    stroke="rgba(0,0,0,0.5)"
    strokeWidth="1.5"
    viewBox="0 0 12 12"
  >
    <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
  </svg>
);

const MinimizeIcon = () => (
  <svg
    className="h-2 w-2"
    fill="none"
    stroke="rgba(0,0,0,0.5)"
    strokeWidth="1.5"
    viewBox="0 0 12 12"
  >
    <path d="M2.5 6h7" strokeLinecap="round" />
  </svg>
);

const ExpandIcon = () => (
  <svg
    className="h-2 w-2"
    fill="none"
    stroke="rgba(0,0,0,0.5)"
    strokeWidth="1.2"
    viewBox="0 0 12 12"
  >
    <path
      d="M2 6.5v3.5h3.5M10 5.5v-3.5h-3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ExperimentPreviewDrawerProps {
  experiment: Experiment | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenFullPage: () => void;
}

/**
 * macOS-style drawer for previewing experiments via iframe.
 */
export function ExperimentPreviewDrawer({
  experiment,
  isOpen,
  onOpenChange,
  onOpenFullPage,
}: ExperimentPreviewDrawerProps) {
  const [isHoveringTrafficLights, setIsHoveringTrafficLights] =
    React.useState(false);

  return (
    <Drawer onOpenChange={onOpenChange} open={isOpen}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="flex flex-row items-center justify-between px-4 py-3">
          {/* Traffic Light Controls */}
          <div
            className="flex items-center gap-2"
            onMouseEnter={() => setIsHoveringTrafficLights(true)}
            onMouseLeave={() => setIsHoveringTrafficLights(false)}
          >
            <DrawerClose asChild>
              <button
                aria-label="Close"
                className="flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F57] transition-colors hover:bg-[#FF5F57]"
              >
                {isHoveringTrafficLights ? <CloseIcon /> : null}
              </button>
            </DrawerClose>

            <DrawerClose asChild>
              <button
                aria-label="Minimize"
                className="flex h-3 w-3 items-center justify-center rounded-full bg-[#FEBC2E] transition-colors hover:bg-[#FEBC2E]"
              >
                {isHoveringTrafficLights ? <MinimizeIcon /> : null}
              </button>
            </DrawerClose>

            <button
              aria-label="Open in new tab"
              className="flex h-3 w-3 items-center justify-center rounded-full bg-[#28C840] transition-colors hover:bg-[#28C840]"
              onClick={onOpenFullPage}
            >
              {isHoveringTrafficLights ? <ExpandIcon /> : null}
            </button>
          </div>

          {/* Title and Open Button */}
          <div className="flex items-center gap-3">
            <DrawerTitle className="font-medium text-sm">
              {experiment?.title}
            </DrawerTitle>
            <Button asChild className="h-7 text-xs" size="sm" variant="outline">
              <Link href={experiment?.href || "#"}>
                <ExternalLink className="mr-1.5 h-3 w-3" />
                Open Full Page
              </Link>
            </Button>
          </div>
        </DrawerHeader>

        {/* Iframe Preview — unmount when closed to release GPU/WebGL resources */}
        <div className="h-full p-4">
          {experiment && isOpen && (
            <iframe
              className="h-full w-full rounded-lg border bg-background"
              src={experiment.href}
              title={experiment.title}
            />
          )}
        </div>

        <DrawerFooter className="pt-2 pb-8">
          <p className="text-center text-muted-foreground text-xs">
            {experiment?.description}
          </p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

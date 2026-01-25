'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Experiment } from '@/lib/experiments';

// macOS Traffic Light Icons
const CloseIcon = () => (
    <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5">
        <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
    </svg>
);

const MinimizeIcon = () => (
    <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5">
        <path d="M2.5 6h7" strokeLinecap="round" />
    </svg>
);

const ExpandIcon = () => (
    <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2">
        <path d="M2 6.5v3.5h3.5M10 5.5v-3.5h-3.5" strokeLinecap="round" strokeLinejoin="round" />
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
    const [isHoveringTrafficLights, setIsHoveringTrafficLights] = React.useState(false);

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
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
                                className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57] transition-colors flex items-center justify-center"
                                aria-label="Close"
                            >
                                {isHoveringTrafficLights ? <CloseIcon /> : null}
                            </button>
                        </DrawerClose>

                        <DrawerClose asChild>
                            <button
                                className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E] transition-colors flex items-center justify-center"
                                aria-label="Minimize"
                            >
                                {isHoveringTrafficLights ? <MinimizeIcon /> : null}
                            </button>
                        </DrawerClose>

                        <button
                            onClick={onOpenFullPage}
                            className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840] transition-colors flex items-center justify-center"
                            aria-label="Open in new tab"
                        >
                            {isHoveringTrafficLights ? <ExpandIcon /> : null}
                        </button>
                    </div>

                    {/* Title and Open Button */}
                    <div className="flex items-center gap-3">
                        <DrawerTitle className="text-sm font-medium">{experiment?.title}</DrawerTitle>
                        <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                            <Link href={experiment?.href || '#'} target="_blank">
                                <ExternalLink className="h-3 w-3 mr-1.5" />
                                Open Full Page
                            </Link>
                        </Button>
                    </div>
                </DrawerHeader>

                {/* Iframe Preview */}
                <div className="p-4 h-full">
                    {experiment && (
                        <iframe
                            src={experiment.href}
                            className="w-full h-full rounded-lg border bg-background"
                            title={experiment.title}
                        />
                    )}
                </div>

                <DrawerFooter className="pt-2 pb-8">
                    <p className="text-xs text-muted-foreground text-center">
                        {experiment?.description}
                    </p>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

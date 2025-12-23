'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

interface ExperimentDrawerListProps {
    experiments: Experiment[];
}

// macOS Traffic Light Icons (shown on hover)
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

export function ExperimentDrawerList({ experiments }: ExperimentDrawerListProps) {
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isHoveringTrafficLights, setIsHoveringTrafficLights] = useState(false);

    const handleExperimentClick = (experiment: Experiment) => {
        setSelectedExperiment(experiment);
        setIsOpen(true);
    };

    const handleOpenFullPage = () => {
        if (selectedExperiment) {
            window.open(selectedExperiment.href, '_blank');
            setIsOpen(false);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 gap-4">
                {experiments.map((experiment) => (
                    <Card
                        key={experiment.href}
                        className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-zinc-200 dark:border-zinc-800"
                        onClick={() => handleExperimentClick(experiment)}
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{experiment.title}</CardTitle>
                                {experiment.created && (
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {new Date(experiment.created).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <CardDescription>{experiment.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}

                {experiments.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                        No experiments found. Run <code className="bg-muted px-1 py-0.5 rounded">npm run new:experiment</code> to create one.
                    </div>
                )}
            </div>

            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent className="h-[85vh]">
                    <DrawerHeader className="flex flex-row items-center justify-between px-4 py-3">
                        {/* macOS Traffic Lights */}
                        <div
                            className="flex items-center gap-2"
                            onMouseEnter={() => setIsHoveringTrafficLights(true)}
                            onMouseLeave={() => setIsHoveringTrafficLights(false)}
                        >
                            {/* Close (Red) */}
                            <DrawerClose asChild>
                                <button
                                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57] transition-colors flex items-center justify-center"
                                    aria-label="Close"
                                >
                                    {isHoveringTrafficLights && <CloseIcon />}
                                </button>
                            </DrawerClose>

                            {/* Minimize (Yellow) - also closes drawer */}
                            <DrawerClose asChild>
                                <button
                                    className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E] transition-colors flex items-center justify-center"
                                    aria-label="Minimize"
                                >
                                    {isHoveringTrafficLights && <MinimizeIcon />}
                                </button>
                            </DrawerClose>

                            {/* Expand (Green) - opens in new tab */}
                            <button
                                onClick={handleOpenFullPage}
                                className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840] transition-colors flex items-center justify-center"
                                aria-label="Open in new tab"
                            >
                                {isHoveringTrafficLights && <ExpandIcon />}
                            </button>
                        </div>

                        {/* Title and Open Full Page button */}
                        <div className="flex items-center gap-3">
                            <DrawerTitle className="text-sm font-medium">{selectedExperiment?.title}</DrawerTitle>
                            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                                <Link href={selectedExperiment?.href || '#'} target="_blank">
                                    <ExternalLink className="h-3 w-3 mr-1.5" />
                                    Open Full Page
                                </Link>
                            </Button>
                        </div>
                    </DrawerHeader>
                    <div className="flex-1 overflow-hidden px-4 pb-4">
                        {selectedExperiment && (
                            <iframe
                                src={selectedExperiment.href}
                                className="w-full h-full rounded-lg border bg-background"
                                title={selectedExperiment.title}
                            />
                        )}
                    </div>
                    <DrawerFooter className="pt-2">
                        <p className="text-xs text-muted-foreground text-center">
                            {selectedExperiment?.description}
                        </p>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}

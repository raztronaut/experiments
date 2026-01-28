'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SWIPE_GESTURE_ICON_DATA } from './constants';

interface MobileSwipeTutorialOverlayProps {
    onVisibilityChange?: (isVisible: boolean) => void;
}

export function MobileSwipeTutorialOverlay({ onVisibilityChange }: MobileSwipeTutorialOverlayProps = {}) {
    const [stage, setStage] = useState<'waiting' | 'visible' | 'exiting' | 'done'>('waiting');

    useEffect(() => {
        onVisibilityChange?.(stage === 'visible' || stage === 'exiting');
    }, [stage, onVisibilityChange]);

    useEffect(() => {
        // Start sequence
        const showTimer = setTimeout(() => {
            setStage('visible');
        }, 1000);

        return () => clearTimeout(showTimer);
    }, []);

    useEffect(() => {
        if (stage === 'visible') {
            const exitTimer = setTimeout(() => {
                setStage('exiting');
            }, 4000); // Stay visible for 4s
            return () => clearTimeout(exitTimer);
        }

        if (stage === 'exiting') {
            const doneTimer = setTimeout(() => {
                setStage('done');
            }, 600); // Allow time for exit animation
            return () => clearTimeout(doneTimer);
        }
    }, [stage]);

    if (stage === 'done') return null;

    const isVisible = stage === 'visible';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-4 right-4 z-20 pointer-events-none md:hidden"
            aria-hidden="true"
        >
            {/* Icon Container */}
            <motion.div
                className="relative bg-background/20 p-2.5 rounded-md shadow-lg border border-border/50 backdrop-blur-md"
            >
                <motion.div
                    animate={{
                        x: [-3, 3, -3],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut"
                    }}
                    className="relative w-5 h-5 bg-black dark:bg-white"
                    style={{
                        maskImage: `url(${SWIPE_GESTURE_ICON_DATA})`,
                        WebkitMaskImage: `url(${SWIPE_GESTURE_ICON_DATA})`,
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center'
                    }}
                />
            </motion.div>
        </motion.div>
    );
}

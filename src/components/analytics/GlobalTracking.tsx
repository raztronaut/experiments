'use client';

import { useEffect } from 'react';
import { useUmami, UmamiEvents } from '@/hooks/useUmami';

export function GlobalTracking() {
    const { track } = useUmami();

    useEffect(() => {
        const handleclick = (e: MouseEvent) => {
            // Use event delegation to handle clicks on elements inside an anchor tag (like icons)
            const anchor = (e.target as HTMLElement).closest('a');

            if (!anchor || !anchor.href) return;

            try {
                const url = new URL(anchor.href);
                const currentHostname = window.location.hostname;

                // Check if the link is external
                // We compare hostnames to handle different protocols/ports safely
                if (url.hostname !== currentHostname && url.hostname !== '') { // Empty hostname can happen for local files or some schemes, usually we want to ignore unless it's clearly external
                    // Double check it's not a mailto: or tel: which might be interesting but distinct from "outbound link" to a website
                    // For now, let's track everything that isn't this domain as outbound.

                    track(UmamiEvents.OUTBOUND_LINK, {
                        url: anchor.href,
                        hostname: url.hostname
                    });
                }
            } catch (error) {
                // Ignore invalid URLs
            }
        };

        document.addEventListener('click', handleclick, { capture: true });

        return () => {
            document.removeEventListener('click', handleclick, { capture: true });
        };
    }, [track]);

    return null;
}

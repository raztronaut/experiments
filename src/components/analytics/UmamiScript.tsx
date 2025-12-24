'use client';

import Script from 'next/script';

export function UmamiScript() {
    return (
        <Script
            id="umami-analytics"
            src="/u/script.js"
            data-website-id="2080ec09-2d3f-49a1-8f0a-e1f96fd5b5d5"
            strategy="afterInteractive"
        />
    );
}

'use client';

import React, { useState, useEffect } from 'react';

export function useMobileBlocker() {
    const [isBlockedDevice, setIsBlockedDevice] = useState(false);

    useEffect(() => {
        // Only verify device capability on mount
        const initialWidth = window.innerWidth;
        if (initialWidth < 768) {
            setIsBlockedDevice(true);
        }
    }, []);

    return isBlockedDevice;
}

export function MobileBlocker() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900 text-zinc-100 p-8 text-center font-sans">
            <div className="max-w-md space-y-4">
                <div className="text-4xl mb-2">🖥️</div>
                <h2 className="text-xl font-semibold">Desktop Experience Required</h2>
                <p className="text-zinc-400 leading-relaxed">
                    This experiment is not currently supported on mobile devices. Please visit on a desktop browser for the full experience.
                </p>
            </div>
        </div>
    );
}

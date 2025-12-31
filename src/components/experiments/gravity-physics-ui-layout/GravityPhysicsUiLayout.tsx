'use client';

import React, { useState, useEffect } from 'react';
import { PhysicsProvider } from './PhysicsContext';
import GravityDesktop from './GravityDesktop';
import DesktopIcon from './DesktopIcon';
import DesktopWindow from './DesktopWindow';
import GravityDock from './GravityDock';
import MenuBar from './MenuBar';
import InternetExplorer from './InternetExplorer';

export default function GravityPhysicsUiLayout() {
    const [openWindows, setOpenWindows] = useState<string[]>([]);

    const toggleWindow = (id: string) => {
        setOpenWindows(prev =>
            prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
        );
    };

    const openWindow = (id: string) => {
        setOpenWindows(prev => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const [isBlockedDevice, setIsBlockedDevice] = useState(false);

    useEffect(() => {
        // Only verify device capability on mount
        const initialWidth = window.innerWidth;
        if (initialWidth < 768) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsBlockedDevice(true);
        }

        // Initial dimension set
        setDimensions({ width: initialWidth, height: window.innerHeight });

        const handleResize = () => {
            // We do NOT update isBlockedDevice here to allow resizing
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (dimensions.width === 0) return null;

    if (isBlockedDevice) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-100 p-8 text-center font-sans">
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

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#2b6cb0]">
            {/* Background Gradient similar to Cheetah default */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a4b8c] to-[#0d2a52]" />

            <PhysicsProvider>
                <GravityDesktop>
                    <MenuBar />
                    {/* --- Right Side Icons (Skeuomorphic Layout) --- */}
                    {/* Hardcoded positions for now, mirroring the Mac OS X desktop behavior */}
                    <DesktopIcon
                        x={dimensions.width - 100}
                        y={40}
                        label="Internet Explorer"
                        iconSrc="/experiments/gravity-physics-ui-layout/icons/browser.png"
                        onDoubleClick={() => openWindow('browser')}
                    />
                    <DesktopIcon
                        x={dimensions.width - 100}
                        y={160}
                        label="Desktop (Mac OS 9)"
                        iconSrc="/experiments/gravity-physics-ui-layout/icons/folder.png"
                        onDoubleClick={() => openWindow('secret_folder')}
                    />
                    <DesktopIcon
                        x={dimensions.width - 100}
                        y={280}
                        label="Mail"
                        iconSrc="/experiments/gravity-physics-ui-layout/icons/mail.png"
                        onDoubleClick={() => openWindow('mail')}
                    />

                    {/* Helper to calculate window position */}
                    {(() => {
                        const getWindowPos = (index: number) => {
                            const baseX = dimensions.width / 2;
                            const baseY = dimensions.height / 2;
                            // Add slight randomness or cascade so they don't stack perfectly
                            const offset = (index * 30) - 50; // Start slightly up-left of center so the cascade flows nicely
                            return { x: baseX + offset, y: baseY + offset };
                        };

                        return (
                            <>
                                {/* 1. Internet Explorer Window */}
                                {openWindows.includes('browser') && (
                                    <DesktopWindow
                                        x={getWindowPos(openWindows.indexOf('browser')).x}
                                        y={getWindowPos(openWindows.indexOf('browser')).y}
                                        width={800} height={600}
                                        title="Internet Explorer"
                                        onClose={() => toggleWindow('browser')}
                                    >
                                        <InternetExplorer />
                                    </DesktopWindow>
                                )}

                                {/* 2. Terminal Window - Re-added for "fullness" test if needed, but keeping commented out or strictly controlled */}
                                {openWindows.includes('terminal') && (
                                    <DesktopWindow
                                        x={getWindowPos(openWindows.indexOf('terminal')).x}
                                        y={getWindowPos(openWindows.indexOf('terminal')).y}
                                        width={400} height={250}
                                        title="Terminal"
                                        onClose={() => toggleWindow('terminal')}
                                    >
                                        <div className="bg-black text-green-400 p-2 font-mono text-xs h-full w-full opacity-90">
                                            $ init main<br />
                                            $ loading cheetah_ui...<br />
                                            $ OK<br />
                                            $ _
                                        </div>
                                    </DesktopWindow>
                                )}

                                {/* 3. Secret Folder Window */}
                                {openWindows.includes('secret_folder') && (
                                    <DesktopWindow
                                        x={getWindowPos(openWindows.indexOf('secret_folder')).x}
                                        y={getWindowPos(openWindows.indexOf('secret_folder')).y}
                                        title="Desktop (Mac OS 9)"
                                        onClose={() => toggleWindow('secret_folder')}
                                    >
                                        <div className="flex p-6">
                                            {/* The Hidden Text File */}
                                            <div
                                                className="flex flex-col items-center justify-center p-2 hover:bg-blue-100 rounded cursor-pointer group"
                                                onDoubleClick={() => openWindow('readme_text')}
                                            >
                                                {/* Generic text file icon imitation */}
                                                <div className="w-12 h-14 bg-white border border-gray-300 shadow-sm relative flex items-center justify-center">
                                                    <div className="absolute top-0 right-0 border-t-[8px] border-r-[8px] border-t-white border-r-gray-200 border-l-[8px] border-l-transparent border-b-[8px] border-b-transparent bg-gray-100 shadow-sm transform translate-x-0 -translate-y-0" />
                                                    <span className="text-[8px] text-gray-400 font-mono mt-2">TXT</span>
                                                </div>
                                                <span className="text-xs mt-1 bg-white/80 px-1 rounded group-hover:bg-blue-600 group-hover:text-white">ReadMe.txt</span>
                                            </div>
                                        </div>
                                    </DesktopWindow>
                                )}

                                {/* 4. The Secret Message Window */}
                                {openWindows.includes('readme_text') && (
                                    <DesktopWindow
                                        x={getWindowPos(openWindows.indexOf('readme_text')).x}
                                        y={getWindowPos(openWindows.indexOf('readme_text')).y}
                                        width={300} height={150}
                                        title="TextEdit - ReadMe.txt"
                                        onClose={() => toggleWindow('readme_text')}
                                    >
                                        <div className="p-2 h-full bg-white font-mono text-sm text-black whitespace-pre-wrap leading-relaxed select-text cursor-text">
                                            Try resizing your browser window.<br /><br />Or flinging this.
                                        </div>
                                    </DesktopWindow>
                                )}

                                {/* 5. Mail Window (New) */}
                                {openWindows.includes('mail') && (
                                    <DesktopWindow
                                        x={getWindowPos(openWindows.indexOf('mail')).x}
                                        y={getWindowPos(openWindows.indexOf('mail')).y}
                                        width={600} height={400}
                                        title="Mail (0 unread)"
                                        onClose={() => toggleWindow('mail')}
                                    >
                                        <div className="flex flex-col h-full bg-white">
                                            <div className="border-b border-gray-300 bg-[#e8e8e8] p-1 flex gap-2 text-xs">
                                                <button className="px-2 py-0.5 border border-gray-400 bg-white rounded shadow-sm active:bg-gray-200">Delete</button>
                                                <button className="px-2 py-0.5 border border-gray-400 bg-white rounded shadow-sm active:bg-gray-200">Reply</button>
                                                <button className="px-2 py-0.5 border border-gray-400 bg-white rounded shadow-sm active:bg-gray-200">New</button>
                                            </div>
                                            <div className="flex-1 p-2 text-sm text-gray-500 flex items-center justify-center">
                                                No new messages.
                                            </div>
                                        </div>
                                    </DesktopWindow>
                                )}
                            </>
                        );
                    })()}

                    <GravityDock onOpenWindow={openWindow} />
                </GravityDesktop>
            </PhysicsProvider>
        </div>
    );
}
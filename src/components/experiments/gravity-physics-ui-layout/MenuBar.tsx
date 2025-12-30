'use client';

import React, { useState, useEffect } from 'react';

export default function MenuBar() {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            // Mac OS X Cheetah format: "Sat 4:58 PM" (no seconds usually, very concise)
            setTime(now.toLocaleTimeString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).replace(/,/g, ''));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="fixed top-0 left-0 right-0 h-[22px] z-[9999] flex items-center justify-between px-3 select-none cursor-default"
            style={{
                background: 'linear-gradient(to bottom, #ffffff 0%, #e6e6e6 100%)',
                borderBottom: '1px solid #b4b4b4',
                boxShadow: '0px 1px 3px rgba(0,0,0,0.15)',
                fontFamily: '"Lucida Grande", "Segoe UI", Tahoma, sans-serif'
            }}
        >
            <div className="flex items-center h-full">
                {/* Blue Apple Logo */}
                <span className="text-[#1561ce] text-xl drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] pb-[3px] mr-4 relative top-[1px]"></span>

                <div className="flex items-center space-x-4 text-[13px] font-bold text-[#333] tracking-tight">
                    <span className="drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] cursor-default">Finder</span>
                    <span className="font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] cursor-default">File</span>
                    <span className="font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] cursor-default">Edit</span>
                    <span className="font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] cursor-default">View</span>
                    <span className="font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] cursor-default">Go</span>
                    <span className="font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] cursor-default">Window</span>
                    <span className="font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] cursor-default">Help</span>
                </div>
            </div>

            <div className="flex items-center">
                {/* Right side items if needed, flag etc */}
                <span className="text-[13px] font-medium text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] tracking-tight">
                    {time}
                </span>
            </div>
        </div>
    );
}

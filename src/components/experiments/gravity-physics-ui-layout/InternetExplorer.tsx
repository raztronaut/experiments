'use client';

import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Home } from 'lucide-react';

const HOME_URL = 'https://www.wikipedia.org';

// Common sites that block iframes via X-Frame-Options
const BLOCKED_DOMAINS = [
    'google.com', 'www.google.com',
    'apple.com', 'www.apple.com',
    'facebook.com', 'www.facebook.com',
    'twitter.com', 'x.com',
    'youtube.com', 'www.youtube.com',
    'amazon.com', 'www.amazon.com',
    'microsoft.com', 'www.microsoft.com',
    'github.com', 'www.github.com',
    'reddit.com', 'www.reddit.com',
    'netflix.com', 'www.netflix.com',
    'stackoverflow.com'
];

const FAVORITES = [
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'Internet Archive', url: 'https://archive.org' },
    { name: 'W3C', url: 'https://www.w3.org' },
    { name: 'Example', url: 'https://www.example.com' },
    { name: 'Bing', url: 'https://www.bing.com' } // Bing often allows embedding
];

export default function InternetExplorer() {
    const [url, setUrl] = useState(HOME_URL);
    const [inputValue, setInputValue] = useState(HOME_URL);
    const [history, setHistory] = useState<string[]>([HOME_URL]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const navigate = (newUrl: string) => {
        let finalUrl = newUrl;
        if (!finalUrl.startsWith('http')) {
            // Basic "search" if no TLD or http
            if (!finalUrl.includes('.') && finalUrl.includes(' ')) {
                finalUrl = 'https://www.bing.com/search?q=' + encodeURIComponent(finalUrl);
            } else {
                finalUrl = 'https://' + finalUrl;
            }
        }

        // Check for blocked domains
        const isBlocked = BLOCKED_DOMAINS.some(domain => finalUrl.includes(domain));

        setIsLoading(true);
        setUrl(finalUrl);
        setInputValue(finalUrl);

        // Simulating network delay for error
        setTimeout(() => {
            setShowError(isBlocked);
            if (isBlocked) {
                setIsLoading(false);
            }
        }, 500);

        // Update history if it's a new navigation (not back/forward)
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(finalUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleGo = (e?: React.FormEvent) => {
        e?.preventDefault();
        navigate(inputValue);
    };

    const handleBack = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const prevUrl = history[newIndex];
            setUrl(prevUrl);
            setInputValue(prevUrl);
            setShowError(BLOCKED_DOMAINS.some(d => prevUrl.includes(d)));
        }
    };

    const handleForward = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const nextUrl = history[newIndex];
            setUrl(nextUrl);
            setInputValue(nextUrl);
            setShowError(BLOCKED_DOMAINS.some(d => nextUrl.includes(d)));
        }
    };

    const handleRefresh = () => {
        setIsLoading(true);
        if (iframeRef.current) {
            // If currently showing error, try to reload implies trying the URL again
            if (showError) {
                navigate(url); // Re-trigger check
            } else {
                iframeRef.current.src = url;
            }
        }
    };

    const handleHome = () => {
        navigate(HOME_URL);
    };

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#dddddd] font-sans">
            {/* IE Toolbar Background with Pinstripes */}
            <div className="bg-[#e8e8e8] border-b border-gray-400 p-2 flex flex-col gap-2 shadow-sm bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes-light.png')]">

                {/* Button Row */}
                <div className="flex items-center gap-4">
                    <div className="flex gap-0">
                        <button
                            onClick={handleBack}
                            disabled={historyIndex === 0}
                            className={`p-2 rounded-l-md border border-gray-400 bg-gradient-to-b from-white to-[#cccccc] shadow-sm flex items-center justify-center w-10 h-8 ${historyIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'active:bg-[#bbbbbb]'}`}
                        >
                            <ChevronLeft size={20} className="text-gray-700" />
                        </button>
                        <button
                            onClick={handleForward}
                            disabled={historyIndex === history.length - 1}
                            className={`p-2 rounded-r-md border-l-0 border border-gray-400 bg-gradient-to-b from-white to-[#cccccc] shadow-sm flex items-center justify-center w-10 h-8 ${historyIndex === history.length - 1 ? 'opacity-50 cursor-not-allowed' : 'active:bg-[#bbbbbb]'}`}
                        >
                            <ChevronRight size={20} className="text-gray-700" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleRefresh} className="p-1.5 rounded border border-gray-400 bg-gradient-to-b from-white to-[#cccccc] shadow-sm active:bg-[#bbbbbb]">
                            <RefreshCw size={16} className={`text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={handleHome} className="p-1.5 rounded border border-gray-400 bg-gradient-to-b from-white to-[#cccccc] shadow-sm active:bg-[#bbbbbb]">
                            <Home size={16} className="text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Address Bar Row */}
                <form onSubmit={handleGo} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-semibold">Address:</span>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 border border-gray-500 shadow-inner px-2 py-1 text-sm bg-white font-sans outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <button type="submit" className="px-3 py-1 bg-gradient-to-b from-[#dddddd] to-[#aaaaaa] border border-gray-500 rounded text-xs font-bold text-gray-800 shadow-sm active:translate-y-[1px]">
                        Go
                    </button>
                </form>

                {/* Favorites Bar */}
                <div className="flex gap-2 items-center text-xs pb-1 overflow-x-auto">
                    <span className="text-gray-500 font-semibold border-r border-gray-400 pr-2 mr-1">Tad&apos;s Links:</span>
                    {FAVORITES.map(fav => (
                        <button
                            key={fav.name}
                            onClick={() => navigate(fav.url)}
                            className="flex items-center gap-1 hover:underline hover:text-blue-700 text-gray-700 whitespace-nowrap"
                        >
                            <span className="w-3 h-3 bg-blue-400 rounded-sm inline-block opacity-50"></span>
                            {fav.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative bg-white border-t border-gray-400 overflow-hidden">
                {showError ? (
                    <div className="w-full h-full p-8 font-serif bg-white text-black">
                        <h1 className="text-xl mb-4 font-normal">The page cannot be displayed</h1>
                        <p className="text-xs mb-4 text-gray-800">
                            The page you are looking for is currently unavailable. The Web site might be experiencing technical difficulties, or you may need to adjust your browser settings.
                        </p>

                        <hr className="border-t border-gray-300 my-3" />

                        <div className="text-xs text-gray-800 space-y-2">
                            <p>Please try the following:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Click the <button onClick={handleRefresh} className="flex inline-flex items-center gap-1 hover:underline"><RefreshCw size={10} /> Refresh</button> button, or try again later.</li>
                                <li>If you typed the page address in the Address bar, make sure that it is spelled correctly.</li>
                                <li>To check your connection settings, click the <b>Tools</b> menu, and then click <b>Internet Options</b>. On the <b>Connections</b> tab, click <b>Settings</b>. The settings should match those provided by your local area network (LAN) administrator or Internet service provider (ISP).</li>
                                <li>If your Network Administrator has enabled it, Microsoft Windows can examine your network and automatically discover network connection settings.
                                    If you would like Windows to try and discover them,
                                    <span className="text-blue-800 underline ml-1 cursor-pointer">click here</span>.
                                </li>
                            </ul>

                            <p className="mt-4">Some sites required 128-bit encryption. Click the Help menu and then click About Internet Explorer to determine what strength security you have installed.</p>

                            <p>If you are trying to reach a secure site, make sure your Security settings can support it. Click the Tools menu, and then click Internet Options. On the Advanced tab, scroll to the Security section and check settings for SSL 2.0, SSL 3.0, TLS 1.0, PCT 1.0.</p>

                            <p className="mt-4 font-bold">Cannot find server or DNS Error</p>
                            <p>Internet Explorer</p>
                        </div>
                    </div>
                ) : (
                    <iframe
                        ref={iframeRef}
                        src={url}
                        className="w-full h-full border-0"
                        onLoad={handleIframeLoad}
                        title="Browser Content"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        referrerPolicy="no-referrer"
                    />
                )}
            </div>

            {/* Status Bar */}
            <div className="bg-[#d4d4d4] border-t border-gray-400 p-1 px-2 text-[10px] text-gray-600 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes-light.png')]">
                <span>{isLoading ? 'Opening page...' : 'Done'}</span>
                <div className="w-20 h-2 bg-white border border-gray-400 shadow-inner rounded-full overflow-hidden">
                    {isLoading && <div className="h-full bg-blue-500 w-1/2 animate-pulse" />}
                </div>
            </div>
        </div>
    );
}

"use client";

import { ChevronLeft, ChevronRight, Home, RefreshCw } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";

const HOME_URL = "https://www.wikipedia.org";

// Common sites that block iframes via X-Frame-Options
const BLOCKED_DOMAINS = [
  "google.com",
  "www.google.com",
  "apple.com",
  "www.apple.com",
  "facebook.com",
  "www.facebook.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "www.youtube.com",
  "amazon.com",
  "www.amazon.com",
  "microsoft.com",
  "www.microsoft.com",
  "github.com",
  "www.github.com",
  "reddit.com",
  "www.reddit.com",
  "netflix.com",
  "www.netflix.com",
  "stackoverflow.com",
];

const FAVORITES = [
  { name: "Wikipedia", url: "https://www.wikipedia.org" },
  { name: "Internet Archive", url: "https://archive.org" },
  { name: "W3C", url: "https://www.w3.org" },
  { name: "Example", url: "https://www.example.com" },
  { name: "Bing", url: "https://www.bing.com" }, // Bing often allows embedding
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
    if (!finalUrl.startsWith("http")) {
      // Basic "search" if no TLD or http
      if (!finalUrl.includes(".") && finalUrl.includes(" ")) {
        finalUrl = `https://www.bing.com/search?q=${encodeURIComponent(finalUrl)}`;
      } else {
        finalUrl = `https://${finalUrl}`;
      }
    }

    // Check for blocked domains
    const isBlocked = BLOCKED_DOMAINS.some((domain) =>
      finalUrl.includes(domain)
    );

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
      setShowError(BLOCKED_DOMAINS.some((d) => prevUrl.includes(d)));
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextUrl = history[newIndex];
      setUrl(nextUrl);
      setInputValue(nextUrl);
      setShowError(BLOCKED_DOMAINS.some((d) => nextUrl.includes(d)));
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
    <div className="flex h-full flex-col bg-[#dddddd] font-sans">
      {/* IE Toolbar Background with Pinstripes */}
      <div className="flex flex-col gap-2 border-gray-400 border-b bg-[#e8e8e8] bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes-light.png')] p-2 shadow-xs">
        {/* Button Row */}
        <div className="flex items-center gap-4">
          <div className="flex gap-0">
            <button
              aria-label="Back"
              className={`flex h-8 w-10 items-center justify-center rounded-l-md border border-gray-400 bg-linear-to-b from-white to-[#cccccc] p-2 shadow-xs ${historyIndex === 0 ? "cursor-not-allowed opacity-50" : "active:bg-[#bbbbbb]"}`}
              disabled={historyIndex === 0}
              onClick={handleBack}
              type="button"
            >
              <ChevronLeft className="text-gray-700" size={20} />
            </button>
            <button
              aria-label="Forward"
              className={`flex h-8 w-10 items-center justify-center rounded-r-md border border-gray-400 border-l-0 bg-linear-to-b from-white to-[#cccccc] p-2 shadow-xs ${historyIndex === history.length - 1 ? "cursor-not-allowed opacity-50" : "active:bg-[#bbbbbb]"}`}
              disabled={historyIndex === history.length - 1}
              onClick={handleForward}
              type="button"
            >
              <ChevronRight className="text-gray-700" size={20} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              aria-label="Refresh"
              className="rounded border border-gray-400 bg-linear-to-b from-white to-[#cccccc] p-1.5 shadow-xs active:bg-[#bbbbbb]"
              onClick={handleRefresh}
              type="button"
            >
              <RefreshCw
                className={`text-gray-700 ${isLoading ? "animate-spin" : ""}`}
                size={16}
              />
            </button>
            <button
              aria-label="Home"
              className="rounded border border-gray-400 bg-linear-to-b from-white to-[#cccccc] p-1.5 shadow-xs active:bg-[#bbbbbb]"
              onClick={handleHome}
              type="button"
            >
              <Home className="text-gray-700" size={16} />
            </button>
          </div>
        </div>

        {/* Address Bar Row */}
        <form className="flex items-center gap-2" onSubmit={handleGo}>
          <span className="font-semibold text-gray-600 text-xs">Address:</span>
          <input
            className="flex-1 border border-gray-500 bg-white px-2 py-1 font-sans text-sm shadow-inner outline-hidden focus:ring-1 focus:ring-blue-400"
            onChange={(e) => setInputValue(e.target.value)}
            type="text"
            value={inputValue}
          />
          <button
            className="rounded border border-gray-500 bg-linear-to-b from-[#dddddd] to-[#aaaaaa] px-3 py-1 font-bold text-gray-800 text-xs shadow-xs active:translate-y-px"
            type="submit"
          >
            Go
          </button>
        </form>

        {/* Favorites Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="mr-1 border-gray-400 border-r pr-2 font-semibold text-gray-500">
            Tad&apos;s Links:
          </span>
          {FAVORITES.map((fav) => (
            <button
              className="flex items-center gap-1 whitespace-nowrap text-gray-700 hover:text-blue-700 hover:underline"
              key={fav.name}
              onClick={() => navigate(fav.url)}
              type="button"
            >
              <span className="inline-block h-3 w-3 rounded-sm bg-blue-400 opacity-50" />
              {fav.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative flex-1 overflow-hidden border-gray-400 border-t bg-white">
        {showError ? (
          <div className="h-full w-full bg-white p-8 font-serif text-black">
            <h1 className="mb-4 font-normal text-xl">
              The page cannot be displayed
            </h1>
            <p className="mb-4 text-gray-800 text-xs">
              The page you are looking for is currently unavailable. The Web
              site might be experiencing technical difficulties, or you may need
              to adjust your browser settings.
            </p>

            <hr className="my-3 border-gray-300 border-t" />

            <div className="space-y-2 text-gray-800 text-xs">
              <p>Please try the following:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Click the{" "}
                  <button
                    className="flex inline-flex items-center gap-1 hover:underline"
                    onClick={handleRefresh}
                    type="button"
                  >
                    <RefreshCw size={10} /> Refresh
                  </button>{" "}
                  button, or try again later.
                </li>
                <li>
                  If you typed the page address in the Address bar, make sure
                  that it is spelled correctly.
                </li>
                <li>
                  To check your connection settings, click the <b>Tools</b>{" "}
                  menu, and then click <b>Internet Options</b>. On the{" "}
                  <b>Connections</b> tab, click <b>Settings</b>. The settings
                  should match those provided by your local area network (LAN)
                  administrator or Internet service provider (ISP).
                </li>
                <li>
                  If your Network Administrator has enabled it, Microsoft
                  Windows can examine your network and automatically discover
                  network connection settings. If you would like Windows to try
                  and discover them,
                  <span className="ml-1 cursor-pointer text-blue-800 underline">
                    click here
                  </span>
                  .
                </li>
              </ul>

              <p className="mt-4">
                Some sites required 128-bit encryption. Click the Help menu and
                then click About Internet Explorer to determine what strength
                security you have installed.
              </p>

              <p>
                If you are trying to reach a secure site, make sure your
                Security settings can support it. Click the Tools menu, and then
                click Internet Options. On the Advanced tab, scroll to the
                Security section and check settings for SSL 2.0, SSL 3.0, TLS
                1.0, PCT 1.0.
              </p>

              <p className="mt-4 font-bold">Cannot find server or DNS Error</p>
              <p>Internet Explorer</p>
            </div>
          </div>
        ) : (
          <iframe
            className="h-full w-full border-0"
            onLoad={handleIframeLoad}
            ref={iframeRef}
            referrerPolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            src={url}
            title="Browser Content"
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-gray-400 border-t bg-[#d4d4d4] bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes-light.png')] p-1 px-2 text-[10px] text-gray-600">
        <span>{isLoading ? "Opening page..." : "Done"}</span>
        <div className="h-2 w-20 overflow-hidden rounded-full border border-gray-400 bg-white shadow-inner">
          {isLoading && (
            <div className="h-full w-1/2 animate-pulse bg-blue-500" />
          )}
        </div>
      </div>
    </div>
  );
}

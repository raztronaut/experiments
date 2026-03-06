"use client";

import { useEffect, useState } from "react";
import DesktopIcon from "./DesktopIcon";
import DesktopWindow from "./DesktopWindow";
import GravityDesktop from "./GravityDesktop";
import GravityDock from "./GravityDock";
import InternetExplorer from "./InternetExplorer";
import MenuBar from "./MenuBar";
import { PhysicsProvider } from "./PhysicsContext";

export default function GravityPhysicsUiLayout() {
  const [openWindows, setOpenWindows] = useState<string[]>([]);

  const toggleWindow = (id: string) => {
    setOpenWindows((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const openWindow = (id: string) => {
    setOpenWindows((prev) => {
      if (prev.includes(id)) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [isBlockedDevice, setIsBlockedDevice] = useState(false);

  useEffect(() => {
    // Only verify device capability on mount
    const initialWidth = window.innerWidth;
    if (initialWidth < 768) {
      setIsBlockedDevice(true);
    }

    // Initial dimension set
    setDimensions({ width: initialWidth, height: window.innerHeight });

    const handleResize = () => {
      // We do NOT update isBlockedDevice here to allow resizing
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (dimensions.width === 0) {
    return null;
  }

  if (isBlockedDevice) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-900 p-8 text-center font-sans text-zinc-100">
        <div className="max-w-md space-y-4">
          <div className="mb-2 text-4xl">🖥️</div>
          <h2 className="font-semibold text-xl">Desktop Experience Required</h2>
          <p className="text-zinc-400 leading-relaxed">
            This experiment is not currently supported on mobile devices. Please
            visit on a desktop browser for the full experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#2b6cb0]">
      {/* Background Gradient similar to Cheetah default */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a4b8c] to-[#0d2a52]" />

      <PhysicsProvider>
        <GravityDesktop>
          <MenuBar />
          {/* --- Right Side Icons (Skeuomorphic Layout) --- */}
          {/* Hardcoded positions for now, mirroring the Mac OS X desktop behavior */}
          <DesktopIcon
            iconSrc="/experiments/gravity-physics-ui-layout/icons/browser.png"
            label="Internet Explorer"
            onDoubleClick={() => openWindow("browser")}
            x={dimensions.width - 100}
            y={40}
          />
          <DesktopIcon
            iconSrc="/experiments/gravity-physics-ui-layout/icons/folder.png"
            label="Desktop (Mac OS 9)"
            onDoubleClick={() => openWindow("secret_folder")}
            x={dimensions.width - 100}
            y={160}
          />
          <DesktopIcon
            iconSrc="/experiments/gravity-physics-ui-layout/icons/mail.png"
            label="Mail"
            onDoubleClick={() => openWindow("mail")}
            x={dimensions.width - 100}
            y={280}
          />

          {/* Helper to calculate window position */}
          {(() => {
            const getWindowPos = (index: number) => {
              const baseX = dimensions.width / 2;
              const baseY = dimensions.height / 2;
              // Add slight randomness or cascade so they don't stack perfectly
              const offset = index * 30 - 50; // Start slightly up-left of center so the cascade flows nicely
              return { x: baseX + offset, y: baseY + offset };
            };

            return (
              <>
                {/* 1. Internet Explorer Window */}
                {openWindows.includes("browser") && (
                  <DesktopWindow
                    height={600}
                    onClose={() => toggleWindow("browser")}
                    title="Internet Explorer"
                    width={800}
                    x={getWindowPos(openWindows.indexOf("browser")).x}
                    y={getWindowPos(openWindows.indexOf("browser")).y}
                  >
                    <InternetExplorer />
                  </DesktopWindow>
                )}

                {/* 2. Terminal Window - Re-added for "fullness" test if needed, but keeping commented out or strictly controlled */}
                {openWindows.includes("terminal") && (
                  <DesktopWindow
                    height={250}
                    onClose={() => toggleWindow("terminal")}
                    title="Terminal"
                    width={400}
                    x={getWindowPos(openWindows.indexOf("terminal")).x}
                    y={getWindowPos(openWindows.indexOf("terminal")).y}
                  >
                    <div className="h-full w-full bg-black p-2 font-mono text-green-400 text-xs opacity-90">
                      $ init main
                      <br />$ loading cheetah_ui...
                      <br />$ OK
                      <br />$ _
                    </div>
                  </DesktopWindow>
                )}

                {/* 3. Secret Folder Window */}
                {openWindows.includes("secret_folder") && (
                  <DesktopWindow
                    onClose={() => toggleWindow("secret_folder")}
                    title="Desktop (Mac OS 9)"
                    x={getWindowPos(openWindows.indexOf("secret_folder")).x}
                    y={getWindowPos(openWindows.indexOf("secret_folder")).y}
                  >
                    <div className="flex p-6">
                      {/* The Hidden Text File */}
                      <div
                        className="group flex cursor-pointer flex-col items-center justify-center rounded p-2 hover:bg-blue-100"
                        onDoubleClick={() => openWindow("readme_text")}
                      >
                        {/* Generic text file icon imitation */}
                        <div className="relative flex h-14 w-12 items-center justify-center border border-gray-300 bg-white shadow-sm">
                          <div className="absolute top-0 right-0 translate-x-0 -translate-y-0 transform border-t-[8px] border-t-white border-r-[8px] border-r-gray-200 border-b-[8px] border-b-transparent border-l-[8px] border-l-transparent bg-gray-100 shadow-sm" />
                          <span className="mt-2 font-mono text-[8px] text-gray-400">
                            TXT
                          </span>
                        </div>
                        <span className="mt-1 rounded bg-white/80 px-1 text-xs group-hover:bg-blue-600 group-hover:text-white">
                          ReadMe.txt
                        </span>
                      </div>
                    </div>
                  </DesktopWindow>
                )}

                {/* 4. The Secret Message Window */}
                {openWindows.includes("readme_text") && (
                  <DesktopWindow
                    height={150}
                    onClose={() => toggleWindow("readme_text")}
                    title="TextEdit - ReadMe.txt"
                    width={300}
                    x={getWindowPos(openWindows.indexOf("readme_text")).x}
                    y={getWindowPos(openWindows.indexOf("readme_text")).y}
                  >
                    <div className="h-full cursor-text select-text whitespace-pre-wrap bg-white p-2 font-mono text-black text-sm leading-relaxed">
                      Try resizing your browser window.
                      <br />
                      <br />
                      Or flinging this.
                    </div>
                  </DesktopWindow>
                )}

                {/* 5. Mail Window (New) */}
                {openWindows.includes("mail") && (
                  <DesktopWindow
                    height={400}
                    onClose={() => toggleWindow("mail")}
                    title="Mail (0 unread)"
                    width={600}
                    x={getWindowPos(openWindows.indexOf("mail")).x}
                    y={getWindowPos(openWindows.indexOf("mail")).y}
                  >
                    <div className="flex h-full flex-col bg-white">
                      <div className="flex gap-2 border-gray-300 border-b bg-[#e8e8e8] p-1 text-xs">
                        <button className="rounded border border-gray-400 bg-white px-2 py-0.5 shadow-sm active:bg-gray-200">
                          Delete
                        </button>
                        <button className="rounded border border-gray-400 bg-white px-2 py-0.5 shadow-sm active:bg-gray-200">
                          Reply
                        </button>
                        <button className="rounded border border-gray-400 bg-white px-2 py-0.5 shadow-sm active:bg-gray-200">
                          New
                        </button>
                      </div>
                      <div className="flex flex-1 items-center justify-center p-2 text-gray-500 text-sm">
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

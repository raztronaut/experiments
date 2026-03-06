"use client";

import { useEffect, useState } from "react";

export default function MenuBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Mac OS X Cheetah format: "Sat 4:58 PM" (no seconds usually, very concise)
      setTime(
        now
          .toLocaleTimeString("en-US", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          .replace(/,/g, "")
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed top-0 right-0 left-0 z-[9999] flex h-[22px] cursor-default select-none items-center justify-between px-3"
      style={{
        background: "linear-gradient(to bottom, #ffffff 0%, #e6e6e6 100%)",
        borderBottom: "1px solid #b4b4b4",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.15)",
        fontFamily: '"Lucida Grande", "Segoe UI", Tahoma, sans-serif',
      }}
    >
      <div className="flex h-full items-center">
        {/* Blue Apple Logo */}
        <span className="relative top-[1px] mr-4 pb-[3px] text-[#1561ce] text-xl drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
          
        </span>

        <div className="flex items-center space-x-4 font-bold text-[#333] text-[13px] tracking-tight">
          <span className="cursor-default drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
            Finder
          </span>
          <span className="cursor-default font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
            File
          </span>
          <span className="cursor-default font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
            Edit
          </span>
          <span className="cursor-default font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
            View
          </span>
          <span className="cursor-default font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
            Go
          </span>
          <span className="cursor-default font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
            Window
          </span>
          <span className="cursor-default font-normal text-[#333] drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
            Help
          </span>
        </div>
      </div>

      <div className="flex items-center">
        {/* Right side items if needed, flag etc */}
        <span className="font-medium text-[#333] text-[13px] tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
          {time}
        </span>
      </div>
    </div>
  );
}

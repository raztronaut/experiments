"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function MobileNotice() {
    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

        if (isMobile) {
            toast.info("Best viewed on desktop", {
                description: "Open Developer Tools to see the console cat animation!",
                duration: Infinity,
                dismissible: true,
            });
        }
    }, []);

    return null;
}

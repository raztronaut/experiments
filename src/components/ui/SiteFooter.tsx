"use client";

import Link from "next/link";
import { Icons } from "@/components/ui/icons";

export function SiteFooter() {
    return (
        <footer className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-12 text-[0.875rem] text-[var(--text-secondary)]">
            <span>built by razi</span>
            <div className="flex items-center gap-3">
                <Link
                    href="https://github.com/raztronaut"
                    target="_blank"
                    aria-label="GitHub"
                    className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
                    data-umami-event="github_click"
                    data-umami-event-type="profile"
                >
                    <Icons.GitHub width={18} height={18} />
                </Link>
                <Link
                    href="https://x.com/raztronaut"
                    target="_blank"
                    aria-label="X (formerly Twitter)"
                    className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
                    data-umami-event="social_click"
                    data-umami-event-platform="x"
                >
                    <Icons.X width={16} height={16} />
                </Link>
            </div>
        </footer>
    );
}

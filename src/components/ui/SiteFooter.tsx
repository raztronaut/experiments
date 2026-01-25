'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/icons';

export function SiteFooter() {
    return (
        <footer className="border-t border-white/10 pt-24 md:pt-12 pb-32 text-[0.875rem] text-[var(--text-secondary)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-md space-y-4">
                    <p>
                        This page is created using my simple scaffolding tool to help developers whip up new web design/development experiments rapidly. Check it out here:{' '}
                        <a
                            href="https://github.com/raztronaut/experiments-tool"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-[var(--text-primary)] transition-colors"
                            data-umami-event="github_click"
                            data-umami-event-type="repo"
                        >
                            <span>experiments-tool</span>
                            <Icons.ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                    </p>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                    <span className="block text-xs text-muted-foreground/60">built by razi</span>
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
                        <Link
                            href="https://linkedin.com/in/raztronaut"
                            target="_blank"
                            aria-label="LinkedIn"
                            className="rounded-lg p-2 transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
                            data-umami-event="social_click"
                            data-umami-event-platform="linkedin"
                        >
                            <Icons.Linkedin width={18} height={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

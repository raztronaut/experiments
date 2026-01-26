'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Icons } from '@/components/ui/icons';
import { WithHover } from './cursor/WithHover';
import { replica } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export function SiteFooter() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <footer className="border-t border-border/50 pt-24 md:pt-12 pb-32 text-[0.875rem] text-muted-foreground">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-md space-y-4">
                    <p>
                        This page is created using my simple scaffolding tool to help developers whip up new web design/development experiments rapidly. Check it out here:{' '}
                        <WithHover config={{ hoverOffset: 2 }}>
                            <a
                                href="https://github.com/raztronaut/experiments-tool"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-fit items-center gap-1.5 px-2 py-0.5 rounded-md no-underline hover:bg-muted/40 transition-colors hover:text-foreground"
                                data-umami-event="github_click"
                                data-umami-event-type="repo"
                            >
                                <Icons.GitHub className="h-3 w-3 opacity-60" />
                                <span>experiments-tool</span>
                                <Icons.ExternalLink className="h-3 w-3 opacity-60" />
                            </a>
                        </WithHover>
                    </p>
                    <WithHover config={{ hoverOffset: 2 }}>
                        <button
                            onClick={toggleTheme}
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[0.7rem] tracking-[0.1em] uppercase text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground transition-colors"
                            aria-label="Toggle theme"
                            data-umami-event="theme_toggle"
                            {...(mounted && { 'data-umami-event-theme': resolvedTheme === 'dark' ? 'light' : 'dark' })}
                        >
                            {mounted ? (
                                resolvedTheme === 'dark' ? 'turn on the lights!' : 'turn off the lights!'
                            ) : (
                                <span className="opacity-0">turn on the lights!</span>
                            )}
                        </button>
                    </WithHover>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                    <span className={cn("block text-sm text-muted-foreground/60 font-normal", replica.className)}>built by razi</span>
                    <div className="flex items-center gap-3">
                        <WithHover config={{ hoverOffset: 2 }}>
                            <Link
                                href="https://github.com/raztronaut"
                                target="_blank"
                                aria-label="GitHub"
                                className="inline-flex items-center justify-center p-2 rounded-md bg-muted/20 hover:bg-muted/40 text-foreground transition-colors border border-border/50"
                                data-umami-event="github_click"
                                data-umami-event-type="profile"
                            >
                                <Icons.GitHub className="h-5 w-5" />
                            </Link>
                        </WithHover>
                        <WithHover config={{ hoverOffset: 2 }}>
                            <Link
                                href="https://x.com/raztronaut"
                                target="_blank"
                                aria-label="X (formerly Twitter)"
                                className="inline-flex items-center justify-center p-2 rounded-md bg-muted/20 hover:bg-muted/40 text-foreground transition-colors border border-border/50"
                                data-umami-event="social_click"
                                data-umami-event-platform="x"
                            >
                                <Icons.X className="h-5 w-5" />
                            </Link>
                        </WithHover>
                        <WithHover config={{ hoverOffset: 2 }}>
                            <Link
                                href="https://linkedin.com/in/raztronaut"
                                target="_blank"
                                aria-label="LinkedIn"
                                className="inline-flex items-center justify-center p-2 rounded-md bg-muted/20 hover:bg-muted/40 text-foreground transition-colors border border-border/50"
                                data-umami-event="social_click"
                                data-umami-event-platform="linkedin"
                            >
                                <Icons.Linkedin className="h-5 w-5" />
                            </Link>
                        </WithHover>
                    </div>
                </div>
            </div>
        </footer>
    );
}

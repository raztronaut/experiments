'use client';

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { WithHover } from '../cursor/WithHover';

interface ViewModeToggleProps {
    viewMode: 'list' | 'grid';
    onViewModeChange: (mode: 'list' | 'grid') => void;
}

/**
 * Toggle between list and grid view modes.
 */
export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
    return (
        <div className="flex items-center justify-end">
            <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50">
                <WithHover config={{ hoverOffset: 0 }}>
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        aria-label="Grid view"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </WithHover>
                <WithHover config={{ hoverOffset: 0 }}>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        aria-label="List view"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </WithHover>
            </div>
        </div>
    );
}

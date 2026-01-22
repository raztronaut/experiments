import React from 'react';
import MountainTransition from '@/components/experiments/mountain-transition/MountainTransition';

export const metadata = {
    title: 'Mountain Transition | Experiments',
    description: 'A shader-based morphing mountain landscape.',
};

export default function Page() {
    return (
        <main className="w-full h-full min-h-screen bg-black">
            <MountainTransition />
        </main>
    );
}
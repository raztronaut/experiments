import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CursorDepthExplorer from './CursorDepthExplorer';

const meta = {
title: 'Experiments/Cursor Depth Explorer',
component: CursorDepthExplorer,
parameters: {
layout: 'centered',
},
} satisfies Meta<typeof CursorDepthExplorer>;

    export default meta;
    type Story = StoryObj<typeof meta>;

        export const Default: Story = {};
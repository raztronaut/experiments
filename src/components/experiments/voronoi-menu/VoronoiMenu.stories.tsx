import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import VoronoiMenu from './VoronoiMenu';

const meta = {
title: 'Experiments/Voronoi-Menu',
component: VoronoiMenu,
parameters: {
layout: 'centered',
},
} satisfies Meta<typeof VoronoiMenu>;

    export default meta;
    type Story = StoryObj<typeof meta>;

        export const Default: Story = {};
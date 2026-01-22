import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MountainTransition from './MountainTransition';

const meta = {
title: 'Experiments/Mountain-Transition',
component: MountainTransition,
parameters: {
layout: 'centered',
},
} satisfies Meta<typeof MountainTransition>;

    export default meta;
    type Story = StoryObj<typeof meta>;

        export const Default: Story = {};
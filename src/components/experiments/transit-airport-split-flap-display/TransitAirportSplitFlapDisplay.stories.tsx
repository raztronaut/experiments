import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import TransitAirportSplitFlapDisplay from './TransitAirportSplitFlapDisplay';

const meta = {
title: 'Experiments/Transit/Airport Split-Flap Display',
component: TransitAirportSplitFlapDisplay,
parameters: {
layout: 'centered',
},
} satisfies Meta<typeof TransitAirportSplitFlapDisplay>;

    export default meta;
    type Story = StoryObj<typeof meta>;

        export const Default: Story = {};
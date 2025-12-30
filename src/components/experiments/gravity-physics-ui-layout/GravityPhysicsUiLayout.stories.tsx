import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import GravityPhysicsUiLayout from './GravityPhysicsUiLayout';

const meta = {
title: 'Experiments/Gravity/Physics UI Layout',
component: GravityPhysicsUiLayout,
parameters: {
layout: 'centered',
},
} satisfies Meta<typeof GravityPhysicsUiLayout>;

    export default meta;
    type Story = StoryObj<typeof meta>;

        export const Default: Story = {};
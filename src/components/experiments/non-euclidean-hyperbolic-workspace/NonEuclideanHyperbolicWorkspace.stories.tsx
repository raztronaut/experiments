import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import NonEuclideanHyperbolicWorkspace from './NonEuclideanHyperbolicWorkspace';

const meta = {
title: 'Experiments/Non-Euclidean Hyperbolic Workspace',
component: NonEuclideanHyperbolicWorkspace,
parameters: {
layout: 'centered',
},
} satisfies Meta<typeof NonEuclideanHyperbolicWorkspace>;

    export default meta;
    type Story = StoryObj<typeof meta>;

        export const Default: Story = {};
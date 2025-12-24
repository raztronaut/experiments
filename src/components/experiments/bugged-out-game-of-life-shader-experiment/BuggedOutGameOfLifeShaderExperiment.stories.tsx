import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import BuggedOutGameOfLifeShaderExperiment from './BuggedOutGameOfLifeShaderExperiment';

const meta = {
    title: 'Experiments/Bugged Out Game of Life Shader',
    component: BuggedOutGameOfLifeShaderExperiment,
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof BuggedOutGameOfLifeShaderExperiment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
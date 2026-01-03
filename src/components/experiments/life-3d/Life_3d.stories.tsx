import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Life_3d from './Life_3d';

const meta = {
    title: 'Experiments/Life 3d',
    component: Life_3d,
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof Life_3d>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
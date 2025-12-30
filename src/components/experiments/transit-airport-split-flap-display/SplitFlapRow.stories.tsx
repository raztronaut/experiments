import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SplitFlapRow } from './SplitFlapRow';

const meta = {
    title: 'Experiments/Transit/SplitFlapRow',
    component: SplitFlapRow,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
} satisfies Meta<typeof SplitFlapRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShortText: Story = {
    args: {
        text: "CALTRAIN",
        length: 10,
    },
};

export const LongText: Story = {
    args: {
        text: "SAN JOSE DIRIDON",
        length: 20,
    },
};

export const NumbersAndTime: Story = {
    args: {
        text: "18:45",
        length: 5,
    },
};

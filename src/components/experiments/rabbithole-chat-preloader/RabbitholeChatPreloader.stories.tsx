import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import RabbitholeChatPreloader from './RabbitholeChatPreloader';

const meta = {
title: 'Experiments/rabbithole.chat Preloader',
component: RabbitholeChatPreloader,
parameters: {
layout: 'centered',
},
} satisfies Meta<typeof RabbitholeChatPreloader>;

    export default meta;
    type Story = StoryObj<typeof meta>;

        export const Default: Story = {};
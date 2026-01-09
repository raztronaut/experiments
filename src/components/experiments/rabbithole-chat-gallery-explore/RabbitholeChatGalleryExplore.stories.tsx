import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import RabbitholeChatGalleryExplore from './RabbitholeChatGalleryExplore';

const meta = {
title: 'Experiments/rabbithole.chat Gallery Explore',
component: RabbitholeChatGalleryExplore,
parameters: {
layout: 'centered',
},
} satisfies Meta<typeof RabbitholeChatGalleryExplore>;

    export default meta;
    type Story = StoryObj<typeof meta>;

        export const Default: Story = {};
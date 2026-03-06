import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BasketballReplayCenter from "./BasketballReplayCenter";

const meta = {
  title: "Experiments/Basketball Replay Center",
  component: BasketballReplayCenter,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof BasketballReplayCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

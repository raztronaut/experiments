import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Test from "./Test";

const meta = {
  title: "Experiments/Test",
  component: Test,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Test>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

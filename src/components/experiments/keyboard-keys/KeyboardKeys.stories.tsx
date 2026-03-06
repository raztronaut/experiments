import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import KeyboardKeys from "./KeyboardKeys";

const meta = {
  title: "Experiments/Keyboard-Keys",
  component: KeyboardKeys,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof KeyboardKeys>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

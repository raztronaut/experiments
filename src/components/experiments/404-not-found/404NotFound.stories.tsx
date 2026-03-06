import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import NotFound404 from "./404NotFound";

const meta = {
  title: "Experiments/404 Not Found",
  component: NotFound404,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof NotFound404>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

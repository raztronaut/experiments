import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import VelocityResponsiveDesign from "./VelocityResponsiveDesign";

const meta = {
  title: "Experiments/Velocity-Responsive Design",
  component: VelocityResponsiveDesign,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof VelocityResponsiveDesign>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

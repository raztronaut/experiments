import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import GameOfLifeShader from "./GameOfLifeShader";

const meta = {
  title: "Experiments/Game of Life Shader",
  component: GameOfLifeShader,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof GameOfLifeShader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

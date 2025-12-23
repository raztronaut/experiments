import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShaderLanding } from "./ShaderLanding";

const meta: Meta<typeof ShaderLanding> = {
    title: "Experiments/Shader Landing",
    component: ShaderLanding,
    parameters: {
        layout: "fullscreen",
    },
    decorators: [
        (Story) => (
            <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof ShaderLanding>;

export const Default: Story = {};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SendButton } from "./SendButton";

const meta = {
    title: "Experiments/SendButton",
    component: SendButton,
    parameters: {
        layout: "fullscreen",
        backgrounds: {
            default: "light-gradient",
            values: [
                { name: "light-gradient", value: "linear-gradient(135deg, #f8fafc, #f1f5f9)" },
                { name: "dark", value: "#18181b" },
            ],
        },
    },
    decorators: [
        (Story) => (
            <div style={{ padding: "2rem", minHeight: "100vh" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof SendButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
    name: "Expanded State",
    parameters: {
        docs: {
            description: {
                story: "The input expands when clicked or focused, revealing additional controls like Think and Deep Search toggles.",
            },
        },
    },
};

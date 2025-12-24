import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";

export const metadata = {
    title: 'Shader Landing Experiment',
    description: 'Isolated experiment',
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ExperimentBackButton />
                {children}
            </body>
        </html>
    );
}

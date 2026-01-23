import "../experiments.css";
import { ExperimentBackButton } from "@/components/ui/ExperimentBackButton";
import { UmamiScript } from "@/components/analytics/UmamiScript";

export const metadata = {
    title: 'Shader Landing Experiment',
    description: 'A random shader experiment',
    openGraph: {
        videos: ['/experiments/shader-landing/preview-shader-landing.mp4'],
    },
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <UmamiScript />
                <ExperimentBackButton />
                {children}
            </body>
        </html>
    );
}

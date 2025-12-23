import fs from 'fs/promises';
import path from 'path';

export interface Experiment {
    title: string;
    description: string;
    slug: string;
    href: string;
    created: string;
}

export async function getExperiments(): Promise<Experiment[]> {
    const experimentsDir = path.join(process.cwd(), 'src/app/experiments');

    try {
        const entries = await fs.readdir(experimentsDir, { withFileTypes: true });

        // Filter for directories that look like Route Groups: "(name)"
        // Exclude special route groups like (index) that aren't experiments
        const experimentDirs = entries
            .filter(dirent =>
                dirent.isDirectory() &&
                dirent.name.startsWith('(') &&
                dirent.name !== '(index)'
            )
            .map(dirent => dirent.name);

        const experiments = await Promise.all(
            experimentDirs.map(async (dirName) => {
                const configPath = path.join(experimentsDir, dirName, 'experiment.json');
                try {
                    const content = await fs.readFile(configPath, 'utf-8');
                    const config = JSON.parse(content);

                    return {
                        ...config,
                        href: `/experiments/${config.slug}`
                    } as Experiment;
                } catch (error) {
                    console.warn(`Could not read config for ${dirName}:`, error);
                    return null;
                }
            })
        );

        // Filter out nulls and sort by date descending (newest first)
        return experiments
            .filter((exp): exp is Experiment => exp !== null)
            .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    } catch (error) {
        console.error("Error reading experiments directory:", error);
        return [];
    }
}

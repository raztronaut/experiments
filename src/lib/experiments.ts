import fs from 'fs/promises';
import path from 'path';

export interface Experiment {
    title: string;
    description: string;
    slug: string;
    href: string;
    created: string;
    image?: string;
    video?: string;
    poster?: string;
    isPlaceholder?: boolean;
}

export async function getExperiments(): Promise<Experiment[]> {
    const experimentsDir = path.join(process.cwd(), 'src/app/experiments');
    const publicDir = path.join(process.cwd(), 'public');

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

                    // Check for poster.jpg
                    // The slug usually matches the directory name, but let's blindly rely on config.slug for the public path map
                    // Assumption: public/experiments/{slug}/poster.jpg

                    const posterPath = `/experiments/${config.slug}/poster.jpg`;
                    const absolutePosterPath = path.join(publicDir, posterPath);
                    let hasPoster = false;

                    try {
                        await fs.access(absolutePosterPath);
                        hasPoster = true;
                    } catch {
                        hasPoster = false;
                    }

                    return {
                        ...config,
                        href: `/experiments/${config.slug}`,
                        poster: hasPoster ? posterPath : undefined
                    } as Experiment;
                } catch (error) {
                    console.warn(`Could not read config for ${dirName}:`, error);
                    return null;
                }
            })
        );

        // Filter out nulls and sort by date descending (newest first)
        // ISO 8601 strings are lexicographically sortable, so we can avoid Date parsing
        return experiments
            .filter((exp): exp is Experiment => exp !== null)
            .sort((a, b) => b.created.localeCompare(a.created));

    } catch (error) {
        console.error("Error reading experiments directory:", error);
        return [];
    }
}

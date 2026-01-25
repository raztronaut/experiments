import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const EXPERIMENTS_DIR = path.join(process.cwd(), 'src/app/experiments');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function generatePosters() {
    console.log('🔍 Scanning experiments for videos...');

    try {
        const entries = fs.readdirSync(EXPERIMENTS_DIR, { withFileTypes: true });

        const experimentDirs = entries
            .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('('))
            .map(dirent => dirent.name);

        for (const dirName of experimentDirs) {
            const configPath = path.join(EXPERIMENTS_DIR, dirName, 'experiment.json');

            if (!fs.existsSync(configPath)) continue;

            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            const slug = config.slug;

            if (config.video) {
                const videoRelativePath = config.video;
                const videoPath = path.join(PUBLIC_DIR, videoRelativePath);
                const posterPath = path.join(PUBLIC_DIR, 'experiments', slug, 'poster.jpg');

                if (fs.existsSync(videoPath)) {
                    if (!fs.existsSync(posterPath)) {
                        console.log(`🎬 Generating poster for: ${slug}...`);
                        try {
                            // Extract first frame (-ss 1.0 to avoid black frames at start sometimes)
                            execSync(`ffmpeg -y -i "${videoPath}" -ss 00:00:00.000 -vframes 1 "${posterPath}"`, { stdio: 'inherit' });
                            console.log(`✅ Generated poster: ${posterPath}`);
                        } catch (error) {
                            console.error(`❌ Failed to generate poster for ${slug}:`, error.message);
                        }
                    } else {
                        // console.log(`⏩ Poster already exists for: ${slug}`);
                    }
                } else {
                    console.warn(`⚠️ Video file not found: ${videoPath}`);
                }
            }
        }

        console.log('✨ Poster generation complete.');
    } catch (error) {
        console.error('❌ Error reading experiments directory:', error);
    }
}

generatePosters();

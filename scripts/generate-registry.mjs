import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_REGISTRY_DIR = path.join(ROOT_DIR, "public", "registry");
const APP_EXPERIMENTS_DIR = path.join(ROOT_DIR, "src", "app", "experiments");
const COMPONENTS_DIR = path.join(ROOT_DIR, "src", "components", "experiments");

// The base URL where assets are served from in production
const ASSET_BASE_URL = "https://www.razisyed.cv";

/**
 * Extracts all imports from a given file content
 */
function extractImports(content) {
    const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
    const imports = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }
    return imports;
}

/**
 * Categorizes an import as either a regular NPM dependency, a shadcn registry dependency, or local code.
 * By default for experiments:
 * - anything starting with a word character and NOT starting with "." or "@/" or "src/" or "@" (excluding known scoped packages) is an npm dep.
 * - anything starting with "@radix-ui", "framer-motion", "lucide-react", "three", "@react-three", "gsap", etc are npm dependencies.
 * - anything starting with "@/components/ui/" is a registry dependency (we just use the component name as the registry dep)
 * - anything starting with "." or "./" or "../" or "@/components/experiments/" is local code that should be included in the file array.
 */
function categorizeImport(importPath) {
    if (importPath.startsWith("@/components/ui/")) {
        const parts = importPath.split("/");
        const componentName = parts[parts.length - 1].replace(/\.tsx?$/, '');
        return { type: 'registry', name: componentName };
    }

    // Not strictly comprehensive, but handles our typical stack. 
    // NextJS aliases like @/app, @/lib are local.
    if (importPath.startsWith(".") || importPath.startsWith("@/") || importPath.startsWith("~/")) {
        return { type: 'local', path: importPath };
    }

    // Otherwise it's an NPM dependency
    return { type: 'npm', name: importPath };
}

/**
 * Recursively find all TypeScript/TSX/JS/JSX files in a directory
 */
async function getAllComponentFiles(dirPath) {
    let results = [];
    try {
        const list = await fs.readdir(dirPath, { withFileTypes: true });
        for (const file of list) {
            // Skip hidden files, tests, and stories
            if (file.name.startsWith('.') || file.name.includes('.test.') || file.name.includes('.stories.')) {
                continue;
            }

            const fullPath = path.join(dirPath, file.name);
            if (file.isDirectory()) {
                results = results.concat(await getAllComponentFiles(fullPath));
            } else if (file.name.match(/\.(tsx?|jsx?)$/)) {
                results.push(fullPath);
            }
        }
    } catch (e) {
        if (e.code === 'ENOENT') return [];
        throw e;
    }
    return results;
}

/**
 * Follows local imports within the experiment component directory to build up the 'files' array
 */
async function resolveLocalFiles(startFile) {
    const fileQueue = [startFile];
    const processedFiles = new Set();
    const resolvedFiles = [];
    const npmDependencies = new Set();
    const registryDependencies = new Set();

    while (fileQueue.length > 0) {
        const currentFile = fileQueue.shift();
        if (processedFiles.has(currentFile)) continue;
        processedFiles.add(currentFile);

        try {
            let content = await fs.readFile(currentFile, "utf-8");
            const relativeToComponents = path.relative(path.join(ROOT_DIR, "src", "components"), currentFile);

            // Replace any hardcoded absolute paths to /experiments/ with the CDN URL
            // e.g. "/experiments/basketball-replay-center/poster.jpg" -> "https://experiments.raztronaut.space/experiments/..."
            // Also handles template literals like `/experiments/...`
            content = content.replace(/(['"`])\/experiments\//g, `$1${ASSET_BASE_URL}/experiments/`);

            resolvedFiles.push({
                name: path.basename(currentFile), // Simple basename for registry structure
                path: currentFile,
                relativePath: relativeToComponents, // e.g. experiments/basketball-replay-center/ReplayPreloader.tsx
                content: content
            });

            const imports = extractImports(content);
            for (const imp of imports) {
                const categorized = categorizeImport(imp);
                if (categorized.type === 'npm') {
                    // Extract base package name for scoped and unscoped
                    let rootDep = categorized.name;
                    if (rootDep.startsWith('@')) {
                        const parts = rootDep.split('/');
                        if (parts.length >= 2) rootDep = `${parts[0]}/${parts[1]}`;
                    } else {
                        rootDep = rootDep.split('/')[0];
                    }
                    // Filter out types and native node modules and other weirdness
                    if (!rootDep.startsWith('next') && !rootDep.startsWith('react') && rootDep !== 'three/examples' && !rootDep.startsWith('three-stdlib')) {
                        npmDependencies.add(rootDep);
                    }
                } else if (categorized.type === 'registry') {
                    registryDependencies.add(categorized.name);
                } else if (categorized.type === 'local') {
                    // Handle relative imports by resolving them against the current file's directory
                    if (categorized.path.startsWith('.')) {
                        const currentDir = path.dirname(currentFile);
                        const resolvedDir = path.resolve(currentDir, categorized.path);

                        // It could be a file without extension, or a directory with index.tsx
                        const possibleExtensions = ['.tsx', '.ts', '.jsx', '.js'];
                        let found = false;

                        // 1. Direct file match
                        for (const ext of possibleExtensions) {
                            if (await fs.stat(`${resolvedDir}${ext}`).then(s => s.isFile()).catch(() => false)) {
                                fileQueue.push(`${resolvedDir}${ext}`);
                                found = true;
                                break;
                            }
                        }

                        // 2. Directory with index match
                        if (!found && await fs.stat(resolvedDir).then(s => s.isDirectory()).catch(() => false)) {
                            for (const ext of possibleExtensions) {
                                if (await fs.stat(path.join(resolvedDir, `index${ext}`)).then(s => s.isFile()).catch(() => false)) {
                                    fileQueue.push(path.join(resolvedDir, `index${ext}`));
                                    found = true;
                                    break;
                                }
                            }
                        }
                    } else if (categorized.path.startsWith('@/components/experiments/')) {
                        // Absolute import but within components
                        const relativePath = categorized.path.replace('@/components/', '');
                        const fullPathBase = path.join(ROOT_DIR, 'src', 'components', relativePath);

                        const possibleExtensions = ['.tsx', '.ts', '.jsx', '.js'];
                        for (const ext of possibleExtensions) {
                            if (await fs.stat(`${fullPathBase}${ext}`).then(s => s.isFile()).catch(() => false)) {
                                fileQueue.push(`${fullPathBase}${ext}`);
                                break;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing file ${currentFile}:`, error.message);
        }
    }

    return {
        files: resolvedFiles,
        dependencies: Array.from(npmDependencies),
        registryDependencies: Array.from(registryDependencies)
    };
}


async function generateRegistry() {
    try {
        await fs.mkdir(PUBLIC_REGISTRY_DIR, { recursive: true });

        // 1. Find all experiments by looking in src/app/experiments
        const experimentDirs = await fs.readdir(APP_EXPERIMENTS_DIR, { withFileTypes: true });
        const registryItems = [];

        const EXCLUDE_EXPERIMENTS = ["3-d-basketball-court-hero"];
        for (const dir of experimentDirs) {
            // Our architecture looks like: src/app/experiments/(experiment-name)/experiment-name/page.tsx
            // So 'dir' is the route group, like (basketball-replay-center)
            if (!dir.isDirectory() || !dir.name.startsWith('(')) continue;

            const experimentName = dir.name.replace('(', '').replace(')', '');

            if (EXCLUDE_EXPERIMENTS.includes(experimentName)) {
                console.log(`Skipping excluded experiment: ${experimentName}`);
                continue;
            }

            // Load experiment.json to get metadata if it exists
            let metadata = { title: experimentName, description: `Component for ${experimentName}` };
            try {
                const metaPath = path.join(APP_EXPERIMENTS_DIR, dir.name, 'experiment.json');
                const metaContent = await fs.readFile(metaPath, 'utf-8');
                metadata = JSON.parse(metaContent);
            } catch {
                // Ignore missing metadata
            }

            // 2. Find the root component for this experiment in src/components/experiments/[name]
            const componentDir = path.join(COMPONENTS_DIR, experimentName);
            const componentFiles = await getAllComponentFiles(componentDir);

            if (componentFiles.length === 0) {
                console.log(`Skipping ${experimentName}: No main component files found in ${componentDir}`);
                continue;
            }

            // To avoid generating massive registries for complex experiments, we just bundle ALL files in the component dir 
            // rather than trying to perfectly tree-shake from a single entry point (since some experiments have multiple exported components)
            console.log(`Analyzing ${experimentName}...`);

            const allFiles = [];
            const allNpmDeps = new Set();
            const allRegistryDeps = new Set();

            for (const startFile of componentFiles) {
                const result = await resolveLocalFiles(startFile);
                result.files.forEach(f => {
                    if (!allFiles.find(existing => existing.path === f.path)) {
                        allFiles.push({
                            name: f.name,
                            type: "registry:file",
                            path: f.name,
                            target: `components/experiments/${experimentName}/${f.name}`,
                            content: f.content
                        });
                    }
                });
                result.dependencies.forEach(d => allNpmDeps.add(d));
                result.registryDependencies.forEach(d => allRegistryDeps.add(d));
            }

            if (allFiles.length > 0) {
                const registryItem = {
                    name: experimentName,
                    type: "registry:ui",
                    title: metadata.title,
                    description: metadata.description,
                    dependencies: Array.from(allNpmDeps),
                    registryDependencies: Array.from(allRegistryDeps),
                    tailwind: {
                        config: {
                            theme: {
                                extend: {
                                    colors: {
                                        background: "hsl(var(--background))",
                                        foreground: "hsl(var(--foreground))",
                                        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
                                        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
                                        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
                                        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
                                        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
                                        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
                                        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
                                        border: "hsl(var(--border))",
                                        input: "hsl(var(--input))",
                                        ring: "hsl(var(--ring))",
                                        chart: {
                                            "1": "hsl(var(--chart-1))",
                                            "2": "hsl(var(--chart-2))",
                                            "3": "hsl(var(--chart-3))",
                                            "4": "hsl(var(--chart-4))",
                                            "5": "hsl(var(--chart-5))"
                                        }
                                    },
                                    borderRadius: {
                                        lg: "var(--radius)",
                                        md: "calc(var(--radius) - 2px)",
                                        sm: "calc(var(--radius) - 4px)"
                                    },
                                    keyframes: {
                                        "static-noise-fade": {
                                            "0%": { opacity: "1" },
                                            "100%": { opacity: "0" }
                                        }
                                    },
                                    animation: {
                                        "static-noise": "static-noise-fade 0.8s ease-in-out forwards"
                                    }
                                }
                            }
                        }
                    },
                    cssVars: {
                        light: {
                            background: "35 50% 95.29%",
                            foreground: "240 10% 3.9%",
                            card: "35 50% 95.29%",
                            "card-foreground": "240 10% 3.9%",
                            popover: "35 50% 95.29%",
                            "popover-foreground": "240 10% 3.9%",
                            primary: "240 5.9% 10%",
                            "primary-foreground": "0 0% 98%",
                            secondary: "35 30% 90%",
                            "secondary-foreground": "240 5.9% 10%",
                            muted: "35 30% 90%",
                            "muted-foreground": "35 10% 45%",
                            accent: "35 30% 90%",
                            "accent-foreground": "240 5.9% 10%",
                            destructive: "0 84.2% 60.2%",
                            "destructive-foreground": "0 0% 98%",
                            border: "35 25% 85%",
                            input: "35 25% 85%",
                            ring: "240 10% 3.9%",
                            radius: "0.5rem",
                            "chart-1": "12 76% 61%",
                            "chart-2": "173 58% 39%",
                            "chart-3": "197 37% 24%",
                            "chart-4": "43 74% 66%",
                            "chart-5": "27 87% 67%"
                        },
                        dark: {
                            background: "240 8.25% 6.84%",
                            foreground: "0 0% 98%",
                            card: "240 8.25% 6.84%",
                            "card-foreground": "0 0% 98%",
                            popover: "240 8.25% 6.84%",
                            "popover-foreground": "0 0% 98%",
                            primary: "0 0% 98%",
                            "primary-foreground": "240 5.9% 10%",
                            secondary: "240 3.7% 15.9%",
                            "secondary-foreground": "0 0% 98%",
                            muted: "240 3.7% 15.9%",
                            "muted-foreground": "240 5% 64.9%",
                            accent: "240 3.7% 15.9%",
                            "accent-foreground": "0 0% 98%",
                            destructive: "0 62.8% 30.6%",
                            "destructive-foreground": "0 0% 98%",
                            border: "240 3.7% 15.9%",
                            input: "240 3.7% 15.9%",
                            ring: "240 4.9% 83.9%",
                            "chart-1": "220 70% 50%",
                            "chart-2": "160 60% 45%",
                            "chart-3": "30 80% 55%",
                            "chart-4": "280 65% 60%",
                            "chart-5": "340 75% 55%"
                        }
                    },
                    files: allFiles
                };

                registryItems.push({
                    name: registryItem.name,
                    title: registryItem.title,
                    description: registryItem.description,
                    dependencies: registryItem.dependencies,
                    registryDependencies: registryItem.registryDependencies,
                    type: registryItem.type,
                    files: registryItem.files
                });

                const outputPath = path.join(PUBLIC_REGISTRY_DIR, `${experimentName}.json`);
                await fs.writeFile(outputPath, JSON.stringify(registryItem, null, 2));
                console.log(`✅ Generated registry file for: ${experimentName}`);
            }
        }

        // Also generate an index.json to index all available components
        await fs.writeFile(path.join(PUBLIC_REGISTRY_DIR, "index.json"), JSON.stringify(registryItems, null, 2));
        console.log(`✅ Generated registry index at public/registry/index.json`);

        console.log(`🚀 Registry generation complete. Generated ${registryItems.length} items.`);
    } catch (error) {
        console.error("❌ Failed to generate registry:", error);
        process.exit(1);
    }
}

generateRegistry();

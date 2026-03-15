#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeIfChanged } from "./lib/write-if-changed.mjs";
import { SITE_URL } from "./lib/site-config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const APP_EXPERIMENTS_DIR = path.join(ROOT_DIR, "src", "app", "experiments");
const COMPONENTS_EXPERIMENTS_DIR = path.join(
  ROOT_DIR,
  "src",
  "components",
  "experiments"
);
const UI_DIR = path.join(ROOT_DIR, "src", "components", "ui");
const COLLECTED_DIR = path.join(ROOT_DIR, "src", "components", "collected");
const HOOKS_DIR = path.join(ROOT_DIR, "src", "hooks");
const MDX_DIR = path.join(ROOT_DIR, "src", "components", "mdx");
const ASSET_BASE_URL = SITE_URL;

const EXCLUDE_EXPERIMENTS = ["3-d-basketball-court-hero"];

const SHARED_TAILWIND = {
  config: {
    theme: {
      extend: {
        colors: {
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          chart: {
            1: "hsl(var(--chart-1))",
            2: "hsl(var(--chart-2))",
            3: "hsl(var(--chart-3))",
            4: "hsl(var(--chart-4))",
            5: "hsl(var(--chart-5))",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: {
          "static-noise-fade": {
            "0%": { opacity: "1" },
            "100%": { opacity: "0" },
          },
        },
        animation: {
          "static-noise": "static-noise-fade 0.8s ease-in-out forwards",
        },
      },
    },
  },
};

const SHARED_CSS_VARS = {
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
    "chart-5": "27 87% 67%",
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
    "chart-5": "340 75% 55%",
  },
};

// ---------------------------------------------------------------------------
// Import analysis utilities (ported from generate-registry.mjs)
// ---------------------------------------------------------------------------

function extractImports(content) {
  const importRegex = /(?:import|export)\s+.*?from\s+['"](.*?)['"]/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function categorizeImport(importPath) {
  if (importPath.startsWith("@/components/ui/")) {
    const parts = importPath.split("/");
    const componentName = parts.at(-1).replace(/\.tsx?$/, "");
    return { type: "registry", name: componentName };
  }

  if (importPath.startsWith("@/hooks/")) {
    const hookName = importPath
      .split("/")
      .at(-1)
      .replace(/\.tsx?$/, "");
    return { type: "registry", name: toKebabCase(hookName) };
  }

  if (
    importPath.startsWith(".") ||
    importPath.startsWith("@/") ||
    importPath.startsWith("~/")
  ) {
    return { type: "local", path: importPath };
  }

  return { type: "npm", name: importPath };
}

function inferFileType(filePath, content) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath);

  if ([".glsl", ".frag", ".vert"].includes(ext)) {
    return "registry:file";
  }

  const relDir = path.dirname(filePath);
  if (/[\\/]hooks[\\/]/.test(relDir) || basename.startsWith("use")) {
    return "registry:hook";
  }
  if (/[\\/](lib|utils)[\\/]/.test(relDir)) {
    return "registry:lib";
  }

  if ([".tsx", ".jsx"].includes(ext)) {
    const hasJSX = /<[A-Z]/.test(content) || /return\s*\(?\s*</.test(content);
    const hasCapitalExport =
      /export\s+(default\s+)?(?:function|const)\s+[A-Z]/.test(content);
    if (hasJSX || hasCapitalExport) {
      return "registry:component";
    }
  }

  return "registry:file";
}

async function getAllComponentFiles(dirPath) {
  let results = [];
  try {
    const list = await fs.readdir(dirPath, { withFileTypes: true });
    for (const file of list) {
      if (file.name.startsWith(".") || file.name.includes(".test.")) {
        continue;
      }

      const fullPath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        results = results.concat(await getAllComponentFiles(fullPath));
      } else if (file.name.match(/\.(tsx?|jsx?|glsl|frag|vert)$/)) {
        results.push(fullPath);
      }
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      return [];
    }
    throw e;
  }
  return results;
}

async function resolveImportPath(basePath) {
  const possibleExtensions = [".tsx", ".ts", ".jsx", ".js"];

  const fileResults = await Promise.all(
    possibleExtensions.map((ext) =>
      fs
        .stat(`${basePath}${ext}`)
        .then((s) => (s.isFile() ? ext : null))
        .catch(() => null)
    )
  );
  const foundExt = fileResults.find((r) => r !== null);
  if (foundExt) {
    return `${basePath}${foundExt}`;
  }

  const isDir = await fs
    .stat(basePath)
    .then((s) => s.isDirectory())
    .catch(() => false);
  if (isDir) {
    const indexResults = await Promise.all(
      possibleExtensions.map((ext) =>
        fs
          .stat(path.join(basePath, `index${ext}`))
          .then((s) => (s.isFile() ? ext : null))
          .catch(() => null)
      )
    );
    const foundIdx = indexResults.find((r) => r !== null);
    if (foundIdx) {
      return path.join(basePath, `index${foundIdx}`);
    }
  }

  return null;
}

async function resolveLocalFiles(startFile) {
  const fileQueue = [startFile];
  const processedFiles = new Set();
  const resolvedFiles = [];
  const npmDependencies = new Set();
  const registryDependencies = new Set();

  while (fileQueue.length > 0) {
    const currentFile = fileQueue.shift();
    if (processedFiles.has(currentFile)) {
      continue;
    }
    processedFiles.add(currentFile);

    try {
      let content = await fs.readFile(currentFile, "utf-8");
      const relativeToComponents = path.relative(
        path.join(ROOT_DIR, "src", "components"),
        currentFile
      );

      content = content.replace(
        /(['"`])\/experiments\//g,
        `$1${ASSET_BASE_URL}/experiments/`
      );

      resolvedFiles.push({
        absolutePath: currentFile,
        name: path.basename(currentFile),
        relativePath: relativeToComponents,
        content,
      });

      const imports = extractImports(content);
      for (const imp of imports) {
        const categorized = categorizeImport(imp);
        if (categorized.type === "npm") {
          let rootDep = categorized.name;
          if (rootDep.startsWith("@")) {
            const parts = rootDep.split("/");
            if (parts.length >= 2) {
              rootDep = `${parts[0]}/${parts[1]}`;
            }
          } else {
            rootDep = rootDep.split("/")[0];
          }
          if (
            !(rootDep.startsWith("next") || rootDep.startsWith("react")) &&
            rootDep !== "three/examples" &&
            !rootDep.startsWith("three-stdlib")
          ) {
            npmDependencies.add(rootDep);
          }
        } else if (categorized.type === "registry") {
          registryDependencies.add(categorized.name);
        } else if (categorized.type === "local") {
          let resolvedPath = null;

          if (categorized.path.startsWith(".")) {
            const currentDir = path.dirname(currentFile);
            const resolvedDir = path.resolve(currentDir, categorized.path);
            resolvedPath = await resolveImportPath(resolvedDir);
          } else if (categorized.path.startsWith("@/components/experiments/")) {
            const relativePath = categorized.path.replace("@/components/", "");
            const fullPathBase = path.join(
              ROOT_DIR,
              "src",
              "components",
              relativePath
            );
            resolvedPath = await resolveImportPath(fullPathBase);
          }

          if (resolvedPath) {
            fileQueue.push(resolvedPath);
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
    registryDependencies: Array.from(registryDependencies),
  };
}

// ---------------------------------------------------------------------------
// Config loading
// ---------------------------------------------------------------------------

async function loadConfig() {
  const configPath = path.join(ROOT_DIR, "registry.config.json");
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Kebab-case helper
// ---------------------------------------------------------------------------

async function extractJSDocDescription(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const jsdocMatch = content.match(/\/\*\*\s*\n(?:\s*\*[^\n]*\n)*?\s*\*\//);
    if (!jsdocMatch) {
      return null;
    }
    const descMatch = jsdocMatch[0].match(/@description\s+(.+)/);
    if (descMatch) {
      return descMatch[1].trim();
    }
    const lines = jsdocMatch[0]
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").trim())
      .filter((l) => l && !l.startsWith("@") && l !== "/**" && l !== "*/");
    return lines[0] || null;
  } catch {
    return null;
  }
}

function toKebabCase(str) {
  return str
    .replace(/\.tsx?$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Shared-token detection (determines whether an item needs razi-style)
// ---------------------------------------------------------------------------

const SEMANTIC_TOKEN_PATTERN = new RegExp(
  [
    "(?:bg|text|border|ring|outline|shadow|divide|from|via|to|placeholder|caret|fill|stroke|decoration)-(?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|input|border|ring)",
    "(?:bg|text|border|fill|stroke)-chart-[1-5]",
    "var\\(--(?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|radius|chart-[1-5])(?:-foreground)?\\)",
    "hsl\\(var\\(--(?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|chart-[1-5])",
    "animate-static-noise",
  ].join("|")
);

function usesSharedTokens(resolvedFiles) {
  return resolvedFiles.some((f) => SEMANTIC_TOKEN_PATTERN.test(f.content));
}

// ---------------------------------------------------------------------------
// Scanners
// ---------------------------------------------------------------------------

async function scanExperiments() {
  const items = [];
  const experimentDirs = await fs.readdir(APP_EXPERIMENTS_DIR, {
    withFileTypes: true,
  });

  for (const dir of experimentDirs) {
    if (!(dir.isDirectory() && dir.name.startsWith("("))) {
      continue;
    }

    const experimentName = dir.name.replace("(", "").replace(")", "");

    if (EXCLUDE_EXPERIMENTS.includes(experimentName)) {
      console.log(`  Skipping excluded experiment: ${experimentName}`);
      continue;
    }

    let metadata = {
      title: experimentName,
      description: `Component for ${experimentName}`,
    };
    try {
      const metaPath = path.join(
        APP_EXPERIMENTS_DIR,
        dir.name,
        "experiment.json"
      );
      const metaContent = await fs.readFile(metaPath, "utf-8");
      metadata = JSON.parse(metaContent);
    } catch {
      // No experiment.json -- use defaults
    }

    if (metadata.status === "wip") {
      console.log(`  Skipping wip experiment: ${experimentName}`);
      continue;
    }

    const listing = metadata.listing || "public";

    const componentDir = path.join(COMPONENTS_EXPERIMENTS_DIR, experimentName);
    const componentFiles = await getAllComponentFiles(componentDir);

    if (componentFiles.length === 0) {
      console.log(
        `  Skipping ${experimentName}: no component files in ${componentDir}`
      );
      continue;
    }

    const allFiles = [];
    const allResolvedFiles = [];
    const seenAbsolutePaths = new Set();
    const allNpmDeps = new Set();
    const allRegistryDeps = new Set();

    for (const startFile of componentFiles) {
      const result = await resolveLocalFiles(startFile);
      for (const f of result.files) {
        const resolved = path.resolve(f.absolutePath);
        if (seenAbsolutePaths.has(resolved)) {
          continue;
        }
        seenAbsolutePaths.add(resolved);
        allResolvedFiles.push(f);

        const fileType = inferFileType(f.absolutePath, f.content);
        allFiles.push({
          path: path.relative(ROOT_DIR, f.absolutePath),
          type: fileType,
        });
      }
      for (const d of result.dependencies) {
        allNpmDeps.add(d);
      }
      for (const d of result.registryDependencies) {
        allRegistryDeps.add(d);
      }
    }

    if (allFiles.length === 0) {
      continue;
    }

    const isMultiFile = allFiles.length > 1;
    const itemType = isMultiFile ? "registry:block" : "registry:component";
    const regDeps = Array.from(allRegistryDeps);
    if (usesSharedTokens(allResolvedFiles)) {
      regDeps.push("razi-style");
    }

    const posterField = metadata.poster || metadata.image || null;
    const videoField = metadata.video || null;

    items.push({
      name: experimentName,
      type: itemType,
      title: metadata.title,
      description: metadata.description,
      category: listing === "registry" ? "collected" : "experiments",
      registryDependencies: regDeps,
      dependencies: Array.from(allNpmDeps),
      files: allFiles,
      meta: {
        tags: metadata.tags || [],
        tech: metadata.tech || [],
        status: metadata.status || "shipped",
        poster: posterField,
        video: videoField,
        created: metadata.created || null,
      },
    });
  }

  return items;
}

async function scanSharedUI() {
  const items = [];
  let entries;
  try {
    entries = await fs.readdir(UI_DIR, { withFileTypes: true });
  } catch {
    return items;
  }

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith(".tsx")) {
      continue;
    }
    if (entry.name.includes(".test.")) {
      continue;
    }

    const filePath = path.join(UI_DIR, entry.name);
    const name = toKebabCase(entry.name);

    const result = await resolveLocalFiles(filePath);

    const files = result.files.map((f) => ({
      path: path.relative(ROOT_DIR, f.absolutePath),
      type: inferFileType(f.absolutePath, f.content),
    }));

    const jsdocDesc = await extractJSDocDescription(filePath);
    const componentTitle = entry.name.replace(/\.tsx$/, "");

    const regDeps = [...result.registryDependencies];
    if (usesSharedTokens(result.files)) {
      regDeps.push("razi-style");
    }

    items.push({
      name,
      type: "registry:component",
      title: componentTitle,
      description: jsdocDesc || `${componentTitle} component`,
      category: "components",
      registryDependencies: regDeps,
      dependencies: result.dependencies,
      files,
      meta: {},
    });
  }

  return items;
}

async function scanHooks() {
  const items = [];
  let entries;
  try {
    entries = await fs.readdir(HOOKS_DIR, { withFileTypes: true });
  } catch {
    return items;
  }

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith(".ts")) {
      continue;
    }
    if (entry.name.includes(".test.")) {
      continue;
    }

    const filePath = path.join(HOOKS_DIR, entry.name);
    const name = toKebabCase(entry.name);

    const result = await resolveLocalFiles(filePath);

    const files = result.files.map((f) => ({
      path: path.relative(ROOT_DIR, f.absolutePath),
      type: inferFileType(f.absolutePath, f.content),
    }));

    const jsdocDesc = await extractJSDocDescription(filePath);
    const hookTitle = entry.name.replace(/\.ts$/, "");

    const regDeps = [...result.registryDependencies];
    if (usesSharedTokens(result.files)) {
      regDeps.push("razi-style");
    }

    items.push({
      name,
      type: "registry:hook",
      title: hookTitle,
      description: jsdocDesc || `${hookTitle} hook`,
      category: "hooks",
      registryDependencies: regDeps,
      dependencies: result.dependencies,
      files,
      meta: {},
    });
  }

  return items;
}

async function scanUtilities(config) {
  const items = [];
  const utilPaths = config?.scan?.utilities;
  if (!Array.isArray(utilPaths) || utilPaths.length === 0) {
    return items;
  }

  for (const relPath of utilPaths) {
    const filePath = path.join(ROOT_DIR, relPath);
    try {
      await fs.stat(filePath);
    } catch {
      console.log(`  Skipping utility (not found): ${relPath}`);
      continue;
    }

    const name = toKebabCase(path.basename(filePath));
    const result = await resolveLocalFiles(filePath);

    const files = result.files.map((f) => ({
      path: path.relative(ROOT_DIR, f.absolutePath),
      type: inferFileType(f.absolutePath, f.content),
    }));

    const jsdocDesc = await extractJSDocDescription(filePath);
    const utilTitle = path.basename(filePath).replace(/\.tsx?$/, "");

    const regDeps = [...result.registryDependencies];
    if (usesSharedTokens(result.files)) {
      regDeps.push("razi-style");
    }

    items.push({
      name,
      type: "registry:lib",
      title: utilTitle,
      description: jsdocDesc || `${utilTitle} utility`,
      category: "utilities",
      registryDependencies: regDeps,
      dependencies: result.dependencies,
      files,
      meta: {},
    });
  }

  return items;
}

async function scanCollected() {
  const items = [];
  let entries;
  try {
    entries = await fs.readdir(COLLECTED_DIR, { withFileTypes: true });
  } catch {
    return items;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name.startsWith(".")) {
      continue;
    }

    const folderPath = path.join(COLLECTED_DIR, entry.name);

    const libraryJsonPath = path.join(folderPath, "library.json");
    let isLibrary = false;
    try {
      const libraryData = JSON.parse(
        await fs.readFile(libraryJsonPath, "utf-8")
      );
      if (
        libraryData.type === "library" &&
        Array.isArray(libraryData.components)
      ) {
        isLibrary = true;
        for (const comp of libraryData.components) {
          items.push({
            name: `${entry.name}--${comp.name}`,
            type: "registry:component",
            title: comp.title || comp.name,
            description: comp.description || "",
            category: "collected",
            files: [],
            dependencies: [],
            registryDependencies: [],
            meta: {
              reference: true,
              source: comp.url || "",
              library: libraryData.title || entry.name,
              libraryUrl: libraryData.url || "",
              group: comp.group || "",
              tags: comp.tags || [],
            },
          });
        }
      }
    } catch {
      /* no library.json or invalid -- try component mode */
    }

    if (isLibrary) {
      continue;
    }

    const folderEntries = await fs.readdir(folderPath, { withFileTypes: true });
    const tsxFiles = folderEntries
      .filter(
        (f) =>
          f.isFile() &&
          f.name.endsWith(".tsx") &&
          !f.name.includes(".test.") &&
          !f.name.includes(".story.")
      )
      .map((f) => f.name);

    if (tsxFiles.length === 0) {
      continue;
    }

    const entryFile = tsxFiles[0];
    const entryFilePath = path.join(folderPath, entryFile);
    const result = await resolveLocalFiles(entryFilePath);

    // Include co-located CSS files (not followed by resolveLocalFiles)
    const cssFiles = folderEntries
      .filter((f) => f.isFile() && f.name.endsWith(".css"))
      .map((f) => f.name);
    for (const cssFile of cssFiles) {
      const cssPath = path.join(folderPath, cssFile);
      const alreadyIncluded = result.files.some(
        (f) => f.absolutePath === cssPath
      );
      if (!alreadyIncluded) {
        result.files.push({
          absolutePath: cssPath,
          name: cssFile,
          relativePath: path.relative(
            path.join(ROOT_DIR, "src", "components"),
            cssPath
          ),
          content: await fs.readFile(cssPath, "utf-8"),
        });
      }
    }

    const files = result.files.map((f) => ({
      path: path.relative(ROOT_DIR, f.absolutePath),
      type: inferFileType(f.absolutePath, f.content),
    }));

    let metaData = {};
    try {
      const metaPath = path.join(folderPath, "meta.json");
      metaData = JSON.parse(await fs.readFile(metaPath, "utf-8"));
    } catch {
      /* no meta.json */
    }

    const jsdocDesc = await extractJSDocDescription(entryFilePath);
    const componentTitle = entryFile.replace(/\.tsx$/, "");

    const isMultiFile = files.length > 1;
    const itemType = isMultiFile ? "registry:block" : "registry:component";
    const regDeps = [...result.registryDependencies];
    if (usesSharedTokens(result.files)) {
      regDeps.push("razi-style");
    }

    items.push({
      name: entry.name,
      type: itemType,
      title: metaData.title || componentTitle,
      description:
        metaData.description || jsdocDesc || `${componentTitle} component`,
      category: "collected",
      registryDependencies: regDeps,
      dependencies: result.dependencies,
      files,
      meta: {
        source: metaData.source || "",
        author: metaData.author || "",
        license: metaData.license || "",
        tags: metaData.tags || [],
        tech: metaData.tech || [],
        previewUrl: `/collected/${entry.name}`,
      },
    });
  }

  return items;
}

async function scanMdx() {
  const items = [];
  let entries;
  try {
    entries = await fs.readdir(MDX_DIR, { withFileTypes: true });
  } catch {
    return items;
  }

  const EXCLUDE_FILES = new Set(["components.tsx", "index.ts"]);

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name.includes(".test.")) {
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".tsx")) {
      if (EXCLUDE_FILES.has(entry.name)) {
        continue;
      }

      const filePath = path.join(MDX_DIR, entry.name);
      const name = `mdx-${toKebabCase(entry.name)}`;
      const result = await resolveLocalFiles(filePath);

      const cssFiles = [];
      for (const f of result.files) {
        const content = await fs
          .readFile(f.absolutePath, "utf-8")
          .catch(() => "");
        const cssImports = [...content.matchAll(/import\s+['"](.+\.css)['"]/g)];
        for (const m of cssImports) {
          const cssPath = path.resolve(path.dirname(f.absolutePath), m[1]);
          const alreadyIncluded =
            result.files.some((rf) => rf.absolutePath === cssPath) ||
            cssFiles.some((cf) => cf === cssPath);
          if (!alreadyIncluded) {
            cssFiles.push(cssPath);
          }
        }
      }

      for (const cssPath of cssFiles) {
        try {
          const cssContent = await fs.readFile(cssPath, "utf-8");
          result.files.push({
            absolutePath: cssPath,
            name: path.basename(cssPath),
            relativePath: path.relative(
              path.join(ROOT_DIR, "src", "components"),
              cssPath
            ),
            content: cssContent,
          });
        } catch {
          /* css file not found */
        }
      }

      const files = result.files.map((f) => ({
        path: path.relative(ROOT_DIR, f.absolutePath),
        type: f.absolutePath.endsWith(".css")
          ? "registry:file"
          : inferFileType(f.absolutePath, f.content),
      }));

      const isMultiFile = files.length > 1;
      const jsdocDesc = await extractJSDocDescription(filePath);
      const componentTitle = entry.name.replace(/\.tsx$/, "");

      const regDeps = [...result.registryDependencies];
      if (usesSharedTokens(result.files)) {
        regDeps.push("razi-style");
      }

      items.push({
        name,
        type: isMultiFile ? "registry:block" : "registry:component",
        title: componentTitle,
        description: jsdocDesc || `${componentTitle} MDX component`,
        category: "mdx",
        registryDependencies: regDeps,
        dependencies: result.dependencies,
        files,
        meta: {},
      });
    }
  }

  const controlsDir = path.join(MDX_DIR, "controls");
  const controlsIndex = path.join(controlsDir, "index.ts");
  try {
    await fs.stat(controlsIndex);
  } catch {
    return items;
  }

  const result = await resolveLocalFiles(controlsIndex);

  const controlsEntries = await fs.readdir(controlsDir, {
    withFileTypes: true,
  });
  const cssFiles = controlsEntries
    .filter((f) => f.isFile() && f.name.endsWith(".css"))
    .map((f) => f.name);

  for (const cssFile of cssFiles) {
    const cssPath = path.join(controlsDir, cssFile);
    const alreadyIncluded = result.files.some(
      (f) => f.absolutePath === cssPath
    );
    if (!alreadyIncluded) {
      result.files.push({
        absolutePath: cssPath,
        name: cssFile,
        relativePath: path.relative(
          path.join(ROOT_DIR, "src", "components"),
          cssPath
        ),
        content: await fs.readFile(cssPath, "utf-8"),
      });
    }
  }

  const files = result.files.map((f) => ({
    path: path.relative(ROOT_DIR, f.absolutePath),
    type: f.absolutePath.endsWith(".css")
      ? "registry:file"
      : inferFileType(f.absolutePath, f.content),
  }));

  const jsdocDesc = await extractJSDocDescription(controlsIndex);

  const controlsRegDeps = [...result.registryDependencies];
  if (usesSharedTokens(result.files)) {
    controlsRegDeps.push("razi-style");
  }

  items.push({
    name: "mdx-controls",
    type: "registry:block",
    title: "MDX Controls",
    description:
      jsdocDesc ||
      "Interactive control primitives for MDX articles (Checkbox, Switch, Radio, Range, ControlGroup)",
    category: "mdx",
    registryDependencies: controlsRegDeps,
    dependencies: result.dependencies,
    files,
    meta: {},
  });

  return items;
}

// ---------------------------------------------------------------------------
// Curation
// ---------------------------------------------------------------------------

function applyCuration(items, config) {
  if (!config) {
    return items;
  }

  const hidden = new Set(config.hidden || []);
  const featured = new Set(config.featured || []);
  const overrides = config.overrides || {};

  return items
    .filter((item) => !hidden.has(item.name))
    .map((item) => {
      const updated = { ...item };
      if (featured.has(item.name)) {
        updated.meta = { ...updated.meta, featured: true };
      }
      const override = overrides[item.name];
      if (override) {
        if (override.description) {
          updated.description = override.description;
        }
        if (override.category) {
          updated.category = override.category;
        }
      }
      return updated;
    });
}

// ---------------------------------------------------------------------------
// Razi-style item
// ---------------------------------------------------------------------------

function createRaziStyleItem() {
  return {
    name: "razi-style",
    type: "registry:style",
    title: "Razi Style",
    description:
      "Shared design tokens and CSS variables for Razi's experiments",
    category: "styles",
    tailwind: SHARED_TAILWIND,
    cssVars: SHARED_CSS_VARS,
    files: [],
    meta: {},
  };
}

// ---------------------------------------------------------------------------
// Collected component map generation
// ---------------------------------------------------------------------------

function toComponentName(fileName) {
  return fileName.replace(/\.tsx$/, "");
}

async function generateCollectedMap(collectedItems) {
  const ported = collectedItems.filter(
    (item) => !item.meta?.reference && item.files?.length > 0
  );

  if (ported.length === 0) {
    return;
  }

  const entries = [];
  for (const item of ported) {
    const tsxFile = item.files.find((f) => f.path.endsWith(".tsx"));
    if (!tsxFile) {
      continue;
    }
    const fileName = path.basename(tsxFile.path);
    const componentName = toComponentName(fileName);
    entries.push({ slug: item.name, componentName });
  }

  entries.sort((a, b) => a.slug.localeCompare(b.slug));

  const lines = [
    "/**",
    " * Auto-generated collected component map.",
    " * Regenerated by `npm run generate:registry` -- do not edit manually.",
    " *",
    " * @generated",
    " */",
    'import type { ComponentType } from "react";',
    "",
    "export interface CollectedEntry {",
    "  component: () => Promise<{ default: ComponentType }>;",
    "}",
    "",
    "export const COLLECTED_COMPONENTS: Record<string, CollectedEntry> = {",
  ];

  for (const { slug, componentName } of entries) {
    lines.push(`  "${slug}": {`);
    lines.push(`    component: () => import("./${slug}/${componentName}"),`);
    lines.push("  },");
  }

  lines.push("};", "");
  lines.push(
    "export const COLLECTED_SLUGS = Object.keys(COLLECTED_COMPONENTS);"
  );
  lines.push("");

  const mapPath = path.join(COLLECTED_DIR, "_map.ts");
  const mapWrote = await writeIfChanged(mapPath, lines.join("\n"));
  console.log(
    `  ${mapWrote ? "Generated" : "Unchanged"} _map.ts (${entries.length} components)`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const config = await loadConfig();
  const scanExperimentsEnabled = config?.scan?.experiments !== false;
  const scanSharedUIEnabled = config?.scan?.sharedUI === true;
  const scanCollectedEnabled = config?.scan?.collected === true;
  const scanHooksEnabled = config?.scan?.hooks === true;
  const scanMdxEnabled = config?.scan?.mdx === true;

  console.log("Registry discovery starting...\n");

  let experimentItems = [];
  let uiItems = [];
  let collectedItems = [];
  let hookItems = [];
  let mdxItems = [];
  let utilItems = [];

  if (scanExperimentsEnabled) {
    console.log("Scanning experiments...");
    experimentItems = await scanExperiments();
    console.log(`  Found ${experimentItems.length} experiments`);
  }

  if (scanSharedUIEnabled) {
    console.log("Scanning shared UI...");
    uiItems = await scanSharedUI();
    console.log(`  Found ${uiItems.length} components`);
  }

  if (scanCollectedEnabled) {
    console.log("Scanning collected...");
    collectedItems = await scanCollected();
    console.log(`  Found ${collectedItems.length} collected`);
    await generateCollectedMap(collectedItems);
  }

  if (scanHooksEnabled) {
    console.log("Scanning hooks...");
    hookItems = await scanHooks();
    console.log(`  Found ${hookItems.length} hooks`);
  }

  if (scanMdxEnabled) {
    console.log("Scanning MDX components...");
    mdxItems = await scanMdx();
    console.log(`  Found ${mdxItems.length} MDX components`);
  }

  if (config) {
    console.log("Scanning utilities...");
    utilItems = await scanUtilities(config);
    console.log(`  Found ${utilItems.length} utilities`);
  }

  let allItems = [
    ...experimentItems,
    ...uiItems,
    ...collectedItems,
    ...hookItems,
    ...mdxItems,
    ...utilItems,
  ];

  allItems = applyCuration(allItems, config);

  allItems.push(createRaziStyleItem());

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "razi-experiments",
    homepage: SITE_URL,
    items: allItems,
  };

  const outputPath = path.join(ROOT_DIR, "registry.json");
  const registryWrote = await writeIfChanged(
    outputPath,
    JSON.stringify(registry, null, 2)
  );

  const expCount = experimentItems.length;
  const uiCount = uiItems.length;
  const collectedCount = collectedItems.length;
  const hookCount = hookItems.length;
  const mdxCount = mdxItems.length;
  const utilCount = utilItems.length;
  const total = allItems.length;

  console.log(
    `\nDiscovered ${expCount} experiments, ${uiCount} components, ${collectedCount} collected, ${hookCount} hooks, ${mdxCount} mdx, ${utilCount} utilities. Total: ${total} items.`
  );
  console.log(
    `${registryWrote ? "Wrote" : "Unchanged"} registry.json (${total} items)`
  );
}

main().catch((error) => {
  console.error("Registry discovery failed:", error);
  process.exit(1);
});

# Web Dev Experiments

A personal playground for exploring UI interactions, shaders, and modern web development techniques.

## Purpose

The goal of this project is to provide a robust environment for rapid prototyping. It allows for the exploration of new ideas, libraries, and techniques without the overhead of setting up a new project every time, while ensuring that each experiment remains **strictly isolated** from others.

## Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher

## Project Structure

The project is organized to separate the main application dashboard from the isolated experiments.

```
experiments/
├── public/
│   └── experiments/          # Experiment assets (images, models)
├── src/
│   ├── app/
│   │   ├── (main)/           # Dashboard application routes
│   │   └── experiments/      # Isolated experiment routes
│   │       └── (group)/      # Route groups (opt-out of main layout)
│   ├── components/
│   │   ├── ui/               # Shared dashboard components (Shadcn)
│   │   └── experiments/      # Experiment-specific components
│   └── lib/                  # Shared utilities
├── scripts/                  # Automation scripts (cleanup, etc.)
└── plopfile.js               # Scaffolding generator
```

## Architecture

To ensure that experiments do not interfere with each other or the main application layout:

- **Isolated Environments**: Each experiment runs in its own route group.
- **Style Isolation**: The main application uses global styles (Tailwind, Shadcn), but experiments can opt-out or use their own isolated CSS to ensure a clean slate.
- **Component Independence**: Components are built specifically for their experiment, often developed in isolation using Storybook before integration.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS & Shadcn UI (Main Dashboard)
- **Animation**: Framer Motion
- **3D Graphics**: React Three Fiber / Three.js
- **Tooling**: Plop.js for scaffolding, Vitest for testing, Storybook for component development.

## Workflow & Automation

We use custom automation to streamline the creative process and maintain project cleanliness.

### 1. Scaffold a New Experiment (`plop.js`)
Instead of manually creating folders and files, we use a CLI generator to scaffold new experiments.
```bash
npm run new:experiment
```
This command:
- Prompts for an experiment name and description.
- Generates the route structure in `src/app/experiments`.
- Creates a dedicated component directory in `src/components/experiments`.
- **Creates a metadata file (`experiment.json`)** which allows the dashboard to automatically list the experiment.
- **Creates an asset directory** in `public/experiments/<name>` for images/models.
- Sets up initial Storybook stories.

### 2. Develop Components (Storybook)
Complex interactions are best built in isolation.
```bash
npm run storybook
```
We use Storybook to build and refine components without the noise of the full application context.

### 3. Integration
Once components are ready, they are assembled into the page file designated for that experiment.

### 4. Verification
Visit `http://localhost:3000/experiments/<experiment-name>` to see your creation live.

### 5. Cleanup
Experiments can be transient. If an idea doesn't work out or is no longer needed, it can be cleanly removed.
```bash
npm run delete:experiment <experiment-name>
```
This script removes all associated files (routes, components, public assets). Because the registry is dynamic, the experiment automatically disappears from the dashboard.

## Sharing Experiments (Component Registry)

This project features a **Shadcn-compatible Registry**, allowing you to share experiments as embeddable components that others can install via a single command.

### How it Works
The registry system automatically bundles experiment components, resolves their package dependencies (like `gsap`, `three`, `framer-motion`), and prepares a JSON manifest that complies with the `shadcn/ui` registry schema.

### 1. Generate the Registry
To refresh the registry manifests for all experiments:
```bash
npm run generate:registry
```
This generates individual JSON files in `public/registry/` and an `index.json` listing all shared experiments.

### 2. CDN & Asset Streaming
When a component is installed into a third-party project, its static assets (images, videos, SVGs in `public/experiments/`) are automatically pointed to the production CDN at `https://experiments.raztronaut.space`. 

> [!NOTE]
> This ensures that binary assets (MP4s, JPEGs) work instantly without requiring the installer to manually copy files into their own `public/` folder.

### 3. Installation
Any experiment in the registry can be installed into a Next.js project using the Shadcn CLI:

```bash
npx shadcn@latest add https://experiments.raztronaut.space/registry/<experiment-name>.json
```

For example, to install the Basketball Replay Center:
```bash
npx shadcn@latest add https://experiments.raztronaut.space/registry/basketball-replay-center.json
```

The CLI will:
1. Download the component files.
2. Resolve and install required NPM dependencies.
3. Merge necessary Tailwind configurations and CSS variables.
4. Rewrite public asset paths to stream from the CDN.

## Best Practices

- **Strict Isolation**: Do not import components from other experiments. Keep dependencies self-contained.
- **No Global Store Pollution**: Avoid adding experiment-specific state to global stores unless absolutely necessary.
- **Cleanups**: Use `useEffect` cleanups for event listeners, timers, or WebGL contexts to prevent memory leaks when navigating away.

## AI-Assisted Development

This project includes rules and workflows for AI coding assistants (like Antigravity, Cursor, GitHub Copilot Chat) that help maintain the isolation architecture automatically.

### Available Workflows

| Command | Purpose |
|---------|---------|
| `/new-experiment` | Scaffold a new experiment with all required files |
| `/develop-experiment` | Work on an existing experiment with isolation guardrails |
| `/cleanup-experiment` | Safely remove an experiment and all its files |
| `/add-experiment-component` | Add a new component within an experiment |
| `/add-experiment-assets` | Add images, 3D models, or other assets |

### What the AI Knows

The `.agent/` directory contains:
- **Rules** that enforce isolation (no cross-experiment imports, correct file locations)
- **Workflows** with code templates for common patterns (Framer Motion, React Three Fiber, etc.)

This means AI assistants will automatically:
- Use `npm run new:experiment` instead of manually creating files
- Place components in the correct experiment directory
- Follow cleanup patterns for `useEffect` hooks
- Avoid modifying shared code for experiment-specific needs

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) for the main dashboard.

3. **Run component workbench (Storybook)**:
   ```bash
   npm run storybook
   ```

4. **Run tests**:
   ```bash
   npm run test
   ```

## Adding Previews & Posters

To add a hover preview (image or video) to your experiment and ensure optimal performance:

1.  **Add Asset**: Place your video (`.mp4`) or image (`.png`, `.jpg`) in `public/experiments/<experiment-slug>/`.
2.  **Update Config**: Edit `src/app/experiments/(<experiment-slug>)/experiment.json`:

```json
{
  "image": "/experiments/<experiment-slug>/preview.png",
  "video": "/experiments/<experiment-slug>/preview.mp4",
  "poster": "/experiments/<experiment-slug>/poster.jpg"
}
```

3.  **Generate Poster (Automated)**:
    If you have added a video, run the following command to automatically extract the first frame as a `poster.jpg`. This is critical for performance and ensuring the Vercel deployment remains lightweight:
    ```bash
    npm run generate:posters
    ```

*Note: The website uses the poster image as a placeholder before the video loads to prevent layout shifts and excessive resource usage.*

## License

MIT

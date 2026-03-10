---
description: Work on an existing experiment following isolation rules
---

# Develop Existing Experiment Workflow

## Prerequisites
- Experiment already exists (created via `npm run new:experiment`)
- Know the experiment's kebab-case name

## Steps

1. **Verify experiment exists** by checking for the route group:
   ```
   src/app/experiments/(<experiment-name>)/
   ```
   If not found, use `/new-experiment` workflow instead.

2. **Understand the file boundaries** - ONLY modify files in:

   | Location | Purpose |
   |----------|---------|
   | `src/components/experiments/<name>/` | All component code |
   | `src/app/experiments/(<name>)/` | Route files, metadata |
   | `public/experiments/<name>/` | Static assets |

3. **For new components within this experiment**:
   - Create at `src/components/experiments/<name>/<NewComponent>.tsx`
   - Add `"use client"` if the component uses hooks, events, or browser APIs
   - Import only from allowed sources (see below)

4. **Allowed imports for experiment components**:
   ```tsx
   // ✅ ALLOWED
   import { cn } from "@/lib/utils";
   import { Button } from "@/components/ui/button";
   import SiblingComponent from "./SiblingComponent";
   import { motion } from "motion/react";
   import { Canvas } from "@react-three/fiber";
   
   // ❌ FORBIDDEN
   import Something from "@/components/experiments/other-experiment/Something";
   import { globalStore } from "@/lib/store"; // Don't pollute global state
   ```

5. **For static assets** (images, 3D models, fonts):
   - Place in `public/experiments/<name>/`
   - Reference as `/experiments/<name>/filename.ext`

6. **Toolkit integration** (when `includeToolkit` was selected during scaffolding):

   **Scroll experiments** (scrollytelling profile or any experiment with scroll-driven animation):
   ```tsx
   import { createUnifiedScroll } from "@/lib/toolkit/scroll";
   import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll";

   // In a useEffect or useLayoutEffect:
   const handle = createUnifiedScroll({ debug: isDebug });
   // handle.lenis for direct Lenis access
   // Cleanup: handle.destroy() in the effect's return
   ```
   This drives Lenis (priority -1) and GSAP (priority 0) from a single Tempus RAF loop. Do **not** use the old `gsap.ticker.add` pattern alongside this.

   **R3F experiments** (r3f-scene, r3f-shader profiles):
   ```tsx
   import { ExperimentCanvas } from "@/lib/toolkit/r3f";

   <ExperimentCanvas camera={{ position: [0, 0, 5], fov: 50 }}>
     {/* Scene content */}
   </ExperimentCanvas>
   ```
   Import `ExperimentCanvas` directly from `@/lib/toolkit/r3f` (not via the barrel) to avoid pulling R3F into non-3D experiments.

   **Mixed experiments** (scroll + 3D + interaction): See `.agents/profiles/mixed.md` for the layer-cake pattern and state bridging between DOM and R3F.

7. **Debug tools**:
   - `useDevControls(folder, schema)` wraps Leva for production-safe parameter tweaking. Dead-code eliminated in production by default.
   - `DevToolsInjector` is auto-included in every experiment layout. Append `?debug` to the URL for: GSDevTools (GSAP), device info overlay, and keyboard shortcuts (D=device, L=leva, H=hide GSDevTools).
   - R3F experiments also get `R3FDevToolsInjector` inside Canvas for r3f-perf metrics and scene inspection behind `?debug`.
   - Query `window.__experimentMetrics` from MCP browser tools for programmatic FPS/heap/CLS data.

8. **Development workflow**:
   ```bash
   # Run tests
   npm run test
   
   # Full preview
   # Visit http://localhost:3000/experiments/<name>
   # Append ?debug for dev tools overlay
   ```

9. **Before considering complete**:
   - [ ] All `useEffect` hooks have cleanup functions
   - [ ] No imports from other experiments
   - [ ] No modifications to files outside the experiment's directories
   - [ ] Error boundary catches failures gracefully
   - [ ] Toolkit cleanup called in effect returns (`handle.destroy()`, disposal of Three.js resources)
   - [ ] `prefers-reduced-motion` respected (use `gsap.set` for fallbacks, not early returns)

## Common Modifications

### Updating experiment.json metadata
```json
{
  "title": "Human-Readable Title",
  "description": "One-line description for dashboard",
  "slug": "kebab-case-url-slug",
  "created": "2025-01-15T00:00:00.000Z"
}
```

### Adding a new sub-component
```tsx
// src/components/experiments/my-exp/SubComponent.tsx
"use client";

import { cn } from "@/lib/utils";

interface SubComponentProps {
  className?: string;
  // ... props
}

export function SubComponent({ className, ...props }: SubComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      {/* content */}
    </div>
  );
}
```

### Adding CSS specific to the experiment
Create a CSS file in the component directory:
```css
/* src/components/experiments/my-exp/styles.css */
.my-experiment-specific-class {
  /* styles that won't leak */
}
```
Import in your component:
```tsx
import './styles.css';
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Styles leaking between experiments | Each experiment has isolated layout - verify `layout.tsx` exists |
| Import errors for @/ paths | Check `tsconfig.json` has correct path aliases |
| Component not updating | Try restarting dev server or clearing `.next` cache |
| Test failures | Ensure all async operations are properly mocked |

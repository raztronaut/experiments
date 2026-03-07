---
description: Create a new isolated experiment with all required scaffolding
---

# Create New Experiment Workflow

## Prerequisites
- Development server should be running (`npm run dev`)
- Know the experiment name (will be converted to kebab-case)

## Steps

// turbo
1. Run the scaffolding generator:
   ```bash
   npm run new:experiment
   ```
   When prompted:
   - **Name**: Enter a descriptive name (e.g., "fluid simulation", "parallax cards")
   - **Description**: Optional one-line description for the dashboard

2. The generator creates these files automatically:
   - `src/app/experiments/(kebab-name)/layout.tsx` - Isolated layout with own HTML root
   - `src/app/experiments/(kebab-name)/kebab-name/page.tsx` - Route page
   - `src/app/experiments/(kebab-name)/kebab-name/error.tsx` - Error boundary
   - `src/app/experiments/(kebab-name)/experiment.json` - Dashboard metadata
   - `src/components/experiments/kebab-name/PascalName.tsx` - Main component
   - `src/components/experiments/kebab-name/PascalName.test.tsx` - Test file
   - `public/experiments/kebab-name/.gitkeep` - Asset directory

3. Open the main component and start implementing:
   ```
   src/components/experiments/<name>/<PascalName>.tsx
   ```

4. Verify the experiment works:
   - Visit `http://localhost:3000` - should appear in dashboard
   - Visit `http://localhost:3000/experiments/<name>` - direct access

## Common Patterns

### Adding Interactivity
```tsx
"use client";

import { useState, useEffect } from 'react';

export default function MyExperiment() {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Setup code
    return () => {
      // ALWAYS cleanup: listeners, timers, WebGL contexts
    };
  }, []);
  
  return <div>...</div>;
}
```

### Using Motion
```tsx
"use client";

import { motion, AnimatePresence } from 'motion/react';

export default function MyExperiment() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      ...
    </motion.div>
  );
}
```

### Using React Three Fiber
```tsx
"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function MyExperiment() {
  return (
    <div className="w-full h-screen">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        {/* Your 3D content */}
      </Canvas>
    </div>
  );
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Experiment not in dashboard | Check `experiment.json` exists and has valid JSON |
| Styles leaking from main app | Verify layout.tsx has its own `<html>` and `<body>` tags |
| Component not rendering | Ensure `"use client"` directive is present for interactive components |
| Hot reload not working | Check for syntax errors in any experiment file |
---
description: Remove an experiment and all its associated files safely
---

# Cleanup Experiment Workflow

## When to Use
- Experiment idea didn't work out
- Experiment was a prototype that's no longer needed
- Consolidating experiments

## Prerequisites
- Know the exact experiment name (kebab-case, e.g., "fluid-sim" not "Fluid Sim")
- Confirm with user before proceeding (destructive action)

## Steps

1. **Confirm the experiment name** with the user. The name should match:
   - The folder name in `src/components/experiments/<name>/`
   - The route group name (without parentheses): `src/app/experiments/(<name>)/`

2. **Run the cleanup script**:
   ```bash
   npm run delete:experiment <experiment-name>
   ```
   
3. **When prompted for confirmation**, type `y` and press Enter.

4. **Verify cleanup was complete** - these directories should no longer exist:
   - `src/app/experiments/(<name>)/` ❌
   - `src/components/experiments/<name>/` ❌
   - `public/experiments/<name>/` ❌

5. **The dashboard auto-updates** - no manual changes needed to `src/app/(main)/page.tsx`

## What Gets Deleted

| Directory | Contents |
|-----------|----------|
| `src/app/experiments/(<name>)/` | layout.tsx, page.tsx, error.tsx, experiment.json |
| `src/components/experiments/<name>/` | All components and tests |
| `public/experiments/<name>/` | All static assets |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Experiment does not exist" error | Check exact spelling, use kebab-case |
| Deletion cancelled | Script requires explicit `y` confirmation |
| Stale references remain | Check for any manual imports outside experiment boundaries (shouldn't exist if rules were followed) |
| Dashboard still shows experiment | Clear `.next` cache and restart dev server |

## Recovery

If deleted by accident, use git to restore:
```bash
git checkout HEAD -- "src/app/experiments/(<name>)/"
git checkout HEAD -- src/components/experiments/<name>/
git checkout HEAD -- public/experiments/<name>/
```

Note: The parentheses in the path need to be escaped or quoted in most shells.

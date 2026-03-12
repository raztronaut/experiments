# Blank Profile

> Activate when `experiment.json` has `"profile": "blank"` or no profile is specified.

## Behavioral Mode
**No opinions, minimal scaffolding.** The blank profile is a clean slate for experiments that don't fit an existing profile or where the developer wants full control over the stack from the start.

## Priority Ordering
1. Simplicity (no unnecessary abstractions)
2. Flexibility (no locked-in patterns)
3. Correctness (clean React lifecycle, proper cleanup)

## When to Use This Profile

Use blank when:
- Prototyping something that doesn't yet have a clear profile
- The experiment uses an unusual tech stack (e.g., pure SVG, Canvas 2D, web workers only)
- You plan to graduate to a specific profile later as the experiment takes shape

If you find yourself adding Lenis + GSAP, switch to `scrollytelling`. If adding R3F, switch to `r3f-scene` or `r3f-shader`. If combining multiple domains, switch to `mixed`.

## Template

The blank template provides a single `"use client"` component with no library imports. Add dependencies as needed.

## Checklist
- [ ] `"use client"` directive present if using hooks or browser APIs
- [ ] All `useEffect` hooks have cleanup functions
- [ ] No imports from other experiments

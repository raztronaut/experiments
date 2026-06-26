# AI Slop / Comments / Stubs Report

Scope: read-only audit of `src/` and `scripts/` against the AGENTS.md code-style rule
("Do NOT add comments that just narrate what the code does").

## Critical Assessment

The codebase is, on the whole, in good shape. There is no lorem ipsum, no
`throw new Error("not implemented")`, no emoji in comments, and no abandoned
LARP scaffolding masquerading as working code. The "placeholder" grep hits are
almost all legitimate — UI input `placeholder` props, an intentional
`ComponentPreviewPlaceholder` component, the `send-button` animated-placeholder
feature, and a deliberately-named morph-placeholder generation script.

What does exist is a thin layer of **narration comments** — single lines that
restate the very next statement (`// Define uniforms` above `const uniforms`,
`// Create the Shader Material` above a `shaderMaterial(...)` call). These are
textbook violations of the stated rule and add no information. They cluster in a
few older/ported experiments (`shader-landing`, `mountain-transition`,
`rabbithole-*`) rather than across the whole tree.

A second, smaller smell is **in-motion-work / dead-code residue**: commented-out
`import` lines and commented-out handler bodies left behind when the
theme-switch feature was disabled (`ThemeSwitch.tsx`, `SiteFooter.tsx`), plus a
couple of "for now, let's..." stream-of-consciousness notes that describe
intended-but-not-done work (`VisualiserLogic.ts`, `GlobalTracking.tsx`).

There are **no genuine code stubs** — the two `TODO` comments about the theme
toggle are honest, accurate descriptions of a deliberately-disabled feature and
should be kept (or lightly tightened), not deleted. The disabled `ThemeSwitch`
renders a real, non-interactive visual; it is intentional, not a broken stub.

Net: a low-risk cleanup. Delete the narration lines and dead commented-out
imports; rewrite a few comments that gesture at real intent but ramble; leave
the honest TODOs and any license/ported-source attributions alone.

## Recommendations

### Delete (pure narration / restating code / dead residue)

- **Confidence: High** — `src/components/experiments/shader-landing/useThreeShader.ts:79` `// Initialize camera` (restates `new THREE.Camera()`).
- **Confidence: High** — `src/components/experiments/shader-landing/useThreeShader.ts:83` `// Initialize scene` (restates `new THREE.Scene()`).
- **Confidence: High** — `src/components/experiments/shader-landing/useThreeShader.ts:86` `// Create geometry` (restates next line).
- **Confidence: High** — `src/components/experiments/shader-landing/useThreeShader.ts:89` `// Define uniforms` (restates `const uniforms = {`).
- **Confidence: High** — `src/components/experiments/shader-landing/useThreeShader.ts:95` `// Create material` (restates `new THREE.ShaderMaterial`).
- **Confidence: High** — `src/components/experiments/shader-landing/useThreeShader.ts:102` `// Create mesh and add to scene` (restates the two lines below).
- **Confidence: High** — `src/components/experiments/shader-landing/useThreeShader.ts:106` `// Initialize renderer` (restates `new THREE.WebGLRenderer()`).
- **Confidence: High** — `src/components/experiments/mountain-transition/Scene.tsx:14` `// Create the Shader Material`.
- **Confidence: High** — `src/components/experiments/mountain-transition/Scene.tsx:37` `// Define the properties required by the shader` (restates the `type` declaration).
- **Confidence: High** — `src/components/experiments/gravity-physics-ui-layout/DesktopWindow.tsx:42` `// Create the window body`.
- **Confidence: High** — `src/components/experiments/rabbithole-chat-preloader/Gallery.ts:63` `// Define your image paths - using the paths from the experiment structure`.
- **Confidence: High** — `src/components/experiments/send-button/ThemeSwitch.tsx:9-11` commented-out imports (`SwitchPrimitives`, `motion`, `useCallback`).
- **Confidence: High** — `src/components/experiments/send-button/ThemeSwitch.tsx:23-28` commented-out `handleCheckedChange` body (dead code; recoverable from git).
- **Confidence: High** — `src/components/ui/SiteFooter.tsx:4` commented-out `// import { useTheme } from "next-themes";`.
- **Confidence: Medium** — `src/components/ui/SiteFooter.tsx:14-18` commented-out `setTheme`/`toggleTheme` block (the TODO on line 13 already records intent; the dead code is redundant).
- **Confidence: Medium** — `src/components/experiments/send-button/AnimatedSendButton.tsx:61` `// Start the fly-away animation` and `:71` `// Show success state` and `:74` `// Reset to idle after displaying success` (restate `setState("sending"/"success"/"idle")`).
- **Confidence: Medium** — `src/components/analytics/GlobalTracking.tsx:22` `// Check if the link is external` (restates the hostname comparison; the line below it explaining *why* hostnames are compared is worth keeping).
- **Confidence: Low** — `src/components/experiments/shader-landing/useThreeShader.ts:76` `// Clear any existing content` (borderline; restates `container.innerHTML = ""`).

### Rewrite (gestures at real intent but unclear/rambling)

- **Confidence: Medium** — `src/components/experiments/rabbithole-chat-gallery-explore/VisualiserLogic.ts:94-95` (stream-of-consciousness "we should adding a cleanup method"). Replace with:
  `// FIXME: wheel listener is attached globally and never removed — move ownership to the React component or add a dispose() teardown.`
- **Confidence: Medium** — `src/components/analytics/GlobalTracking.tsx:25-27` (three rambling lines about mailto/tel/empty hostname). Replace with:
  `// Treat any non-empty foreign hostname as outbound; empty hostnames (mailto:/tel:/local files) are skipped.`
- **Confidence: Low** — `src/components/experiments/send-button/AnimatedSendButton.tsx:64` `// Wait for actual send operation, or simulate delay`. Replace with:
  `// No onSend handler in demo mode — fall back to a fixed delay so the success animation still plays.`
- **Confidence: Low** — `src/components/experiments/send-button/ThemeSwitch.tsx:3` and `src/components/ui/SiteFooter.tsx:13` TODOs are accurate; if kept, tighten to a single line, e.g.
  `// TODO: re-enable theme toggle once persistence/sync is fixed.` (Keep — do not delete; this is an honest, useful note.)

### Stubs / LARP

- **No genuine code stubs found.** No `not implemented` throws, no empty
  functions returning placeholder values, no lorem ipsum in shipped code.
- **Confidence: High (not a code stub — intentional)** — `src/components/experiments/send-button/ThemeSwitch.tsx` renders a deliberately non-interactive (disabled) toggle with `cursor-not-allowed`. This is an intentional disabled-feature UI, not LARP. Leave the behavior; only remove the dead commented-out code noted above.
- **Confidence: Low (content, not code)** — `non-euclidean-hyperbolic-workspace` docs/README and modal call out "(Placeholder) Interaction with nodes" and a "graph generation could use real data" lab-note. These are honest authored content about an experiment's limitations, not code stubs — no action needed beyond awareness.

Note: no license headers or ported-demo source attributions were flagged for
removal; none of the above touch attribution comments.

# Snippet: 3D CSS Keycap

A physical-looking keyboard key using pure CSS layering. No 3D transforms, no canvas.

## Install

No dependencies beyond React and Tailwind.

## Usage

```tsx
function Keycap({ label, isPressed }: { label: string; isPressed: boolean }) {
  return (
    <div className={`relative h-16 w-16 ${isPressed ? "translate-y-1" : ""} transition-all duration-75`}>
      <span className={`absolute inset-0 rounded-xl bg-neutral-800 ${isPressed ? "translate-y-0" : "translate-y-1"}`} />
      <span className="absolute inset-0 flex items-center justify-center rounded-xl border border-neutral-700 bg-gradient-to-b from-neutral-800 to-neutral-900">
        <span className="absolute inset-x-2 top-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="text-neutral-300 font-semibold">{label}</span>
      </span>
    </div>
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Key label (e.g., "⌘", "P") |
| `isPressed` | `boolean` | Whether the key is currently pressed down |

## Notes
- The depth effect is two stacked `<span>` elements. The bottom one offsets down by `translate-y-1` (4px). Pressing collapses the gap.
- Add color variants by changing the gradient and border colors based on state.
- Works at any size -- just change `h-16 w-16`.

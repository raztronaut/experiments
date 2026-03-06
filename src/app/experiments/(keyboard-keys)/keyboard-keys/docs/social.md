# Social: Keyboard Keys

## X Thread

**Tweet 1** (hook + media):
Built a keyboard shortcut prompt where the keys actually feel physical. Press ⌘⇧P in sequence, get confetti. Mess up too many times, get roasted then locked out.

[attach video/gif of the interaction]

**Tweet 2**:
The 3D effect is just two stacked divs. Bottom one = shadow, offset 4px down. Top one = the key surface with a gradient. Press animation collapses the gap. No 3D transforms needed.

**Tweet 3**:
The fun part is the error handling. It escalates:
- 2 errors: "are you even trying? 🤔"
- 5 errors: "okay this is getting embarrassing..."
- 8 errors: "💀"
- 17 errors: 5-minute lockout with countdown

**Tweet 4**:
Confetti is CSS-only. 15 particles per key, positioned with deterministic math (not Math.random()). Each gets a custom --end-x and --end-y via CSS custom properties. The +40px Y offset at the end fakes gravity.

**Tweet 5**:
The state machine is simple: 5 states (idle, active, completed, error, success) mapped to 5 color schemes. The Key component is pure render -- just colors and a translate. All logic lives in the parent.

**Tweet 6**:
Full article with code walkthrough: [article URL]

---

## Launch Post

Interactive keyboard shortcut prompt with 3D CSS keys, sequential validation, confetti on success, and escalating roasts on failure. Pure React + Tailwind, zero animation libraries.

[link]

---

## One-Liner

Keyboard keys that press, shake, celebrate, and lock you out if you keep failing.

# Social: Velocity-Responsive Design

## X Thread (concept-led)

**1/6**
Responsive design adapts to screen size. But it ignores *how* you're reading.

Scroll slowly → you want depth. Scroll fast → you want landmarks.

I built a UI that adapts content density to your scroll velocity. Here's what I learned.

🧵

**2/6**
The concept: scroll speed is a proxy for cognitive mode.

Slow scroll = deep reading (full paragraphs, serif type, expanded code).
Fast scroll = skimming (bold summaries, collapsed blocks, visual anchors).

The interface morphs between them in real-time.

**3/6**
The hardest part wasn't detecting velocity — Lenis gives you that for free.

It was preventing flicker. Your scroll speed oscillates constantly around any threshold. A single cutoff = chaos.

The fix: hysteresis from control systems. Different thresholds for entering and exiting states, with a hold delay.

**4/6**
Second hardest: layout stability.

When paragraphs collapse to summaries, the page shrinks by thousands of pixels. The viewport jumps.

Solution: an anchor-based correction loop that tracks which element you're looking at and compensates scroll position for 36 frames as the springs settle.

**5/6**
The FlightControl dashboard at the bottom started as a debug tool for calibrating thresholds.

Turns out it's the best way to experience the experiment. You can sweep through the full velocity range without actually scrolling.

Sometimes the debug tool IS the feature.

**6/6**
Try it: [link to experiment]

Full article with interactive demos (hysteresis visualizer, velocity oscilloscope): [link to article]

The future of responsive design isn't just spatial. It's temporal.

---

## Launch Post (single tweet)

What if responsive design responded to *how* you read, not just *what* you read on?

Built a UI that adapts content density to scroll velocity. Fast scroll → bold summaries. Slow scroll → full prose. Borrowed hysteresis from electrical engineering to prevent flicker.

[link] [video]

---

## One-Liner (Discord / Slack)

New experiment: Velocity-Responsive Design — a "Relativistic Reader" that adapts content density, typography, and layout based on your scroll speed. Uses hysteresis from control systems to prevent UI flicker. [link]

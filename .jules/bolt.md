## 2024-05-13 - Math.min vs manual comparison
**Learning:** For performance-critical code with small, fixed-size datasets (e.g., N < 5), prioritize manual comparisons and local variables over array methods like `.map` and `Math.min(...arr)` to eliminate allocation overhead and multiple passes.
**Action:** Replace spread operators inside array functions with primitive operators for tiny sets.

# Plan: Improve Content of the Four Existing Articles

**Purpose:** Bring the four experiment articles (404 Not Found, Basketball Replay Center, Non-Euclidean Hyperbolic Workspace, Velocity-Responsive Design) in line with the SEO and writing-voice standards in [docs/seo.md](docs/seo.md), [.agents/contexts/writing-voice.md](.agents/contexts/writing-voice.md), and [.cursor/rules/article-writing.mdc](.cursor/rules/article-writing.mdc). This plan is a checklist for content edits only; metadata and technical SEO are already handled.

**Reference:** SEO checklist in article-writing.mdc: description 120–155 chars, title/H1 aligned, first paragraph snippet-friendly, descriptive headings, no duplicate title/description, internal/external links where helpful, substantive depth.

---

## Article-by-article checklist

Apply the following to each of the four articles. Not every item will require a change; use this as a review list.

### 1. First 100–150 words (snippet-friendly)

- [ ] **404 Not Found:** First two paragraphs already state topic, experiment name (404 page), and techniques (ribbons, GLSL, scroll-velocity). No change required unless tightening for a clearer “What is this?” in the first sentence.
- [ ] **Basketball Replay Center:** First two paragraphs state topic (preloader), experiment name, and stack (R3F, shaders, GSAP). Consider adding one explicit technique in the first 1–2 sentences (e.g. “CRT shader, barrel distortion”) for snippet clarity.
- [ ] **Non-Euclidean Hyperbolic Workspace:** Opens with GEB/personal anecdote; experiment name and “what it is” (second brain on Poincaré disk) come in paragraphs 2–3. Consider adding a single sentence at or near the very start that states: “This article is about the Non-Euclidean Hyperbolic Workspace experiment: a second-brain-style knowledge graph on the Poincaré disk, built with Möbius transforms and geodesic arcs.” Then keep the existing hook. Improves snippet/answer-box clarity.
- [ ] **Velocity-Responsive Design:** First two paragraphs state the idea (responsive to scroll speed) and experiment. Already clear. Optional: name “Velocity-Responsive Design” or “VRD” in the first sentence for consistency.

### 2. H1 and title alignment

- [ ] **404 Not Found:** H1 “404 Not Found” matches title. OK.
- [ ] **Basketball Replay Center:** H1 “Basketball Replay Center” matches title. OK.
- [ ] **Non-Euclidean Hyperbolic Workspace:** H1 “Möbius Transforms, Poincaré Disks, Escher's Fish, and More” added; matches frontmatter title. OK.
- [ ] **Velocity-Responsive Design:** H1 “Velocity-Responsive Design” matches title. OK.

### 3. H2/H3 headings

- [ ] **404 Not Found:** “Wave deformation”, “Dual-face shader”, “Scroll-velocity-driven text”, “The mutable ref trick”, “Full thing”, “What I'd do differently” — all descriptive. OK.
- [ ] **Basketball Replay Center:** “The CRT screen shader”, “Selling the CRT look”, “Video textures…”, “Barrel distortion…”, “Animating shader uniforms with GSAP”, etc. OK.
- [ ] **Non-Euclidean Hyperbolic Workspace:** “The second brain problem”, “A brief history…”, “Exponential room…”, “The Möbius transform…”, “Geodesics…”, etc. OK.
- [ ] **Velocity-Responsive Design:** “The core idea”, “Hysteresis…”, “Reading Lenis's pulse”, “The scroll stabilizer”, etc. OK.

No keyword stuffing; headings support discoverability. No mandatory changes; optional tweaks only if a heading could be more descriptive for search.

### 4. In-body: experiment name, techniques, stack, links

- [ ] **404 Not Found:** Uses “404”, “ribbons”, “GLSL”, “React Three Fiber”, “R3F”, “scroll velocity”. Add 1–2 internal links to related experiments (e.g. from the “Full thing” or reflection) if `related` or natural fit exists.
- [ ] **Basketball Replay Center:** Uses “CRT”, “GSAP”, “React Three Fiber”, “barrel distortion”. Add 1–2 internal links to related experiments/articles where it fits.
- [ ] **Non-Euclidean Hyperbolic Workspace:** Rich use of “Poincaré disk”, “Möbius transform”, “geodesic”. External links (Wikipedia, GEB) present. Add 1–2 internal links to related experiments if any (e.g. cursor-depth-explorer, mountain-transition) where contextually natural.
- [ ] **Velocity-Responsive Design:** Uses “Lenis”, “Velocity-Responsive Design”, “VRD”, “hysteresis”. External link to Schmitt trigger. Add 1–2 internal links (e.g. to mountain-transition, cursor-depth-explorer per experiment.json `related`) where natural.

### 5. Depth and “definitive piece”

- [ ] All four articles are already substantive (well over 400–600 words). No shortening. Ensure each remains the single definitive article for that experiment (no duplicate or thin sister posts).

### 6. Frontmatter and dates

- [ ] **updatedAt:** Set to the date of any substantive content or frontmatter change (ISO 8601). Already in place; update when edits are made.
- [ ] **description:** All four are now in 120–155 chars and unique. No further change unless copy is revised.

### 7. Optional: related experiments and internal linking

- [ ] For each article, open the experiment’s `experiment.json` and check `related`. Where `related` is set, add at least one in-body link to a related experiment or its article (e.g. “See also [Mountain Transition](/experiments/mountain-transition) for another scroll-driven experiment.”). Prefer natural placement (e.g. in reflection or a “See also” line) over forced lists.

---

## Implementation order

1. **Non-Euclidean:** Add one snippet-friendly sentence at or near the top (experiment name + one-line “what it is”), then keep existing hook. Add 1–2 internal links from `related` if applicable.
2. **Basketball Replay Center:** Optional first-sentence tweak for snippet; add 1–2 internal links.
3. **404 Not Found:** Add 1–2 internal links.
4. **Velocity-Responsive Design:** Optional first-sentence naming; add 1–2 internal links.
5. Run `npm run audit:seo` after any description or title change; update `updatedAt` when making content edits.

---

## Success criteria

- First 100–150 words of each article answer “What is this?” with experiment name and 1–2 key techniques.
- H1 matches or tightly aligns with article title (already done).
- H2/H3 are descriptive; no keyword stuffing.
- Each article has at least one internal link to a related experiment or article where `related` exists.
- Descriptions remain 120–155 chars and unique; `updatedAt` set when content changes.
- Voice remains first-person, process-oriented, no AI fingerprints (per writing-voice.md).

This plan does not require changing the overall structure or length of the articles; it focuses on snippet clarity, internal linking, and alignment with existing SEO and voice guidelines.

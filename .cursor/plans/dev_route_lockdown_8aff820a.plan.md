---
name: Dev route lockdown
overview: Lock down dev-only routes and internal endpoints so they never leak into production, search engines, or AI crawlers.
todos:
  - id: gate-llms-mdx
    content: Add status/listing filter and X-Robots-Tag header to /experiments/llms.mdx/[...slug]/route.ts
    status: completed
  - id: gate-mdx-preview
    content: Add showDevContent guard to (mdx-preview)/layout.tsx so it 404s in production
    status: completed
  - id: robots-disallow
    content: Add disallow rules for /dev, /mdx-preview, /u/ to robots.ts
    status: completed
isProject: false
---

# Dev Route Lockdown

## What's the problem?

Your site has a few internal/dev-only pages. The `/dev` dashboard is already properly hidden in production (it returns a 404). But a few other routes slipped through without the same protection. This plan fixes three things:

1. `**/experiments/llms.mdx/[slug]**` -- This is a route that serves experiment info as plain text (for AI tools). Right now it will happily serve info about *any* experiment, including ones you haven't shipped yet (WIP). It also has no "don't index me" tag, so Google could theoretically find and index it.
2. `**/mdx-preview/[slug]`** -- This is your MDX component preview page. It already tells search engines "don't index me," but it's still *accessible* to anyone in production. Since it's a dev tool, it should 404 in production just like `/dev` does.
3. `**robots.txt`** -- This is the file that tells crawlers (Google, AI bots) which parts of your site they're allowed to visit. Right now it says "everything is fair game." We should add some "stay away from these paths" rules for `/dev`, `/mdx-preview`, `/u/` (your analytics proxy), and the raw registry JSON.

---

## Fix 1: Gate `/experiments/llms.mdx/` behind status checks

**File:** `[src/app/experiments/llms.mdx/[...slug]/route.ts](src/app/experiments/llms.mdx/[...slug]/route.ts)`

**What it does now:** Reads any experiment's `experiment.json` from disk and returns it as markdown. No filtering -- WIP, dev-only, everything is served.

**What we'll change:**

- After loading the experiment JSON (line 126), check that `status === "shipped"` and `listing` is not `"registry"`. If the experiment doesn't pass, return 404. This matches the same rules your `llms.txt` generation script uses.
- Add an `X-Robots-Tag: noindex, nofollow` header to the response so search engines won't index it even if they find the URL.

```typescript
const exp = await loadExperimentJson(slug);
if (!exp) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

// Only serve shipped, non-registry-only experiments
if (exp.status !== "shipped" || exp.listing === "registry") {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
```

And add to both response headers:

```typescript
"X-Robots-Tag": "noindex, nofollow",
```

---

## Fix 2: Gate `/mdx-preview` behind `showDevContent`

**File:** `[src/app/(mdx-preview)/mdx-preview/[slug]/page.tsx](src/app/(mdx-preview)`/mdx-preview/[slug]/page.tsx)

**What it does now:** Shows a preview of any registered MDX component. It already has `noindex` metadata, but the page actually renders in production.

**What we'll change:** This is a `"use client"` component, so we can't call `notFound()` at the server level here. Instead, we'll add the guard in the layout, which *is* a server component.

**File:** `[src/app/(mdx-preview)/layout.tsx](src/app/(mdx-preview)`/layout.tsx)

Add the same `showDevContent` check used by `/dev`:

```typescript
import { showDevContent } from "@/lib/env";
import { notFound } from "next/navigation";

export default function MdxPreviewLayout({ children }: { children: ReactNode }) {
  if (!showDevContent) {
    notFound();
  }
  // ... rest of layout
}
```

Now in production, visiting `/mdx-preview/anything` returns a 404 -- same behavior as `/dev`.

---

## Fix 3: Add disallow rules to `robots.txt`

**File:** `[src/app/robots.ts](src/app/robots.ts)`

**What it does now:** Tells every crawler "you can visit everything" (`allow: "/"`).

**What we'll change:** Add a shared `disallow` list to every rule so crawlers are told to stay away from internal paths. Think of it like putting "Staff Only" signs on doors -- the pages already 404 in production, but this tells bots not to even bother trying.

We'll disallow:

- `/dev` -- internal dashboard
- `/mdx-preview` -- component preview tool
- `/u/` -- your Umami analytics proxy (no value to crawlers)

We keep the existing `allow: "/"` so everything else remains open. The `disallow` entries take priority for those specific paths.

```typescript
const DISALLOWED = ["/dev", "/mdx-preview", "/u/"];

// Then in each rule:
{ userAgent: "Googlebot", allow: "/", disallow: DISALLOWED },
```

---

## What we're NOT changing

- `**/dev` page** -- Already properly gated. No changes needed.
- **Registry `llms.txt` routes** (`/registry/llms.txt`, `/registry/llms-full.txt`, `/registry/llms.mdx/`) -- These inherit `noindex` from the `(registry)` layout and are intentionally public for AI tooling. No changes needed.
- **Sitemap** -- Already correctly filters out WIP and dev-listed experiments. No changes needed.
- **WIP experiments** -- Already noindexed via the layout's `isPublic` check. No changes needed.


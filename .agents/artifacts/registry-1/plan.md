# Registry V2: Lean Interactive Docs -- Orchestration Plan

## Approach

Following the plan's recommendation: **Lean approach** (0 new deps, ~12 files).
Full Fumadocs deferred until registry exceeds ~40 items or Cmd+K search is needed.

## Domains

| # | Name | Complexity | Model | Files | Batch |
|---|------|-----------|-------|-------|-------|
| 1 | Registry Script Overhaul | integration | default | 1 modified | 1 |
| 2 | Registry Route & Pages | architecture | default | 6 new | 1 |
| 3 | Registry Components | architecture | default | 4 new | 1 |
| 4 | Config & Integration | mechanical | fast | 1 modified | 1 |

**Single batch** -- all 4 domains are independent enough to run concurrently.

## Dependency Graph

```
Domain 1 (script)     ──→ no deps
Domain 2 (routes)     ──→ needs Domain 3 component interfaces (documented in brief)
Domain 3 (components) ──→ no deps
Domain 4 (config)     ──→ no deps
```

No cross-batch dependencies. Domain 2 and 3 share interface contracts documented in both briefs.

## Shared Contracts

### Lightweight Index Schema (Domain 1 produces, Domain 2 consumes)

```typescript
interface RegistryIndexItem {
  name: string;
  title: string;
  description: string;
  tags: string[];
  tech: string[];
  status: string;
  poster?: string;
  video?: string;
  category: string;
  fileCount: number;
  dependencyCount: number;
}
```

### Component Interfaces (Domain 3 exports, Domain 2 imports)

```typescript
// src/components/registry/RegistryCard.tsx
interface RegistryCardProps {
  slug: string;
  title: string;
  description: string;
  poster?: string;
  video?: string;
  tags: string[];
  tech: string[];
  category: string;
}

// src/components/registry/InstallCommand.tsx
interface InstallCommandProps {
  slug: string;
}

// src/components/registry/ExperimentPreview.tsx
interface ExperimentPreviewProps {
  slug: string;
  title: string;
}

// src/components/registry/RegistryMeta.tsx
interface RegistryMetaProps {
  dependencies: string[];
  registryDependencies: string[];
  tags: string[];
  tech: string[];
  fileCount: number;
}
```

## File Ownership Matrix

| File | Domain |
|------|--------|
| `scripts/generate-registry.mjs` | 1 |
| `src/app/(registry)/layout.tsx` | 2 |
| `src/app/(registry)/registry.css` | 2 |
| `src/app/(registry)/registry/page.tsx` | 2 |
| `src/app/(registry)/registry/[slug]/page.tsx` | 2 |
| `src/app/(registry)/registry/[slug]/opengraph-image.tsx` | 2 |
| `src/components/registry/RegistryCard.tsx` | 3 |
| `src/components/registry/InstallCommand.tsx` | 3 |
| `src/components/registry/ExperimentPreview.tsx` | 3 |
| `src/components/registry/RegistryMeta.tsx` | 3 |
| `next.config.ts` | 4 |

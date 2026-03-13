# Product-Centered Future Architecture for the Experiments Site

## Summary

This app should be treated as a **portfolio operating system**, not just an experiments site.

It has to serve three jobs at once:
- A public, high-end portfolio for peers, clients, and thought leadership.
- A private compounding engine where every experiment, collected pattern, component, and workflow makes future work faster.
- A selectively public publishing machine where visibility is controlled deliberately, not by folder placement or accidental discoverability.

The architecture should therefore optimize for:
- **one canonical model of work**
- **strong visibility control**
- **configurable public topology**
- **derived surfaces instead of hand-maintained parallel systems**

The core architectural move is to introduce a single typed **catalog layer** that describes all work and all surface eligibility, then derive experiments, writings, registry docs, feeds, sitemap, LLM outputs, and `/dev` from that one model.

## Ideal user flows

### 1. Your internal builder flow
- Create or ingest a new thing: experiment, collected component, best-practice pattern, article, or internal note.
- Keep it private or backstage by default.
- Attach reusable code, references, metadata, visibility, and links to related work.
- Promote it intentionally into one or more public surfaces when it is ready.

This is the most important flow. The repo should make this flow fast, durable, and compounding.

### 2. Main public visitor flow
- Visitor lands on a polished portfolio shell.
- They discover a curated experiment, system, or piece of writing.
- They go deeper into a specific experiment.
- From there, they can optionally go to the article.
- If relevant, they can also reach the backstage registry/docs surface to inspect reusable components or implementation pieces.

This means the public site should feel curated and intentional, while the deeper system remains powerful.

### 3. Advanced peer/adopter flow
- A more technical visitor reaches the registry/docs area directly or from an experiment/article.
- They inspect source, installable pieces, related items, and internal building blocks.
- They understand that the registry is a serious system surface, but not necessarily the front door.

This supports external adopters without forcing the whole product to behave like a public component library.

## Future-state architecture

### 1. Canonical domain model

Introduce one typed catalog model, for example `WorkEntry`, with derived sub-records rather than separate rediscovery code.

Required public/domain interfaces:
- `WorkEntry`
  - `id`
  - `kind`: `experiment | writing | component | collected | system | note`
  - `status`
  - `visibility`
  - `featured`
  - `title`
  - `description`
  - `tags`
  - `tech`
  - `dates`
  - `relations`
  - `runtimeRef?`
  - `articleRef?`
  - `registryRef?`
- `SurfacePolicy`
  - derived booleans for `home`, `portfolio`, `registry`, `writing`, `feeds`, `sitemap`, `llms`, `search`, `dev`
- `RegistryEntry`
  - install/source/docs/search-specific fields
- `ArticleEntry`
  - frontmatter, reading metadata, interactive component mapping

Default architecture choice:
- Keep **one model with strong visibility tiers**, not separate public/private systems.

### 2. Visibility model

Visibility should be first-class and shared across every surface.

Recommended tiers:
- `private`
- `backstage`
- `public`
- `featured`

Meaning:
- `private`: visible only to internal/dev/system surfaces.
- `backstage`: intentionally reachable but not front-door promoted.
- `public`: eligible for normal public surfaces.
- `featured`: explicitly promoted on the main portfolio shell.

The exact field names can differ, but the important point is this:
- visibility should no longer be reinterpreted independently by runtime code, feeds, registry scripts, `/dev`, and markdown exports.

### 3. Topology and where things live

The public information architecture should remain changeable over time. That means **route structure must not be the source of truth**.

Recommended physical structure:
- `content/work/<slug>/entry.json` or `entry.ts`
  - canonical metadata and visibility
- `content/work/<slug>/article.mdx`
  - optional public writing
- `content/work/<slug>/notes/*`
  - optional internal/backstage docs
- `src/components/experiments/<slug>/`
  - experiment runtime code
- `public/experiments/<slug>/`
  - assets
- `src/components/collected/<slug>/`
  - collected/ported reusable artifacts
- `generated/catalog/*`
  - derived manifests for runtime/build surfaces

Key decision:
- authored content and metadata move into a **content/catalog domain**
- route files in `src/app` become **thin renderers over catalog data**
- experiment runtime code stays separate from authored content

This keeps topology flexible:
- today the site can feel lab-first or portfolio-first
- later you can reorganize nav and landing flows without relocating source-of-truth content

### 4. Public surface model

The app should be treated as four surfaces generated from one catalog:

- **Portfolio shell**
  - main homepage and top-level curated sections
  - strongly editorial and selective
- **Experiment runtime**
  - isolated live demos and interactive work
- **Writing**
  - articles tied to experiments or standalone systems
- **Backstage registry/docs**
  - reusable components, implementation artifacts, collected patterns, install docs

Important default:
- registry is **backstage but reachable**
- not hidden by accident
- not forced to be a top-nav first-class product until you want that

### 5. Experiment platform model

Formalize a split:
- `v2 platform`
- `legacy archive`

Rules:
- v2 experiments use a shared layout/runtime/meta factory.
- legacy experiments remain frozen unless explicitly promoted.
- the system stops pretending every experiment follows the same platform contract.

This avoids wasting effort retrofitting old experiments while still letting the modern system become coherent.

### 6. Content/MDX model

Converge toward one content runtime.

Recommended direction:
- use **Fumadocs as the primary authored-content/docs plane**
- build a shared article renderer that supports per-entry interactive component maps
- stop keeping articles on a separate MDX stack long-term

Migration default:
- do not unify everything in one pass
- first land the catalog/content model
- then migrate article rendering onto the shared content plane

### 7. Registry model

The registry should become a **derived view of the catalog**, not a parallel architecture.

The registry pipeline should:
- consume canonical catalog entries
- derive typed installable registry items
- derive docs pages
- derive search payloads
- derive markdown/LLM outputs

It should not:
- rediscover source differently per script
- leak story/demo artifacts into some outputs but not others
- depend on ignored generated folders that the main build does not own

## Build and publishing model

The build should be fully owned by one canonical pipeline.

Recommended build stages:
1. Validate canonical work entries and article metadata.
2. Build one generated catalog manifest.
3. Derive surface manifests:
   - experiment manifest
   - writing/feed manifest
   - registry manifest
   - search manifest
   - llms manifest
4. Generate derived outputs:
   - registry JSON
   - registry docs MDX/source
   - `llms.txt`
   - sitemap/feed inputs
5. Run Fumadocs codegen as part of the owned build.
6. Run Next build.

Desired property:
- a clean checkout plus installed dependencies should be reproducible with one command
- CI should not secretly know extra steps that local build does not

Publishing behavior:
- everything starts as internal/backstage unless promoted
- promotion is metadata-driven
- no surface should need its own custom visibility logic

## Priority roadmap

### Slice 1: Canonical catalog and surface policy
- Scope: create the single typed model for experiments, writings, registry items, and visibility.
- Affected subsystems: current `experiments`, `articles`, `/dev`, feeds, sitemap, LLM outputs.
- Intended outcome: all public and internal surfaces consume one domain layer.
- Main risk: changing current visibility behavior if derivation logic is not matched exactly.
- Priority: `fix now`

### Slice 2: Self-contained registry/build contract
- Scope: make the full registry/docs/Fumadocs pipeline part of the owned build and remove late-stage drift.
- Affected subsystems: registry generation, docs, search, LLM registry routes, CI/build scripts.
- Intended outcome: registry becomes a deterministic derived system, not a partially external prerequisite.
- Main risk: temporary instability while replacing the current chained scripts.
- Priority: `fix now`

### Slice 3: Shared v2 experiment runtime shell
- Scope: replace bespoke duplicated experiment layout logic with a shared layout/meta/nav factory for v2 experiments only.
- Affected subsystems: experiment layouts, SEO, article linking, visibility handling.
- Intended outcome: one maintained runtime contract for modern experiments, with legacy kept separate.
- Main risk: mixing legacy assumptions into the new path.
- Priority: `fix now`

### Slice 4: Content system consolidation
- Scope: move article/content discovery to the catalog layer, make article pages shared renderers, then migrate toward one MDX plane.
- Affected subsystems: writings, feeds, sitemap, markdown exports, article rendering.
- Intended outcome: authored content becomes first-class and no longer depends on route walking.
- Main risk: MDX parity and interactive demo embedding.
- Priority: `later`

### Slice 5: Verification and internal leverage
- Scope: create one canonical verification command and add contract tests around catalog, visibility, registry artifacts, feeds, and markdown outputs.
- Affected subsystems: CI, local dev, publishing confidence.
- Intended outcome: “green” means the portfolio system is coherent, not just that a few unit tests passed.
- Main risk: initial CI/runtime expansion.
- Priority: `fix now`

## Test plan and verification scenarios

- **Catalog policy tests**
  - Verify one entry can move between `private`, `backstage`, `public`, and `featured` without custom per-surface logic.
  - Verify experiment/article/registry/feed/sitemap/llms eligibility all derive from the same fixture set.

- **Public flow tests**
  - Visitor can go `portfolio shell -> experiment -> article`.
  - Visitor can go `experiment -> backstage registry/docs` when allowed.
  - Registry remains reachable even when not promoted from the homepage.

- **Internal workflow tests**
  - New work can be created once and promoted across surfaces by metadata only.
  - Private/internal entries never leak into public routes, feeds, sitemap, or llms outputs.

- **Registry contract tests**
  - No story/demo artifacts leak into published registry outputs.
  - Featured/backstage flags exist in the published contracts that consume them.
  - Generated docs and search use the same catalog-derived inputs.

- **Build tests**
  - Clean environment build succeeds with one canonical command.
  - CI and local build use the same required steps.
  - Warning channel is low-noise enough that new warnings are meaningful.

## Assumptions and defaults chosen

- Primary product identity: **portfolio operating system**, not just a lab and not just a component library.
- Main audience: **peers/clients first**, with a path for thought leadership and later external adoption.
- Dominant public flow for now: **experiment -> article**.
- Registry role: **backstage but reachable**.
- Content/privacy model: **one unified model with strong visibility tiers**.
- Public top-level IA is intentionally **not locked yet**, so the architecture should make the nav/topology reconfigurable instead of baking it into source layout.
- Legacy experiments should be treated as **archive/frozen islands**, not retrofit targets unless explicitly promoted.
- Best long-term content direction: **single catalog + shared MDX/data plane**, with migration staged after the catalog layer exists.

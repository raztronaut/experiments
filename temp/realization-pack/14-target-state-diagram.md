# Target-State Diagram (POSSIBLY MOST LIKELY DEPRECATED)

> **Note:**  
> This target-state diagram may be deprecated.  
> Before using or referencing this model, please check `@experiments/temp/realization-pack/new-target-state-diagram.md` for an updated version.  
> Confirm that the new diagram is conceptually optimal and correct for your use case; do not blindly replace or discard this version without review.

---

This diagram shows the prior intended clean-pass architecture at a system level.

```mermaid
flowchart LR
  subgraph Authored["Authored source models"]
    E["experiment.json\nco-located in route groups"]
    A["public article MDX/frontmatter\ncontent/articles/*"]
    C["content constellation docs\nco-located or staged"]
    R["registry config + native component metadata\nregistry.config.json / meta.json / library.json"]
  end

  subgraph Derived["Derived manifests and generated artifacts"]
    S["experiment/article surface manifest"]
    M["registry manifest"]
    G["generated registry docs + Fumadocs source\ncontent/registry + .source"]
    L["llms outputs"]
    F["feeds + sitemap inputs"]
  end

  subgraph Runtime["Runtime surfaces"]
    H["homepage / portfolio shell"]
    D["/dev dashboard"]
    X["isolated experiment apps"]
    W["shared public article runtime"]
    Y["registry docs / search / markdown"]
  end

  E --> S
  A --> S
  E --> X
  A --> W
  C --> W
  R --> M
  E --> M
  S --> H
  S --> D
  S --> F
  S --> L
  M --> G
  M --> Y
  G --> Y
```

## Interpretation

- Experiments remain authored where they are and remain isolated apps.
- Public article content moves toward one coherent content plane.
- Internal content constellation material can be staged rather than moved all at once.
- Registry remains a derived subsystem built from native metadata plus generated docs/source artifacts.
- Shared surface policy should come from a derived experiment/article manifest rather than repeated filesystem rediscovery.

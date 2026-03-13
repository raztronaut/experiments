"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Option sets ────────────────────────────────────────────────

const TEXT_ALIGN = ["left", "justify", "start"] as const;
const HYPHENS = ["none", "auto", "manual"] as const;
const TEXT_WRAP = ["stable", "pretty", "balance", "wrap"] as const;
const WORD_BREAK = ["normal", "break-all", "keep-all"] as const;
const OVERFLOW_WRAP = ["normal", "break-word", "anywhere"] as const;

// ─── State shape ────────────────────────────────────────────────

interface TypoState {
  textAlign: string;
  hyphens: string;
  textWrap: string;
  wordBreak: string;
  overflowWrap: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  maxWidth: number;
  paragraphSpacing: number;
}

const DEFAULTS: TypoState = {
  textAlign: "left",
  hyphens: "none",
  textWrap: "stable",
  wordBreak: "normal",
  overflowWrap: "normal",
  fontSize: 14,
  lineHeight: 1.5,
  letterSpacing: -0.09,
  maxWidth: 768,
  paragraphSpacing: 24,
};

// ─── Presets ────────────────────────────────────────────────────

const PRESETS: Record<string, TypoState> = {
  Current: { ...DEFAULTS },
  Book: {
    textAlign: "justify",
    hyphens: "auto",
    textWrap: "pretty",
    wordBreak: "normal",
    overflowWrap: "normal",
    fontSize: 15,
    lineHeight: 1.6,
    letterSpacing: -0.05,
    maxWidth: 640,
    paragraphSpacing: 28,
  },
  Blog: {
    textAlign: "left",
    hyphens: "none",
    textWrap: "stable",
    wordBreak: "normal",
    overflowWrap: "normal",
    fontSize: 16,
    lineHeight: 1.625,
    letterSpacing: 0,
    maxWidth: 720,
    paragraphSpacing: 24,
  },
  "iA Writer": {
    textAlign: "left",
    hyphens: "none",
    textWrap: "balance",
    wordBreak: "normal",
    overflowWrap: "normal",
    fontSize: 18,
    lineHeight: 1.778,
    letterSpacing: 0,
    maxWidth: 640,
    paragraphSpacing: 32,
  },
  NYT: {
    textAlign: "justify",
    hyphens: "auto",
    textWrap: "pretty",
    wordBreak: "normal",
    overflowWrap: "normal",
    fontSize: 16,
    lineHeight: 1.625,
    letterSpacing: -0.01,
    maxWidth: 600,
    paragraphSpacing: 24,
  },
};

// ─── Spacing style element ID ───────────────────────────────────

const SPACING_STYLE_ID = "typo-debug-spacing";

// ─── Main component ─────────────────────────────────────────────

export function TypographyDebugPanel() {
  const searchParams = useSearchParams();
  const enabled = searchParams.has("typography");
  const [state, setState] = useState<TypoState>(DEFAULTS);
  const [collapsed, setCollapsed] = useState(false);
  const [sections, setSections] = useState({
    toggles: true,
    sliders: false,
    presets: false,
    utilities: false,
  });
  const [showGrid, setShowGrid] = useState(false);
  const [showMeasure, setShowMeasure] = useState(false);
  const [copied, setCopied] = useState(false);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const apply = useCallback((next: TypoState) => {
    const article = document.querySelector("article");
    if (!article) {
      return;
    }
    const s = article.style as unknown as Record<string, string>;
    s.textAlign = next.textAlign;
    s.hyphens = next.hyphens;
    s.textWrap = next.textWrap;
    s.wordBreak = next.wordBreak;
    s.overflowWrap = next.overflowWrap;
    s.fontSize = `${next.fontSize}px`;
    s.lineHeight = `${next.lineHeight}`;
    s.letterSpacing = `${next.letterSpacing}px`;

    const container = document.querySelector(".h-entry") as HTMLElement;
    if (container) {
      container.style.maxWidth = `${next.maxWidth}px`;
    }

    let styleEl = document.getElementById(SPACING_STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = SPACING_STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
        article p:not(:first-child),
        article h1:not(:first-child),
        article h2:not(:first-child),
        article h3:not(:first-child),
        article h4:not(:first-child),
        article h5:not(:first-child),
        article h6:not(:first-child),
        article blockquote:not(:first-child),
        article ul:not(:first-child),
        article ol:not(:first-child),
        article pre:not(:first-child),
        article figure[data-rehype-pretty-code-figure]:not(:first-child),
        article .katex-display:not(:first-child) {
          margin-top: ${next.paragraphSpacing}px !important;
        }
      `;
  }, []);

  const applyGrid = useCallback((show: boolean, lh: number, fs: number) => {
    const article = document.querySelector("article");
    if (!article) {
      return;
    }
    if (show) {
      const lineHeightPx = lh * fs;
      (article as HTMLElement).style.backgroundImage =
        `repeating-linear-gradient(to bottom, transparent, transparent ${lineHeightPx - 1}px, rgba(120,160,255,0.15) ${lineHeightPx - 1}px, rgba(120,160,255,0.15) ${lineHeightPx}px)`;
      (article as HTMLElement).style.backgroundSize = `100% ${lineHeightPx}px`;
    } else {
      (article as HTMLElement).style.backgroundImage = "";
      (article as HTMLElement).style.backgroundSize = "";
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    apply(state);
    applyGrid(showGrid, state.lineHeight, state.fontSize);

    return () => {
      const styleEl = document.getElementById(SPACING_STYLE_ID);
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, [enabled, state, apply, showGrid, applyGrid]);

  const { maxWidth, fontSize } = state;

  // biome-ignore lint/correctness/useExhaustiveDependencies: maxWidth/fontSize are intentional triggers to re-measure when sliders change
  useEffect(() => {
    if (!(enabled && showMeasure)) {
      if (measureRef.current) {
        measureRef.current.remove();
        measureRef.current = null;
      }
      return;
    }
    const container = document.querySelector(".h-entry") as HTMLElement;
    if (!container) {
      return;
    }

    if (!measureRef.current) {
      measureRef.current = document.createElement("div");
      Object.assign(measureRef.current.style, {
        position: "fixed",
        top: "8px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "4px 10px",
        background: "rgba(0,0,0,0.8)",
        color: "#7aa2f7",
        fontFamily: "ui-monospace, monospace",
        fontSize: "11px",
        borderRadius: "6px",
        zIndex: "99998",
        pointerEvents: "none",
      });
      document.body.appendChild(measureRef.current);
    }

    const updateMeasure = () => {
      if (!measureRef.current) {
        return;
      }
      const w = container.getBoundingClientRect().width;
      const probe = document.createElement("span");
      probe.style.cssText =
        "position:absolute;visibility:hidden;font:inherit;white-space:nowrap";
      probe.textContent = "0".repeat(100);
      const article = document.querySelector("article");
      if (article) {
        article.appendChild(probe);
        const chWidth = probe.getBoundingClientRect().width / 100;
        probe.remove();
        const chars = Math.round(w / chWidth);
        measureRef.current.textContent = `${Math.round(w)}px · ~${chars}ch`;
      } else {
        measureRef.current.textContent = `${Math.round(w)}px`;
      }
    };
    updateMeasure();
    const ro = new ResizeObserver(updateMeasure);
    ro.observe(container);
    return () => {
      ro.disconnect();
      if (measureRef.current) {
        measureRef.current.remove();
        measureRef.current = null;
      }
    };
  }, [enabled, showMeasure, maxWidth, fontSize]);

  if (!enabled) {
    return null;
  }

  const update = (patch: Partial<TypoState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      return next;
    });
  };

  const applyPreset = (name: string) => {
    const preset = PRESETS[name];
    if (preset) {
      setState(preset);
    }
  };

  const reset = () => setState(DEFAULTS);

  const copyCSS = async () => {
    const lhPx = Math.round(state.fontSize * state.lineHeight * 100) / 100;
    const lines = [
      "article {",
      `  font-size: ${state.fontSize}px;`,
      `  line-height: ${lhPx}px;`,
      `  letter-spacing: ${state.letterSpacing}px;`,
      `  text-align: ${state.textAlign};`,
      `  hyphens: ${state.hyphens};`,
      `  text-wrap: ${state.textWrap};`,
    ];
    if (state.wordBreak !== "normal") {
      lines.push(`  word-break: ${state.wordBreak};`);
    }
    if (state.overflowWrap !== "normal") {
      lines.push(`  overflow-wrap: ${state.overflowWrap};`);
    }
    lines.push("}");
    if (state.maxWidth !== DEFAULTS.maxWidth) {
      lines.push("", `/* container max-width: ${state.maxWidth}px */`);
    }
    if (state.paragraphSpacing !== DEFAULTS.paragraphSpacing) {
      lines.push("", `/* paragraph spacing: ${state.paragraphSpacing}px */`);
    }
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleSection = (key: keyof typeof sections) =>
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  if (collapsed) {
    return (
      <button type="button" onClick={() => setCollapsed(false)} style={S.fab}>
        Aa
      </button>
    );
  }

  return (
    <div style={S.panel}>
      {/* Header */}
      <div style={S.header}>
        <strong style={{ fontSize: 14 }}>Typography</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={reset} style={S.headerBtn}>
            Reset
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            style={S.closeBtn}
          >
            &times;
          </button>
        </div>
      </div>

      <div style={S.body}>
        {/* Presets */}
        <SectionHeader
          label="Presets"
          open={sections.presets}
          onToggle={() => toggleSection("presets")}
        />
        {sections.presets && (
          <div
            style={{ ...S.group, display: "flex", gap: 4, flexWrap: "wrap" }}
          >
            {Object.keys(PRESETS).map((name) => {
              const active = Object.entries(PRESETS[name]).every(
                ([k, v]) => state[k as keyof TypoState] === v
              );
              return (
                <button
                  type="button"
                  key={name}
                  onClick={() => applyPreset(name)}
                  style={{
                    ...S.toggleBtn,
                    borderColor: active ? "#7aa2f7" : "#333",
                    background: active ? "#1e2a3a" : "transparent",
                    color: active ? "#7aa2f7" : "#aaa",
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {/* Toggle buttons */}
        <SectionHeader
          label="Text Properties"
          open={sections.toggles}
          onToggle={() => toggleSection("toggles")}
        />
        {sections.toggles && (
          <div style={S.group}>
            <ToggleRow
              label="text-align"
              value={state.textAlign}
              options={TEXT_ALIGN}
              onChange={(v) => update({ textAlign: v })}
            />
            <ToggleRow
              label="hyphens"
              value={state.hyphens}
              options={HYPHENS}
              onChange={(v) => update({ hyphens: v })}
            />
            <ToggleRow
              label="text-wrap"
              value={state.textWrap}
              options={TEXT_WRAP}
              onChange={(v) => update({ textWrap: v })}
            />
            <ToggleRow
              label="word-break"
              value={state.wordBreak}
              options={WORD_BREAK}
              onChange={(v) => update({ wordBreak: v })}
            />
            <ToggleRow
              label="overflow-wrap"
              value={state.overflowWrap}
              options={OVERFLOW_WRAP}
              onChange={(v) => update({ overflowWrap: v })}
            />
          </div>
        )}

        {/* Sliders */}
        <SectionHeader
          label="Metrics"
          open={sections.sliders}
          onToggle={() => toggleSection("sliders")}
        />
        {sections.sliders && (
          <div style={S.group}>
            <SliderRow
              label="font-size"
              value={state.fontSize}
              min={10}
              max={24}
              step={1}
              unit="px"
              onChange={(v) => update({ fontSize: v })}
            />
            <SliderRow
              label="line-height"
              value={state.lineHeight}
              min={1.0}
              max={2.5}
              step={0.05}
              onChange={(v) => update({ lineHeight: v })}
            />
            <SliderRow
              label="letter-spacing"
              value={state.letterSpacing}
              min={-0.5}
              max={0.5}
              step={0.01}
              unit="px"
              onChange={(v) => update({ letterSpacing: v })}
            />
            <SliderRow
              label="max-width"
              value={state.maxWidth}
              min={480}
              max={1080}
              step={10}
              unit="px"
              onChange={(v) => update({ maxWidth: v })}
            />
            <SliderRow
              label="paragraph-gap"
              value={state.paragraphSpacing}
              min={8}
              max={48}
              step={2}
              unit="px"
              onChange={(v) => update({ paragraphSpacing: v })}
            />
          </div>
        )}

        {/* Utilities */}
        <SectionHeader
          label="Utilities"
          open={sections.utilities}
          onToggle={() => toggleSection("utilities")}
        />
        {sections.utilities && (
          <div
            style={{ ...S.group, display: "flex", gap: 6, flexWrap: "wrap" }}
          >
            <button
              type="button"
              onClick={copyCSS}
              style={{
                ...S.toggleBtn,
                borderColor: copied ? "#9ece6a" : "#333",
                color: copied ? "#9ece6a" : "#aaa",
              }}
            >
              {copied ? "Copied!" : "Copy CSS"}
            </button>
            <button
              type="button"
              onClick={() => setShowGrid((v) => !v)}
              style={{
                ...S.toggleBtn,
                borderColor: showGrid ? "#7aa2f7" : "#333",
                background: showGrid ? "#1e2a3a" : "transparent",
                color: showGrid ? "#7aa2f7" : "#aaa",
              }}
            >
              Baseline grid
            </button>
            <button
              type="button"
              onClick={() => setShowMeasure((v) => !v)}
              style={{
                ...S.toggleBtn,
                borderColor: showMeasure ? "#7aa2f7" : "#333",
                background: showMeasure ? "#1e2a3a" : "transparent",
                color: showMeasure ? "#7aa2f7" : "#aaa",
              }}
            >
              Measure
            </button>
          </div>
        )}

        {/* Diff view */}
        <div style={S.diff}>
          {Object.entries(state)
            .filter(([k, v]) => v !== DEFAULTS[k as keyof TypoState])
            .map(([k, v]) => (
              <div key={k}>
                <span style={{ color: "#7aa2f7" }}>{camelToDash(k)}</span>
                <span style={{ color: "#555" }}>: </span>
                <span style={{ color: "#9ece6a" }}>
                  {typeof v === "number" ? formatNum(v) : v}
                </span>
              </div>
            ))}
          {Object.entries(state).every(
            ([k, v]) => v === DEFAULTS[k as keyof TypoState]
          ) && <span style={{ color: "#555" }}>defaults (no changes)</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} style={S.sectionHeader}>
      <span style={{ color: "#888" }}>{open ? "▾" : "▸"}</span>
      <span>{label}</span>
    </button>
  );
}

function ToggleRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={S.label}>{label}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              ...S.toggleBtn,
              borderColor: value === opt ? "#7aa2f7" : "#333",
              background: value === opt ? "#1e2a3a" : "transparent",
              color: value === opt ? "#7aa2f7" : "#aaa",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={S.label}>{label}</span>
        <span style={{ ...S.label, color: "#7aa2f7" }}>
          {formatNum(value)}
          {unit ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={S.slider}
      />
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function camelToDash(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function formatNum(n: number): string {
  return Number.isInteger(n)
    ? String(n)
    : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

// ─── Inline styles ──────────────────────────────────────────────

const S = {
  fab: {
    position: "fixed" as const,
    bottom: 16,
    right: 16,
    zIndex: 99_999,
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#000",
    color: "#fff",
    border: "1px solid #333",
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    position: "fixed" as const,
    bottom: 16,
    right: 16,
    zIndex: 99_999,
    background: "#111",
    color: "#eee",
    borderRadius: 12,
    fontSize: 13,
    fontFamily: "system-ui, sans-serif",
    lineHeight: 1.4,
    maxWidth: 300,
    width: "calc(100vw - 32px)",
    border: "1px solid #333",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    textAlign: "left" as const,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #222",
  },
  body: {
    maxHeight: "70vh",
    overflowY: "auto" as const,
    padding: "6px 14px 14px",
  },
  headerBtn: {
    background: "none",
    border: "1px solid #444",
    color: "#999",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 11,
    cursor: "pointer",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#999",
    fontSize: 18,
    cursor: "pointer",
    lineHeight: 1,
  },
  sectionHeader: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    width: "100%",
    padding: "8px 0 4px",
    background: "none",
    border: "none",
    color: "#ccc",
    fontSize: 12,
    fontWeight: 600 as const,
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
    textAlign: "left" as const,
  },
  group: {
    paddingBottom: 4,
  },
  label: {
    fontSize: 11,
    color: "#888",
    marginBottom: 3,
    fontFamily: "ui-monospace, monospace",
  },
  toggleBtn: {
    padding: "3px 10px",
    borderRadius: 6,
    border: "1px solid #333",
    background: "transparent",
    color: "#aaa",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "ui-monospace, monospace",
  },
  slider: {
    width: "100%",
    height: 4,
    accentColor: "#7aa2f7",
    cursor: "pointer",
  },
  diff: {
    marginTop: 8,
    padding: "8px 10px",
    background: "#1a1a1a",
    borderRadius: 8,
    fontSize: 11,
    fontFamily: "ui-monospace, monospace",
    color: "#888",
    lineHeight: 1.6,
  },
};

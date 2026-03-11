import { NARRATIVE_SECTIONS } from "../data";

export function NarrativeSection() {
  return (
    <>
      {NARRATIVE_SECTIONS.map((section, i) => (
        <section
          className={`airplanes-section dark ${section.align === "right" ? "right" : ""}`}
          key={i}
        >
          {section.lines.map((line, j) =>
            j === 0 ? <h2 key={j}>{line}</h2> : <h3 key={j}>{line}</h3>
          )}
        </section>
      ))}
    </>
  );
}

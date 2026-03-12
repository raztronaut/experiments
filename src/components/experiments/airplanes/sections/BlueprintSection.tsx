import { BLUEPRINT_FACTS } from "../data";

function BlueprintSVG() {
  return (
    <svg aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100">
      <line
        fill="none"
        id="line-length"
        strokeWidth="0.5"
        x1="10"
        x2="90"
        y1="80"
        y2="80"
      />
      <line
        fill="none"
        id="line-wingspan"
        strokeWidth="0.5"
        x1="50"
        x2="50"
        y1="10"
        y2="90"
      />
      <circle
        cx="70"
        cy="35"
        fill="none"
        id="circle-phalange"
        r="15"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export function BlueprintSection() {
  return (
    <div className="airplanes-blueprint">
      <BlueprintSVG />
      <section className="airplanes-section dark">
        <h2>The facts and figures.</h2>
        <h3>Lets get into the nitty gritty...</h3>
      </section>
      {BLUEPRINT_FACTS.map((fact, i) => (
        <section className={`airplanes-section dark ${fact.className}`} key={i}>
          <h2>{fact.label}</h2>
          <h3>{fact.value}</h3>
        </section>
      ))}
    </div>
  );
}

import { END } from "../data";

export function EndSection() {
  return (
    <div className="airplanes-sunset">
      <section className="airplanes-section airplanes-end">
        <h2>{END.title}</h2>
        <ul className="airplanes-credits">
          {END.credits.map((credit, i) => (
            <li key={i}>
              {credit.text}{" "}
              <a
                href={credit.link.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {credit.link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

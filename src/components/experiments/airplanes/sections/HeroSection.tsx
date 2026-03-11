"use client";

import { HERO } from "../data";

export function HeroSection() {
  return (
    <div className="airplanes-ground-container">
      <div className="airplanes-parallax airplanes-ground" />
      <div className="airplanes-parallax airplanes-clouds" />
      <section className="airplanes-section">
        <h1>{HERO.title}</h1>
        <h3>{HERO.subtitle}</h3>
        <p>{HERO.description}</p>
        <p className="airplanes-scroll-cta">{HERO.scrollCta}</p>
      </section>
    </div>
  );
}

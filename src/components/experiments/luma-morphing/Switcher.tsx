"use client";

import { PERSONAS } from "./data";

interface SwitcherProps {
  activePersona: number;
  onSelect: (target: number) => void;
}

export function Switcher({ activePersona, onSelect }: SwitcherProps) {
  return (
    <div className="luma-morphing-switcher-container">
      <div
        className="luma-morphing-switcher"
        role="group"
        aria-label="Persona selector"
      >
        {PERSONAS.map((label, i) => {
          const value = i + 1;
          const isActive = activePersona === value;

          return (
            <div key={value} className="luma-morphing-button-wrapper">
              <button
                type="button"
                className={`luma-morphing-button ${isActive ? "luma-morphing-button--active" : ""}`}
                data-state={value}
                onClick={() => onSelect(value)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Persona ${label}`}
              />
              <span className="luma-morphing-button-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useId } from "react";
import "./controls.css";

export interface SwitchProps {
  "aria-label"?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
  onChange?: (toggled: boolean) => void;
  toggled?: boolean;
}

export function Switch({
  id,
  label,
  "aria-label": ariaLabel,
  toggled = false,
  disabled,
  onChange,
}: SwitchProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="flex items-center gap-2">
      <input
        aria-label={ariaLabel ?? label}
        checked={toggled}
        className="mdx-switch"
        disabled={disabled}
        id={inputId}
        onChange={(e) => onChange?.(e.target.checked)}
        type="checkbox"
      />
      {label && (
        <label
          className="cursor-pointer text-muted-foreground text-sm"
          htmlFor={inputId}
        >
          {label}
        </label>
      )}
    </div>
  );
}

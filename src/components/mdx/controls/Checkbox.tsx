"use client";

import { useId } from "react";
import "./controls.css";

export interface CheckboxProps {
  "aria-label"?: string;
  checked?: boolean;
  disabled?: boolean;
  id?: string;
  label?: string;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({
  id,
  label,
  "aria-label": ariaLabel,
  checked = false,
  disabled,
  onChange,
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="flex items-center gap-2">
      <input
        aria-label={ariaLabel ?? label}
        checked={checked}
        className="mdx-checkbox"
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

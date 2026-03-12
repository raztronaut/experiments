"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import "./controls.css";

export interface RangeProps {
  "aria-label"?: string;
  debounce?: number;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  hideDots?: boolean;
  id?: string;
  label?: string;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  size?: "md" | "sm";
  step?: number;
  value?: number;
}

const MAX_DOTS = 25;

export function Range({
  id,
  label,
  "aria-label": ariaLabel,
  value = 50,
  min = 0,
  max = 100,
  step = 1,
  debounce = 0,
  disabled,
  onChange,
  formatValue,
  hideDots,
  size = "md",
}: RangeProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebouncedValue(localValue, debounce);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debounce > 0) {
      onChangeRef.current?.(debouncedValue);
    }
  }, [debouncedValue, debounce]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: sync external value without re-triggering our own writes
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number.parseFloat(e.target.value);
    setLocalValue(next);
    if (debounce === 0) {
      onChangeRef.current?.(next);
    }
  };

  const displayValue = formatValue
    ? formatValue(localValue)
    : localValue.toFixed(2);

  const fillPct = useMemo(
    () => ((localValue - min) / (max - min)) * 100,
    [localValue, min, max]
  );

  const stepsCount = Math.floor((max - min) / step) + 1;
  const showDots = !hideDots && stepsCount <= MAX_DOTS;

  return (
    <div
      className={`mdx-slider-pill mdx-slider-pill--${size}`}
      data-disabled={disabled || undefined}
    >
      <input
        aria-label={ariaLabel ?? label ?? "Slider"}
        className="mdx-slider-input"
        disabled={disabled}
        id={inputId}
        max={max}
        min={min}
        onChange={handleChange}
        step={step}
        type="range"
        value={localValue}
      />

      <div className="mdx-slider-fill" style={{ width: `${fillPct}%` }} />

      {showDots && (
        <div className="mdx-slider-dots">
          {Array.from({ length: stepsCount }).map((_, i) => {
            const stepVal = min + i * step;
            const pos = ((stepVal - min) / (max - min)) * 100;
            const isNearEdge = pos < 2 || pos > 98;
            return (
              <div
                className="mdx-slider-dot"
                key={stepVal}
                style={{
                  left: `${pos}%`,
                  opacity: isNearEdge ? 0 : pos < fillPct ? 0.3 : 0.6,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="mdx-slider-labels">
        {label && <span className="mdx-slider-label-left">{label}</span>}
        <span className="mdx-slider-label-right">{displayValue}</span>
      </div>
    </div>
  );
}

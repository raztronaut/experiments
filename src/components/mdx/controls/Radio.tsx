"use client";

import {
  type ChangeEvent,
  createContext,
  type ReactNode,
  useContext,
  useId,
} from "react";
import "./controls.css";

interface RadioContextValue {
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export interface RadioGroupProps {
  children: ReactNode;
  direction?: "horizontal" | "vertical";
  name?: string;
  onChange?: (value: string) => void;
}

function RadioGroup({
  children,
  direction = "horizontal",
  name,
  onChange,
}: RadioGroupProps) {
  const autoName = useId();
  const groupName = name ?? autoName;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <RadioContext value={{ name: groupName, onChange: handleChange }}>
      <div
        className={`flex gap-3 ${direction === "vertical" ? "flex-col" : "items-center"}`}
        role="radiogroup"
      >
        {children}
      </div>
    </RadioContext>
  );
}

export interface RadioItemProps {
  "aria-label"?: string;
  checked?: boolean;
  disabled?: boolean;
  id?: string;
  label?: string;
  value: string;
}

function RadioItem({
  id,
  label,
  "aria-label": ariaLabel,
  checked = false,
  disabled,
  value,
}: RadioItemProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const ctx = useContext(RadioContext);

  if (!ctx) {
    console.warn("Radio.Item must be rendered within a Radio.Group component!");
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <input
        aria-label={ariaLabel ?? label}
        checked={checked}
        className="mdx-radio"
        disabled={disabled}
        id={inputId}
        name={ctx.name}
        onChange={ctx.onChange}
        type="radio"
        value={value}
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
RadioItem.displayName = "RadioItem";

export const Radio = {
  Group: RadioGroup,
  Item: RadioItem,
};

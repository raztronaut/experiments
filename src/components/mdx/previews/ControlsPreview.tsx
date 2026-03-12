"use client";

import { useState } from "react";
import { Checkbox, ControlGroup, Radio, Range, Switch } from "../controls";
import { PreviewShell } from "./PreviewShell";

export function ControlsPreview() {
  const [checked, setChecked] = useState(false);
  const [toggled, setToggled] = useState(true);
  const [radio, setRadio] = useState("a");
  const [range, setRange] = useState(60);
  return (
    <PreviewShell>
      <ControlGroup columns={1}>
        <Checkbox
          checked={checked}
          label="Enable animations"
          onChange={setChecked}
        />
        <Switch label="Dark mode" onChange={setToggled} toggled={toggled} />
        <Radio.Group name="quality" onChange={setRadio}>
          <Radio.Item checked={radio === "a"} label="Low" value="a" />
          <Radio.Item checked={radio === "b"} label="Medium" value="b" />
          <Radio.Item checked={radio === "c"} label="High" value="c" />
        </Radio.Group>
        <Range
          formatValue={(v) => `${v}%`}
          label="Opacity"
          max={100}
          min={0}
          onChange={setRange}
          step={5}
          value={range}
        />
      </ControlGroup>
    </PreviewShell>
  );
}

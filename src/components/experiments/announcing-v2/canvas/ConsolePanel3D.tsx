"use client";

import { DiagnosticScreen } from "./console/DiagnosticScreen";
import { ScreenFrame } from "./console/ScreenFrame";
import { StatusLED, TactileButton } from "./console/TactileButton";
import { TelemetryScreen } from "./console/TelemetryScreen";

export function ConsolePanel3D() {
  return (
    <group position={[0, -2, -5]} rotation={[-Math.PI * 0.1, 0, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[16, 1.2, 7]} />
        <meshStandardMaterial
          color="#08080a"
          metalness={0.05}
          roughness={0.95}
        />
      </mesh>

      <ScreenFrame
        position={[0, 0.8, 1]}
        size={[7, 4]}
        title="PRIME OPS // G01"
      >
        <DiagnosticScreen />
      </ScreenFrame>

      <ScreenFrame
        position={[-5, 0.6, 2]}
        rotation={[0, Math.PI * 0.15, 0]}
        size={[3, 3]}
        title="SYS_MON 01"
      >
        <TelemetryScreen color="#ff4444" title="VIBRATION" type="wave" />
      </ScreenFrame>
      <ScreenFrame
        position={[5, 0.6, 2]}
        rotation={[0, -Math.PI * 0.15, 0]}
        size={[3, 3]}
        title="SYS_MON 02"
      >
        <TelemetryScreen color="#44ff44" title="BANDWIDTH" type="bars" />
      </ScreenFrame>

      <ScreenFrame
        position={[-8, 0.4, 3]}
        rotation={[0, Math.PI * 0.25, 0]}
        size={[2.5, 2]}
        title="AUX A"
      >
        <TelemetryScreen color="#ffaa44" title="THERMAL" type="bits" />
      </ScreenFrame>
      <ScreenFrame
        position={[8, 0.4, 3]}
        rotation={[0, -Math.PI * 0.25, 0]}
        size={[2.5, 2]}
        title="AUX B"
      >
        <TelemetryScreen color="#4488ff" title="GRAVITY" type="bits" />
      </ScreenFrame>

      <group position={[0, 0.6, 4]}>
        <TactileButton color="#ff4444" label="PWR" position={[-6.5, 0, 0]} />
        <TactileButton color="#4488ff" label="COM" position={[-5.5, 0, 0]} />
        <TactileButton color="#44ff44" label="NAV" position={[-4.5, 0, 0]} />

        <StatusLED color="#44ff44" position={[-3, 0, 0.2]} />
        <StatusLED color="#44ff44" position={[-2.7, 0, 0.2]} />
        <StatusLED color="#ff4444" position={[-2.4, 0, 0.2]} />

        <TactileButton color="#ffaa44" label="RST" position={[4.5, 0, 0]} />
        <TactileButton color="#ff4444" label="IGN" position={[5.5, 0, 0]} />
        <TactileButton color="#4488ff" label="ENG" position={[6.5, 0, 0]} />
      </group>
    </group>
  );
}

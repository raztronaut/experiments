import type * as THREE from "three";

export interface RibbonProps {
  amplitude?: number;
  backClamp?: number;
  backOffset?: [number, number];
  backScale?: [number, number];
  backsideImage?: THREE.Texture | null;
  backsideText?: string;
  color: string;
  fontFamily?: string;
  fontWeight?: string;
  frequency?: number;
  height?: number;
  padding?: number;
  position: [number, number, number];
  rotation: [number, number, number];
  seed?: number;
  speed?: number;
  subscript?: string;
  text: string;
  textSpeed?: number;
  thickness?: number;
  width?: number;
}

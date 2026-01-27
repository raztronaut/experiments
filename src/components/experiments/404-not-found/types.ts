import * as THREE from "three";

export interface RibbonProps {
    text: string;
    position: [number, number, number];
    rotation: [number, number, number];
    color: string;
    width?: number;
    height?: number;
    thickness?: number;
    speed?: number;
    frequency?: number;
    amplitude?: number;
    padding?: number;
    subscript?: string;
    backsideText?: string;
    backsideImage?: THREE.Texture | null;
    backOffset?: [number, number];
    backScale?: [number, number];
    backClamp?: number;
    textSpeed?: number;
    fontFamily?: string;
    fontWeight?: string;
    seed?: number;
}

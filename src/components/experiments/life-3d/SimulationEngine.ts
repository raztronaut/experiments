/**
 * 3D Game of Life Simulation Engine
 * Each cell has 26 neighbors in a 3x3x3 volume (excluding itself).
 */

export interface Life3dRules {
  birth: number[];
  survival: number[];
}

export type Grid = Uint8Array;
export type FloatGrid = Float32Array;

export class SimulationEngine {
  private readonly width: number;
  private readonly height: number;
  private readonly depth: number;
  private readonly size: number;
  public grid: Grid;
  private nextGrid: Grid;
  public intensities: FloatGrid;
  public ages: Uint16Array;
  public rules: Life3dRules;

  constructor(
    width: number,
    height: number,
    depth: number,
    rules?: Life3dRules
  ) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.size = width * height * depth;
    this.grid = new Uint8Array(this.size);
    this.nextGrid = new Uint8Array(this.size);
    this.intensities = new Float32Array(this.size);
    this.ages = new Uint16Array(this.size);
    this.rules = rules || {
      survival: [4, 5],
      birth: [5],
    };
  }

  private getIndex(x: number, y: number, z: number): number {
    // Wrapping coordinates
    const wx = (x + this.width) % this.width;
    const wy = (y + this.height) % this.height;
    const wz = (z + this.depth) % this.depth;
    return wx + wy * this.width + wz * this.width * this.height;
  }

  public seed(density = 0.1) {
    for (let i = 0; i < this.size; i++) {
      const isAlive = Math.random() < density ? 1 : 0;
      this.grid[i] = isAlive;
      this.intensities[i] = isAlive ? 1.0 : 0.0;
      this.ages[i] = isAlive ? 1 : 0;
    }
  }

  public step(decay = 0.85) {
    for (let z = 0; z < this.depth; z++) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const neighbors = this.countNeighbors(x, y, z);
          const currentIdx = this.getIndex(x, y, z);
          const isAlive = this.grid[currentIdx] === 1;

          let willBeAlive = false;
          if (isAlive) {
            willBeAlive = this.rules.survival.includes(neighbors);
          } else {
            willBeAlive = this.rules.birth.includes(neighbors);
          }

          this.nextGrid[currentIdx] = willBeAlive ? 1 : 0;

          // Update intensity and age
          if (willBeAlive) {
            this.intensities[currentIdx] = 1.0;
            this.ages[currentIdx] = isAlive
              ? Math.min(this.ages[currentIdx] + 1, 65_535)
              : 1;
          } else {
            this.intensities[currentIdx] *= decay;
            if (this.intensities[currentIdx] < 0.01) {
              this.intensities[currentIdx] = 0;
              this.ages[currentIdx] = 0;
            }
          }
        }
      }
    }

    // Swap grids
    const temp = this.grid;
    this.grid = this.nextGrid;
    this.nextGrid = temp;
  }

  private countNeighbors(cx: number, cy: number, cz: number): number {
    let count = 0;
    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0 && dz === 0) {
            continue;
          }
          if (this.grid[this.getIndex(cx + dx, cy + dy, cz + dz)] === 1) {
            count++;
          }
        }
      }
    }
    return count;
  }

  public getGrid(): Grid {
    return this.grid;
  }
  public getIntensities(): FloatGrid {
    return this.intensities;
  }
  public getAges(): Uint16Array {
    return this.ages;
  }
  public getDimensions() {
    return { width: this.width, height: this.height, depth: this.depth };
  }
}

import normalizeWheel from "normalize-wheel";
import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shaders";

interface Size {
  height: number;
  width: number;
}

interface Props {
  camera: THREE.Camera;
  scene: THREE.Scene;
  sizes: Size;
}

interface ImageInfo {
  aspectRatio: number;
  height: number;
  uvs: {
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
  };
  width: number;
}

export default class VisualiserLogic {
  scene: THREE.Scene;
  geometry!: THREE.PlaneGeometry;
  material!: THREE.ShaderMaterial;
  mesh!: THREE.InstancedMesh;
  meshCount = 400;
  sizes: Size;
  drag: {
    xCurrent: number;
    xTarget: number;
    yCurrent: number;
    yTarget: number;
    isDown: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  } = {
    xCurrent: 0,
    xTarget: 0,
    yCurrent: 0,
    yTarget: 0,
    isDown: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  };
  shaderParameters = {
    maxX: 0,
    maxY: 0,
  };
  scrollY: {
    target: number;
    current: number;
    direction: number;
  } = {
    target: 0,
    current: 0,
    direction: 0,
  };
  dragSensitivity = 1;
  dragDamping = 0.1;
  dragElement?: HTMLElement;
  imageInfos: ImageInfo[] = [];
  atlasTexture: THREE.Texture | null = null;
  blurryAtlasTexture: THREE.Texture | null = null;

  camera: THREE.Camera;
  raycaster: THREE.Raycaster = new THREE.Raycaster();

  constructor({ scene, sizes, camera }: Props) {
    this.scene = scene;
    this.sizes = sizes;
    this.camera = camera;

    this.shaderParameters = {
      maxX: this.sizes.width * 2,
      maxY: this.sizes.height * 2,
    };

    this.createGeometry();
    this.createMaterial();
    this.createInstancedMesh();
    this.fetchCovers();

    // Global wheel listener; removed in dispose().
    window.addEventListener("wheel", this.onWheel);
  }

  dispose() {
    window.removeEventListener("wheel", this.onWheel);
    if (this.dragElement) {
      this.dragElement.removeEventListener("pointerdown", this._onPointerDown);
      window.removeEventListener("pointermove", this._onPointerMove);
      window.removeEventListener("pointerup", this._onPointerUp);
    }
    this.geometry.dispose();
    this.material.dispose();
    // Dispose textures
    this.atlasTexture?.dispose();
    this.blurryAtlasTexture?.dispose();
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    // Scale to a good base size
    this.geometry.scale(2, 2, 2);
  }

  async fetchCovers() {
    // Load local frames
    const urls: string[] = new Array(20)
      .fill(0)
      .map(
        (_, i) =>
          `/experiments/rabbithole-chat-gallery-explore/frames/${i + 1}.jpg`
      );

    await this.loadTextureAtlas(urls);
    this.createBlurryAtlas();
    this.fillMeshData();
  }

  async loadTextureAtlas(urls: string[]) {
    // Load all images with CORS-safe approach
    const imagePromises = urls.map(async (path) => {
      try {
        const res = await fetch(path, { mode: "cors" });
        if (!res.ok) {
          throw new Error(`Failed to fetch image: ${path}`);
        }
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);
        return bitmap as CanvasImageSource;
      } catch {
        // Fallback to HTMLImageElement with crossOrigin
        return await new Promise<CanvasImageSource>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = path;
        });
      }
    });

    const images = await Promise.all(imagePromises);
    if (images.length === 0) {
      return;
    }

    // Calculate atlas dimensions (stacking vertically)
    // We need to cast to any or a type with width/height because CanvasImageSource union is tricky
    const atlasWidth = Math.max(
      ...images.map((img) => (img as { width: number }).width)
    );
    let totalHeight = 0;

    // First pass: calculate total height with padding to prevent bleeding
    const padding = 2;
    images.forEach((img) => {
      totalHeight += (img as { height: number }).height + padding;
    });

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = atlasWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext("2d")!;

    // Second pass: draw images and calculate normalized coordinates
    let currentY = 0;
    this.imageInfos = images.map((img) => {
      // CanvasImageSource members don't all expose width/height; narrow to the
      // subset we draw.
      const source = img as { width: number; height: number };
      const aspectRatio = source.width / source.height;

      // Draw the image with rounded corners
      // Radius ~40px to look like 1rem on these large ~1000px images
      const r = 40;
      const x = 0;
      const y = currentY;
      const w = source.width;
      const h = source.height;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img as CanvasImageSource, 0, currentY);
      ctx.restore();

      const info = {
        width: source.width,
        height: source.height,
        aspectRatio,
        uvs: {
          xStart: 0,
          xEnd: source.width / atlasWidth,

          // Invert Y for UVs (Canvas 0 is Top, UV 0 is Bottom)
          // We map the image area [currentY, currentY + height]
          yStart: 1 - currentY / totalHeight,
          yEnd: 1 - (currentY + source.height) / totalHeight,
        },
      };

      currentY += source.height + padding;
      return info;
    });

    // Create texture from canvas
    this.atlasTexture = new THREE.Texture(canvas);
    this.atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.atlasTexture.minFilter = THREE.LinearFilter;
    this.atlasTexture.magFilter = THREE.LinearFilter;
    // Fix premultiplied alpha issue:
    // Canvas is premultiplied. If we tell Three.js this, it might blending better.
    // However, standard technique with transparency is usually straight alpha in Three.
    // Let's rely on the shader discard for the artifacts.
    this.atlasTexture.needsUpdate = true;
    this.material.uniforms.uAtlas.value = this.atlasTexture;
  }

  createBlurryAtlas() {
    if (!this.atlasTexture) {
      return;
    }

    const source = this.atlasTexture.image as HTMLCanvasElement;
    const blurryCanvas = document.createElement("canvas");
    blurryCanvas.width = source.width;
    blurryCanvas.height = source.height;
    const ctx = blurryCanvas.getContext("2d")!;
    ctx.filter = "blur(100px)";
    ctx.drawImage(source, 0, 0);

    this.blurryAtlasTexture = new THREE.Texture(blurryCanvas);
    this.blurryAtlasTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.blurryAtlasTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.blurryAtlasTexture.minFilter = THREE.LinearFilter;
    this.blurryAtlasTexture.magFilter = THREE.LinearFilter;
    this.blurryAtlasTexture.needsUpdate = true;
    this.material.uniforms.uBlurryAtlas.value = this.blurryAtlasTexture;
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uMaxXdisplacement: {
          value: new THREE.Vector2(
            this.shaderParameters.maxX,
            this.shaderParameters.maxY
          ),
        },
        uAtlas: new THREE.Uniform(this.atlasTexture),
        uBlurryAtlas: new THREE.Uniform(this.blurryAtlasTexture),
        uScrollY: { value: 0 },
        uSpeedY: { value: 0 },
        uDrag: { value: new THREE.Vector2(0, 0) },
      },
    });
  }

  createInstancedMesh() {
    this.mesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      this.meshCount
    );
    this.scene.add(this.mesh);
  }

  fillMeshData() {
    if (this.imageInfos.length === 0) {
      return;
    }

    const initialPosition = new Float32Array(this.meshCount * 3);
    const meshSpeed = new Float32Array(this.meshCount);
    const aTextureCoords = new Float32Array(this.meshCount * 4);

    for (let i = 0; i < this.meshCount; i++) {
      // Random positions
      initialPosition[i * 3 + 0] =
        (Math.random() - 0.5) * this.shaderParameters.maxX * 2; // x
      initialPosition[i * 3 + 1] =
        (Math.random() - 0.5) * this.shaderParameters.maxY * 2; // y

      //from -15 to 7 - Depth
      initialPosition[i * 3 + 2] = Math.random() * (7 - -30) - 30; // z

      meshSpeed[i] = Math.random() * 0.5 + 0.5;

      const imageIndex = i % this.imageInfos.length;

      aTextureCoords[i * 4 + 0] = this.imageInfos[imageIndex].uvs.xStart;
      aTextureCoords[i * 4 + 1] = this.imageInfos[imageIndex].uvs.xEnd;
      aTextureCoords[i * 4 + 2] = this.imageInfos[imageIndex].uvs.yStart;
      aTextureCoords[i * 4 + 3] = this.imageInfos[imageIndex].uvs.yEnd;
    }

    this.geometry.setAttribute(
      "aInitialPosition",
      new THREE.InstancedBufferAttribute(initialPosition, 3)
    );
    this.geometry.setAttribute(
      "aMeshSpeed",
      new THREE.InstancedBufferAttribute(meshSpeed, 1)
    );

    this.mesh.geometry.setAttribute(
      "aTextureCoords",
      new THREE.InstancedBufferAttribute(aTextureCoords, 4)
    );

    // Add aspect ratio attribute
    const aAspectRatio = new Float32Array(this.meshCount);
    for (let i = 0; i < this.meshCount; i++) {
      const imageIndex = i % this.imageInfos.length;
      aAspectRatio[i] = this.imageInfos[imageIndex].aspectRatio;
    }
    this.mesh.geometry.setAttribute(
      "aAspectRatio",
      new THREE.InstancedBufferAttribute(aAspectRatio, 1)
    );
  }

  private _onPointerDown = (e: PointerEvent) => {
    this.drag.isDown = true;
    this.drag.startX = e.clientX;
    this.drag.startY = e.clientY;
    this.drag.lastX = e.clientX;
    this.drag.lastY = e.clientY;
    if (this.dragElement) {
      this.dragElement.setPointerCapture(e.pointerId);
    }
  };

  private _onPointerMove = (e: PointerEvent) => {
    if (!this.drag.isDown) {
      return;
    }
    const dx = e.clientX - this.drag.lastX;
    const dy = e.clientY - this.drag.lastY;
    this.drag.lastX = e.clientX;
    this.drag.lastY = e.clientY;

    // Convert pixels to world units proportionally to viewport size
    const worldPerPixelX =
      (this.sizes.width / window.innerWidth) * this.dragSensitivity;
    const worldPerPixelY =
      (this.sizes.height / window.innerHeight) * this.dragSensitivity;

    this.drag.xTarget += -dx * worldPerPixelX;
    this.drag.yTarget += dy * worldPerPixelY;
  };

  private _onPointerUp = (e: PointerEvent) => {
    const dx = e.clientX - this.drag.startX;
    const dy = e.clientY - this.drag.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // If movement is very small, treat as click
    if (dist < 5) {
      this.handleClick(e.clientX, e.clientY);
    }

    this.drag.isDown = false;
    try {
      if (this.dragElement) {
        this.dragElement.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  handleClick(clientX: number, clientY: number) {
    // Normalize mouse coordinates
    const mouse = new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, this.camera);

    // CPU-side "raycasting" by checking intersection with each plane's computed position
    const attributes = this.geometry.attributes;
    const aInitialPosition = attributes.aInitialPosition;
    const aMeshSpeed = attributes.aMeshSpeed;
    const aAspectRatioBuffer = this.mesh.geometry.attributes.aAspectRatio;

    const uniforms = this.material.uniforms;
    const uTime = uniforms.uTime.value;
    const uDrag = uniforms.uDrag.value;
    const uScrollY = uniforms.uScrollY.value;
    const uMaxX = uniforms.uMaxXdisplacement.value.x;
    const uMaxY = uniforms.uMaxXdisplacement.value.y;

    // Constants from shader
    const maxZ = 12.0;
    const minZ = -30.0;
    const floatSpeed = 0.5;
    const floatAmp = 0.2;

    let closestDist = Number.POSITIVE_INFINITY;
    let hitIndex = -1;

    // Plane normal is +Z (0, 0, 1) since they face the camera and are not rotated
    const planeNormal = new THREE.Vector3(0, 0, 1);
    const rayDir = this.raycaster.ray.direction;
    const rayOrigin = this.raycaster.ray.origin;

    for (let i = 0; i < this.meshCount; i++) {
      // Replicate Shader Logic
      const ix = aInitialPosition.getX(i);
      const iy = aInitialPosition.getY(i);
      const iz = aInitialPosition.getZ(i);
      const speed = aMeshSpeed.getX(i);
      const aspectRatio = aAspectRatioBuffer.getX(i);

      // Displacement calculations
      const maxZoffset = Math.abs(iz - maxZ); // distance logic: distance(a, b) = abs(a-b) in 1D
      const minZoffset = Math.abs(iz - minZ);

      // mod logic: mod(a, b) = a - b * floor(a/b). JS % operator matches if positive, check signs.
      // Shader uses floats. JS % can return negative.
      // Helper for shader mod:
      const shaderMod = (x: number, y: number) => {
        return x - y * Math.floor(x / y);
      };

      const zDisp =
        shaderMod(uScrollY + minZoffset, maxZoffset + minZoffset) - minZoffset;

      // Floating effect
      const zFloat = Math.sin(uTime * floatSpeed * speed + ix) * floatAmp;

      const currentZ = iz + zDisp + zFloat;

      // Check Visibility (optimization)
      // vVisibility = remap(newPosition.z, minZ, minZ+5.);
      // If z < minZ, it's fading out/invisible? Remap clamps [0,1].
      // If z is way behind or too far, maybe skip.
      // Current depth range in shader: usually visible between minZ and maxZ.

      // Calculating Plane intersection
      // Ray: O + tD. Plane: (P - Center) . N = 0
      // t = (Center - O) . N / (D . N)
      // Center.z is currentZ. Center.x/y needed?
      // Plane is at Z = currentZ.

      const denom = rayDir.dot(planeNormal);
      if (Math.abs(denom) < 1e-6) {
        continue; // Parallel to plane
      }

      const t = (currentZ - rayOrigin.z) / denom;
      if (t < 0) {
        continue; // Behind ray start
      }

      // Intersection point
      const intersectPoint = new THREE.Vector3()
        .copy(rayOrigin)
        .addScaledVector(rayDir, t);

      // Now check if intersection point is within the rectangle bounds of this instance
      // Need X and Y position of instance
      const maxYoffset = Math.abs(iy - uMaxY);
      const minYoffset = Math.abs(iy + uMaxY); // -(-maxY) = +maxY

      const maxXoffset = Math.abs(ix - uMaxX);
      const minXoffset = Math.abs(ix + uMaxX);

      const xDisp =
        shaderMod(
          minXoffset - uDrag.x + uTime * speed,
          maxXoffset + minXoffset
        ) - minXoffset;
      const yDisp =
        shaderMod(minYoffset - uDrag.y, maxYoffset + minYoffset) - minYoffset;

      // Aspect ratio scaling applies to Y coordinate of 'position' (vertex), not the translation.
      // Shader: newPosition.y /= aAspectRatio; newPosition += aInitialPosition;
      // So the CENTER is at (ix + xDisp, iy + yDisp).
      // The EXTENT (half-size) of the plane geometry is:
      // Base scaled (2,2,2) -> width 2, height 2.
      // Aspect applied: width 2, height 2 / aspectRatio.
      // Half-width: 1.0
      // Half-height: 1.0 / aspectRatio

      const centerX = ix + xDisp;
      const centerY = iy + yDisp;

      const dx = Math.abs(intersectPoint.x - centerX);
      const dy = Math.abs(intersectPoint.y - centerY);

      if (dx <= 1.0 && dy <= 1.0 / aspectRatio) {
        // Hit!
        // Check if this is closer than previous hits
        if (t < closestDist) {
          closestDist = t;
          hitIndex = i;
        }
      }
    }

    if (hitIndex !== -1) {
      window.open(
        "https://www.rabbithole.chat/rabbithole/how-did-humans-first-7kjxug9e",
        "_blank"
      );
    }
  }

  bindDrag(element: HTMLElement) {
    this.dragElement = element;
    element.addEventListener("pointerdown", this._onPointerDown);
    window.addEventListener("pointermove", this._onPointerMove);
    window.addEventListener("pointerup", this._onPointerUp);
  }

  onWheel = (event: MouseEvent) => {
    const normalizedWheel = normalizeWheel(event);

    const scrollY =
      (normalizedWheel.pixelY * this.sizes.height) / window.innerHeight;

    this.scrollY.target += scrollY;

    this.material.uniforms.uSpeedY.value += scrollY;
  };

  render(delta: number) {
    // Reference uses normalized delta (approx 1.0 for 60fps)
    // R3F gives delta in seconds (approx 0.016 for 60fps)
    // We multiply by 60 to match the reference logic scale
    const normalizedDelta = delta * 60;

    this.material.uniforms.uTime.value += normalizedDelta * 0.005;

    // Smoothly interpolate current drag towards target
    this.drag.xCurrent +=
      (this.drag.xTarget - this.drag.xCurrent) *
      this
        .dragDamping; /* * normalizedDelta? Reference didn't use it for lerp but maybe implicitly expected it? */
    // Reference code:
    // this.drag.xCurrent += (this.drag.xTarget - this.drag.xCurrent) * this.dragDamping
    // It did NOT use delta. So damping is framerate dependent in reference.
    // We will keep it as is for now to match reference exactly, assuming 60fps.
    this.drag.yCurrent +=
      (this.drag.yTarget - this.drag.yCurrent) * this.dragDamping;

    this.material.uniforms.uDrag.value.set(
      this.drag.xCurrent,
      this.drag.yCurrent
    );

    this.scrollY.current = interpolate(
      this.scrollY.current,
      this.scrollY.target,
      0.12
    );

    this.material.uniforms.uScrollY.value = this.scrollY.current;
    this.material.uniforms.uSpeedY.value *= 0.835;
  }
}

const interpolate = (current: number, target: number, ease: number) => {
  return current + (target - current) * ease;
};

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

export interface CurvedTextScrollProps {
  accentColor?: string;
  cardImages?: string[];
  className?: string;
  dotColor?: string;
  letters?: string[];
}

const DEFAULT_LETTERS = ["W", "O", "R", "K"];
const DEFAULT_CARD_IMAGES = Array.from(
  { length: 7 },
  (_, i) =>
    `https://images.unsplash.com/photo-${
      [
        "1618005182384-a83a8bd57fbe",
        "1614850523459-c2f4c699c52e",
        "1558591710-4b4a1ae0f04d",
        "1579547945413-497e1b99dac0",
        "1541961017774-22349e4a1262",
        "1578301978693-85fa9c0320b9",
        "1549490349-8643362247b5",
      ][i]
    }?w=600&q=80`
);

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  scrollProgress: number
) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = color;
  const spacing = 20;
  const rows = Math.ceil(h / spacing);
  const cols = Math.ceil(w / spacing) + 15;
  const offset = (scrollProgress * spacing * 10) % spacing;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.beginPath();
      ctx.arc(x * spacing - offset, y * spacing, 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Curved 3D text paths with horizontal-scrolling cards + dot grid.
 * Uses Three.js for CatmullRom3 curve projection and CanvasTexture cards.
 */
export function CurvedTextScroll({
  letters = DEFAULT_LETTERS,
  cardImages = DEFAULT_CARD_IMAGES,
  dotColor = "#f40c3f",
  accentColor = "#f40c3f",
  className,
}: CurvedTextScrollProps) {
  const container = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const disposedRef = useRef(false);

  useEffect(() => {
    disposedRef.current = false;
    const mount = container.current;
    if (!mount) {
      return;
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let cleanup: (() => void) | undefined;

    const init = async () => {
      const THREE = await import("three");
      if (disposedRef.current) {
        return;
      }

      const workSection = mount.querySelector<HTMLElement>(".cts-work")!;
      const textContainer = textContainerRef.current!;
      const gridCanvas = gridCanvasRef.current!;
      const gridCtx = gridCanvas.getContext("2d")!;

      const resizeGridCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        gridCanvas.width = window.innerWidth * dpr;
        gridCanvas.height = window.innerHeight * dpr;
        gridCanvas.style.width = `${window.innerWidth}px`;
        gridCanvas.style.height = `${window.innerHeight}px`;
        gridCtx.scale(dpr, dpr);
      };
      resizeGridCanvas();

      if (prefersReduced) {
        drawDotGrid(gridCtx, gridCanvas.width, gridCanvas.height, dotColor, 0);
        return;
      }

      const lettersScene = new THREE.Scene();
      const cardsScene = new THREE.Scene();
      const mkCam = () =>
        new THREE.PerspectiveCamera(
          50,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
      const lettersCamera = mkCam();
      const cardsCamera = mkCam();

      const lettersRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      lettersRenderer.setSize(window.innerWidth, window.innerHeight);
      lettersRenderer.setClearColor(0x00_00_00, 0);
      lettersRenderer.setPixelRatio(window.devicePixelRatio);
      lettersRenderer.domElement.classList.add("cts-letters-canvas");

      const cardsRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      cardsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      cardsRenderer.setSize(window.innerWidth, window.innerHeight);
      cardsRenderer.setClearColor(0x00_00_00, 0);
      cardsRenderer.domElement.classList.add("cts-cards-canvas");

      workSection.appendChild(lettersRenderer.domElement);
      workSection.appendChild(cardsRenderer.domElement);

      const createPath = (yPos: number, amplitude: number) => {
        const points = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          points.push(
            new THREE.Vector3(
              -25 + 50 * t,
              yPos + Math.sin(t * Math.PI) * -amplitude,
              (1 - (Math.abs(t - 0.5) * 2) ** 2) * -5
            )
          );
        }
        return new THREE.CatmullRomCurve3(points);
      };

      const curves = [
        createPath(10, 2),
        createPath(3.5, 1),
        createPath(-3.5, -1),
        createPath(-10, -2),
      ];
      const lineSpeedMultipliers = [0.8, 1, 0.7, 0.9];

      interface LP {
        current: { x: number; y: number };
        target: { x: number; y: number };
      }
      const letterPositions = new Map<HTMLElement, LP>();

      const letterGroups = curves.map((_curve, ci) =>
        Array.from({ length: 15 }, () => {
          const el = document.createElement("div");
          el.className = "cts-letter";
          el.textContent = letters[ci] ?? "X";
          el.style.color = accentColor;
          textContainer.appendChild(el);
          letterPositions.set(el, {
            current: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
          });
          return el;
        })
      );

      const imgTextures = await Promise.all(
        cardImages.map(
          (url) =>
            new Promise<InstanceType<typeof THREE.Texture>>((resolve) => {
              new THREE.TextureLoader().load(url, (tex) => {
                tex.generateMipmaps = true;
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                resolve(tex);
              });
            })
        )
      );

      const texCanvas = document.createElement("canvas");
      texCanvas.width = 4096;
      texCanvas.height = 2048;
      const texCtx = texCanvas.getContext("2d")!;

      const drawCards = (offset = 0) => {
        texCtx.clearRect(0, 0, texCanvas.width, texCanvas.height);
        const cw = texCanvas.width / 3;
        const ch = texCanvas.height / 2;
        const sp = texCanvas.width / 2.5;
        imgTextures.forEach((tex, i) => {
          if (tex.image) {
            texCtx.drawImage(
              tex.image as CanvasImageSource,
              i * sp + (0.35 - offset) * texCanvas.width * 5 - cw,
              (texCanvas.height - ch) / 2,
              cw,
              ch
            );
          }
        });
      };

      const cardsTexture = new THREE.CanvasTexture(texCanvas);
      cardsTexture.wrapS = THREE.RepeatWrapping;
      cardsTexture.wrapT = THREE.RepeatWrapping;
      cardsTexture.generateMipmaps = true;
      cardsTexture.minFilter = THREE.LinearMipmapLinearFilter;
      cardsTexture.magFilter = THREE.LinearFilter;
      cardsTexture.anisotropy = cardsRenderer.capabilities.getMaxAnisotropy();

      const cardsPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 15, 50, 1),
        new THREE.MeshBasicMaterial({
          map: cardsTexture,
          side: THREE.DoubleSide,
          transparent: true,
          depthTest: false,
          depthWrite: false,
        })
      );
      cardsScene.add(cardsPlane);

      const positions = cardsPlane.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        positions.setZ(i, (positions.getX(i) / 15) ** 2 * 5);
      }
      positions.needsUpdate = true;

      lettersCamera.position.setZ(20);
      cardsCamera.position.setZ(20);

      const updateTargets = (scrollProgress: number) => {
        curves.forEach((curve, ci) => {
          const group = letterGroups[ci];
          if (!group) {
            return;
          }
          group.forEach((el, i) => {
            const pt = curve.getPoint(
              (i / 14 + scrollProgress * (lineSpeedMultipliers[ci] ?? 1)) % 1
            );
            const vec = pt.clone().project(lettersCamera);
            const pos = letterPositions.get(el);
            if (pos) {
              pos.target = {
                x: (-vec.x * 0.5 + 0.5) * window.innerWidth,
                y: (-vec.y * 0.5 + 0.5) * window.innerHeight,
              };
            }
          });
        });
      };

      const updateLetterPos = () => {
        letterPositions.forEach((pos, el) => {
          if (
            Math.abs(pos.target.x - pos.current.x) >
            window.innerWidth * 0.7
          ) {
            pos.current.x = pos.target.x;
            pos.current.y = pos.target.y;
          } else {
            pos.current.x = lerp(pos.current.x, pos.target.x, 0.07);
            pos.current.y = lerp(pos.current.y, pos.target.y, 0.07);
          }
          el.style.transform = `translate(-50%, -50%) translate3d(${pos.current.x}px, ${pos.current.y}px, 0px)`;
        });
      };

      let rafId = 0;
      const animate = () => {
        if (disposedRef.current) {
          return;
        }
        updateLetterPos();
        lettersRenderer.render(lettersScene, lettersCamera);
        cardsRenderer.render(cardsScene, cardsCamera);
        rafId = requestAnimationFrame(animate);
      };

      const st = ScrollTrigger.create({
        trigger: ".cts-work",
        start: "top top",
        end: "+=700%",
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          updateTargets(self.progress);
          drawCards(self.progress);
          drawDotGrid(
            gridCtx,
            gridCanvas.width,
            gridCanvas.height,
            dotColor,
            self.progress
          );
          cardsTexture.needsUpdate = true;
        },
      });

      drawDotGrid(gridCtx, gridCanvas.width, gridCanvas.height, dotColor, 0);
      animate();
      updateTargets(0);

      const onResize = () => {
        resizeGridCanvas();
        drawDotGrid(
          gridCtx,
          gridCanvas.width,
          gridCanvas.height,
          dotColor,
          st.progress ?? 0
        );
        for (const cam of [lettersCamera, cardsCamera]) {
          cam.aspect = window.innerWidth / window.innerHeight;
          cam.updateProjectionMatrix();
        }
        for (const r of [lettersRenderer, cardsRenderer]) {
          r.setSize(window.innerWidth, window.innerHeight);
        }
        cardsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        updateTargets(st.progress ?? 0);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        st.kill();
        window.removeEventListener("resize", onResize);
        imgTextures.forEach((t) => t.dispose());
        cardsTexture.dispose();
        cardsPlane.geometry.dispose();
        if ("dispose" in cardsPlane.material) {
          (cardsPlane.material as { dispose: () => void }).dispose();
        }
        lettersRenderer.dispose();
        cardsRenderer.dispose();
        if (workSection.contains(lettersRenderer.domElement)) {
          workSection.removeChild(lettersRenderer.domElement);
        }
        if (workSection.contains(cardsRenderer.domElement)) {
          workSection.removeChild(cardsRenderer.domElement);
        }
        textContainer.innerHTML = "";
      };
    };

    init();
    return () => {
      disposedRef.current = true;
      cleanup?.();
    };
  }, [letters, cardImages, dotColor, accentColor]);

  return (
    <div className={`cts-container ${className ?? ""}`.trim()} ref={container}>
      <section className="cts-work">
        <canvas className="cts-grid-canvas" ref={gridCanvasRef} />
        <div className="cts-text-container" ref={textContainerRef} />
      </section>
    </div>
  );
}

export default CurvedTextScroll;

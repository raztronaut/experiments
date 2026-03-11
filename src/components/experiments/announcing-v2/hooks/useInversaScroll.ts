import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";
import { phaseValue, smoothEase } from "../utils";

gsap.registerPlugin(ScrollTrigger);

interface InversaScrollRefs {
  container: RefObject<HTMLDivElement | null>;
  heroContent: RefObject<HTMLDivElement | null>;
  heroGridOverlay: RefObject<HTMLDivElement | null>;
  heroImg: RefObject<HTMLDivElement | null>;
  heroImgElement: RefObject<HTMLImageElement | null>;
  heroMask: RefObject<HTMLDivElement | null>;
  marker1: RefObject<HTMLDivElement | null>;
  marker2: RefObject<HTMLDivElement | null>;
  progressBar: RefObject<HTMLDivElement | null>;
}

interface InversaScrollParams {
  desatEnd: number;
  desatStart: number;
  maskScaleMax: number;
  maskScaleMin: number;
  resatEnd: number;
  resatStart: number;
}

export function useInversaScroll(
  refs: InversaScrollRefs,
  scrollParams: InversaScrollParams,
  blockCount: number,
  reducedMotion: boolean
) {
  useGSAP(
    () => {
      const heroContent = refs.heroContent.current;
      const heroImg = refs.heroImg.current;
      const heroImgElement = refs.heroImgElement.current;
      const heroMask = refs.heroMask.current;
      const heroGridOverlay = refs.heroGridOverlay.current;
      const marker1 = refs.marker1.current;
      const marker2 = refs.marker2.current;
      const progressBar = refs.progressBar.current;

      if (
        !(
          heroContent &&
          heroImg &&
          heroImgElement &&
          heroMask &&
          heroGridOverlay &&
          marker1 &&
          marker2 &&
          progressBar
        )
      ) {
        return;
      }

      const heroContentHeight = heroContent.offsetHeight;
      const viewportHeight = window.innerHeight;
      const heroContentMoveDistance = heroContentHeight - viewportHeight;

      const heroImgHeight = heroImg.offsetHeight;
      const heroImgMoveDistance = heroImgHeight - viewportHeight;

      if (reducedMotion) {
        gsap.set(heroMask, { scale: 2.5 });
        gsap.set(heroImgElement, { filter: "saturate(1)" });
        gsap.set(heroImg, { "--overlay-opacity": 0.35 });
        gsap.set(heroGridOverlay, { opacity: 0 });
        gsap.set(marker1, { opacity: 0 });
        gsap.set(marker2, { opacity: 0 });
        return;
      }

      ScrollTrigger.create({
        trigger: ".inversa-hero",
        start: "top top",
        end: `+=${window.innerHeight * blockCount}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          gsap.set(progressBar, { "--progress": self.progress });
          gsap.set(heroContent, {
            y: -self.progress * heroContentMoveDistance,
          });

          let heroImgProgress: number;
          if (self.progress <= 0.45) {
            heroImgProgress = smoothEase(self.progress / 0.45) * 0.65;
          } else if (self.progress <= 0.75) {
            heroImgProgress = 0.65;
          } else {
            heroImgProgress =
              0.65 + smoothEase((self.progress - 0.75) / 0.25) * 0.35;
          }

          gsap.set(heroImg, { y: heroImgProgress * heroImgMoveDistance });

          let heroMaskScale: number;
          let heroImgSaturation: number;
          let heroImgOverlayOpacity: number;

          const {
            maskScaleMax,
            maskScaleMin,
            desatStart,
            desatEnd,
            resatStart,
            resatEnd,
          } = scrollParams;
          const scaleDelta = maskScaleMax - maskScaleMin;
          const desatDuration = desatEnd - desatStart;
          const resatDuration = resatEnd - resatStart;

          if (self.progress <= desatStart) {
            heroMaskScale = maskScaleMax;
            heroImgSaturation = 1;
            heroImgOverlayOpacity = 0.35;
          } else if (self.progress <= desatEnd) {
            const phaseProgress = smoothEase(
              (self.progress - desatStart) / desatDuration
            );
            heroMaskScale = maskScaleMax - phaseProgress * scaleDelta;
            heroImgSaturation = 1 - phaseProgress;
            heroImgOverlayOpacity = 0.35 + phaseProgress * 0.35;
          } else if (self.progress <= resatStart) {
            heroMaskScale = maskScaleMin;
            heroImgSaturation = 0;
            heroImgOverlayOpacity = 0.7;
          } else if (self.progress <= resatEnd) {
            const phaseProgress = smoothEase(
              (self.progress - resatStart) / resatDuration
            );
            heroMaskScale = maskScaleMin + phaseProgress * scaleDelta;
            heroImgSaturation = phaseProgress;
            heroImgOverlayOpacity = 0.7 - phaseProgress * 0.35;
          } else {
            heroMaskScale = maskScaleMax;
            heroImgSaturation = 1;
            heroImgOverlayOpacity = 0.35;
          }

          gsap.set(heroMask, { scale: heroMaskScale });
          gsap.set(heroImgElement, {
            filter: `saturate(${heroImgSaturation})`,
          });
          gsap.set(heroImg, { "--overlay-opacity": heroImgOverlayOpacity });

          gsap.set(heroGridOverlay, {
            opacity: phaseValue(self.progress, 0.475, 0.5, 0.75, 0.775),
          });
          gsap.set(marker1, {
            opacity: phaseValue(self.progress, 0.5, 0.525, 0.7, 0.75),
          });
          gsap.set(marker2, {
            opacity: phaseValue(self.progress, 0.55, 0.575, 0.7, 0.75),
          });
        },
      });
    },
    { scope: refs.container }
  );
}

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import type { RefObject } from "react";
import { useRef } from "react";
import { useGSAPDebug } from "@/hooks/useGSAPDebug";

gsap.registerPlugin(CustomEase, SplitText);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

interface PreloaderTimelineRefs {
  counter: RefObject<HTMLHeadingElement | null>;
  counterContainer: RefObject<HTMLDivElement | null>;
  footer: RefObject<HTMLDivElement | null>;
  header: RefObject<HTMLDivElement | null>;
  heroBg: RefObject<HTMLDivElement | null>;
  heroImg: RefObject<HTMLImageElement | null>;
  nav: RefObject<HTMLElement | null>;
  progressBar: RefObject<HTMLDivElement | null>;
  progressFill: RefObject<HTMLDivElement | null>;
  section: RefObject<HTMLElement | null>;
}

export function usePreloaderTimeline(
  refs: PreloaderTimelineRefs,
  onComplete: () => void,
  reducedMotion: boolean
) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  useGSAPDebug(tlRef.current, "preloader");

  useGSAP(
    () => {
      const section = refs.section.current;
      const counterEl = refs.counter.current;
      const counterContainer = refs.counterContainer.current;
      const header = refs.header.current;
      const nav = refs.nav.current;
      const footer = refs.footer.current;

      if (
        !(section && counterEl && counterContainer && header && nav && footer)
      ) {
        return;
      }

      if (reducedMotion) {
        gsap.set(refs.counterContainer.current, { autoAlpha: 0 });
        gsap.set(refs.heroBg.current, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        });
        gsap.set(refs.heroImg.current, { scale: 1 });
        gsap.set(refs.progressBar.current, { scaleX: 1 });
        gsap.set(refs.progressFill.current, { scaleX: 1 });
        onComplete();
        return;
      }

      const headerSplit = SplitText.create(header.querySelector("h1")!, {
        type: "chars",
        charsClass: "preloader-char",
        mask: "chars",
      });

      const navSplit = SplitText.create(nav.querySelectorAll("a"), {
        type: "words",
        wordsClass: "preloader-word",
        mask: "words",
      });

      const footerSplit = SplitText.create(footer.querySelectorAll("p"), {
        type: "words",
        wordsClass: "preloader-word",
        mask: "words",
      });

      gsap.set(headerSplit.chars, {
        x: "50%",
        clipPath: "inset(0 100% 0 0)",
      });
      gsap.set([...navSplit.words, ...footerSplit.words], {
        y: "100%",
        clipPath: "inset(0 0 100% 0)",
      });

      const counter = { value: 0 };
      const tl = gsap.timeline({ id: "preloader" });
      tlRef.current = tl;

      tl.to(counter, {
        value: 100,
        duration: 3,
        ease: "power3.out",
        onUpdate: () => {
          if (counterEl) {
            counterEl.textContent = String(Math.floor(counter.value));
          }
        },
        onComplete: () => {
          if (!(counterEl && counterContainer)) {
            return;
          }
          const digitSplit = SplitText.create(counterEl, {
            type: "chars",
            charsClass: "preloader-digit",
            mask: "chars",
          });
          gsap.to(digitSplit.chars, {
            x: "-100%",
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.1,
            delay: 1,
            onComplete: () => {
              gsap.set(refs.counterContainer.current, { autoAlpha: 0 });
            },
          });
        },
      });

      tl.to(
        counterContainer,
        { scale: 1, duration: 3, ease: "power3.out" },
        "<"
      );
      tl.to(
        refs.progressBar.current,
        { scaleX: 1, duration: 3, ease: "power3.out" },
        "<"
      );

      tl.to(
        refs.heroBg.current,
        {
          clipPath: "polygon(35% 35%, 65% 35%, 65% 65%, 35% 65%)",
          duration: 1.5,
          ease: "hop",
        },
        4.5
      );

      tl.to(
        refs.heroImg.current,
        { scale: 1.5, duration: 1.5, ease: "hop" },
        "<"
      );

      tl.to(
        refs.heroBg.current,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 2,
          ease: "hop",
        },
        6
      );

      tl.to(refs.heroImg.current, { scale: 1, duration: 2, ease: "hop" }, 6);
      tl.to(
        refs.progressFill.current,
        { scaleX: 1, duration: 2, ease: "hop" },
        6
      );

      tl.to(
        headerSplit.chars,
        {
          x: "0%",
          clipPath: "inset(0 0% 0 0)",
          duration: 1,
          ease: "power4.out",
          stagger: 0.075,
        },
        7
      );

      tl.to(
        [...navSplit.words, ...footerSplit.words],
        {
          y: "0%",
          clipPath: "inset(0 0 0% 0)",
          duration: 1,
          ease: "power4.out",
          stagger: 0.075,
          onComplete,
        },
        7.5
      );
    },
    { scope: refs.section }
  );
}

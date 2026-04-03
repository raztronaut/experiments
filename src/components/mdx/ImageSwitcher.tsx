"use client";

import Image from "next/image";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface ImageItem {
  alt: string;
  src: string;
}

interface ImageLikeProps {
  alt?: string;
  src?: string;
}

export interface ImageSwitcherProps {
  children: ReactNode;
}

function isImageLikeChild(
  child: ReactNode
): child is ReactElement<ImageLikeProps> {
  return (
    isValidElement<ImageLikeProps>(child) && typeof child.props.src === "string"
  );
}

export function ImageSwitcher({ children }: ImageSwitcherProps) {
  const images = useMemo(
    () =>
      Children.toArray(children)
        .filter(isImageLikeChild)
        .map((child) => ({
          src: child.props.src ?? "",
          alt: child.props.alt ?? "",
        }))
        .filter((image) => image.src.length > 0),
    [children]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex =
    activeIndex >= 0 && activeIndex < images.length ? activeIndex : 0;
  const activeImage = images[safeActiveIndex];

  if (!activeImage) {
    return null;
  }

  return (
    <figure className="my-8">
      <div className="rounded-xl border border-border bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:20px_20px] p-6 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden border border-white/80 bg-black">
            <Image
              alt={activeImage.alt}
              className="h-auto w-full object-cover"
              height={768}
              priority={safeActiveIndex === 0}
              src={activeImage.src}
              width={1365}
            />
          </div>

          <div className="mt-5 flex justify-center gap-4 md:gap-6">
            {images.map((image, index) => {
              const isActive = index === safeActiveIndex;

              return (
                <button
                  aria-label={`Show image ${index + 1}`}
                  className={cn(
                    "relative h-14 w-14 overflow-hidden border transition-all md:h-16 md:w-16",
                    isActive
                      ? "border-white"
                      : "border-white/70 opacity-70 hover:opacity-100"
                  )}
                  key={image.src}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  <Image
                    alt=""
                    className="h-full w-full object-cover"
                    fill
                    sizes="64px"
                    src={image.src}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </figure>
  );
}

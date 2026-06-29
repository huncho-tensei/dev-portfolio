"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight } from "@/components/icons";

interface CarouselProps {
  images: string[];
  alt: string;
}

export function Carousel({ images, alt }: CarouselProps) {
  const [idx, setIdx] = useState(0);
  const single = images.length <= 1;

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i - 1 + images.length) % images.length);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + 1) % images.length);
  };

  const goTo = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx(i);
  };

  return (
    <div className="relative h-full w-full">
      <Image
        src={`/shots/${images[idx]}`}
        alt={`${alt} — screenshot ${idx + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={idx === 0}
      />

      {!single && (
        <>
          <button
            onClick={prev}
            aria-label="Previous screenshot"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(8%_0_0_/_0.7)] text-[var(--color-bone)] backdrop-blur-sm transition-opacity hover:opacity-100 opacity-60"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </button>

          <button
            onClick={next}
            aria-label="Next screenshot"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(8%_0_0_/_0.7)] text-[var(--color-bone)] backdrop-blur-sm transition-opacity hover:opacity-100 opacity-60"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => goTo(e, i)}
                aria-label={`Go to screenshot ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx
                    ? "w-4 bg-[var(--color-bone)]"
                    : "w-1.5 bg-[var(--color-bone)] opacity-30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { ArrowRight, Footprints } from "lucide-react";

import { Link } from "@tanstack/react-router";

import type { HeroSlide } from "@/lib/types";
import { cn } from "@/lib/utils";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="container-x section-py">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface relative">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={cn(
              "w-full transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              i === index
                ? "opacity-100"
                : "pointer-events-none absolute inset-x-4 top-0 opacity-0 md:inset-x-8",
            )}
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-accent md:aspect-[16/5]">
              {slide.image_url ? (
                <picture className="absolute inset-0 block">
                  {slide.mobile_image_url && (
                    <source media="(max-width: 767px)" srcSet={slide.mobile_image_url} />
                  )}
                  <img
                    src={slide.image_url}
                    alt={slide.heading}
                    className="size-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </picture>
              ) : (
                <div className="grid aspect-[16/9] w-full place-items-center bg-accent md:aspect-[16/5]">
                  <span className="text-sm text-muted-foreground">ছবি যোগ করুন</span>
                </div>
              )}
              <div
                className="absolute inset-0 flex items-end bg-gradient-to-r from-foreground/75 via-foreground/30 to-transparent p-6 md:p-12"
                style={{ opacity: slide.overlay_opacity || 0.7 }}
              >
                <div className="max-w-xl text-left text-background">
                  {slide.subtitle && <p className="eyebrow text-background/75">{slide.subtitle}</p>}
                  <h1 className="mt-2 text-3xl font-bold leading-tight md:text-6xl">
                    {slide.heading}
                  </h1>
                  {slide.description && (
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-background/85 md:text-base">
                      {slide.description}
                    </p>
                  )}
                  {slide.cta_text && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        to={slide.cta_url || "/shop"}
                        className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-transform hover:-translate-y-0.5"
                      >
                        {slide.cta_text}
                        <ArrowRight className="size-4" />
                      </Link>
                      {slide.secondary_cta_text && (
                        <Link
                          to={slide.secondary_cta_url || "/categories"}
                          className="inline-flex items-center rounded-md border border-background/50 px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-background/10"
                        >
                          {slide.secondary_cta_text}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 md:bottom-5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`স্লাইড ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === index ? "w-8 bg-primary" : "w-3 bg-foreground/25",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function HeroFallback() {
  return (
    <section className="container-x section-py">
      <div className="shoe-hero overflow-hidden rounded-2xl border border-border">
        <div className="relative grid min-h-[27rem] items-end p-7 md:min-h-[25rem] md:p-14">
          <div className="relative z-10 max-w-2xl text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-background/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              <Footprints className="size-4" /> Step into your style
            </div>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.05] text-background md:text-7xl">
              প্রতিটি পদক্ষেপে <span className="text-secondary">নিজের স্টাইল</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-background/75 md:text-base">
              ছেলে ও মেয়েদের জন্য আরাম, মান আর প্রতিদিনের confidence-এর জুতা।
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5"
            >
              জুতা দেখুন <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useQueries, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Flame, Mail } from "lucide-react";
import { useEffect, useState } from "react";

import { CategoryScroller } from "@/components/storefront/CategoryCard";
import { HeroFallback, HeroSlider } from "@/components/storefront/HeroSlider";
import { EmptyState, ProductGridSkeleton } from "@/components/storefront/LoadingSkeleton";
import { ProductCarousel, ProductMarquee } from "@/components/storefront/ProductCarousel";
import { PromoBannerCarousel } from "@/components/storefront/PromoBanner";
import { SectionHeading, StoreLayout } from "@/components/storefront/StoreLayout";
import { VideoShowcase } from "@/components/storefront/VideoShowcase";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/storefront/RatingStars";
import {
  categoriesQuery,
  flaggedProductsQuery,
  heroSlidesQuery,
  homepageSectionsQuery,
  homepageReviewsQuery,
  promoBannersQuery,
  showcaseVideosQuery,
  type ProductFlag,
} from "@/lib/queries";
import { useSettings } from "@/lib/store-context";
import { sectionTypography, typographyStyle } from "@/lib/typography";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "প্রিমিয়াম বাংলাদেশি ফ্যাশন — অনলাইন কালেকশন" },
      {
        name: "description",
        content:
          "শাড়ি, থ্রি-পিস, কুর্তি ও কামিজের অভিজাত কালেকশন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা।",
      },
      { property: "og:title", content: "প্রিমিয়াম বাংলাদেশি ফ্যাশন — অনলাইন কালেকশন" },
      {
        property: "og:description",
        content: "শাড়ি, থ্রি-পিস, কুর্তি ও কামিজের অভিজাত কালেকশন। ক্যাশ অন ডেলিভারি।",
      },
    ],
  }),
  component: HomePage,
});

const VALID_FLAGS: ProductFlag[] = [
  "best_selling",
  "trending",
  "hot",
  "featured",
  "new",
  "flash_sale",
];

function sectionFlag(section: { section_key: string; config?: Record<string, unknown> | null }) {
  const fromConfig = section.config?.["flag"];
  if (typeof fromConfig === "string" && VALID_FLAGS.includes(fromConfig as ProductFlag))
    return fromConfig as ProductFlag;
  return VALID_FLAGS.find(
    (f) => section.section_key === f || section.section_key.startsWith(`${f}_`),
  );
}

function FlashSaleHeader({
  title,
  subtitle,
  config,
}: {
  title: string;
  subtitle: string | null;
  config: Record<string, unknown> | null;
}) {
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const configuredEnd = typeof config?.timer_ends_at === "string" ? config.timer_ends_at : null;

  useEffect(() => {
    const configuredTime = configuredEnd ? Date.parse(configuredEnd) : Number.NaN;
    setEndTime(Number.isFinite(configuredTime) ? configuredTime : Date.now() + 24 * 60 * 60 * 1000);
  }, [configuredEnd]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = endTime ? Math.max(0, endTime - now) : 0;
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="mb-4 flex items-center justify-between gap-2 border-b border-orange-500/25 pb-4">
      <div className="min-w-0 flex-1 text-left md:text-left">
        <h2 className="flex items-center gap-1.5 text-lg font-bold text-red-700 sm:gap-2 sm:text-xl md:text-3xl">
          <Flame className="size-5 shrink-0 fill-orange-500 text-orange-500 sm:size-6 md:size-8" />
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 w-full text-left text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="shrink-0 text-right text-red-700">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-orange-700 sm:text-[10px] sm:tracking-[0.18em]">
          অফার শেষ হবে
        </p>
        <div className="flex items-baseline justify-end gap-1 font-mono text-xl font-black leading-none sm:gap-2 sm:text-2xl md:gap-3 md:text-4xl">
          {days > 0 && <TimerUnit value={days} label="দিন" />}
          <TimerUnit value={hours} label="ঘণ্টা" />
          <TimerUnit value={minutes} label="মিনিট" />
          <TimerUnit value={seconds} label="সেকেন্ড" />
        </div>
      </div>
    </div>
  );
}

function TimerUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span>{String(value).padStart(2, "0")}</span>
      <span className="text-[8px] font-sans font-bold text-orange-700 sm:text-[10px] md:text-xs">
        {label}
      </span>
    </span>
  );
}

type SizeChartRow = {
  size: string;
  length: string;
  chest: string;
  waist: string;
};

function SizeChart({
  section,
}: {
  section: {
    title: string | null;
    subtitle: string | null;
    config: Record<string, unknown> | null;
  };
}) {
  const rows = Array.isArray(section.config?.rows)
    ? (section.config.rows as SizeChartRow[]).filter((row) => row && typeof row.size === "string")
    : [];

  if (!rows.length) return null;

  return (
    <section className="container-x section-py">
      <div className="rounded-2xl border border-border bg-surface p-3 md:p-4">
        <SectionHeading
          title={section.title || "সাইজ চার্ট"}
          subtitle={section.subtitle}
          titleStyle={sectionTypography(section.config, "heading")}
          subtitleStyle={sectionTypography(section.config, "subheading")}
        />
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-accent text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">সাইজ</th>
                <th className="px-4 py-3 font-semibold">লম্বা</th>
                <th className="px-4 py-3 font-semibold">বুক</th>
                <th className="px-4 py-3 font-semibold">কোমর</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.size}-${index}`} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{row.size}</td>
                  <td className="px-4 py-3">{row.length || "-"}</td>
                  <td className="px-4 py-3">{row.chest || "-"}</td>
                  <td className="px-4 py-3">{row.waist || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const settings = useSettings();
  const { data: sections = [] } = useQuery(homepageSectionsQuery);
  const { data: slides = [], isLoading: slidesLoading } = useQuery(heroSlidesQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: banners = [] } = useQuery(promoBannersQuery);
  const { data: videos = [] } = useQuery(showcaseVideosQuery);
  const { data: reviews = [] } = useQuery(homepageReviewsQuery);

  const productSections = sections.filter((s) => s.is_visible && sectionFlag(s));

  const productResults = useQueries({
    queries: productSections.map((s) =>
      flaggedProductsQuery(sectionFlag(s)!, s.product_limit || 8),
    ),
  });

  const visible = sections.filter((s) => s.is_visible).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <StoreLayout>
      {visible.map((section) => {
        switch (section.section_key) {
          case "hero":
            return slidesLoading ? (
              <section key={section.id} className="container-x section-py">
                <div className="aspect-[16/9] w-full animate-pulse rounded-2xl border border-border bg-accent md:aspect-[16/5]" />
              </section>
            ) : slides.length ? (
              <HeroSlider key={section.id} slides={slides} />
            ) : (
              <HeroFallback key={section.id} />
            );

          case "categories":
            return (
              <section key={section.id} className="container-x section-py">
                <div className="rounded-2xl border border-border bg-surface p-3 md:p-4">
                  <SectionHeading
                    title={section.title || "ক্যাটাগরি"}
                    subtitle={section.subtitle}
                    titleStyle={sectionTypography(section.config, "heading")}
                    subtitleStyle={sectionTypography(section.config, "subheading")}
                  />
                  {categories.length ? (
                    <>
                      <CategoryScroller categories={categories} />
                      <div className="mt-3 flex justify-center">
                        <Button asChild variant="outline">
                          <Link to="/categories">সব ক্যাটাগরি দেখুন</Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <EmptyState title="এখনও কোনো ক্যাটাগরি নেই" />
                  )}
                </div>
              </section>
            );

          case "promo_banners":
            return banners.length ? (
              <section key={section.id} className="container-x section-py">
                <div className="rounded-2xl border border-border bg-surface p-3 md:p-4">
                  <PromoBannerCarousel banners={banners} />
                </div>
              </section>
            ) : null;

          case "videos":
            return videos.length ? (
              <section key={section.id} className="container-x section-py">
                <div className="rounded-2xl border border-border bg-surface p-3 md:p-4">
                  <SectionHeading
                    title={section.title || "ভিডিও কালেকশন"}
                    subtitle={section.subtitle}
                    titleStyle={sectionTypography(section.config, "heading")}
                    subtitleStyle={sectionTypography(section.config, "subheading")}
                  />
                  <VideoShowcase videos={videos.slice(0, section.product_limit || 8)} />
                </div>
              </section>
            ) : null;

          case "reviews":
            return reviews.length ? (
              <section key={section.id} className="container-x section-py">
                <div className="rounded-2xl border border-border bg-surface p-3 md:p-4">
                  <SectionHeading
                    title={section.title || "গ্রাহকদের মতামত"}
                    subtitle={section.subtitle}
                    titleStyle={sectionTypography(section.config, "heading")}
                    subtitleStyle={sectionTypography(section.config, "subheading")}
                  />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {reviews.slice(0, section.product_limit || 6).map((review) => (
                      <article
                        key={review.id}
                        className="rounded-xl border border-border/70 bg-background p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{review.reviewer_name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {review.products?.name || "পণ্য"}
                            </p>
                          </div>
                          <RatingStars rating={review.rating} />
                        </div>
                        {review.comment && (
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            “{review.comment}”
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ) : null;

          case "size_chart":
            return <SizeChart key={section.id} section={section} />;

          case "newsletter":
            return (
              <section key={section.id} className="container-x section-py">
                <div className="rounded-2xl border border-border bg-surface p-3 md:p-4">
                  <div className="max-w-2xl text-center mx-auto">
                    <Mail className="mx-auto size-8 text-primary" />
                    <h2
                      className="mt-4 text-2xl font-semibold md:text-3xl"
                      style={typographyStyle(
                        settings,
                        "heading",
                        sectionTypography(section.config, "heading"),
                      )}
                    >
                      {section.title || "আমাদের সাথে থাকুন"}
                    </h2>
                    <p
                      className="mt-3 text-sm text-muted-foreground md:text-base"
                      style={typographyStyle(
                        settings,
                        "subheading",
                        sectionTypography(section.config, "subheading"),
                      )}
                    >
                      {section.subtitle || "নতুন কালেকশন ও অফারের খবর সবার আগে পান।"}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      {settings.facebook_url && (
                        <Button asChild>
                          <a href={settings.facebook_url} target="_blank" rel="noreferrer">
                            ফেসবুকে ফলো করুন
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="outline">
                        <Link to="/contact">যোগাযোগ করুন</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            );

          default: {
            const idx = productSections.findIndex((s) => s.id === section.id);
            if (idx === -1) return null;
            const result = productResults[idx];
            const products = result?.data ?? [];
            const flag = sectionFlag(section);
            const isHot = flag === "hot";
            const isFlashSale = flag === "flash_sale";
            const useMarquee = isHot || isFlashSale;
            return (
              <section key={section.id} className="container-x section-py">
                <div
                  className={
                    isFlashSale
                      ? "rounded-2xl border-2 border-orange-500/45 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 p-3 shadow-[0_10px_35px_-15px_rgba(234,88,12,0.65)] md:p-4"
                      : "rounded-2xl border border-border bg-surface p-3 md:p-4"
                  }
                >
                  {isFlashSale ? (
                    <FlashSaleHeader
                      title={section.title || "ফ্ল্যাশ সেল"}
                      subtitle={section.subtitle}
                      config={section.config}
                    />
                  ) : (
                    <SectionHeading
                      title={section.title || ""}
                      subtitle={section.subtitle}
                      titleStyle={sectionTypography(section.config, "heading")}
                      subtitleStyle={sectionTypography(section.config, "subheading")}
                    />
                  )}
                  {result?.isLoading ? (
                    <ProductGridSkeleton count={4} />
                  ) : products.length ? (
                    useMarquee ? (
                      <>
                        <ProductMarquee products={products} />
                        <div className="mt-3 flex justify-center">
                          <Button asChild variant="outline">
                            <Link to="/shop">সব দেখুন</Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <ProductCarousel products={products} />
                        <div className="mt-3 flex justify-center">
                          <Button asChild variant="outline">
                            <Link to="/shop">সব দেখুন</Link>
                          </Button>
                        </div>
                      </>
                    )
                  ) : (
                    <EmptyState
                      title="এই সেকশনে কোনো পণ্য নেই"
                      description="অ্যাডমিন প্যানেল থেকে পণ্য যোগ করুন বা ট্যাগ নির্ধারণ করুন।"
                    />
                  )}
                </div>
              </section>
            );
          }
        }
      })}
    </StoreLayout>
  );
}

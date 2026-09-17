import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

/** Horizontal product carousel with stable card widths at every breakpoint. */
export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <Carousel
      opts={{ align: "start", containScroll: "trimSnaps" }}
      className="px-9 sm:px-10"
    >
      <CarouselContent className="-ml-3 md:-ml-4">
        {products.map((p) => (
          <CarouselItem
            key={p.id}
            className="basis-[78%] pl-3 sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/4 xl:basis-1/5"
          >
            <ProductCard product={p} className="h-full" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0 border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" />
      <CarouselNext className="right-0 border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" />
    </Carousel>
  );
}

/**
 * Single-row auto-scrolling marquee. Products are duplicated to form a
 * seamless infinite loop; animation pauses on hover.
 */
export function ProductMarquee({ products }: { products: Product[] }) {
  if (!products.length) return null;
  const loop = [...products, ...products];
  const duration = Math.max(20, products.length * 5);
  return (
    <div
      className="hide-scrollbar relative overflow-hidden"
      role="marquee"
      aria-label="অটো স্ক্রলিং পণ্য"
    >
      <div
        className="marquee-track flex w-max gap-3 md:gap-6"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {loop.map((p, i) => (
          <ProductCard
            key={`${p.id}-${i}`}
            product={p}
            className="w-40 shrink-0 md:w-64"
          />
        ))}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";
import { useSettings } from "@/lib/store-context";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — বিশ্বস্ত জুতার ব্র্যান্ড" },
      {
        name: "description",
        content: "আমাদের গল্প, জুতার মান ও গ্রাহকসেবার প্রতিশ্রুতি সম্পর্কে জানুন।",
      },
      { property: "og:title", content: "আমাদের সম্পর্কে" },
      { property: "og:description", content: "আমাদের গল্প, মান ও গ্রাহকসেবার প্রতিশ্রুতি।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const settings = useSettings();

  return (
    <StoreLayout>
      <PageHeader eyebrow="পরিচিতি" title="আমাদের সম্পর্কে" description={settings.tagline} />
      <div className="container-x py-10 md:py-14">
        <div className="prose-bn max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
          {settings.about_text ||
            "আমরা ছেলে ও মেয়েদের জন্য যত্নে বাছাই করা জুতা নিয়ে কাজ করি। আরাম, মান ও সাশ্রয়ী দামের সমন্বয়ে সারা বাংলাদেশে দ্রুত ডেলিভারি নিশ্চিত করি।"}
        </div>
        <dl className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { t: "মানসম্পন্ন জুতা", d: "প্রতিটি জোড়া হাতে বাছাই করা।" },
            { t: "সারা দেশে ডেলিভারি", d: "৬৪ জেলায় হোম ডেলিভারি।" },
            { t: "সহজ রিটার্ন", d: "সমস্যা হলে দ্রুত সমাধান।" },
          ].map((i) => (
            <div key={i.t} className="rounded-lg border border-border bg-surface p-5">
              <dt className="font-semibold">{i.t}</dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">{i.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </StoreLayout>
  );
}

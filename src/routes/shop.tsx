import { createFileRoute } from "@tanstack/react-router";

import { ShopBrowser } from "@/components/storefront/ShopBrowser";
import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "শপ — সম্পূর্ণ কালেকশন" },
      {
        name: "description",
        content:
          "স্নিকার্স, স্যান্ডেল, ফরমাল ও ক্যাজুয়াল জুতা — দাম, সাইজ ও রঙ অনুযায়ী ফিল্টার করুন।",
      },
      { property: "og:title", content: "শপ — সম্পূর্ণ কালেকশন" },
      { property: "og:description", content: "ছেলে ও মেয়েদের সব জুতার কালেকশন এক জায়গায়।" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <StoreLayout>
      <PageHeader
        eyebrow="কালেকশন"
        title="শপ"
        description="সাইজ, দাম, রঙ ও ক্যাটাগরি অনুযায়ী ফিল্টার করে আপনার পছন্দের জোড়া খুঁজে নিন।"
      />
      <div className="container-x py-10">
        <ShopBrowser />
      </div>
    </StoreLayout>
  );
}

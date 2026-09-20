import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { InstallPrompt } from "@/components/storefront/InstallPrompt";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { DynamicHead } from "@/lib/dynamic-head";
import { supabase } from "@/integrations/supabase/client";
import { StoreProvider } from "@/lib/store-context";
import { WishlistProvider } from "@/lib/wishlist";
import { TrackingManager } from "@/lib/tracking";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: async () => {
    let branding: {
      store_name?: string;
      tagline?: string;
      meta_title?: string;
      meta_description?: string;
      og_image?: string;
      favicon_url?: string;
      logo_url?: string;
    } = {};
    try {
      const { data } = await supabase
        .from("store_settings")
        .select("data")
        .eq("id", "default")
        .maybeSingle();
      branding = (data?.data as typeof branding) ?? {};
    } catch {
      // Keep the static fallback metadata when public settings are unavailable.
    }

    const storeName = branding.store_name?.trim() || "আমার স্টোর";
    const title =
      branding.meta_title?.trim() ||
      [storeName, branding.tagline?.trim()].filter(Boolean).join(" — ");
    const description = branding.meta_description?.trim() || branding.tagline?.trim() || storeName;
    const icon = branding.favicon_url?.trim() || branding.logo_url?.trim();
    const version = [storeName, branding.tagline, icon].filter(Boolean).join("-");

    return {
      title,
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:site_name", content: storeName },
        ...(branding.og_image ? [{ property: "og:image", content: branding.og_image }] : []),
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(branding.og_image ? [{ name: "twitter:image", content: branding.og_image }] : []),
        { name: "application-name", content: storeName },
        { name: "apple-mobile-web-app-title", content: storeName },
        { name: "theme-color", content: "#7a2b3f" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap",
        },
        { rel: "icon", href: icon || "/favicon.ico", type: "image/x-icon" },
        {
          rel: "manifest",
          href: `/manifest.webmanifest?v=${encodeURIComponent(version || "default")}`,
        },
        { rel: "apple-touch-icon", href: icon || "/icons/icon-192.png" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <DynamicHead />
          <TrackingManager />
          <CartProvider>
            <WishlistProvider>
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <Outlet />
              <InstallPrompt />
              <Toaster position="top-center" richColors />
            </WishlistProvider>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

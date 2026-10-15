import type { Metadata, Viewport } from "next";
import SiteShell from "@/components/layout/SiteShell";
import { pageMetadata } from "@/seo/metadata";
import { site } from "@/config/site";
import "@/style/globals.css";
// Complete static output also lets unknown content paths resolve before streaming.
export const ensureStatic = "navigation";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...pageMetadata("/"),
  robots: { index: site.production, follow: true },
  icons: { icon: "/icon.svg", apple: "/images/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  themeColor: "#031525",
  colorScheme: "dark",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

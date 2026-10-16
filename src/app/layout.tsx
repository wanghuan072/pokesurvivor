import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MN1HGZ0QYQ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MN1HGZ0QYQ');
          `}
        </Script>
      </body>
    </html>
  );
}

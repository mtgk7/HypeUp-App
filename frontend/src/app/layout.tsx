import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

const GTAG_ID = process.env.NEXT_PUBLIC_GTAG_ID ?? "";

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://hypeuppp.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "HypeUp — Türkiye'nin SMM Paneli",
    template: "%s — HypeUp",
  },
  description:
    "Instagram, TikTok, YouTube, X ve daha fazlasında Türk takipçi, beğeni ve izlenme. Anlık teslimat, gerçek TL fiyatları. Hemen üye ol, 50 TL hoş geldin bonusu kazan.",
  keywords: [
    "smm panel",
    "instagram takipçi",
    "tiktok takipçi",
    "youtube abone",
    "türk takipçi",
    "sosyal medya büyüme",
    "instagram beğeni",
    "smm panel türkiye",
  ],
  authors: [{ name: "HypeUp" }],
  creator: "HypeUp",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: BASE_URL,
    siteName: "HypeUp",
    title: "HypeUp — Türkiye'nin SMM Paneli",
    description:
      "Instagram, TikTok, YouTube ve X'te anlık büyüme. Gerçek TL fiyatları, otomatik teslimat, 7/24 destek.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "HypeUp SMM Panel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HypeUp — Türkiye'nin SMM Paneli",
    description:
      "Instagram, TikTok, YouTube ve X'te anlık büyüme. Gerçek TL fiyatları.",
    images: ["/opengraph-image"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%237C3AED'/><path d='M10 22L16 10L22 22M13 18h6' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>",
        type: "image/svg+xml",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="panel-bg text-white min-h-screen antialiased">
        {children}
        <Toaster />

        {/* ── Google Tag (Ads + Analytics) ── */}
        {GTAG_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GTAG_ID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}

        <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/6a18a2317ea1a31c37aa2a52/1jpo3j4l4';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}

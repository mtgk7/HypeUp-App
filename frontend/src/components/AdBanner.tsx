"use client";

import { useEffect } from "react";

interface AdBannerProps {
  slot: string;
  format?: string;
  layout?: string;
  className?: string;
}

export default function AdBanner({ slot, format = "auto", layout, className }: AdBannerProps) {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  const isAutoRelaxed = format === "autorelaxed";
  const isInArticle = layout === "in-article";

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block", ...(isInArticle ? { textAlign: "center" } : {}) }}
      data-ad-client="ca-pub-8655681325124193"
      data-ad-slot={slot}
      data-ad-format={format}
      {...(layout ? { "data-ad-layout": layout } : {})}
      {...(!isAutoRelaxed && !isInArticle ? { "data-full-width-responsive": "true" } : {})}
    />
  );
}

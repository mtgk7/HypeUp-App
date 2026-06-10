"use client";

import { useEffect } from "react";

interface AdBannerProps {
  slot: string;
  format?: string;
  className?: string;
}

export default function AdBanner({ slot, format = "auto", className }: AdBannerProps) {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block" }}
      data-ad-client="ca-pub-8655681325124193"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

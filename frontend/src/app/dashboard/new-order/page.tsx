"use client";

import React, { useState, useEffect, useRef } from "react";
import { servicesApi, ordersApi } from "@/lib/api";
import { Service } from "@/types";
import { Loader2, ShoppingCart, TrendingUp, Zap, ChevronRight } from "lucide-react";

interface IconProps { className?: string; color?: string; }
const TikTokIcon = ({ className, color }: IconProps) => <svg className={className} style={color ? { color } : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z" /></svg>;
const XIcon = ({ className, color }: IconProps) => <svg className={className} style={color ? { color } : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const YoutubeIcon = ({ className, color }: IconProps) => <svg className={className} style={color ? { color } : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
const InstagramIcon = ({ className, color }: IconProps) => <svg className={className} style={color ? { color } : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>;
const TelegramIcon = ({ className, color }: IconProps) => <svg className={className} style={color ? { color } : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>;
const FacebookIcon = ({ className, color }: IconProps) => <svg className={className} style={color ? { color } : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
const SpotifyIcon = ({ className, color }: IconProps) => <svg className={className} style={color ? { color } : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>;
const DiscordIcon = ({ className, color }: IconProps) => <svg className={className} style={color ? { color } : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>;

const PLATFORM_META: Record<string, { icon: React.FC<IconProps>; color: string; dimColor: string }> = {
  Instagram: { icon: InstagramIcon, color: "#E1306C",  dimColor: "rgba(225,48,108,0.12)" },
  TikTok:    { icon: TikTokIcon,    color: "#ffffff",  dimColor: "rgba(255,255,255,0.07)" },
  YouTube:   { icon: YoutubeIcon,   color: "#FF0000",  dimColor: "rgba(255,0,0,0.12)" },
  X:         { icon: XIcon,         color: "#e7e9ea",  dimColor: "rgba(231,233,234,0.07)" },
  Telegram:  { icon: TelegramIcon,  color: "#2AABEE",  dimColor: "rgba(42,171,238,0.12)" },
  Facebook:  { icon: FacebookIcon,  color: "#4f9eff",  dimColor: "rgba(79,158,255,0.12)" },
  Spotify:   { icon: SpotifyIcon,   color: "#1DB954",  dimColor: "rgba(29,185,84,0.12)" },
  Discord:   { icon: DiscordIcon,   color: "#8490f0",  dimColor: "rgba(132,144,240,0.12)" },
};

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X", "Telegram", "Facebook", "Spotify", "Discord"];

const PROFILE_PLACEHOLDER: Record<string, string> = {
  Instagram: "@kullanici veya instagram.com/kullanici",
  TikTok:    "@kullanici veya tiktok.com/@kullanici",
  YouTube:   "@kanal veya youtube.com/@kanal",
  X:         "@kullanici veya x.com/kullanici",
  Telegram:  "@kanal veya t.me/kanal",
  Facebook:  "sayfa-adi veya facebook.com/sayfa",
  Spotify:   "https://open.spotify.com/artist/...",
  Discord:   "https://discord.gg/davet",
  Pinterest: "@kullanici veya pinterest.com/kullanici",
};

const CONTENT_PLACEHOLDER: Record<string, string> = {
  Instagram: "https://instagram.com/p/ABC123 (gönderi linki)",
  TikTok:    "https://tiktok.com/@kullanici/video/123 (video linki)",
  YouTube:   "https://youtube.com/watch?v=ABC123 (video linki)",
  X:         "https://x.com/kullanici/status/123 (gönderi linki)",
  Spotify:   "https://open.spotify.com/track/... (şarkı linki)",
};

// Servis adından profil mi içerik mi gerektiğini tespit et
function isContentService(serviceName: string): boolean {
  const n = (serviceName || "").toLowerCase();
  return (
    n.includes("beğen") || n.includes("like") ||
    n.includes("izlenme") || n.includes("view") || n.includes("views") ||
    n.includes("yorum") || n.includes("comment") ||
    n.includes("story") || n.includes("repost") || n.includes("share") ||
    n.includes("save") || n.includes("impression") || n.includes("reach") ||
    n.includes("watch") || n.includes("play") || n.includes("stream") ||
    n.includes("dislike") || n.includes("reaction")
  );
}

function normalizeLink(platform: string, input: string, serviceName?: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  // İçerik servisi veya zaten URL → olduğu gibi gönder
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (isContentService(serviceName || "")) return trimmed;
  const handle = trimmed.startsWith("@") ? trimmed.slice(1).trim() : trimmed;
  if (!handle) return trimmed;
  switch (platform) {
    case "Instagram": return `https://instagram.com/${handle}`;
    case "TikTok":    return `https://tiktok.com/@${handle}`;
    case "YouTube":   return `https://youtube.com/@${handle}`;
    case "X":         return `https://x.com/${handle}`;
    case "Telegram":  return `https://t.me/${handle}`;
    case "Facebook":  return `https://facebook.com/${handle}`;
    case "Pinterest": return `https://pinterest.com/${handle}`;
    default: return trimmed;
  }
}

// Popüler paketler — backend /featured endpoint'inden (kesin retail/tier fiyatları)
interface FeaturedOption {
  qty: number;
  unit_per_1000: number;
  price_tl: number;
}
interface FeaturedPackage {
  label: string;
  emoji: string;
  platform: string;
  service_id: string;
  jap_service_id: number;
  min_order: number;
  default_qty: number;
  options: FeaturedOption[];
}

function QuickPickCard({ pkg, onApply }: { pkg: FeaturedPackage; onApply: (pkg: FeaturedPackage, qty: number) => void }) {
  const [qty, setQty] = useState<number>(pkg.default_qty);
  const opt = pkg.options.find((o) => o.qty === qty) ?? pkg.options[0];
  const meta = PLATFORM_META[pkg.platform];
  const Icon = meta?.icon;
  return (
    <div className="group bg-[#151515] border border-white/8 hover:border-violet-500/40 rounded-2xl p-4 flex flex-col transition-all">
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: meta.dimColor }}>
            <Icon className="w-4 h-4" color={meta.color} />
          </div>
        )}
      </div>
      <p className="text-sm font-semibold text-white/90 leading-tight mb-3">{pkg.label}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {pkg.options.map((o) => (
          <button
            key={o.qty}
            type="button"
            onClick={() => setQty(o.qty)}
            className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition ${
              o.qty === opt.qty
                ? "bg-violet-600 border-violet-500 text-white"
                : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80 hover:border-white/25"
            }`}
          >
            {o.qty.toLocaleString("tr-TR")}
          </button>
        ))}
      </div>
      <div className="mt-auto">
        <p className="text-xl font-black text-violet-400">
          ₺{opt.price_tl.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-[11px] text-white/30 mb-3">{opt.qty.toLocaleString("tr-TR")} adet</p>
        <button
          type="button"
          onClick={() => onApply(pkg, opt.qty)}
          className="w-full flex items-center justify-center gap-1 bg-violet-600/15 group-hover:bg-violet-600/30 text-violet-300 text-xs font-semibold py-2 rounded-lg transition"
        >
          Seç <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  const [platform, setPlatform] = useState("Instagram");
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [featured, setFeatured] = useState<FeaturedPackage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [priceInfo, setPriceInfo] = useState<{ total_tl: number; unit_tl_price: number } | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  // Tüm servisleri public API'den yükle (auth gerektirmez, hızlı)
  useEffect(() => {
    (async () => {
      setLoadingServices(true);
      try {
        const [res, feat] = await Promise.all([
          servicesApi.public(),
          servicesApi.featured().catch(() => ({ data: [] })),
        ]);
        const all: Service[] = Array.isArray(res.data) ? res.data : [];
        setAllServices(all);
        setServices(all.filter(s => s.platform_name === "Instagram"));
        if (Array.isArray(feat.data)) setFeatured(feat.data);
      } catch { setAllServices([]); }
      finally { setLoadingServices(false); }
    })();
  }, []);

  // Platform değişince filtrele (paket seçimiyle gelen, platforma uyan servisi koru)
  useEffect(() => {
    setServices(allServices.filter(s => s.platform_name === platform));
    setSelectedService(prev => (prev && prev.platform_name === platform ? prev : null));
    setPriceInfo(null);
    setLink("");
  }, [platform, allServices]);

  // Fiyat hesapla
  useEffect(() => {
    if (!selectedService || !quantity || quantity < selectedService.min_order) { setPriceInfo(null); return; }
    const t = setTimeout(() => calculatePrice(), 400);
    return () => clearTimeout(t);
  }, [quantity, selectedService]);

  async function calculatePrice() {
    if (!selectedService) return;
    setLoadingPrice(true);
    try {
      const res = await servicesApi.calculatePrice(selectedService.id, quantity);
      setPriceInfo(res.data);
    } catch { setPriceInfo(null); }
    finally { setLoadingPrice(false); }
  }

  // Hızlı sipariş: paketin servisini seç, adeti ayarla, forma kaydır
  function applyQuickPick(pkg: FeaturedPackage, qty: number) {
    setSuccess(""); setError("");
    const match = allServices.find(s => s.id === pkg.service_id);
    if (match) {
      setPlatform(match.platform_name || pkg.platform);
      setSelectedService(match);
      setQuantity(Math.max(qty, match.min_order));
    }
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService) return;
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      await ordersApi.create(selectedService.id, normalizeLink(platform, link, selectedService.service_name), quantity);
      setSuccess("✅ Sipariş başarıyla verildi! Siparişlerim ekranından takip edebilirsin.");
      setLink(""); setQuantity(0); setPriceInfo(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Sipariş verilemedi");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-violet-400" />
          Yeni Sipariş
        </h1>
        <p className="text-white/40 text-sm mt-1">Hızlı seçim yap veya servisi kendin belirle.</p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-4 text-sm">{success}</div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-4 text-sm">{error}</div>
      )}

      {/* HIZLI SİPARİŞ KARTLARI */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white/70">Popüler Paketler</span>
          <span className="text-xs text-white/30">— Tıkla, form otomatik dolsun</span>
        </div>
        {loadingServices ? (
          <div className="flex items-center gap-2 text-white/30 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featured.map((pkg) => (
              <QuickPickCard key={pkg.jap_service_id} pkg={pkg} onApply={applyQuickPick} />
            ))}
          </div>
        )}
      </div>

      {/* MANUEL FORM */}
      <div ref={formRef}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-white/50">Veya kendim seçeyim</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <form onSubmit={handleSubmit} className="bg-[#151515] border border-white/10 rounded-2xl p-6 space-y-5">
          {/* Platform */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button key={p} type="button" onClick={() => setPlatform(p)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    platform === p ? "bg-violet-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}>
                  {PLATFORM_META[p] && React.createElement(PLATFORM_META[p].icon, {
                    className: "w-3.5 h-3.5",
                    color: platform === p ? "#fff" : PLATFORM_META[p].color,
                  })}
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Servis */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Servis</label>
            {loadingServices ? (
              <div className="flex items-center gap-2 text-white/40 text-sm py-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Servisler yükleniyor...
              </div>
            ) : (
              <select
                value={selectedService?.id || ""}
                onChange={(e) => {
                  const svc = services.find(s => s.id === e.target.value) || null;
                  setSelectedService(svc);
                  setQuantity(svc?.min_order || 0);
                }}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition"
              >
                <option value="">— Servis seçin —</option>
                {services.map(svc => (
                  <option key={svc.id} value={svc.id}>
                    {svc.service_name}
                  </option>
                ))}
              </select>
            )}
            {selectedService && (
              <p className="text-xs text-white/30 mt-1">
                Min: {selectedService.min_order.toLocaleString()} — Maks: {selectedService.max_order.toLocaleString()}
              </p>
            )}
          </div>

          {/* Link */}
          <div>
            {(() => {
              const isContent = isContentService(selectedService?.service_name || "");
              const placeholder = isContent
                ? (CONTENT_PLACEHOLDER[platform] || "https://...")
                : (PROFILE_PLACEHOLDER[platform] || "@kullanici veya https://...");
              const label = isContent ? "Gönderi / Video Linki" : "Kullanıcı Adı veya Link";
              const resolved = normalizeLink(platform, link, selectedService?.service_name);
              return (
                <>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition"
                  />
                  {isContent && (
                    <p className="text-[11px] text-amber-400/70 mt-1.5">
                      ⚠️ Bu servis için beğeni/izlenme gönderilecek gönderi veya video linkini girin.
                    </p>
                  )}
                  {!isContent && link.trim() && !link.trim().startsWith("http") && (
                    <p className="text-[11px] text-white/30 mt-1.5">
                      Gönderilecek: <span className="text-violet-400/80">{resolved}</span>
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          {/* Adet + hızlı seçim */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Adet</label>
            {selectedService && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {[selectedService.min_order, 500, 1000, 5000, 10000]
                  .filter((v, i, arr) => v <= selectedService.max_order && arr.indexOf(v) === i)
                  .slice(0, 5)
                  .map(v => (
                    <button key={v} type="button" onClick={() => setQuantity(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        quantity === v ? "bg-violet-600/20 border-violet-500/50 text-violet-300" : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                      }`}>
                      {v.toLocaleString()}
                    </button>
                  ))}
              </div>
            )}
            <input type="number"
              min={selectedService?.min_order || 1} max={selectedService?.max_order || 100000}
              value={quantity || ""} onChange={e => setQuantity(parseInt(e.target.value) || 0)} required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          {/* Fiyat */}
          {(priceInfo || loadingPrice) && (
            <div className="bg-violet-600/10 border border-violet-500/30 rounded-xl p-4 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              {loadingPrice ? (
                <p className="text-sm text-white/40 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Hesaplanıyor...
                </p>
              ) : (
                <div>
                  <p className="text-sm text-white/60">
                    Birim: <span className="text-white">₺{priceInfo?.unit_tl_price.toFixed(4)}</span> / adet
                  </p>
                  <p className="text-lg font-bold text-green-400">Toplam: ₺{priceInfo?.total_tl.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}

          <button type="submit"
            disabled={submitting || !selectedService || !priceInfo}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            {submitting ? "Sipariş veriliyor..." : "Sipariş Ver"}
          </button>
        </form>
      </div>
    </div>
  );
}

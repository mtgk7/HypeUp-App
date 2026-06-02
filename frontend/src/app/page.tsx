"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { servicesApi } from "@/lib/api";
import {
  Zap, ChevronDown, ChevronRight, ArrowRight,
  Home, Search, ShoppingCart, Headphones, LogIn,
  MessageCircle, Loader2, Check
} from "lucide-react";

interface IconProps { className?: string; color?: string; }

function TikTokIcon({ className, color }: IconProps) {
  return <svg className={className} style={color ? {color} : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z" /></svg>;
}
function XIcon({ className, color }: IconProps) {
  return <svg className={className} style={color ? {color} : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
}
function YoutubeIcon({ className, color }: IconProps) {
  return <svg className={className} style={color ? {color} : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
}
function InstagramIcon({ className, color }: IconProps) {
  return <svg className={className} style={color ? {color} : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>;
}
function TelegramIcon({ className, color }: IconProps) {
  return <svg className={className} style={color ? {color} : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
}
function FacebookIcon({ className, color }: IconProps) {
  return <svg className={className} style={color ? {color} : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function SpotifyIcon({ className, color }: IconProps) {
  return <svg className={className} style={color ? {color} : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>;
}
function DiscordIcon({ className, color }: IconProps) {
  return <svg className={className} style={color ? {color} : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>;
}
function PinterestIcon({ className, color }: IconProps) {
  return <svg className={className} style={color ? {color} : undefined} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>;
}

const PLATFORM_META: Record<string, { icon: React.FC<IconProps>, color: string, dimColor: string }> = {
  Instagram: { icon: InstagramIcon, color: "#E1306C", dimColor: "rgba(225,48,108,0.12)" },
  TikTok:    { icon: TikTokIcon,    color: "#ffffff", dimColor: "rgba(255,255,255,0.07)" },
  YouTube:   { icon: YoutubeIcon,   color: "#FF0000", dimColor: "rgba(255,0,0,0.12)" },
  X:         { icon: XIcon,         color: "#e7e9ea", dimColor: "rgba(231,233,234,0.07)" },
  Telegram:  { icon: TelegramIcon,  color: "#2AABEE", dimColor: "rgba(42,171,238,0.12)" },
  Facebook:  { icon: FacebookIcon,  color: "#4f9eff", dimColor: "rgba(79,158,255,0.12)" },
  Spotify:   { icon: SpotifyIcon,   color: "#1DB954", dimColor: "rgba(29,185,84,0.12)" },
  Discord:   { icon: DiscordIcon,   color: "#8490f0", dimColor: "rgba(132,144,240,0.12)" },
  Pinterest: { icon: PinterestIcon, color: "#E60023", dimColor: "rgba(230,0,35,0.12)" },
};

const PLATFORMS = ["Hepsi", "Instagram", "TikTok", "YouTube", "X", "Telegram", "Facebook", "Spotify", "Discord"];

const FACTS = [
  { value: "1.400+", label: "Aktif Hizmet" },
  { value: "9",      label: "Platform" },
  { value: "₺50",   label: "Başlangıç Bonusu" },
  { value: "7/24",   label: "Destek" },
];

const FAQS = [
  { q: "Siparişim ne kadar sürede teslim edilir?",    a: "Çoğu servis sipariş verilmesinin ardından birkaç dakika ile birkaç saat içinde başlar. Takipçi servislerinde 1-24 saat sürebilir." },
  { q: "Ödeme nasıl yapılır?",                        a: "Papara veya havale ile kolayca bakiye yükleyebilirsiniz. Ödemeniz onaylandıktan sonra bakiyeniz hesabınıza anında yansır." },
  { q: "Hesabım tehlikeye girer mi?",                 a: "Hayır. Şifrenizi asla istemiyoruz. Sadece profil linkinizi girmeniz yeterli." },
  { q: "Fiyatlar neden değişiyor?",                   a: "Fiyatlarımız anlık döviz kuruna göre güncellenir. Gösterilen fiyatlar güncel TL karşılığıdır." },
  { q: "50 TL bonus nasıl kullanılır?",               a: "Kayıt olduktan sonra bakiyenize otomatik olarak 50 TL eklenir. Herhangi bir servise sipariş verebilirsiniz." },
  { q: "Sipariş iptal edebilir miyim?",               a: "İşleme alınmamış siparişler iptal edilebilir. İşleme alınan siparişler için destek hattımızla iletişime geçin." },
];

interface PublicService {
  id: string;
  service_name: string;
  hypeup_tl_price: number;
  min_order: number;
  max_order: number;
  platform_name: string;
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

function PackageCard({ pkg }: { pkg: FeaturedPackage }) {
  const [qty, setQty] = useState<number>(pkg.default_qty);
  const opt = pkg.options.find((o) => o.qty === qty) ?? pkg.options[0];
  const meta = PLATFORM_META[pkg.platform];
  const Icon = meta?.icon;
  return (
    <div className="group bg-[#0f0d1c] border border-white/[0.08] hover:border-violet-500/40 rounded-2xl p-4 transition-all flex flex-col">
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
        <Link
          href="/register"
          className="flex items-center justify-center gap-1 bg-violet-600/15 group-hover:bg-violet-600/30 text-violet-300 text-xs font-semibold py-2 rounded-lg transition"
        >
          Sipariş Ver <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [featured, setFeatured] = useState<FeaturedPackage[]>([]);
  const [loadingSvc, setLoadingSvc] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Backend uyuyorsa cold-start olabilir — 90 sn boyunca 8 sn'de bir dene
      const start = Date.now();
      while (!cancelled && Date.now() - start < 90000) {
        try {
          const [feat, pub] = await Promise.all([
            servicesApi.featured(),
            servicesApi.public().catch(() => ({ data: [] })),
          ]);
          if (!cancelled && Array.isArray(feat.data) && feat.data.length > 0) {
            setFeatured(feat.data);
            if (Array.isArray(pub.data)) setServices(pub.data);
            setLoadingSvc(false);
            return;
          }
        } catch {
          // backend uyanıyor, tekrar dene
        }
        await new Promise(r => setTimeout(r, 8000));
      }
      if (!cancelled) setLoadingSvc(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const platformCounts = PLATFORMS.slice(1).reduce<Record<string, number>>((acc, p) => {
    acc[p] = services.filter(s => s.platform_name === p).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#09080f] text-white">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#09080f]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight">HypeUp</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Link href="/login" className="text-sm text-white/40 hover:text-white/80 px-3.5 py-1.5 rounded-lg transition">Giriş Yap</Link>
            <Link href="/register" className="text-sm font-semibold bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition shadow-lg shadow-violet-600/20">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Sol — metin */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3.5 py-1 mb-6 text-xs text-violet-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Türkiye&apos;nin Sosyal Medya Büyüme Platformu
            </div>

            <h1 className="text-[2.6rem] sm:text-5xl font-black leading-[1.08] tracking-tight mb-5 text-white">
              Sosyal medyada<br />
              <span className="text-violet-400">hızlı büyü.</span>
            </h1>

            <p className="text-white/45 text-[15px] leading-relaxed mb-7 max-w-md">
              Instagram, TikTok, YouTube, Telegram ve 5 platform daha. Anlık teslimat, gerçek TL fiyatları, sıfır risk.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-8">
              {["Şifre istenmez", "Anlık teslimat", "7/24 destek"].map(f => (
                <span key={f} className="inline-flex items-center gap-1.5 text-xs text-white/50 bg-white/5 border border-white/8 rounded-full px-3 py-1.5">
                  <Check className="w-3 h-3 text-violet-400" /> {f}
                </span>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link href="/register" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-violet-600/25">
                Ücretsiz Başla <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 border border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5 text-white/60 hover:text-white font-medium px-6 py-3 rounded-xl text-sm transition">
                50 TL Bonus Al
              </Link>
            </div>
          </div>

          {/* Sağ — güven kartı */}
          <div className="lg:flex-shrink-0 w-full lg:w-[340px]">
            <div className="bg-[#0f0d1c] border border-white/[0.08] rounded-2xl p-6">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-5 text-xs text-emerald-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Kayıt olana 50 TL bonus
              </div>
              <h3 className="text-lg font-bold mb-4">Neden HypeUp?</h3>
              <div className="space-y-3">
                {[
                  "Şifre istemeden, sadece link ile",
                  "Anlık başlangıç, gerçek hesaplar",
                  "Şeffaf TL fiyat — sürpriz yok",
                  "7/24 Telegram destek",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-violet-400" />
                    </div>
                    <span className="text-[13px] text-white/60">{t}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => document.getElementById("paketler")?.scrollIntoView({ behavior: "smooth" })}
                className="mt-5 w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Paketleri Gör <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* POPÜLER PAKETLER — sayfanın üstü */}
      <section id="paketler" className="max-w-6xl mx-auto px-5 pb-4 scroll-mt-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1.5">Popüler Paketler</h2>
          <p className="text-white/35 text-sm">Miktarı seç, fiyatı anında gör. Kayıt ol, hemen sipariş ver.</p>
        </div>
        {loadingSvc ? (
          <div className="flex items-center gap-2 text-white/30 text-sm py-6">
            <Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...
          </div>
        ) : featured.length === 0 ? (
          <p className="text-white/30 text-sm py-6">Paketler şu an yüklenemedi, birazdan tekrar dene.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {featured.map((pkg) => (
              <PackageCard key={pkg.jap_service_id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>

      {/* RAKAMLAR — horizontal strip */}
      <section className="border-y border-white/[0.06] bg-[#0d0b1a]">
        <div className="max-w-6xl mx-auto px-5 py-6 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06]">
          {FACTS.map(({ value, label }) => (
            <div key={label} className="px-6 first:pl-0 last:pr-0 flex flex-col gap-1 py-2">
              <span className="text-2xl font-black text-white tracking-tight">{value}</span>
              <span className="text-xs text-white/35">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORMLAR */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1.5">Desteklenen Platformlar</h2>
          <p className="text-white/35 text-sm">9 platformda takipçi, beğeni, izlenme ve daha fazlası.</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
          {PLATFORMS.slice(1).map((p) => {
            const meta = PLATFORM_META[p];
            const Icon = meta.icon;
            return (
              <button
                key={p}
                onClick={() => document.getElementById("paketler")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-white/[0.07] bg-[#0f0d1c] hover:border-white/20 transition-all"
                style={{ "--platform-dim": meta.dimColor } as React.CSSProperties}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: meta.dimColor }}>
                  <Icon className="w-5 h-5" color={meta.color} />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-semibold text-white/70 group-hover:text-white transition">{p}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{platformCounts[p] ?? "..."}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* NEDEN HYPEUP */}
      <section className="bg-[#0c0a19] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-1.5">Neden HypeUp?</h2>
            <p className="text-white/35 text-sm">Fark yaratan üç özellik.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {[
              {
                n: "01",
                title: "Anlık TL Fiyatı",
                body: "Dolar kuruna bağlı fiyatlar her gün güncellenir. Ödediğin miktar tam olarak gösterilir, sürpriz çıkmaz.",
              },
              {
                n: "02",
                title: "Otomatik Teslimat",
                body: "Sipariş verdikten sonra sistem devreye girer. Bekleme yok, manuel onay yok, doğrudan büyüme başlar.",
              },
              {
                n: "03",
                title: "50 TL Başlangıç",
                body: "Kayıt olan her kullanıcıya 50 TL deneme bakiyesi verilir. Kart bilgisi veya ön ödeme gerekmez.",
              },
            ].map(({ n, title, body }) => (
              <div key={n} className="bg-[#0c0a19] p-8 hover:bg-[#100e1f] transition-colors">
                <span className="text-xs font-mono text-violet-500/60 block mb-5">{n}</span>
                <h3 className="font-bold text-base mb-2.5">{title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-1.5">Nasıl Çalışır?</h2>
          <p className="text-white/35 text-sm">3 adımda büyümeye başla.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { n: "1", title: "Kayıt Ol",         body: "E-posta ile kayıt ol, 50 TL bonus bakiyeni al. 30 saniye sürer." },
            { n: "2", title: "Servis Seç",        body: "Platform ve hizmet seç. Linki gir, adet belirle, anlık fiyat gör." },
            { n: "3", title: "Otomatik Teslim",   body: "Sipariş sistemimize iletilir, büyümen hemen başlar." },
          ].map(({ n, title, body }) => (
            <div key={n} className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-black text-sm text-violet-300">{n}</div>
              <div className="pt-1">
                <h3 className="font-bold mb-1.5 text-[15px]">{title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SSS */}
      <section className="bg-[#0c0a19] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-2">Sıkça Sorulan Sorular</h2>
              <p className="text-white/35 text-sm mb-6 leading-relaxed">Aklındaki soruları yanıtladık. Bulamadığını Canlı Destek ile sor.</p>
              <Link href="/register" className="inline-flex items-center gap-2 border border-white/10 hover:border-violet-500/40 text-white/60 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
                <MessageCircle className="w-4 h-4" /> Canlı Destek
              </Link>
            </div>
            <div className="lg:col-span-3 space-y-1.5">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-white/[0.07] rounded-xl overflow-hidden bg-[#0f0d1c]">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-3">
                    <span className="text-[14px] font-medium text-white/75">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${openFaq === i ? "max-h-40" : "max-h-0"}`}>
                    <div className="px-5 pb-4 pt-1 text-[13px] text-white/40 leading-relaxed border-t border-white/[0.05]">{faq.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="relative bg-violet-600 rounded-2xl p-10 sm:p-14 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Hemen büyümeye başla.</h2>
              <p className="text-white/70 text-[15px]">İlk 50 TL bizden. Kart bilgisi gerekmez.</p>
            </div>
            <Link href="/register" className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-violet-50 transition shadow-xl">
              Ücretsiz Kayıt Ol <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#07060d] pt-12 pb-24 sm:pb-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" fill="white" />
                </div>
                <span className="font-bold text-[15px]">HypeUp</span>
              </div>
              <p className="text-xs text-white/25 leading-relaxed max-w-[180px]">Türkiye&apos;nin sosyal medya büyüme platformu.</p>
            </div>
            {[
              { title: "Hizmetler",  links: ["Instagram Takipçi", "TikTok Takipçi", "YouTube Abone", "Telegram Üye", "Instagram Beğeni"] },
              { title: "Kategoriler", links: ["Takipçi", "Beğeni", "İzlenme", "Abone", "Yorum"] },
              { title: "Kurumsal",   links: ["Hakkımızda", "Gizlilik Politikası", "Kullanım Şartları", "İletişim"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map(l => (
                    <li key={l}><Link href="/register" className="text-xs text-white/25 hover:text-white/55 transition">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/20">
            <span>© 2026 HypeUp. Tüm hakları saklıdır.</span>
            <span>Fiyatlar anlık döviz kuruna göre güncellenir.</span>
          </div>
        </div>
      </footer>

      {/* MOBİL ALT NAV */}
      <div className="fixed bottom-0 inset-x-0 sm:hidden z-50 bg-[#09080f]/95 backdrop-blur border-t border-white/[0.08]">
        <div className="grid grid-cols-5 h-16">
          {[
            { icon: Home,         label: "Ana Sayfa", href: "/" },
            { icon: Search,       label: "Paketler",  action: () => document.getElementById("paketler")?.scrollIntoView({ behavior: "smooth" }) },
            { icon: ShoppingCart, label: "Sipariş",   href: "/register" },
            { icon: Headphones,   label: "Destek",    href: "/register" },
            { icon: LogIn,        label: "Giriş",     href: "/login" },
          ].map(({ icon: Icon, label, href, action }) =>
            action ? (
              <button key={label} onClick={action}
                className="flex flex-col items-center justify-center gap-1 text-white/35 hover:text-violet-400 transition">
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{label}</span>
              </button>
            ) : (
              <Link key={label} href={href!}
                className="flex flex-col items-center justify-center gap-1 text-white/35 hover:text-violet-400 transition">
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{label}</span>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}

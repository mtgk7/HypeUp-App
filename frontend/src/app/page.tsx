"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap, Star, ChevronDown, ChevronRight,
  Home, Search, ShoppingCart, Headphones, LogIn,
  Check, MessageCircle, ArrowRight, Users, Package, ThumbsUp, Clock
} from "lucide-react";

// ─── İkon bileşenleri ─────────────────────────────────────
function TikTokIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z" />
    </svg>
  );
}
function XIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function YoutubeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function InstagramIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

// ─── Veriler ──────────────────────────────────────────────
const PLATFORMS = [
  { name: "Instagram", icon: InstagramIcon, color: "#E1306C", bg: "#fdf2f8", count: 3, href: "/register" },
  { name: "TikTok",    icon: TikTokIcon,    color: "#010101", bg: "#f0fafa", count: 3, href: "/register" },
  { name: "YouTube",   icon: YoutubeIcon,   color: "#FF0000", bg: "#fff5f5", count: 2, href: "/register" },
  { name: "X",         icon: XIcon,         color: "#14171A", bg: "#f7f7f7", count: 2, href: "/register" },
];

const FEATURED_SERVICES = [
  { name: "Instagram Türk Takipçi [Garantili]", price: "₺45", per: "500 adet",   badge: "Çok Satan" },
  { name: "Instagram Beğeni [Anlık]",           price: "₺2.40",  per: "100 adet",  badge: "Hızlı" },
  { name: "TikTok Takipçi [Organik]",           price: "₺72",    per: "1.000 adet",badge: null },
  { name: "TikTok Video İzlenme",               price: "₺1.28",  per: "1.000 adet",badge: "En Ucuz" },
  { name: "YouTube Abone [TR]",                 price: "₺25",    per: "100 adet",  badge: null },
  { name: "X (Twitter) Takipçi",                price: "₺56",    per: "1.000 adet",badge: null },
];

const STATS = [
  { icon: Users,   value: "50K+",  label: "Mutlu Müşteri" },
  { icon: Package, value: "250K+", label: "Tamamlanan Sipariş" },
  { icon: ThumbsUp,value: "99%",   label: "Memnuniyet" },
  { icon: Clock,   value: "7/24",  label: "Destek" },
];

const FAQS = [
  { q: "Siparişim ne kadar sürede teslim edilir?",        a: "Çoğu servis sipariş verilmesinin ardından birkaç dakika ile birkaç saat içinde başlar. Takipçi servislerinde 1-24 saat sürebilir." },
  { q: "Ödeme güvenli mi?",                              a: "Evet. Tüm ödemeler SSL şifreleme ile korunmaktadır. Bakiyeniz sisteme anında yansır." },
  { q: "Hesabım tehlikeye girer mi?",                    a: "Hayır. Şifrenizi asla istemiyoruz. Sadece profil linkinizi girmeniz yeterli." },
  { q: "Fiyatlar neden değişiyor?",                      a: "Fiyatlarımız anlık döviz kuruna göre güncellenir. Gösterilen fiyatlar güncel TL karşılığıdır." },
  { q: "50 TL bonus nasıl kullanılır?",                  a: "Kayıt olduktan sonra bakiyenize otomatik olarak 50 TL eklenir. Herhangi bir servise sipariş verebilirsiniz." },
  { q: "Sipariş iptal edebilir miyim?",                  a: "İşleme alınmamış siparişler iptal edilebilir. İşleme alınan siparişler için destek hattımızla iletişime geçin." },
];

// ─── Sayfa ────────────────────────────────────────────────
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0e0c18] text-white">

      {/* ══ NAV ══════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-[#0e0c18]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-base tracking-tight">HypeUp</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login"    className="text-sm text-white/50 hover:text-white px-3 py-1.5 transition">Giriş Yap</Link>
            <Link href="/register" className="text-sm font-semibold bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Sol */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-5 text-xs text-violet-300 font-medium">
              Profesyonel Etkileşim Çözümleri
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight mb-4">
              Kaliteli Hizmet,<br />
              <span className="text-violet-400">Kusursuz Büyüme!</span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-md">
              Instagram, TikTok, YouTube ve X platformlarında organik büyümenizi destekler. Güvenilir, hızlı ve uygun fiyatlı sosyal medya hizmetleri.
            </p>

            {/* Yıldız + sosyal kanıt */}
            <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
              <div className="flex items-center gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <span className="text-sm text-white/50">5.0/5 Değerlendirme</span>
            </div>

            <div className="flex gap-3 justify-center md:justify-start flex-wrap">
              <Link href="/register" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition">
                Ücretsiz Başla <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/30 text-white/70 hover:text-white font-semibold px-6 py-3 rounded-xl text-sm transition">
                50 TL Bonus Al
              </Link>
            </div>
          </div>

          {/* Sağ — dekoratif panel */}
          <div className="flex-shrink-0 w-full md:w-80">
            <div className="bg-[#16132a] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/40">Anlık Aktif Servisler</span>
              </div>
              {FEATURED_SERVICES.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-xs text-white/70">{s.name}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {s.badge && (
                      <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-medium">
                        {s.badge}
                      </span>
                    )}
                    <span className="text-xs font-bold text-white">{s.price}</span>
                  </div>
                </div>
              ))}
              <Link href="/register" className="mt-4 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold py-2.5 rounded-lg transition">
                Tüm Servisleri Gör <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PLATFORM KARTLARI ════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.name}
                href="/register"
                className="group bg-white rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: p.bg }}>
                  <Icon className="w-7 h-7" style={{ color: p.color }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.count} Hizmet</p>
                </div>
                <span className="text-[11px] text-violet-600 font-medium group-hover:underline flex items-center gap-0.5">
                  İncele <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ══ ÖNE ÇIKAN SERVİSLER ══════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-[#16132a] border border-violet-500/15 rounded-3xl overflow-hidden">
          {/* Başlık */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">Öne Çıkan Servisler</h2>
              <p className="text-xs text-white/40 mt-0.5">Güncel kurla hesaplanmış TL fiyatları</p>
            </div>
            <div className="flex gap-2">
              {["Instagram","TikTok","YouTube","X"].map((p) => (
                <span key={p} className="text-xs bg-white/5 hover:bg-violet-500/20 border border-white/8 hover:border-violet-500/30 px-3 py-1 rounded-full cursor-pointer transition text-white/50 hover:text-violet-300">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Servis listesi */}
          <div className="divide-y divide-white/5">
            {FEATURED_SERVICES.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-white/2 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90">{s.name}</p>
                    <p className="text-xs text-white/30 mt-0.5">{s.per}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {s.badge && (
                    <span className="hidden sm:block text-[10px] bg-violet-500/15 text-violet-400 border border-violet-500/25 px-2 py-0.5 rounded-full font-medium">
                      {s.badge}
                    </span>
                  )}
                  <span className="font-bold text-white">{s.price}</span>
                  <Link href="/register" className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100">
                    Satın Al
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-white/5 text-center">
            <Link href="/register" className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center justify-center gap-1 transition">
              Tüm servisleri gör <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ İSTATİSTİKLER ════════════════════════════════════ */}
      <section className="bg-violet-600 py-10 my-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon className="w-6 h-6 text-white/70" />
              <span className="text-3xl font-black text-white">{value}</span>
              <span className="text-xs text-white/70">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ NEDEN HYPEUP ═════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Neden HypeUp?</h2>
          <p className="text-white/40 text-sm">Rakiplerimizden farkımız</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Anlık Döviz Kuru",  body: "Fiyatlar TCMB kuruna göre otomatik güncellenir. Sürpriz ücret yok.",    icon: "💱" },
            { title: "Otomatik Teslimat", body: "Sipariş verdikten sonra sistem otomatik devreye girer. Manuel işlem gerekmez.", icon: "⚡" },
            { title: "50 TL Hoş Geldin", body: "Kayıt olan her kullanıcıya anında 50 TL deneme bakiyesi. Kart gerekmez.", icon: "🎁" },
          ].map(({ title, body, icon }) => (
            <div key={title} className="bg-[#16132a] border border-white/8 rounded-2xl p-6">
              <span className="text-3xl mb-4 block">{icon}</span>
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ NASIL ÇALIŞIR ════════════════════════════════════ */}
      <section className="bg-[#100d1f] py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Nasıl Çalışır?</h2>
            <p className="text-white/40 text-sm">3 adımda büyümeye başla</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: "1", title: "Kayıt Ol",         body: "E-posta ile kayıt ol, 50 TL bonus bakiyeni al. 30 saniye sürer." },
              { n: "2", title: "Servis Seç",        body: "Platform ve servis seç. Linki gir, adet belirle, anlık fiyat gör." },
              { n: "3", title: "Otomatik Teslimat", body: "Sipariş JAP altyapısına iletilir, büyümen başlar." },
            ].map(({ n, title, body }) => (
              <div key={n} className="relative flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-black text-sm">
                  {n}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold mb-1">{title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SSS ══════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">Sıkça Sorulan<br /><span className="text-violet-400">Sorular</span></h2>
            <p className="text-white/40 text-sm mt-2 mb-6">Aklındaki soruları yanıtladık.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
              <MessageCircle className="w-4 h-4" /> Canlı Destek
            </Link>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#16132a] border border-white/6 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <span className="text-sm font-medium text-white/80">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-white/40 flex-shrink-0 ml-2 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-white/40 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-violet-600 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Bugüne Kadar Neler Yaptık?</h2>
            <p className="text-white/70 text-sm mb-6">Büyüyen topluluğumuza katıl, ilk 50 TL bizden.</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-8 py-3 rounded-xl text-sm hover:bg-violet-50 transition"
            >
              Hemen Başla <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════ */}
      <footer className="bg-[#0a0815] border-t border-white/5 pt-12 pb-24 sm:pb-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" fill="white" />
                </div>
                <span className="font-bold">HypeUp</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed max-w-[180px]">
                Profesyonel sosyal medya etkileşim çözümleri.
              </p>
            </div>
            {[
              {
                title: "Tüm Hizmetler",
                links: ["Instagram Takipçi", "TikTok Takipçi", "YouTube Abone", "X Takipçi", "Instagram Beğeni"],
              },
              {
                title: "Popüler Kategoriler",
                links: ["Takipçi", "Beğeni", "İzlenme", "Abone", "Yorum"],
              },
              {
                title: "Kurumsal",
                links: ["Hakkımızda", "Gizlilik Politikası", "Kullanım Şartları", "İletişim"],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">{title}</h4>
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l}>
                      <Link href="/register" className="text-xs text-white/30 hover:text-white/60 transition">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/20">
            <span>© 2026 HypeUp. Tüm hakları saklıdır.</span>
            <span>Fiyatlar anlık döviz kuruna göre güncellenir.</span>
          </div>
        </div>
      </footer>

      {/* ══ MOBİL ALT NAV (Wubito tarzı) ════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 sm:hidden z-50 bg-[#0e0c18]/95 backdrop-blur border-t border-white/8">
        <div className="grid grid-cols-5 h-16">
          {[
            { icon: Home,         label: "Ana Sayfa", href: "/" },
            { icon: Search,       label: "Sorgula",   href: "/login" },
            { icon: ShoppingCart, label: "Sepet",     href: "/register" },
            { icon: Headphones,   label: "Destek",    href: "/register" },
            { icon: LogIn,        label: "Giriş",     href: "/login" },
          ].map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center justify-center gap-1 text-white/40 hover:text-violet-400 transition"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

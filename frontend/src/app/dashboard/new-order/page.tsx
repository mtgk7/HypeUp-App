"use client";

import { useState, useEffect, useRef } from "react";
import { servicesApi, ordersApi } from "@/lib/api";
import { Service } from "@/types";
import { Loader2, ShoppingCart, TrendingUp, Zap, ChevronRight } from "lucide-react";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X", "Telegram", "Facebook", "Spotify", "Discord"];

const LINK_PLACEHOLDER: Record<string, string> = {
  Instagram:  "https://instagram.com/kullanici",
  TikTok:     "https://tiktok.com/@kullanici",
  YouTube:    "https://youtube.com/@kanal",
  X:          "https://x.com/kullanici",
  Telegram:   "https://t.me/kanal",
  Facebook:   "https://facebook.com/sayfa",
  Spotify:    "https://open.spotify.com/artist/...",
  Discord:    "https://discord.gg/davet",
  Pinterest:  "https://pinterest.com/kullanici",
};

// Hızlı sipariş şablonları
// nameContains: servis adında geçmesi gereken kesin metin (küçük harf)
// maxPrice: bu fiyatın üzerindeki servisleri atla (₺/1000)
const QUICK_PICKS = [
  { label: "Instagram Takipçi", platform: "Instagram", nameContains: "no refill: no photo",   maxPrice: 600,  qty: 1000,  emoji: "📸" },
  { label: "Instagram Beğeni",  platform: "Instagram", nameContains: "low quality: no refill", maxPrice: 200,  qty: 1000,  emoji: "❤️" },
  { label: "TikTok İzlenme",    platform: "TikTok",    nameContains: "tiktok views - [speed",  maxPrice: 50,   qty: 10000, emoji: "👁️" },
  { label: "TikTok Hikaye",     platform: "TikTok",    nameContains: "story views",            maxPrice: 100,  qty: 1000,  emoji: "🎵" },
  { label: "YouTube İzlenme",   platform: "YouTube",   nameContains: "worldwide geo",          maxPrice: 200,  qty: 10000, emoji: "🎬" },
  { label: "YouTube Abone",     platform: "YouTube",   nameContains: "aboneleri",              maxPrice: 5000, qty: 100,  emoji: "▶️" },
  { label: "Telegram Üye",      platform: "Telegram",  nameContains: "refill 30d",             maxPrice: 400,  qty: 1000,  emoji: "✈️" },
  { label: "Spotify Dinlenme",  platform: "Spotify",   nameContains: "free plays",             maxPrice: 100,  qty: 5000,  emoji: "🎵" },
];

export default function NewOrderPage() {
  const [platform, setPlatform] = useState("Instagram");
  const [allServices, setAllServices] = useState<Service[]>([]);
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
        const res = await servicesApi.public();
        const all: Service[] = Array.isArray(res.data) ? res.data : [];
        setAllServices(all);
        setServices(all.filter(s => s.platform_name === "Instagram"));
      } catch { setAllServices([]); }
      finally { setLoadingServices(false); }
    })();
  }, []);

  // Platform değişince filtrele
  useEffect(() => {
    setSelectedService(null); setPriceInfo(null);
    setServices(allServices.filter(s => s.platform_name === platform));
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

  function findBestService(pick: typeof QUICK_PICKS[0], services: Service[]): Service | null {
    const plat = services.filter(s => s.platform_name === pick.platform);
    // Kesin isim eşleştirmesi + max fiyat sınırı
    const filtered = plat.filter(s => {
      const n = s.service_name.toLowerCase();
      const matchesName = n.includes(pick.nameContains.toLowerCase());
      const underMax = s.hypeup_tl_price <= pick.maxPrice;
      return matchesName && underMax;
    });
    const sorted = filtered.sort((a, b) => a.hypeup_tl_price - b.hypeup_tl_price);
    return sorted[0] ?? null;
  }

  // Hızlı sipariş: platforma git, servisi seç, adeti ayarla
  function applyQuickPick(pick: typeof QUICK_PICKS[0]) {
    setPlatform(pick.platform);
    setSuccess(""); setError("");
    const match = findBestService(pick, allServices);
    if (match) {
      setSelectedService(match);
      setQuantity(Math.max(pick.qty, match.min_order));
    }
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService) return;
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      await ordersApi.create(selectedService.id, link, quantity);
      setSuccess("✅ Sipariş başarıyla verildi! Siparişlerim ekranından takip edebilirsin.");
      setLink(""); setQuantity(0); setPriceInfo(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Sipariş verilemedi");
    } finally { setSubmitting(false); }
  }

  // Hızlı seçim için fiyat önizleme
  function getQuickPrice(pick: typeof QUICK_PICKS[0]): string {
    const match = findBestService(pick, allServices);
    if (!match) return "—";
    const total = (match.hypeup_tl_price / 1000) * Math.max(pick.qty, match.min_order);
    return `₺${total.toFixed(2)}`;
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
            {QUICK_PICKS.map((pick) => (
              <button
                key={pick.label}
                onClick={() => applyQuickPick(pick)}
                className="group bg-[#151515] border border-white/8 hover:border-violet-500/50 hover:bg-violet-500/5 rounded-2xl p-4 text-left transition-all"
              >
                <div className="text-2xl mb-2">{pick.emoji}</div>
                <p className="text-sm font-semibold text-white/90 group-hover:text-white leading-tight mb-2">{pick.label}</p>
                <p className="text-base font-bold text-white">{pick.qty.toLocaleString()} <span className="text-xs font-normal text-white/40">adet</span></p>
                <p className="text-xl font-black text-violet-400 mt-1">
                  {getQuickPrice(pick)}
                </p>
                <div className="flex items-center justify-center gap-1 mt-3 bg-violet-600/15 group-hover:bg-violet-600/30 text-violet-300 text-xs font-semibold py-2 rounded-lg transition">
                  Seç <ChevronRight className="w-3 h-3" />
                </div>
              </button>
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    platform === p ? "bg-violet-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}>
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
                    {svc.service_name} ({svc.category_name})
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
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Hedef Link</label>
            <input type="url" placeholder={LINK_PLACEHOLDER[platform] || "https://..."}
              value={link} onChange={e => setLink(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition"
            />
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

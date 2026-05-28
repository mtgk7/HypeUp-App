"use client";

import { useState, useEffect } from "react";
import { servicesApi, ordersApi } from "@/lib/api";
import { Service } from "@/types";
import { Loader2, ShoppingCart, TrendingUp } from "lucide-react";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X"];

export default function NewOrderPage() {
  const [platform, setPlatform] = useState("Instagram");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [priceInfo, setPriceInfo] = useState<{ total_tl: number; unit_tl_price: number } | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Platform değişince servisleri yükle
  useEffect(() => {
    setSelectedService(null);
    setPriceInfo(null);
    loadServices(platform);
  }, [platform]);

  async function loadServices(p: string) {
    setLoadingServices(true);
    try {
      const res = await servicesApi.list(p);
      // API { categories, services } döndürüyor
      const raw = res.data;
      const allServices: Service[] = Array.isArray(raw) ? raw : (raw.services ?? []);
      // Platforma göre filtrele
      const filtered = allServices.filter(
        (s: Service) => !p || s.platform_name === p
      );
      setServices(filtered);
    } catch {
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  }

  // Miktar değişince anlık fiyat hesapla
  useEffect(() => {
    if (!selectedService || !quantity || quantity < selectedService.min_order) {
      setPriceInfo(null);
      return;
    }
    const timer = setTimeout(() => calculatePrice(), 400);
    return () => clearTimeout(timer);
  }, [quantity, selectedService]);

  async function calculatePrice() {
    if (!selectedService) return;
    setLoadingPrice(true);
    try {
      const res = await servicesApi.calculatePrice(selectedService.id, quantity);
      setPriceInfo(res.data);
    } catch {
      setPriceInfo(null);
    } finally {
      setLoadingPrice(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService) return;
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await ordersApi.create(selectedService.id, link, quantity);
      setSuccess("✅ Sipariş başarıyla verildi! Siparişlerim ekranından takip edebilirsin.");
      setLink("");
      setQuantity(0);
      setPriceInfo(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Sipariş verilemedi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-violet-400" />
          Yeni Sipariş
        </h1>
        <p className="text-white/40 text-sm mt-1">Platform ve servisi seç, linki gir, adedi belirle.</p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-4 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#151515] border border-white/10 rounded-2xl p-6 space-y-5">
        {/* Platform seçimi */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  platform === p
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Servis seçimi */}
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
                const svc = services.find((s) => s.id === e.target.value) || null;
                setSelectedService(svc);
                setQuantity(svc?.min_order || 0);
              }}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition"
            >
              <option value="">— Servis seçin —</option>
              {services.map((svc) => (
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
          <input
            type="url"
            placeholder="https://instagram.com/kullanici"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* Adet */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Adet</label>
          <input
            type="number"
            min={selectedService?.min_order || 1}
            max={selectedService?.max_order || 100000}
            value={quantity || ""}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* Fiyat Önizleme */}
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
                  Birim fiyat: <span className="text-white">₺{priceInfo?.unit_tl_price.toFixed(6)}</span> / adet
                </p>
                <p className="text-lg font-bold text-green-400">
                  Toplam: ₺{priceInfo?.total_tl.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !selectedService || !priceInfo}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          {submitting ? "Sipariş veriliyor..." : "Sipariş Ver"}
        </button>
      </form>
    </div>
  );
}

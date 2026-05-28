"use client";

import { useState, useRef } from "react";
import { Wallet, Zap, ChevronRight, Loader2, ShieldCheck, CreditCard } from "lucide-react";
import { paymentApi } from "@/lib/api";

const PRESETS = [50, 100, 200, 500, 1000];

export default function AddBalancePage() {
  const [selected, setSelected] = useState<number | null>(100);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const amount = custom ? parseFloat(custom) : selected;

  async function handlePayment() {
    if (!amount || isNaN(amount) || amount < 10) {
      setError("Minimum yükleme miktarı ₺10");
      return;
    }
    if (amount > 10000) {
      setError("Maksimum yükleme miktarı ₺10.000");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await paymentApi.initShopier(amount);
      const { shopier_url, form_fields } = res.data;

      // Shopier'a gizli form ile yönlendir
      const form = document.createElement("form");
      form.method = "POST";
      form.action = shopier_url;

      Object.entries(form_fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("Ödeme başlatılamadı. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-violet-400" />
          Bakiye Yükle
        </h1>
        <p className="text-white/30 text-sm mt-1">Hesabına TL bakiye ekle</p>
      </div>

      {/* Miktar seçimi */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-4">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Miktar seç</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setSelected(p); setCustom(""); setError(""); }}
              className={`py-3 rounded-xl text-sm font-semibold border transition ${
                selected === p && !custom
                  ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                  : "bg-white/3 border-white/8 text-white/60 hover:text-white hover:bg-white/8"
              }`}
            >
              ₺{p}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">₺</span>
          <input
            type="number"
            min="10"
            max="10000"
            placeholder="Özel miktar gir..."
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setSelected(null); setError(""); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs mt-3">{error}</p>
        )}
      </div>

      {/* Özet */}
      {amount && !isNaN(amount) && amount >= 10 && (
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/50">Yüklenecek miktar</span>
            <span className="text-xl font-bold text-white">₺{amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            Shopier güvenceli ödeme · SSL şifreli
          </div>
        </div>
      )}

      {/* Ödeme butonu */}
      <button
        onClick={handlePayment}
        disabled={loading || !amount || isNaN(amount) || amount < 10}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3.5 rounded-xl font-semibold transition"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Shopier'a yönlendiriliyor...</>
        ) : (
          <><CreditCard className="w-4 h-4" /> Ödeme Yap<ChevronRight className="w-4 h-4" /></>
        )}
      </button>

      {/* Bilgi notu */}
      <div className="mt-6 flex items-start gap-2 text-xs text-white/20">
        <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-400/40" />
        Ödeme onaylandıktan sonra bakiyeniz otomatik olarak hesabınıza yansır.
        Shopier üzerinden kredi kartı, banka kartı ile ödeme yapabilirsiniz.
      </div>
    </div>
  );
}

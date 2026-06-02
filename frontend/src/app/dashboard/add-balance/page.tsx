"use client";

import { useState } from "react";
import { Wallet, Copy, Check, Loader2, ChevronRight, Zap, CheckCircle, Gift } from "lucide-react";
import { paymentApi } from "@/lib/api";

const PRESETS = [50, 100, 150, 200, 500];
const PAPARA_NO = "1773332769";

const BONUS_TIERS = [
  { threshold: 200, bonus: 75 },
  { threshold: 150, bonus: 50 },
  { threshold: 100, bonus: 25 },
];

function getBonus(amount: number): number {
  for (const tier of BONUS_TIERS) {
    if (amount >= tier.threshold) return tier.bonus;
  }
  return 0;
}

export default function AddBalancePage() {
  const [step, setStep] = useState<"amount" | "info" | "done">("amount");
  const [selected, setSelected] = useState<number | null>(100);
  const [custom, setCustom] = useState("");
  const [senderName, setSenderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refCode, setRefCode] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const amount = custom ? parseFloat(custom) : selected;

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function submitPayment() {
    if (!senderName.trim()) { setError("Papara'da görünen adınızı girin"); return; }
    if (!amount || isNaN(amount) || amount < 10) { setError("Minimum ₺10"); return; }
    setError(""); setLoading(true);
    try {
      const res = await paymentApi.manual(amount, senderName.trim());
      setRefCode(res.data.reference_code);
      setStep("done");
    } catch {
      setError("İşlem başlatılamadı, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="max-w-lg">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Talebiniz Alındı</h2>
          <p className="text-white/40 text-sm mb-6">Ödemenizi onayladıktan sonra bakiyeniz yüklenecektir.</p>
          <div className="bg-[#111] border border-white/8 rounded-xl p-4 text-left space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">Papara No</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{PAPARA_NO}</span>
                <button onClick={() => copy(PAPARA_NO, "papara")} className="text-violet-400 hover:text-violet-300">
                  {copied === "papara" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">Miktar</span>
              <span className="font-bold text-white">₺{amount?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">Açıklama / Not</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-violet-300">{refCode}</span>
                <button onClick={() => copy(refCode, "ref")} className="text-violet-400 hover:text-violet-300">
                  {copied === "ref" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-yellow-400/70">
            ⚠️ Papara transferinde açıklama/not kısmına referans kodunu yazmayı unutmayın.
          </p>
        </div>
      </div>
    );
  }

  if (step === "info") {
    return (
      <div className="max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-violet-400" /> Bakiye Yükle
          </h1>
          <p className="text-white/30 text-sm mt-1">Papara ile ₺{amount?.toFixed(2)} yükleme</p>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-4 space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-white/40 text-sm">Papara No</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold">{PAPARA_NO}</span>
              <button onClick={() => copy(PAPARA_NO, "papara")} className="text-violet-400 hover:text-violet-300 transition">
                {copied === "papara" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-white/40 text-sm">Gönderilecek Miktar</span>
            <span className="font-bold text-white">₺{amount?.toFixed(2)}</span>
          </div>
          <p className="text-xs text-white/30 pt-1">
            Transferi yaptıktan sonra aşağıdaki formu doldurun.
            Papara'da görünen adınızı girin — onay için kullanılır.
          </p>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-4">
          <label className="text-xs text-white/40 uppercase tracking-widest block mb-3">
            Papara'da Görünen Adınız
          </label>
          <input
            type="text"
            placeholder="Örn: Ahmet Y."
            value={senderName}
            onChange={e => { setSenderName(e.target.value); setError(""); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
          />
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        <button
          onClick={submitPayment}
          disabled={loading || !senderName.trim()}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3.5 rounded-xl font-semibold transition"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</> : <><Check className="w-4 h-4" /> Ödeme Yaptım</>}
        </button>

        <button onClick={() => setStep("amount")} className="w-full mt-3 text-sm text-white/30 hover:text-white/60 transition py-2">
          ← Geri
        </button>
      </div>
    );
  }

  const bonus = amount && !isNaN(amount) ? getBonus(amount) : 0;
  const nextTier = BONUS_TIERS.slice().reverse().find(t => !amount || isNaN(amount) || amount < t.threshold);

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-violet-400" /> Bakiye Yükle
        </h1>
        <p className="text-white/30 text-sm mt-1">Papara ile anında bakiye ekle</p>
      </div>

      {/* Bonus Tiers Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 text-sm font-semibold">Yükleme Bonusu — Ne kadar yüklersen o kadar kazan!</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BONUS_TIERS.slice().reverse().map((tier) => {
            const active = amount && !isNaN(amount) && amount >= tier.threshold;
            return (
              <div key={tier.threshold}
                className={`rounded-xl p-3 text-center border transition ${
                  active
                    ? "bg-amber-500/20 border-amber-400/40"
                    : "bg-white/3 border-white/8"
                }`}>
                <p className={`text-xs mb-1 ${active ? "text-amber-300" : "text-white/40"}`}>₺{tier.threshold} yükle</p>
                <p className={`text-lg font-bold ${active ? "text-amber-400" : "text-white/30"}`}>+₺{tier.bonus}</p>
                <p className={`text-xs ${active ? "text-amber-300/70" : "text-white/20"}`}>bonus</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-4">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Miktar seç</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {PRESETS.map((p) => {
            const pb = getBonus(p);
            return (
              <button key={p} onClick={() => { setSelected(p); setCustom(""); setError(""); }}
                className={`py-3 px-1 rounded-xl text-sm font-semibold border transition relative ${
                  selected === p && !custom
                    ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                    : "bg-white/3 border-white/8 text-white/60 hover:text-white hover:bg-white/8"
                }`}>
                ₺{p}
                {pb > 0 && (
                  <span className="block text-[10px] text-amber-400 font-normal">+₺{pb} bonus</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">₺</span>
          <input type="number" min="10" max="10000" placeholder="Özel miktar..."
            value={custom} onChange={e => { setCustom(e.target.value); setSelected(null); setError(""); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      </div>

      {amount && !isNaN(amount) && amount >= 10 && (
        <div className={`border rounded-2xl p-5 mb-4 ${bonus > 0 ? "bg-amber-500/10 border-amber-500/30" : "bg-violet-600/10 border-violet-500/20"}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white/50">Yüklenecek miktar</span>
            <span className="text-lg font-bold text-white">₺{amount.toFixed(2)}</span>
          </div>
          {bonus > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-amber-400/80 flex items-center gap-1"><Gift className="w-3.5 h-3.5" /> Yükleme bonusu</span>
                <span className="text-lg font-bold text-amber-400">+₺{bonus.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Hesabına geçecek toplam</span>
                <span className="text-xl font-bold text-amber-300">₺{(amount + bonus).toFixed(2)}</span>
              </div>
            </>
          ) : nextTier && (
            <p className="text-xs text-white/30 mt-1">
              ₺{nextTier.threshold - amount} daha yükle → <span className="text-amber-400">+₺{nextTier.bonus} bonus</span> kazan
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => {
          if (!amount || isNaN(amount) || amount < 10) { setError("Minimum yükleme ₺10"); return; }
          if (amount > 10000) { setError("Maksimum yükleme ₺10.000"); return; }
          setError(""); setStep("info");
        }}
        disabled={!amount || isNaN(Number(amount)) || Number(amount) < 10}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3.5 rounded-xl font-semibold transition"
      >
        Devam Et <ChevronRight className="w-4 h-4" />
      </button>

      <div className="mt-6 flex items-start gap-2 text-xs text-white/20">
        <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-400/40" />
        Ödemeniz onaylandıktan sonra bakiyeniz hesabınıza yansır. Ortalama onay süresi: 5-15 dakika.
      </div>
    </div>
  );
}

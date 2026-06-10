"use client";

import { useState, useEffect } from "react";
import { Gift, Copy, Check, Users, TrendingUp, Link as LinkIcon } from "lucide-react";
import { authApi } from "@/lib/api";

interface ReferralStats {
  referral_code: string;
  referred_count: number;
  bonus_earned: number;
  bonus_per_referral: number;
}

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    authApi.referralStats()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://hypeuppp.vercel.app";
  const referralLink = stats ? `${frontendUrl}/register?ref=${stats.referral_code}` : "";

  async function copyLink() {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6 text-violet-400" />
          Arkadaşını Davet Et
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Her davet ettiğin kişi kayıt olduğunda ikiniz de bonus kazanırsınız.
        </p>
      </div>

      {/* Nasıl çalışır */}
      <div className="bg-[#151515] border border-white/8 rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-white/70 mb-4">Nasıl Çalışır?</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: "1", title: "Linki Paylaş",    body: "Referans linkini arkadaşlarınla paylaş." },
            { n: "2", title: "Kayıt Olsun",     body: "Arkadaşın linke tıklayıp kayıt olsun." },
            { n: "3", title: "İkiniz Kazanın",  body: `Her kayıtta ikiniz de ₺${stats?.bonus_per_referral ?? 25} bonus alırsınız.` },
          ].map(({ n, title, body }) => (
            <div key={n} className="text-center">
              <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-black text-sm text-violet-300 mx-auto mb-2">{n}</div>
              <p className="text-xs font-semibold text-white/80 mb-1">{title}</p>
              <p className="text-[11px] text-white/35 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#151515] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-white/40">Davet Ettiğin Kişiler</span>
          </div>
          {loading ? (
            <div className="h-8 bg-white/5 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-black text-white">{stats?.referred_count ?? 0}</p>
          )}
        </div>
        <div className="bg-[#151515] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/40">Kazandığın Bonus</span>
          </div>
          {loading ? (
            <div className="h-8 bg-white/5 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-black text-green-400">₺{stats?.bonus_earned?.toFixed(2) ?? "0.00"}</p>
          )}
        </div>
      </div>

      {/* Referral linki */}
      <div className="bg-[#151515] border border-violet-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white/70">Referans Linkin</span>
        </div>

        {loading ? (
          <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 truncate font-mono">
                {referralLink}
              </div>
              <button
                onClick={copyLink}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition shrink-0 ${
                  copied
                    ? "bg-green-600/20 border border-green-500/30 text-green-400"
                    : "bg-violet-600 hover:bg-violet-500 text-white"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Kopyalandı!" : "Kopyala"}
              </button>
            </div>

            <p className="text-[11px] text-white/25 mt-3">
              Linke tıklayarak kayıt olan her kişi için ikiniz de <span className="text-violet-400 font-semibold">₺{stats?.bonus_per_referral ?? 25}</span> bonus alırsınız.
              Bakiye hemen hesaba yansır.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

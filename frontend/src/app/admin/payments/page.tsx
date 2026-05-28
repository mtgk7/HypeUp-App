"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { PaymentTransaction } from "@/types";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  failed:    "bg-red-500/10 text-red-400 border-red-500/20",
};
const STATUS_TR: Record<string, string> = { pending: "Bekliyor", completed: "Başarılı", failed: "Başarısız" };

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.payments();
      setPayments(res.data);
    } finally {
      setLoading(false);
    }
  }

  const total = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount_tl, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-violet-400" />
          Ödeme İşlemleri
          <span className="text-base font-normal text-white/30 ml-2">({payments.length})</span>
        </h1>
        <button onClick={load} className="flex items-center gap-2 text-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition">
          <RefreshCw className="w-3.5 h-3.5" /> Yenile
        </button>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Toplam Yükleme</p>
          <p className="text-xl font-bold text-green-400">₺{total.toFixed(2)}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Bekleyen</p>
          <p className="text-xl font-bold text-yellow-400">{payments.filter(p => p.status === "pending").length}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Başarısız</p>
          <p className="text-xl font-bold text-red-400">{payments.filter(p => p.status === "failed").length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/30 py-16">
          <Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...
        </div>
      ) : (
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-white/8 text-white/30 text-xs uppercase">
                <th className="px-4 py-3 text-left">Kullanıcı</th>
                <th className="px-4 py-3 text-right">Miktar</th>
                <th className="px-4 py-3 text-center">Durum</th>
                <th className="px-4 py-3 text-left">Shopier ID</th>
                <th className="px-4 py-3 text-right">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-white/4 hover:bg-white/2 transition">
                  <td className="px-4 py-3 text-white/60 text-xs">{p.user_email}</td>
                  <td className="px-4 py-3 text-right font-semibold text-white">₺{p.amount_tl.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_STYLE[p.status]}`}>
                      {STATUS_TR[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs font-mono">
                    {p.shopier_payment_id ?? p.platform_order_id.slice(0, 12) + "…"}
                  </td>
                  <td className="px-4 py-3 text-right text-white/30 text-xs">
                    {new Date(p.created_at).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <p className="text-center text-white/20 py-12">Ödeme işlemi bulunamadı</p>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { PaymentTransaction } from "@/types";
import { CreditCard, Loader2, RefreshCw, Check, X } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  failed:    "bg-red-500/10 text-red-400 border-red-500/20",
};
const STATUS_TR: Record<string, string> = { pending: "Bekliyor", completed: "Onaylandı", failed: "Reddedildi" };

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const res = await adminApi.payments(); setPayments(res.data); }
    finally { setLoading(false); }
  }

  async function approve(id: string) {
    setProcessing(id);
    try { await adminApi.approvePayment(id); await load(); }
    catch { alert("Onaylama hatası"); }
    finally { setProcessing(null); }
  }

  async function reject(id: string) {
    if (!confirm("Bu ödemeyi reddetmek istiyor musun?")) return;
    setProcessing(id);
    try { await adminApi.rejectPayment(id); await load(); }
    catch { alert("Reddetme hatası"); }
    finally { setProcessing(null); }
  }

  const total = payments.filter(p => p.status === "completed").reduce((s: number, p: any) => s + p.amount_tl, 0);

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Toplam Yükleme</p>
          <p className="text-xl font-bold text-green-400">₺{total.toFixed(2)}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Bekleyen</p>
          <p className="text-xl font-bold text-yellow-400">{payments.filter((p: any) => p.status === "pending").length}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Reddedilen</p>
          <p className="text-xl font-bold text-red-400">{payments.filter((p: any) => p.status === "failed").length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/30 py-16">
          <Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...
        </div>
      ) : (
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/8 text-white/30 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Kullanıcı</th>
                  <th className="px-4 py-3 text-right">Miktar</th>
                  <th className="px-4 py-3 text-left">Gönderici</th>
                  <th className="px-4 py-3 text-left">Ref / Yöntem</th>
                  <th className="px-4 py-3 text-center">Durum</th>
                  <th className="px-4 py-3 text-right">Tarih</th>
                  <th className="px-4 py-3 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/4 hover:bg-white/2 transition">
                    <td className="px-4 py-3 text-white/60 text-xs">{p.user_email}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">₺{p.amount_tl.toFixed(2)}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">{p.sender_name || "—"}</td>
                    <td className="px-4 py-3 text-white/30 text-xs font-mono">
                      <span className="text-violet-300">{p.reference_code || p.platform_order_id?.slice(0, 10) + "…"}</span>
                      <span className="ml-2 text-white/20">{p.payment_method === "papara" ? "Papara" : "Shopier"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_STYLE[p.status]}`}>
                        {STATUS_TR[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white/30 text-xs">
                      {new Date(p.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => approve(p.id)}
                            disabled={processing === p.id}
                            className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-50"
                          >
                            {processing === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Onayla
                          </button>
                          <button
                            onClick={() => reject(p.id)}
                            disabled={processing === p.id}
                            className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-50"
                          >
                            <X className="w-3 h-3" /> Reddet
                          </button>
                        </div>
                      ) : "—"}
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

"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { AdminOrder } from "@/types";
import { ShoppingBag, Loader2, RefreshCw, ExternalLink } from "lucide-react";

const STATUSES = ["Hepsi", "pending", "processing", "completed", "cancelled", "refunded"] as const;

const STATUS_STYLE: Record<string, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed:  "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
  refunded:   "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const STATUS_TR: Record<string, string> = {
  pending: "Bekliyor", processing: "İşleniyor",
  completed: "Tamamlandı", cancelled: "İptal", refunded: "İade",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Hepsi");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { load(); }, [filter]);

  async function load() {
    setLoading(true);
    try {
      const status = filter === "Hepsi" ? undefined : filter;
      const res = await adminApi.orders(status);
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as AdminOrder["status"] } : o));
    } catch {
      alert("Durum güncellenemedi");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-violet-400" />
          Sipariş Yönetimi
          <span className="text-base font-normal text-white/30 ml-2">({orders.length})</span>
        </h1>
        <button onClick={load} className="flex items-center gap-2 text-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition">
          <RefreshCw className="w-3.5 h-3.5" /> Yenile
        </button>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === s
                ? "bg-violet-600/20 border border-violet-500/40 text-violet-300"
                : "bg-white/5 border border-white/8 text-white/40 hover:text-white"
            }`}
          >
            {s === "Hepsi" ? "Hepsi" : STATUS_TR[s]}
          </button>
        ))}
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
                <th className="px-4 py-3 text-left">Servis</th>
                <th className="px-4 py-3 text-left">Hedef</th>
                <th className="px-4 py-3 text-right">Adet</th>
                <th className="px-4 py-3 text-right">TL</th>
                <th className="px-4 py-3 text-center">Durum</th>
                <th className="px-4 py-3 text-right">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/4 hover:bg-white/2 transition">
                  <td className="px-4 py-3 text-white/50 text-xs truncate max-w-[140px]">{order.user_email}</td>
                  <td className="px-4 py-3">
                    <p className="text-white/80 text-xs font-medium">{order.service_name ?? "—"}</p>
                    <p className="text-white/30 text-xs">{order.platform_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <a href={order.target_link} target="_blank" rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 max-w-[160px] truncate">
                      {order.target_link} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right text-white/60 text-xs">{order.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-400 font-semibold">₺{order.charge_tl.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => changeStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className={`text-xs px-2 py-1 rounded-lg border bg-transparent cursor-pointer ${STATUS_STYLE[order.status]}`}
                    >
                      {Object.keys(STATUS_TR).map(s => (
                        <option key={s} value={s} className="bg-[#1a1a1a] text-white">{STATUS_TR[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right text-white/30 text-xs">
                    {new Date(order.created_at).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center text-white/20 py-12">Sipariş bulunamadı</p>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

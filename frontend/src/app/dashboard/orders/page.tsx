"use client";

import { useState, useEffect } from "react";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";
import { List, Loader2, RefreshCw } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: "Bekliyor",   color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  processing: { label: "İşleniyor", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  completed:  { label: "Tamamlandı",color: "bg-green-500/20 text-green-400 border-green-500/30" },
  cancelled:  { label: "İptal",     color: "bg-red-500/20 text-red-400 border-red-500/30" },
  refunded:   { label: "İade",      color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await ordersApi.list();
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <List className="w-6 h-6 text-violet-400" />
          Siparişlerim
        </h1>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" /> Yenile
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yükleniyor...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <List className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Henüz sipariş yok</p>
        </div>
      ) : (
        <div className="bg-[#151515] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                <th className="px-5 py-3 text-left">Platform</th>
                <th className="px-5 py-3 text-left">Servis</th>
                <th className="px-5 py-3 text-left">Link</th>
                <th className="px-5 py-3 text-right">Adet</th>
                <th className="px-5 py-3 text-right">Ücret</th>
                <th className="px-5 py-3 text-center">Durum</th>
                <th className="px-5 py-3 text-right">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const st = STATUS_MAP[order.status] || { label: order.status, color: "bg-white/10 text-white/60" };
                return (
                  <tr
                    key={order.id}
                    className={`border-b border-white/5 hover:bg-white/3 transition ${
                      i % 2 === 0 ? "" : "bg-white/2"
                    }`}
                  >
                    <td className="px-5 py-3 text-white/70">{order.platform_name || "—"}</td>
                    <td className="px-5 py-3 text-white/80 max-w-[180px] truncate">{order.service_name || "—"}</td>
                    <td className="px-5 py-3 text-white/50 max-w-[160px] truncate">
                      <a href={order.target_link} target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition">
                        {order.target_link}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-right">{order.quantity.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-green-400 font-medium">₺{order.charge_tl.toFixed(2)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-white/40 text-xs">
                      {new Date(order.created_at).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

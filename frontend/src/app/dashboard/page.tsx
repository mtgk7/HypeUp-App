"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { ordersApi, servicesApi } from "@/lib/api";
import { Order, Service } from "@/types";
import {
  PlusCircle, List, ShoppingBag, Clock,
  CheckCircle, TrendingUp, ArrowRight, Zap, Loader2
} from "lucide-react";

const PLATFORM_COLOR: Record<string, { text: string; dot: string }> = {
  Instagram: { text: "text-pink-400",  dot: "bg-pink-400" },
  TikTok:    { text: "text-cyan-400",  dot: "bg-cyan-400" },
  YouTube:   { text: "text-red-400",   dot: "bg-red-400"  },
  X:         { text: "text-slate-300", dot: "bg-slate-300" },
};

const STATUS_STYLE: Record<string, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed:  "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
  refunded:   "bg-purple-500/10 text-purple-400 border-purple-500/20",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Bekliyor", processing: "İşleniyor",
  completed: "Tamamlandı", cancelled: "İptal", refunded: "İade",
};

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const token = Cookies.get("hypeup_token");
    if (!token) { router.replace("/login"); return; }

    Promise.all([
      ordersApi.list(),
      servicesApi.list(),
    ]).then(([ordRes, svcRes]) => {
      setOrders(ordRes.data);
      // servicesApi.list() → { categories, services }
      const raw = svcRes.data;
      setServices(Array.isArray(raw) ? raw : raw.services ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const completed  = orders.filter(o => o.status === "completed").length;
  const pending    = orders.filter(o => o.status === "pending").length;
  const processing = orders.filter(o => o.status === "processing").length;
  const totalSpent = orders.reduce((s, o) => s + o.charge_tl, 0);

  // Platforma göre en ucuz servis fiyatı
  const cheapestByPlatform = services.reduce<Record<string, number>>((acc, svc) => {
    const p = svc.platform_name ?? "";
    const unit = svc.hypeup_tl_price / 1000;
    if (!acc[p] || unit < acc[p]) acc[p] = unit;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl">
      {/* Başlık */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-400" fill="currentColor" />
            Dashboard
          </h1>
          <p className="text-white/30 text-sm mt-1">Hoş geldin!</p>
        </div>
        <Link
          href="/dashboard/new-order"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          <PlusCircle className="w-4 h-4" /> Yeni Sipariş
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/30 py-16">
          <Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...
        </div>
      ) : (
        <>
          {/* ── İstatistikler ─────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Toplam",        value: orders.length, icon: ShoppingBag,  color: "text-blue-400" },
              { label: "Bekleyen",      value: pending,       icon: Clock,        color: "text-yellow-400" },
              { label: "İşleniyor",     value: processing,    icon: TrendingUp,   color: "text-violet-400" },
              { label: "Tamamlanan",    value: completed,     icon: CheckCircle,  color: "text-green-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-[#111] border border-white/8 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/30 uppercase tracking-widest">{label}</span>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <span className={`text-2xl font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Toplam harcama */}
          {orders.length > 0 && (
            <div className="bg-[#111] border border-white/8 rounded-2xl p-5 mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Toplam Harcama</p>
                <p className="text-2xl font-bold text-white">₺{totalSpent.toFixed(2)}</p>
              </div>
              <Link href="/dashboard/orders" className="text-xs text-white/30 hover:text-white flex items-center gap-1 transition">
                Tümünü gör <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* ── Servis Fiyatları ──────────────────────────── */}
          {services.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm text-white/60 uppercase tracking-widest">Mevcut Servisler</h2>
                <Link href="/dashboard/new-order" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition">
                  Sipariş ver <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-5 py-3 text-left text-xs text-white/30 uppercase tracking-widest font-normal">Servis</th>
                      <th className="px-5 py-3 text-left text-xs text-white/30 uppercase tracking-widest font-normal">Platform</th>
                      <th className="px-5 py-3 text-right text-xs text-white/30 uppercase tracking-widest font-normal">Birim Fiyat</th>
                      <th className="px-5 py-3 text-right text-xs text-white/30 uppercase tracking-widest font-normal">Min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.slice(0, 8).map((svc, i) => {
                      const pc = PLATFORM_COLOR[svc.platform_name ?? ""] ?? { text: "text-white/60", dot: "bg-white/40" };
                      const unitPrice = (svc.hypeup_tl_price / 1000).toFixed(4);
                      return (
                        <tr key={svc.id} className={`border-b border-white/4 hover:bg-white/2 transition ${i % 2 === 1 ? "bg-white/1" : ""}`}>
                          <td className="px-5 py-3 text-white/80 font-medium">{svc.service_name}</td>
                          <td className="px-5 py-3">
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${pc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                              {svc.platform_name}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="text-white font-semibold">₺{unitPrice}</span>
                            <span className="text-white/25 text-xs"> / adet</span>
                          </td>
                          <td className="px-5 py-3 text-right text-white/40 text-xs">
                            {svc.min_order.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {services.length > 8 && (
                  <div className="px-5 py-3 border-t border-white/5 text-center">
                    <Link href="/dashboard/new-order" className="text-xs text-white/30 hover:text-white/60 transition">
                      +{services.length - 8} servis daha · Sipariş formunda tüm servisler görünür
                    </Link>
                  </div>
                )}
                </div>
              </div>
            </div>
          )}

          {/* ── Son Siparişler ────────────────────────────── */}
          {orders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm text-white/60 uppercase tracking-widest">Son Siparişler</h2>
                <Link href="/dashboard/orders" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition">
                  Tümü <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
                {orders.slice(0, 5).map((order, i) => (
                  <div key={order.id} className={`flex items-center justify-between px-5 py-3.5 ${i < orders.length - 1 ? "border-b border-white/4" : ""}`}>
                    <div>
                      <p className="text-sm text-white/80 font-medium">{order.service_name ?? "Servis"}</p>
                      <p className="text-xs text-white/30 mt-0.5">{order.quantity.toLocaleString()} adet · {new Date(order.created_at).toLocaleDateString("tr-TR")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">₺{order.charge_tl.toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_STYLE[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boş durum */}
          {orders.length === 0 && (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
              <Zap className="w-10 h-10 text-violet-600/40 mx-auto mb-4" fill="currentColor" />
              <p className="text-white/40 mb-6">Henüz sipariş yok. İlk siparişini ver!</p>
              <Link
                href="/dashboard/new-order"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <PlusCircle className="w-4 h-4" /> İlk Siparişini Ver
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

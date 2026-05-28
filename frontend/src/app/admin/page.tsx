"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { AdminStats } from "@/types";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Clock, RefreshCw, Loader2, Database } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const res = await adminApi.stats();
      setStats(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function refreshCurrency() {
    try {
      const res = await adminApi.refreshCurrency();
      await loadStats();
      alert(`Kur güncellendi: 1 USD = ${res.data.rate} TRY`);
    } catch {
      alert("Kur güncellenemedi");
    }
  }

  async function syncJap() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await adminApi.syncJap();
      setSyncMsg(`✅ ${res.data.synced} servis güncellendi, ${res.data.skipped} atlandı.`);
    } catch (err: any) {
      setSyncMsg("❌ " + (err.response?.data?.detail || "JAP sync hatası"));
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yükleniyor...
      </div>
    );
  }

  const cards = [
    {
      label: "Toplam Ciro",
      value: `₺${stats?.total_revenue_tl.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Toplam Maliyet",
      value: `₺${stats?.total_cost_tl.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
    {
      label: "Net Kâr",
      value: `₺${stats?.net_profit_tl.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Toplam Sipariş",
      value: stats?.total_orders.toLocaleString(),
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Bekleyen",
      value: stats?.pending_orders.toLocaleString(),
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      label: "Dolar Kuru",
      value: `₺${stats?.dolar_kuru.toFixed(2)}`,
      icon: DollarSign,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-violet-400" />
          Admin Dashboard
        </h1>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" /> Yenile
        </button>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-5 ${bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40 uppercase tracking-widest">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Aksiyonlar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#151515] border border-white/10 rounded-2xl p-5">
          <h2 className="font-semibold mb-1 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-orange-400" /> Döviz Kuru
          </h2>
          <p className="text-xs text-white/40 mb-4">Anlık kuru TCMB/ExchangeRate API'sinden güncelle</p>
          <button
            onClick={refreshCurrency}
            className="bg-orange-600/20 border border-orange-500/30 text-orange-400 hover:bg-orange-600/30 px-4 py-2 rounded-lg text-sm transition"
          >
            Kuru Güncelle
          </button>
        </div>

        <div className="bg-[#151515] border border-white/10 rounded-2xl p-5">
          <h2 className="font-semibold mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" /> JAP Servis Senkronizasyonu
          </h2>
          <p className="text-xs text-white/40 mb-4">Tüm servisleri JAP'tan çekip fiyatları otomatik hesapla</p>
          <button
            onClick={syncJap}
            disabled={syncing}
            className="bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 disabled:opacity-50 px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
          >
            {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {syncing ? "Senkronize ediliyor..." : "Servisleri Senkronize Et"}
          </button>
          {syncMsg && <p className="text-xs mt-2 text-white/60">{syncMsg}</p>}
        </div>
      </div>
    </div>
  );
}

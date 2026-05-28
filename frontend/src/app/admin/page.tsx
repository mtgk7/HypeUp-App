"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { AdminStats } from "@/types";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Clock, RefreshCw, Loader2 } from "lucide-react";

interface ChartDay { date: string; revenue: number; orders: number; deposits: number; }
type ChartMetric = "revenue" | "orders" | "deposits";

function MiniBarChart({ data, metric }: { data: ChartDay[]; metric: ChartMetric }) {
  const values = data.map(d => d[metric]);
  const max = Math.max(...values, 1);
  const colors: Record<ChartMetric, string> = {
    revenue:  "bg-violet-500",
    orders:   "bg-blue-500",
    deposits: "bg-green-500",
  };

  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((d, i) => {
        const h = Math.round((d[metric] / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className={`w-full rounded-sm ${colors[metric]} opacity-70 group-hover:opacity-100 transition`} style={{ height: `${Math.max(h, 2)}%` }} />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#222] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white whitespace-nowrap z-10">
              {metric === "orders" ? d[metric] : `₺${d[metric].toFixed(0)}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chart, setChart] = useState<ChartDay[]>([]);
  const [chartMetric, setChartMetric] = useState<ChartMetric>("revenue");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([adminApi.stats(), adminApi.chart(14)]);
      setStats(sRes.data);
      setChart(cRes.data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-white/40">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yükleniyor...
    </div>
  );

  const kpis = [
    { label: "Toplam Ciro",    value: `₺${stats?.total_revenue_tl.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`, icon: TrendingUp,  color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
    { label: "Toplam Maliyet", value: `₺${stats?.total_cost_tl.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,   icon: TrendingDown, color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20" },
    { label: "Net Kâr",        value: `₺${stats?.net_profit_tl.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,   icon: DollarSign,   color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Toplam Sipariş", value: stats?.total_orders.toLocaleString(),                                                icon: ShoppingBag,  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Bekleyen",       value: stats?.pending_orders.toLocaleString(),                                              icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { label: "Dolar Kuru",     value: `₺${stats?.dolar_kuru.toFixed(2)}`,                                                 icon: DollarSign,   color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  ];

  const metricTabs: { key: ChartMetric; label: string; color: string }[] = [
    { key: "revenue",  label: "Gelir",    color: "text-violet-400 border-violet-500/40 bg-violet-600/10" },
    { key: "orders",   label: "Siparişler", color: "text-blue-400 border-blue-500/40 bg-blue-600/10" },
    { key: "deposits", label: "Yüklemeler", color: "text-green-400 border-green-500/40 bg-green-600/10" },
  ];

  const totalChart = chart.reduce((s, d) => s + d[chartMetric], 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-violet-400" /> Admin Dashboard
        </h1>
        <button onClick={loadAll} className="flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition">
          <RefreshCw className="w-4 h-4" /> Yenile
        </button>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-5 ${bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40 uppercase tracking-widest">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Grafik */}
      {chart.length > 0 && (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-sm">Son 14 Gün</h2>
              <p className="text-xs text-white/30 mt-0.5">
                Toplam: {chartMetric === "orders" ? totalChart.toLocaleString() : `₺${totalChart.toFixed(2)}`}
              </p>
            </div>
            <div className="flex gap-1.5">
              {metricTabs.map(t => (
                <button key={t.key} onClick={() => setChartMetric(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    chartMetric === t.key ? t.color : "text-white/30 border-white/8 hover:text-white"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <MiniBarChart data={chart} metric={chartMetric} />

          {/* X ekseni etiketleri */}
          <div className="flex mt-2 gap-0.5">
            {chart.map((d, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-white/20">
                {i % 2 === 0 ? d.date.slice(5) : ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

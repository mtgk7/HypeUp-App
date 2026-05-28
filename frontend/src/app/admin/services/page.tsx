"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { AdminService } from "@/types";
import { Package, Loader2, RefreshCw, Check, X, Pencil } from "lucide-react";

const PLATFORM_COLOR: Record<string, string> = {
  Instagram: "text-pink-400",
  TikTok:    "text-cyan-400",
  YouTube:   "text-red-400",
  X:         "text-slate-300",
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.services();
      setServices(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(svc: AdminService) {
    setSaving(svc.id);
    try {
      await adminApi.updateService(svc.id, { is_active: !svc.is_active });
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_active: !svc.is_active } : s));
    } catch {
      alert("Güncelleme başarısız");
    } finally {
      setSaving(null);
    }
  }

  async function savePrice(svc: AdminService) {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) return;
    setSaving(svc.id);
    try {
      await adminApi.updateService(svc.id, { hypeup_tl_price: price });
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, hypeup_tl_price: price } : s));
      setEditing(null);
    } catch {
      alert("Fiyat güncellenemedi");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-5 h-5 text-violet-400" />
          Servis Yönetimi
          <span className="text-base font-normal text-white/30 ml-2">({services.length})</span>
        </h1>
        <button onClick={load} className="flex items-center gap-2 text-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition">
          <RefreshCw className="w-3.5 h-3.5" /> Yenile
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/30 py-16">
          <Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...
        </div>
      ) : (
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/8 text-white/30 text-xs uppercase">
                <th className="px-4 py-3 text-left">Platform</th>
                <th className="px-4 py-3 text-left">Servis Adı</th>
                <th className="px-4 py-3 text-right">JAP Alış (₺/1000)</th>
                <th className="px-4 py-3 text-right">Satış (₺/1000)</th>
                <th className="px-4 py-3 text-center">Min</th>
                <th className="px-4 py-3 text-center">Aktif</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.id} className={`border-b border-white/4 hover:bg-white/2 transition ${!svc.is_active ? "opacity-40" : ""}`}>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${PLATFORM_COLOR[svc.platform_name ?? ""] ?? "text-white/50"}`}>
                      {svc.platform_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/80 text-xs max-w-[200px] truncate">{svc.service_name}</td>
                  <td className="px-4 py-3 text-right text-white/40 text-xs">
                    {svc.jap_dolar_price ? `₺${(svc.jap_dolar_price * 47.5).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editing === svc.id ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          className="w-24 bg-white/10 border border-violet-500/40 rounded-lg px-2 py-1 text-xs text-white text-right"
                          autoFocus
                        />
                        <button onClick={() => savePrice(svc)} disabled={saving === svc.id}
                          className="p-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                          <Check className="w-3 h-3" />
                        </button>
                        <button onClick={() => setEditing(null)}
                          className="p-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditing(svc.id); setEditPrice(svc.hypeup_tl_price.toString()); }}
                        className="flex items-center gap-1 text-violet-400 hover:text-violet-300 ml-auto text-xs"
                      >
                        ₺{svc.hypeup_tl_price.toFixed(2)}
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-white/40 text-xs">{svc.min_order?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(svc)}
                      disabled={saving === svc.id}
                      className={`w-10 h-5 rounded-full transition-colors relative ${svc.is_active ? "bg-green-500" : "bg-white/15"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${svc.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { AdminStats } from "@/types";
import { Settings, RefreshCw, Database, Loader2, DollarSign, Check, Wallet, List } from "lucide-react";

export default function AdminSettingsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [kurMsg, setKurMsg] = useState("");
  const [manualKur, setManualKur] = useState("");
  const [settingKur, setSettingKur] = useState(false);
  const [prm4uBalance, setPrm4uBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

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
    setRefreshing(true);
    setKurMsg("");
    try {
      const res = await adminApi.refreshCurrency();
      await loadStats();
      setKurMsg(`Güncellendi: 1 USD = ₺${res.data.rate}`);
    } catch {
      setKurMsg("Kur güncellenemedi");
    } finally {
      setRefreshing(false);
    }
  }

  async function setManualRate() {
    const rate = parseFloat(manualKur);
    if (!rate || rate < 1 || rate > 500) { setKurMsg("Geçersiz kur değeri"); return; }
    setSettingKur(true); setKurMsg("");
    try {
      const res = await adminApi.setCurrency(rate);
      await loadStats();
      setKurMsg(`Kur ₺${rate} olarak ayarlandı. ${res.data.updated_services} servis fiyatı güncellendi.`);
      setManualKur("");
    } catch {
      setKurMsg("Kur güncellenemedi");
    } finally {
      setSettingKur(false);
    }
  }

  async function syncPrm4u() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await adminApi.syncPrm4u();
      setSyncMsg(`${res.data.synced} servis güncellendi, ${res.data.skipped} atlandı.`);
    } catch (err: any) {
      setSyncMsg(err.response?.data?.detail || "Sağlayıcı sync hatası");
    } finally {
      setSyncing(false);
    }
  }

  async function checkPrm4uBalance() {
    setBalanceLoading(true);
    try {
      const res = await adminApi.prm4uBalance();
      setPrm4uBalance(`$${res.data.balance ?? JSON.stringify(res.data)}`);
    } catch (err: any) {
      setPrm4uBalance(err.response?.data?.detail || "Bağlantı hatası");
    } finally {
      setBalanceLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-8">
        <Settings className="w-5 h-5 text-violet-400" />
        Sistem Ayarları
      </h1>

      {/* Dolar Kuru */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-orange-400" />
          <h2 className="font-semibold">Dolar Kuru</h2>
        </div>
        <p className="text-xs text-white/30 mb-4">TCMB / ExchangeRate API'sinden anlık kuru güncelle</p>

        {loading ? (
          <div className="text-white/30 text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...</div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2">
              <p className="text-xs text-white/30 mb-0.5">Mevcut Kur</p>
              <p className="text-lg font-bold text-orange-400">₺{stats?.dolar_kuru.toFixed(2)}</p>
            </div>
            <button
              onClick={refreshCurrency}
              disabled={refreshing}
              className="flex items-center gap-2 bg-orange-600/20 border border-orange-500/30 text-orange-400 hover:bg-orange-600/30 disabled:opacity-50 px-4 py-2.5 rounded-xl text-sm transition"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Kuru Güncelle
            </button>
          </div>
        )}

        {/* Manuel kur girişi */}
        <div className="mt-4 pt-4 border-t border-white/8">
          <p className="text-xs text-white/30 mb-2">Manuel kur gir — tüm servis fiyatları otomatik güncellenir</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">₺</span>
              <input
                type="number"
                min="1" max="500" step="0.01"
                placeholder={stats?.dolar_kuru?.toFixed(2) ?? "45.91"}
                value={manualKur}
                onChange={e => setManualKur(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-sm w-32 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <button
              onClick={setManualRate}
              disabled={settingKur || !manualKur}
              className="flex items-center gap-2 bg-orange-600/20 border border-orange-500/30 text-orange-400 hover:bg-orange-600/30 disabled:opacity-50 px-4 py-2.5 rounded-xl text-sm transition"
            >
              {settingKur ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {settingKur ? "Güncelleniyor..." : "Uygula ve Fiyatları Güncelle"}
            </button>
          </div>
        </div>

        {kurMsg && (
          <p className="text-xs mt-3 text-green-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> {kurMsg}
          </p>
        )}
      </div>

      {/* Sağlayıcı Bakiye */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-green-400" />
          <h2 className="font-semibold">Sağlayıcı Bakiye</h2>
        </div>
        <p className="text-xs text-white/30 mb-4">
          Sağlayıcı hesabındaki mevcut USD bakiyesini kontrol et.
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={checkPrm4uBalance}
            disabled={balanceLoading}
            className="flex items-center gap-2 bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 disabled:opacity-50 px-4 py-2.5 rounded-xl text-sm transition"
          >
            {balanceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
            Bakiye Sorgula
          </button>
          {prm4uBalance && (
            <span className="text-sm font-semibold text-green-400">{prm4uBalance}</span>
          )}
        </div>
      </div>

      {/* Sağlayıcı Senkronizasyon */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-blue-400" />
          <h2 className="font-semibold">Sağlayıcı Servis Senkronizasyonu</h2>
        </div>
        <p className="text-xs text-white/30 mb-4">
          Sağlayıcı'dan tüm servisleri çekip güncel fiyatları kâr motoruyla otomatik hesapla ve veritabanını güncelle.
        </p>

        <button
          onClick={syncPrm4u}
          disabled={syncing}
          className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 disabled:opacity-50 px-4 py-2.5 rounded-xl text-sm transition"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          {syncing ? "Senkronize ediliyor..." : "Servisleri Senkronize Et"}
        </button>

        {syncMsg && (
          <p className="text-xs mt-3 text-green-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> {syncMsg}
          </p>
        )}
      </div>
    </div>
  );
}

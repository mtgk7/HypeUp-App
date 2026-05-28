"use client";

import { useState, useEffect } from "react";
import { usersApi, ordersApi, authApi } from "@/lib/api";
import { User, Order } from "@/types";
import { User as UserIcon, Wallet, ShoppingBag, Calendar, Lock, Loader2, Check, Eye, EyeOff, Copy, Users } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Şifre değişimi
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([usersApi.me(), ordersApi.list()])
      .then(([p, o]) => {
        setProfile(p.data);
        setOrders(o.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 6) {
      setPwMsg({ type: "error", text: "Yeni şifre en az 6 karakter olmalı" });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await authApi.changePassword(oldPw, newPw);
      setPwMsg({ type: "success", text: "Şifreniz başarıyla güncellendi" });
      setOldPw("");
      setNewPw("");
    } catch (err: any) {
      setPwMsg({ type: "error", text: err.response?.data?.detail || "Şifre güncellenemedi" });
    } finally {
      setPwLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/30 py-20">
        <Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...
      </div>
    );
  }

  const totalSpent = orders.reduce((s, o) => s + o.charge_tl, 0);
  const completed  = orders.filter(o => o.status === "completed").length;
  const memberSince = profile ? new Date(profile.created_at).toLocaleDateString("tr-TR") : "—";
  const refLink = profile?.referral_code
    ? `${typeof window !== "undefined" ? window.location.origin : "https://hypeuppp.vercel.app"}/register?ref=${profile.referral_code}`
    : null;

  function copyRefLink() {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-8">
        <UserIcon className="w-5 h-5 text-violet-400" />
        Profilim
      </h1>

      {/* Profil Kartı */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-violet-600/20 border border-violet-500/20 rounded-2xl flex items-center justify-center">
            <UserIcon className="w-7 h-7 text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-white">{profile?.email}</p>
            <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full">
              {profile?.role === "admin" ? "Admin" : "Kullanıcı"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Wallet, label: "Bakiye", value: `₺${profile?.balance.toFixed(2) ?? "0.00"}`, color: "text-green-400" },
            { icon: ShoppingBag, label: "Toplam Sipariş", value: orders.length.toLocaleString(), color: "text-blue-400" },
            { icon: Check, label: "Tamamlanan", value: completed.toLocaleString(), color: "text-violet-400" },
            { icon: Calendar, label: "Üyelik Tarihi", value: memberSince, color: "text-white/60" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white/3 border border-white/6 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <p className="text-xs text-white/30">{label}</p>
              </div>
              <p className={`font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {orders.length > 0 && (
          <div className="mt-3 bg-white/3 border border-white/6 rounded-xl p-4">
            <p className="text-xs text-white/30 mb-1">Toplam Harcama</p>
            <p className="text-xl font-bold text-white">₺{totalSpent.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Referans Sistemi */}
      {refLink && (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-4">
          <h2 className="font-semibold flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-violet-400" />
            Arkadaşını Davet Et
          </h2>
          <p className="text-xs text-white/30 mb-4">
            Davet ettiğin her kişi kayıt olduğunda <span className="text-green-400 font-semibold">+₺25</span> bonus kazanırsın. Arkadaşın da <span className="text-green-400 font-semibold">+₺25</span> ekstra alır.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={refLink}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/60 truncate"
            />
            <button onClick={copyRefLink}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                copied ? "bg-green-600/20 border border-green-500/30 text-green-400" : "bg-violet-600/20 border border-violet-500/30 text-violet-400 hover:bg-violet-600/30"
              }`}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Kopyalandı!" : "Kopyala"}
            </button>
          </div>
        </div>
      )}

      {/* Şifre Değiştir */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-white/40" />
          Şifre Değiştir
        </h2>

        <form onSubmit={changePassword} className="space-y-3">
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Mevcut şifre"
              value={oldPw}
              onChange={e => setOldPw(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pr-10 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition"
            />
            <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Yeni şifre (min. 6 karakter)"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pr-10 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {pwMsg && (
            <p className={`text-xs ${pwMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {pwMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Şifreyi Güncelle
          </button>
        </form>
      </div>
    </div>
  );
}

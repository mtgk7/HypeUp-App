"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Wallet, ArrowRight, Loader2 } from "lucide-react";
import { usersApi } from "@/lib/api";

export default function PaymentSuccessPage() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    usersApi.me()
      .then((res) => setBalance(res.data.balance))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Ödeme Başarılı!</h1>
      <p className="text-white/40 text-sm mb-8">
        Bakiyeniz hesabınıza yansıtıldı.
      </p>

      {balance !== null ? (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-8">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Güncel Bakiyeniz</p>
          <p className="text-3xl font-bold text-green-400">₺{balance.toFixed(2)}</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6 mb-8 flex items-center justify-center gap-2 text-white/30">
          <Loader2 className="w-4 h-4 animate-spin" /> Bakiye yükleniyor...
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/new-order"
          className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition"
        >
          Sipariş Ver <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard/add-balance"
          className="flex items-center justify-center gap-2 text-white/40 hover:text-white text-sm transition"
        >
          <Wallet className="w-4 h-4" /> Tekrar Bakiye Yükle
        </Link>
      </div>
    </div>
  );
}

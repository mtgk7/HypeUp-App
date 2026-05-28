"use client";

import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

export default function PaymentFailPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-10 h-10 text-red-400" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Ödeme Başarısız</h1>
      <p className="text-white/40 text-sm mb-8">
        Ödeme işleminiz tamamlanamadı. Bakiyenizde herhangi bir değişiklik yapılmadı.
      </p>

      <div className="bg-[#111] border border-white/8 rounded-2xl p-5 mb-8 text-left">
        <p className="text-xs text-white/30 mb-3 uppercase tracking-widest">Sık karşılaşılan nedenler</p>
        <ul className="space-y-2 text-sm text-white/50">
          <li>· Kart bilgileri hatalı girildi</li>
          <li>· Yetersiz kart limiti</li>
          <li>· 3D Secure doğrulaması iptal edildi</li>
          <li>· Banka tarafından işlem reddedildi</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/add-balance"
          className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition"
        >
          <RefreshCw className="w-4 h-4" /> Tekrar Dene
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 text-white/40 hover:text-white text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard'a Dön
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { authApi } from "@/lib/api";
import { Zap, Mail, Lock, Gift, Loader2, Users } from "lucide-react";
import { conversionSignUp } from "@/lib/gtag";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [refCode, setRefCode]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setRefCode(ref);
  }, [searchParams]);

  const isReferred = !!refCode;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Şifreler eşleşmiyor"); return; }
    setLoading(true);
    try {
      const res = await authApi.register(email, password, refCode || undefined);
      Cookies.set("hypeup_token", res.data.access_token, { expires: 1 });
      Cookies.set("hypeup_role", res.data.role, { expires: 1 });
      conversionSignUp();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kayıt başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center glow-purple">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
            HypeUp
          </span>
        </div>

        {/* Bonus banner */}
        <div className={`border rounded-xl p-4 mb-6 flex items-center gap-3 ${
          isReferred
            ? "bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30"
            : "bg-gradient-to-r from-amber-600/15 to-orange-600/15 border-amber-500/30"
        }`}>
          {isReferred ? <Users className="w-6 h-6 text-green-400 shrink-0" /> : <Gift className="w-6 h-6 text-amber-400 shrink-0" />}
          <div>
            {isReferred ? (
              <>
                <p className="text-sm font-semibold text-green-300">Referans Bonusu Aktif!</p>
                <p className="text-xs text-white/60">
                  Kayıt olunca <span className="text-green-400 font-bold">25 TL</span> referans bonusu hesabına eklenir 🎉
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-amber-300">Yükleme Bonusu Kazan!</p>
                <p className="text-xs text-white/60">
                  100 TL yükle <span className="text-amber-400 font-bold">+25 TL</span> · 150 TL yükle <span className="text-amber-400 font-bold">+50 TL</span> · 200 TL yükle <span className="text-amber-400 font-bold">+75 TL</span>
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#151515] border border-white/10 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-center mb-6">Hesap Oluştur</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="email" placeholder="E-posta adresi" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="password" placeholder="Şifre (min. 6 karakter)" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="password" placeholder="Şifreyi tekrar gir" value={confirm} onChange={e => setConfirm(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition" />
            </div>

            {/* Referans kodu */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="text" placeholder="Davet kodu (opsiyonel)" value={refCode} onChange={e => setRefCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 rounded-lg py-3 text-sm font-semibold transition flex items-center justify-center gap-2 glow-purple">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Kayıt yapılıyor..." : isReferred ? "Kayıt Ol ve 25 TL Kazan" : "Kayıt Ol"}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "TikTok Takipçi Satın Al | Güvenli ve Hızlı",
  description:
    "TikTok takipçi satın al, hesabını viral yap. Hızlı teslimat, güvenli ödeme, 7/24 destek. ₺5'ten başlayan TL fiyatlarıyla HypeUp'ta hemen sipariş ver.",
  keywords:
    "tiktok takipçi satın al, tiktok takipçi, tiktok büyütme, tiktok panel, sosyal medya panel",
  openGraph: {
    title: "TikTok Takipçi Satın Al",
    description:
      "TikTok hesabını büyüt. Hızlı teslimat, güvenli ödeme, uygun TL fiyatları.",
    url: "https://hypeuppp.vercel.app/tiktok-takipci-satin-al",
    type: "website",
  },
  alternates: {
    canonical: "https://hypeuppp.vercel.app/tiktok-takipci-satin-al",
  },
};

const FAQS = [
  {
    q: "TikTok takipçi satın almak hesabıma zarar verir mi?",
    a: "Hayır. HypeUp olarak hesap bilgilerinizi asla istemiyoruz. Sadece TikTok kullanıcı adınızı girmeniz yeterli. Hizmetlerimiz platformun yapısıyla uyumlu çalışır.",
  },
  {
    q: "TikTok takipçilerim ne zaman gelir?",
    a: "Çoğu paket sipariş sonrası 1-12 saat içinde teslim edilir. Büyük paketler 24-48 saate kadar sürebilir.",
  },
  {
    q: "TikTok için başka hizmetleriniz var mı?",
    a: "Evet. Takipçi dışında TikTok beğeni, izlenme, yorum ve canlı yayın izleyicisi gibi hizmetler de sunuyoruz.",
  },
  {
    q: "Kaç takipçiden sipariş verebilirim?",
    a: "Paketlerimiz genellikle 100 takipçiden başlayıp 100.000'e kadar çıkmaktadır. İhtiyacına uygun paketi seçebilirsin.",
  },
  {
    q: "Ödeme yöntemleri nelerdir?",
    a: "Papara ve banka havalesiyle kolayca bakiye yükleyebilirsiniz. Bakiye anında hesabınıza yansır.",
  },
];

export default function TikTokTakipciPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/20 rounded-full px-4 py-2 text-sm text-white mb-6">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z" /></svg>
            TikTok Hizmetleri
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            TikTok Takipçi Satın Al
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            TikTok hesabını viral yap. Gerçek görünümlü takipçiler, hızlı
            teslimat ve uygun TL fiyatlarıyla profilini büyüt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-colors"
            >
              Hemen Başla — Ücretsiz Kayıt
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              Giriş Yap & Sipariş Ver
            </Link>
          </div>
        </div>
      </section>

      <AdBanner slot="7519591468" className="max-w-4xl mx-auto px-4" />

      {/* Neden HypeUp */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Neden HypeUp&apos;ta TikTok Takipçi Almalısın?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Viral Olmanın Yolu",
                desc: "TikTok algoritması takipçi sayısına bakıyor. Daha fazla takipçi = daha fazla öneri.",
                icon: "🚀",
              },
              {
                title: "Hızlı Başlangıç",
                desc: "Siparişin onaylanmasının ardından kısa sürede teslimat başlar.",
                icon: "⚡",
              },
              {
                title: "Uygun TL Fiyatı",
                desc: "Döviz bazlı hizmetleri TL'ye çevirerek en uygun fiyatı sunuyoruz.",
                icon: "💰",
              },
              {
                title: "Gizlilik",
                desc: "Şifren bizde değil. Sadece kullanıcı adın yeterli.",
                icon: "🔒",
              },
              {
                title: "Çoklu Hizmet",
                desc: "TikTok beğeni, izlenme, yorum ve daha fazlası tek platformda.",
                icon: "📦",
              },
              {
                title: "7/24 Destek",
                desc: "Telegram üzerinden istediğin saatte destek alabilirsin.",
                icon: "🛟",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            TikTok Takipçi Almak 3 Adımda Tamamlanır
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Ücretsiz Kayıt Ol",
                desc: "E-posta adresinle saniyeler içinde hesap aç.",
              },
              {
                step: "2",
                title: "Bakiye Yükle",
                desc: "Papara veya havale ile TL yükle. Bakiyen anında hazır.",
              },
              {
                step: "3",
                title: "Sipariş Ver",
                desc: "TikTok kullanıcı adını gir, paketi seç, sipariş ver. Takipçiler gelsin.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-colors"
            >
              Şimdi Kayıt Ol ve İlk Siparişini Ver
            </Link>
          </div>
        </div>
      </section>

      <AdBanner slot="7380529666" format="autorelaxed" className="max-w-4xl mx-auto px-4 my-8" />

      {/* SSS */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group p-5 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
              >
                <summary className="font-semibold list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-white/5 via-transparent to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            TikTok&apos;ta Büyümeye Hazır Mısın?
          </h2>
          <p className="text-gray-400 mb-8">
            Hemen kayıt ol, 50₺ hoş geldin bonusu kazan ve ilk siparişini ver.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl transition-colors"
          >
            Ücretsiz Hesap Aç →
          </Link>
        </div>
      </section>

      <div className="py-8 px-4 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  );
}

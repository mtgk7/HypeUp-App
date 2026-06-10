import type { Metadata } from "next";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "YouTube Abone Satın Al | Güvenli ve Hızlı | HypeUp",
  description:
    "YouTube abone satın al, kanalını büyüt. 1000 abone hedefine ulaş, monetizasyon şartını tamamla. Hızlı teslimat, uygun TL fiyatları. HypeUp'ta hemen sipariş ver.",
  keywords:
    "youtube abone satın al, youtube abone, youtube büyütme, youtube monetizasyon, sosyal medya panel",
  openGraph: {
    title: "YouTube Abone Satın Al | HypeUp",
    description:
      "YouTube kanalını büyüt. 1000 abone hedefine ulaş. Hızlı teslimat, güvenli ödeme.",
    url: "https://hypeuppp.vercel.app/youtube-abone-satin-al",
    type: "website",
  },
  alternates: {
    canonical: "https://hypeuppp.vercel.app/youtube-abone-satin-al",
  },
};

const FAQS = [
  {
    q: "YouTube abone satın almak kanalıma zarar verir mi?",
    a: "Şifrenizi veya kişisel bilgilerinizi asla istemiyoruz. Sadece kanal linkinizi girmeniz yeterli. Hizmetlerimiz platformun yapısıyla uyumlu çalışır.",
  },
  {
    q: "Aboneler ne kadar sürede gelir?",
    a: "Çoğu abone paketi sipariş sonrası 6-24 saat içinde teslim edilmeye başlar. Büyük paketler 48 saate kadar sürebilir.",
  },
  {
    q: "1000 abone hedefine ulaşmama yardımcı olur musunuz?",
    a: "Evet. YouTube monetizasyon için gereken 1000 abone hedefine ulaşmak için ihtiyacına uygun paketi seçebilirsin.",
  },
  {
    q: "YouTube için başka hizmetleriniz var mı?",
    a: "Evet. Abone dışında YouTube izlenme, beğeni, yorum ve canlı yayın izleyicisi gibi hizmetler de sunuyoruz.",
  },
  {
    q: "Ödeme nasıl yapılır?",
    a: "Papara veya banka havalesiyle bakiye yükleyebilirsiniz. Bakiye anında hesabınıza yansır, hemen sipariş verebilirsiniz.",
  },
];

export default function YouTubeAbonePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/30 rounded-full px-4 py-2 text-sm text-red-400 mb-6">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            YouTube Hizmetleri
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            YouTube Abone Satın Al
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            YouTube kanalını büyüt. 1000 abone hedefine ulaş, monetizasyona
            hak kazan. Hızlı teslimat ve uygun TL fiyatlarıyla HypeUp&apos;ta sipariş ver.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
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

      {/* Monetizasyon Banner */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-red-600/10 border border-red-600/30 text-center">
          <div className="text-3xl mb-3">🎯</div>
          <h2 className="text-xl font-bold mb-2">YouTube Monetizasyon Hedefi</h2>
          <p className="text-gray-300 text-sm">
            YouTube Partner Programı için <strong>1.000 abone</strong> ve 4.000 saatlik izlenme süresi gerekiyor.
            HypeUp ile abone hedefine hızla ulaşabilirsin.
          </p>
        </div>
      </section>

      {/* Neden HypeUp */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Neden HypeUp&apos;ta YouTube Abone Almalısın?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Hızlı Teslimat",
                desc: "Siparişlerin büyük çoğunluğu 6-24 saat içinde başlar.",
                icon: "⚡",
              },
              {
                title: "Uygun Fiyat",
                desc: "TL bazlı fiyatlarla en uygun paketleri sunuyoruz.",
                icon: "💰",
              },
              {
                title: "Şifresiz İşlem",
                desc: "Sadece kanal linkin yeterli. Şifre veya hesap bilgisi asla istenmez.",
                icon: "🔒",
              },
              {
                title: "1000 Abone Paketi",
                desc: "Monetizasyon hedefin için özel paketler mevcut.",
                icon: "🏆",
              },
              {
                title: "Çoklu Hizmet",
                desc: "Abone dışında izlenme, beğeni ve daha fazlası tek platformda.",
                icon: "📦",
              },
              {
                title: "7/24 Destek",
                desc: "Telegram üzerinden her zaman destek alabilirsin.",
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
            YouTube Abone Almak 3 Adımda Tamamlanır
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
                desc: "Papara veya havale ile TL yükle. Anında hesabına yansır.",
              },
              {
                step: "3",
                title: "Sipariş Ver",
                desc: "YouTube kanal linkini gir, abone paketini seç, sipariş ver.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shrink-0">
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
              className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
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
      <section className="py-16 px-4 bg-gradient-to-br from-red-600/10 via-transparent to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            YouTube Kanalını Büyütmeye Hazır Mısın?
          </h2>
          <p className="text-gray-400 mb-8">
            Hemen kayıt ol, 50₺ hoş geldin bonusu kazan ve 1000 abone hedefine ulaş.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
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

import type { Metadata } from "next";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Instagram Takipçi Satın Al | Güvenli ve Hızlı | HypeUp",
  description:
    "Instagram takipçi satın al, hesabını büyüt. Gerçek görünümlü takipçiler, hızlı teslimat, 7/24 destek. ₺5'ten başlayan fiyatlarla HypeUp'ta hemen sipariş ver.",
  keywords:
    "instagram takipçi satın al, instagram takipçi, takipçi satın al, instagram büyütme, sosyal medya panel",
  openGraph: {
    title: "Instagram Takipçi Satın Al | HypeUp",
    description:
      "Hesabını güçlendir. Gerçek görünümlü Instagram takipçileri, hızlı teslimat, uygun fiyat.",
    url: "https://hypeuppp.vercel.app/instagram-takipci-satin-al",
    type: "website",
  },
  alternates: {
    canonical: "https://hypeuppp.vercel.app/instagram-takipci-satin-al",
  },
};

const FAQS = [
  {
    q: "Instagram takipçi satın almak güvenli mi?",
    a: "Evet. HypeUp olarak hesabınızın şifresini veya kişisel bilgilerinizi asla istemiyoruz. Sadece profil linkinizi girerek sipariş verebilirsiniz. Hizmetlerimiz Instagram'ın yapısına uygun şekilde çalışır.",
  },
  {
    q: "Takipçiler ne kadar sürede gelir?",
    a: "Çoğu takipçi paketi siparişin ardından 1-24 saat içinde teslim edilir. Yoğunluğa göre bazı büyük paketler 48 saate kadar sürebilir.",
  },
  {
    q: "Takipçiler düşer mi?",
    a: "Bazı paketlerde küçük miktarda düşüş olabilir. Bu durumda destek hattımız üzerinden bildirim yaparak işlem takibi talep edebilirsiniz.",
  },
  {
    q: "Minimum kaç takipçi satın alabilirim?",
    a: "Paketlerimiz genellikle 100 takipçiden başlar. Hesabınıza ve ihtiyacınıza uygun paketi seçmek için hizmetler sayfasını inceleyebilirsiniz.",
  },
  {
    q: "Ödeme nasıl yapılır?",
    a: "Bakiye yükleme sayfasından Papara veya havale ile kolayca ödeme yapabilirsiniz. Bakiyeniz onaylanır, ardından sipariş verirsiniz.",
  },
];

export default function InstagramTakipciPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E1306C]/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#E1306C]/10 border border-[#E1306C]/30 rounded-full px-4 py-2 text-sm text-[#E1306C] mb-6">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            Instagram Hizmetleri
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Instagram Takipçi Satın Al
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Hesabını hızla büyüt. Gerçek görünümlü takipçiler, anlık başlayan
            teslimat ve uygun TL fiyatlarıyla Instagram profilini güçlendir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-[#E1306C] hover:bg-[#c1265a] text-white font-semibold rounded-xl transition-colors"
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
            Neden HypeUp&apos;ta Instagram Takipçi Almalısın?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Hızlı Teslimat",
                desc: "Siparişlerin büyük çoğunluğu 1-6 saat içinde başlar. Beklemeden büyü.",
                icon: "⚡",
              },
              {
                title: "Uygun Fiyat",
                desc: "Anlık döviz kuruyla hesaplanan TL fiyatlar. Dolar artsa bile senin fiyatın sabit.",
                icon: "💰",
              },
              {
                title: "7/24 Destek",
                desc: "Herhangi bir sorununda Telegram destek hattımız her zaman yanında.",
                icon: "🛟",
              },
              {
                title: "Şifresiz İşlem",
                desc: "Sadece profil linkin yeterli. Şifre veya hesap bilgisi asla istenmez.",
                icon: "🔒",
              },
              {
                title: "1.400+ Hizmet",
                desc: "Takipçi, beğeni, görüntüleme ve daha fazlası. Her ihtiyacın için bir paket var.",
                icon: "📦",
              },
              {
                title: "Anlık Bakiye",
                desc: "Papara veya havale ile yükle, bakiyen anında gelsin, hemen sipariş ver.",
                icon: "💳",
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
            Instagram Takipçi Almak 3 Adımda Tamamlanır
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Ücretsiz Kayıt Ol",
                desc: "E-posta adresinle saniyeler içinde hesap aç. Kayıt olmak tamamen ücretsiz.",
              },
              {
                step: "2",
                title: "Bakiye Yükle",
                desc: "Papara veya havale ile istediğin miktarda TL yükle. Anında hesabına yansır.",
              },
              {
                step: "3",
                title: "Sipariş Ver",
                desc: "Instagram profilini seç, paket miktarını belirle, ödemeyi tamamla. Takipçiler gelmeye başlasın.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#E1306C] flex items-center justify-center text-white font-bold shrink-0">
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
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#E1306C] hover:bg-[#c1265a] text-white font-semibold rounded-xl transition-colors"
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
      <section className="py-16 px-4 bg-gradient-to-br from-[#E1306C]/10 via-transparent to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Instagram Hesabını Büyütmeye Hazır Mısın?
          </h2>
          <p className="text-gray-400 mb-8">
            Hemen kayıt ol, 50₺ hoş geldin bonusu kazan ve ilk siparişini ver.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#E1306C] hover:bg-[#c1265a] text-white font-semibold rounded-xl transition-colors"
          >
            Ücretsiz Hesap Aç →
          </Link>
        </div>
      </section>

      {/* Nav back */}
      <div className="py-8 px-4 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  );
}

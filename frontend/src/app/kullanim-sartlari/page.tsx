import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = {
  title: "Kullanım Şartları — HypeUp",
};

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-[#07060f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/[0.07] px-5 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-[15px]">HypeUp</span>
          </Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white transition">← Ana Sayfa</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-black mb-2">Kullanım Şartları</h1>
        <p className="text-white/35 text-sm mb-10">Son güncelleme: Haziran 2026</p>

        {[
          {
            title: "1. Hizmetin Tanımı",
            body: `HypeUp, sosyal medya büyüme hizmetleri sunan bir platformdur. Instagram, TikTok, YouTube, X ve diğer platformlarda takipçi, beğeni, izlenme ve benzeri etkileşim hizmetleri sağlanmaktadır.

Platforma kayıt olarak bu şartları kabul etmiş sayılırsınız. Bu şartlar değiştirildiğinde platform üzerinden bildirim yapılacaktır.`,
          },
          {
            title: "2. Hesap Kullanımı",
            body: `• Hesap açmak için 18 yaşını doldurmuş olmanız gerekmektedir.
• Her kullanıcı yalnızca bir hesap açabilir. Birden fazla hesap açıldığı tespit edildiğinde tüm hesaplar kapatılabilir.
• Hesap bilgilerinizin güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayınız.
• Başkasının hesabına yetkisiz erişim kesinlikle yasaktır.`,
          },
          {
            title: "3. Hizmet Kullanım Koşulları",
            body: `• HypeUp hizmetleri yalnızca kişisel veya ticari büyüme amaçlı kullanılabilir.
• Yasadışı içerik, nefret söylemi, şiddet veya taciz içeren hesaplar/gönderiler için sipariş verilemez.
• Hizmet kullanımı, ilgili sosyal medya platformlarının kullanım koşullarına aykırı sonuçlar doğurabilir. Bu riski kabul etmiş sayılırsınız.
• Sipariş verdiğiniz hesap veya içeriğin size ait olduğunu beyan edersiniz.`,
          },
          {
            title: "4. Ödeme ve Bakiye",
            body: `• Bakiye yüklemeleri Papara aracılığıyla manuel onay sistemiyle gerçekleştirilmektedir.
• Ödeme yapıldıktan sonra bakiye, admin onayıyla hesabınıza yansıtılır (genellikle birkaç saat içinde).
• Yükleme bonusları (100 TL → +25 TL, 150 TL → +50 TL, 200 TL → +75 TL) yalnızca tek seferde uygulanır.
• Referans bonusları davet edilen kişi kayıt olduğunda otomatik eklenir.
• Bakiye iadesi yalnızca sistem hatalarından kaynaklanan durumlarda yapılır.`,
          },
          {
            title: "5. Sipariş ve Teslimat",
            body: `• Siparişler sağlayıcı altyapısı üzerinden iletilir. Teslimat süresi servis türüne ve miktara göre değişir (birkaç dakika ile 72 saat arası).
• Sipariş tamamlandıktan sonra sonuç garanti edilemez; sosyal medya platformları hesap kısıtlamalarına yol açabilir.
• "Kısmi tamamlanma" (Partial) durumunda sipariş tamamlanmış sayılır; ilave süreç başlatılmaz.
• Sipariş iletilemediği durumlarda bakiyeniz otomatik iade edilir.`,
          },
          {
            title: "6. Yasaklı Kullanımlar",
            body: `Aşağıdaki kullanımlar kesinlikle yasaktır:
• Sahte veya yanıltıcı içerik yaymak amacıyla kullanım
• Platformu otomatik araçlar (bot, script) ile aşırı kullanmak
• Saldırgan, ırkçı, cinsel içerikli veya yasadışı hesaplar için sipariş vermek
• Sistemi manipüle etmeye çalışmak (bakiye hataları, promosyon kötüye kullanımı vb.)
• Başkası adına izinsiz sipariş vermek

Bu yasakları ihlal eden hesaplar önceden bildirim yapılmaksızın kapatılabilir.`,
          },
          {
            title: "7. Sorumluluk Sınırlaması",
            body: `HypeUp, aşağıdaki durumlardan sorumlu tutulamaz:
• Sosyal medya platformlarının politika değişiklikleri nedeniyle yaşanan kayıplar
• Sağlayıcı kesintileri veya gecikmeler nedeniyle oluşan aksaklıklar
• Kullanıcının kendi hatası veya ihmali sonucu oluşan zararlar
• Doğal afet, siber saldırı veya benzeri mücbir sebep halleri

Hizmet "olduğu gibi" sunulmaktadır. Belirli bir sonucu garanti etmiyoruz.`,
          },
          {
            title: "8. Hesap Kapatma",
            body: `Bu şartları ihlal etmeniz durumunda hesabınız önceden bildirim yapılmaksızın askıya alınabilir veya kapatılabilir. Hesap kapatma kararı tarafımızca nihai olup bakiye iadesi yapılmayabilir.

Hesabınızı kendiniz kapatmak istediğinizde destek ekibimizle iletişime geçebilirsiniz.`,
          },
          {
            title: "9. Uygulanacak Hukuk",
            body: `Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlık halinde Türkiye mahkemeleri yetkilidir.`,
          },
        ].map(({ title, body }) => (
          <section key={title} className="mb-8">
            <h2 className="text-base font-bold text-white/90 mb-3">{title}</h2>
            <p className="text-sm text-white/45 leading-relaxed whitespace-pre-line">{body}</p>
          </section>
        ))}

        <div className="border-t border-white/[0.07] pt-8 mt-4 flex gap-4 text-xs text-white/25">
          <Link href="/gizlilik" className="hover:text-white/55 transition">Gizlilik Politikası</Link>
          <Link href="/" className="hover:text-white/55 transition">Ana Sayfa</Link>
        </div>
      </main>
    </div>
  );
}

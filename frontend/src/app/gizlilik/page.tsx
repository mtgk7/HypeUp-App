import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = {
  title: "Gizlilik Politikası — HypeUp",
  description: "HypeUp platformunun kişisel verilerin korunmasına ilişkin gizlilik politikası.",
};

const sections = [
  {
    title: "1. Veri Sorumlusu",
    body: `Bu Gizlilik Politikası, HypeUp ("Platform", "biz", "bizim") tarafından hazırlanmıştır. Platform, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve Genel Veri Koruma Tüzüğü ("GDPR") kapsamında veri sorumlusu sıfatıyla hareket etmektedir.

Veri işleme faaliyetlerimize ilişkin sorularınız için platform içi destek kanalı üzerinden bizimle iletişime geçebilirsiniz.`,
  },
  {
    title: "2. Topladığımız Kişisel Veriler",
    body: `Platformumuzu kullanırken aşağıdaki kişisel veriler işlenmektedir:

Kimlik ve İletişim Verileri
• E-posta adresi (hesap oluşturma, giriş ve iletişim amacıyla)
• Şifre (bcrypt algoritmasıyla şifrelenmiş; hiçbir zaman düz metin olarak saklanmaz)

İşlem ve Finansal Veriler
• Bakiye yükleme miktarları ve tarihleri
• Papara işlem referans kodları ve gönderici adı (ödeme doğrulama amacıyla)
• Sipariş geçmişi, sipariş miktarları ve tutarları

Hizmet Kullanım Verileri
• Sipariş verilen sosyal medya profil linkleri (yalnızca sipariş iletimi amacıyla)
• Hesap oluşturma tarihi, son giriş zamanı

Teknik Veriler
• IP adresi (güvenlik ve dolandırıcılık tespiti amacıyla)
• Tarayıcı türü ve sürümü
• Oturum çerezleri

Sosyal medya profil linkleriniz yalnızca siparişinizi sağlayıcıya iletmek için kullanılır ve başka hiçbir amaçla işlenmez.`,
  },
  {
    title: "3. Verilerin İşlenme Amaçları ve Hukuki Dayanakları",
    body: `Kişisel verileriniz aşağıdaki amaçlar ve hukuki dayanaklar çerçevesinde işlenmektedir:

• Hesap oluşturma ve kimlik doğrulama → Sözleşmenin ifası
• Sipariş işleme ve teslimat takibi → Sözleşmenin ifası
• Ödeme onayı ve bakiye yönetimi → Sözleşmenin ifası
• Müşteri desteği sağlama → Sözleşmenin ifası ve meşru menfaat
• Dolandırıcılık ve güvenlik ihlallerini önleme → Meşru menfaat ve yasal yükümlülük
• Yasal yükümlülüklerin yerine getirilmesi → Yasal yükümlülük
• Platform performansını iyileştirme → Meşru menfaat

Doğrudan pazarlama için verilerinizi kullanmıyoruz.`,
  },
  {
    title: "4. Verilerin Saklanma Süreleri",
    body: `Kişisel verileriniz, işlenme amacının ortadan kalkmasıyla birlikte veya aşağıdaki süreler dolduğunda silinir, yok edilir veya anonim hale getirilir:

• Hesap verileri: Hesap aktif olduğu sürece + hesap silme talebinden itibaren 30 gün
• Finansal işlem kayıtları: Türk Ticaret Kanunu gereği 10 yıl
• Sipariş geçmişi: Hesap kapanmasından itibaren 2 yıl (olası uyuşmazlıklar için)
• Güvenlik logları (IP): 6 ay
• Oturum çerezleri: Tarayıcı kapatıldığında otomatik silinir

Yasal saklama yükümlülükleri gerektiren veriler, yalnızca bu yükümlülük kapsamında ve ilgili yasal süre boyunca tutulur.`,
  },
  {
    title: "5. Verilerin Güvenliği",
    body: `Verilerinizin güvenliğini sağlamak için aşağıdaki teknik ve idari tedbirler uygulanmaktadır:

Teknik Önlemler
• Tüm veri iletimi TLS 1.2+ şifrelemesiyle korunmaktadır
• Şifreler bcrypt (cost factor 12) ile hashlenerek saklanır; düz metin hiçbir zaman kaydedilmez
• Veriler Supabase altyapısında, ISO 27001 sertifikalı veri merkezlerinde barındırılmaktadır
• JWT tabanlı kimlik doğrulama; tokenlar 24 saat sonra geçersiz olur
• Veritabanı erişimi minimum yetki prensibiyle sınırlandırılmıştır

İdari Önlemler
• Platform altyapısına erişim yalnızca yetkili personele aittir
• Üçüncü taraf erişimi gerektiğinde veri işleme sözleşmesi yapılmaktadır

Buna karşın, internet üzerinden hiçbir veri iletiminin ya da elektronik depolama sisteminin %100 güvenli olmadığını belirtmek isteriz. Hesabınızda şüpheli bir aktivite fark ettiğinizde lütfen derhal bizimle iletişime geçin.`,
  },
  {
    title: "6. Üçüncü Taraflarla Veri Paylaşımı",
    body: `Kişisel verilerinizi aşağıdaki sınırlı durumlar dışında satmaz, kiralamaz veya paylaşmayız:

Hizmet Sağlayıcılar
• SMM paneli sağlayıcısı (PRM4U): Siparişinizi iletmek amacıyla yalnızca profil linki ve sipariş miktarı paylaşılır. E-posta adresiniz veya diğer kişisel bilgileriniz iletilmez.
• Supabase (veritabanı altyapısı): Verileriniz bu platform üzerinde şifreli olarak barındırılmaktadır.

Yasal Zorunluluklar
• Yetkili kamu kurum ve kuruluşlarının yasal talepleri halinde, yalnızca talep edilen bilgiler ve geçerli yasal çerçeve kapsamında paylaşılır.

Ödeme bilgileriniz (Papara hesap numarası, işlem referans kodu) tarafımızca doğrulama amacıyla kaydedilir ancak üçüncü taraflarla paylaşılmaz.`,
  },
  {
    title: "7. Çerezler ve Takip Teknolojileri",
    body: `Platformumuz yalnızca zorunlu çerezler kullanmaktadır:

Zorunlu Çerezler
• Oturum tokeni (auth-token): Giriş durumunuzu korumak için kullanılır. Tarayıcı çerezinde veya local storage'da saklanır. Çıkış yaptığınızda silinir.

Platformumuzda analitik, reklam veya üçüncü taraf takip çerezleri kullanılmamaktadır. Google Analytics, Facebook Pixel veya benzeri araçlar yer almamaktadır.

Tarayıcı ayarlarınızdan çerezleri engelleyebilirsiniz; ancak bu durumda platformda oturum açma işlevi çalışmayabilir.`,
  },
  {
    title: "8. KVKK ve GDPR Kapsamındaki Haklarınız",
    body: `6698 sayılı KVKK'nın 11. maddesi ve GDPR'ın 15-22. maddeleri uyarınca aşağıdaki haklara sahipsiniz:

• Bilgi talep etme hakkı: Hangi verilerinizin işlendiğini öğrenme
• Erişim hakkı: İşlenen verilerinizin bir kopyasını talep etme
• Düzeltme hakkı: Hatalı veya eksik verilerin güncellenmesini talep etme
• Silme hakkı ("Unutulma hakkı"): Verilerinizin silinmesini talep etme (yasal saklama yükümlülükleri saklı kalmak kaydıyla)
• İşleme kısıtlama hakkı: Belirli durumlarda veri işlemenin sınırlandırılmasını talep etme
• Veri taşınabilirliği hakkı: Verilerinizi yapılandırılmış, makine okunabilir formatta alma
• İtiraz hakkı: Meşru menfaat veya kamu yararına dayalı işleme itiraz etme
• Otomatik karara itiraz hakkı: Yalnızca otomatik işlemeye dayalı kararlara itiraz etme

Bu haklarınızı kullanmak için platform içindeki destek kanalı üzerinden talebinizi iletebilirsiniz. Talepler 30 gün içinde yanıtlanır. Kimlik doğrulama amacıyla hesabınıza kayıtlı e-posta adresi üzerinden göndermenizi tavsiye ederiz.

Yanıtımızdan memnun kalmamanız halinde Kişisel Verileri Koruma Kurumu'na (KVKK) şikâyette bulunabilirsiniz.`,
  },
  {
    title: "9. Veri İhlali Bildirimi",
    body: `Kişisel verilerinizin güvenliğini etkileyen bir veri ihlali tespit etmemiz halinde:

• İhlal 72 saat içinde ilgili denetim otoritesine bildirilir (KVKK / GDPR yükümlülüğü)
• Yüksek risk oluşturan ihlallerde etkilenen kullanıcılara gecikmeksizin bildirim yapılır
• İhlalin kapsamı, olası etkileri ve alınan önlemler hakkında bilgilendirme sağlanır`,
  },
  {
    title: "10. Çocukların Gizliliği",
    body: `Platformumuz 18 yaşın altındaki kişilere yönelik değildir ve bilerek bu yaş grubundan kişisel veri toplamayız. 18 yaşın altındaki bir kullanıcıya ait veri topladığımızı fark etmemiz durumunda söz konusu veriler derhal silinir.`,
  },
  {
    title: "11. Politika Değişiklikleri",
    body: `Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler yapılması halinde platform üzerinden bildirim gönderilir ve sayfanın üst kısmındaki "Son güncelleme" tarihi güncellenir. Platformu kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.`,
  },
];

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-[#07060f] text-white">
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
        <h1 className="text-3xl font-black mb-2">Gizlilik Politikası</h1>
        <p className="text-white/35 text-sm mb-10">Son güncelleme: 10 Haziran 2026</p>

        <div className="bg-violet-500/[0.07] border border-violet-500/20 rounded-xl p-4 mb-10 text-sm text-white/60 leading-relaxed">
          HypeUp olarak kişisel verilerinizin gizliliğine önem veriyoruz. Bu politika, hangi verileri topladığımızı, neden topladığımızı ve nasıl koruduğumuzu açıklar. 6698 sayılı KVKK ve GDPR kapsamındaki haklarınız bu belgede detaylıca belirtilmektedir.
        </div>

        {sections.map(({ title, body }) => (
          <section key={title} className="mb-9">
            <h2 className="text-sm font-bold text-white/90 mb-3 uppercase tracking-wide">{title}</h2>
            <p className="text-sm text-white/50 leading-7 whitespace-pre-line">{body}</p>
          </section>
        ))}

        <div className="border-t border-white/[0.07] pt-8 mt-4 flex gap-4 text-xs text-white/25">
          <Link href="/kullanim-sartlari" className="hover:text-white/55 transition">Kullanım Şartları</Link>
          <Link href="/" className="hover:text-white/55 transition">Ana Sayfa</Link>
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = {
  title: "Kullanım Şartları — HypeUp",
  description: "HypeUp platformunu kullanmadan önce okumanız gereken kullanım şartları ve koşullar.",
};

const sections = [
  {
    title: "1. Taraflar ve Kapsam",
    body: `Bu Kullanım Şartları ("Şartlar"), HypeUp platformu ("Platform", "HypeUp", "biz") ile platforma kayıt olan veya platformu kullanan kişi ("Kullanıcı", "siz") arasındaki hukuki ilişkiyi düzenler.

Platforma kayıt olarak, mobil ya da web üzerinden erişim sağlayarak veya herhangi bir hizmetimizi kullanarak bu Şartları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Bu Şartları kabul etmiyorsanız platformu kullanmayınız.

Bu Şartlar, Türkiye Cumhuriyeti kanunları çerçevesinde, özellikle 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve Türk Borçlar Kanunu hükümleri gözetilerek hazırlanmıştır.`,
  },
  {
    title: "2. Hizmetin Tanımı",
    body: `HypeUp, sosyal medya büyüme hizmetleri sunan bir dijital platformdur. Platform üzerinden aşağıdaki hizmetler satın alınabilmektedir:

• Instagram: Türk takipçi, yabancı takipçi, beğeni
• TikTok: Takipçi, beğeni, izlenme
• YouTube: Abone, izlenme
• X (Twitter): Takipçi, beğeni
• Ve zaman içinde eklenen diğer platform hizmetleri

Tüm hizmetler üçüncü taraf sağlayıcılar aracılığıyla sunulmaktadır. Hizmet kalitesi, teslimat süresi ve sürdürülebilirliği sağlayıcı koşullarına bağlıdır.

HypeUp, zaman zaman önceden bildirim yapmaksızın sunulan hizmetleri değiştirebilir, güncelleyebilir veya kaldırabilir.`,
  },
  {
    title: "3. Kayıt ve Hesap Güvenliği",
    body: `Kayıt Koşulları
• Platforma kayıt olmak için 18 yaşını tamamlamış olmanız gerekmektedir.
• Kayıt sırasında doğru, güncel ve eksiksiz bilgi vermeyi kabul edersiniz.
• Her kişi yalnızca bir hesap açabilir. Birden fazla hesap tespit edilmesi halinde tüm hesaplar askıya alınabilir.
• Hesap açma işlemi ticari amaçlar için de gerçekleştirilebilir.

Hesap Güvenliği
• Hesabınıza ait giriş bilgilerinin (e-posta ve şifre) gizliliğini korumakla yükümlüsünüz.
• Hesabınızda gerçekleşen tüm işlemlerden siz sorumlusunuz.
• Hesabınıza yetkisiz bir erişim olduğunu fark ettiğinizde derhal şifrenizi değiştirin ve bizi bilgilendirin.
• Şifrenizi kimseyle paylaşmayınız; HypeUp personeliyle dahil.`,
  },
  {
    title: "4. Ödeme ve Bakiye",
    body: `Bakiye Yükleme
• Platform bakiyesi Papara üzerinden manuel havale/EFT yöntemiyle yüklenir.
• Ödeme yapıldıktan sonra referans kodunuzu ve gönderici adınızı platformda belirtmeniz gerekmektedir.
• Bakiyeniz, ödemenizin doğrulanmasının ardından hesabınıza tanımlanır. Bu süreç mesai saatleri içinde genellikle 1–4 saat, mesai saatleri dışında daha uzun sürebilir.

Yükleme Bonusları
• 100 TL yükleme → +25 TL bonus (toplam 125 TL)
• 150 TL yükleme → +50 TL bonus (toplam 200 TL)
• 200 TL yükleme → +75 TL bonus (toplam 275 TL)
• Bonuslar aynı işlemde yalnızca bir kez uygulanır; bölünmüş ödemelerde geçerli değildir.

Referans Bonusu
• Davet bağlantınız üzerinden kayıt olan her yeni kullanıcı için size ve yeni kullanıcıya tanımlanan bonus, referans hesabı aktif olduğu sürece geçerlidir.

Fiyatlandırma
• Hizmet fiyatları döviz kuru ve sağlayıcı maliyetlerine göre değişebilir. Sipariş anındaki fiyat üzerinden ücretlendirme yapılır.
• Fiyatlar KDV dahil olup Türk Lirası (TL) cinsindendir.`,
  },
  {
    title: "5. Sipariş, Teslimat ve İade",
    body: `Sipariş Süreci
• Sipariş oluşturulduğunda belirtilen tutarı bakiyenizden düşülür ve sipariş sağlayıcıya iletilir.
• Sağlayıcıya iletilemeyen siparişlerde bakiyeniz otomatik olarak iade edilir.
• Sipariş oluşturduktan sonra iptal talebinde bulunulamaz; sağlayıcı sistemine iletilmiş siparişler geri çekilemez.

Teslimat
• Teslimat süresi hizmet türüne ve miktarına göre değişir (birkaç dakika ila 72 saat).
• Yüksek talep dönemlerinde teslimat süresi uzayabilir.
• Teslimat tamamlandıktan sonra sipariş durumu "completed" olarak güncellenir.

İade Koşulları
• Sağlayıcıya iletilemeyen siparişlerde bakiye otomatik iade edilir.
• Sipariş iletilmiş ve işleme alınmışsa iade yapılmaz.
• "Kısmi tamamlanma" (partial delivery) söz konusu olduğunda yalnızca teslim edilmeyen kısım için iade değerlendirilebilir; admin onayına bağlıdır.
• Sosyal medya platformunun hesap kısıtlaması veya politika değişikliği nedeniyle yaşanan kayıplarda iade yapılmaz.
• Platform hatası veya teknik arıza kaynaklı durumlarda iade talebi 7 gün içinde destek kanalımıza iletilmelidir.

Bakiye İadesi
• Yüklenen bakiye, hizmet kullanımı gerçekleştikten sonra nakit olarak iade edilmez.
• Kullanılmamış bakiyenin iadesi yalnızca platform kapanması veya hizmet tamamen sonlandırılması halinde değerlendirilebilir.`,
  },
  {
    title: "6. Kullanım Koşulları ve Yasaklar",
    body: `İzin Verilen Kullanımlar
• Kişisel sosyal medya hesaplarınız için büyüme hizmetleri satın almak
• Yönettiğiniz ticari veya marka hesapları için hizmet satın almak

Kesinlikle Yasak Olan Kullanımlar
• Yasadışı faaliyet yürüten hesaplar veya içerikler için sipariş vermek
• Nefret söylemi, şiddet, ırkçılık, cinsel içerik veya taciz barındıran hesaplar için kullanmak
• Başka bir kişinin sosyal medya hesabına izinsiz sipariş vermek
• Sistemi otomatik araçlar (bot, script, makro) ile aşırı kullanmak veya manipüle etmeye çalışmak
• Bakiye hatalarından, promosyonlardan veya sistem açıklarından haksız yararlanmak
• Platform altyapısına saldırmak, tersine mühendislik uygulamak veya güvenlik açıkları aramak
• Sahte kimlik bilgileriyle hesap açmak

Bu yasakları ihlal etmeniz halinde hesabınız önceden bildirim yapılmaksızın kapatılabilir, bakiyeniz dondurulabilir veya yasal işlem başlatılabilir.`,
  },
  {
    title: "7. Sosyal Medya Platform Riskleri",
    body: `Sosyal medya büyüme hizmetlerinin kullanımı, ilgili platformların (Instagram, TikTok, YouTube, X vb.) kullanım koşullarına aykırılık oluşturabilir. Bu durum aşağıdaki riskleri içerir:

• Hesap kısıtlanması, askıya alınması veya kalıcı olarak kapatılması
• İçerik kaldırma veya erişim engeli
• Takipçi/beğeni sayısının platform tarafından düşürülmesi

Bu riskleri kabul ederek sipariş veriyorsunuz. HypeUp, söz konusu risklerden doğan herhangi bir kayıp, hasar veya zarardan sorumlu tutulamaz.

Hesabınızın güvenliğini artırmak için güvenilir ve doğal profillere benzeyen hizmetleri tercih etmenizi, tek seferde çok yüksek miktarlar yerine kademeli siparişler vermenizi tavsiye ederiz.`,
  },
  {
    title: "8. Sorumluluk Sınırlaması",
    body: `HypeUp, aşağıdaki durumlardan hiçbir şekilde sorumlu tutulamaz:

• Sosyal medya platformlarının politika değişiklikleri veya algoritma güncellemeleri
• Sağlayıcı kaynaklı teslimat gecikmeleri, kısmi tamamlama veya kesintiler
• Kullanıcının hatalı bilgi girmesi (yanlış profil linki vb.) sonucu oluşan kayıplar
• Kullanıcının şifresini başkasıyla paylaşması sonucu oluşan zararlar
• İnternet altyapısı, doğal afet, siber saldırı veya mücbir sebep halleri
• Kullanıcının platform kullanımından kaynaklanan dolaylı veya öngörülemeyen zararlar

Platform hizmetleri "olduğu gibi" (as-is) sunulmaktadır. Belirli bir sonucu (takipçi artışı, etkileşim oranı, hesap büyümesi vb.) garanti etmiyoruz.

HypeUp'ın herhangi bir durumda azami sorumluluğu, ilgili işlem için ödenen hizmet bedeliyle sınırlıdır.`,
  },
  {
    title: "9. Fikri Mülkiyet",
    body: `HypeUp platformunun tüm tasarım, yazılım, içerik, marka ve logo gibi unsurları HypeUp'a aittir ve fikri mülkiyet mevzuatı kapsamında korunmaktadır.

Kullanıcılar platforma erişim hakkı edinir; ancak platformun herhangi bir bölümünü kopyalama, çoğaltma, değiştirme veya ticari amaçla kullanma hakkı doğmaz.`,
  },
  {
    title: "10. Hesap Kapatma ve Fesih",
    body: `Kullanıcı Tarafından Kapatma
Hesabınızı kapatmak istediğinizde destek kanalımızdan talepte bulunabilirsiniz. Beklemedeki siparişler tamamlanana kadar hesap kapatma işlemi ertelenebilir. Kalan bakiyenin durumu ilgili politikamız çerçevesinde değerlendirilir.

HypeUp Tarafından Kapatma
Kullanım Şartlarının ihlali, dolandırıcılık girişimi, yetkisiz kullanım veya herhangi bir yasal ihlal durumunda HypeUp, önceden bildirim yapmaksızın hesabınızı askıya alma veya kapatma hakkını saklı tutar. Bu durumda kalan bakiye dondurulabilir.

Hizmetin Sona Ermesi
HypeUp, platformu tamamen kapatma kararı alması halinde kullanıcıları makul süre öncesinde bilgilendirir ve kullanılmamış bakiyelerin durumunu açıklar.`,
  },
  {
    title: "11. Değişiklikler",
    body: `HypeUp, bu Kullanım Şartlarını herhangi bir zamanda değiştirme hakkını saklı tutar. Yapılan değişiklikler bu sayfada yayımlandığı anda yürürlüğe girer. Önemli değişiklikler için platform üzerinden bildirim yapılır.

Değişikliklerden sonra platformu kullanmaya devam etmeniz, güncellenmiş Şartları kabul ettiğiniz anlamına gelir. Değişiklikleri kabul etmiyorsanız platform kullanımını sonlandırmanız gerekmektedir.`,
  },
  {
    title: "12. Uygulanacak Hukuk ve Uyuşmazlık Çözümü",
    body: `Bu Şartlar Türkiye Cumhuriyeti hukukuna tabidir. Bu Şartlardan doğan veya bunlarla bağlantılı her türlü uyuşmazlıkta Türkiye mahkemeleri ve icra daireleri yetkilidir.

Uyuşmazlıkların öncelikle dostane yollarla çözülmesi hedeflenmektedir. Herhangi bir sorun veya şikâyet için platform destek kanalını kullanmanız önerilir.

Tüketici sıfatıyla hareket eden kullanıcılar, 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki haklarını saklı tutar ve ilgili Tüketici Hakem Heyeti veya mahkemelerine başvurabilir.`,
  },
];

export default function KullanimSartlariPage() {
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
        <h1 className="text-3xl font-black mb-2">Kullanım Şartları</h1>
        <p className="text-white/35 text-sm mb-10">Son güncelleme: 10 Haziran 2026</p>

        <div className="bg-violet-500/[0.07] border border-violet-500/20 rounded-xl p-4 mb-10 text-sm text-white/60 leading-relaxed">
          Platforma kayıt olarak veya hizmetlerimizi kullanarak bu Kullanım Şartlarını kabul etmiş sayılırsınız. Lütfen hizmetlerimizi kullanmadan önce bu belgeyi dikkatlice okuyunuz.
        </div>

        {sections.map(({ title, body }) => (
          <section key={title} className="mb-9">
            <h2 className="text-sm font-bold text-white/90 mb-3 uppercase tracking-wide">{title}</h2>
            <p className="text-sm text-white/50 leading-7 whitespace-pre-line">{body}</p>
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

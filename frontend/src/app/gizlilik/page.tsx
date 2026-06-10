import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = {
  title: "Gizlilik Politikası — HypeUp",
};

export default function GizlilikPage() {
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
        <h1 className="text-3xl font-black mb-2">Gizlilik Politikası</h1>
        <p className="text-white/35 text-sm mb-10">Son güncelleme: Haziran 2026</p>

        {[
          {
            title: "1. Topladığımız Bilgiler",
            body: `HypeUp, hizmetlerimizi sunabilmek için aşağıdaki kişisel verileri toplar:
• Hesap bilgileri: e-posta adresi, şifre (şifrelenmiş olarak saklanır)
• İşlem bilgileri: sipariş geçmişi, bakiye hareketleri, ödeme kayıtları
• Teknik veriler: IP adresi, tarayıcı türü, kullanım istatistikleri

Sosyal medya hesap bilgilerinizi (kullanıcı adı, profil linki) yalnızca verdiğiniz siparişi yerine getirmek amacıyla işleriz. Bu bilgiler üçüncü taraflarla paylaşılmaz.`,
          },
          {
            title: "2. Verilerin Kullanım Amacı",
            body: `Topladığımız verileri şu amaçlarla kullanırız:
• Hesabınızı oluşturmak ve yönetmek
• Siparişlerinizi işlemek ve teslimat durumunu bildirmek
• Ödeme işlemlerini gerçekleştirmek
• Müşteri desteği sağlamak
• Platformu geliştirmek ve güvenliğini korumak
• Yasal yükümlülükleri yerine getirmek`,
          },
          {
            title: "3. Verilerin Saklanması ve Güvenliği",
            body: `Verileriniz Supabase altyapısında AB veri merkezlerinde şifreli olarak saklanır. Şifreleriniz bcrypt algoritmasıyla hashlenerek depolanır; düz metin olarak hiçbir zaman kaydedilmez. Tüm iletişim TLS/SSL şifrelemesiyle korunur.

Verilerinizi yetkisiz erişime, değiştirilmeye veya ifşa edilmeye karşı korumak için makul teknik ve organizasyonel önlemler alıyoruz. Ancak internet üzerinden hiçbir iletimin %100 güvenli olmadığını belirtmeliyiz.`,
          },
          {
            title: "4. Üçüncü Taraflarla Paylaşım",
            body: `Kişisel verilerinizi şu durumlar dışında satmaz, kiralamaz veya üçüncü taraflarla paylaşmayız:
• Sipariş teslimatı için hizmet sağlayıcılarımıza (yalnızca hedef link ve sipariş miktarı)
• Yasal zorunluluk halinde yetkili makamlarla
• Açık onayınız olan durumlarda

Ödeme bilgileriniz tarafımızca saklanmaz; Papara üzerinden gerçekleştirilen işlemler doğrudan ilgili ödeme platformunun gizlilik politikasına tabidir.`,
          },
          {
            title: "5. Çerezler",
            body: `Platformumuz oturum yönetimi için zorunlu çerezler kullanır. Bu çerezler, giriş yapmanızı sağlayan token bilgilerini tarayıcınızda saklar. Analitik veya reklam amaçlı çerez kullanılmamaktadır.`,
          },
          {
            title: "6. Haklarınız",
            body: `Kişisel Verilerin Korunması Kanunu (KVKK) ve GDPR kapsamında aşağıdaki haklara sahipsiniz:
• Verilerinize erişim hakkı
• Hatalı verilerin düzeltilmesini talep etme hakkı
• Verilerinizin silinmesini talep etme hakkı ("unutulma hakkı")
• Veri işlemeye itiraz etme hakkı
• Veri taşınabilirliği hakkı

Bu haklarınızı kullanmak için profil sayfanızdan veya destek kanalımız aracılığıyla bizimle iletişime geçebilirsiniz.`,
          },
          {
            title: "7. Hesap Silme",
            body: `Hesabınızı ve tüm kişisel verilerinizi silmek istediğinizde destek ekibimizle iletişime geçebilirsiniz. Yasal saklama yükümlülükleri kapsamındaki finansal kayıtlar dışında tüm verileriniz 30 gün içinde sistemden kalıcı olarak silinir.`,
          },
          {
            title: "8. İletişim",
            body: `Bu gizlilik politikasıyla ilgili sorularınız için platformdaki destek kanalı aracılığıyla bize ulaşabilirsiniz. Politikamızda yapılacak değişiklikler bu sayfada yayımlanacak ve önemli değişikliklerde kayıtlı kullanıcılara bildirim gönderilecektir.`,
          },
        ].map(({ title, body }) => (
          <section key={title} className="mb-8">
            <h2 className="text-base font-bold text-white/90 mb-3">{title}</h2>
            <p className="text-sm text-white/45 leading-relaxed whitespace-pre-line">{body}</p>
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

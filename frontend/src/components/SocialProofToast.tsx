"use client";

import { useEffect, useState } from "react";

const NOTIFICATIONS = [
  { city: "İstanbul",    platform: "Instagram", service: "Türk Takipçi",    qty: "1.000",   emoji: "📸" },
  { city: "Berlin",      platform: "Instagram", service: "Global Takipçi",   qty: "2.500",   emoji: "📸", foreign: true },
  { city: "Ankara",      platform: "TikTok",    service: "İzlenme",          qty: "10.000",  emoji: "🎵" },
  { city: "İzmir",       platform: "YouTube",   service: "Abone",            qty: "250",     emoji: "▶️" },
  { city: "Amsterdam",   platform: "YouTube",   service: "Abone",            qty: "500",     emoji: "▶️", foreign: true },
  { city: "Bursa",       platform: "Instagram", service: "Beğeni",           qty: "500",     emoji: "📸" },
  { city: "Antalya",     platform: "X",         service: "Takipçi",          qty: "1.000",   emoji: "✖️" },
  { city: "Dubai",       platform: "Instagram", service: "Beğeni",           qty: "5.000",   emoji: "📸", foreign: true },
  { city: "Adana",       platform: "TikTok",    service: "Takipçi",          qty: "500",     emoji: "🎵" },
  { city: "Konya",       platform: "Instagram", service: "Global Takipçi",   qty: "500",     emoji: "📸" },
  { city: "Londra",      platform: "TikTok",    service: "Takipçi",          qty: "1.000",   emoji: "🎵", foreign: true },
  { city: "Gaziantep",   platform: "YouTube",   service: "İzlenme",          qty: "5.000",   emoji: "▶️" },
  { city: "Mersin",      platform: "Instagram", service: "Türk Takipçi",     qty: "250",     emoji: "📸" },
  { city: "Paris",       platform: "Instagram", service: "Global Takipçi",   qty: "1.000",   emoji: "📸", foreign: true },
  { city: "Kayseri",     platform: "TikTok",    service: "Beğeni",           qty: "1.000",   emoji: "🎵" },
  { city: "İstanbul",    platform: "YouTube",   service: "Abone",            qty: "100",     emoji: "▶️" },
  { city: "New York",    platform: "X",         service: "Takipçi",          qty: "2.500",   emoji: "✖️", foreign: true },
  { city: "Ankara",      platform: "Instagram", service: "Beğeni",           qty: "2.500",   emoji: "📸" },
  { city: "İzmir",       platform: "TikTok",    service: "İzlenme",          qty: "25.000",  emoji: "🎵" },
  { city: "Stockholm",   platform: "YouTube",   service: "İzlenme",          qty: "20.000",  emoji: "▶️", foreign: true },
  { city: "Diyarbakır",  platform: "Instagram", service: "Türk Takipçi",     qty: "500",     emoji: "📸" },
  { city: "Eskişehir",   platform: "X",         service: "Beğeni",           qty: "500",     emoji: "✖️" },
  { city: "Viyana",      platform: "TikTok",    service: "İzlenme",          qty: "50.000",  emoji: "🎵", foreign: true },
  { city: "Trabzon",     platform: "YouTube",   service: "İzlenme",          qty: "10.000",  emoji: "▶️" },
  { city: "Samsun",      platform: "Instagram", service: "Global Takipçi",   qty: "1.000",   emoji: "📸" },
  { city: "Toronto",     platform: "Instagram", service: "Beğeni",           qty: "3.000",   emoji: "📸", foreign: true },
  { city: "Malatya",     platform: "TikTok",    service: "Takipçi",          qty: "250",     emoji: "🎵" },
  { city: "Balıkesir",   platform: "Instagram", service: "Türk Takipçi",     qty: "100",     emoji: "📸" },
  { city: "Melbourne",   platform: "YouTube",   service: "Abone",            qty: "250",     emoji: "▶️", foreign: true },
  { city: "Manisa",      platform: "X",         service: "Takipçi",          qty: "250",     emoji: "✖️" },
  { city: "İstanbul",    platform: "TikTok",    service: "İzlenme",          qty: "50.000",  emoji: "🎵" },
  { city: "Köln",        platform: "TikTok",    service: "Takipçi",          qty: "750",     emoji: "🎵", foreign: true },
  { city: "Ankara",      platform: "Instagram", service: "Türk Takipçi",     qty: "2.500",   emoji: "📸" },
  { city: "İzmir",       platform: "YouTube",   service: "Abone",            qty: "500",     emoji: "▶️" },
  { city: "Münih",       platform: "Instagram", service: "Global Takipçi",   qty: "500",     emoji: "📸", foreign: true },
  { city: "Şanlıurfa",   platform: "Instagram", service: "Beğeni",           qty: "1.000",   emoji: "📸" },
  { city: "Denizli",     platform: "TikTok",    service: "Takipçi",          qty: "1.000",   emoji: "🎵" },
  { city: "Brüksel",     platform: "X",         service: "Beğeni",           qty: "1.000",   emoji: "✖️", foreign: true },
  { city: "Kocaeli",     platform: "Instagram", service: "Global Takipçi",   qty: "250",     emoji: "📸" },
  { city: "Hatay",       platform: "YouTube",   service: "İzlenme",          qty: "5.000",   emoji: "▶️" },
  { city: "Zürich",      platform: "Instagram", service: "Türk Takipçi",     qty: "1.000",   emoji: "📸", foreign: true },
  { city: "Muğla",       platform: "Instagram", service: "Türk Takipçi",     qty: "500",     emoji: "📸" },
  { city: "Sakarya",     platform: "X",         service: "Takipçi",          qty: "500",     emoji: "✖️" },
  { city: "Roma",        platform: "TikTok",    service: "Beğeni",           qty: "2.000",   emoji: "🎵", foreign: true },
  { city: "Tekirdağ",    platform: "TikTok",    service: "Beğeni",           qty: "2.500",   emoji: "🎵" },
  { city: "Rize",        platform: "Instagram", service: "Türk Takipçi",     qty: "750",     emoji: "📸" },
  { city: "Madrid",      platform: "YouTube",   service: "İzlenme",          qty: "10.000",  emoji: "▶️", foreign: true },
  { city: "Ordu",        platform: "YouTube",   service: "Abone",            qty: "150",     emoji: "▶️" },
  { city: "Kastamonu",   platform: "TikTok",    service: "İzlenme",          qty: "5.000",   emoji: "🎵" },
  { city: "Atina",       platform: "Instagram", service: "Beğeni",           qty: "750",     emoji: "📸", foreign: true },
  { city: "Zonguldak",   platform: "Instagram", service: "Beğeni",           qty: "750",     emoji: "📸" },
  { city: "Erzurum",     platform: "X",         service: "Takipçi",          qty: "500",     emoji: "✖️" },
  { city: "Sofya",       platform: "TikTok",    service: "İzlenme",          qty: "15.000",  emoji: "🎵", foreign: true },
  { city: "Kütahya",     platform: "TikTok",    service: "Takipçi",          qty: "750",     emoji: "🎵" },
  { city: "Aksaray",     platform: "Instagram", service: "Global Takipçi",   qty: "1.000",   emoji: "📸" },
  { city: "Riyad",       platform: "Instagram", service: "Global Takipçi",   qty: "2.000",   emoji: "📸", foreign: true },
  { city: "Bolu",        platform: "YouTube",   service: "İzlenme",          qty: "15.000",  emoji: "▶️" },
  { city: "Giresun",     platform: "Instagram", service: "Türk Takipçi",     qty: "500",     emoji: "📸" },
  { city: "Çanakkale",   platform: "X",         service: "Beğeni",           qty: "1.000",   emoji: "✖️" },
  { city: "Stockholm",   platform: "X",         service: "Takipçi",          qty: "500",     emoji: "✖️", foreign: true },
  { city: "Afyon",       platform: "TikTok",    service: "Beğeni",           qty: "500",     emoji: "🎵" },
  { city: "Isparta",     platform: "Instagram", service: "Beğeni",           qty: "1.500",   emoji: "📸" },
  { city: "Uşak",        platform: "YouTube",   service: "Abone",            qty: "200",     emoji: "▶️" },
  { city: "Elazığ",      platform: "TikTok",    service: "İzlenme",          qty: "20.000",  emoji: "🎵" },
  { city: "Nevşehir",    platform: "Instagram", service: "Türk Takipçi",     qty: "1.000",   emoji: "📸" },
  { city: "Kahramanmaraş", platform: "X",       service: "Takipçi",          qty: "750",     emoji: "✖️" },
  { city: "Tokat",       platform: "Instagram", service: "Global Takipçi",   qty: "500",     emoji: "📸" },
  { city: "Amasya",      platform: "TikTok",    service: "Takipçi",          qty: "1.000",   emoji: "🎵" },
  { city: "Sinop",       platform: "YouTube",   service: "İzlenme",          qty: "7.500",   emoji: "▶️" },
  { city: "Kırıkkale",   platform: "Instagram", service: "Beğeni",           qty: "2.000",   emoji: "📸" },
  { city: "Van",         platform: "TikTok",    service: "İzlenme",          qty: "10.000",  emoji: "🎵" },
  { city: "Batman",      platform: "Instagram", service: "Türk Takipçi",     qty: "250",     emoji: "📸" },
  { city: "Bingöl",      platform: "X",         service: "Beğeni",           qty: "750",     emoji: "✖️" },
  { city: "Yozgat",      platform: "YouTube",   service: "Abone",            qty: "300",     emoji: "▶️" },
  { city: "Çorum",       platform: "Instagram", service: "Beğeni",           qty: "3.000",   emoji: "📸" },
  { city: "Bitlis",      platform: "TikTok",    service: "Takipçi",          qty: "500",     emoji: "🎵" },
  { city: "Ağrı",        platform: "Instagram", service: "Global Takipçi",   qty: "750",     emoji: "📸" },
  { city: "Siirt",       platform: "YouTube",   service: "İzlenme",          qty: "25.000",  emoji: "▶️" },
  { city: "Niğde",       platform: "X",         service: "Takipçi",          qty: "1.000",   emoji: "✖️" },
  { city: "Kırşehir",    platform: "TikTok",    service: "Beğeni",           qty: "2.000",   emoji: "🎵" },
  { city: "Mardin",      platform: "Instagram", service: "Türk Takipçi",     qty: "1.500",   emoji: "📸" },
];

const TIMES = ["az önce", "1 dk önce", "2 dk önce", "3 dk önce"];

export default function SocialProofToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);

  // İlk bildirim 3 saniye sonra başlasın
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Her yeni index veya started değişince döngüyü çalıştır
  useEffect(() => {
    if (!started) return;
    setVisible(true);

    // 6 saniye sonra gizle
    const hideTimer = setTimeout(() => setVisible(false), 6000);
    // 10 saniye sonra sonraki mesaja geç
    const nextTimer = setTimeout(() => {
      setIndex(prev => (prev + 1) % NOTIFICATIONS.length);
    }, 10000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [started, index]);

  const n = NOTIFICATIONS[index] as typeof NOTIFICATIONS[0] & { foreign?: boolean };
  const time = TIMES[Math.floor(index / 10) % TIMES.length];
  const suffix = (n as { foreign?: boolean }).foreign ? "dan" : "dan biri";

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 bg-[#18162a] border border-violet-500/20 shadow-2xl shadow-black/40 rounded-2xl px-4 py-3 max-w-xs">
        <div className="w-9 h-9 rounded-xl bg-violet-600/20 flex items-center justify-center text-lg shrink-0">
          {n.emoji}
        </div>
        <div className="min-w-0">
          <p className="text-white text-xs font-semibold leading-snug">
            {n.city}&apos;{suffix}{" "}
            <span className="text-violet-300">
              {n.qty} {n.platform} {n.service}
            </span>{" "}
            satın aldı
          </p>
          <p className="text-white/30 text-[10px] mt-0.5 flex items-center gap-1">
            {(n as { foreign?: boolean }).foreign && <span className="text-amber-400/70">🌍</span>}
            {time}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0 ml-1" />
      </div>
    </div>
  );
}

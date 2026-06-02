"use client";

import { useEffect, useState } from "react";

const NOTIFICATIONS = [
  { city: "İstanbul",   platform: "Instagram", service: "Türk Takipçi",    qty: "1.000",   emoji: "📸" },
  { city: "Ankara",     platform: "TikTok",    service: "İzlenme",          qty: "10.000",  emoji: "🎵" },
  { city: "İzmir",      platform: "YouTube",   service: "Abone",            qty: "250",     emoji: "▶️" },
  { city: "Bursa",      platform: "Instagram", service: "Beğeni",           qty: "500",     emoji: "📸" },
  { city: "Antalya",    platform: "X",         service: "Takipçi",          qty: "1.000",   emoji: "✖️" },
  { city: "Adana",      platform: "TikTok",    service: "Takipçi",          qty: "500",     emoji: "🎵" },
  { city: "Konya",      platform: "Instagram", service: "Global Takipçi",   qty: "500",     emoji: "📸" },
  { city: "Gaziantep",  platform: "YouTube",   service: "İzlenme",          qty: "5.000",   emoji: "▶️" },
  { city: "Mersin",     platform: "Instagram", service: "Türk Takipçi",     qty: "250",     emoji: "📸" },
  { city: "Kayseri",    platform: "TikTok",    service: "Beğeni",           qty: "1.000",   emoji: "🎵" },
  { city: "İstanbul",   platform: "YouTube",   service: "Abone",            qty: "100",     emoji: "▶️" },
  { city: "Ankara",     platform: "Instagram", service: "Beğeni",           qty: "2.500",   emoji: "📸" },
  { city: "İzmir",      platform: "TikTok",    service: "İzlenme",          qty: "25.000",  emoji: "🎵" },
  { city: "Diyarbakır", platform: "Instagram", service: "Türk Takipçi",     qty: "500",     emoji: "📸" },
  { city: "Eskişehir",  platform: "X",         service: "Beğeni",           qty: "500",     emoji: "✖️" },
  { city: "Trabzon",    platform: "YouTube",   service: "İzlenme",          qty: "10.000",  emoji: "▶️" },
  { city: "Samsun",     platform: "Instagram", service: "Global Takipçi",   qty: "1.000",   emoji: "📸" },
  { city: "Malatya",    platform: "TikTok",    service: "Takipçi",          qty: "250",     emoji: "🎵" },
  { city: "Balıkesir",  platform: "Instagram", service: "Türk Takipçi",     qty: "100",     emoji: "📸" },
  { city: "Manisa",     platform: "X",         service: "Takipçi",          qty: "250",     emoji: "✖️" },
  { city: "İstanbul",   platform: "TikTok",    service: "İzlenme",          qty: "50.000",  emoji: "🎵" },
  { city: "Ankara",     platform: "Instagram", service: "Türk Takipçi",     qty: "2.500",   emoji: "📸" },
  { city: "İzmir",      platform: "YouTube",   service: "Abone",            qty: "500",     emoji: "▶️" },
  { city: "Şanlıurfa",  platform: "Instagram", service: "Beğeni",           qty: "1.000",   emoji: "📸" },
  { city: "Denizli",    platform: "TikTok",    service: "Takipçi",          qty: "1.000",   emoji: "🎵" },
  { city: "Kocaeli",    platform: "Instagram", service: "Global Takipçi",   qty: "250",     emoji: "📸" },
  { city: "Hatay",      platform: "YouTube",   service: "İzlenme",          qty: "5.000",   emoji: "▶️" },
  { city: "Muğla",      platform: "Instagram", service: "Türk Takipçi",     qty: "500",     emoji: "📸" },
  { city: "Sakarya",    platform: "X",         service: "Takipçi",          qty: "500",     emoji: "✖️" },
  { city: "Tekirdağ",   platform: "TikTok",    service: "Beğeni",           qty: "2.500",   emoji: "🎵" },
];

const TIMES = ["az önce", "1 dk önce", "2 dk önce", "3 dk önce"];

export default function SocialProofToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // İlk bildirim 3 saniye sonra çıksın
    const initial = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!visible) return;

    // 6 saniye görünür kal, sonra kaybol
    const hideTimer = setTimeout(() => setVisible(false), 6000);

    // 4 saniye sonra (kaybolunca) sonraki index'e geç ve tekrar göster
    const nextTimer = setTimeout(() => {
      setIndex(prev => (prev + 1) % NOTIFICATIONS.length);
      setVisible(true);
    }, 10000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [visible, index]);

  const n = NOTIFICATIONS[index];
  const time = TIMES[Math.floor(index / 8) % TIMES.length];

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
            {n.city}&apos;dan biri{" "}
            <span className="text-violet-300">
              {n.qty} {n.platform} {n.service}
            </span>{" "}
            satın aldı
          </p>
          <p className="text-white/30 text-[10px] mt-0.5">{time}</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0 ml-1" />
      </div>
    </div>
  );
}

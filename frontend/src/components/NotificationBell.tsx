"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Loader2, X } from "lucide-react";
import { notificationsApi } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface Toast {
  id: number;
  title: string;
  message: string;
  type: string;
}

const TYPE_COLOR: Record<string, string> = {
  success: "bg-green-500/10 border-green-500/20 text-green-400",
  error:   "bg-red-500/10 border-red-500/20 text-red-400",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  info:    "bg-blue-500/10 border-blue-500/20 text-blue-400",
};

const TOAST_ICON: Record<string, string> = {
  success: "✅",
  error:   "❌",
  warning: "⚠️",
  info:    "ℹ️",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [prevUnread, setPrevUnread] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function showToast(title: string, message: string, type: string) {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }

  async function fetchUnread() {
    try {
      const res = await notificationsApi.unreadCount();
      const count: number = res.data.count;
      setUnread(count);
      setPrevUnread(prev => {
        if (prev !== null && count > prev) {
          notificationsApi.list().then(r => {
            const newest: Notification = r.data?.[0];
            if (newest && !newest.is_read) {
              showToast(newest.title, newest.message, newest.type);
            }
          }).catch(() => {});
        }
        return count;
      });
    } catch {}
  }

  async function openPanel() {
    setOpen(true);
    setLoading(true);
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data);
    } catch {} finally {
      setLoading(false);
    }
  }

  async function markAll() {
    await notificationsApi.markAllRead();
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function markOne(id: string) {
    await notificationsApi.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  }

  return (
    <div ref={ref} className="relative">
      {/* Toast bildirimler */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm max-w-xs animate-in slide-in-from-right-5 fade-in duration-300 ${TYPE_COLOR[t.type] || TYPE_COLOR.info} bg-[#1a1a2e]/95`}
          >
            <span className="text-base shrink-0 mt-0.5">{TOAST_ICON[t.type] || "🔔"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{t.title}</p>
              <p className="text-[11px] opacity-70 mt-0.5 leading-snug">{t.message}</p>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="opacity-40 hover:opacity-70 transition shrink-0">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => open ? setOpen(false) : openPanel()}
        className="relative p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <span className="text-sm font-semibold">Bildirimler</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition">
                <CheckCheck className="w-3.5 h-3.5" /> Tümünü oku
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-white/30">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Bildirim yok
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markOne(n.id)}
                  className={`px-4 py-3 border-b border-white/4 cursor-pointer hover:bg-white/3 transition ${!n.is_read ? "bg-violet-500/5" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`text-xs font-semibold mb-0.5 ${!n.is_read ? "text-white" : "text-white/60"}`}>{n.title}</p>
                      <p className="text-xs text-white/40">{n.message}</p>
                      <p className="text-[10px] text-white/20 mt-1">{new Date(n.created_at).toLocaleString("tr-TR")}</p>
                    </div>
                    {!n.is_read && <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1 shrink-0" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

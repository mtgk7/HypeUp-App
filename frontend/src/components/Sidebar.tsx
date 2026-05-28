"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Zap, PlusCircle, List, Users, Settings, LogOut, BarChart3, Home, Wallet, ShoppingBag, Package, CreditCard, User } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

interface SidebarProps {
  role?: string;
  balance?: number;
  email?: string;
}

const userLinks = [
  { href: "/dashboard",              label: "Genel Bakış",   icon: Home },
  { href: "/dashboard/new-order",    label: "Yeni Sipariş",  icon: PlusCircle },
  { href: "/dashboard/orders",       label: "Siparişlerim",  icon: List },
  { href: "/dashboard/add-balance",  label: "Bakiye Yükle",  icon: Wallet },
  { href: "/dashboard/profile",      label: "Profilim",      icon: User },
];

const adminLinks = [
  { href: "/admin",           label: "Dashboard",    icon: BarChart3 },
  { href: "/admin/orders",    label: "Siparişler",   icon: ShoppingBag },
  { href: "/admin/users",     label: "Kullanıcılar", icon: Users },
  { href: "/admin/services",  label: "Servisler",    icon: Package },
  { href: "/admin/payments",  label: "Ödemeler",     icon: CreditCard },
  { href: "/admin/settings",  label: "Ayarlar",      icon: Settings },
];

export default function Sidebar({ role = "user", balance = 0, email = "" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    Cookies.remove("hypeup_token");
    Cookies.remove("hypeup_role");
    router.push("/login");
  }

  const links = role === "admin" ? adminLinks : userLinks;

  return (
    <aside className="w-64 min-h-screen bg-[#111] border-r border-white/10 flex flex-col p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
          HypeUp
        </span>
      </div>

      {/* Bakiye (sadece user) */}
      {role === "user" && (
        <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/20 rounded-xl p-4 mb-6">
          <p className="text-xs text-white/40 mb-1">Bakiye</p>
          <p className="text-2xl font-bold text-green-400">₺{balance.toFixed(2)}</p>
        </div>
      )}

      {/* Navigasyon */}
      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Kullanıcı */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-xs text-white/30 truncate flex-1">{email}</p>
          {role === "user" && <NotificationBell />}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-red-400 hover:bg-red-500/10 transition w-full"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}

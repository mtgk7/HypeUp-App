"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";
import { usersApi } from "@/lib/api";

interface UserProfile {
  email: string;
  balance: number;
  role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = Cookies.get("hypeup_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    usersApi.me()
      .then((res) => setProfile(res.data))
      .catch(() => {});
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={profile?.role || "user"}
        balance={profile?.balance ?? 0}
        email={profile?.email || ""}
      />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

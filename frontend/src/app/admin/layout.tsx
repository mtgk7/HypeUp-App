"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("hypeup_token");
    const role  = Cookies.get("hypeup_role");
    if (!token || role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

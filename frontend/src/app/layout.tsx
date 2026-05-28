import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "HypeUp — SMM Panel",
  description: "Sosyal medya büyümeni hızlandır",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-[#0f0f0f] text-white min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

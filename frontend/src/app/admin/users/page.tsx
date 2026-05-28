"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { User } from "@/types";
import { Shield, Loader2, Plus, Minus } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await adminApi.users();
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function updateBalance(userId: string, amount: number) {
    const note = prompt(`Bakiyeye ${amount > 0 ? "+" : ""}${amount} TL eklemek için not girin (opsiyonel):`);
    if (note === null) return; // iptal
    setUpdating(userId);
    try {
      await adminApi.updateBalance(userId, amount, note || undefined);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Bakiye güncellenemedi");
    } finally {
      setUpdating(null);
    }
  }

  async function customBalance(userId: string) {
    const input = prompt("Eklenecek/Çıkarılacak miktar (TL, negatif olabilir):");
    if (!input) return;
    const amount = parseFloat(input);
    if (isNaN(amount)) return alert("Geçersiz miktar");
    await updateBalance(userId, amount);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yükleniyor...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-violet-400" />
        Kullanıcı Yönetimi
        <span className="text-base font-normal text-white/30 ml-2">({users.length} kullanıcı)</span>
      </h1>

      <div className="bg-[#151515] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-xs uppercase">
              <th className="px-5 py-3 text-left">E-posta</th>
              <th className="px-5 py-3 text-right">Bakiye</th>
              <th className="px-5 py-3 text-center">Rol</th>
              <th className="px-5 py-3 text-center">Durum</th>
              <th className="px-5 py-3 text-right">Kayıt</th>
              <th className="px-5 py-3 text-center">Bakiye İşlemi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition">
                <td className="px-5 py-3 text-white/80">{user.email}</td>
                <td className="px-5 py-3 text-right text-green-400 font-semibold">₺{user.balance.toFixed(2)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs border ${
                    user.role === "admin"
                      ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                      : "bg-white/5 text-white/50 border-white/10"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`w-2 h-2 rounded-full inline-block ${user.is_active ? "bg-green-400" : "bg-red-400"}`} />
                </td>
                <td className="px-5 py-3 text-right text-white/40 text-xs">
                  {new Date(user.created_at).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-5 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => updateBalance(user.id, 10)}
                      disabled={updating === user.id}
                      className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition text-xs"
                      title="+10 TL"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateBalance(user.id, -10)}
                      disabled={updating === user.id}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-xs"
                      title="-10 TL"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => customBalance(user.id)}
                      disabled={updating === user.id}
                      className="px-2 py-1 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition text-xs"
                    >
                      {updating === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Özel"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

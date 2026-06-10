import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({ baseURL: BASE_URL });

// Her istekte token ekle
api.interceptors.request.use((config) => {
  const token = Cookies.get("hypeup_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 → login'e yönlendir; ağ hatası (cold start) → 1 kez retry
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("hypeup_token");
      window.location.href = "/login";
      return Promise.reject(err);
    }
    // Render cold start: yanıt yok (CORS/network hatası) → 2sn bekle, 1 kez tekrar dene
    if (!err.response && !err.config?._retry) {
      err.config._retry = true;
      await new Promise((r) => setTimeout(r, 2000));
      return api(err.config);
    }
    return Promise.reject(err);
  }
);

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string, ref_code?: string) =>
    api.post("/auth/register", { email, password, ref_code }),
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  changePassword: (old_password: string, new_password: string) =>
    api.patch("/auth/change-password", { old_password, new_password }),
  referralStats: () => api.get("/auth/referral-stats"),
};

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────
export const usersApi = {
  me: () => api.get("/auth/me"),
};

// ──────────────────────────────────────────────
// Services
// ──────────────────────────────────────────────
export const servicesApi = {
  list: (platform?: string) =>
    api.get("/services/list", { params: platform ? { platform } : {} }),
  calculatePrice: (service_id: string, quantity: number) =>
    api.post("/services/price", { service_id, quantity }),
  public: () => api.get("/services/public"),
  featured: () => api.get("/services/featured"),
};

// ──────────────────────────────────────────────
// Orders
// ──────────────────────────────────────────────
export const ordersApi = {
  create: (service_id: string, target_link: string, quantity: number) =>
    api.post("/orders/", { service_id, target_link, quantity }),
  list: () => api.get("/orders/"),
  get: (id: string) => api.get(`/orders/${id}`),
};

// ──────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get("/notifications/"),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

// ──────────────────────────────────────────────
// Payment
// ──────────────────────────────────────────────
export const paymentApi = {
  initShopier: (amount: number) =>
    api.post("/payment/shopier/init", { amount }),
  manual: (amount: number, sender_name: string) =>
    api.post("/payment/manual", { amount, sender_name }),
  history: () => api.get("/payment/history"),
};

// ──────────────────────────────────────────────
// Admin
// ──────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get("/admin/stats"),
  chart: (days?: number) => api.get("/admin/stats/chart", { params: days ? { days } : {} }),
  users: () => api.get("/admin/users"),
  updateBalance: (user_id: string, amount: number, note?: string) =>
    api.patch("/admin/users/balance", { user_id, amount, note }),
  toggleUser: (user_id: string) =>
    api.patch(`/admin/users/${user_id}/toggle`),
  refreshCurrency: () => api.post("/admin/currency/refresh"),
  setCurrency: (rate: number) => api.post("/admin/currency/set", { rate }),
  syncPrm4u: () => api.post("/admin/services/sync-prm4u"),
  prm4uServices: () => api.get("/admin/prm4u/services"),
  prm4uBalance: () => api.get("/admin/prm4u/balance"),
  syncJap: () => api.post("/admin/services/sync-prm4u"), // eski alias
  // Siparişler
  orders: (status?: string) =>
    api.get("/admin/orders", { params: status ? { status } : {} }),
  updateOrderStatus: (order_id: string, status: string) =>
    api.patch(`/admin/orders/${order_id}/status`, { status }),
  // Servisler
  services: () => api.get("/admin/services"),
  updateService: (service_id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/services/${service_id}`, data),
  // Ödemeler
  payments: () => api.get("/admin/payments"),
  approvePayment: (id: string) => api.post(`/admin/payments/${id}/approve`),
  rejectPayment: (id: string) => api.post(`/admin/payments/${id}/reject`),
};

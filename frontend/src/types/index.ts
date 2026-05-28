export interface User {
  id: string;
  email: string;
  balance: number;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  platform_name: "Instagram" | "TikTok" | "YouTube" | "X";
  category_name: string;
}

export interface Service {
  id: string;
  category_id: string;
  service_name: string;
  jap_service_id: number;
  hypeup_tl_price: number;
  min_order: number;
  max_order: number;
  description?: string;
  platform_name?: string;
  category_name?: string;
}

export interface Order {
  id: string;
  service_id: string;
  service_name?: string;
  platform_name?: string;
  target_link: string;
  quantity: number;
  charge_tl: number;
  cost_dolar: number;
  status: "pending" | "processing" | "completed" | "cancelled" | "refunded";
  jap_order_id?: number;
  created_at: string;
}

export interface AdminStats {
  total_revenue_tl: number;
  total_cost_tl: number;
  net_profit_tl: number;
  total_orders: number;
  pending_orders: number;
  dolar_kuru: number;
}

export interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

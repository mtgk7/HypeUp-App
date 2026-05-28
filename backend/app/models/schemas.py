from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal, Any
from datetime import datetime
import uuid


# ──────────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    ref_code: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    balance: float
    referral_code: Optional[str] = None


# ──────────────────────────────────────────────
# USER
# ──────────────────────────────────────────────

class UserOut(BaseModel):
    id: str
    email: str
    balance: float
    role: str
    is_active: bool
    created_at: datetime
    referral_code: Optional[str] = None


class UserBalanceUpdate(BaseModel):
    user_id: str
    amount: float = Field(description="Eklenecek/çıkarılacak miktar (negatif olabilir)")
    note: Optional[str] = None


# ──────────────────────────────────────────────
# CATEGORY
# ──────────────────────────────────────────────

class CategoryOut(BaseModel):
    id: str
    platform_name: str
    category_name: str


# ──────────────────────────────────────────────
# SERVICE
# ──────────────────────────────────────────────

class ServiceOut(BaseModel):
    id: str
    category_id: str
    service_name: str
    jap_service_id: int
    hypeup_tl_price: float      # 1000 adet için TL
    min_order: int
    max_order: int
    description: Optional[str]
    platform_name: Optional[str] = None
    category_name: Optional[str] = None


class ServicePriceQuery(BaseModel):
    service_id: str
    quantity: int


class ServicePriceResponse(BaseModel):
    service_id: str
    quantity: int
    unit_tl_price: float        # 1 adet fiyatı
    total_tl: float             # toplam TL
    total_dolar: float          # JAP maliyeti (bilgi amaçlı)


# ──────────────────────────────────────────────
# ORDER
# ──────────────────────────────────────────────

class OrderCreateRequest(BaseModel):
    service_id: str
    target_link: str = Field(min_length=5)
    quantity: int = Field(gt=0)


class OrderOut(BaseModel):
    id: str
    service_id: str
    service_name: Optional[str] = None
    platform_name: Optional[str] = None
    target_link: str
    quantity: int
    charge_tl: float
    cost_dolar: float
    status: Literal["pending", "processing", "completed", "cancelled", "refunded"]
    jap_order_id: Optional[int]
    created_at: datetime


# ──────────────────────────────────────────────
# ADMIN
# ──────────────────────────────────────────────

class AdminStatsResponse(BaseModel):
    total_revenue_tl: float         # Kullanıcılardan toplam alınan TL
    total_cost_tl: float            # JAP'a ödenen toplam (dolar * kur)
    net_profit_tl: float            # Kâr
    total_orders: int
    pending_orders: int
    dolar_kuru: float


class CurrencyRateResponse(BaseModel):
    rate: float
    source: str
    updated_at: datetime


# ──────────────────────────────────────────────
# PAYMENT
# ──────────────────────────────────────────────

class PaymentInitRequest(BaseModel):
    amount: float = Field(gt=9, lt=10001, description="Yüklenecek TL miktarı (min 10, max 10000)")


class PaymentInitResponse(BaseModel):
    shopier_url: str
    form_fields: dict
    platform_order_id: str


class PaymentTransactionOut(BaseModel):
    id: str
    amount_tl: float
    status: Literal["pending", "completed", "failed"]
    platform_order_id: str
    shopier_payment_id: Optional[str] = None
    created_at: datetime


# ──────────────────────────────────────────────
# ADMIN — EXTRA
# ──────────────────────────────────────────────

class OrderStatusUpdate(BaseModel):
    status: Literal["pending", "processing", "completed", "cancelled", "refunded"]


class ServiceUpdate(BaseModel):
    service_name: Optional[str] = None
    hypeup_tl_price: Optional[float] = None
    min_order: Optional[int] = None
    max_order: Optional[int] = None
    is_active: Optional[bool] = None

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str          # service_role key (tam yetki)
    SUPABASE_ANON_KEY: str

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 24 saat

    # PRM4U (SMM Panel API v2)
    PRM4U_API_KEY: str = ""
    PRM4U_API_URL: str = "https://prm4u.com/api/v2"

    # Döviz API (fallback: TCMB)
    CURRENCY_API_URL: str = "https://api.exchangerate-api.com/v4/latest/USD"

    # Shopier
    SHOPIER_API_KEY: str = ""
    SHOPIER_API_SECRET: str = ""
    SHOPIER_WEBSITE_INDEX: int = 1

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    # Referans sistemi
    REFERRAL_BONUS_TL: float = 25.0

    # Uygulama URL'leri
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    # Uygulama
    APP_ENV: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

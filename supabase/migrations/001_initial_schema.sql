-- ============================================================
-- HypeUp SMM Panel - Veritabanı Şeması
-- Supabase (PostgreSQL)
-- ============================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLO: users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    balance     NUMERIC(12, 2) NOT NULL DEFAULT 50.00,   -- 50 TL hoş geldin bonusu
    role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLO: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_name   TEXT NOT NULL CHECK (platform_name IN ('Instagram', 'TikTok', 'YouTube', 'X')),
    category_name   TEXT NOT NULL,
    display_order   INTEGER NOT NULL DEFAULT 0,   -- Sıralama için
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLO: services
-- ============================================================
CREATE TABLE IF NOT EXISTS public.services (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id         UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    service_name        TEXT NOT NULL,
    jap_service_id      INTEGER NOT NULL,
    jap_dolar_price     NUMERIC(10, 6) NOT NULL,   -- JAP'tan gelen 1000 adet dolar fiyatı
    hypeup_tl_price     NUMERIC(10, 4) NOT NULL,   -- Hesaplanan satış fiyatı (1000 adet TL)
    min_order           INTEGER NOT NULL DEFAULT 100,
    max_order           INTEGER NOT NULL DEFAULT 100000,
    description         TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLO: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    service_id      UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    target_link     TEXT NOT NULL,
    quantity        INTEGER NOT NULL,
    cost_dolar      NUMERIC(10, 6) NOT NULL,    -- JAP'a ödenen dolar
    charge_tl       NUMERIC(10, 4) NOT NULL,    -- Kullanıcıdan alınan TL
    status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','processing','completed','cancelled','refunded')),
    jap_order_id    INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLO: settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key         TEXT NOT NULL UNIQUE,
    value       TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BAŞLANGIÇ VERİLERİ: settings
-- ============================================================
INSERT INTO public.settings (key, value) VALUES
    ('dolar_kuru',   '40.00'),
    ('jap_api_key',  'BURAYA_JAP_API_KEY_GEL'),
    ('jap_api_url',  'https://justanotherpanel.com/api/v2'),
    ('welcome_bonus','50.00')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- BAŞLANGIÇ VERİLERİ: categories
-- ============================================================
INSERT INTO public.categories (platform_name, category_name, display_order) VALUES
    ('Instagram', 'Takipçi',  1),
    ('Instagram', 'Beğeni',   2),
    ('Instagram', 'İzlenme',  3),
    ('TikTok',   'Takipçi',   4),
    ('TikTok',   'Beğeni',    5),
    ('TikTok',   'İzlenme',   6),
    ('YouTube',  'Abone',     7),
    ('YouTube',  'İzlenme',   8),
    ('X',        'Takipçi',   9),
    ('X',        'Beğeni',   10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TRIGGER: Yeni kullanıcıya 50 TL hoş geldin bonusu
-- (balance kolonunda zaten DEFAULT 50.00 var, bu trigger
--  dışarıdan gelecek custom değerleri de korur)
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_welcome_bonus()
RETURNS TRIGGER AS $$
DECLARE
    bonus NUMERIC;
BEGIN
    SELECT value::NUMERIC INTO bonus FROM public.settings WHERE key = 'welcome_bonus';
    IF bonus IS NULL THEN bonus := 50.00; END IF;
    NEW.balance := COALESCE(NEW.balance, 0) + bonus;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eğer trigger zaten varsa drop et, yeniden oluştur
DROP TRIGGER IF EXISTS trg_welcome_bonus ON public.users;
CREATE TRIGGER trg_welcome_bonus
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.apply_welcome_bonus();

-- ============================================================
-- TRIGGER: orders.updated_at otomatik güncelle
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi verilerini görsün
CREATE POLICY "users_self" ON public.users
    FOR ALL USING (auth.uid() = id);

-- Siparişler: kullanıcı sadece kendine ait
CREATE POLICY "orders_self" ON public.orders
    FOR ALL USING (auth.uid() = user_id);

-- Servisler ve kategoriler herkese okuma açık
CREATE POLICY "services_read" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "categories_read" ON public.categories
    FOR SELECT USING (is_active = true);

-- Settings sadece backend (service_role) erişebilir
CREATE POLICY "settings_service_role" ON public.settings
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- INDEX'LER (performans)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id   ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_services_cat     ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_jap_id  ON public.services(jap_service_id);

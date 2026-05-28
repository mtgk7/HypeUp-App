# ⚡ HypeUp — SMM Panel

Modern, otomatik kâr marjlı Sosyal Medya Yönetim Paneli.

## Tech Stack
| Katman | Teknoloji |
|--------|-----------|
| Backend | Python 3.12 + FastAPI |
| Frontend | Next.js 15 + Tailwind CSS |
| Veritabanı | Supabase (PostgreSQL) |
| Deploy | Render (backend) + Vercel (frontend) |

---

## 🚀 Kurulum

### 1. Supabase Veritabanı

1. [supabase.com](https://supabase.com) → yeni proje oluştur
2. SQL Editor → `supabase/migrations/001_initial_schema.sql` dosyasını çalıştır
3. Proje URL ve key'leri kopyala

### 2. Backend (FastAPI)

```bash
cd backend
cp .env.example .env
# .env dosyasını doldur

pip install -r requirements.txt
uvicorn app.main:app --reload
```

API dokümantasyonu: http://localhost:8000/docs

### 3. Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

npm install
npm run dev
```

Uygulama: http://localhost:3000

---

## 🏗️ Proje Yapısı

```
HypeUp-App/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI uygulaması + scheduler
│   │   ├── config.py            # Ortam değişkenleri
│   │   ├── database.py          # Supabase client
│   │   ├── models/schemas.py    # Pydantic modeller
│   │   ├── routers/
│   │   │   ├── auth.py          # Kayıt / Giriş
│   │   │   ├── orders.py        # Sipariş yönetimi
│   │   │   ├── services.py      # Servis listesi + fiyat
│   │   │   └── admin.py         # Admin paneli
│   │   ├── services/
│   │   │   ├── currency_service.py   # TCMB / ExchangeRate API
│   │   │   ├── pricing_service.py    # Kâr marjı motoru
│   │   │   └── jap_service.py        # JAP API entegrasyonu
│   │   └── utils/auth.py        # JWT + bcrypt
│   └── render.yaml              # Render deploy config
│
├── frontend/
│   └── src/app/
│       ├── (auth)/login         # Giriş sayfası
│       ├── (auth)/register      # Kayıt sayfası (50 TL bonus banner)
│       ├── dashboard/
│       │   ├── new-order        # Sipariş formu (anlık fiyat)
│       │   └── orders           # Sipariş geçmişi tablosu
│       └── admin/
│           ├── page.tsx         # KPI dashboard
│           └── users/           # Bakiye yönetimi
│
└── supabase/migrations/
    └── 001_initial_schema.sql   # Tam DB şeması + trigger + RLS
```

---

## 💰 Kâr Marjı Mantığı

| 1000 adet TL maliyeti | Çarpan | Örnek |
|-----------------------|--------|-------|
| < 1 TL | **×40** | İzlenme servisleri |
| 1 – 20 TL | **×4** | Takipçi / Beğeni |
| > 20 TL | **×2.5** | YouTube Abone |

---

## 🔑 Önemli Notlar

- Yeni kayıt olan her kullanıcı **50 TL** hoş geldin bonusu alır (DB trigger)
- Döviz kuru her 24 saatte otomatik güncellenir
- JAP API anahtarın yoksa `admin/services/sync-jap` çalışmaz — servis eklemeni gerekir
- `.env` dosyalarını asla git'e commit etme!

---

## 📡 Deploy

### Backend → Render (Ücretsiz)
1. render.com → New Web Service → GitHub repo bağla
2. Environment Variables'ı `.env.example`'dan doldur
3. `render.yaml` otomatik algılanır

### Frontend → Vercel (Ücretsiz)
1. vercel.com → Import → frontend klasörü
2. `NEXT_PUBLIC_API_URL` = Render backend URL'i

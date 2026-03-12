# GrindBoard — Proje Yol Haritası (Final v2)

## Proje Özeti

**GrindBoard** — Sınavlara hazırlanan öğrencilerin tüm çalışma sürecini tek yerden yönettiği modern bir eğitim platformu.

| Bilgi | Detay |
|-------|-------|
| Domain | **grindboard.org** |
| Fiyat | **$5/ay** (tek plan, freemium yok) |
| Deneme | **7 gün ücretsiz** → sonra ödeme |
| Ödeme | **Lemon Squeezy** |
| Deploy | **Vercel** |
| Veritabanı | **Supabase** |
| Dil | **Türkçe + İngilizce** (otomatik algılama) |
| Slogan | *"Grind smarter, not harder."* |

**Hedef Kitle:** Her sınav türüne hazırlanan öğrenciler (YKS, KPSS, ALES, DGS, üniversite vb.)

---

## Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Neden? |
|--------|-----------|--------|
| Framework | **Next.js 14** (App Router) | Vercel ile tam uyum, SEO dostu |
| Dil | **TypeScript** | CV'de artı puan, güvenli kod |
| Styling | **Tailwind CSS** | 21stdev uyumlu, hızlı geliştirme |
| UI Bileşenleri | **shadcn/ui** | Modern, profesyonel görünüm |
| Veritabanı | **Supabase** (PostgreSQL) | Auth + DB + Realtime |
| Ödeme | **Lemon Squeezy** | Kolay kurulum, vergi otomasyonu |
| i18n | **next-intl** | Next.js App Router ile tam uyum |
| Deploy | **Vercel** | Ücretsiz, otomatik deploy |
| Animasyon | **Framer Motion** | Akıcı geçişler |
| Grafikler | **Recharts** | Dashboard istatistikleri |
| İkonlar | **Lucide React** | Temiz ikon seti |

---

## Çok Dilli Yapı (i18n)

### Nasıl Çalışır?

```
Kullanıcı grindboard.org'a girer
        ↓
Middleware tarayıcının Accept-Language header'ını okur
        ↓
Tarayıcı dili "tr" ise → /tr/dashboard'a yönlendir
Diğer her şey → /en/dashboard'a yönlendir
        ↓
Kullanıcı isterse dil değiştirici (🇹🇷/🇬🇧) ile manuel değiştirir
```

### URL Yapısı
```
grindboard.org/tr/dashboard    → Türkçe
grindboard.org/tr/pomodoro     → Türkçe
grindboard.org/en/dashboard    → İngilizce
grindboard.org/en/pomodoro     → İngilizce
grindboard.org/                → Otomatik yönlendirme
```

### Dosya Yapısı
```
messages/
├── tr.json    → Tüm Türkçe metinler
└── en.json    → Tüm İngilizce metinler
```

### Örnek JSON Yapısı

**messages/tr.json**
```json
{
  "common": {
    "appName": "GrindBoard",
    "login": "Giriş Yap",
    "register": "Kayıt Ol",
    "logout": "Çıkış Yap",
    "save": "Kaydet",
    "cancel": "İptal",
    "delete": "Sil",
    "edit": "Düzenle",
    "add": "Ekle",
    "loading": "Yükleniyor...",
    "settings": "Ayarlar"
  },
  "landing": {
    "hero": {
      "title": "Sınavlara Hazırlığın Merkezi",
      "subtitle": "Pomodoro zamanlayıcı, ders programı ve konu takibi ile çalışmalarını organize et.",
      "cta": "7 Gün Ücretsiz Dene"
    },
    "features": {
      "pomodoro": {
        "title": "Pomodoro Zamanlayıcı",
        "description": "Odaklanma sürelerini yönet, molalarını planla."
      },
      "schedule": {
        "title": "Ders Programı",
        "description": "Haftalık çalışma programını oluştur ve takip et."
      },
      "topics": {
        "title": "Konu Takibi",
        "description": "Hangi konuları bitirdiğini, hangilerinin kaldığını gör."
      },
      "stats": {
        "title": "İstatistikler",
        "description": "Çalışma verilerini analiz et, verimliliğini artır."
      }
    },
    "pricing": {
      "title": "Basit Fiyatlandırma",
      "price": "5",
      "period": "/ay",
      "trial": "7 gün ücretsiz deneme",
      "features": [
        "Sınırsız Pomodoro oturumu",
        "Haftalık ders programı",
        "Konu takip sistemi",
        "Detaylı istatistikler",
        "Karanlık & aydınlık tema"
      ]
    }
  },
  "nav": {
    "dashboard": "Kontrol Paneli",
    "pomodoro": "Pomodoro",
    "schedule": "Ders Programı",
    "topics": "Konu Takip",
    "stats": "İstatistikler",
    "settings": "Ayarlar"
  },
  "dashboard": {
    "title": "Kontrol Paneli",
    "todaySummary": "Bugünün Özeti",
    "totalStudy": "Toplam Çalışma",
    "pomodorosCompleted": "Tamamlanan Pomodoro",
    "dailyGoal": "Günlük Hedef",
    "streak": "Çalışma Serisi",
    "days": "gün",
    "minutes": "dakika",
    "hours": "saat",
    "weeklyChart": "Haftalık Çalışma",
    "upcomingSchedule": "Yaklaşan Program",
    "quickActions": "Hızlı Erişim",
    "trialBanner": "{days} gün deneme süreniz kaldı"
  },
  "pomodoro": {
    "title": "Pomodoro Zamanlayıcı",
    "work": "Çalışma",
    "shortBreak": "Kısa Mola",
    "longBreak": "Uzun Mola",
    "start": "Başlat",
    "pause": "Duraklat",
    "reset": "Sıfırla",
    "selectSubject": "Ders Seç",
    "todayStats": "Bugün {count} pomodoro tamamladın ({minutes} dk)",
    "settings": {
      "workDuration": "Çalışma Süresi",
      "shortBreakDuration": "Kısa Mola Süresi",
      "longBreakDuration": "Uzun Mola Süresi"
    }
  },
  "schedule": {
    "title": "Ders Programı",
    "addBlock": "Ders Bloğu Ekle",
    "selectSubject": "Ders Seç",
    "selectDay": "Gün Seç",
    "startTime": "Başlangıç Saati",
    "endTime": "Bitiş Saati",
    "days": {
      "mon": "Pazartesi",
      "tue": "Salı",
      "wed": "Çarşamba",
      "thu": "Perşembe",
      "fri": "Cuma",
      "sat": "Cumartesi",
      "sun": "Pazar"
    },
    "today": "Bugün",
    "empty": "Henüz ders bloğu eklenmemiş."
  },
  "topics": {
    "title": "Konu Takip",
    "addSubject": "Ders Ekle",
    "addTopic": "Konu Ekle",
    "allSubjects": "Tüm Dersler",
    "progress": "İlerleme",
    "status": {
      "notStarted": "Başlanmadı",
      "inProgress": "Devam Ediyor",
      "completed": "Tamamlandı"
    },
    "completedOf": "{completed}/{total} konu tamamlandı",
    "addNote": "Not Ekle",
    "notePlaceholder": "Bu konu hakkında notlarını yaz..."
  },
  "stats": {
    "title": "İstatistikler",
    "daily": "Günlük",
    "weekly": "Haftalık",
    "monthly": "Aylık",
    "totalStudyTime": "Toplam Çalışma Süresi",
    "subjectDistribution": "Ders Dağılımı",
    "mostProductiveDay": "En Verimli Gün",
    "mostProductiveHour": "En Verimli Saat",
    "currentStreak": "Mevcut Seri",
    "longestStreak": "En Uzun Seri",
    "topicCompletion": "Konu Tamamlama Oranı"
  },
  "settings": {
    "title": "Ayarlar",
    "profile": "Profil",
    "pomodoroSettings": "Pomodoro Ayarları",
    "dailyGoal": "Günlük Hedef (dakika)",
    "theme": "Tema",
    "darkMode": "Karanlık Mod",
    "lightMode": "Aydınlık Mod",
    "language": "Dil",
    "subscription": "Abonelik",
    "manageSubscription": "Aboneliği Yönet",
    "deleteAccount": "Hesabı Sil",
    "deleteWarning": "Bu işlem geri alınamaz. Tüm verileriniz silinecektir."
  },
  "auth": {
    "login": "Giriş Yap",
    "register": "Kayıt Ol",
    "email": "E-posta",
    "password": "Şifre",
    "confirmPassword": "Şifre Tekrar",
    "forgotPassword": "Şifremi Unuttum",
    "noAccount": "Hesabın yok mu?",
    "hasAccount": "Zaten hesabın var mı?",
    "createAccount": "Hesap Oluştur"
  },
  "subscription": {
    "trialExpired": "Deneme süreniz doldu",
    "subscribeNow": "Abone Ol — $5/ay",
    "trialDaysLeft": "{days} gün kaldı",
    "active": "Aktif",
    "manage": "Aboneliği Yönet"
  }
}
```

**messages/en.json**
```json
{
  "common": {
    "appName": "GrindBoard",
    "login": "Log In",
    "register": "Sign Up",
    "logout": "Log Out",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "loading": "Loading...",
    "settings": "Settings"
  },
  "landing": {
    "hero": {
      "title": "Your Study Command Center",
      "subtitle": "Organize your study sessions with Pomodoro timer, weekly schedule, and topic tracking.",
      "cta": "Start 7-Day Free Trial"
    },
    "features": {
      "pomodoro": {
        "title": "Pomodoro Timer",
        "description": "Manage focus sessions, plan your breaks."
      },
      "schedule": {
        "title": "Study Schedule",
        "description": "Create and follow your weekly study plan."
      },
      "topics": {
        "title": "Topic Tracker",
        "description": "See which topics you've completed and what's left."
      },
      "stats": {
        "title": "Statistics",
        "description": "Analyze your study data, boost your productivity."
      }
    },
    "pricing": {
      "title": "Simple Pricing",
      "price": "5",
      "period": "/mo",
      "trial": "7-day free trial",
      "features": [
        "Unlimited Pomodoro sessions",
        "Weekly study schedule",
        "Topic tracking system",
        "Detailed statistics",
        "Dark & light theme"
      ]
    }
  },
  "nav": {
    "dashboard": "Dashboard",
    "pomodoro": "Pomodoro",
    "schedule": "Schedule",
    "topics": "Topics",
    "stats": "Statistics",
    "settings": "Settings"
  },
  "dashboard": {
    "title": "Dashboard",
    "todaySummary": "Today's Summary",
    "totalStudy": "Total Study",
    "pomodorosCompleted": "Pomodoros Completed",
    "dailyGoal": "Daily Goal",
    "streak": "Study Streak",
    "days": "days",
    "minutes": "min",
    "hours": "hrs",
    "weeklyChart": "Weekly Study",
    "upcomingSchedule": "Upcoming Schedule",
    "quickActions": "Quick Actions",
    "trialBanner": "You have {days} days left in your trial"
  },
  "pomodoro": {
    "title": "Pomodoro Timer",
    "work": "Work",
    "shortBreak": "Short Break",
    "longBreak": "Long Break",
    "start": "Start",
    "pause": "Pause",
    "reset": "Reset",
    "selectSubject": "Select Subject",
    "todayStats": "You completed {count} pomodoros today ({minutes} min)",
    "settings": {
      "workDuration": "Work Duration",
      "shortBreakDuration": "Short Break Duration",
      "longBreakDuration": "Long Break Duration"
    }
  },
  "schedule": {
    "title": "Study Schedule",
    "addBlock": "Add Study Block",
    "selectSubject": "Select Subject",
    "selectDay": "Select Day",
    "startTime": "Start Time",
    "endTime": "End Time",
    "days": {
      "mon": "Monday",
      "tue": "Tuesday",
      "wed": "Wednesday",
      "thu": "Thursday",
      "fri": "Friday",
      "sat": "Saturday",
      "sun": "Sunday"
    },
    "today": "Today",
    "empty": "No study blocks added yet."
  },
  "topics": {
    "title": "Topic Tracker",
    "addSubject": "Add Subject",
    "addTopic": "Add Topic",
    "allSubjects": "All Subjects",
    "progress": "Progress",
    "status": {
      "notStarted": "Not Started",
      "inProgress": "In Progress",
      "completed": "Completed"
    },
    "completedOf": "{completed}/{total} topics completed",
    "addNote": "Add Note",
    "notePlaceholder": "Write your notes about this topic..."
  },
  "stats": {
    "title": "Statistics",
    "daily": "Daily",
    "weekly": "Weekly",
    "monthly": "Monthly",
    "totalStudyTime": "Total Study Time",
    "subjectDistribution": "Subject Distribution",
    "mostProductiveDay": "Most Productive Day",
    "mostProductiveHour": "Most Productive Hour",
    "currentStreak": "Current Streak",
    "longestStreak": "Longest Streak",
    "topicCompletion": "Topic Completion Rate"
  },
  "settings": {
    "title": "Settings",
    "profile": "Profile",
    "pomodoroSettings": "Pomodoro Settings",
    "dailyGoal": "Daily Goal (minutes)",
    "theme": "Theme",
    "darkMode": "Dark Mode",
    "lightMode": "Light Mode",
    "language": "Language",
    "subscription": "Subscription",
    "manageSubscription": "Manage Subscription",
    "deleteAccount": "Delete Account",
    "deleteWarning": "This action cannot be undone. All your data will be permanently deleted."
  },
  "auth": {
    "login": "Log In",
    "register": "Sign Up",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "forgotPassword": "Forgot Password",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "createAccount": "Create Account"
  },
  "subscription": {
    "trialExpired": "Your trial has expired",
    "subscribeNow": "Subscribe — $5/mo",
    "trialDaysLeft": "{days} days left",
    "active": "Active",
    "manage": "Manage Subscription"
  }
}
```

### Kodda Kullanımı

```tsx
// Herhangi bir bileşende:
import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const t = useTranslations('dashboard');

  return (
    <div>
      <h1>{t('title')}</h1>                    {/* → "Kontrol Paneli" veya "Dashboard" */}
      <p>{t('streak')}: 7 {t('days')}</p>      {/* → "Çalışma Serisi: 7 gün" */}
      <p>{t('trialBanner', { days: 3 })}</p>   {/* → "3 gün deneme süreniz kaldı" */}
    </div>
  );
}
```

### Dil Değiştirici Bileşeni
Header'da 🇹🇷 / 🇬🇧 bayrak butonları veya dropdown ile kullanıcı manuel dil değiştirebilir.
Seçim cookie'ye kaydedilir, bir sonraki ziyarette hatırlanır.

---

## İş Modeli & Ödeme Akışı

```
Kullanıcı grindboard.org'a girer
        ↓
  Tarayıcı diline göre /tr veya /en'e yönlendirilir
        ↓
  Landing Page görür (kendi dilinde)
        ↓
   "7 Gün Ücretsiz Dene" tıklar
        ↓
  Kayıt olur (Supabase Auth)
        ↓
  7 gün ücretsiz kullanır (tüm özellikler açık)
        ↓
  7. gün → Ödeme sayfası → Lemon Squeezy checkout → $5/ay
        ↓
  Ödeme başarılı → Devam  |  Ödeme yapmazsa → Dashboard kilitlenir
```

### Lemon Squeezy Entegrasyon Detayları
- Lemon Squeezy'de bir "Store" oluştur
- Bir "Product" oluştur: GrindBoard Pro, $5/ay recurring
- 7-day free trial aktif et
- Webhook URL: grindboard.org/api/webhooks/lemonsqueezy
- Webhook eventleri: subscription_created, subscription_updated, subscription_cancelled, subscription_expired
- Supabase'de subscriptions tablosuna kaydet

---

## Veritabanı Yapısı (Supabase)

### Tablolar

**1. profiles**
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  daily_goal_minutes integer default 120,
  preferred_locale text default 'en',
  created_at timestamp with time zone default now()
);
```

**2. subscriptions**
```sql
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  lemonsqueezy_subscription_id text unique,
  status text not null default 'trialing',
  plan_name text default 'pro',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_ends_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

**3. subjects**
```sql
create table subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  icon text,
  created_at timestamp with time zone default now()
);
```

**4. topics**
```sql
create table topics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  name text not null,
  status text not null default 'not_started',
  notes text,
  order_index integer default 0,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);
```

**5. study_sessions**
```sql
create table study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  duration_minutes integer not null,
  session_type text not null default 'pomodoro',
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone
);
```

**6. schedules**
```sql
create table schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default now()
);
```

**7. goals**
```sql
create table goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  target_date date,
  is_completed boolean default false,
  created_at timestamp with time zone default now()
);
```

### Row Level Security (RLS)
```sql
-- Her tablo için bu pattern'i uygula:
alter table subjects enable row level security;

create policy "Users can view own subjects"
  on subjects for select using (auth.uid() = user_id);
create policy "Users can insert own subjects"
  on subjects for insert with check (auth.uid() = user_id);
create policy "Users can update own subjects"
  on subjects for update using (auth.uid() = user_id);
create policy "Users can delete own subjects"
  on subjects for delete using (auth.uid() = user_id);
```

---

## Sayfa Yapısı & Özellikler

### 1. Landing Page ( /[locale]/ )
- Hero section + "7 Gün Ücretsiz Dene" CTA
- 4 özellik kartı (Pomodoro, Program, Takip, İstatistik)
- Nasıl çalışır? (3 adım)
- Fiyat: "$5/ay — 7 gün ücretsiz"
- SSS + Footer
- Dil değiştirici (🇹🇷/🇬🇧)

### 2. Auth ( /[locale]/login, /[locale]/register )
- E-posta + şifre (Supabase Auth)
- 7 gün trial otomatik başlar
- Şifremi unuttum

### 3. Dashboard ( /[locale]/dashboard )
- Bugünün özeti kartları
- Haftalık grafik (bar chart)
- Günlük hedefe ilerleme
- Streak göstergesi
- Trial banner

### 4. Pomodoro ( /[locale]/pomodoro )
- Dairesel zamanlayıcı
- Başlat / Duraklat / Sıfırla
- Ders seçimi + süre ayarları
- Ses bildirimi
- Oturum istatistiği

### 5. Ders Programı ( /[locale]/schedule )
- Haftalık grid (Pzt-Paz)
- Ders bloğu ekleme
- Renk kodlu bloklar
- CRUD + bugün vurgusu

### 6. Konu Takip ( /[locale]/topics )
- Ders filtresi + konu listesi
- Durum toggle + ilerleme çubuğu
- Not ekleme

### 7. İstatistikler ( /[locale]/stats )
- Günlük/Haftalık/Aylık grafikler
- Ders dağılımı + verimlilik analizi
- Streak geçmişi

### 8. Ayarlar ( /[locale]/settings )
- Profil, süre ayarları, tema, dil seçimi
- Abonelik yönetimi
- Hesap silme

---

## Geliştirme Fazları

### Faz 1 — Temel Altyapı + i18n (2 gün)
Claude Code promptları:
1. "Next.js 14 projesi oluştur: TypeScript, Tailwind CSS, shadcn/ui, next-intl"
2. "next-intl konfigürasyonu: tr ve en dil desteği, middleware ile otomatik dil algılama, /[locale]/ URL yapısı"
3. "messages/tr.json ve messages/en.json dosyalarını oluştur"
4. "Supabase client kur ve environment variables ayarla"
5. "Supabase Auth ile login ve register sayfaları (çok dilli)"
6. "Dashboard layout: sol sidebar + üst header + karanlık mod + dil değiştirici"

### Faz 2 — Veritabanı (yarım gün)
Supabase Dashboard'da:
1. SQL tablolarını çalıştır
2. RLS politikalarını ekle
3. Profiles trigger oluştur

### Faz 3 — Pomodoro Zamanlayıcı (2-3 gün)
Claude Code promptları:
1. "Pomodoro timer: dairesel progress, countdown, başlat/duraklat/sıfırla — tüm metinler t() ile"
2. "Ders seçimi dropdown, süre ayarları"
3. "Oturumları Supabase'e kaydet"
4. "Ses bildirimi ekle"

### Faz 4 — Ders Programı (2-3 gün)
Claude Code promptları:
1. "Haftalık grid takvim — gün isimleri t() ile çok dilli"
2. "Ders bloğu ekleme modal"
3. "Supabase CRUD"
4. "Renk kodlu bloklar"

### Faz 5 — Konu Takip (2-3 gün)
Claude Code promptları:
1. "Ders sidebar + konu listesi layout"
2. "Konu ekleme/silme/durum değiştirme"
3. "İlerleme çubuğu"
4. "Not ekleme"

### Faz 6 — Dashboard & İstatistikler (2-3 gün)
Claude Code promptları:
1. "Dashboard kartları ve hedefe ilerleme"
2. "Recharts ile grafikler"
3. "Streak hesaplama"
4. "İstatistik sayfası"

### Faz 7 — Lemon Squeezy (1-2 gün)
Claude Code promptları:
1. "Lemon Squeezy checkout entegrasyonu"
2. "Webhook API route"
3. "Subscription guard middleware"
4. "Trial banner (çok dilli)"

### Faz 8 — Landing Page (1-2 gün)
Claude Code promptları:
1. "Landing page: hero, özellikler, fiyat, SSS — 21stdev stilinde, tüm metinler t() ile"
2. "Responsive tasarım"
3. "Framer Motion animasyonları"

### Faz 9 — Deploy (yarım gün)
1. GitHub repo oluştur
2. Vercel'e bağla
3. Environment variables ekle
4. grindboard.org bağla
5. Final test

**Toplam: ~2-3 hafta**

---

## Proje Klasör Yapısı

```
grindboard/
├── app/
│   └── [locale]/                    ← Dil bazlı routing
│       ├── (auth)/
│       │   ├── login/page.tsx
│       │   └── register/page.tsx
│       ├── (app)/
│       │   ├── layout.tsx           ← Sidebar + Header + Auth guard
│       │   ├── dashboard/page.tsx
│       │   ├── pomodoro/page.tsx
│       │   ├── schedule/page.tsx
│       │   ├── topics/page.tsx
│       │   ├── stats/page.tsx
│       │   └── settings/page.tsx
│       ├── layout.tsx               ← NextIntlClientProvider
│       └── page.tsx                 ← Landing page
├── api/
│   └── webhooks/
│       └── lemonsqueezy/route.ts
├── components/
│   ├── ui/                          ← shadcn bileşenleri
│   ├── pomodoro/
│   ├── schedule/
│   ├── topics/
│   ├── dashboard/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── LanguageSwitcher.tsx     ← 🇹🇷/🇬🇧 dil değiştirici
│   │   └── SubscriptionGuard.tsx
│   └── landing/
├── messages/
│   ├── tr.json                      ← Türkçe çeviriler
│   └── en.json                      ← İngilizce çeviriler
├── lib/
│   ├── supabase/
│   ├── lemonsqueezy/
│   ├── hooks/
│   └── utils.ts
├── i18n/
│   ├── config.ts                    ← Desteklenen diller, varsayılan dil
│   └── request.ts                   ← next-intl server config
├── types/
│   └── database.ts
├── middleware.ts                     ← Auth + subscription + i18n routing
└── public/
    ├── sounds/bell.mp3
    └── images/
```

---

## Başlamadan Önce Checklist

- [ ] **Supabase** hesap aç → supabase.com
- [ ] **Vercel** hesap aç → vercel.com
- [ ] **Lemon Squeezy** hesap aç → lemonsqueezy.com
- [ ] **GitHub** repo oluştur → grindboard
- [ ] **Domain** satın al → grindboard.org

---

## Claude Code Context Prompt

Her prompt'ta şunu ekle:
```
Tech stack: Next.js 14 App Router, TypeScript, Tailwind CSS,
shadcn/ui, Supabase, Lemon Squeezy, Framer Motion, Recharts, next-intl.
Çok dilli: Türkçe (tr) ve İngilizce (en). Tüm kullanıcıya görünen
metinler t() ile çekilmeli, hardcoded metin olmamalı.
UI referansı: 21stdev.com stilinde modern tasarım.
Tema: Karanlık ağırlıklı, modern, profesyonel.
```

---

## CV'ye Nasıl Yazılır?

```
GrindBoard — Eğitim Platformu (SaaS)              grindboard.org

Full-stack web uygulaması
Next.js · TypeScript · Supabase · Lemon Squeezy · next-intl

• Sınavlara hazırlanan öğrenciler için Pomodoro zamanlayıcı,
  haftalık ders programı ve konu takip sistemi içeren SaaS platform
• next-intl ile çok dilli destek (Türkçe/İngilizce), otomatik dil algılama
• Supabase ile authentication, PostgreSQL ve Row Level Security
• Lemon Squeezy ile abonelik ödeme sistemi ($5/ay, 7 gün trial)
• Recharts ile interaktif çalışma istatistikleri dashboard'u
• Vercel üzerinde production deployment
```

---

## Gelecek Özellikler (Post-MVP)

- [ ] Google OAuth
- [ ] Sınav geri sayım sayacı
- [ ] Flashcard sistemi
- [ ] PWA desteği
- [ ] Yıllık plan ($48/yıl)
- [ ] AI çalışma önerileri
- [ ] PDF rapor export
- [ ] Sosyal özellikler
- [ ] Ek diller (Almanca, Arapça vb.)

---

*Son güncelleme: 7 Mart 2026*

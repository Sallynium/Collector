-- ============================================================
-- Esports Doll Showcase — Supabase Schema
-- 在 Supabase Dashboard → SQL Editor 貼上執行即可
-- ============================================================

-- 系列（如：A 系列、2025 世界賽紀念系列）
create table if not exists series (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- 收藏櫃 / 位置（如：A 櫃、客廳展示架）
create table if not exists cabinets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  created_at timestamptz not null default now()
);

-- 娃娃檔案
create table if not exists dolls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  series_id uuid references series(id) on delete set null,
  cabinet_id uuid references cabinets(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 造型（一隻娃娃可有多張去背照片：預設、夏季穿搭、戰隊服…）
create table if not exists doll_variants (
  id uuid primary key default gen_random_uuid(),
  doll_id uuid not null references dolls(id) on delete cascade,
  name text not null default '預設造型',
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 虛擬收藏室場景
create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  background_url text,
  layout jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
-- 公開唯讀；寫入一律走伺服器端 service_role（繞過 RLS）
alter table series enable row level security;
alter table cabinets enable row level security;
alter table dolls enable row level security;
alter table doll_variants enable row level security;
alter table scenes enable row level security;

create policy "public read series" on series for select using (true);
create policy "public read cabinets" on cabinets for select using (true);
create policy "public read dolls" on dolls for select using (true);
create policy "public read variants" on doll_variants for select using (true);
create policy "public read published scenes" on scenes for select using (is_published = true);

-- ---------- Storage ----------
-- 建立公開圖片 bucket（去背 PNG 與場景背景圖）
insert into storage.buckets (id, name, public)
values ('doll-images', 'doll-images', true)
on conflict (id) do nothing;

create policy "public read doll-images"
on storage.objects for select
using (bucket_id = 'doll-images');

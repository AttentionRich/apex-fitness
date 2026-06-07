-- 0003_nutrition_core.sql
-- Foods, meal templates, food log entries, body metrics, calorie history.

-- ─── Calorie Target History ─────────────────────────────���─────────────────────
-- Immutable log of calorie target changes over time.

create table public.calorie_target_history (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  effective_from       date not null,
  maintenance_calories integer not null,
  target_calories      integer not null,
  deficit_calories     integer,
  protein_target_g     integer,
  carbs_target_g       integer,
  fat_target_g         integer,
  fiber_target_g       integer,
  created_at           timestamptz not null default now(),
  unique (user_id, effective_from)
);

-- ─── Foods ────────────────────────────��───────────────────────────────────────
-- User-owned food library. Not a shared global catalog.

create table public.foods (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  name           text not null,
  brand          text,
  serving_amount numeric(8,2) not null default 1,
  serving_unit   text not null,
  calories       integer not null,
  protein_g      numeric(8,2) not null default 0,
  carbs_g        numeric(8,2) not null default 0,
  fat_g          numeric(8,2) not null default 0,
  fiber_g        numeric(8,2) not null default 0,
  is_favorite    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── Meal Templates ──────────────────────────────��────────────────────────────
-- Saved meals the user can quickly log from. Denormalised calories stored
-- at template level for fast display (the app's SavedMeal model).

create table public.meal_templates (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  name             text not null,
  meal_slot        public.meal_slot,
  default_calories integer not null default 0,
  default_protein_g numeric(8,2),
  default_carbs_g  numeric(8,2),
  default_fat_g    numeric(8,2),
  use_count        integer not null default 0,
  last_used_at     timestamptz,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── Food Log Entries ───────────────────────��─────────────────────────────��───
-- Denormalised: stores exact macros at time of logging.

create table public.food_log_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  logged_for_date date not null,
  meal_slot       public.meal_slot not null,
  consumed_at     timestamptz,
  food_id         uuid references public.foods(id) on delete set null,
  source          text not null default 'food',     -- 'food' | 'meal_template' | 'manual'
  item_name       text not null,
  quantity        numeric(8,2) not null default 1,
  serving_amount  numeric(8,2),
  serving_unit    text,
  calories        integer not null,
  protein_g       numeric(8,2) not null default 0,
  carbs_g         numeric(8,2) not null default 0,
  fat_g           numeric(8,2) not null default 0,
  fiber_g         numeric(8,2) not null default 0,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Body Metrics ──────────────────────────��─────────────────────────��────────

create table public.body_metrics (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  recorded_on      date not null,
  body_weight_kg   numeric(6,2),
  waist_cm         numeric(6,2),
  notes            text,
  created_at       timestamptz not null default now(),
  unique (user_id, recorded_on)
);

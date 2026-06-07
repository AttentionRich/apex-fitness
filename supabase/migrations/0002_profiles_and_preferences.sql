-- 0002_profiles_and_preferences.sql
-- User profile, preferences, and nutrition profile shell.

-- ─── Profiles ─────────────────────────────────────────────────────────────────

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique,
  display_name text,
  avatar_url   text,
  onboarding_completed boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── User Preferences ─────────────────────────────────────────────────────────

create table public.user_preferences (
  user_id        uuid primary key references public.profiles(id) on delete cascade,
  unit_system    public.unit_system not null default 'metric',
  timezone       text not null default 'UTC',
  week_starts_on smallint not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint user_preferences_week_starts_on_check
    check (week_starts_on between 0 and 6)
);

-- ─── Nutrition Profile ────────────────────────────────────────────────────────
-- Stores current active nutrition settings. Historical changes live in
-- calorie_target_history (migration 0003).

create table public.nutrition_profiles (
  user_id                  uuid primary key references public.profiles(id) on delete cascade,
  goal                     public.goal_type not null default 'maintain',
  activity_level           public.activity_level not null default 'moderate',
  sex                      text,
  birth_year               integer,
  height_cm                numeric(5,2),
  current_weight_kg        numeric(6,2),
  target_weight_kg         numeric(6,2),
  weekly_weight_change_kg  numeric(4,2),
  maintenance_calories     integer,
  target_calories          integer,
  protein_target_g         integer,
  carbs_target_g           integer,
  fat_target_g             integer,
  fiber_target_g           integer,
  algorithm_version        text not null default 'v1',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- 0001_extensions_and_enums.sql
-- Extensions and domain enums used across the schema.

-- pgcrypto is enabled by default in Supabase but include for completeness
create extension if not exists "pgcrypto";

-- Unit system: metric or imperial
create type public.unit_system as enum ('metric', 'imperial');

-- Meal slots
create type public.meal_slot as enum ('breakfast', 'lunch', 'dinner', 'snack');

-- Diet goal type
create type public.goal_type as enum ('maintain', 'lose', 'gain');

-- Activity level
create type public.activity_level as enum (
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active'
);

-- Progression mode for training
create type public.progression_mode as enum (
  'double_progression',
  'fixed_increment',
  'manual'
);

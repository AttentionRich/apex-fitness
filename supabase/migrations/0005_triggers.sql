-- 0005_triggers.sql
-- Utility triggers: updated_at auto-stamp and new user profile bootstrap.

-- ─── Generic updated_at trigger ───────────────────────────────────────────────

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach to every table with an updated_at column

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute procedure public.set_updated_at();

create trigger set_nutrition_profiles_updated_at
  before update on public.nutrition_profiles
  for each row execute procedure public.set_updated_at();

create trigger set_foods_updated_at
  before update on public.foods
  for each row execute procedure public.set_updated_at();

create trigger set_meal_templates_updated_at
  before update on public.meal_templates
  for each row execute procedure public.set_updated_at();

create trigger set_food_log_entries_updated_at
  before update on public.food_log_entries
  for each row execute procedure public.set_updated_at();

create trigger set_training_programs_updated_at
  before update on public.training_programs
  for each row execute procedure public.set_updated_at();

create trigger set_training_program_exercises_updated_at
  before update on public.training_program_exercises
  for each row execute procedure public.set_updated_at();

create trigger set_workout_set_logs_updated_at
  before update on public.workout_set_logs
  for each row execute procedure public.set_updated_at();

-- ─── Bootstrap profile rows on signup ─────────────────────────────────────────
-- Runs after a new row is inserted into auth.users.
-- Creates matching rows in profiles, user_preferences, and nutrition_profiles.
-- Keep this function SIMPLE — if it throws, sign-ups will fail.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', null)
  );

  insert into public.user_preferences (user_id)
  values (new.id);

  insert into public.nutrition_profiles (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

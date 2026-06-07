-- 0006_rls.sql
-- Enable Row Level Security and define all access policies.

-- ─── Enable RLS on every user-owned or child table ────────────────────────────

alter table public.profiles                   enable row level security;
alter table public.user_preferences           enable row level security;
alter table public.nutrition_profiles         enable row level security;
alter table public.calorie_target_history     enable row level security;
alter table public.foods                      enable row level security;
alter table public.meal_templates             enable row level security;
alter table public.food_log_entries           enable row level security;
alter table public.body_metrics               enable row level security;
alter table public.exercise_catalog           enable row level security;
alter table public.training_programs          enable row level security;
alter table public.training_program_days      enable row level security;
alter table public.training_program_exercises enable row level security;
alter table public.workout_sessions           enable row level security;
alter table public.workout_exercise_logs      enable row level security;
alter table public.workout_set_logs           enable row level security;
alter table public.progression_recommendations enable row level security;

-- ─── profiles ─────────────────────────────────────────────────────────────────

create policy "users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

create policy "users can insert own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

-- ─── user_preferences ────────────────────────────────────────────────────────

create policy "users can manage own preferences"
  on public.user_preferences for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── nutrition_profiles ──────────────────────────────────────────────────────

create policy "users can manage own nutrition profile"
  on public.nutrition_profiles for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── calorie_target_history ──────────────────────────────────────────────────

create policy "users can view own calorie history"
  on public.calorie_target_history for select
  using ((select auth.uid()) = user_id);

create policy "users can insert own calorie history"
  on public.calorie_target_history for insert
  with check ((select auth.uid()) = user_id);

-- History is append-only; no update or delete policies.

-- ─── foods ────────────────────────────────────────────────────────────────────

create policy "users can view own foods"
  on public.foods for select
  using ((select auth.uid()) = user_id);

create policy "users can insert own foods"
  on public.foods for insert
  with check ((select auth.uid()) = user_id);

create policy "users can update own foods"
  on public.foods for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own foods"
  on public.foods for delete
  using ((select auth.uid()) = user_id);

-- ─── meal_templates ──────────────────────────────────────────────────────────

create policy "users can manage own meal templates"
  on public.meal_templates for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── food_log_entries ─────────────────────────────────────────────────────────

create policy "users can manage own food log entries"
  on public.food_log_entries for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── body_metrics ─────────────────────────────────────────────────────────────

create policy "users can manage own body metrics"
  on public.body_metrics for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── exercise_catalog ─────────────────────────────────────────────────────────
-- Global reference data: authenticated users can read, nobody can write via API.

create policy "authenticated users can read exercise catalog"
  on public.exercise_catalog for select
  to authenticated
  using (true);

-- ─── training_programs ────────────────────────────────────────────────────────

create policy "users can manage own training programs"
  on public.training_programs for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── training_program_days ────────────────────────────────────────────────────
-- Child of training_programs — validate through parent ownership.

create policy "users can manage own program days"
  on public.training_program_days for all
  using (
    exists (
      select 1 from public.training_programs tp
      where tp.id = training_program_days.program_id
        and tp.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.training_programs tp
      where tp.id = training_program_days.program_id
        and tp.user_id = (select auth.uid())
    )
  );

-- ─── training_program_exercises ───────────────────────────────────────────────
-- Child of training_program_days — validate through grandparent ownership.

create policy "users can manage own program exercises"
  on public.training_program_exercises for all
  using (
    exists (
      select 1
      from public.training_program_days tpd
      join public.training_programs tp on tp.id = tpd.program_id
      where tpd.id = training_program_exercises.program_day_id
        and tp.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.training_program_days tpd
      join public.training_programs tp on tp.id = tpd.program_id
      where tpd.id = training_program_exercises.program_day_id
        and tp.user_id = (select auth.uid())
    )
  );

-- ─── workout_sessions ─────────────────────────────────────────────────────────

create policy "users can manage own workout sessions"
  on public.workout_sessions for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── workout_exercise_logs ────────────────────────────────────────────────────
-- Child of workout_sessions.

create policy "users can manage own workout exercise logs"
  on public.workout_exercise_logs for all
  using (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = workout_exercise_logs.workout_session_id
        and ws.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = workout_exercise_logs.workout_session_id
        and ws.user_id = (select auth.uid())
    )
  );

-- ─── workout_set_logs ─────────────────────────────────────────────────────────
-- Deep child: workout_exercise_logs → workout_sessions.

create policy "users can manage own workout set logs"
  on public.workout_set_logs for all
  using (
    exists (
      select 1
      from public.workout_exercise_logs wel
      join public.workout_sessions ws on ws.id = wel.workout_session_id
      where wel.id = workout_set_logs.workout_exercise_log_id
        and ws.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.workout_exercise_logs wel
      join public.workout_sessions ws on ws.id = wel.workout_session_id
      where wel.id = workout_set_logs.workout_exercise_log_id
        and ws.user_id = (select auth.uid())
    )
  );

-- ─── progression_recommendations ─────────────────────────────────────────────

create policy "users can manage own progression recommendations"
  on public.progression_recommendations for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

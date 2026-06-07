-- 0007_indexes.sql
-- Performance indexes on ownership columns and date fields used heavily in
-- RLS policies and query filters.

-- Foods
create index foods_user_id_idx
  on public.foods (user_id);

-- Meal templates
create index meal_templates_user_id_idx
  on public.meal_templates (user_id);

-- Food log entries: user + date is the primary query pattern
create index food_log_entries_user_id_date_idx
  on public.food_log_entries (user_id, logged_for_date);

-- Body metrics
create index body_metrics_user_id_recorded_on_idx
  on public.body_metrics (user_id, recorded_on);

-- Calorie target history: descending date for "most recent target" lookups
create index calorie_target_history_user_id_effective_from_idx
  on public.calorie_target_history (user_id, effective_from desc);

-- Training programs
create index training_programs_user_id_idx
  on public.training_programs (user_id);

-- Training program days
create index training_program_days_program_id_idx
  on public.training_program_days (program_id);

-- Training program exercises
create index training_program_exercises_program_day_id_idx
  on public.training_program_exercises (program_day_id);

-- Workout sessions: user + date
create index workout_sessions_user_id_performed_on_idx
  on public.workout_sessions (user_id, performed_on);

-- Workout exercise logs
create index workout_exercise_logs_workout_session_id_idx
  on public.workout_exercise_logs (workout_session_id);

-- Workout set logs
create index workout_set_logs_workout_exercise_log_id_idx
  on public.workout_set_logs (workout_exercise_log_id);

-- Progression recommendations: descending created_at for recent lookups
create index progression_recommendations_user_id_created_at_idx
  on public.progression_recommendations (user_id, created_at desc);

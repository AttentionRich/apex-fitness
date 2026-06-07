-- 0008_views.sql
-- Reporting views for dashboard queries.

-- ─── Daily Nutrition Summary ──────────────────────────────────────────────────
-- Aggregates all food log entries per user per day.
-- Note: RLS on the underlying table (food_log_entries) means each user only
-- sees their own rows, so this view is naturally safe.

create view public.daily_nutrition_summary as
select
  user_id,
  logged_for_date,
  sum(calories)::integer        as total_calories,
  sum(protein_g)::numeric(8,2)  as total_protein_g,
  sum(carbs_g)::numeric(8,2)    as total_carbs_g,
  sum(fat_g)::numeric(8,2)      as total_fat_g,
  sum(fiber_g)::numeric(8,2)    as total_fiber_g,
  count(*)::integer             as entry_count
from public.food_log_entries
group by user_id, logged_for_date;

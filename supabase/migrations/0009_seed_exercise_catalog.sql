-- 0009_seed_exercise_catalog.sql
-- Seed the exercise catalog with a curated set of common exercises.
-- This is reference data; users do not own it.

insert into public.exercise_catalog
  (slug, name, primary_muscle_group, equipment, is_bodyweight, default_increment_kg)
values
  -- Chest
  ('barbell-bench-press',     'Barbell Bench Press',     'chest',      '{"barbell"}',              false, 2.5),
  ('incline-db-press',        'Incline Dumbbell Press',  'chest',      '{"dumbbell"}',             false, 2.0),
  ('cable-chest-fly',         'Cable Chest Fly',         'chest',      '{"cable"}',                false, 1.0),
  ('weighted-dips',           'Weighted Dips',           'chest',      '{"bodyweight","dip belt"}', true,  2.5),

  -- Shoulders
  ('overhead-press',          'Overhead Press',          'shoulders',  '{"barbell"}',              false, 2.5),
  ('lateral-raises',          'Lateral Raises',          'shoulders',  '{"dumbbell"}',             false, 1.0),
  ('face-pulls',              'Face Pulls',              'shoulders',  '{"cable"}',                false, 1.0),

  -- Triceps
  ('tricep-pushdown',         'Tricep Pushdown',         'triceps',    '{"cable"}',                false, 1.0),
  ('skull-crushers',          'Skull Crushers',          'triceps',    '{"barbell"}',              false, 2.5),

  -- Back
  ('deadlift',                'Deadlift',                'back',       '{"barbell"}',              false, 5.0),
  ('pull-ups',                'Pull-ups',                'back',       '{"bodyweight"}',           true,  2.5),
  ('lat-pulldown',            'Lat Pulldown',            'back',       '{"cable"}',                false, 2.5),
  ('seated-cable-row',        'Seated Cable Row',        'back',       '{"cable"}',                false, 2.5),
  ('barbell-row',             'Barbell Row',             'back',       '{"barbell"}',              false, 2.5),
  ('chest-supported-row',     'Chest Supported Row',     'back',       '{"dumbbell"}',             false, 2.0),

  -- Biceps
  ('barbell-curls',           'Barbell Curls',           'biceps',     '{"barbell"}',              false, 2.5),
  ('hammer-curls',            'Hammer Curls',            'biceps',     '{"dumbbell"}',             false, 2.0),

  -- Legs
  ('barbell-squat',           'Barbell Squat',           'quads',      '{"barbell"}',              false, 5.0),
  ('leg-press',               'Leg Press',               'quads',      '{"machine"}',              false, 5.0),
  ('romanian-deadlift',       'Romanian Deadlift',       'hamstrings', '{"barbell"}',              false, 5.0),
  ('leg-curl',                'Leg Curl',                'hamstrings', '{"machine"}',              false, 2.5),
  ('standing-calf-raises',    'Standing Calf Raises',    'calves',     '{"machine"}',              false, 5.0),
  ('dumbbell-lunges',         'Dumbbell Lunges',         'quads',      '{"dumbbell"}',             false, 2.0),

  -- Core
  ('plank',                   'Plank',                   'core',       '{"bodyweight"}',           true,  null),
  ('cable-crunch',            'Cable Crunch',            'core',       '{"cable"}',                false, 2.5)
on conflict (slug) do nothing;

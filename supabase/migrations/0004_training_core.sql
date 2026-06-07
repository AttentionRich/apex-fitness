-- 0004_training_core.sql
-- Exercise catalog, programs, workout logging, progression.

-- ─── Exercise Catalog ─────────────────────────────────────────────────────────
-- App-managed reference data, not user-owned. Seeded in migration 0009.

create table public.exercise_catalog (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text not null unique,
  name                     text not null,
  primary_muscle_group     text,
  secondary_muscle_groups  text[] not null default '{}',
  equipment                text[] not null default '{}',
  is_bodyweight            boolean not null default false,
  default_increment_kg     numeric(6,2),
  created_at               timestamptz not null default now()
);

-- ─── Training Programs ────────────���───────────────────────────────────────────

create table public.training_programs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  is_active   boolean not null default false,
  started_on  date,
  ended_on    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Only one active program per user at a time
create unique index one_active_program_per_user
  on public.training_programs (user_id)
  where is_active = true;

-- ─── Training Program Days ────────��───────────────────────���───────────────────

create table public.training_program_days (
  id         uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.training_programs(id) on delete cascade,
  day_index  smallint not null,    -- 1-7 (Mon-Sun)
  label      text not null,
  notes      text,
  created_at timestamptz not null default now(),
  constraint training_program_days_day_index_check
    check (day_index between 1 and 7),
  unique (program_id, day_index)
);

-- ─── Training Program Exercises ───────────��───────────────────────────────────

create table public.training_program_exercises (
  id                       uuid primary key default gen_random_uuid(),
  program_day_id           uuid not null references public.training_program_days(id) on delete cascade,
  exercise_id              uuid references public.exercise_catalog(id) on delete set null,
  exercise_name_snapshot   text not null,   -- denormalized name for resilience
  order_index              integer not null,
  prescribed_sets          smallint not null,
  rep_min                  smallint,
  rep_max                  smallint,
  target_rpe               numeric(3,1),
  rest_seconds             integer,
  progression_mode         public.progression_mode not null default 'double_progression',
  progression_increment_kg numeric(6,2),
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (program_day_id, order_index)
);

-- ─── Workout Sessions ─────────────────────────────────────────────────────────

create table public.workout_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  program_id      uuid references public.training_programs(id) on delete set null,
  program_day_id  uuid references public.training_program_days(id) on delete set null,
  performed_on    date not null,
  started_at      timestamptz,
  completed_at    timestamptz,
  duration_minutes integer,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ─── Workout Exercise Logs ────────���────────────────────────���──────────────────

create table public.workout_exercise_logs (
  id                             uuid primary key default gen_random_uuid(),
  workout_session_id             uuid not null references public.workout_sessions(id) on delete cascade,
  training_program_exercise_id   uuid references public.training_program_exercises(id) on delete set null,
  exercise_id                    uuid references public.exercise_catalog(id) on delete set null,
  exercise_name_snapshot         text not null,
  order_index                    integer not null,
  created_at                     timestamptz not null default now(),
  unique (workout_session_id, order_index)
);

-- ─── Workout Set Logs ────────────────────────────────────────��────────────────

create table public.workout_set_logs (
  id                       uuid primary key default gen_random_uuid(),
  workout_exercise_log_id  uuid not null references public.workout_exercise_logs(id) on delete cascade,
  set_number               smallint not null,
  reps                     smallint,
  weight_kg                numeric(6,2),
  rpe                      numeric(3,1),
  is_warmup                boolean not null default false,
  completed                boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (workout_exercise_log_id, set_number)
);

-- ─── Progression Recommendations ──────��──────────────────────────────────────

create table public.progression_recommendations (
  id                             uuid primary key default gen_random_uuid(),
  user_id                        uuid not null references public.profiles(id) on delete cascade,
  training_program_exercise_id   uuid references public.training_program_exercises(id) on delete set null,
  workout_exercise_log_id        uuid references public.workout_exercise_logs(id) on delete set null,
  recommended_weight_kg          numeric(6,2),
  recommended_rep_min            smallint,
  recommended_rep_max            smallint,
  rationale                      text,
  rule_version                   text not null default 'v1',
  created_at                     timestamptz not null default now()
);

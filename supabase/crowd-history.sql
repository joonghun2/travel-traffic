-- ==========================================================
-- Crowd history: raw Seoul readings, hourly statistics, daily KTO forecasts.
-- Run once in Supabase → SQL Editor (step 1). Step 2 (scheduling) is in crowd-history-cron.sql.
-- ==========================================================

-- Raw Seoul real-time population readings, one row per area per Seoul update (PPLTN_TIME).
-- Kept for 60 days; the hourly table below keeps the statistics forever.
create table if not exists public.seoul_area_readings (
  area_code    text        not null,              -- official place code, e.g. POI009
  observed_at  timestamptz not null,              -- Seoul data time (PPLTN_TIME, KST)
  congest_lvl  text        not null,              -- 여유 | 보통 | 약간 붐빔 | 붐빔
  score        smallint    not null,              -- our 0-100 crowd score
  pop_min      integer,
  pop_max      integer,
  collected_at timestamptz not null default now(),
  primary key (area_code, observed_at)
);
create index if not exists seoul_area_readings_observed_idx on public.seoul_area_readings (observed_at);

-- Hourly statistics per area (KST date and hour). Filled daily by rollup_seoul_hourly().
create table if not exists public.seoul_area_hourly (
  area_code  text     not null,
  day        date     not null,                   -- KST date
  hour       smallint not null check (hour between 0 and 23),
  dow        smallint not null check (dow between 0 and 6),   -- 0 = Sunday
  samples    smallint not null,
  avg_score  real     not null,
  min_score  smallint not null,
  max_score  smallint not null,
  avg_pop    real,                                -- mean of (pop_min + pop_max) / 2
  primary key (area_code, day, hour)
);
create index if not exists seoul_area_hourly_dow_idx on public.seoul_area_hourly (area_code, dow, hour);

-- KTO 30-day concentration forecast for Jeju/Busan, saved once a day to compare forecast vs. later forecasts.
create table if not exists public.kto_forecast_daily (
  spot_id     integer not null,                   -- id in src/data/spots/forecastSpots.ts
  base_date   date    not null,                   -- day the forecast was fetched (KST)
  target_date date    not null,
  rate        real    not null,
  primary key (spot_id, base_date, target_date)
);

-- Only the server (service role key) may read or write; anonymous visitors get nothing.
alter table public.seoul_area_readings enable row level security;
alter table public.seoul_area_hourly   enable row level security;
alter table public.kto_forecast_daily  enable row level security;

-- Rolls raw readings up into hourly statistics (idempotent: re-running recomputes the same days),
-- then deletes raw readings older than 60 days.
create or replace function public.rollup_seoul_hourly(days_back integer default 2)
returns void
language sql
as $$
  insert into public.seoul_area_hourly (area_code, day, hour, dow, samples, avg_score, min_score, max_score, avg_pop)
  select
    area_code,
    (observed_at at time zone 'Asia/Seoul')::date,
    extract(hour from observed_at at time zone 'Asia/Seoul')::smallint,
    extract(dow  from observed_at at time zone 'Asia/Seoul')::smallint,
    count(*),
    avg(score),
    min(score),
    max(score),
    avg((pop_min + pop_max) / 2.0)
  from public.seoul_area_readings
  where observed_at >= ((now() at time zone 'Asia/Seoul')::date - days_back) at time zone 'Asia/Seoul'
  group by 1, 2, 3, 4
  on conflict (area_code, day, hour) do update set
    samples   = excluded.samples,
    avg_score = excluded.avg_score,
    min_score = excluded.min_score,
    max_score = excluded.max_score,
    avg_pop   = excluded.avg_pop;

  delete from public.seoul_area_readings where observed_at < now() - interval '60 days';
$$;

-- Last 7 days per area and hour of day: average score and how many hours were sampled.
-- "Peak hour" = the hour with the highest avg_score for an area.
create or replace view public.seoul_area_week_profile with (security_invoker = true) as
select
  area_code,
  hour,
  round(avg(avg_score)::numeric, 1) as avg_score,
  max(max_score)                    as max_score,
  sum(samples)                      as samples
from public.seoul_area_hourly
where day >= (now() at time zone 'Asia/Seoul')::date - 7
group by area_code, hour;

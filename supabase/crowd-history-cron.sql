-- ==========================================================
-- Crowd history scheduling (step 2). Run in Supabase → SQL Editor after crowd-history.sql.
-- Supabase runs these on its own servers, so collection continues while your computer is off.
-- ==========================================================

-- 1) Turn on the scheduler (pg_cron) and outgoing HTTP calls (pg_net).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) Store the same CRON_SECRET you put in Vercel, encrypted in Supabase Vault.
--    Replace PASTE_CRON_SECRET_HERE with the value (keep the quotes). Run this line only once.
--    The jobs below read it at run time, so it can also be added after scheduling.
select vault.create_secret('PASTE_CRON_SECRET_HERE', 'cron_secret');

-- 3) Every 10 minutes: ask the site to save the current Seoul readings (and today's forecast once a day).
select cron.schedule(
  'collect-crowd',
  '*/10 * * * *',
  $$
  select net.http_get(
    url := 'https://www.checkeastpoint.com/api/collect',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    timeout_milliseconds := 30000
  );
  $$
);

-- 4) Every day at 00:10 KST (15:10 UTC): roll the last two days up into hourly statistics
--    and delete raw readings older than 60 days.
select cron.schedule('rollup-crowd', '10 15 * * *', $$ select public.rollup_seoul_hourly(2); $$);

-- Check that both jobs are registered:
--   select jobname, schedule, active from cron.job;
-- Recent runs (status should be "succeeded"):
--   select jobname, status, start_time from cron.job_run_details order by start_time desc limit 10;
-- HTTP responses from the collector (status_code 200 = saved):
--   select status_code, content, created from net._http_response order by created desc limit 5;

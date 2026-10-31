-- Busan Food Olympics: one row per finished bracket, so the result page can show what everyone picked.
-- Run once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.busan_food_votes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lang TEXT NOT NULL,
    champion TEXT NOT NULL,
    runner_up TEXT NOT NULL,
    semifinalists TEXT[] NOT NULL,
    -- All 15 matches in play order: [[winner, loser], ...]
    matches JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS busan_food_votes_created_at_idx ON public.busan_food_votes (created_at);

-- Only the site's server (service role) reads and writes; no public access.
ALTER TABLE public.busan_food_votes ENABLE ROW LEVEL SECURITY;

-- Per-food totals: gold medals, and match wins / matches played.
CREATE OR REPLACE VIEW public.busan_food_stats
WITH (security_invoker = true) AS
WITH m AS (
    SELECT x->>0 AS winner, x->>1 AS loser
    FROM public.busan_food_votes, jsonb_array_elements(matches) AS x
),
games AS (
    SELECT winner AS food, 1 AS win FROM m
    UNION ALL
    SELECT loser AS food, 0 AS win FROM m
)
SELECT
    g.food,
    SUM(g.win)::INT AS wins,
    COUNT(*)::INT AS games,
    COALESCE((SELECT COUNT(*) FROM public.busan_food_votes v WHERE v.champion = g.food), 0)::INT AS golds
FROM games g
GROUP BY g.food;

REVOKE ALL ON public.busan_food_votes FROM anon, authenticated;
REVOKE ALL ON public.busan_food_stats FROM anon, authenticated;

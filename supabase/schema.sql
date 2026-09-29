-- ==========================================================
-- CheckEastPoint.com (Travel Traffic) Supabase Schema
-- High-Performance Live Crowd Metrics & Multi-Quiz Lead Funnel
-- ==========================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Spots Master Table
CREATE TABLE IF NOT EXISTS public.spots (
    id SERIAL PRIMARY KEY,
    city VARCHAR(50) NOT NULL,            -- 'seoul', 'jeju', 'busan', 'osaka', 'kyoto'
    name_ko VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ja VARCHAR(100) NOT NULL,
    area_ko VARCHAR(100) NOT NULL,
    area_en VARCHAR(100),
    area_ja VARCHAR(100),
    category VARCHAR(50) NOT NULL,        -- 'attraction', 'shopping', 'palace', 'nature', 'food'
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    base_crowd_score INT DEFAULT 40,      -- Base score (0-100)
    peak_hours INT[] DEFAULT '{}',        -- e.g. [12, 13, 18, 19, 20]
    best_time_ko VARCHAR(100),
    best_time_en VARCHAR(100),
    best_time_ja VARCHAR(100),
    tip_ko TEXT,
    tip_en TEXT,
    tip_ja TEXT,
    emoji VARCHAR(10) DEFAULT '📍',
    photo_url TEXT,
    
    -- Escape Route Pair (Nearby Hidden Gem)
    escape_gem_name_ko VARCHAR(100),
    escape_gem_name_en VARCHAR(100),
    escape_gem_name_ja VARCHAR(100),
    escape_gem_desc_ko TEXT,
    escape_gem_desc_en TEXT,
    escape_gem_desc_ja TEXT,
    escape_walk_minutes INT DEFAULT 5,
    affiliate_provider VARCHAR(50) DEFAULT 'klook', -- 'klook' or 'kkday'
    affiliate_url TEXT,
    affiliate_badge_text_ko VARCHAR(100) DEFAULT '패스트트랙 예약 / 5% 할인',
    affiliate_badge_text_en VARCHAR(100) DEFAULT 'Skip the Line / 5% OFF',
    affiliate_badge_text_ja VARCHAR(100) DEFAULT '優先入場チケット / 5% OFF',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Live Crowd Metrics Table (Realtime Synced)
CREATE TABLE IF NOT EXISTS public.crowd_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spot_id INT NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
    current_score INT NOT NULL CHECK (current_score >= 0 AND current_score <= 100),
    status_level VARCHAR(20) NOT NULL CHECK (status_level IN ('relaxed', 'moderate', 'packed')),
    wait_time_minutes INT DEFAULT 0,
    surge_alert BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Multi-Quiz Leads Table (Event Hub Tracking)
CREATE TABLE IF NOT EXISTS public.quiz_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    quiz_type VARCHAR(50) NOT NULL,       -- 'crowd', 'vibe', 'foodie', 'pass'
    result_code VARCHAR(100) NOT NULL,    -- e.g. 'CROWD_MASTER', 'VIBE_KYOTO'
    selected_city VARCHAR(50) NOT NULL,
    referred_from VARCHAR(100) DEFAULT 'dashboard',
    utm_source VARCHAR(100) DEFAULT 'direct',
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_email_quiz_type UNIQUE (email, quiz_type)
);

-- 5. Campaign Leads Legacy Table (Preserved for compatibility)
CREATE TABLE IF NOT EXISTS public.campaign_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    target_city VARCHAR(50) NOT NULL,
    quiz_score INT NOT NULL,
    user_tier VARCHAR(50) NOT NULL,
    preferred_style VARCHAR(50),
    coupon_code VARCHAR(50),
    utm_source VARCHAR(100) DEFAULT 'direct',
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for Sub-100ms Querying
CREATE INDEX IF NOT EXISTS idx_spots_city ON public.spots(city);
CREATE INDEX IF NOT EXISTS idx_crowd_metrics_spot_id ON public.crowd_metrics(spot_id);
CREATE INDEX IF NOT EXISTS idx_crowd_metrics_updated_at ON public.crowd_metrics(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_email ON public.quiz_leads(email);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_quiz_type ON public.quiz_leads(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_created_at ON public.quiz_leads(created_at DESC);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
-- Spots: Anyone can read spots
CREATE POLICY "Public spots read access"
    ON public.spots FOR SELECT
    USING (true);

-- Crowd Metrics: Anyone can read metrics
CREATE POLICY "Public crowd_metrics read access"
    ON public.crowd_metrics FOR SELECT
    USING (true);

-- Quiz Leads: Public insert with duplicate upsert support, private select
CREATE POLICY "Public quiz_leads insert only"
    ON public.quiz_leads FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin quiz_leads read access"
    ON public.quiz_leads FOR SELECT
    TO authenticated
    USING (true);

-- Campaign Leads
CREATE POLICY "Public campaign_leads insert only"
    ON public.campaign_leads FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin campaign_leads read access"
    ON public.campaign_leads FOR SELECT
    TO authenticated
    USING (true);

-- 9. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.crowd_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spots;

-- 10. Auto-updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spots_modtime
    BEFORE UPDATE ON public.spots
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_crowd_metrics_modtime
    BEFORE UPDATE ON public.crowd_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- ================================================
-- UX ANALYZER DATABASE SCHEMA
-- ================================================

-- USERS TABLE (Authentication)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ANALYSES TABLE (Stores all UX audits)
CREATE TABLE IF NOT EXISTS analyses (
    analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
    screenshot_url TEXT,
    result_json JSONB,          -- AI analysis output
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- USAGE STATISTICS
CREATE TABLE IF NOT EXISTS usage_stats (
    stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    analyses_run INT DEFAULT 0,
    storage_used_mb FLOAT DEFAULT 0,
    ai_requests INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


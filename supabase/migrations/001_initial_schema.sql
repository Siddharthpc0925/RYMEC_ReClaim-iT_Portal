-- ============================================================================
-- RYMEC ReClaim-iT: Campus Lost & Found Portal
-- Supabase Migration: 001_initial_schema.sql
-- ============================================================================

-- 1. Create Enums
CREATE TYPE item_type AS ENUM ('LOST', 'FOUND');
CREATE TYPE item_status AS ENUM ('OPEN', 'MATCHED', 'CLAIMED', 'RETURNED', 'ARCHIVED', 'DONATED', 'REMOVED');
CREATE TYPE claim_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN');

-- 2. Profiles Table (Linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    roll_no TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'STUDENT' NOT NULL,
    points INT DEFAULT 0 NOT NULL,
    fraud_claims INT DEFAULT 0 NOT NULL,
    flagged BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Locations Table (RYMEC Campus Zones)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    parent_zone TEXT NOT NULL,
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Items Table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type item_type NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    colour TEXT NOT NULL,
    brand TEXT,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    location_other TEXT,
    occurred_at TIMESTAMPTZ NOT NULL,
    image_path TEXT,
    held_at TEXT,
    verify_question TEXT,
    verify_answer_hash TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
    is_private BOOLEAN DEFAULT FALSE NOT NULL,
    id_roll_no TEXT,
    status item_status DEFAULT 'OPEN' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Matches Table (Explainable Match Engine Results)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    found_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    score INT NOT NULL,
    reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_lost_found_match UNIQUE (lost_item_id, found_item_id)
);

-- 6. Claims Table
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    answer TEXT,
    status claim_status DEFAULT 'PENDING' NOT NULL,
    fraudulent BOOLEAN DEFAULT FALSE NOT NULL,
    handover_code_hash TEXT,
    handover_expires_at TIMESTAMPTZ,
    decided_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Custody Events Table (Immutable Audit Trail)
CREATE TABLE custody_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'FOUND', 'DEPOSITED', 'CLAIM_REQUESTED', 'CLAIM_APPROVED', 'HANDOVER_VERIFIED', 'RETURNED'
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Messages Table (Masked Realtime Chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Saved Searches Table (Smart Watchlist)
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    keywords TEXT,
    category TEXT,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Points Ledger & Badges
CREATE TABLE points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    points INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE badges (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge TEXT NOT NULL, -- 'FIRST_RETURN', 'HELPER', 'CAMPUS_HERO'
    awarded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY(user_id, badge)
);

-- 12. Abuse Reports Table
CREATE TABLE abuse_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. Indexes for High Performance
CREATE INDEX idx_items_query ON items(type, status, category, location_id, occurred_at);
CREATE INDEX idx_matches_lost ON matches(lost_item_id);
CREATE INDEX idx_matches_found ON matches(found_item_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_claims_item ON claims(item_id);
CREATE INDEX idx_claims_claimant ON claims(claimant_id);
CREATE INDEX idx_custody_item ON custody_events(item_id);

-- 14. Public Items View (Strict Privacy & Protection)
-- Strips verify_answer_hash and id_roll_no, filters out is_private rows, masks anonymous posters
CREATE OR REPLACE VIEW public_items AS
SELECT
    i.id,
    CASE 
        WHEN i.is_anonymous THEN NULL 
        ELSE i.user_id 
    END AS user_id,
    CASE 
        WHEN i.is_anonymous THEN 'Anonymous Student' 
        ELSE p.name 
    END AS reporter_name,
    i.type,
    i.title,
    i.category,
    i.description,
    i.colour,
    i.brand,
    i.location_id,
    l.name AS location_name,
    l.slug AS location_slug,
    i.location_other,
    i.occurred_at,
    i.image_path,
    i.held_at,
    i.verify_question,
    i.is_anonymous,
    i.status,
    i.created_at,
    i.updated_at
FROM items i
LEFT JOIN profiles p ON i.user_id = p.id
LEFT JOIN locations l ON i.location_id = l.id
WHERE i.is_private = FALSE AND i.status != 'REMOVED';

-- 15. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE abuse_reports ENABLE ROW LEVEL SECURITY;

-- 16. Basic Policies
CREATE POLICY "Public profiles are readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Locations readable by everyone" ON locations FOR SELECT USING (true);
CREATE POLICY "Admin can modify locations" ON locations FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

CREATE POLICY "Items viewable according to privacy" ON items FOR SELECT USING (
    is_private = false OR user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Users can insert their own items" ON items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own items" ON items FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

CREATE POLICY "Matches visible to owners or admin" ON matches FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM items 
        WHERE (items.id = matches.lost_item_id OR items.id = matches.found_item_id) 
        AND items.user_id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

CREATE POLICY "Claims visible to parties" ON claims FOR SELECT USING (
    claimant_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM items WHERE items.id = claims.item_id AND items.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

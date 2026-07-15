CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    end_time TEXT,
    location TEXT NOT NULL,
    venue TEXT,
    venue_address TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    capacity INTEGER NOT NULL DEFAULT 100,
    registered INTEGER DEFAULT 0,
    image TEXT,
    organizer TEXT,
    organizer_id UUID,
    schedule JSONB DEFAULT '[]',
    speakers JSONB DEFAULT '[]',
    rules JSONB DEFAULT '[]',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'published', 'completed')),
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'cancelled')),
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    college TEXT,
    department TEXT,
    year TEXT,
    semester TEXT,
    notes TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'rejected')),
    ticket_code TEXT,
    registered_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_events_public" ON events
    FOR SELECT TO anon, authenticated USING (approval_status = 'approved');

CREATE POLICY "select_events_organizer" ON events
    FOR SELECT TO authenticated USING (auth.uid() = organizer_id);

CREATE POLICY "insert_events" ON events
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "update_events_organizer" ON events
    FOR UPDATE TO authenticated USING (auth.uid() = organizer_id) WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "delete_events_organizer" ON events
    FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

CREATE POLICY "select_registrations_owner" ON registrations
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_registrations" ON registrations
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_registrations_owner" ON registrations
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_registrations_owner" ON registrations
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

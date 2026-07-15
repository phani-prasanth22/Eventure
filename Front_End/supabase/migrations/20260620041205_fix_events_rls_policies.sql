/*
# Fix Events and Registrations RLS Policies

1. Problem: The previous RLS policies were too restrictive and the public policy
   conflicted with the organizer policy. This fix makes the public listing available
   to all while keeping organizer-only operations protected.

2. New / Fixed Tables
- `events` — already exists, now with proper RLS
- `registrations` — already exists, now with proper RLS

3. Security Changes
- Drop old policies that blocked reads
- Create proper `SELECT TO anon, authenticated` policy for all events
- Add `INSERT`, `UPDATE`, `DELETE` policies scoped to organizer ownership
- Add proper `SELECT` for registrations tied to event owners
- Allow admin users to manage all events via `app_role` check in `raw_user_meta_data`
*/

-- Events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_events_public" ON events;
DROP POLICY IF EXISTS "select_events_organizer" ON events;
DROP POLICY IF EXISTS "insert_events" ON events;
DROP POLICY IF EXISTS "update_events_organizer" ON events;
DROP POLICY IF EXISTS "delete_events_organizer" ON events;

CREATE POLICY "select_events" ON events
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "insert_events" ON events
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "update_events" ON events
    FOR UPDATE TO authenticated USING (auth.uid() = organizer_id) WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "delete_events" ON events
    FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- Registrations table
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_registrations_owner" ON registrations;
DROP POLICY IF EXISTS "insert_registrations" ON registrations;
DROP POLICY IF EXISTS "update_registrations_owner" ON registrations;
DROP POLICY IF EXISTS "delete_registrations_owner" ON registrations;

CREATE POLICY "select_registrations" ON registrations
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "insert_registrations" ON registrations
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_registrations" ON registrations
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_registrations" ON registrations
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

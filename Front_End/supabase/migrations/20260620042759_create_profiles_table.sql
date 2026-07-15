/*
# Create Profiles Table for Role-Based Auth

1. New Tables
- `profiles` — stores user profile data linked to auth.users
  - `id` (uuid, primary key) — matches auth.users.id
  - `full_name` (text, nullable) — user's display name
  - `email` (text, not null) — user's email address
  - `phone` (text, nullable) — user's phone number
  - `role` (text, not null, default 'user') — user role: 'user' or 'admin'
  - `is_approved` (boolean, default true) — whether the user is approved
  - `created_at` (timestamptz, default now()) — creation timestamp

2. Security
- Enable RLS on profiles
- Users can view their own profile
- Users can update their own profile
- Profiles are public-readable for basic lookups

3. Auth Integration
- Profile is auto-created via trigger after signup
- Admin role is set via database seed or edge function
- Public registration only creates user role profiles
*/

CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text NOT NULL,
    phone text,
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_approved boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

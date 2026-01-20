-- Fix security warning: function_search_path_mutable
-- Setting search_path to '' prevents search path manipulation attacks

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'planner');
  RETURN new;
END;
$$;

-- Note on RLS policies:
-- The "always true" RLS warnings are intentional for this application.
-- This is a single-organization internal tool where all authenticated users
-- need full access to shared data.
--
-- Future enhancement: Add user_id/org_id columns to projects/assignments
-- to enable per-user project isolation while keeping shared master data
-- (crew_members, clients, consultants, crew_roles) accessible to all.

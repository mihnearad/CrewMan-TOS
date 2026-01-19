-- Add crew_roles reference table for predefined roles
CREATE TABLE crew_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed common crew roles
INSERT INTO crew_roles (name, display_order) VALUES
  ('Captain', 1),
  ('Chief Officer', 2),
  ('Chief Engineer', 3),
  ('2nd Officer', 4),
  ('2nd Engineer', 5),
  ('3rd Officer', 6),
  ('3rd Engineer', 7),
  ('Bosun', 8),
  ('AB (Able Seaman)', 9),
  ('Motorman', 10),
  ('Cook', 11),
  ('Steward', 12),
  ('Deckhand', 13),
  ('Electrician', 14),
  ('Fitter', 15);

-- RLS policies
ALTER TABLE crew_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to crew_roles" ON crew_roles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE crew_roles IS 'Predefined crew roles that can be assigned to crew members';
COMMENT ON COLUMN crew_roles.name IS 'Role name (e.g., Captain, Engineer)';
COMMENT ON COLUMN crew_roles.display_order IS 'Order for display in dropdowns';

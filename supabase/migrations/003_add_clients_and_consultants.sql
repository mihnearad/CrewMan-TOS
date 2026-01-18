-- Clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultants table
CREATE TABLE consultants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign keys to projects
ALTER TABLE projects ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL;

-- RLS policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to clients" ON clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to consultants" ON consultants
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

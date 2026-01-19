-- Add new crew member fields for planning tool
-- nationality: Full nationality name (e.g., "Lithuanian", "Latvian")
-- flag_state: 3-letter country code (e.g., "TUV", "LUX", "GIB")
-- home_airport: Airport code + city (e.g., "WAW - Warsaw", "KGD - Kaliningrad")
-- company: Agency/company name (e.g., "TOSN", "SFX", "TOS")

ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS flag_state TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS home_airport TEXT;
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS company TEXT;

-- Add comment for documentation
COMMENT ON COLUMN crew_members.nationality IS 'Full nationality name (e.g., Lithuanian, Latvian)';
COMMENT ON COLUMN crew_members.flag_state IS '3-letter country code for flag state (e.g., TUV, LUX, GIB)';
COMMENT ON COLUMN crew_members.home_airport IS 'Home airport code and city (e.g., WAW - Warsaw)';
COMMENT ON COLUMN crew_members.company IS 'Agency or company name (e.g., TOSN, SFX)';

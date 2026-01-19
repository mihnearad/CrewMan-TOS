-- Add unique constraint on crew member full name (case-insensitive)
-- This prevents duplicate crew members with the same name
CREATE UNIQUE INDEX crew_members_full_name_unique 
  ON crew_members (LOWER(TRIM(full_name)));

-- Add comment for documentation
COMMENT ON INDEX crew_members_full_name_unique IS 'Ensures crew member names are unique (case-insensitive, trimmed)';

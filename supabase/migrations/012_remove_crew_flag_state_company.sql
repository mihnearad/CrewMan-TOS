-- Remove flag_state and company columns from crew_members table
-- These fields are no longer needed in the application

ALTER TABLE crew_members DROP COLUMN IF EXISTS flag_state;
ALTER TABLE crew_members DROP COLUMN IF EXISTS company;

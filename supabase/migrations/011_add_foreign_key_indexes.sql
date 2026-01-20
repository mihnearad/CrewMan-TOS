-- Add indexes for foreign keys to improve JOIN performance
-- These speed up queries that filter/join on these columns

-- Assignments table
CREATE INDEX idx_assignments_crew_member_id ON assignments(crew_member_id);
CREATE INDEX idx_assignments_project_id ON assignments(project_id);

-- Projects table
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_consultant_id ON projects(consultant_id);

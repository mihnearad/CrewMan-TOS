-- Add assignment_type to differentiate vessel vs training assignments
ALTER TABLE assignments ADD COLUMN assignment_type TEXT DEFAULT 'vessel' 
  CHECK (assignment_type IN ('vessel', 'training'));

-- Add training description for free-text training details
ALTER TABLE assignments ADD COLUMN training_description TEXT;

-- Make project_id nullable for training assignments (training doesn't need a project)
ALTER TABLE assignments ALTER COLUMN project_id DROP NOT NULL;

-- Add constraint: vessel assignments must have project_id, training can be null
ALTER TABLE assignments ADD CONSTRAINT valid_assignment_type CHECK (
  (assignment_type = 'vessel' AND project_id IS NOT NULL) OR
  (assignment_type = 'training')
);

-- Update existing assignments to have type 'vessel'
UPDATE assignments SET assignment_type = 'vessel' WHERE assignment_type IS NULL;

-- Add indexes for performance
CREATE INDEX idx_assignments_type ON assignments(assignment_type);

-- Add comments for documentation
COMMENT ON COLUMN assignments.assignment_type IS 'Type of assignment: vessel (onboard) or training';
COMMENT ON COLUMN assignments.training_description IS 'Free-text description of training when assignment_type is training';

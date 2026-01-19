-- Replace crew roles with updated standardized list
DELETE FROM crew_roles;

INSERT INTO crew_roles (name, display_order) VALUES
  ('Captain', 1),
  ('Chief Officer', 2),
  ('Chief Engineer', 3),
  ('1st Officer', 4),
  ('2nd Officer', 5),
  ('3rd Officer', 6),
  ('1st Engineer', 7),
  ('2nd Engineer', 8),
  ('3rd Engineer', 9),
  ('4th Engineer', 10),
  ('AB', 11),
  ('Deckhand', 12),
  ('Rigger', 13),
  ('Rigger Foreman', 14),
  ('Crane Operator', 15),
  ('Electrician', 16),
  ('Mechanic', 17);

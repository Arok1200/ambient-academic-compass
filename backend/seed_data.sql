-- Sample deadlines
INSERT INTO deadline (title, description, due_at, completed, pinned) VALUES
('ECSE 424 Deliverable 1', 'User stories and high fidelity prototype', '2025-11-09 23:59:00', false, true),
('MATH 240 Quiz 6', 'Linear algebra chapter 8', '2025-11-10 09:00:00', false, true),
('Team Meeting', 'Weekly standup for ECSE 424 project', '2025-11-08 15:00:00', false, true),
('COMP 251 Assignment 3', 'Graph algorithms implementation', '2025-11-12 18:00:00', false, true),
('ECSE 424 Exam', 'Midterm exam covering async and threading', '2025-11-15 10:00:00', false, true);

-- Sample events
INSERT INTO event (title, description, start_time, end_time, completed) VALUES
('ECSE 424 Lecture', 'Software engineering lecture on databases', '2025-11-07 08:30:00', '2025-11-07 10:00:00', false),
('Grocery Shopping', 'Weekly grocery run to Costco', '2025-11-07 10:30:00', '2025-11-07 11:30:00', false),
('Vacuum', 'Clean apartment before guests arrive', '2025-11-07 12:00:00', '2025-11-07 13:00:00', false),
('Study Session', 'Linear algebra practice problems', '2025-11-07 14:00:00', '2025-11-07 16:00:00', false),
('Dinner with Friends', 'Dinner at new restaurant downtown', '2025-11-07 18:00:00', '2025-11-07 20:00:00', false);

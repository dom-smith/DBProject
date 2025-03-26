-- Add Locations 
INSERT INTO locations (name, latitude, longitude, address) VALUES
('UCF Main Campus', 28.6024, -81.2001, '4000 Central Florida Blvd, Orlando, FL 32816'),
('MIT Campus', 42.3601, -71.0942, '77 Massachusetts Ave, Cambridge, MA 02139'),
('Stanford University', 37.4275, -122.1697, '450 Serra Mall, Stanford, CA 94305');

-- Add universities
INSERT INTO universities (name, location_id) VALUES
('University of Central Florida', 1),
('Massachusetts Institute of Technology', 2),
('Stanford University', 3);

-- Add Users
INSERT INTO users (name, email, password, role, university_id) VALUES
('Alice Johnson', 'alice@knights.ucf.edu', 'hashed_password_1', 'student', 1),
('Bob Smith', 'bob@mit.edu', 'hashed_password_2', 'student', 2),
('Charlie Brown', 'charlie@stanford.edu', 'hashed_password_3', 'student', 3),
('David Admin', 'admin@knights.ucf.edu', 'hashed_password_4', 'admin', 1),
('Eve Admin', 'admin@mit.edu', 'hashed_password_5', 'admin', 2),
('Super Admin', 'superadmin@supabase.com', 'hashed_password_6', 'super_admin', NULL);

-- Add RSOs (Registered Student Organizations)
INSERT INTO rsos (name, university_id, admin_id, is_active) VALUES
('UCF Hackers', 1, (SELECT user_id FROM users WHERE email='admin@knights.ucf.edu'), TRUE),
('MIT AI Club', 2, (SELECT user_id FROM users WHERE email='admin@mit.edu'), TRUE);

-- Insert RSO Members 
INSERT INTO rso_members (rso_id, user_id) VALUES
((SELECT rso_id FROM rsos WHERE name='UCF Hackers'), (SELECT user_id FROM users WHERE email='alice@knights.ucf.edu')),
((SELECT rso_id FROM rsos WHERE name='MIT AI Club'), (SELECT user_id FROM users WHERE email='bob@mit.edu'));

-- Add Event Catogories 
INSERT INTO event_categories (category_name) VALUES
('Tech Talk'),
('Fundraising'),
('Social'),
('Sports');

-- Add events 
INSERT INTO events (name, category_id, date, time, location_id, contact_email, created_by, rso_id, visibility, is_approved) VALUES
('AI Workshop', 1, '2025-04-10', '18:00:00', 1, 'contact@ucf.edu', (SELECT user_id FROM users WHERE email='admin@knights.ucf.edu'), NULL, 'public', TRUE),
('Hackathon 2025', 1, '2025-06-15', '09:00:00', 1, 'hack@ucf.edu', (SELECT user_id FROM users WHERE email='admin@knights.ucf.edu'), (SELECT rso_id FROM rsos WHERE name='UCF Hackers'), 'rso', TRUE),
('MIT Fundraising Gala', 2, '2025-07-22', '19:30:00', 2, 'fundraising@mit.edu', (SELECT user_id FROM users WHERE email='admin@mit.edu'), NULL, 'private', TRUE);

-- Add Comments and Ratings 
INSERT INTO comments (user_id, event_id, comment_text, rating, created_at) VALUES
((SELECT user_id FROM users WHERE email='alice@knights.ucf.edu'), (SELECT event_id FROM events WHERE name='AI Workshop'), 'Excited for this event!', 5, NOW()),
((SELECT user_id FROM users WHERE email='bob@mit.edu'), (SELECT event_id FROM events WHERE name='MIT Fundraising Gala'), 'Looks like a great initiative!', 4, NOW()),
((SELECT user_id FROM users WHERE email='charlie@stanford.edu'), (SELECT event_id FROM events WHERE name='Hackathon 2025'), 'Can’t wait to participate!', 5, NOW());

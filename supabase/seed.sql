-- ============================================================================
-- RYMEC ReClaim-iT: Realistic Campus Seed Data
-- ============================================================================

-- Locations
INSERT INTO locations (id, slug, name, parent_zone, x, y) VALUES
('11111111-0000-0000-0000-000000000001', 'library', 'Central Library & Reading Hall', 'Academic Core', 28.5, 35.0),
('11111111-0000-0000-0000-000000000002', 'canteen', 'Campus Canteen & Cafeteria', 'Student Amenities', 62.0, 48.0),
('11111111-0000-0000-0000-000000000003', 'main-gate', 'RYMEC Main Arch Gate', 'Security & Entrance', 50.0, 92.0),
('11111111-0000-0000-0000-000000000004', 'bus-bay', 'College Bus Bay & Parking', 'Transit Zone', 82.0, 75.0),
('11111111-0000-0000-0000-000000000005', 'block-mech', 'Mechanical Block & Workshops', 'Engineering Wings', 22.0, 65.0),
('11111111-0000-0000-0000-000000000006', 'block-ee', 'Electrical & Electronics Block', 'Engineering Wings', 42.0, 60.0),
('11111111-0000-0000-0000-000000000007', 'cs-it-labs', 'CS & IT Laboratory Complex', 'Computing Center', 38.0, 25.0),
('11111111-0000-0000-0000-000000000008', 'auditorium', 'Sir M. Visvesvaraya Auditorium', 'Central Facility', 70.0, 28.0),
('11111111-0000-0000-0000-000000000009', 'sports-ground', 'Sports Pavilion & Cricket Ground', 'Athletics Zone', 80.0, 18.0),
('11111111-0000-0000-0000-000000000010', 'hostel-road', 'Hostel Avenue & Gym Block', 'Residential Zone', 15.0, 85.0);

-- Profiles
-- Admin Password is 'Admin@123'
-- Student Password is 'Student@123'
INSERT INTO profiles (id, name, roll_no, phone, role, points, fraud_claims, flagged) VALUES
('22222222-0000-0000-0000-000000000000', 'Campus Security Officer', 'ADM-RYMEC-01', '+91 94480 12345', 'ADMIN', 150, 0, false),
('22222222-0000-0000-0000-000000000001', 'Ananya Rao', '3BR21CS001', '+91 98451 11001', 'STUDENT', 42, 0, false),
('22222222-0000-0000-0000-000000000002', 'Rohan Patil', '3BR21EC045', '+91 98451 11002', 'STUDENT', 24, 0, false),
('22222222-0000-0000-0000-000000000003', 'Sneha Kulkarni', '3BR22IS032', '+91 98451 11003', 'STUDENT', 20, 0, false),
('22222222-0000-0000-0000-000000000004', 'Mohammed Zaid', '3BR21ME018', '+91 98451 11004', 'STUDENT', 2, 0, false),
('22222222-0000-0000-0000-000000000005', 'Priya Sharma', '3BR22CV012', '+91 98451 11005', 'STUDENT', 0, 0, false),
('22222222-0000-0000-0000-000000000006', 'Karthik Reddy', '3BR21EE055', '+91 98451 11006', 'STUDENT', 0, 0, false),
('22222222-0000-0000-0000-000000000007', 'Pooja Hiremath', '3BR23AI009', '+91 98451 11007', 'STUDENT', 22, 0, false),
('22222222-0000-0000-0000-000000000008', 'Vikram Naik', '3BR22CS110', '+91 98451 11008', 'STUDENT', 0, 0, false);

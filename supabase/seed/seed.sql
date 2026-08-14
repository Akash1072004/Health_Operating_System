-- HealthOS Production Seed Data — Hospitals & Ambulance Fleet (Banda, Uttar Pradesh)

INSERT INTO public.hospitals (id, name, license_number, address, latitude, longitude, total_beds, available_beds, total_icu, available_icu, emergency_contact, is_active)
VALUES 
  ('a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', 'Rani Durgavati Medical College & District Hospital', 'UP-MED-BDA-9948', 'Kanpur Road, Near Medical College Campus, Banda, Uttar Pradesh', 25.4850, 80.3400, 350, 48, 60, 12, '108 / 112 / +91 (5192) 220108', true),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Government District Sadar Hospital Banda', 'UP-MED-BDA-8812', 'Civil Lines, Near District Court Compound, Banda, Uttar Pradesh', 25.4750, 80.3300, 210, 32, 30, 7, '108 / +91 (5192) 222049', true),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Shri Ram Super Specialty Heart & Maternity Center', 'UP-PVT-BDA-7731', 'Kalu Kuan Road, Near Civil Lines Crossing, Banda, Uttar Pradesh', 25.4700, 80.3380, 180, 25, 40, 10, '+91 (5192) 228011', true),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Sanjeevani Care Emergency Clinic & Nursing Home', 'UP-PVT-BDA-5529', 'Katra Bypass Road, Near Railway Station, Banda, Uttar Pradesh', 25.4650, 80.3250, 45, 14, 0, 0, '+91 94152 44192', true),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Bundelkhand Regional Super Specialty Hospital', 'UP-PVT-BDA-9910', 'Lucknow-Banda State Highway, Mahokhar Crossing, Banda, Uttar Pradesh', 25.5200, 80.3600, 500, 95, 80, 28, '108 / +91 (5192) 290144', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  license_number = EXCLUDED.license_number,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  total_beds = EXCLUDED.total_beds,
  available_beds = EXCLUDED.available_beds,
  total_icu = EXCLUDED.total_icu,
  available_icu = EXCLUDED.available_icu,
  emergency_contact = EXCLUDED.emergency_contact,
  is_active = EXCLUDED.is_active;

-- SEED AMBULANCES
INSERT INTO public.ambulances (id, hospital_id, vehicle_number, driver_name, driver_phone, status, latitude, longitude)
VALUES
  ('f1a1b1c1-d1e1-41f1-a1b1-c1d1e1f1a1b1', 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', 'UP-90-AMB-1081', 'Ramesh Yadav', '+91 98390 10810', 'AVAILABLE', 25.4840, 80.3390),
  ('f2a2b2c2-d2e2-42f2-a2b2-c2d2e2f2a2b2', 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', 'UP-90-AMB-1082', 'Suresh Kumar', '+91 98390 10820', 'AVAILABLE', 25.4860, 80.3410),
  ('f3a3b3c3-d3e3-43f3-a3b3-c3d3e3f3a3b3', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'UP-90-AMB-2011', 'Vimlesh Singh', '+91 94500 20110', 'AVAILABLE', 25.4740, 80.3290),
  ('f4a4b4c4-d4e4-44f4-a4b4-c4d4e4f4a4b4', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'UP-90-AMB-3090', 'Anil Verma', '+91 98391 30900', 'AVAILABLE', 25.4690, 80.3370)
ON CONFLICT (id) DO NOTHING;

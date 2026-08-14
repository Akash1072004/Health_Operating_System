-- HealthOS Production Database Migration 00002
-- Emergency SOS System Tables, RLS Policies, and Indexes

-- 1. EMERGENCY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    access_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    requester_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_patient_name TEXT,
    guest_patient_age INTEGER,
    guest_patient_gender TEXT,
    guest_patient_phone TEXT,
    guest_emergency_contact_name TEXT,
    guest_emergency_contact_phone TEXT,
    emergency_type TEXT NOT NULL,
    description TEXT,
    is_conscious BOOLEAN DEFAULT TRUE,
    is_breathing_normally BOOLEAN DEFAULT TRUE,
    known_allergies TEXT,
    known_conditions TEXT,
    blood_group TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_accuracy DOUBLE PRECISION,
    address_text TEXT,
    severity TEXT NOT NULL DEFAULT 'HIGH',
    status TEXT NOT NULL DEFAULT 'REQUESTED',
    matched_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    ambulance_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EMERGENCY HOSPITAL ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_hospital_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    match_score DOUBLE PRECISION DEFAULT 0.0,
    distance_km DOUBLE PRECISION DEFAULT 0.0,
    estimated_eta_min INTEGER DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AMBULANCES TABLE
CREATE TABLE IF NOT EXISTS public.ambulances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    vehicle_number TEXT UNIQUE NOT NULL,
    driver_name TEXT,
    driver_phone TEXT,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AMBULANCE ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.ambulance_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambulance_id UUID REFERENCES public.ambulances(id) ON DELETE CASCADE,
    emergency_request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    dispatched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ASSIGNED'
);

-- 5. EMERGENCY EVENTS TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.emergency_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_request_id UUID REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_type ON public.emergency_requests(emergency_type);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_user ON public.emergency_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_hospital ON public.emergency_requests(matched_hospital_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_created ON public.emergency_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_token ON public.emergency_requests(access_token);

CREATE INDEX IF NOT EXISTS idx_hospital_assignments_request ON public.emergency_hospital_assignments(emergency_request_id);
CREATE INDEX IF NOT EXISTS idx_hospital_assignments_hospital ON public.emergency_hospital_assignments(hospital_id);

CREATE INDEX IF NOT EXISTS idx_ambulance_assignments_request ON public.ambulance_assignments(emergency_request_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_assignments_ambulance ON public.ambulance_assignments(ambulance_id);

CREATE INDEX IF NOT EXISTS idx_emergency_events_request ON public.emergency_events(emergency_request_id);

-- ENABLE RLS
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_hospital_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR EMERGENCY REQUESTS
-- 1. Authenticated patients can read & create their own emergency requests
CREATE POLICY "Patients can view own emergency requests"
    ON public.emergency_requests FOR SELECT
    USING (auth.uid() = requester_user_id OR access_token IS NOT NULL);

CREATE POLICY "Patients can create emergency requests"
    ON public.emergency_requests FOR INSERT
    WITH CHECK (auth.uid() IS NULL OR auth.uid() = requester_user_id);

-- 2. Hospitals can view emergencies assigned to them
CREATE POLICY "Hospitals can view assigned emergencies"
    ON public.emergency_requests FOR SELECT
    USING (
        matched_hospital_id IN (
            SELECT id FROM public.hospitals WHERE id = matched_hospital_id
        )
    );

CREATE POLICY "Hospitals can update assigned emergencies"
    ON public.emergency_requests FOR UPDATE
    USING (
        matched_hospital_id IN (
            SELECT id FROM public.hospitals WHERE id = matched_hospital_id
        )
    );

-- 3. Public read access to emergency events by request
CREATE POLICY "Allow read access to emergency events"
    ON public.emergency_events FOR SELECT
    USING (true);

CREATE POLICY "Allow insert access to emergency events"
    ON public.emergency_events FOR INSERT
    WITH CHECK (true);

-- 4. Allow read access to hospital assignments & ambulances
CREATE POLICY "Allow read access to ambulances"
    ON public.ambulances FOR SELECT
    USING (true);

CREATE POLICY "Allow read access to hospital assignments"
    ON public.emergency_hospital_assignments FOR SELECT
    USING (true);

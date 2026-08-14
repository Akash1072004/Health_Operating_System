-- ============================================================
-- HEALTHOS MIGRATION 00003: HOSPITAL VERIFICATION & AUTHORIZATION
-- ============================================================
-- Additive, non-destructive migration extending existing HealthOS schema.
-- DO NOT DROP TABLES. DO NOT DELETE EXISTING DATA.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE public.hospital_verification_status AS ENUM (
        'PENDING',
        'UNDER_REVIEW',
        'VERIFIED',
        'REJECTED',
        'SUSPENDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.verification_check_status AS ENUM (
        'VERIFIED',
        'NOT_VERIFIED',
        'NOT_APPLICABLE',
        'NEEDS_MORE_INFORMATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.hospital_verification_document_type AS ENUM (
        'REGISTRATION_CERTIFICATE',
        'AUTHORIZATION_DOCUMENT',
        'ABDM_DOCUMENT',
        'NABH_DOCUMENT',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.hospital_representative_role AS ENUM (
        'OWNER',
        'DIRECTOR',
        'HOSPITAL_ADMINISTRATOR',
        'AUTHORIZED_REPRESENTATIVE',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ALTER EXISTING HOSPITALS TABLE
ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS healthos_hospital_id TEXT;

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS verification_status public.hospital_verification_status DEFAULT 'PENDING';

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS registration_number TEXT;

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS registration_authority TEXT;

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS registration_state TEXT;

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS registration_date DATE;

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS registration_expiry_date DATE;

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS abdm_facility_id TEXT;

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS abdm_verification_status TEXT DEFAULT 'pending';

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS verified_by UUID;

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Generate internal HealthOS hospital ID for existing records
UPDATE public.hospitals
SET healthos_hospital_id = 'HOS-HOSP-' || UPPER(SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE healthos_hospital_id IS NULL;

-- 3. INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS hospitals_healthos_hospital_id_unique ON public.hospitals(healthos_hospital_id);
CREATE INDEX IF NOT EXISTS hospitals_verification_status_idx ON public.hospitals(verification_status);

-- 4. HOSPITAL REPRESENTATIVES TABLE
CREATE TABLE IF NOT EXISTS public.hospital_representatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    official_email TEXT NOT NULL,
    relationship public.hospital_representative_role NOT NULL DEFAULT 'AUTHORIZED_REPRESENTATIVE',
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    phone_verified_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hospital_representatives_hospital_idx ON public.hospital_representatives(hospital_id);

-- 5. VERIFICATION APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.hospital_verification_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES auth.users(id),
    status public.hospital_verification_status NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    additional_information_request TEXT,
    suspension_reason TEXT,
    resubmission_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hospital_verification_applications_status_idx ON public.hospital_verification_applications(status);
CREATE INDEX IF NOT EXISTS hospital_verification_applications_hospital_idx ON public.hospital_verification_applications(hospital_id);

-- 6. VERIFICATION DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.hospital_verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.hospital_verification_applications(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    document_type public.hospital_verification_document_type NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hospital_verification_documents_application_idx ON public.hospital_verification_documents(application_id);
CREATE INDEX IF NOT EXISTS hospital_verification_documents_hospital_idx ON public.hospital_verification_documents(hospital_id);

-- 7. VERIFICATION CHECKLIST TABLE
CREATE TABLE IF NOT EXISTS public.hospital_verification_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.hospital_verification_applications(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    check_key TEXT NOT NULL,
    status public.verification_check_status NOT NULL DEFAULT 'NEEDS_MORE_INFORMATION',
    notes TEXT,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(application_id, check_key)
);

-- 8. VERIFICATION AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.hospital_verification_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.hospital_verification_applications(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    previous_status public.hospital_verification_status,
    new_status public.hospital_verification_status,
    performed_by UUID REFERENCES auth.users(id),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hospital_verification_audit_logs_hospital_idx ON public.hospital_verification_audit_logs(hospital_id);

-- 9. STATUS SYNC TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.sync_hospital_verification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.hospitals
    SET
        verification_status = NEW.status,
        verified_at = CASE WHEN NEW.status = 'VERIFIED' THEN COALESCE(NEW.reviewed_at, NOW()) ELSE NULL END,
        verified_by = CASE WHEN NEW.status = 'VERIFIED' THEN NEW.reviewed_by ELSE NULL END,
        rejection_reason = CASE WHEN NEW.status = 'REJECTED' THEN NEW.rejection_reason ELSE NULL END,
        suspension_reason = CASE WHEN NEW.status = 'SUSPENDED' THEN NEW.suspension_reason ELSE NULL END
    WHERE id = NEW.hospital_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_hospital_verification_status_trigger ON public.hospital_verification_applications;
CREATE TRIGGER sync_hospital_verification_status_trigger
AFTER INSERT OR UPDATE OF status, reviewed_at, reviewed_by, rejection_reason, suspension_reason
ON public.hospital_verification_applications
FOR EACH ROW
EXECUTE FUNCTION public.sync_hospital_verification_status();

-- 10. VERIFIED HOSPITALS VIEW
CREATE OR REPLACE VIEW public.verified_hospitals AS
SELECT h.*
FROM public.hospitals h
WHERE h.verification_status = 'VERIFIED';

-- 11. ENABLE RLS POLICIES
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_verification_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_verification_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_verification_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read verification applications" ON public.hospital_verification_applications;
CREATE POLICY "Allow read verification applications" ON public.hospital_verification_applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert verification applications" ON public.hospital_verification_applications;
CREATE POLICY "Allow insert verification applications" ON public.hospital_verification_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update verification applications" ON public.hospital_verification_applications;
CREATE POLICY "Allow update verification applications" ON public.hospital_verification_applications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow read verification documents" ON public.hospital_verification_documents;
CREATE POLICY "Allow read verification documents" ON public.hospital_verification_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert verification documents" ON public.hospital_verification_documents;
CREATE POLICY "Allow insert verification documents" ON public.hospital_verification_documents FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read verification audit logs" ON public.hospital_verification_audit_logs;
CREATE POLICY "Allow read verification audit logs" ON public.hospital_verification_audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert verification audit logs" ON public.hospital_verification_audit_logs;
CREATE POLICY "Allow insert verification audit logs" ON public.hospital_verification_audit_logs FOR INSERT WITH CHECK (true);

-- 12. PRIVATE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('hospital-verification-documents', 'hospital-verification-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

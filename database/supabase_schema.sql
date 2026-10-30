-- ============================================================================
-- IBMS SUPABASE POSTGRESQL ENTERPRISE SCHEMA (HYBRID OFFLINE-ONLINE READY)
-- Municipal Government of Malungon, Sarangani Province
-- ============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. CORE MASTER TABLES
-- ============================================================================

-- A. SEMESTERS
CREATE TABLE IF NOT EXISTS public.semesters (
    id SERIAL PRIMARY KEY,
    semester_name VARCHAR(100) NOT NULL UNIQUE,
    semester_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_semesters_updated_at
BEFORE UPDATE ON public.semesters
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- B. SCHOLARS (Master Table)
CREATE TABLE IF NOT EXISTS public.scholars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_no INT NOT NULL UNIQUE,
    ibm_id VARCHAR(50) NOT NULL UNIQUE,
    school_year VARCHAR(50) DEFAULT '',
    last_name VARCHAR(100) DEFAULT '',
    first_name VARCHAR(100) DEFAULT '',
    middle_name VARCHAR(100) DEFAULT '',
    sex VARCHAR(10) DEFAULT '',
    course VARCHAR(255) DEFAULT '',
    school VARCHAR(255) DEFAULT '',
    barangay VARCHAR(100) DEFAULT '',
    school_id VARCHAR(100) DEFAULT '',
    contact VARCHAR(100) DEFAULT '',
    email VARCHAR(150) DEFAULT '',
    tribe VARCHAR(100) DEFAULT '',
    year_level VARCHAR(50) DEFAULT '1st Year',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    remarks TEXT DEFAULT '',
    removal_date DATE DEFAULT NULL,
    semester_count INT DEFAULT 0,
    lbp_account VARCHAR(100) DEFAULT '',
    starting_year VARCHAR(50) DEFAULT '',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholars_ibm_id ON public.scholars(ibm_id);
CREATE INDEX IF NOT EXISTS idx_scholars_status ON public.scholars(status);
CREATE INDEX IF NOT EXISTS idx_scholars_barangay ON public.scholars(barangay);
CREATE INDEX IF NOT EXISTS idx_scholars_school ON public.scholars(school);
CREATE INDEX IF NOT EXISTS idx_scholars_updated_at ON public.scholars(updated_at);
CREATE INDEX IF NOT EXISTS idx_scholars_is_deleted ON public.scholars(is_deleted);

CREATE TRIGGER trg_scholars_updated_at
BEFORE UPDATE ON public.scholars
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- C. SCHOLAR SEMESTERS (Historical Semester Matrix)
CREATE TABLE IF NOT EXISTS public.scholar_semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibm_id VARCHAR(50) NOT NULL,
    semester_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT '',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_scholar_semester UNIQUE (ibm_id, semester_name)
);

CREATE INDEX IF NOT EXISTS idx_scholar_sem_ibm_id ON public.scholar_semesters(ibm_id);
CREATE INDEX IF NOT EXISTS idx_scholar_sem_name ON public.scholar_semesters(semester_name);
CREATE INDEX IF NOT EXISTS idx_scholar_sem_updated_at ON public.scholar_semesters(updated_at);

CREATE TRIGGER trg_scholar_semesters_updated_at
BEFORE UPDATE ON public.scholar_semesters
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- D. PAYROLL REGISTRY
CREATE TABLE IF NOT EXISTS public.payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no INT NOT NULL,
    ibm_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    lbp_account VARCHAR(100) DEFAULT '',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    year_level VARCHAR(50) DEFAULT '',
    grant_period VARCHAR(100) DEFAULT '',
    remarks TEXT DEFAULT '',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_ibm_id ON public.payroll(ibm_id);
CREATE INDEX IF NOT EXISTS idx_payroll_grant_period ON public.payroll(grant_period);
CREATE INDEX IF NOT EXISTS idx_payroll_updated_at ON public.payroll(updated_at);

CREATE TRIGGER trg_payroll_updated_at
BEFORE UPDATE ON public.payroll
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- E. GRADUATES / ALUMNI
CREATE TABLE IF NOT EXISTS public.graduates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibm_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) DEFAULT '',
    tribe VARCHAR(100) DEFAULT '',
    school VARCHAR(255) DEFAULT '',
    course VARCHAR(255) DEFAULT '',
    barangay VARCHAR(100) DEFAULT '',
    grad_year VARCHAR(20) DEFAULT '',
    year_graduated VARCHAR(50) DEFAULT '',
    honor VARCHAR(100) DEFAULT '',
    employment_status VARCHAR(100) DEFAULT '',
    company VARCHAR(255) DEFAULT '',
    contact VARCHAR(100) DEFAULT '',
    email VARCHAR(150) DEFAULT '',
    grad_photo VARCHAR(500) DEFAULT '',
    work_photo VARCHAR(500) DEFAULT '',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_graduates_ibm_id ON public.graduates(ibm_id);
CREATE INDEX IF NOT EXISTS idx_graduates_updated_at ON public.graduates(updated_at);

CREATE TRIGGER trg_graduates_updated_at
BEFORE UPDATE ON public.graduates
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- F. OTHER GRANTS
CREATE TABLE IF NOT EXISTS public.other_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibm_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) DEFAULT '',
    tribe VARCHAR(100) DEFAULT '',
    school VARCHAR(255) DEFAULT '',
    course VARCHAR(255) DEFAULT '',
    barangay VARCHAR(100) DEFAULT '',
    year VARCHAR(20) DEFAULT '',
    grant_name VARCHAR(255) DEFAULT '',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_other_grants_ibm_id ON public.other_grants(ibm_id);
CREATE INDEX IF NOT EXISTS idx_other_grants_updated_at ON public.other_grants(updated_at);

CREATE TRIGGER trg_other_grants_updated_at
BEFORE UPDATE ON public.other_grants
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- G. REQUIREMENTS UPLOADS
CREATE TABLE IF NOT EXISTS public.requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ibm_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    semester VARCHAR(100) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    remarks TEXT DEFAULT '',
    is_deleted BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requirements_ibm_id ON public.requirements(ibm_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON public.requirements(status);
CREATE INDEX IF NOT EXISTS idx_requirements_updated_at ON public.requirements(updated_at);

CREATE TRIGGER trg_requirements_updated_at
BEFORE UPDATE ON public.requirements
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- H. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- I. ACTIVITY LOGS (Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_name VARCHAR(100) DEFAULT 'Administrator',
    action VARCHAR(100) NOT NULL,
    details TEXT DEFAULT '',
    ip_address VARCHAR(45) DEFAULT '127.0.0.1'
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);

-- J. SYNC AUDIT LOGS (Sync Session Tracker)
CREATE TABLE IF NOT EXISTS public.sync_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_device_id VARCHAR(100),
    user_email VARCHAR(150),
    pushed_count INT DEFAULT 0,
    pulled_count INT DEFAULT 0,
    sync_status VARCHAR(50) DEFAULT 'SUCCESS',
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.scholars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholar_semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.other_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_audit_log ENABLE ROW LEVEL SECURITY;

-- Permissive policy for authenticated staff / API key
CREATE POLICY "Full access for authenticated users on scholars" ON public.scholars FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on scholar_semesters" ON public.scholar_semesters FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on payroll" ON public.payroll FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on semesters" ON public.semesters FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on graduates" ON public.graduates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on other_grants" ON public.other_grants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on requirements" ON public.requirements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on settings" ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on activity_logs" ON public.activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Full access for authenticated users on sync_audit_log" ON public.sync_audit_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow student portal upload insertion
CREATE POLICY "Allow public requirement insert" ON public.requirements FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public read of active settings" ON public.settings FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read of active semesters" ON public.semesters FOR SELECT TO anon USING (is_active = true AND is_deleted = false);

-- ============================================================================
-- 4. HYBRID OFFLINE SYNC RPC FUNCTIONS
-- ============================================================================

-- RPC 1: PUSH OFFLINE MUTATIONS (Batch Atomic Execution)
CREATE OR REPLACE FUNCTION public.sync_push_batch(
    p_mutations JSONB,
    p_client_id TEXT DEFAULT 'unknown_client',
    p_user_name TEXT DEFAULT 'Administrator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item JSONB;
    v_applied_count INT := 0;
    v_errors JSONB := '[]'::jsonb;
    v_table TEXT;
    v_action TEXT;
    v_record_id TEXT;
    v_data JSONB;
    v_client_ts TIMESTAMPTZ;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_mutations)
    LOOP
        BEGIN
            v_table := v_item->>'table';
            v_action := UPPER(v_item->>'action');
            v_record_id := v_item->>'record_id';
            v_data := v_item->'payload';
            v_client_ts := COALESCE((v_item->>'client_timestamp')::timestamptz, NOW());

            IF v_table = 'scholars' THEN
                IF v_action = 'INSERT' OR v_action = 'UPDATE' THEN
                    INSERT INTO public.scholars (
                        control_no, ibm_id, school_year, last_name, first_name, middle_name,
                        sex, course, school, barangay, school_id, contact, email, tribe,
                        year_level, status, remarks, removal_date, semester_count, lbp_account, starting_year
                    ) VALUES (
                        COALESCE((v_data->>'control_no')::int, (SELECT COALESCE(MAX(control_no), 0) + 1 FROM public.scholars)),
                        v_data->>'ibm_id',
                        COALESCE(v_data->>'school_year', ''),
                        COALESCE(v_data->>'last_name', ''),
                        COALESCE(v_data->>'first_name', ''),
                        COALESCE(v_data->>'middle_name', ''),
                        COALESCE(v_data->>'sex', ''),
                        COALESCE(v_data->>'course', ''),
                        COALESCE(v_data->>'school', ''),
                        COALESCE(v_data->>'barangay', ''),
                        COALESCE(v_data->>'school_id', ''),
                        COALESCE(v_data->>'contact', ''),
                        COALESCE(v_data->>'email', ''),
                        COALESCE(v_data->>'tribe', ''),
                        COALESCE(v_data->>'year_level', '1st Year'),
                        COALESCE(v_data->>'status', 'ACTIVE'),
                        COALESCE(v_data->>'remarks', ''),
                        CASE WHEN v_data->>'removal_date' IS NOT NULL AND v_data->>'removal_date' != '' THEN (v_data->>'removal_date')::date ELSE NULL END,
                        COALESCE((v_data->>'semester_count')::int, 0),
                        COALESCE(v_data->>'lbp_account', ''),
                        COALESCE(v_data->>'starting_year', '')
                    )
                    ON CONFLICT (ibm_id) DO UPDATE SET
                        school_year = EXCLUDED.school_year,
                        last_name = EXCLUDED.last_name,
                        first_name = EXCLUDED.first_name,
                        middle_name = EXCLUDED.middle_name,
                        sex = EXCLUDED.sex,
                        course = EXCLUDED.course,
                        school = EXCLUDED.school,
                        barangay = EXCLUDED.barangay,
                        school_id = EXCLUDED.school_id,
                        contact = EXCLUDED.contact,
                        email = EXCLUDED.email,
                        tribe = EXCLUDED.tribe,
                        year_level = EXCLUDED.year_level,
                        status = EXCLUDED.status,
                        remarks = EXCLUDED.remarks,
                        removal_date = EXCLUDED.removal_date,
                        semester_count = EXCLUDED.semester_count,
                        lbp_account = EXCLUDED.lbp_account,
                        starting_year = EXCLUDED.starting_year,
                        updated_at = NOW();

                    v_applied_count := v_applied_count + 1;
                ELSIF v_action = 'DELETE' THEN
                    UPDATE public.scholars SET is_deleted = TRUE, updated_at = NOW() WHERE ibm_id = v_record_id;
                    v_applied_count := v_applied_count + 1;
                END IF;

            ELSIF v_table = 'scholar_semesters' THEN
                IF v_action = 'INSERT' OR v_action = 'UPDATE' THEN
                    INSERT INTO public.scholar_semesters (ibm_id, semester_name, status)
                    VALUES (
                        v_data->>'ibm_id',
                        v_data->>'semester_name',
                        v_data->>'status'
                    )
                    ON CONFLICT (ibm_id, semester_name) DO UPDATE SET
                        status = EXCLUDED.status,
                        updated_at = NOW();

                    v_applied_count := v_applied_count + 1;
                END IF;

            ELSIF v_table = 'payroll' THEN
                IF v_action = 'INSERT' OR v_action = 'UPDATE' THEN
                    INSERT INTO public.payroll (no, ibm_id, full_name, lbp_account, status, year_level, grant_period, remarks)
                    VALUES (
                        COALESCE((v_data->>'no')::int, (SELECT COALESCE(MAX(no), 0) + 1 FROM public.payroll)),
                        v_data->>'ibm_id',
                        v_data->>'full_name',
                        COALESCE(v_data->>'lbp_account', ''),
                        COALESCE(v_data->>'status', 'ACTIVE'),
                        COALESCE(v_data->>'year_level', ''),
                        COALESCE(v_data->>'grant_period', ''),
                        COALESCE(v_data->>'remarks', '')
                    );
                    v_applied_count := v_applied_count + 1;
                ELSIF v_action = 'DELETE' THEN
                    UPDATE public.payroll SET is_deleted = TRUE, updated_at = NOW() WHERE ibm_id = v_record_id;
                    v_applied_count := v_applied_count + 1;
                END IF;

            ELSIF v_table = 'activity_logs' THEN
                INSERT INTO public.activity_logs (user_name, action, details)
                VALUES (
                    COALESCE(v_data->>'user_name', p_user_name),
                    v_data->>'action',
                    v_data->>'details'
                );
                v_applied_count := v_applied_count + 1;
            END IF;

        EXCEPTION WHEN OTHERS THEN
            v_errors := v_errors || jsonb_build_object(
                'item', v_item,
                'error', SQLERRM
            );
        END;
    END LOOP;

    -- Record sync execution in audit log
    INSERT INTO public.sync_audit_log (client_device_id, user_email, pushed_count, details)
    VALUES (p_client_id, p_user_name, v_applied_count, jsonb_build_object('errors', v_errors));

    RETURN jsonb_build_object(
        'success', TRUE,
        'applied_count', v_applied_count,
        'errors', v_errors,
        'synced_at', NOW()
    );
END;
$$;

-- RPC 2: PULL DELTA CHANGES (Incremental Downstream Fetch)
CREATE OR REPLACE FUNCTION public.get_delta_changes(p_since TIMESTAMPTZ DEFAULT '1970-01-01'::timestamptz)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_scholars JSONB;
    v_scholar_semesters JSONB;
    v_payroll JSONB;
    v_semesters JSONB;
    v_graduates JSONB;
    v_other_grants JSONB;
    v_settings JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(row_to_json(s)), '[]'::jsonb) INTO v_scholars
    FROM public.scholars s WHERE s.updated_at > p_since;

    SELECT COALESCE(jsonb_agg(row_to_json(ss)), '[]'::jsonb) INTO v_scholar_semesters
    FROM public.scholar_semesters ss WHERE ss.updated_at > p_since;

    SELECT COALESCE(jsonb_agg(row_to_json(p)), '[]'::jsonb) INTO v_payroll
    FROM public.payroll p WHERE p.updated_at > p_since;

    SELECT COALESCE(jsonb_agg(row_to_json(sem)), '[]'::jsonb) INTO v_semesters
    FROM public.semesters sem WHERE sem.updated_at > p_since;

    SELECT COALESCE(jsonb_agg(row_to_json(g)), '[]'::jsonb) INTO v_graduates
    FROM public.graduates g WHERE g.updated_at > p_since;

    SELECT COALESCE(jsonb_agg(row_to_json(og)), '[]'::jsonb) INTO v_other_grants
    FROM public.other_grants og WHERE og.updated_at > p_since;

    SELECT COALESCE(jsonb_agg(row_to_json(st)), '[]'::jsonb) INTO v_settings
    FROM public.settings st WHERE st.updated_at > p_since;

    RETURN jsonb_build_object(
        'scholars', v_scholars,
        'scholar_semesters', v_scholar_semesters,
        'payroll', v_payroll,
        'semesters', v_semesters,
        'graduates', v_graduates,
        'other_grants', v_other_grants,
        'settings', v_settings,
        'server_timestamp', NOW()
    );
END;
$$;

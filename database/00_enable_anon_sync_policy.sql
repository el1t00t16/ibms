-- ============================================================================
-- IBMS MALUNGON: Enable Anon Access for Hybrid Offline Sync & Seeding
-- Run this short script in Supabase SQL Editor (Query size: < 2 KB)
-- ============================================================================

-- 1. Scholars Policy
DROP POLICY IF EXISTS "Allow anon all operations on scholars" ON public.scholars;
CREATE POLICY "Allow anon all operations on scholars" 
ON public.scholars FOR ALL TO anon 
USING (true) WITH CHECK (true);

-- 2. Semesters Policy
DROP POLICY IF EXISTS "Allow anon all operations on semesters" ON public.semesters;
CREATE POLICY "Allow anon all operations on semesters" 
ON public.semesters FOR ALL TO anon 
USING (true) WITH CHECK (true);

-- 3. Scholar Semesters Policy
DROP POLICY IF EXISTS "Allow anon all operations on scholar_semesters" ON public.scholar_semesters;
CREATE POLICY "Allow anon all operations on scholar_semesters" 
ON public.scholar_semesters FOR ALL TO anon 
USING (true) WITH CHECK (true);

-- 4. Payroll Policy
DROP POLICY IF EXISTS "Allow anon all operations on payroll" ON public.payroll;
CREATE POLICY "Allow anon all operations on payroll" 
ON public.payroll FOR ALL TO anon 
USING (true) WITH CHECK (true);

-- 5. Graduates / Alumni Policy
DROP POLICY IF EXISTS "Allow anon all operations on graduates" ON public.graduates;
CREATE POLICY "Allow anon all operations on graduates" 
ON public.graduates FOR ALL TO anon 
USING (true) WITH CHECK (true);

-- 6. Activity Logs Policy
DROP POLICY IF EXISTS "Allow anon all operations on activity_logs" ON public.activity_logs;
CREATE POLICY "Allow anon all operations on activity_logs" 
ON public.activity_logs FOR ALL TO anon 
USING (true) WITH CHECK (true);

-- 7. Other Grants Policy
DROP POLICY IF EXISTS "Allow anon all operations on other_grants" ON public.other_grants;
CREATE POLICY "Allow anon all operations on other_grants" 
ON public.other_grants FOR ALL TO anon 
USING (true) WITH CHECK (true);

-- 8. Requirements Policy
DROP POLICY IF EXISTS "Allow anon all operations on requirements" ON public.requirements;
CREATE POLICY "Allow anon all operations on requirements" 
ON public.requirements FOR ALL TO anon 
USING (true) WITH CHECK (true);

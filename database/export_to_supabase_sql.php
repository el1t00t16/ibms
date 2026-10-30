<?php
/**
 * IBMS Database Migration Script: MySQL -> Supabase PostgreSQL Seed File
 * Reads existing data from MySQL (ibms_db) and generates clean PostgreSQL INSERT statements.
 */

require_once __DIR__ . '/../config/db.php';

$outputSqlFile = __DIR__ . '/seed_data_for_supabase.sql';

try {
    $db = getDB();
    $sqlOut = "-- ============================================================================\n";
    $sqlOut .= "-- IBMS DATA SEED FILE FOR SUPABASE POSTGRESQL\n";
    $sqlOut .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
    $sqlOut .= "-- ============================================================================\n\n";

    // 1. SEMESTERS
    $semStmt = $db->query("SELECT * FROM semesters ORDER BY semester_order ASC, id ASC");
    $semesters = $semStmt->fetchAll();
    if (!empty($semesters)) {
        $sqlOut .= "-- 1. Semesters\n";
        foreach ($semesters as $s) {
            $name = addslashes($s['semester_name']);
            $order = (int)$s['semester_order'];
            $active = !empty($s['is_active']) ? 'TRUE' : 'FALSE';
            $sqlOut .= "INSERT INTO public.semesters (semester_name, semester_order, is_active) VALUES ('{$name}', {$order}, {$active}) ON CONFLICT (semester_name) DO NOTHING;\n";
        }
        $sqlOut .= "\n";
    }

    // 2. SCHOLARS MASTER TABLE
    $sStmt = $db->query("SELECT * FROM scholars ORDER BY control_no ASC");
    $scholars = $sStmt->fetchAll();
    if (!empty($scholars)) {
        $sqlOut .= "-- 2. Scholars Master Data (" . count($scholars) . " records)\n";
        foreach ($scholars as $row) {
            $ctrl = (int)$row['control_no'];
            $ibmId = addslashes($row['ibm_id']);
            $sy = addslashes($row['school_year'] ?? '');
            $lName = addslashes($row['last_name'] ?? '');
            $fName = addslashes($row['first_name'] ?? '');
            $mName = addslashes($row['middle_name'] ?? '');
            $sex = addslashes($row['sex'] ?? '');
            $course = addslashes($row['course'] ?? '');
            $school = addslashes($row['school'] ?? '');
            $brgy = addslashes($row['barangay'] ?? '');
            $schId = addslashes($row['school_id'] ?? '');
            $contact = addslashes($row['contact'] ?? '');
            $tribe = addslashes($row['tribe'] ?? '');
            $yearLvl = addslashes($row['year_level'] ?? '1st Year');
            $status = addslashes($row['status'] ?? 'ACTIVE');
            $remarks = addslashes($row['remarks'] ?? '');
            $remDate = !empty($row['removal_date']) && $row['removal_date'] !== '0000-00-00' ? "'" . $row['removal_date'] . "'" : "NULL";
            $semCount = (int)($row['semester_count'] ?? 0);
            $lbp = addslashes($row['lbp_account'] ?? '');
            $startYear = addslashes($row['starting_year'] ?? '');

            $sqlOut .= "INSERT INTO public.scholars (control_no, ibm_id, school_year, last_name, first_name, middle_name, sex, course, school, barangay, school_id, contact, tribe, year_level, status, remarks, removal_date, semester_count, lbp_account, starting_year) VALUES ({$ctrl}, '{$ibmId}', '{$sy}', '{$lName}', '{$fName}', '{$mName}', '{$sex}', '{$course}', '{$school}', '{$brgy}', '{$schId}', '{$contact}', '{$tribe}', '{$yearLvl}', '{$status}', '{$remarks}', {$remDate}, {$semCount}, '{$lbp}', '{$startYear}') ON CONFLICT (ibm_id) DO NOTHING;\n";
        }
        $sqlOut .= "\n";
    }

    // 3. SCHOLAR SEMESTERS
    $semRecStmt = $db->query("SELECT * FROM scholar_semesters");
    $semRecs = $semRecStmt->fetchAll();
    if (!empty($semRecs)) {
        $sqlOut .= "-- 3. Scholar Semester Records (" . count($semRecs) . " records)\n";
        foreach ($semRecs as $sr) {
            $ibmId = addslashes($sr['ibm_id']);
            $semName = addslashes($sr['semester_name']);
            $st = addslashes($sr['status'] ?? '');
            $sqlOut .= "INSERT INTO public.scholar_semesters (ibm_id, semester_name, status) VALUES ('{$ibmId}', '{$semName}', '{$st}') ON CONFLICT (ibm_id, semester_name) DO NOTHING;\n";
        }
        $sqlOut .= "\n";
    }

    // 4. PAYROLL
    $pStmt = $db->query("SELECT * FROM payroll ORDER BY `no` ASC");
    $payrolls = $pStmt->fetchAll();
    if (!empty($payrolls)) {
        $sqlOut .= "-- 4. Payroll Records (" . count($payrolls) . " records)\n";
        foreach ($payrolls as $p) {
            $no = (int)$p['no'];
            $ibmId = addslashes($p['ibm_id']);
            $name = addslashes($p['full_name']);
            $lbp = addslashes($p['lbp_account'] ?? '');
            $status = addslashes($p['status'] ?? 'ACTIVE');
            $year = addslashes($p['year_level'] ?? '');
            $period = addslashes($p['grant_period'] ?? '');
            $rem = addslashes($p['remarks'] ?? '');
            $sqlOut .= "INSERT INTO public.payroll (`no`, ibm_id, full_name, lbp_account, status, year_level, grant_period, remarks) VALUES ({$no}, '{$ibmId}', '{$name}', '{$lbp}', '{$status}', '{$year}', '{$period}', '{$rem}');\n";
        }
        $sqlOut .= "\n";
    }

    // 5. GRADUATES
    $gStmt = $db->query("SELECT * FROM graduates");
    $grads = $gStmt->fetchAll();
    if (!empty($grads)) {
        $sqlOut .= "-- 5. Graduates (" . count($grads) . " records)\n";
        foreach ($grads as $g) {
            $ibmId = addslashes($g['ibm_id']);
            $name = addslashes($g['full_name']);
            $gender = addslashes($g['gender'] ?? '');
            $tribe = addslashes($g['tribe'] ?? '');
            $school = addslashes($g['school'] ?? '');
            $course = addslashes($g['course'] ?? '');
            $brgy = addslashes($g['barangay'] ?? '');
            $gradYear = addslashes($g['grad_year'] ?? '');
            $honor = addslashes($g['honor'] ?? '');
            $sqlOut .= "INSERT INTO public.graduates (ibm_id, full_name, gender, tribe, school, course, barangay, grad_year, honor) VALUES ('{$ibmId}', '{$name}', '{$gender}', '{$tribe}', '{$school}', '{$course}', '{$brgy}', '{$gradYear}', '{$honor}') ON CONFLICT (ibm_id) DO NOTHING;\n";
        }
        $sqlOut .= "\n";
    }

    file_put_contents($outputSqlFile, $sqlOut);
    echo "SUCCESS: Exported PostgreSQL seed file to: {$outputSqlFile} (" . strlen($sqlOut) . " bytes)\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

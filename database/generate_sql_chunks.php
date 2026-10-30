<?php
/**
 * Generate split, clean, UTF-8 normalized SQL chunk files for Supabase SQL Editor
 */

function sanitizeForSql($str) {
    if ($str === null) return '';
    // Normalize unicode: en-dash, em-dash, non-breaking spaces, curly quotes
    $str = str_replace(
        ["\xC2\xA0", "\xE2\x80\x93", "\xE2\x80\x94", "\xE2\x80\x98", "\xE2\x80\x99", "\xE2\x80\x9C", "\xE2\x80\x9D"],
        [" ", "-", "-", "'", "'", '"', '"'],
        $str
    );
    return str_replace("'", "''", trim($str));
}

$seedsDir = __DIR__ . '/seeds';

// 1. Semesters & Payroll
$semesters = json_decode(file_get_contents("$seedsDir/semesters.json"), true);
$payroll = json_decode(file_get_contents("$seedsDir/payroll.json"), true);

$sql1 = "-- IBMS Part 1: Semesters and Payroll Records\n";
foreach ($semesters as $s) {
    $name = sanitizeForSql($s['semester_name']);
    $order = (int)$s['semester_order'];
    $act = $s['is_active'] ? 'TRUE' : 'FALSE';
    $sql1 .= "INSERT INTO public.semesters (semester_name, semester_order, is_active) VALUES ('{$name}', {$order}, {$act}) ON CONFLICT (semester_name) DO NOTHING;\n";
}
foreach ($payroll as $p) {
    $no = (int)$p['no'];
    $ibm = sanitizeForSql($p['ibm_id']);
    $fn = sanitizeForSql($p['full_name']);
    $lbp = sanitizeForSql($p['lbp_account']);
    $st = sanitizeForSql($p['status']);
    $yl = sanitizeForSql($p['year_level']);
    $gp = sanitizeForSql($p['grant_period']);
    $rem = sanitizeForSql($p['remarks']);
    $sql1 .= "INSERT INTO public.payroll (no, ibm_id, full_name, lbp_account, status, year_level, grant_period, remarks) VALUES ({$no}, '{$ibm}', '{$fn}', '{$lbp}', '{$st}', '{$yl}', '{$gp}', '{$rem}') ON CONFLICT (ibm_id) DO NOTHING;\n";
}
file_put_contents("$seedsDir/01_semesters_and_payroll.sql", $sql1);
echo "Generated 01_semesters_and_payroll.sql (" . strlen($sql1) . " bytes)\n";

// 2. Scholars (Split into 2 parts of ~1,187 each to stay well under 500 KB!)
$scholars = json_decode(file_get_contents("$seedsDir/scholars.json"), true);
$halfScholars = ceil(count($scholars) / 2);
$schPart1 = array_slice($scholars, 0, $halfScholars);
$schPart2 = array_slice($scholars, $halfScholars);

function generateScholarsSql($items, $partNum) {
    $sql = "-- IBMS Part 2.{$partNum}: Scholars (" . count($items) . " records)\n";
    foreach ($items as $s) {
        $ctrl = (int)$s['control_no'];
        $ibm = sanitizeForSql($s['ibm_id']);
        $sy = sanitizeForSql($s['school_year']);
        $ln = sanitizeForSql($s['last_name']);
        $fn = sanitizeForSql($s['first_name']);
        $mn = sanitizeForSql($s['middle_name']);
        $sex = sanitizeForSql($s['sex']);
        $crs = sanitizeForSql($s['course']);
        $sch = sanitizeForSql($s['school']);
        $brgy = sanitizeForSql($s['barangay']);
        $schId = sanitizeForSql($s['school_id']);
        $cnt = sanitizeForSql($s['contact']);
        $trb = sanitizeForSql($s['tribe']);
        $yl = sanitizeForSql($s['year_level']);
        $st = sanitizeForSql($s['status']);
        $rem = sanitizeForSql($s['remarks']);
        $remDate = !empty($s['removal_date']) ? "'" . sanitizeForSql($s['removal_date']) . "'" : "NULL";
        $scCount = (int)$s['semester_count'];
        $lbp = sanitizeForSql($s['lbp_account']);
        $syStart = sanitizeForSql($s['starting_year']);

        $sql .= "INSERT INTO public.scholars (control_no, ibm_id, school_year, last_name, first_name, middle_name, sex, course, school, barangay, school_id, contact, tribe, year_level, status, remarks, removal_date, semester_count, lbp_account, starting_year) VALUES ({$ctrl}, '{$ibm}', '{$sy}', '{$ln}', '{$fn}', '{$mn}', '{$sex}', '{$crs}', '{$sch}', '{$brgy}', '{$schId}', '{$cnt}', '{$trb}', '{$yl}', '{$st}', '{$rem}', {$remDate}, {$scCount}, '{$lbp}', '{$syStart}') ON CONFLICT (ibm_id) DO NOTHING;\n";
    }
    return $sql;
}

$sqlSch1 = generateScholarsSql($schPart1, 1);
file_put_contents("$seedsDir/02_scholars_part1.sql", $sqlSch1);
echo "Generated 02_scholars_part1.sql (" . strlen($sqlSch1) . " bytes)\n";

$sqlSch2 = generateScholarsSql($schPart2, 2);
file_put_contents("$seedsDir/02_scholars_part2.sql", $sqlSch2);
echo "Generated 02_scholars_part2.sql (" . strlen($sqlSch2) . " bytes)\n";

// 3. Scholar Semesters (Split into 3 parts of ~4,630 each)
$ssList = json_decode(file_get_contents("$seedsDir/scholar_semesters.json"), true);
$chunkSize = 4650;
$ssChunks = array_chunk($ssList, $chunkSize);

foreach ($ssChunks as $idx => $chunk) {
    $part = $idx + 1;
    $sqlSS = "-- IBMS Part 3.{$part}: Scholar Semesters (" . count($chunk) . " records)\n";
    foreach ($chunk as $row) {
        $ibm = sanitizeForSql($row['ibm_id']);
        $sem = sanitizeForSql($row['semester_name']);
        $st = sanitizeForSql($row['status']);
        $sqlSS .= "INSERT INTO public.scholar_semesters (ibm_id, semester_name, status) VALUES ('{$ibm}', '{$sem}', '{$st}') ON CONFLICT (ibm_id, semester_name) DO UPDATE SET status = EXCLUDED.status;\n";
    }
    file_put_contents("$seedsDir/03_scholar_semesters_part{$part}.sql", $sqlSS);
    echo "Generated 03_scholar_semesters_part{$part}.sql (" . strlen($sqlSS) . " bytes)\n";
}

// 4. Graduates
$grads = json_decode(file_get_contents("$seedsDir/graduates.json"), true);
$sqlGrad = "-- IBMS Part 4: Graduates (" . count($grads) . " records)\n";
foreach ($grads as $g) {
    $ibm = sanitizeForSql($g['ibm_id']);
    $fn = sanitizeForSql($g['full_name']);
    $gen = sanitizeForSql($g['gender']);
    $trb = sanitizeForSql($g['tribe']);
    $sch = sanitizeForSql($g['school']);
    $crs = sanitizeForSql($g['course']);
    $brgy = sanitizeForSql($g['barangay']);
    $gy = sanitizeForSql($g['grad_year']);
    $hnr = sanitizeForSql($g['honor']);
    $sqlGrad .= "INSERT INTO public.graduates (ibm_id, full_name, gender, tribe, school, course, barangay, grad_year, honor) VALUES ('{$ibm}', '{$fn}', '{$gen}', '{$trb}', '{$sch}', '{$crs}', '{$brgy}', '{$gy}', '{$hnr}') ON CONFLICT (ibm_id) DO NOTHING;\n";
}
file_put_contents("$seedsDir/04_graduates.sql", $sqlGrad);
echo "Generated 04_graduates.sql (" . strlen($sqlGrad) . " bytes)\n";

echo "All chunked SQL files created cleanly!\n";

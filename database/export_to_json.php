<?php
/**
 * Export MySQL data to clean JSON batches for Supabase seeding
 */
require_once __DIR__ . '/../config/db.php';
$pdo = getDB();

$outDir = __DIR__ . '/seeds';
if (!is_dir($outDir)) {
    mkdir($outDir, 0777, true);
}

// 1. Semesters
$stmt = $pdo->query("SELECT semester_name, semester_order, is_active FROM semesters ORDER BY semester_order ASC, id ASC");
$semesters = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($semesters as &$s) {
    $s['semester_order'] = (int)($s['semester_order'] ?? 0);
    $s['is_active'] = !empty($s['is_active']);
}
file_put_contents("$outDir/semesters.json", json_encode($semesters, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Exported " . count($semesters) . " semesters.\n";

// 2. Scholars
$stmt = $pdo->query("SELECT * FROM scholars ORDER BY control_no ASC");
$scholars = $stmt->fetchAll(PDO::FETCH_ASSOC);
$cleanScholars = [];
foreach ($scholars as $row) {
    $cleanScholars[] = [
        'control_no' => (int)($row['control_no'] ?? 0),
        'ibm_id' => trim($row['ibm_id'] ?? ''),
        'school_year' => trim($row['school_year'] ?? ''),
        'last_name' => trim($row['last_name'] ?? ''),
        'first_name' => trim($row['first_name'] ?? ''),
        'middle_name' => trim($row['middle_name'] ?? ''),
        'sex' => trim($row['sex'] ?? ''),
        'course' => trim($row['course'] ?? ''),
        'school' => trim($row['school'] ?? ''),
        'barangay' => trim($row['barangay'] ?? ''),
        'school_id' => trim($row['school_id'] ?? ''),
        'contact' => trim($row['contact'] ?? ''),
        'email' => '',
        'tribe' => trim($row['tribe'] ?? ''),
        'year_level' => trim($row['year_level'] ?? '1st Year'),
        'status' => trim($row['status'] ?? 'ACTIVE'),
        'remarks' => trim($row['remarks'] ?? ''),
        'removal_date' => (!empty($row['removal_date']) && $row['removal_date'] !== '0000-00-00') ? $row['removal_date'] : null,
        'semester_count' => (int)($row['semester_count'] ?? 0),
        'lbp_account' => trim($row['lbp_account'] ?? ''),
        'starting_year' => trim($row['starting_year'] ?? '')
    ];
}
file_put_contents("$outDir/scholars.json", json_encode($cleanScholars, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Exported " . count($cleanScholars) . " scholars.\n";

// 3. Scholar Semesters
$stmt = $pdo->query("SELECT ibm_id, semester_name, status FROM scholar_semesters ORDER BY id ASC");
$scholarSemesters = $stmt->fetchAll(PDO::FETCH_ASSOC);
$cleanScholarSemesters = [];
foreach ($scholarSemesters as $ss) {
    $cleanScholarSemesters[] = [
        'ibm_id' => trim($ss['ibm_id']),
        'semester_name' => trim($ss['semester_name']),
        'status' => trim($ss['status'])
    ];
}
file_put_contents("$outDir/scholar_semesters.json", json_encode($cleanScholarSemesters, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Exported " . count($cleanScholarSemesters) . " scholar semester records.\n";

// 4. Payroll
$stmt = $pdo->query("SELECT * FROM payroll ORDER BY no ASC");
$payroll = $stmt->fetchAll(PDO::FETCH_ASSOC);
$cleanPayroll = [];
foreach ($payroll as $p) {
    $cleanPayroll[] = [
        'no' => (int)($p['no'] ?? 0),
        'ibm_id' => trim($p['ibm_id'] ?? ''),
        'full_name' => trim($p['full_name'] ?? ''),
        'lbp_account' => trim($p['lbp_account'] ?? ''),
        'status' => trim($p['status'] ?? 'ACTIVE'),
        'year_level' => trim($p['year_level'] ?? ''),
        'grant_period' => trim($p['grant_period'] ?? ''),
        'remarks' => trim($p['remarks'] ?? '')
    ];
}
file_put_contents("$outDir/payroll.json", json_encode($cleanPayroll, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Exported " . count($cleanPayroll) . " payroll records.\n";

// 5. Graduates
$stmt = $pdo->query("SELECT * FROM graduates ORDER BY id ASC");
$graduates = $stmt->fetchAll(PDO::FETCH_ASSOC);
$cleanGraduates = [];
foreach ($graduates as $g) {
    $cleanGraduates[] = [
        'ibm_id' => trim($g['ibm_id'] ?? ''),
        'full_name' => trim($g['full_name'] ?? ''),
        'gender' => trim($g['gender'] ?? ''),
        'tribe' => trim($g['tribe'] ?? ''),
        'school' => trim($g['school'] ?? ''),
        'course' => trim($g['course'] ?? ''),
        'barangay' => trim($g['barangay'] ?? ''),
        'grad_year' => trim($g['grad_year'] ?? ''),
        'honor' => trim($g['honor'] ?? '')
    ];
}
file_put_contents("$outDir/graduates.json", json_encode($cleanGraduates, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Exported " . count($cleanGraduates) . " graduate records.\n";

echo "All seed JSON files exported to database/seeds/ successfully!\n";

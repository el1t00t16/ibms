<?php
/**
 * IBMS Data Import Tool
 * Imports 'ibms-database from sheet.xlsx' into MySQL database (ibms_db)
 * Supports multi-sheet import: 'ibms-db', 'Payroll Data', and 'graduatesDb'.
 * Supports both CLI and Web execution with real-time progress summary.
 */

// Set generous limits for processing 3,000+ records
ini_set('memory_limit', '512M');
set_time_limit(300);

require_once __DIR__ . '/config/db.php';

$xlsxFile = __DIR__ . '/ibms-database from sheet.xlsx';
if (!file_exists($xlsxFile)) {
    // Fallback search in parent directory or current directory
    $xlsxFile = 'd:/IBM-Latin/IBMS/ibms-database from sheet.xlsx';
}
if (!file_exists($xlsxFile)) {
    $xlsxFile = 'C:/xampp/htdocs/ibms/ibms-database from sheet.xlsx';
}

$isCli = (php_sapi_name() === 'cli');
$output = [];

function logMsg($msg) {
    global $isCli, $output;
    $output[] = $msg;
    if ($isCli) {
        echo $msg . PHP_EOL;
    }
}

logMsg("==========================================================");
logMsg("           IBMS EXCEL DATABASE IMPORT TOOL");
logMsg("==========================================================");

if (!file_exists($xlsxFile)) {
    logMsg("[ERROR] File 'ibms-database from sheet.xlsx' not found at {$xlsxFile}");
    if (!$isCli) renderWeb($output, 'danger');
    exit(1);
}

try {
    $db = getDB();
    logMsg("[1/6] Connected to MySQL database (`" . DB_NAME . "`) successfully.");

    $zip = new ZipArchive();
    if ($zip->open($xlsxFile) !== true) {
        throw new Exception("Unable to extract XLSX openxml archive.");
    }

    // 1. Load Shared Strings
    logMsg("[2/6] Reading shared strings cache & sheet layout...");
    $sharedStrings = [];
    if ($zip->locateName('xl/sharedStrings.xml') !== false) {
        $xml = simplexml_load_string($zip->getFromName('xl/sharedStrings.xml'));
        foreach ($xml->si as $val) {
            if (isset($val->t)) {
                $sharedStrings[] = (string)$val->t;
            } elseif (isset($val->r)) {
                $text = '';
                foreach ($val->r as $r) { $text .= (string)$r->t; }
                $sharedStrings[] = $text;
            } else {
                $sharedStrings[] = '';
            }
        }
    }
    logMsg("  -> Loaded " . count($sharedStrings) . " unique shared strings.");

    // Resolve Sheets dynamically from workbook.xml and rels
    $wbXml = simplexml_load_string($zip->getFromName('xl/workbook.xml'));
    $relsXml = simplexml_load_string($zip->getFromName('xl/_rels/workbook.xml.rels'));

    $relMap = [];
    foreach ($relsXml->Relationship as $rel) {
        $relMap[(string)$rel['Id']] = (string)$rel['Target'];
    }

    $sheetTargets = [];
    foreach ($wbXml->sheets->sheet as $sh) {
        $name = (string)$sh['name'];
        $rId = (string)$sh->attributes('http://schemas.openxmlformats.org/officeDocument/2006/relationships')['id'];
        $target = $relMap[$rId] ?? '';
        if ($target && !str_starts_with($target, 'xl/')) {
            $target = 'xl/' . $target;
        }
        $sheetTargets[$name] = $target;
    }

    $masterTarget = $sheetTargets['ibms-db'] ?? ($sheetTargets['Database'] ?? '');
    $payrollTarget = $sheetTargets['Payroll Data'] ?? ($sheetTargets['PAYROLL'] ?? ($sheetTargets['Payroll'] ?? ''));
    $graduatesTarget = $sheetTargets['graduatesDb'] ?? ($sheetTargets['Graduates'] ?? ($sheetTargets['Alumni'] ?? ''));

    if (!$masterTarget) {
        throw new Exception("Masterlist sheet 'ibms-db' not found in workbook.");
    }

    function colLetterToNum($letter) {
        $num = 0;
        for ($i = 0; $i < strlen($letter); $i++) {
            $num = $num * 26 + (ord($letter[$i]) - 64);
        }
        return $num;
    }

    function parseRowCells($r, &$sharedStrings) {
        $cells = [];
        foreach ($r->c as $c) {
            $ref = (string)$c['r'];
            preg_match('/^([A-Z]+)(\d+)$/', $ref, $m);
            $colIdx = colLetterToNum($m[1]);
            $type = (string)$c['t'];
            $val = (string)$c->v;
            if ($type === 's') $val = $sharedStrings[(int)$val] ?? '';
            elseif ($type === 'inlineStr' && isset($c->is->t)) $val = (string)$c->is->t;
            $cells[$colIdx] = trim($val);
        }
        return $cells;
    }

    // 2. Open Main Masterlist Sheet
    logMsg("[3/6] Extracting columns & semesters from Masterlist ('ibms-db')...");
    $sheetXml = simplexml_load_string($zip->getFromName($masterTarget));

    $headers = [];
    $semestersList = [];

    foreach ($sheetXml->sheetData->row as $r) {
        $rowNum = (int)$r['r'];
        if ($rowNum === 1) {
            $headers = parseRowCells($r, $sharedStrings);
            foreach ($headers as $colIdx => $val) {
                if ($colIdx >= 20 && !empty($val)) {
                    $semestersList[$colIdx] = $val;
                }
            }
            break;
        }
    }

    logMsg("  -> Found " . count($semestersList) . " semester periods.");

    $db->exec("SET FOREIGN_KEY_CHECKS=0;");
    $db->exec("TRUNCATE TABLE semesters;");

    // Insert Semesters
    $semIns = $db->prepare("
        INSERT INTO semesters (semester_name, semester_order, is_active)
        VALUES (?, ?, ?)
    ");

    $semOrder = 1;
    $latestSem = '';
    $totalSems = count($semestersList);
    foreach ($semestersList as $colIdx => $semName) {
        $isActive = ($semOrder === $totalSems) ? 1 : 0;
        if ($isActive) $latestSem = $semName;
        $semIns->execute([$semName, $semOrder, $isActive]);
        $semOrder++;
    }

    // 3. Import Scholars and Histories
    logMsg("[4/6] Importing Scholars and Semester Progression records...");
    $db->exec("TRUNCATE TABLE scholars;");
    $db->exec("TRUNCATE TABLE scholar_semesters;");

    $scholarStmt = $db->prepare("
        INSERT INTO scholars (
            control_no, ibm_id, school_year, last_name, first_name, middle_name,
            sex, course, school, barangay, school_id, contact, tribe,
            year_level, status, remarks, semester_count, lbp_account, starting_year
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $semRecordStmt = $db->prepare("
        INSERT INTO scholar_semesters (ibm_id, semester_name, status)
        VALUES (?, ?, ?)
    ");

    $db->beginTransaction();
    $importedCount = 0;
    $skippedCount = 0;

    foreach ($sheetXml->sheetData->row as $r) {
        $rowNum = (int)$r['r'];
        if ($rowNum === 1) continue;

        $rowCells = parseRowCells($r, $sharedStrings);
        $controlNo = !empty($rowCells[1]) ? (int)$rowCells[1] : 0;
        $ibmId = $rowCells[2] ?? '';

        if (empty($ibmId) && $controlNo === 0) {
            $skippedCount++;
            continue;
        }

        $schoolYear = $rowCells[3] ?? '';
        $lastName = $rowCells[4] ?? '';
        $firstName = $rowCells[5] ?? '';
        $middleName = $rowCells[6] ?? '';
        $sex = $rowCells[7] ?? '';
        $course = $rowCells[8] ?? '';
        $school = $rowCells[9] ?? '';
        $barangay = $rowCells[10] ?? '';
        $schoolId = $rowCells[11] ?? '';
        $contact = $rowCells[12] ?? '';
        $tribe = $rowCells[13] ?? '';
        $yearLevel = $rowCells[14] ?? '';
        $status = !empty($rowCells[15]) ? strtoupper($rowCells[15]) : 'ACTIVE';
        $remarks = $rowCells[16] ?? '';
        $semesterCount = !empty($rowCells[17]) ? (int)$rowCells[17] : 0;
        $lbpAccount = $rowCells[18] ?? '';
        $startingYear = $rowCells[19] ?? '';

        $scholarStmt->execute([
            $controlNo,
            $ibmId,
            $schoolYear,
            $lastName,
            $firstName,
            $middleName,
            $sex,
            $course,
            $school,
            $barangay,
            $schoolId,
            $contact,
            $tribe,
            $yearLevel,
            $status,
            $remarks,
            $semesterCount,
            $lbpAccount,
            $startingYear
        ]);

        // Insert Semester Records
        foreach ($semestersList as $colIdx => $semName) {
            $cellVal = $rowCells[$colIdx] ?? '';
            if (!empty($cellVal)) {
                $semRecordStmt->execute([$ibmId, $semName, $cellVal]);
            }
        }

        $importedCount++;
        if ($importedCount % 500 === 0) {
            logMsg("  -> Processed {$importedCount} scholars...");
        }
    }
    $db->commit();
    logMsg("  -> Successfully imported {$importedCount} master scholars.");

    // 4. Populate Payroll Table
    logMsg("[5/6] Enrolling Scholars into Payroll Registry...");
    $db->exec("TRUNCATE TABLE payroll;");

    $payrollCount = 0;
    if ($payrollTarget && ($pXmlContent = $zip->getFromName($payrollTarget)) !== false) {
        $pSheetXml = simplexml_load_string($pXmlContent);
        $payIns = $db->prepare("
            INSERT INTO payroll (`no`, ibm_id, full_name, lbp_account, status, year_level, grant_period, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $db->beginTransaction();
        foreach ($pSheetXml->sheetData->row as $r) {
            $rowNum = (int)$r['r'];
            if ($rowNum === 1) continue;

            $cells = parseRowCells($r, $sharedStrings);
            $no = !empty($cells[1]) ? (int)$cells[1] : 0;
            $ibmId = $cells[2] ?? '';
            $fullName = $cells[3] ?? '';
            $lbp = $cells[4] ?? '';
            $status = !empty($cells[5]) ? strtoupper($cells[5]) : 'ACTIVE';
            $yearLevel = $cells[6] ?? '';
            $grantPeriod = $cells[7] ?? $latestSem;
            $remarks = $cells[8] ?? '';
            $approvedCorrection = $cells[9] ?? '';

            if (empty($ibmId) && empty($fullName)) continue;

            if (!empty($approvedCorrection)) {
                $remarks = !empty($remarks) ? "{$remarks} | {$approvedCorrection}" : $approvedCorrection;
            }

            $payIns->execute([
                $no,
                $ibmId,
                $fullName,
                $lbp,
                $status,
                $yearLevel,
                $grantPeriod,
                $remarks
            ]);
            $payrollCount++;
        }
        $db->commit();
        logMsg("  -> Enrolled {$payrollCount} scholars directly from 'Payroll Data' sheet with official payroll numbers!");
    } else {
        // Fallback: Populate by control_no/id ASC (entry sequence), NOT alphabetical
        logMsg("  -> [Notice] 'Payroll Data' sheet not found; generating by registration order...");
        $payStmt = $db->prepare("
            INSERT INTO payroll (`no`, ibm_id, full_name, lbp_account, status, year_level, grant_period, remarks)
            SELECT 
                ROW_NUMBER() OVER (ORDER BY s.control_no ASC, s.id ASC) as `no`,
                s.ibm_id,
                TRIM(CONCAT(s.first_name, ' ', IF(s.middle_name != '', CONCAT(SUBSTRING(s.middle_name, 1, 1), '. '), ''), s.last_name)) as full_name,
                s.lbp_account,
                s.status,
                s.year_level,
                ss.semester_name,
                s.remarks
            FROM scholar_semesters ss
            JOIN scholars s ON ss.ibm_id = s.ibm_id
            WHERE ss.semester_name = ? AND ss.status = 'OK'
            ORDER BY s.control_no ASC, s.id ASC
        ");
        $payStmt->execute([$latestSem]);
        $payrollCount = (int)$db->query("SELECT COUNT(*) FROM payroll")->fetchColumn();
        logMsg("  -> Enrolled {$payrollCount} scholars into payroll in registration sequence.");
    }

    // 5. Populate Graduates / Alumni Table
    logMsg("[6/6] Importing Graduates & Alumni Database...");
    $db->exec("TRUNCATE TABLE graduates;");

    $gradCount = 0;
    if ($graduatesTarget && ($gXmlContent = $zip->getFromName($graduatesTarget)) !== false) {
        $gSheetXml = simplexml_load_string($gXmlContent);
        $gradIns = $db->prepare("
            INSERT INTO graduates (
                ibm_id, full_name, gender, tribe, school, course, barangay,
                grad_year, year_graduated, honor, employment_status, company, contact, email,
                grad_photo, work_photo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        // Dynamically find Year column index from header row
        $yearColIdx = 8; // Default Col H
        foreach ($gSheetXml->sheetData->row as $r) {
            $rowNum = (int)$r['r'];
            if ($rowNum === 1) {
                $hCells = parseRowCells($r, $sharedStrings);
                foreach ($hCells as $idx => $hText) {
                    if (preg_match('/^year(\s*graduated)?$/i', trim($hText))) {
                        $yearColIdx = $idx;
                        break;
                    }
                }
                break;
            }
        }

        $db->beginTransaction();
        foreach ($gSheetXml->sheetData->row as $r) {
            $rowNum = (int)$r['r'];
            if ($rowNum === 1) continue;

            $cells = parseRowCells($r, $sharedStrings);
            $ibmId = $cells[1] ?? '';
            $fullName = $cells[2] ?? '';

            if (empty($ibmId) && empty($fullName)) continue;

            $gender = $cells[3] ?? '';
            $tribe = $cells[4] ?? '';
            $school = $cells[5] ?? '';
            $course = $cells[6] ?? '';
            $barangay = $cells[7] ?? '';
            $gradYear = $cells[$yearColIdx] ?? ($cells[8] ?? '');
            $honor = $cells[9] ?? '';
            $empStatus = $cells[10] ?? '';
            $company = $cells[11] ?? '';
            $contact = $cells[12] ?? '';
            $email = $cells[13] ?? '';
            $gradPhoto = $cells[14] ?? '';
            $workPhoto = $cells[15] ?? '';

            $gradIns->execute([
                $ibmId, $fullName, $gender, $tribe, $school, $course, $barangay,
                $gradYear, $gradYear, $honor, $empStatus, $company, $contact, $email,
                $gradPhoto, $workPhoto
            ]);
            $gradCount++;
        }
        $db->commit();
        logMsg("  -> Imported {$gradCount} alumni records directly from 'graduatesDb' sheet (Year Graduated mapped from Col {$yearColIdx})!");
    } else {
        // Fallback: Populate from scholars where status = 'GRADUATED'
        logMsg("  -> [Notice] 'graduatesDb' sheet not found; deriving from scholars with status='GRADUATED'...");
        $gradStmt = $db->prepare("
            INSERT INTO graduates (ibm_id, full_name, gender, tribe, school, course, barangay, grad_year, year_graduated, honor)
            SELECT 
                s.ibm_id,
                UPPER(TRIM(CONCAT(s.last_name, ', ', s.first_name, ' ', IF(s.middle_name != '', CONCAT(SUBSTRING(s.middle_name, 1, 1), '.'), '')))),
                s.sex,
                s.tribe,
                s.school,
                s.course,
                s.barangay,
                IF(s.school_year != '', RIGHT(s.school_year, 4), YEAR(CURDATE())),
                IF(s.school_year != '', RIGHT(s.school_year, 4), YEAR(CURDATE())),
                ''
            FROM scholars s
            WHERE s.status = 'GRADUATED'
        ");
        $gradStmt->execute();
        $gradCount = (int)$db->query("SELECT COUNT(*) FROM graduates")->fetchColumn();
        logMsg("  -> Populated {$gradCount} graduates from scholars table.");
    }

    $db->exec("SET FOREIGN_KEY_CHECKS=1;");
    $zip->close();

    logAction('IMPORT_DATA', "Imported {$importedCount} scholars, {$payrollCount} payroll entries, and {$gradCount} alumni from ibms-database from sheet.xlsx");

    logMsg("[SUCCESS] FULL MULTI-SHEET IMPORT COMPLETED!");
    logMsg("==========================================================");
    logMsg("Summary Statistics:");
    logMsg("  Total Scholars Imported: {$importedCount}");
    logMsg("  Active Payroll Enrolled: {$payrollCount} (Official Sheet Sequence)");
    logMsg("  Graduates/Alumni Loaded: {$gradCount}");
    logMsg("  Semesters Configured:    " . count($semestersList));
    logMsg("==========================================================");

    if (!$isCli) {
        renderWeb($output, 'success', $importedCount, $payrollCount, $gradCount);
    }

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    logMsg("[ERROR] " . $e->getMessage());
    if (!$isCli) {
        renderWeb($output, 'danger', 0, 0, 0);
    }
    exit(1);
}

function renderWeb($output, $status, $scholarCount = 0, $payrollCount = 0, $gradCount = 0) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IBMS - Excel Data Import</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #4f46e5;
                --success: #059669;
                --danger: #e11d48;
                --bg: #f8fafc;
                --surface: #ffffff;
                --border: #e2e8f0;
                --text-main: #0f172a;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
            body { background: var(--bg); color: var(--text-main); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
            .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); max-width: 680px; width: 100%; padding: 36px; }
            h1 { font-size: 1.6rem; font-weight: 800; margin-bottom: 8px; }
            p { font-size: 0.95rem; color: #475569; margin-bottom: 20px; }
            .terminal { background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 0.85rem; padding: 20px; border-radius: 12px; max-height: 350px; overflow-y: auto; line-height: 1.6; margin-bottom: 24px; }
            .stats-badges { display: flex; gap: 10px; margin-bottom: 20px; }
            .badge-stat { flex: 1; background: #f1f5f9; border: 1px solid var(--border); border-radius: 10px; padding: 12px; text-align: center; }
            .badge-stat .val { font-size: 1.3rem; font-weight: 800; color: var(--primary); }
            .badge-stat .lbl { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
            .btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 14px; font-size: 1rem; font-weight: 700; border-radius: 10px; border: none; text-decoration: none; cursor: pointer; }
            .btn-success { background: var(--success); color: white; }
            .btn-danger { background: var(--danger); color: white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Excel Multi-Sheet Import Result</h1>
            <p>Execution log for importing <code>ibms-database from sheet.xlsx</code> into MySQL.</p>
            
            <?php if ($status === 'success'): ?>
            <div class="stats-badges">
                <div class="badge-stat">
                    <div class="val"><?= number_format($scholarCount) ?></div>
                    <div class="lbl">Scholars</div>
                </div>
                <div class="badge-stat">
                    <div class="val" style="color: #059669;"><?= number_format($payrollCount) ?></div>
                    <div class="lbl">In Payroll</div>
                </div>
                <div class="badge-stat">
                    <div class="val" style="color: #7e22ce;"><?= number_format($gradCount) ?></div>
                    <div class="lbl">Alumni / Grads</div>
                </div>
            </div>
            <?php endif; ?>

            <div class="terminal">
                <?= implode("<br>", array_map('htmlspecialchars', $output)) ?>
            </div>
            <?php if ($status === 'success'): ?>
                <a href="index.php" class="btn btn-success">🚀 Open IBMS Portal (All Systems Ready)</a>
            <?php else: ?>
                <a href="install.php" class="btn btn-danger">Database Health Check</a>
            <?php endif; ?>
        </div>
    </body>
    </html>
    <?php
}

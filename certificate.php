<?php
/**
 * Certificate Generator & Printable View
 * e-Iskolar Bayan Management Portal - LGU Malungon
 */

require_once __DIR__ . '/config/db.php';

$scholarId = $_GET['scholarId'] ?? '';
$removalDate = $_GET['removalDate'] ?? '';

if (empty($scholarId)) {
    die("Error: Scholar ID is required to generate a certificate.");
}

$db = getDB();
$stmt = $db->prepare("SELECT * FROM scholars WHERE ibm_id = ?");
$stmt->execute([$scholarId]);
$scholar = $stmt->fetch();

if (!$scholar) {
    die("Error: Scholar with ID '{$scholarId}' not found.");
}

// Auto-fallback from database record if removalDate query param is missing or empty
if (empty($removalDate) || $removalDate === 'undefined') {
    if (!empty($scholar['removal_date']) && $scholar['removal_date'] !== '0000-00-00') {
        $removalDate = $scholar['removal_date'];
    } elseif (!empty($scholar['remarks'])) {
        if (preg_match('/\[(\d{4}-\d{2}-\d{2})\]/', $scholar['remarks'], $m)) {
            $removalDate = $m[1];
        } elseif (preg_match('/\[(\d{1,2})\/(\d{1,2})\/(\d{4})\]/', $scholar['remarks'], $m)) {
            $removalDate = sprintf('%04d-%02d-%02d', (int)$m[3], (int)$m[1], (int)$m[2]);
        }
    }
}
if (empty($removalDate)) {
    $removalDate = date('Y-m-d');
}

$mInitial = !empty($scholar['middle_name']) ? substr($scholar['middle_name'], 0, 1) . '.' : '';
$fullName = strtoupper(trim(implode(' ', array_filter([$scholar['first_name'], $mInitial, $scholar['last_name']]))));
$barangay = !empty($scholar['barangay']) ? $scholar['barangay'] : '_______________';

$removalDateFormatted = date('F j, Y', strtotime($removalDate));

$day = (int)date('j');
$month = date('F');
$year = date('Y');

$ends = ['th','st','nd','rd','th','th','th','th','th','th'];
if ((($day % 100) >= 11) && (($day % 100) <= 13)) {
    $ordinal = $day . 'th';
} else {
    $ordinal = $day . $ends[$day % 10];
}
$currentDateStr = "{$ordinal} day of {$month}, {$year}";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - <?= htmlspecialchars($scholar['last_name'] . ', ' . $scholar['first_name']) ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #1e3a8a;
            --gold: #b45309;
            --border: #cbd5e1;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: #64748b;
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px 10px;
            color: #0f172a;
        }
        .toolbar {
            position: fixed;
            top: 15px;
            z-index: 100;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(10px);
            padding: 10px 20px;
            border-radius: 50px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            display: flex;
            gap: 12px;
            align-items: center;
        }
        .toolbar button {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 0.9rem;
            font-weight: 700;
            border-radius: 30px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .toolbar button:hover { background: #4338ca; transform: translateY(-1px); }
        .toolbar .btn-close { background: #475569; }
        .toolbar .btn-close:hover { background: #334155; }

        .cert-page {
            width: 210mm;
            min-height: 297mm;
            background: #ffffff;
            box-shadow: 0 15px 35px rgba(0,0,0,0.25);
            position: relative;
            padding: 22mm 20mm;
            margin-top: 50px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        /* Certificate Borders */
        .cert-border-outer {
            position: absolute;
            inset: 12mm;
            border: 4px double #1e3a8a;
            pointer-events: none;
        }
        .cert-border-inner {
            position: absolute;
            inset: 15mm;
            border: 1px solid #d97706;
            pointer-events: none;
        }

        .cert-header {
            text-align: center;
            margin-bottom: 25px;
            position: relative;
            z-index: 2;
        }
        .cert-header .republic {
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #475569;
        }
        .cert-header .province {
            font-size: 0.85rem;
            font-weight: 600;
            color: #475569;
        }
        .cert-header .municipality {
            font-size: 1.15rem;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 2px;
        }
        .cert-header .office {
            font-size: 0.95rem;
            font-weight: 700;
            color: #1e3a8a;
            margin-top: 4px;
        }
        .cert-header .program {
            font-size: 0.85rem;
            font-weight: 800;
            color: #d97706;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-top: 2px;
        }

        .cert-title-container {
            text-align: center;
            margin: 30px 0 20px;
            position: relative;
        }
        .cert-title {
            font-family: 'Cinzel', serif;
            font-size: 2.2rem;
            font-weight: 800;
            color: #1e3a8a;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            line-height: 1.2;
        }
        .cert-subtitle {
            font-size: 0.9rem;
            font-weight: 600;
            letter-spacing: 0.15em;
            color: #64748b;
            text-transform: uppercase;
            margin-top: 6px;
        }

        .cert-body {
            font-size: 1.05rem;
            line-height: 1.8;
            color: #1e293b;
            text-align: justify;
            margin: 20px 0;
            position: relative;
            z-index: 2;
        }
        .cert-body p { margin-bottom: 20px; text-indent: 40px; }
        .cert-name {
            font-family: 'Playfair Display', serif;
            font-size: 1.7rem;
            font-weight: 700;
            color: #0f172a;
            text-align: center;
            text-decoration: underline;
            text-underline-offset: 6px;
            margin: 20px 0 10px;
            letter-spacing: 0.02em;
        }
        .cert-id {
            text-align: center;
            font-family: monospace;
            font-size: 1rem;
            font-weight: 800;
            color: #4f46e5;
            margin-bottom: 25px;
        }

        .cert-footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            position: relative;
            z-index: 2;
        }
        .signature-block {
            text-align: center;
            width: 250px;
        }
        .signature-line {
            border-top: 1.5px solid #0f172a;
            margin-top: 60px;
            padding-top: 6px;
        }
        .signature-name {
            font-weight: 800;
            font-size: 0.95rem;
            text-transform: uppercase;
            color: #0f172a;
        }
        .signature-title {
            font-size: 0.8rem;
            color: #475569;
            font-weight: 600;
        }

        .seal-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.04;
            pointer-events: none;
            width: 380px;
            height: 380px;
        }

        @media print {
            body { background: transparent; padding: 0; }
            .toolbar { display: none !important; }
            .cert-page {
                margin: 0;
                box-shadow: none;
                width: 100%;
                min-height: 100vh;
                page-break-after: avoid;
            }
            @page {
                size: A4 portrait;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <button onclick="window.print()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print / Save as PDF
        </button>
        <button class="btn-close" onclick="window.close()">Close Window</button>
    </div>

    <div class="cert-page">
        <div class="cert-border-outer"></div>
        <div class="cert-border-inner"></div>

        <!-- Watermark Seal -->
        <svg class="seal-watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
            <polygon points="12 6 14 10 18 10 15 13 16 17 12 14 8 17 9 13 6 10 10 10 12 6"></polygon>
        </svg>

        <div>
            <!-- Header -->
            <div class="cert-header">
                <div class="republic">Republic of the Philippines</div>
                <div class="province">Province of Sarangani</div>
                <div class="municipality">Municipality of Malungon</div>
                <div class="office">OFFICE OF THE MUNICIPAL MAYOR</div>
                <div class="program">e-Iskolar Bayan Management System (e-IBM)</div>
            </div>

            <!-- Title -->
            <div class="cert-title-container">
                <h1 class="cert-title">Certificate of Record</h1>
                <div class="cert-subtitle">Official Scholarship Certification</div>
            </div>

            <!-- Recipient Name -->
            <div class="cert-name"><?= htmlspecialchars($fullName) ?></div>
            <div class="cert-id">IBM ID: <?= htmlspecialchars($scholar['ibm_id']) ?></div>

            <!-- Body Text -->
            <div class="cert-body">
                <p>
                    <strong>TO WHOM IT MAY CONCERN:</strong>
                </p>
                <p>
                    THIS IS TO CERTIFY that <strong><?= htmlspecialchars($fullName) ?></strong>, a bona fide resident of Barangay <strong><?= htmlspecialchars($barangay) ?></strong>, Municipality of Malungon, Province of Sarangani, was an official beneficiary and recipient of the <strong>Iskolar Bayan ng Malungon (IBM) Program</strong> under the Local Government Unit of Malungon.
                </p>
                <p>
                    This further certifies that the above-named student was officially removed / separated from the active scholarship registry on <strong><?= htmlspecialchars($removalDateFormatted) ?></strong> in accordance with municipal guidelines and administrative records.
                </p>
                <p>
                    This certification is issued upon the request of the interested party for whatever legal purpose and intent it may serve best.
                </p>
                <p>
                    Given this <strong><?= htmlspecialchars($currentDateStr) ?></strong> at the Municipality of Malungon, Sarangani Province, Philippines.
                </p>
            </div>
        </div>

        <!-- Footer / Signatories -->
        <div class="cert-footer">
            <div class="signature-block">
                <div class="signature-line">
                    <div class="signature-name">ADMINISTRATIVE SECTION</div>
                    <div class="signature-title">Scholarship Focal Person</div>
                </div>
            </div>

            <div class="signature-block">
                <div class="signature-line">
                    <div class="signature-name">ATTY. MARIA THERESA D. CONSTANTINO</div>
                    <div class="signature-title">Municipal Mayor</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

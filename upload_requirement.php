<?php
/**
 * Requirement File Upload Handler
 * e-Iskolar Bayan Management Portal
 */

require_once __DIR__ . '/config/db.php';

$uploadDir = __DIR__ . '/uploads/requirements/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// If accessed as submission form
$message = '';
$isPost = $_SERVER['REQUEST_METHOD'] === 'POST';

if ($isPost) {
    try {
        $db = getDB();

        // Check if requirements portal is open
        $stmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'REQUIREMENTS_OPEN'");
        $isOpen = strtolower($stmt->fetchColumn() ?: 'false') === 'true';

        $semStmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'ACTIVE_SEMESTER'");
        $activeSemester = $semStmt->fetchColumn() ?: '';

        if (!$isOpen) {
            throw new Exception("The requirements portal is currently CLOSED for submissions.");
        }

        $ibmId = trim($_POST['ibm_id'] ?? '');
        $semester = trim($_POST['semester'] ?? $activeSemester);

        if (empty($ibmId)) throw new Exception("Please provide your IBM ID.");
        if (empty($semester)) throw new Exception("Please select a semester.");

        // Check scholar existence
        $schStmt = $db->prepare("SELECT * FROM scholars WHERE ibm_id = ?");
        $schStmt->execute([$ibmId]);
        $scholar = $schStmt->fetch();

        if (!$scholar) {
            throw new Exception("Scholar with ID '{$ibmId}' not found in the official registry.");
        }

        $mInitial = !empty($scholar['middle_name']) ? substr($scholar['middle_name'], 0, 1) . '.' : '';
        $fullName = implode(' ', array_filter([$scholar['first_name'], $mInitial, $scholar['last_name']]));

        // Handle uploaded file
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Please select a valid document (PDF, PNG, or JPG) to upload.");
        }

        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['pdf', 'jpg', 'jpeg', 'png'];

        if (!in_array($ext, $allowed)) {
            throw new Exception("Invalid file type ({$ext}). Only PDF, JPG, and PNG files are accepted.");
        }

        if ($file['size'] > 15 * 1024 * 1024) { // 15MB limit
            throw new Exception("File size exceeds 15MB maximum limit.");
        }

        $safeIbm = preg_replace('/[^a-zA-Z0-9_-]/', '', $ibmId);
        $fileName = 'REQ_' . $safeIbm . '_' . time() . '.' . $ext;
        $destPath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            throw new Exception("Failed to store uploaded file on the server.");
        }

        $fileUrl = 'uploads/requirements/' . $fileName;

        $ins = $db->prepare("
            INSERT INTO requirements (ibm_id, full_name, semester, file_url, status, remarks)
            VALUES (?, ?, ?, ?, 'PENDING', 'Uploaded via Student Submission Portal')
        ");
        $ins->execute([$ibmId, $fullName, $semester, $fileUrl]);

        logAction('UPLOAD_REQUIREMENT', "Submitted requirement for {$ibmId} ({$semester})", $fullName);

        if (isset($_GET['ajax']) || (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json'))) {
            echo json_encode(['success' => true, 'message' => 'Requirement submitted successfully!']);
            exit;
        }

        $message = "Your requirement was uploaded successfully! Our scholarship coordinators will verify your documents.";
        $status = "success";
    } catch (Exception $e) {
        if (isset($_GET['ajax']) || (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json'))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        }
        $message = $e->getMessage();
        $status = "danger";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IBMS - Submit Scholarship Requirements</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --bg: #f8fafc;
            --surface: #ffffff;
            --border: #e2e8f0;
            --text-main: #0f172a;
            --text-secondary: #475569;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: var(--bg); color: var(--text-main); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 480px; width: 100%; padding: 36px; }
        h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
        p { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5; }
        .alert { padding: 14px 18px; border-radius: 10px; font-size: 0.9rem; margin-bottom: 20px; }
        .alert-success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .alert-danger { background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; }
        .form-group { margin-bottom: 18px; }
        label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px; color: var(--text-main); }
        .form-control { width: 100%; padding: 12px 14px; font-size: 0.95rem; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
        .form-control:focus { outline: none; border-color: var(--primary); background: var(--surface); }
        .btn { width: 100%; padding: 14px; font-size: 1rem; font-weight: 700; border-radius: 10px; border: none; background: var(--primary); color: white; cursor: pointer; transition: background 0.2s; }
        .btn:hover { background: var(--primary-hover); }
    </style>
</head>
<body>
    <div class="card">
        <h1>Submit Requirement</h1>
        <p>Upload your Certificate of Grades or Enrollment for semester renewal.</p>

        <?php if ($message): ?>
            <div class="alert alert-<?= $status ?>"><?= htmlspecialchars($message) ?></div>
        <?php endif; ?>

        <form method="POST" enctype="multipart/form-data">
            <div class="form-group">
                <label for="ibm_id">Scholar IBM ID *</label>
                <input type="text" id="ibm_id" name="ibm_id" class="form-control" placeholder="e.g. IBM-25-26-00001" required>
            </div>

            <div class="form-group">
                <label for="file">Document (PDF or Image) *</label>
                <input type="file" id="file" name="file" class="form-control" accept=".pdf,.png,.jpg,.jpeg" required>
            </div>

            <button type="submit" class="btn">Upload Document</button>
        </form>
    </div>
</body>
</html>

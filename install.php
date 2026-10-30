<?php
/**
 * IBMS Database Installer & Health Check
 * e-Iskolar Bayan Management Portal
 */

require_once __DIR__ . '/config/db.php';

$message = '';
$status = 'info';
$installed = false;

if (isset($_POST['install']) || php_sapi_name() === 'cli') {
    try {
        $dsnNoDb = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
        $pdo = new PDO($dsnNoDb, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        $pdo->exec("USE `" . DB_NAME . "`;");
        
        $schemaPath = __DIR__ . '/database/schema.sql';
        if (!file_exists($schemaPath)) {
            throw new Exception("Schema file database/schema.sql not found.");
        }
        
        $schemaSql = file_get_contents($schemaPath);
        // Execute the schema queries
        $pdo->exec($schemaSql);
        
        $status = 'success';
        $message = "IBMS Database (`" . DB_NAME . "`) and all tables initialized successfully! Default administrator account is ready.";
        $installed = true;
    } catch (Exception $e) {
        $status = 'danger';
        $message = "Installation Error: " . $e->getMessage() . "<br><small>Tip: Make sure MySQL is running in your XAMPP Control Panel.</small>";
    }

    if (php_sapi_name() === 'cli') {
        echo ($status === 'success' ? "[SUCCESS] " : "[ERROR] ") . strip_tags($message) . PHP_EOL;
        exit($status === 'success' ? 0 : 1);
    }
} else {
    // Check if already installed
    try {
        $db = getDB();
        $check = $db->query("SHOW TABLES LIKE 'scholars'")->fetch();
        if ($check) {
            $status = 'success';
            $message = "IBMS Database is already installed and healthy. You can proceed directly to the portal!";
            $installed = true;
        }
    } catch (Exception $e) {
        // Not installed or MySQL stopped
        $status = 'warning';
        $message = "Database is not yet initialized. Click the button below to initialize `ibms_db` automatically.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IBMS System Installer</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --success: #059669;
            --danger: #e11d48;
            --warning: #d97706;
            --bg: #f8fafc;
            --surface: #ffffff;
            --border: #e2e8f0;
            --text-main: #0f172a;
            --text-secondary: #475569;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: var(--bg); color: var(--text-main); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .installer-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 540px; width: 100%; padding: 40px; }
        .logo-box { width: 56px; height: 56px; background: #e0e7ff; color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        h1 { font-size: 1.6rem; font-weight: 800; margin-bottom: 8px; }
        p { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px; }
        .alert { padding: 16px; border-radius: 10px; font-size: 0.9rem; line-height: 1.4; margin-bottom: 24px; }
        .alert-success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .alert-danger { background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; }
        .alert-warning { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .alert-info { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px 20px; font-size: 1rem; font-weight: 700; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-hover); }
        .btn-success { background: var(--success); color: white; }
        .cred-box { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 0.85rem; }
        .cred-row { display: flex; justify-content: space-between; padding: 4px 0; }
        .cred-row strong { color: var(--text-main); }
    </style>
</head>
<body>
    <div class="installer-card">
        <div class="logo-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
        </div>
        <h1>IBMS Database Installer</h1>
        <p>Sets up MySQL schema and initial configuration for the e-Iskolar Bayan Management Portal on XAMPP.</p>

        <?php if ($message): ?>
            <div class="alert alert-<?= $status ?>"><?= $message ?></div>
        <?php endif; ?>

        <div class="cred-box">
            <div style="font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; color: var(--text-secondary); font-size: 0.75rem;">Default Admin Credentials</div>
            <div class="cred-row"><span>Username:</span> <strong>admin</strong></div>
            <div class="cred-row"><span>Password:</span> <strong>admin123</strong> (or <strong>admin</strong>)</div>
            <div class="cred-row"><span>Database Name:</span> <strong>ibms_db</strong></div>
            <div class="cred-row"><span>Host / Port:</span> <strong>localhost:3306</strong></div>
        </div>

        <?php if ($installed): ?>
            <a href="index.php" class="btn btn-success">🚀 Open IBMS Portal</a>
        <?php else: ?>
            <form method="POST">
                <button type="submit" name="install" class="btn btn-primary">⚡ Initialize Database Now</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>

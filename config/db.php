<?php
/**
 * IBMS Database Connection Configuration
 * e-Iskolar Bayan Management Portal
 */

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'ibms_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// Optional Custom base URL detection
if (!defined('BASE_URL')) {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $scriptDir = dirname($_SERVER['SCRIPT_NAME'] ?? '');
    $scriptDir = rtrim(str_replace('\\', '/', $scriptDir), '/');
    define('BASE_URL', $protocol . $host . $scriptDir);
}

/**
 * Returns the singleton PDO database instance.
 * Automatically attempts to create the database if missing.
 */
function getDB() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // If database does not exist (error 1049), attempt to auto-create and run schema
        if ($e->getCode() == 1049) {
            try {
                $initDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
                $initPdo = new PDO($initDsn, DB_USER, DB_PASS, $options);
                $initPdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                
                $schemaFile = dirname(__DIR__) . '/database/schema.sql';
                if (file_exists($schemaFile)) {
                    $sql = file_get_contents($schemaFile);
                    $initPdo->exec("USE `" . DB_NAME . "`;");
                    $initPdo->exec($sql);
                }
                
                $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $initEx) {
                throw new Exception("Database connection failed and auto-initialization could not complete: " . $initEx->getMessage());
            }
        } else {
            throw new Exception("Database Connection Error: " . $e->getMessage());
        }
    }

    return $pdo;
}

/**
 * System Activity Logger (replaces logAction in code.gs)
 */
function logAction($action, $details, $user = null) {
    try {
        $db = getDB();
        if ($user === null) {
            if (session_status() === PHP_SESSION_NONE) {
                @session_start();
            }
            $user = $_SESSION['user']['username'] ?? 'System';
        }
        $stmt = $db->prepare("INSERT INTO activity_logs (`user`, `action`, `details`) VALUES (?, ?, ?)");
        $stmt->execute([$user, $action, $details]);
    } catch (Exception $e) {
        // Fail silently on logging errors so primary transactions are never aborted
        error_log("Logging error: " . $e->getMessage());
    }
}

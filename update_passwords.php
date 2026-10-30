<?php
require_once __DIR__ . '/config/db.php';

try {
    $db = getDB();
    $admin123Hash = password_hash('admin123', PASSWORD_BCRYPT);
    
    // Update or insert admin user
    $stmt = $db->prepare("UPDATE users SET password = ? WHERE username = 'admin'");
    $stmt->execute([$admin123Hash]);
    
    // Verify
    $chk = $db->prepare("SELECT password FROM users WHERE username = 'admin'");
    $chk->execute();
    $savedHash = $chk->fetchColumn();
    
    echo "Saved hash: " . $savedHash . "\n";
    echo "Verify admin123: " . (password_verify('admin123', $savedHash) ? "PASS" : "FAIL") . "\n";
    echo "Verify admin: " . (password_verify('admin', $savedHash) ? "PASS" : "FAIL") . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

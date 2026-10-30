-- ==========================================================
-- IBMS Database Schema (e-Iskolar Bayan Management Portal)
-- Compatible with MySQL 5.7+ / 8.0+ / MariaDB 10.3+ (XAMPP)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `ibms_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ibms_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) DEFAULT 'System Administrator',
    `role` VARCHAR(50) DEFAULT 'admin',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Semesters Table
CREATE TABLE IF NOT EXISTS `semesters` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `semester_name` VARCHAR(100) NOT NULL UNIQUE,
    `semester_order` INT NOT NULL DEFAULT 1,
    `is_active` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Scholars Master Table
CREATE TABLE IF NOT EXISTS `scholars` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `control_no` INT NOT NULL UNIQUE,
    `ibm_id` VARCHAR(50) NOT NULL UNIQUE,
    `school_year` VARCHAR(50) DEFAULT '',
    `last_name` VARCHAR(100) DEFAULT '',
    `first_name` VARCHAR(100) DEFAULT '',
    `middle_name` VARCHAR(100) DEFAULT '',
    `sex` VARCHAR(10) DEFAULT '',
    `course` VARCHAR(255) DEFAULT '',
    `school` VARCHAR(255) DEFAULT '',
    `barangay` VARCHAR(100) DEFAULT '',
    `school_id` VARCHAR(100) DEFAULT '',
    `contact` VARCHAR(100) DEFAULT '',
    `tribe` VARCHAR(100) DEFAULT '',
    `year_level` VARCHAR(50) DEFAULT '1st Year',
    `status` VARCHAR(50) DEFAULT 'ACTIVE',
    `remarks` TEXT,
    `removal_date` DATE DEFAULT NULL,
    `semester_count` INT DEFAULT 0,
    `lbp_account` VARCHAR(100) DEFAULT '',
    `starting_year` VARCHAR(50) DEFAULT '',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_ibm_id` (`ibm_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_barangay` (`barangay`),
    INDEX `idx_school` (`school`),
    INDEX `idx_year_level` (`year_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Scholar Semesters (Normalized Semesters History)
CREATE TABLE IF NOT EXISTS `scholar_semesters` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ibm_id` VARCHAR(50) NOT NULL,
    `semester_name` VARCHAR(100) NOT NULL,
    `status` VARCHAR(20) DEFAULT '',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_scholar_sem` (`ibm_id`, `semester_name`),
    INDEX `idx_sem_status` (`semester_name`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Payroll Registry Table
CREATE TABLE IF NOT EXISTS `payroll` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `no` INT NOT NULL,
    `ibm_id` VARCHAR(50) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `lbp_account` VARCHAR(100) DEFAULT '',
    `status` VARCHAR(50) DEFAULT 'ACTIVE',
    `year_level` VARCHAR(50) DEFAULT '',
    `grant_period` VARCHAR(100) DEFAULT '',
    `remarks` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_payroll_ibm_id` (`ibm_id`),
    INDEX `idx_payroll_period` (`grant_period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Graduates / Alumni Table
CREATE TABLE IF NOT EXISTS `graduates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ibm_id` VARCHAR(50) NOT NULL UNIQUE,
    `full_name` VARCHAR(255) NOT NULL,
    `gender` VARCHAR(10) DEFAULT '',
    `tribe` VARCHAR(100) DEFAULT '',
    `school` VARCHAR(255) DEFAULT '',
    `course` VARCHAR(255) DEFAULT '',
    `barangay` VARCHAR(100) DEFAULT '',
    `grad_year` VARCHAR(20) DEFAULT '',
    `year_graduated` VARCHAR(50) DEFAULT '',
    `honor` VARCHAR(100) DEFAULT '',
    `employment_status` VARCHAR(100) DEFAULT '',
    `company` VARCHAR(255) DEFAULT '',
    `contact` VARCHAR(100) DEFAULT '',
    `email` VARCHAR(150) DEFAULT '',
    `grad_photo` VARCHAR(255) DEFAULT '',
    `work_photo` VARCHAR(255) DEFAULT '',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Other Grants Table
CREATE TABLE IF NOT EXISTS `other_grants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ibm_id` VARCHAR(50) NOT NULL UNIQUE,
    `full_name` VARCHAR(255) NOT NULL,
    `gender` VARCHAR(10) DEFAULT '',
    `tribe` VARCHAR(100) DEFAULT '',
    `school` VARCHAR(255) DEFAULT '',
    `course` VARCHAR(255) DEFAULT '',
    `barangay` VARCHAR(100) DEFAULT '',
    `year` VARCHAR(20) DEFAULT '',
    `grant_name` VARCHAR(255) DEFAULT '',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Requirements Table
CREATE TABLE IF NOT EXISTS `requirements` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ibm_id` VARCHAR(50) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `semester` VARCHAR(100) NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'PENDING',
    `remarks` TEXT,
    INDEX `idx_req_ibm_id` (`ibm_id`),
    INDEX `idx_req_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. System Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
    `setting_key` VARCHAR(100) PRIMARY KEY,
    `setting_value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Activity Logs Table
CREATE TABLE IF NOT EXISTS `activity_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `user` VARCHAR(100) DEFAULT 'admin',
    `action` VARCHAR(100) NOT NULL,
    `details` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DEFAULT SEED DATA
-- ==========================================================

-- Default Admin User: admin / admin123
INSERT INTO `users` (`username`, `password`, `full_name`, `role`)
SELECT 'admin', '$2y$10$DDTUgT1MPlxozi2z4qlag.Om.wdY0saCXQ2Soz95R/zb8vEUQpMYS', 'Municipal Administrator', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `username` = 'admin');

-- Also allow plaintext fallback for quick setup if needed
INSERT INTO `users` (`username`, `password`, `full_name`, `role`)
SELECT 'ibms_admin', 'admin', 'IBMS Administrator', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `username` = 'ibms_admin');

-- Initial Settings
INSERT INTO `settings` (`setting_key`, `setting_value`)
VALUES 
    ('REQUIREMENTS_OPEN', 'false'),
    ('ACTIVE_SEMESTER', '2025-2026 1st Sem')
ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;

-- Initial Semesters
INSERT INTO `semesters` (`semester_name`, `semester_order`, `is_active`)
VALUES 
    ('2024-2025 1st Sem', 1, 0),
    ('2024-2025 2nd Sem', 2, 0),
    ('2025-2026 1st Sem', 3, 1)
ON DUPLICATE KEY UPDATE `semester_order`=VALUES(`semester_order`);

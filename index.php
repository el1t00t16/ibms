<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$isLoggedIn = !empty($_SESSION['user']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <base target="_top">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>e-IBM Portal | LGU Malungon Scholarship Management System</title>
    
    <!-- Modern SaaS Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Vendor Styles -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">

    <!-- Tailwind CSS Engine (Premium Modern Light Theme) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        malungon: {
                            navy: '#0c2340',
                            navyLight: '#16325c',
                            gold: '#d97706',
                            goldLight: '#fef3c7',
                            emerald: '#059669',
                            emeraldLight: '#d1fae5',
                        }
                    },
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                    },
                    boxShadow: {
                        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                        'card': '0 4px 20px -2px rgba(12, 35, 64, 0.05)',
                    }
                }
            }
        };
    </script>
    
    <!-- Modern LGU Design Tokens & Layout -->
    <link rel="stylesheet" href="assets/css/theme.css?v=<?= filemtime(__DIR__ . '/assets/css/theme.css') ?>">
    <link rel="stylesheet" href="assets/css/layout.css?v=<?= filemtime(__DIR__ . '/assets/css/layout.css') ?>">
    <link rel="stylesheet" href="assets/css/components.css?v=<?= filemtime(__DIR__ . '/assets/css/components.css') ?>">
    
    <!-- Core Legacy Styles & 100% Preserved Print Media Stylesheet -->
    <link rel="stylesheet" href="assets/css/stylesheet.css?v=<?= filemtime(__DIR__ . '/assets/css/stylesheet.css') ?>">
    
    <!-- Chart.js for Visual Data Analysis -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

<!-- UPDATED LOADER STRUCTURE (Preserved) -->
<div id="loader">
    <img src="assets/img/ibm-logo.png" alt="IBM Program" class="loader-logo">
    <div class="progress-wrapper">
        <div class="progress-bar" id="loaderBar"></div>
    </div>
    <div class="progress-text" id="loaderText">Processing... 0%</div>
</div>

<!-- MODERN SPLIT-SCREEN LOGIN PAGE -->
<div id="loginPage" style="display: <?= $isLoggedIn ? 'none' : 'flex' ?>;">
    <div class="login-split">
        <!-- Brand Panel (Left) -->
        <div class="login-brand">
            <div class="brand-bg-shapes"></div>
            <div class="brand-content">
                <!-- Civic Emblem -->
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 36px;">
                    <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3); box-shadow: var(--shadow-md);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    </div>
                    <div>
                        <span style="font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em; display: block; color: white;">LGU Malungon</span>
                        <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--civic-gold);">Province of Sarangani</span>
                    </div>
                </div>
                
                <h2>e-Iskolar Bayan Management Portal</h2>
                <p>Municipal scholarship operations platform. Streamline scholar verifications, automate Land Bank payroll disbursements, track cross-semester progression, and monitor alumni achievements.</p>
                
                <div style="margin-top: 40px; display: flex; gap: 20px; align-items: center; font-size: 0.8rem; color: rgba(255,255,255,0.75);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1rem;">🏛️</span>
                        <span>Mayor's Office</span>
                    </div>
                    <div>•</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1rem;">🎓</span>
                        <span>IBM Scholarship Section</span>
                    </div>
                </div>
            </div>
            <div class="brand-footer">
                &copy; <?= date('Y') ?> Municipality of Malungon. Developed for the e-Iskolar Bayan Program.
            </div>
        </div>
        
        <!-- Form Panel (Right) -->
        <div class="login-form-container">
            <div class="login-form-wrapper">
                
                <div style="width: 50px; height: 50px; background: rgba(12, 35, 64, 0.08); color: var(--malungon-navy); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                
                <h1 class="login-title">Administrator Sign In</h1>
                <p class="login-subtitle">Enter your official portal credentials to access the scholarship administration suite.</p>
                
                <form id="loginForm">
                    <div class="form-group text-left" style="margin-bottom: 16px;">
                        <label for="loginUser" style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: block;">Username</label>
                        <input type="text" id="loginUser" class="form-control" placeholder="admin" required autocomplete="username">
                    </div>
                    <div class="form-group text-left" style="margin-bottom: 24px;">
                        <label for="loginPass" style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: block;">Password</label>
                        <input type="password" id="loginPass" class="form-control" placeholder="••••••••" required autocomplete="current-password">
                    </div>
                    <button type="submit" id="loginSubmitBtn" class="btn btn-primary btn-login" style="background: var(--malungon-navy); border: none; font-weight: 700; padding: 12px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                        Secure Sign In
                    </button>
                </form>

                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--border-color); text-align: center;">
                    <a href="upload_requirement.php" target="_blank" style="font-size: 0.82rem; color: var(--malungon-navy); font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                        <span>🌐 Open Student Requirements Submission Portal</span>
                        <span>→</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- MAIN APP SHELL -->
<div class="app-layout" id="appLayout" style="display: <?= $isLoggedIn ? 'block' : 'none' ?>;">
    <div class="lgu-layout">
        <!-- Sidebar Navigation -->
        <?php include __DIR__ . '/components/sidebar.php'; ?>

        <!-- Main Wrapper (Header + Content) -->
        <div class="lgu-main-wrapper">
            <!-- Topbar Header -->
            <?php include __DIR__ . '/components/header.php'; ?>

            <!-- Dynamic Views Container -->
            <main class="lgu-content">
                <?php include __DIR__ . '/views/dashboard.php'; ?>
                <?php include __DIR__ . '/views/registry.php'; ?>
                <?php include __DIR__ . '/views/payroll.php'; ?>
                <?php include __DIR__ . '/views/reports.php'; ?>
                <?php include __DIR__ . '/views/requirements.php'; ?>
                <?php include __DIR__ . '/views/alumni.php'; ?>
                <?php include __DIR__ . '/views/other_grants.php'; ?>
                <?php include __DIR__ . '/views/audit_logs.php'; ?>
                <?php include __DIR__ . '/views/settings.php'; ?>
            </main>
        </div>
    </div>
</div>

<!-- SLIDE-OVER SCHOLAR QUICK DRAWER -->
<?php include __DIR__ . '/components/scholar_drawer.php'; ?>

<!-- MODALS -->
<?php include __DIR__ . '/components/modals/scholar_modal.php'; ?>
<?php include __DIR__ . '/components/modals/batch_modal.php'; ?>
<?php include __DIR__ . '/components/modals/batch_update_modal.php'; ?>
<?php include __DIR__ . '/components/modals/dismissal_modal.php'; ?>
<?php include __DIR__ . '/components/modals/payroll_modal.php'; ?>
<?php include __DIR__ . '/components/modals/view_modal.php'; ?>
<!-- 100% UNTOUCHED SACROSANCT PRINT MODAL -->
<?php include __DIR__ . '/components/modals/print_modal.php'; ?>

<!-- 100% UNTOUCHED SACROSANCT PRINT AREAS & DATALISTS -->
<?php include __DIR__ . '/components/print_areas.php'; ?>

<!-- SCRIPTS -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="assets/js/api-bridge.js?v=<?= filemtime(__DIR__ . '/assets/js/api-bridge.js') ?>"></script>
<script src="assets/js/admin.js?v=<?= filemtime(__DIR__ . '/assets/js/admin.js') ?>"></script>
<script src="assets/js/lgu-shell.js?v=<?= filemtime(__DIR__ . '/assets/js/lgu-shell.js') ?>"></script>

<!-- Auto-Initialize When Logged In -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    <?php if ($isLoggedIn): ?>
    if (typeof loadData === 'function') loadData();
    if (typeof loadSems === 'function') loadSems();
    <?php endif; ?>
});
</script>

</body>
</html>
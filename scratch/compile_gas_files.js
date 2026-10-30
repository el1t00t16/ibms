const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function cleanPhpTags(content) {
    // Strip <?php ... ?> or <?= ... ?>
    // Replace sidebar session tags
    let cleaned = content.replace(/<\?php[\s\S]*?\?>/g, '');
    cleaned = cleaned.replace(/<\?=\s*htmlspecialchars\(\$_SESSION\['user'\]\['full_name'\]\s*\?\?\s*'Administrator'\)\s*\?>/g, 'Administrator');
    cleaned = cleaned.replace(/<\?=\s*strtoupper\(substr\(\$_SESSION\['user'\]\['username'\]\s*\?\?\s*'A',\s*0,\s*1\)\)\s*\?>/g, 'A');
    cleaned = cleaned.replace(/<\?=\s*htmlspecialchars\(\$_SESSION\['user'\]\['role'\]\s*\?\?\s*'LGU Staff'\)\s*\?>/g, 'LGU Staff');
    cleaned = cleaned.replace(/<\?=\s*date\('Y'\)\s*\?>/g, '2026');
    cleaned = cleaned.replace(/<\?=\s*\$isLoggedIn\s*\?\s*'none'\s*:\s*'flex'\s*\?>/g, 'flex');
    cleaned = cleaned.replace(/<\?=\s*\$isLoggedIn\s*\?\s*'block'\s*:\s*'none'\s*\?>/g, 'none');
    cleaned = cleaned.replace(/<\?[\s\S]*?\?>/g, '');
    return cleaned.trim();
}

console.log('Compiling Google Apps Script files from workspace components...');

// ==========================================
// 1. COMPILE Stylesheet.html
// ==========================================
const themeCss = fs.readFileSync(path.join(rootDir, 'assets/css/theme.css'), 'utf8');
const layoutCss = fs.readFileSync(path.join(rootDir, 'assets/css/layout.css'), 'utf8');
const componentsCss = fs.readFileSync(path.join(rootDir, 'assets/css/components.css'), 'utf8');
const stylesheetCss = fs.readFileSync(path.join(rootDir, 'assets/css/stylesheet.css'), 'utf8');

const compiledStylesheet = `<style>
/* ==========================================================================
   IBMS MODERN LGU DESIGN SYSTEM - COMPILED STYLESHEET FOR APPS SCRIPT
   Municipality of Malungon, Sarangani Province
   ========================================================================== */

/* 1. THEME TOKENS */
${themeCss}

/* 2. LAYOUT & SIDEBAR SHELL */
${layoutCss}

/* 3. MODERN UI COMPONENTS & DRAWER */
${componentsCss}

/* 4. CORE APPLICATION & SACROSANCT PRINT MEDIA STYLES */
${stylesheetCss}

/* 5. GAS IFRAME PRINT ISOLATION RULES */
@media print {
  html, body {
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>
`;

fs.writeFileSync(path.join(rootDir, 'Stylesheet.html'), compiledStylesheet, 'utf8');
console.log('Successfully compiled Stylesheet.html (' + compiledStylesheet.length + ' bytes)');


// ==========================================
// 2. COMPILE adminJS.html
// ==========================================
const lguShellJs = fs.readFileSync(path.join(rootDir, 'assets/js/lgu-shell.js'), 'utf8');
const adminJs = fs.readFileSync(path.join(rootDir, 'assets/js/admin.js'), 'utf8');

const compiledAdminJS = `<script>
/* ==========================================================================
   IBMS CLIENT CONTROLLER & BUSINESS LOGIC - APPS SCRIPT BUNDLE
   Municipality of Malungon, Sarangani Province
   ========================================================================== */

/* 1. LGU MODERN PORTAL SHELL & CONTROLLER (Navigation, Drawer, Toasts, Analytics) */
${lguShellJs}

/* 2. CORE SCHOLARSHIP MANAGEMENT & BULLETPROOF PRINT ENGINE */
${adminJs}
</script>
`;

fs.writeFileSync(path.join(rootDir, 'adminJS.html'), compiledAdminJS, 'utf8');
console.log('Successfully compiled adminJS.html (' + compiledAdminJS.length + ' bytes)');


// ==========================================
// 3. COMPILE Portal.html
// ==========================================
const sidebarHtml = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/sidebar.php'), 'utf8'));
const headerHtml = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/header.php'), 'utf8'));
const drawerHtml = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/scholar_drawer.php'), 'utf8'));

// Views
const dashboardView = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'views/dashboard.php'), 'utf8'));
const registryView = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'views/registry.php'), 'utf8'));
const payrollView = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'views/payroll.php'), 'utf8'));
const reportsView = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'views/reports.php'), 'utf8'));
const requirementsView = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'views/requirements.php'), 'utf8'));
const alumniView = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'views/alumni.php'), 'utf8'));
const otherGrantsView = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'views/other_grants.php'), 'utf8'));
const auditLogsView = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'views/audit_logs.php'), 'utf8'));
const settingsView = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'views/settings.php'), 'utf8'));

// Modals
const scholarModal = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/modals/scholar_modal.php'), 'utf8'));
const batchModal = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/modals/batch_modal.php'), 'utf8'));
const batchUpdateModal = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/modals/batch_update_modal.php'), 'utf8'));
const dismissalModal = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/modals/dismissal_modal.php'), 'utf8'));
const payrollModal = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/modals/payroll_modal.php'), 'utf8'));
const viewModal = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/modals/view_modal.php'), 'utf8'));
const printModal = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/modals/print_modal.php'), 'utf8'));

// Print areas
const printAreas = cleanPhpTags(fs.readFileSync(path.join(rootDir, 'components/print_areas.php'), 'utf8'));

const compiledPortal = `<!DOCTYPE html>
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
    
    <!-- Unified Google Apps Script Stylesheet -->
    <?!= HtmlService.createHtmlOutputFromFile('Stylesheet').getContent(); ?>
    
    <!-- Chart.js for Visual Data Analysis -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

<!-- UPDATED LOADER STRUCTURE -->
<div id="loader">
    <img src="https://drive.google.com/thumbnail?id=1Y53YBqJih6EpriK2sj62t-PfRhG3FHc-&sz=s5000" alt="IBM Program" class="loader-logo">
    <div class="progress-wrapper">
        <div class="progress-bar" id="loaderBar"></div>
    </div>
    <div class="progress-text" id="loaderText">Processing... 0%</div>
</div>

<!-- MODERN SPLIT-SCREEN LOGIN PAGE -->
<div id="loginPage" style="display: flex;">
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
                &copy; 2026 Municipality of Malungon. Developed for the e-Iskolar Bayan Program.
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
            </div>
        </div>
    </div>
</div>

<!-- MAIN APP SHELL -->
<div class="app-layout" id="appLayout" style="display: none;">
    <div class="lgu-layout">
        <!-- Sidebar Navigation -->
        ${sidebarHtml}

        <!-- Main Wrapper (Header + Content) -->
        <div class="lgu-main-wrapper">
            <!-- Topbar Header -->
            ${headerHtml}

            <!-- Dynamic Views Container -->
            <main class="lgu-content">
                ${dashboardView}
                ${registryView}
                ${payrollView}
                ${reportsView}
                ${requirementsView}
                ${alumniView}
                ${otherGrantsView}
                ${auditLogsView}
                ${settingsView}
            </main>
        </div>
    </div>
</div>

<!-- SLIDE-OVER SCHOLAR QUICK DRAWER -->
${drawerHtml}

<!-- MODALS -->
${scholarModal}
${batchModal}
${batchUpdateModal}
${dismissalModal}
${payrollModal}
${viewModal}
<!-- 100% UNTOUCHED SACROSANCT PRINT MODAL -->
${printModal}

<!-- 100% UNTOUCHED SACROSANCT PRINT AREAS & DATALISTS -->
${printAreas}

<!-- SCRIPTS -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<!-- Core Google Apps Script Logic & Shell Controller -->
<?!= HtmlService.createHtmlOutputFromFile('adminJS').getContent(); ?>

</body>
</html>
`;

fs.writeFileSync(path.join(rootDir, 'Portal.html'), compiledPortal, 'utf8');
console.log('Successfully compiled Portal.html (' + compiledPortal.length + ' bytes)');

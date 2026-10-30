<?php
/**
 * Modern LGU Sidebar Navigation Component
 * Municipality of Malungon - e-IBM Portal
 */
?>
<aside class="lgu-sidebar" id="lguSidebar">
    <!-- Header / Brand -->
    <div class="lgu-sidebar-header" onclick="if(document.getElementById('lguSidebar')?.classList.contains('collapsed')){ toggleSidebarCollapse(); }" title="e-IBM Portal">
        <a href="javascript:void(0)" class="lgu-brand" onclick="if(document.getElementById('lguSidebar')?.classList.contains('collapsed')){ toggleSidebarCollapse(); } else { switchNavTab('dashboard'); }">
            <div class="lgu-brand-logo" title="Iskolar ng Bayan ng Malungon">
                <img src="assets/img/ibm-logo.png" alt="IBM Logo" class="brand-logo-img">
            </div>
            <div class="lgu-brand-text">
                <h2>e-IBM Portal</h2>
                <p>LGU Malungon</p>
            </div>
        </a>
        <button class="btn-sidebar-toggle" onclick="toggleSidebarCollapse()" title="Toggle Sidebar Width">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        </button>
    </div>

    <!-- Navigation List -->
    <nav class="lgu-sidebar-nav">
        <div class="nav-section-title">Main Portal</div>
        
        <div class="lgu-nav-item active" id="nav-dashboard" onclick="switchNavTab('dashboard')" data-tooltip="Executive Dashboard" title="Executive Dashboard">
            <div class="lgu-nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </div>
            <span>Executive Dashboard</span>
        </div>

        <div class="lgu-nav-item" id="nav-verification" onclick="switchNavTab('verification')" data-tooltip="Iskolar Registry" title="Iskolar Registry">
            <div class="lgu-nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <span>Iskolar Registry</span>
            <span class="lgu-nav-badge" id="side-scholar-count">2,376</span>
        </div>

        <div class="lgu-nav-item" id="nav-payroll" onclick="switchNavTab('payroll')" data-tooltip="Payroll Registry" title="Payroll Registry">
            <div class="lgu-nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <span>Payroll Registry</span>
            <span class="lgu-nav-badge" id="side-payroll-count">0</span>
        </div>

        <div class="lgu-nav-item" id="nav-requirements" onclick="switchNavTab('requirements')" data-tooltip="Requirements Hub" title="Requirements Hub">
            <div class="lgu-nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <span>Requirements Hub</span>
            <span class="lgu-nav-badge badge-urgent" id="side-req-badge" style="display: none;">0</span>
        </div>

        <div class="nav-section-title">Reports & Archives</div>

        <div class="lgu-nav-item" id="nav-reports" onclick="switchNavTab('reports')" data-tooltip="Reports & Summaries" title="Reports & Summaries">
            <div class="lgu-nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </div>
            <span>Reports & Summaries</span>
        </div>

        <div class="lgu-nav-item" id="nav-alumni" onclick="switchNavTab('alumni')" data-tooltip="Alumni & Graduates" title="Alumni & Graduates">
            <div class="lgu-nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            </div>
            <span>Alumni & Graduates</span>
            <span class="lgu-nav-badge" id="side-grad-count">1,227</span>
        </div>

        <div class="lgu-nav-item" id="nav-other-grants" onclick="switchNavTab('otherGrants')" data-tooltip="External Grants" title="External Grants">
            <div class="lgu-nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
            </div>
            <span>External Grants</span>
            <span class="lgu-nav-badge" id="side-og-count">0</span>
        </div>

        <div class="nav-section-title">Government Printing</div>

        <div class="lgu-nav-item" onclick="openPrintModal()" data-tooltip="Print Manager" title="Print Manager">
            <div class="lgu-nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </div>
            <span>Print Manager</span>
        </div>

        <div class="nav-section-title">Administration</div>

        <div class="lgu-nav-item" id="nav-audit-logs" onclick="switchNavTab('auditLogs')" data-tooltip="Audit & Activity Logs" title="Audit & Activity Logs">
            <div class="lgu-nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </div>
            <span>Audit & Activity Logs</span>
        </div>

        <div class="lgu-nav-item" id="nav-settings" onclick="switchNavTab('settings')" data-tooltip="System Settings" title="System Settings">
            <div class="lgu-nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <span>System Settings</span>
        </div>

        <!-- Dedicated Sidebar Expand/Collapse Item -->
        <div class="nav-section-title nav-toggle-section" style="margin-top: 10px;">Layout View</div>
        <div class="lgu-nav-item sidebar-collapse-toggle-item" id="sidebarCollapseToggleBtn" onclick="toggleSidebarCollapse()" title="Collapse Sidebar" data-tooltip="Expand Sidebar">
            <div class="lgu-nav-icon">
                <svg class="sidebar-chevron-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </div>
            <span class="sidebar-toggle-label">Collapse Sidebar</span>
        </div>
    </nav>

    <!-- Footer Profile -->
    <div class="lgu-sidebar-footer">
        <div class="user-avatar" title="<?= htmlspecialchars($_SESSION['user']['full_name'] ?? 'Administrator') ?>">
            <?= strtoupper(substr($_SESSION['user']['username'] ?? 'A', 0, 1)) ?>
        </div>
        <div class="user-info">
            <div class="user-name"><?= htmlspecialchars($_SESSION['user']['full_name'] ?? 'Administrator') ?></div>
            <div class="user-role"><?= htmlspecialchars($_SESSION['user']['role'] ?? 'LGU Staff') ?></div>
        </div>
        <button onclick="logout()" class="btn-sidebar-toggle" title="Sign Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
    </div>
</aside>

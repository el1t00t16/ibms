"use strict";
/**
 * LGU Malungon IBMS - Portal Shell & Interactive Controller
 * Handles sidebar navigation, modern SweetAlert toast notifications,
 * slide-over scholar drawer, KPI dashboard sync, floating batch actions,
 * alumni directory, external grants, and audit trails.
 */
// Global state for auxiliary views
let alumniCurrentPage = 1;
const alumniRowsPerPage = 15;
let filteredAlumniData = [];
let ogCurrentPage = 1;
const ogRowsPerPage = 15;
let filteredOgData = [];
let auditCurrentPage = 1;
const auditRowsPerPage = 15;
let auditLogsData = [];
let filteredAuditData = [];
/**
 * ==========================================================================
 * MODERN SWEETALERT2 TOAST NOTIFICATION SYSTEM
 * Sleek, non-intrusive top-right floating toasts for alerts & status updates
 * while preserving full modal dialogs for interactive confirmations/prompts.
 * ==========================================================================
 */
(function initModernToastSystem() {
    if (typeof window.Swal === 'undefined')
        return;
    // Create standard ModernToast instance
    const ModernToast = window.Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        showCloseButton: true,
        timer: 3200,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#0f172a',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', window.Swal.stopTimer);
            toast.addEventListener('mouseleave', window.Swal.resumeTimer);
        }
    });
    window.ModernToast = ModernToast;
    // Direct helper function for toast notifications
    window.showToast = function (title, message = '', icon = 'info') {
        return ModernToast.fire({
            icon: icon,
            title: title,
            text: message
        });
    };
})();
// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
    initSidebarState();
    initLiveClock();
    hookBatchObserver();
    hookDataSync();
});
/**
 * Live Clock in Header
 */
function initLiveClock() {
    function tick() {
        const clockEl = document.getElementById('liveClockText');
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
    }
    tick();
    setInterval(tick, 1000);
}
/**
 * 1. SIDEBAR NAVIGATION & VIEW SWITCHER
 */
function switchNavTab(tabName, subFilter) {
    const norm = (tabName || 'dashboard').toLowerCase().replace(/[-_]/g, '');
    // View Mapping: normalizes tab name to target panel ID, sidebar nav ID, and page title
    const viewMapping = {
        'dashboard': { panelId: 'dashboardTab', navId: 'nav-dashboard', title: 'Executive KPI Dashboard' },
        'verification': { panelId: 'verificationTab', navId: 'nav-verification', title: 'Iskolar Registry' },
        'registry': { panelId: 'verificationTab', navId: 'nav-verification', title: 'Iskolar Registry' },
        'payroll': { panelId: 'payrollTab', navId: 'nav-payroll', title: 'Payroll Registry' },
        'requirements': { panelId: 'requirementsTab', navId: 'nav-requirements', title: 'Requirements Hub' },
        'reports': { panelId: 'reportsTab', navId: 'nav-reports', title: 'Reports & Matrix Analytics' },
        'alumni': { panelId: 'alumniTab', navId: 'nav-alumni', title: 'Alumni Directory' },
        'othergrants': { panelId: 'otherGrantsTab', navId: 'nav-other-grants', title: 'Other Grants Registry' },
        'auditlogs': { panelId: 'auditLogsTab', navId: 'nav-audit-logs', title: 'System Audit Trail' },
        'settings': { panelId: 'settingsTab', navId: 'nav-settings', title: 'Portal Administration' }
    };
    const target = viewMapping[norm] || viewMapping['dashboard'];
    // 1. Hide all 9 view panels
    const views = [
        'dashboardTab',
        'verificationTab',
        'payrollTab',
        'reportsTab',
        'requirementsTab',
        'alumniTab',
        'otherGrantsTab',
        'auditLogsTab',
        'settingsTab'
    ];
    views.forEach(vId => {
        const el = document.getElementById(vId);
        if (el) {
            el.style.display = 'none';
            el.classList.remove('active');
        }
    });
    // 2. Display active target panel
    const targetPanel = document.getElementById(target.panelId);
    if (targetPanel) {
        targetPanel.style.display = 'block';
        targetPanel.classList.add('active');
    }
    // 3. Update active state in sidebar nav items
    document.querySelectorAll('.lgu-nav-item, .sidebar-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNavItem = document.getElementById(target.navId);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    // 4. Update Header Breadcrumb & Title
    const titleEl = document.getElementById('headerCurrentTitle');
    if (titleEl)
        titleEl.textContent = target.title;
    const breadcrumbEl = document.getElementById('headerBreadcrumbCurrent');
    if (breadcrumbEl)
        breadcrumbEl.textContent = target.title;
    // 5. Trigger view-specific handlers
    if (norm === 'dashboard') {
        updateDashboardKPIs();
    }
    else if (norm === 'verification' || norm === 'registry') {
        if (subFilter === 'active') {
            showActiveScholarsFromDashboard();
            return;
        }
        if (typeof renderTable === 'function')
            renderTable();
        updateDashboardKPIs();
    }
    else if (norm === 'payroll') {
        if (typeof renderPayrollTable === 'function')
            renderPayrollTable();
        updateDashboardKPIs();
    }
    else if (norm === 'requirements') {
        if (typeof loadRequirementsData === 'function')
            loadRequirementsData();
    }
    else if (norm === 'reports') {
        if (typeof window.switchReportSubTab === 'function') {
            window.switchReportSubTab(subFilter || 'analytics');
        }
        else if (typeof window.generateReport === 'function') {
            window.generateReport();
        }
        else if (typeof window.updateReportUI === 'function') {
            window.updateReportUI();
        }
    }
    else if (norm === 'alumni') {
        renderAlumniTable();
    }
    else if (norm === 'othergrants') {
        renderOtherGrantsTable();
    }
    else if (norm === 'auditlogs') {
        loadAuditLogs();
    }
    else if (norm === 'settings') {
        updateSettingsInfo();
    }
    // 6. Close mobile sidebar if open
    const sidebar = document.getElementById('lguSidebar') || document.getElementById('appSidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
    }
}
window.switchNavTab = switchNavTab;
/**
 * Sidebar Collapse & Expand
 */
function updateSidebarToggleElements(isCollapsed) {
    const bottomToggleBtn = document.getElementById('sidebarCollapseToggleBtn');
    if (bottomToggleBtn) {
        bottomToggleBtn.setAttribute('title', isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar');
        bottomToggleBtn.setAttribute('data-tooltip', isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar');
        const label = bottomToggleBtn.querySelector('.sidebar-toggle-label');
        if (label)
            label.textContent = isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar';
    }
    const topbarToggleBtn = document.getElementById('desktopSidebarToggleBtn');
    if (topbarToggleBtn) {
        topbarToggleBtn.setAttribute('title', isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar');
    }
    const headerBrand = document.querySelector('.lgu-sidebar-header .lgu-brand');
    if (headerBrand) {
        headerBrand.setAttribute('title', isCollapsed ? 'Click to Expand Sidebar' : 'e-IBM Portal - Malungon');
    }
}
function toggleSidebarCollapse() {
    const sidebar = document.getElementById('lguSidebar') || document.getElementById('appSidebar');
    const layout = document.querySelector('.lgu-layout');
    if (!sidebar)
        return;
    sidebar.classList.toggle('collapsed');
    if (layout) {
        layout.classList.toggle('sidebar-collapsed');
    }
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('ibms_sidebar_collapsed', isCollapsed ? '1' : '0');
    updateSidebarToggleElements(isCollapsed);
}
window.toggleSidebarCollapse = toggleSidebarCollapse;
window.toggleSidebar = toggleSidebarCollapse; // Alias for compatibility
function expandSidebar() {
    const sidebar = document.getElementById('lguSidebar') || document.getElementById('appSidebar');
    const layout = document.querySelector('.lgu-layout');
    if (!sidebar)
        return;
    sidebar.classList.remove('collapsed');
    if (layout)
        layout.classList.remove('sidebar-collapsed');
    localStorage.setItem('ibms_sidebar_collapsed', '0');
    updateSidebarToggleElements(false);
}
window.expandSidebar = expandSidebar;
function collapseSidebar() {
    const sidebar = document.getElementById('lguSidebar') || document.getElementById('appSidebar');
    const layout = document.querySelector('.lgu-layout');
    if (!sidebar)
        return;
    sidebar.classList.add('collapsed');
    if (layout)
        layout.classList.add('sidebar-collapsed');
    localStorage.setItem('ibms_sidebar_collapsed', '1');
    updateSidebarToggleElements(true);
}
window.collapseSidebar = collapseSidebar;
function toggleMobileSidebar() {
    const sidebar = document.getElementById('lguSidebar') || document.getElementById('appSidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}
window.toggleMobileSidebar = toggleMobileSidebar;
function initSidebarState() {
    const isCollapsed = localStorage.getItem('ibms_sidebar_collapsed') === '1';
    if (isCollapsed) {
        const sidebar = document.getElementById('lguSidebar') || document.getElementById('appSidebar');
        const layout = document.querySelector('.lgu-layout');
        if (sidebar)
            sidebar.classList.add('collapsed');
        if (layout)
            layout.classList.add('sidebar-collapsed');
    }
    updateSidebarToggleElements(isCollapsed);
    // Keyboard shortcut: Ctrl + B to toggle sidebar
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            const target = e.target;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }
            e.preventDefault();
            toggleSidebarCollapse();
        }
    });
}
/**
 * 2. DASHBOARD KPI & BADGE SYNCHRONIZATION
 */
function updateDashboardKPIs() {
    // 1. Total Active
    const totalActiveEl = document.getElementById('stat-total-active');
    const dashActiveEl = document.getElementById('dashTotalActive');
    const badgeActiveEl = document.getElementById('badge-active-count');
    const sideScholarEl = document.getElementById('side-scholar-count');
    const activeCount = totalActiveEl ? totalActiveEl.innerText : (dbData ? dbData.filter(s => s.status === 'ACTIVE').length : 0);
    const formattedActive = Number(activeCount).toLocaleString();
    if (dashActiveEl)
        dashActiveEl.innerText = formattedActive;
    if (badgeActiveEl)
        badgeActiveEl.innerText = formattedActive;
    if (sideScholarEl)
        sideScholarEl.innerText = formattedActive;
    // 2. Payroll Progress
    const payCurrEl = document.getElementById('stat-payroll-current');
    const payTotEl = document.getElementById('stat-payroll-total');
    const payPctEl = document.getElementById('stat-pct-text');
    const dashCurrEl = document.getElementById('dashPayrollCurrent');
    const dashTotEl = document.getElementById('dashPayrollTotal');
    const dashPctEl = document.getElementById('dashPayrollPct');
    const dashBarEl = document.getElementById('dashPayrollProgressBar');
    const badgePayEl = document.getElementById('badge-payroll-count');
    const sidePayEl = document.getElementById('side-payroll-count');
    if (payCurrEl && dashCurrEl)
        dashCurrEl.innerText = payCurrEl.innerText;
    if (payTotEl && dashTotEl)
        dashTotEl.innerText = payTotEl.innerText;
    if (payPctEl && dashPctEl)
        dashPctEl.innerText = payPctEl.innerText;
    if (badgePayEl && payCurrEl)
        badgePayEl.innerText = payCurrEl.innerText;
    if (sidePayEl && payCurrEl)
        sidePayEl.innerText = payCurrEl.innerText;
    if (dashBarEl && payCurrEl && payTotEl) {
        const c = parseInt(payCurrEl.innerText) || 0;
        const t = parseInt(payTotEl.innerText) || 1;
        const pct = Math.min(100, Math.round((c / t) * 100));
        dashBarEl.style.width = pct + '%';
    }
    // 3. Alumni Count
    const gradCount = (gradData && gradData.length) ? gradData.length : 1227;
    const dashGradEl = document.getElementById('dashTotalGraduates');
    const badgeAlumniEl = document.getElementById('badge-alumni-count');
    const sideGradEl = document.getElementById('side-grad-count');
    if (dashGradEl)
        dashGradEl.innerText = gradCount.toLocaleString();
    if (badgeAlumniEl)
        badgeAlumniEl.innerText = gradCount.toLocaleString();
    if (sideGradEl)
        sideGradEl.innerText = gradCount.toLocaleString();
    // 4. Other Grants Count
    const ogCount = (otherGrantsData && otherGrantsData.length) ? otherGrantsData.length : 0;
    const dashOgEl = document.getElementById('dashTotalOtherGrants');
    const badgeOgEl = document.getElementById('badge-other-grants-count');
    const sideOgEl = document.getElementById('side-og-count');
    if (dashOgEl)
        dashOgEl.innerText = ogCount.toLocaleString();
    if (badgeOgEl)
        badgeOgEl.innerText = ogCount.toLocaleString();
    if (sideOgEl)
        sideOgEl.innerText = ogCount.toLocaleString();
    // 5. Active Semester Badge
    if (sems && sems.length > 0) {
        const latestSem = sems[sems.length - 1];
        const dashSemBadge = document.getElementById('dashActiveSemBadge');
        if (dashSemBadge)
            dashSemBadge.innerText = 'SY ' + latestSem;
        const headerSem = document.getElementById('headerActiveSemText') || document.getElementById('headerSemText');
        if (headerSem)
            headerSem.innerText = 'Active: ' + latestSem;
    }
    // 6. Status Breakdown Chips
    if (dbData && dbData.length > 0) {
        const counts = {};
        dbData.forEach(s => {
            const st = s.status || 'UNKNOWN';
            counts[st] = (counts[st] || 0) + 1;
        });
        const chipContainer = document.getElementById('dashStatusChips');
        if (chipContainer) {
            chipContainer.innerHTML = Object.entries(counts).map(([status, count]) => {
                let badgeClass = 'badge-lgu-neutral';
                if (status === 'ACTIVE')
                    badgeClass = 'badge-lgu-success';
                else if (status === 'PROBATION')
                    badgeClass = 'badge-lgu-warning';
                else if (status === 'WARNING')
                    badgeClass = 'badge-lgu-danger';
                else if (status === 'GRADUATED')
                    badgeClass = 'badge-lgu-gold';
                else if (status === 'EXTENDED')
                    badgeClass = 'badge-lgu-primary';
                return `<div class="badge-lgu ${badgeClass}" style="font-size: 0.8rem; padding: 6px 12px; cursor: pointer;" onclick="switchNavTab('verification'); filterByStatusChip('${status}')">
                    <strong>${status}</strong>: ${count}
                </div>`;
            }).join('');
        }
    }
}
window.updateDashboardKPIs = updateDashboardKPIs;
/**
 * 3. QUICK FILTER CHIPS
 */
function applyChipFilter(status, btn) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    if (btn)
        btn.classList.add('active');
    const searchInput = document.getElementById('searchV');
    const semStatusSelect = document.getElementById('af-sem-status');
    if (status === 'ALL') {
        if (semStatusSelect)
            semStatusSelect.value = '';
        if (searchInput)
            searchInput.value = '';
        applyAdvancedFilters();
    }
    else if (status === 'ACTIVE') {
        if (semStatusSelect)
            semStatusSelect.value = 'active_baseline';
        if (searchInput)
            searchInput.value = '';
        applyAdvancedFilters();
    }
    else if (status === 'PENDING_RENEWAL') {
        if (semStatusSelect)
            semStatusSelect.value = 'pending';
        if (searchInput)
            searchInput.value = '';
        applyAdvancedFilters();
    }
    else {
        // Status like ON-HOLD, PROBATION, WARNING, GRADUATED, DELISTED, EXTENDED
        if (semStatusSelect)
            semStatusSelect.value = '';
        if (searchInput) {
            searchInput.value = status;
            applyAdvancedFilters();
        }
    }
}
function filterByStatusChip(status) {
    if (typeof switchNavTab === 'function') {
        switchNavTab('verification');
    } else if (typeof switchTab === 'function') {
        switchTab('verification');
    }

    // Reset dropdown filters so they don't accidentally conflict
    const brgySelect = document.getElementById('af-barangay');
    if (brgySelect) brgySelect.value = '';
    const yearSelect = document.getElementById('af-year');
    if (yearSelect) yearSelect.value = '';
    const payrollSelect = document.getElementById('af-payroll');
    if (payrollSelect) payrollSelect.value = '';
    const semStatusSelect = document.getElementById('af-sem-status');
    if (semStatusSelect) semStatusSelect.value = '';

    // Match chip in registry toolbar if available
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    const chips = document.querySelectorAll('.filter-chip');
    let matchedChip = null;
    chips.forEach(chip => {
        const txt = (chip.textContent || '').trim().toUpperCase();
        const sUpper = String(status || '').toUpperCase();
        if (txt === sUpper || (sUpper === 'ACTIVE' && txt.includes('ACTIVE')) || (sUpper === 'ALL' && txt.includes('ALL')) || txt.includes(sUpper)) {
            matchedChip = chip;
        }
    });
    if (matchedChip) {
        matchedChip.classList.add('active');
    }

    const searchInput = document.getElementById('searchV');
    if (searchInput) {
        if (status === 'ALL') {
            searchInput.value = '';
        } else {
            searchInput.value = status;
        }
    }

    if (typeof applyAdvancedFilters === 'function') {
        applyAdvancedFilters();
    }
}
/**
 * Filter and view Active Scholars directly from Dashboard KPI card
 */
function showActiveScholarsFromDashboard() {
    switchNavTab('verification');
    // Clear other search and filter inputs
    const searchInput = document.getElementById('searchV');
    if (searchInput)
        searchInput.value = '';
    const brgySelect = document.getElementById('af-barangay');
    if (brgySelect)
        brgySelect.value = '';
    const yearSelect = document.getElementById('af-year');
    if (yearSelect)
        yearSelect.value = '';
    const payrollSelect = document.getElementById('af-payroll');
    if (payrollSelect)
        payrollSelect.value = '';
    // Set Semester Status select to active_baseline
    const semStatusSelect = document.getElementById('af-sem-status');
    if (semStatusSelect)
        semStatusSelect.value = 'active_baseline';
    // Highlight the "Active Only" chip
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
        if (chip.textContent && chip.textContent.includes('Active')) {
            chip.classList.add('active');
        }
    });
    if (typeof applyAdvancedFilters === 'function') {
        applyAdvancedFilters();
    }
}
window.showActiveScholarsFromDashboard = showActiveScholarsFromDashboard;
/**
 * Calculates the stipend amount for a given semester period
 * 2023-2024/2nd Sem onward = 7,000 PHP, prior terms = 5,000 PHP
 */
function getSemesterStipendAmount(sem) {
    if (!sem)
        return 5000;
    const str = String(sem).trim();
    const match = str.match(/(\d{4})-(\d{4})/);
    if (match) {
        const startYear = parseInt(match[1], 10);
        if (startYear < 2023)
            return 5000;
        if (startYear === 2023) {
            if (str.toLowerCase().includes('2nd'))
                return 7000;
            return 5000;
        }
        return 7000;
    }
    if (typeof sems !== 'undefined' && Array.isArray(sems)) {
        const idx = sems.indexOf(str);
        const thresholdIdx = sems.indexOf("2023-2024/2nd Sem");
        if (idx !== -1 && thresholdIdx !== -1) {
            return idx >= thresholdIdx ? 7000 : 5000;
        }
    }
    return 7000;
}
window.getSemesterStipendAmount = getSemesterStipendAmount;
/**
 * 4. SLIDE-OVER SCHOLAR QUICK PROFILE DRAWER
 */
function openScholarDrawer(ibmId) {
    let scholar = (dbData || []).find(s => s.ibmId === ibmId);
    // If not found in active masterlist (dbData), check gradData (Alumni Registry)
    if (!scholar && gradData && gradData.length > 0) {
        const grad = gradData.find(g => g.ibmId === ibmId);
        if (grad) {
            const batchYear = grad.yearGraduated || grad.gradYear || grad.year || '';
            const yrDisplay = batchYear ? `Graduated (Batch ${batchYear})` : 'Graduated';
            const details = [
                grad.honor ? `🏆 Latin Honor: ${grad.honor}` : '',
                grad.employmentStatus ? `💼 Status: ${grad.employmentStatus}` : '',
                grad.company ? `🏢 Company: ${grad.company}` : '',
                grad.email ? `✉️ Email: ${grad.email}` : ''
            ].filter(Boolean);
            const semRecs = { ...(grad.semesterRecords || {}) };
            if (typeof pData !== 'undefined' && Array.isArray(pData)) {
                pData.filter((p) => p.ibmId === grad.ibmId && p.grantPeriod).forEach((p) => {
                    semRecs[p.grantPeriod] = 'OK';
                });
            }
            scholar = {
                ibmId: grad.ibmId,
                fullName: grad.fullName,
                firstName: grad.firstName || '',
                lastName: grad.lastName || grad.fullName,
                school: grad.school || '—',
                course: grad.course || '—',
                barangay: grad.barangay || '—',
                tribe: grad.tribe || '—',
                yearLevel: yrDisplay,
                schoolId: grad.schoolId || '—',
                startingYear: '—',
                contact: grad.contact || '—',
                sex: grad.gender || grad.sex || '—',
                gender: grad.gender || grad.sex || '—',
                lbpAccount: grad.lbpAccount || 'Not Provided',
                status: 'GRADUATED',
                semesterRecords: semRecs,
                semesterCount: 8,
                remarks: details.length > 0 ? details.join(' | ') : 'Iskolar Bayan Alumni Graduate'
            };
        }
    }
    // If still not found, check otherGrantsData
    if (!scholar && typeof otherGrantsData !== 'undefined' && otherGrantsData && otherGrantsData.length > 0) {
        const og = otherGrantsData.find((o) => o.ibmId === ibmId);
        if (og) {
            scholar = {
                ibmId: og.ibmId,
                fullName: og.fullName,
                firstName: og.firstName || '',
                lastName: og.lastName || og.fullName,
                school: og.school || '—',
                course: og.course || '—',
                barangay: og.barangay || '—',
                tribe: og.tribe || '—',
                yearLevel: 'Other Grant Beneficiary',
                schoolId: '—',
                startingYear: '—',
                contact: og.contact || '—',
                sex: og.gender || '—',
                lbpAccount: 'Not Provided',
                status: 'ACTIVE',
                semesterRecords: {},
                semesterCount: 0,
                remarks: `External Grant: ${og.grantName || og.otherGrant || 'Other Scholarship'}`
            };
        }
    }
    if (!scholar)
        return;
    currentViewScholar = scholar;
    // Header info
    const drawerTitle = document.getElementById('drawerScholarName');
    if (drawerTitle) {
        drawerTitle.textContent = (scholar.status === 'GRADUATED') ? 'Alumni Graduate Profile' : 'Scholar Record';
    }
    const nameEl = document.getElementById('drawerHeaderFullName');
    if (nameEl)
        nameEl.textContent = scholar.fullName || `${scholar.lastName}, ${scholar.firstName}`;
    const idEl = document.getElementById('drawerHeaderIbmId') || document.getElementById('drawerIbmId');
    if (idEl)
        idEl.textContent = scholar.ibmId || 'N/A';
    const initials = (scholar.firstName ? scholar.firstName[0] : '') + (scholar.lastName ? scholar.lastName[0] : '');
    const avatarEl = document.getElementById('drawerAvatarInitial') || document.getElementById('drawerAvatar');
    if (avatarEl)
        avatarEl.textContent = initials.toUpperCase() || 'IB';
    // Status Badge
    const statusEl = document.getElementById('drawerStatusBadge');
    if (statusEl) {
        let badgeClass = 'badge-active';
        const st = (scholar.status || 'ACTIVE').toUpperCase();
        if (st === 'PROBATION')
            badgeClass = 'badge-probation';
        else if (st === 'WARNING')
            badgeClass = 'badge-warning';
        else if (st === 'GRADUATED')
            badgeClass = 'badge-graduated';
        else if (st === 'DELISTED')
            badgeClass = 'badge-delisted';
        else if (st === 'EXTENDED')
            badgeClass = 'badge-extended';
        statusEl.innerHTML = `<span class="lgu-badge ${badgeClass}">${scholar.status || 'ACTIVE'}</span>`;
    }
    // Details population helper
    const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el)
            el.textContent = val || '—';
    };
    setTxt('drawerSchool', scholar.school);
    setTxt('drawerCourse', scholar.course);
    setTxt('drawerBarangay', scholar.barangay);
    setTxt('drawerTribe', scholar.tribe);
    setTxt('drawerYearLevel', scholar.yearLevel);
    setTxt('drawerCurrentYear', scholar.yearLevel);
    setTxt('drawerSchoolId', scholar.schoolId);
    setTxt('drawerStartingYear', scholar.startingYear || '1st Year');
    setTxt('drawerContact', scholar.contact);
    setTxt('drawerSex', scholar.sex || scholar.gender);
    setTxt('drawerLbpAccount', scholar.lbpAccount || 'Not Provided');
    setTxt('drawerLbp', scholar.lbpAccount || 'Not Provided');
    setTxt('drawerRemarks', scholar.remarks || 'No special notes recorded.');
    // Populate Financial Record (IBM Grant)
    const financialBody = document.getElementById('drawerFinancialTableBody');
    const totalStipendBadge = document.getElementById('drawerTotalStipendBadge');
    const totalStipendFoot = document.getElementById('drawerTotalStipendFoot');
    if (financialBody) {
        const allSems = (typeof sems !== 'undefined' && Array.isArray(sems) && sems.length > 0)
            ? sems
            : (scholar.semesterRecords ? Object.keys(scholar.semesterRecords) : []);
        const okSems = allSems.filter(sem => {
            const val = (scholar.semesterRecords && scholar.semesterRecords[sem]) || '';
            return String(val).trim().toUpperCase() === 'OK';
        });
        let totalStipend = 0;
        if (okSems.length === 0) {
            financialBody.innerHTML = `<tr><td colspan="3" class="py-2.5 px-2 text-center text-slate-400 italic">No approved ('OK') grant terms recorded.</td></tr>`;
        }
        else {
            financialBody.innerHTML = okSems.map(sem => {
                const stipend = getSemesterStipendAmount(sem);
                totalStipend += stipend;
                const formattedStipend = `₱${stipend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                let releaseDate = '—';
                if (typeof pData !== 'undefined' && Array.isArray(pData)) {
                    const pEntry = pData.find((p) => p.ibmId === scholar.ibmId && p.grantPeriod === sem);
                    if (pEntry && pEntry.remarks) {
                        const dateMatch = pEntry.remarks.match(/(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})|(\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2})/);
                        releaseDate = dateMatch ? dateMatch[0] : pEntry.remarks;
                    }
                    else if (pEntry && pEntry.createdAt) {
                        releaseDate = new Date(pEntry.createdAt).toLocaleDateString('en-US');
                    }
                }
                return `<tr>
                    <td class="py-1.5 px-2.5">
                        <div class="font-medium text-slate-800">${sem}</div>
                        ${releaseDate !== '—' ? `<div class="text-[10px] text-slate-400 font-normal">Rel: ${releaseDate}</div>` : ''}
                    </td>
                    <td class="py-1.5 px-2 align-middle">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">OK</span>
                    </td>
                    <td class="py-1.5 px-2 text-right align-middle font-mono font-bold text-emerald-700">${formattedStipend}</td>
                </tr>`;
            }).join('');
        }
        const formattedTotal = `₱${totalStipend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (totalStipendBadge)
            totalStipendBadge.textContent = `Total: ${formattedTotal}`;
        if (totalStipendFoot)
            totalStipendFoot.textContent = formattedTotal;
    }
    // Alumni Button state
    const alumniBtn = document.getElementById('drawerAlumniBtn');
    const isGrad = (scholar.status || '').toUpperCase() === 'GRADUATED' || (gradData || []).some(g => g.ibmId === scholar.ibmId);
    if (alumniBtn) {
        if (isGrad) {
            alumniBtn.innerHTML = `<span>🎓</span> <span>Already in Alumni Database</span>`;
            alumniBtn.className = 'btn-lgu btn-lgu-ghost w-full py-2.5 font-bold text-slate-500 bg-slate-100 flex items-center justify-center gap-2 pointer-events-none opacity-80';
        }
        else {
            alumniBtn.innerHTML = `<span>🎓</span> <span>Move to Alumni / Graduates</span>`;
            alumniBtn.className = 'btn-lgu btn-lgu-success w-full py-2.5 font-bold shadow-sm flex items-center justify-center gap-2';
        }
    }
    // Open Drawer
    const overlay = document.getElementById('scholarDrawerBackdrop') || document.getElementById('scholarDrawerOverlay');
    const drawer = document.getElementById('scholarDrawer');
    if (overlay)
        overlay.classList.add('open');
    if (drawer)
        drawer.classList.add('open');
}
window.openScholarDrawer = openScholarDrawer;
window.viewScholar = openScholarDrawer; // Connects table row eye icon click
function closeScholarDrawer() {
    const overlay = document.getElementById('scholarDrawerBackdrop') || document.getElementById('scholarDrawerOverlay');
    const drawer = document.getElementById('scholarDrawer');
    if (overlay)
        overlay.classList.remove('open');
    if (drawer)
        drawer.classList.remove('open');
}
window.closeScholarDrawer = closeScholarDrawer;
function copyDrawerLbp() {
    const lbpText = document.getElementById('drawerLbpAccount')?.textContent?.trim();
    if (!lbpText || lbpText === 'Not Provided' || lbpText === '---') {
        Swal.fire('No Account', 'No LandBank account recorded for this scholar.', 'info');
        return;
    }
    navigator.clipboard.writeText(lbpText).then(() => {
        Swal.fire('Copied', `LandBank account ${lbpText} copied to clipboard!`, 'success');
    }).catch(() => {
        Swal.fire('Notice', lbpText, 'info');
    });
}
window.copyDrawerLbp = copyDrawerLbp;
function drawerEditScholar() {
    if (!currentViewScholar)
        return;
    const scholarId = currentViewScholar.ibmId;
    const inDb = (dbData || []).some(s => s.ibmId === scholarId);
    if (!inDb) {
        Swal.fire({
            icon: 'info',
            title: 'Alumni Profile',
            text: 'This graduate is registered in the Alumni Directory. Masterlist edit form applies to active semester grantees.',
            confirmButtonColor: '#0c2340'
        });
        return;
    }
    closeScholarDrawer();
    if (typeof openScholarModal === 'function') {
        openScholarModal(true, scholarId);
    }
}
window.drawerEditScholar = drawerEditScholar;
function drawerMoveToAlumni() {
    if (!currentViewScholar)
        return;
    const scholar = currentViewScholar;
    const ibmId = scholar.ibmId;
    const name = scholar.fullName || `${scholar.lastName}, ${scholar.firstName}`;
    const st = (scholar.status || '').toUpperCase();
    const isGrad = st === 'GRADUATED' || (gradData || []).some(g => g.ibmId === ibmId);
    if (isGrad) {
        Swal.fire({
            icon: 'info',
            title: 'Already an Alumni',
            text: `${name} (${ibmId}) is already recorded in the Alumni Database.`,
            confirmButtonColor: '#059669'
        });
        return;
    }
    closeScholarDrawer();
    if (typeof window.promptAddGraduate === 'function') {
        window.promptAddGraduate(ibmId, name);
    }
}
window.drawerMoveToAlumni = drawerMoveToAlumni;
function drawerDisciplinaryAction() {
    if (!currentViewScholar)
        return;
    const scholarId = currentViewScholar.ibmId;
    closeScholarDrawer();
    if (typeof openDismissalModal === 'function') {
        openDismissalModal(scholarId);
    }
}
window.drawerDisciplinaryAction = drawerDisciplinaryAction;
function drawerAddOtherGrant() {
    if (!currentViewScholar)
        return;
    const scholar = currentViewScholar;
    closeScholarDrawer();
    if (typeof promptAddOtherGrant === 'function') {
        promptAddOtherGrant(scholar.ibmId, scholar.fullName);
    }
}
window.drawerAddOtherGrant = drawerAddOtherGrant;
function initiateCertificate(targetScholar) {
    const scholar = targetScholar || currentViewScholar;
    if (!scholar)
        return;
    if (typeof window.adminInitiateCertificate === 'function') {
        window.adminInitiateCertificate(scholar);
    }
    else if (typeof window.openCertModalWithScholar === 'function') {
        window.openCertModalWithScholar(scholar);
    }
    else if (typeof openPrintModal === 'function') {
        openPrintModal();
    }
}
window.initiateCertificate = initiateCertificate;
function printScholarProfile(targetScholar = null) {
    const s = targetScholar || (typeof currentViewScholar !== 'undefined' ? currentViewScholar : null) || window.currentViewScholar;
    if (!s) return;
    if (typeof window.adminPrintScholarProfile === 'function') {
        window.adminPrintScholarProfile(s);
    }
    else {
        window.print();
    }
}
window.printScholarProfile = printScholarProfile;
/**
 * 5. FLOATING BATCH ACTION BAR
 */
function hookBatchObserver() {
    // Monitor selection set changes
    setInterval(() => {
        const bar = document.getElementById('floatingBatchBar');
        const countDisplay = document.getElementById('batchSelectedDisplayCount');
        if (!bar || !countDisplay)
            return;
        const count = selectedIds ? selectedIds.size : 0;
        countDisplay.textContent = String(count);
        if (count > 0) {
            bar.classList.add('visible');
        }
        else {
            bar.classList.remove('visible');
        }
    }, 250);
}
function clearAllSelections() {
    if (selectedIds)
        selectedIds.clear();
    const selectAll = document.getElementById('selectAll');
    if (selectAll)
        selectAll.checked = false;
    document.querySelectorAll('.scholar-chk').forEach(c => c.checked = false);
    if (typeof updateBatchBtn === 'function')
        updateBatchBtn();
}
/**
 * 6. ALUMNI DIRECTORY CONTROLLER
 */
function renderAlumniTable() {
    if (!gradData || gradData.length === 0) {
        // Fallback fetch if not yet loaded
        google.script.run.withSuccessHandler(res => {
            gradData = res || [];
            populateAlumniFilters();
            applyAlumniFilterLogic();
        }).getGraduatesData();
        return;
    }
    populateAlumniFilters();
    applyAlumniFilterLogic();
}
function populateAlumniFilters() {
    const yearSelect = document.getElementById('alumniFilterYear');
    const brgySelect = document.getElementById('alumniFilterBrgy');
    if (!yearSelect || !brgySelect || !gradData)
        return;
    if (yearSelect.options.length <= 1) {
        const years = [...new Set(gradData.map(g => g.yearGraduated || g.gradYear || g.year).filter(Boolean))].sort().reverse();
        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = `Batch ${y}`;
            yearSelect.appendChild(opt);
        });
    }
    if (brgySelect.options.length <= 1) {
        const brgys = [...new Set(gradData.map(g => g.barangay).filter(Boolean))].sort();
        brgys.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            brgySelect.appendChild(opt);
        });
    }
}
function filterAlumniTable() {
    alumniCurrentPage = 1;
    applyAlumniFilterLogic();
}
function applyAlumniFilterLogic() {
    const search = (document.getElementById('searchAlumni')?.value || '').toLowerCase().trim();
    const selYear = document.getElementById('alumniFilterYear')?.value || '';
    const selBrgy = document.getElementById('alumniFilterBrgy')?.value || '';
    filteredAlumniData = (gradData || []).filter(g => {
        const name = (g.fullName || `${g.firstName} ${g.lastName}`).toLowerCase();
        const ibm = (g.ibmId || '').toLowerCase();
        const course = (g.course || '').toLowerCase();
        const school = (g.school || '').toLowerCase();
        const brgy = g.barangay || '';
        const yr = String(g.yearGraduated || g.gradYear || g.year || '');
        const matchSearch = !search || name.includes(search) || ibm.includes(search) || course.includes(search) || school.includes(search);
        const matchYear = !selYear || yr === selYear;
        const matchBrgy = !selBrgy || brgy === selBrgy;
        return matchSearch && matchYear && matchBrgy;
    });
    displayAlumniRows();
}
function displayAlumniRows() {
    const tbody = document.getElementById('alumniBody');
    const info = document.getElementById('alumniPageInfo');
    if (!tbody)
        return;
    tbody.innerHTML = '';
    const total = filteredAlumniData.length;
    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">No alumni records found matching filters.</td></tr>`;
        if (info)
            info.textContent = 'Showing 0 to 0 of 0 graduates';
        return;
    }
    const start = (alumniCurrentPage - 1) * alumniRowsPerPage;
    const end = Math.min(start + alumniRowsPerPage, total);
    const slice = filteredAlumniData.slice(start, end);
    slice.forEach((g, idx) => {
        const tr = document.createElement('tr');
        const name = g.fullName || `${g.lastName}, ${g.firstName}`;
        const yr = g.yearGraduated || g.gradYear || g.year || '—';
        tr.innerHTML = `
            <td>${start + idx + 1}</td>
            <td><strong style="color: var(--malungon-navy);">${g.ibmId || '—'}</strong></td>
            <td><strong style="color: var(--text-primary);">${name}</strong></td>
            <td>${g.course || '—'}</td>
            <td>${g.school || '—'}</td>
            <td>${g.barangay || '—'}</td>
            <td><span class="badge-lgu badge-lgu-gold">${yr}</span></td>
            <td>
                <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="openScholarDrawer('${g.ibmId}')" title="View Profile">👁️ Profile</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    if (info) {
        info.textContent = `Showing ${start + 1} to ${end} of ${total.toLocaleString()} graduates`;
    }
}
function changeAlumniPage(delta) {
    const totalPages = Math.ceil(filteredAlumniData.length / alumniRowsPerPage) || 1;
    alumniCurrentPage += delta;
    if (alumniCurrentPage < 1)
        alumniCurrentPage = 1;
    if (alumniCurrentPage > totalPages)
        alumniCurrentPage = totalPages;
    displayAlumniRows();
}
function exportAlumniCSV() {
    if (!filteredAlumniData || filteredAlumniData.length === 0) {
        Swal.fire('Notice', 'No alumni data to export', 'info');
        return;
    }
    const headers = ['No', 'IBM ID', 'Full Name', 'Course', 'School', 'Barangay', 'Year Graduated'];
    const rows = filteredAlumniData.map((g, i) => [
        i + 1,
        g.ibmId || '',
        `"${(g.fullName || `${g.lastName}, ${g.firstName}`).replace(/"/g, '""')}"`,
        `"${(g.course || '').replace(/"/g, '""')}"`,
        `"${(g.school || '').replace(/"/g, '""')}"`,
        `"${(g.barangay || '').replace(/"/g, '""')}"`,
        g.yearGraduated || g.gradYear || g.year || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Malungon_Alumni_List_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function openAddScholarToAlumniModal() {
    if (!dbData || dbData.length === 0) {
        Swal.fire('Loading Data...', 'The scholar masterlist is still loading. Please try again in a few seconds.', 'info');
        return;
    }
    // Filter scholars who are not yet graduated
    const eligibleScholars = dbData.filter(s => {
        const st = (s.status || '').toUpperCase();
        return st !== 'GRADUATED' && st !== 'DELISTED';
    });
    const datalistOptions = eligibleScholars.slice(0, 400).map(s => {
        const name = s.fullName || `${s.lastName}, ${s.firstName}`;
        return `<option value="${s.ibmId}">${name} (${s.yearLevel || 'Scholar'}, ${s.school || ''})</option>`;
    }).join('');
    Swal.fire({
        title: '🎓 Add Scholar to Alumni Registry',
        html: `
            <div class="text-start mb-3" style="text-align: left;">
                <label class="form-label text-xs font-bold text-slate-700 uppercase" style="display:block; margin-bottom:6px;">Select or Type Scholar <span style="color:red;">*</span></label>
                <input type="text" id="alumniTargetId" list="dl-alumni-targets" class="form-control" placeholder="Type name or IBM ID..." style="width: 100%; font-size: 0.9rem;" required>
                <datalist id="dl-alumni-targets">
                    ${datalistOptions}
                </datalist>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.75rem;">Select from active, 4th year, or extended scholars.</p>
            </div>
            <div class="text-start mb-3" style="text-align: left;">
                <label class="form-label text-xs font-bold text-slate-700 uppercase" style="display:block; margin-bottom:6px;">Graduation Year <span style="color:red;">*</span></label>
                <input type="number" id="alumniGradYear" class="form-control" value="${new Date().getFullYear()}" required style="width: 100%;">
            </div>
            <div class="text-start mb-3" style="text-align: left;">
                <label class="form-label text-xs font-bold text-slate-700 uppercase" style="display:block; margin-bottom:6px;">Latin Honor / Award (Optional)</label>
                <input type="text" id="alumniLatinHonor" class="form-control" placeholder="e.g. Cum Laude, Magna Cum Laude, Academic Excellence" style="width: 100%;">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirm & Transfer',
        confirmButtonColor: '#059669',
        preConfirm: () => {
            const rawInput = document.getElementById('alumniTargetId')?.value.trim();
            const year = document.getElementById('alumniGradYear')?.value.trim();
            const honor = document.getElementById('alumniLatinHonor')?.value.trim();
            if (!rawInput) {
                Swal.showValidationMessage('Please select or enter a scholar');
                return false;
            }
            if (!year) {
                Swal.showValidationMessage('Graduation Year is required');
                return false;
            }
            // Extract IBM ID if full option was selected
            let targetIbmId = rawInput;
            const match = rawInput.match(/IBM-[\w-]+/i);
            if (match)
                targetIbmId = match[0];
            const found = dbData.find(s => s.ibmId.toLowerCase() === targetIbmId.toLowerCase() || s.fullName.toLowerCase() === rawInput.toLowerCase());
            if (!found) {
                Swal.showValidationMessage(`Scholar "${targetIbmId}" not found in database.`);
                return false;
            }
            return { ibmId: found.ibmId, year, honor };
        }
    }).then(result => {
        if (result.isConfirmed && result.value) {
            Swal.fire({ title: 'Transferring to Alumni Registry...', didOpen: () => Swal.showLoading() });
            google.script.run
                .withSuccessHandler((res) => {
                if (res && res.success) {
                    Swal.fire('🎓 Successfully Transferred!', res.message || 'Scholar added to Alumni Database.', 'success');
                    if (typeof window.loadData === 'function')
                        window.loadData();
                    google.script.run.withSuccessHandler((r) => {
                        gradData = r || [];
                        renderAlumniTable();
                        if (typeof window.updateStats === 'function')
                            window.updateStats();
                        if (typeof window.updateExecutiveKPIs === 'function')
                            window.updateExecutiveKPIs();
                    }).getGraduatesData();
                }
                else {
                    Swal.fire('Notice', res?.message || 'Could not complete transfer.', 'error');
                }
            })
                .withFailureHandler((err) => {
                Swal.fire('Error', err.message || 'Server request failed', 'error');
            })
                .addToGraduatesDb(result.value.ibmId, result.value.year, result.value.honor);
        }
    });
}
window.openAddScholarToAlumniModal = openAddScholarToAlumniModal;
window.exportAlumniCSV = exportAlumniCSV;
/**
 * 7. OTHER GRANTS DIRECTORY CONTROLLER
 */
function renderOtherGrantsTable() {
    if (!otherGrantsData || otherGrantsData.length === 0) {
        google.script.run.withSuccessHandler(res => {
            otherGrantsData = res || [];
            populateOtherGrantsFilters();
            applyOtherGrantsFilterLogic();
        }).getOtherGrantsData();
        return;
    }
    populateOtherGrantsFilters();
    applyOtherGrantsFilterLogic();
}
function populateOtherGrantsFilters() {
    const yearSelect = document.getElementById('ogFilterYear');
    const grantSelect = document.getElementById('ogFilterGrant');
    if (!yearSelect || !grantSelect || !otherGrantsData)
        return;
    if (yearSelect.options.length <= 1) {
        const years = [...new Set(otherGrantsData.map(o => o.year).filter(Boolean))].sort().reverse();
        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = `Year ${y}`;
            yearSelect.appendChild(opt);
        });
    }
    if (grantSelect.options.length <= 1) {
        const grants = [...new Set(otherGrantsData.map(o => o.grantName).filter(Boolean))].sort();
        grants.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g;
            opt.textContent = g;
            grantSelect.appendChild(opt);
        });
    }
}
function filterOtherGrantsTable() {
    ogCurrentPage = 1;
    applyOtherGrantsFilterLogic();
}
function applyOtherGrantsFilterLogic() {
    const search = (document.getElementById('searchOtherGrants')?.value || '').toLowerCase().trim();
    const selYear = document.getElementById('ogFilterYear')?.value || '';
    const selGrant = document.getElementById('ogFilterGrant')?.value || '';
    filteredOgData = (otherGrantsData || []).filter(o => {
        const name = (o.fullName || '').toLowerCase();
        const ibm = (o.ibmId || '').toLowerCase();
        const grant = (o.grantName || '').toLowerCase();
        const yr = String(o.year || '');
        const matchSearch = !search || name.includes(search) || ibm.includes(search) || grant.includes(search);
        const matchYear = !selYear || yr === selYear;
        const matchGrant = !selGrant || o.grantName === selGrant;
        return matchSearch && matchYear && matchGrant;
    });
    displayOtherGrantsRows();
}
function displayOtherGrantsRows() {
    const tbody = document.getElementById('otherGrantsBody');
    const info = document.getElementById('otherGrantsPageInfo');
    if (!tbody)
        return;
    tbody.innerHTML = '';
    const total = filteredOgData.length;
    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No external grant records found.</td></tr>`;
        if (info)
            info.textContent = 'Showing 0 to 0 of 0 records';
        return;
    }
    const start = (ogCurrentPage - 1) * ogRowsPerPage;
    const end = Math.min(start + ogRowsPerPage, total);
    const slice = filteredOgData.slice(start, end);
    slice.forEach((o, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${start + idx + 1}</td>
            <td><strong style="color: var(--danger);">${o.ibmId || '—'}</strong></td>
            <td><strong style="color: var(--text-primary);">${o.fullName || '—'}</strong></td>
            <td><span class="badge-lgu badge-lgu-danger">${o.grantName || '—'}</span></td>
            <td>${o.year || '—'}</td>
            <td>
                <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="openScholarDrawer('${o.ibmId}')" title="View Profile">👁️ Details</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    if (info) {
        info.textContent = `Showing ${start + 1} to ${end} of ${total.toLocaleString()} records`;
    }
}
function changeOtherGrantsPage(delta) {
    const totalPages = Math.ceil(filteredOgData.length / ogRowsPerPage) || 1;
    ogCurrentPage += delta;
    if (ogCurrentPage < 1)
        ogCurrentPage = 1;
    if (ogCurrentPage > totalPages)
        ogCurrentPage = totalPages;
    displayOtherGrantsRows();
}
function exportOtherGrantsCSV() {
    if (!filteredOgData || filteredOgData.length === 0) {
        Swal.fire('Notice', 'No data to export', 'info');
        return;
    }
    const headers = ['No', 'IBM ID', 'Full Name', 'External Grant', 'Year'];
    const rows = filteredOgData.map((o, i) => [
        i + 1,
        o.ibmId || '',
        `"${(o.fullName || '').replace(/"/g, '""')}"`,
        `"${(o.grantName || '').replace(/"/g, '""')}"`,
        o.year || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Malungon_Other_Grants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
/**
 * 8. SYSTEM AUDIT TRAIL
 */
function loadAuditLogs() {
    const tbody = document.getElementById('auditLogsBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Loading audit trail...</td></tr>`;
    }
    google.script.run
        .withSuccessHandler(res => {
        auditLogsData = res || [];
        filterAuditLogs();
    })
        .withFailureHandler(err => {
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger); padding: 30px;">Unable to fetch audit logs: ${err.message}</td></tr>`;
        }
    })
        .getAuditLogs();
}
function filterAuditLogs() {
    const search = (document.getElementById('searchAudit')?.value || '').toLowerCase().trim();
    const actionFilter = document.getElementById('auditActionFilter')?.value || '';
    filteredAuditData = auditLogsData.filter(log => {
        const text = `${log.action || ''} ${log.user || ''} ${log.details || ''} ${log.ip_address || ''}`.toLowerCase();
        const matchSearch = !search || text.includes(search);
        const matchAction = !actionFilter || (log.action && log.action.toUpperCase().includes(actionFilter));
        return matchSearch && matchAction;
    });
    auditCurrentPage = 1;
    displayAuditRows();
}
function displayAuditRows() {
    const tbody = document.getElementById('auditLogsBody');
    const info = document.getElementById('auditPageInfo');
    if (!tbody)
        return;
    tbody.innerHTML = '';
    const total = filteredAuditData.length;
    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No audit trail events recorded.</td></tr>`;
        if (info)
            info.textContent = 'Showing 0 to 0 of 0 entries';
        return;
    }
    const start = (auditCurrentPage - 1) * auditRowsPerPage;
    const end = Math.min(start + auditRowsPerPage, total);
    const slice = filteredAuditData.slice(start, end);
    slice.forEach(log => {
        const tr = document.createElement('tr');
        let actionBadge = 'badge-lgu-neutral';
        const act = (log.action || '').toUpperCase();
        if (act.includes('UPDATE') || act.includes('BATCH') || act.includes('EDIT'))
            actionBadge = 'badge-lgu-primary';
        else if (act.includes('INSERT') || act.includes('ADD'))
            actionBadge = 'badge-lgu-success';
        else if (act.includes('DELETE') || act.includes('DELIST') || act.includes('DISMISS'))
            actionBadge = 'badge-lgu-danger';
        else if (act.includes('LOGIN'))
            actionBadge = 'badge-lgu-gold';
        const timeDisplay = log.created_at || log.timestamp || '—';
        tr.innerHTML = `
            <td style="white-space: nowrap; font-size: 0.8rem; color: var(--text-secondary);">${timeDisplay}</td>
            <td><strong style="color: var(--text-primary);">${log.user || 'admin'}</strong></td>
            <td><span class="badge-lgu ${actionBadge}">${act}</span></td>
            <td style="font-size: 0.85rem; color: var(--text-secondary); word-break: break-word; line-height: 1.4;">${log.details || '—'}</td>
            <td style="font-size: 0.75rem; color: var(--text-muted);">${log.ip_address || '127.0.0.1'}</td>
        `;
        tbody.appendChild(tr);
    });
    if (info) {
        info.textContent = `Showing ${start + 1} to ${end} of ${total} events`;
    }
}
function changeAuditPage(delta) {
    const totalPages = Math.ceil(filteredAuditData.length / auditRowsPerPage) || 1;
    auditCurrentPage += delta;
    if (auditCurrentPage < 1)
        auditCurrentPage = 1;
    if (auditCurrentPage > totalPages)
        auditCurrentPage = totalPages;
    displayAuditRows();
}
function exportAuditLogsCSV() {
    if (!filteredAuditData || filteredAuditData.length === 0) {
        Swal.fire('Notice', 'No audit logs to export', 'info');
        return;
    }
    const headers = ['Timestamp', 'User', 'Action', 'Details', 'IP Address'];
    const rows = filteredAuditData.map(l => [
        l.created_at || '',
        l.user || 'admin',
        l.action || '',
        `"${(l.details || '').replace(/"/g, '""')}"`,
        l.ip_address || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Malungon_IBMS_AuditLogs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
/**
 * 9. SETTINGS & DATABASE BACKUP
 */
function updateSettingsInfo() {
    const totalScholarsEl = document.getElementById('settingsTotalScholars');
    const totalGraduatesEl = document.getElementById('settingsTotalGraduates');
    if (totalScholarsEl && dbData)
        totalScholarsEl.textContent = dbData.length.toLocaleString();
    if (totalGraduatesEl && gradData)
        totalGraduatesEl.textContent = gradData.length.toLocaleString();
    const semListEl = document.getElementById('settingsSemestersList');
    if (semListEl && sems) {
        semListEl.innerHTML = sems.map(s => `<span class="badge-lgu badge-lgu-primary" style="font-size: 0.8rem; padding: 4px 10px;">${s}</span>`).join('');
    }
}
function backupDatabase() {
    Swal.fire({
        title: 'Generate SQL Backup?',
        text: 'This will export a full MySQL database dump of ibms_db directly to your browser downloads.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Export Database',
        confirmButtonColor: '#0c2340'
    }).then(result => {
        if (result.isConfirmed) {
            window.location.href = 'api.php?action=backupDatabase';
        }
    });
}
function triggerExcelReimport() {
    Swal.fire({
        title: '🔄 Re-Import Excel Database?',
        text: 'This will re-parse "ibms-database from sheet.xlsx" and refresh all scholars, semester milestones, and graduate records. Make sure the updated file is placed in your project root.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#059669',
        confirmButtonText: 'Yes, Start Re-Import'
    }).then(result => {
        if (result.isConfirmed) {
            window.location.href = 'import_data.php';
        }
    });
}
window.triggerExcelReimport = triggerExcelReimport;
window.backupDatabase = backupDatabase;
function handlePasswordChange(e) {
    e.preventDefault();
    const curr = document.getElementById('currPassword').value;
    const newP = document.getElementById('newPassword').value;
    const conf = document.getElementById('confirmPassword').value;
    if (newP !== conf) {
        Swal.fire('Password Mismatch', 'New password and confirmation do not match.', 'error');
        return;
    }
    if (newP.length < 6) {
        Swal.fire('Notice', 'Password must be at least 6 characters.', 'warning');
        return;
    }
    google.script.run
        .withSuccessHandler(res => {
        if (res.success) {
            Swal.fire('Success', 'Admin password updated successfully!', 'success');
            document.getElementById('changePasswordForm')?.reset();
        }
        else {
            Swal.fire('Error', res.message || 'Failed to update password', 'error');
        }
    })
        .withFailureHandler(err => {
        Swal.fire('Error', err.message, 'error');
    })
        .changeAdminPassword({ currentPassword: curr, newPassword: newP });
}
/**
 * Hook into main data load to keep dashboard in sync
 */
function hookDataSync() {
    const originalLoadData = window.loadData;
    if (typeof originalLoadData === 'function') {
        window.loadData = function () {
            originalLoadData();
            setTimeout(updateDashboardKPIs, 1500);
        };
    }
}

<?php
/**
 * Modern LGU Topbar Header Component
 */
?>
<header class="lgu-topbar">
    <div class="topbar-left">
        <button class="btn-sidebar-toggle" style="display:none;" id="mobileMenuBtn" onclick="toggleMobileSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <button class="btn-sidebar-toggle desktop-toggle-btn" id="desktopSidebarToggleBtn" onclick="toggleSidebarCollapse()" title="Toggle Sidebar (Expand / Collapse)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
        </button>

        <div class="page-breadcrumb">
            <span class="breadcrumb-root">Malungon e-IBM</span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current" id="headerCurrentTitle">Executive Dashboard</span>
        </div>

        <div class="active-sem-pill" id="headerActiveSemPill" title="Current Active Semester">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span id="headerSemText">Loading Sem...</span>
        </div>
    </div>

    <div class="topbar-right">
        <!-- Live Clock -->
        <div class="live-clock" id="currentTime">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span id="liveClockText">--:--:--</span>
        </div>

        <!-- Header Action Shortcut Buttons -->
        <button class="btn-lgu btn-lgu-primary" onclick="openScholarModal(false)" style="box-shadow: var(--shadow-sm);">
            <span>+</span> New Scholar
        </button>

        <button class="btn-lgu btn-lgu-ghost" onclick="loadData()" title="Sync and refresh all database registries">
            <span>&#8635;</span> Sync
        </button>
    </div>
</header>

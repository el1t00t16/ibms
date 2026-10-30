<?php
/**
 * Executive KPI Dashboard View
 * Modern executive overview of Malungon Iskolar Bayan Program metrics
 */
?>
<div id="dashboardTab" class="view-panel active">
    <!-- Top Welcome Banner (Premium Light Design) -->
    <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm relative overflow-hidden mb-6">
        <div class="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-100/60 to-transparent pointer-events-none hidden md:block"></div>
        <div class="absolute -right-6 -bottom-10 opacity-5 text-9xl pointer-events-none select-none">🏛️</div>
        
        <div class="relative z-10 max-w-3xl">
            <!-- Civic Eyebrow Pill -->
            <div class="inline-flex items-center gap-2 bg-amber-50/90 text-amber-900 border border-amber-200/80 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3 shadow-xs">
                <span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Malungon Municipal Scholarship Office</span>
                <span class="text-amber-400">•</span>
                <span id="dashActiveSemBadge" class="text-amber-800">Active Semester</span>
            </div>

            <!-- Main Heading with 100% Contrast -->
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-2">
                Iskolar Bayan Management Information System
            </h1>

            <!-- Subtitle with crisp, clear Slate-600 typography -->
            <p class="text-sm sm:text-base text-slate-600 font-normal leading-relaxed m-0">
                Welcome to the unified LGU portal. Monitor scholar enrollment, verify semester requirements, process payroll disbursements, and track alumni impact in real-time.
            </p>
        </div>
    </div>

    <!-- Executive KPI Metric Cards -->
    <div class="kpi-grid" style="margin-bottom: 24px;">
        <!-- Card 1: Active Scholars -->
        <div class="kpi-card" onclick="showActiveScholarsFromDashboard()" style="cursor: pointer;" title="Click to view 925 Active Baseline Scholars">
            <div class="kpi-header">
                <span class="kpi-title">Active Scholars</span>
                <div class="kpi-icon icon-navy">🎓</div>
            </div>
            <div class="kpi-value" id="dashTotalActive">0</div>
            <div class="kpi-subtitle">
                <span class="badge-lgu badge-lgu-success" style="font-size: 0.7rem; padding: 1px 6px;">Enrolled</span>
                <span>Active baseline scholars</span>
            </div>
        </div>

        <!-- Card 2: Payroll Completion -->
        <div class="kpi-card" onclick="switchNavTab('payroll')">
            <div class="kpi-header">
                <span class="kpi-title">Disbursement Progress</span>
                <div class="kpi-icon icon-emerald">💳</div>
            </div>
            <div class="kpi-value" style="color: var(--emerald);">
                <span id="dashPayrollCurrent">0</span>
                <span style="font-size: 1.1rem; color: var(--text-muted); font-weight: 500;">/</span>
                <span id="dashPayrollTotal" style="font-size: 1.1rem; color: var(--text-secondary); font-weight: 600;">0</span>
            </div>
            <div style="margin-top: 8px;">
                <div class="progress-bar-lgu" style="height: 6px;">
                    <div id="dashPayrollProgressBar" class="progress-fill fill-emerald" style="width: 0%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-top: 4px;">
                    <span style="color: var(--text-muted);">Current Batch</span>
                    <strong id="dashPayrollPct" style="color: var(--emerald);">0% Complete</strong>
                </div>
            </div>
        </div>

        <!-- Card 3: Alumni & Graduates -->
        <div class="kpi-card" onclick="switchNavTab('alumni')">
            <div class="kpi-header">
                <span class="kpi-title">Graduated Alumni</span>
                <div class="kpi-icon icon-gold">📜</div>
            </div>
            <div class="kpi-value" id="dashTotalGraduates" style="color: var(--civic-gold);">0</div>
            <div class="kpi-subtitle">
                <span class="badge-lgu badge-lgu-warning" style="font-size: 0.7rem; padding: 1px 6px;">Success Rate</span>
                <span>Alumni in registry</span>
            </div>
        </div>

        <!-- Card 4: Other Grants -->
        <div class="kpi-card" onclick="switchNavTab('other_grants')">
            <div class="kpi-header">
                <span class="kpi-title">External Grants</span>
                <div class="kpi-icon" style="background: rgba(239, 68, 68, 0.1); color: var(--danger);">🏅</div>
            </div>
            <div class="kpi-value" id="dashTotalOtherGrants" style="color: var(--danger);">0</div>
            <div class="kpi-subtitle">
                <span class="badge-lgu badge-lgu-danger" style="font-size: 0.7rem; padding: 1px 6px;">Dual Grants</span>
                <span>CHED / DOST / External</span>
            </div>
        </div>
    </div>

    <!-- Quick Action Hub & Summary Grid -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
        <!-- Left: Quick Administrative Actions -->
        <div class="card-lgu">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 class="card-title">Administrative Quick Operations</h3>
                    <p class="card-subtitle">Common tasks and fast workflow shortcuts</p>
                </div>
                <button class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="loadData()">🔄 Refresh Live Data</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 14px;">
                <div class="kpi-card" style="padding: 16px; cursor: pointer; text-align: center; border: 1px dashed var(--border-color);" onclick="openScholarModal(false)">
                    <div style="font-size: 2rem; margin-bottom: 8px;">➕</div>
                    <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">Enroll New Scholar</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Register applicant to masterlist</div>
                </div>

                <div class="kpi-card" style="padding: 16px; cursor: pointer; text-align: center; border: 1px dashed var(--border-color);" onclick="openPrintModal()">
                    <div style="font-size: 2rem; margin-bottom: 8px;">🖨️</div>
                    <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">Print Manager</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Payroll form, FURS, ADA, finance</div>
                </div>

                <div class="kpi-card" style="padding: 16px; cursor: pointer; text-align: center; border: 1px dashed var(--border-color);" onclick="switchNavTab('reports'); generateTrackingMatrix();">
                    <div style="font-size: 2rem; margin-bottom: 8px;">🔄</div>
                    <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">Sem-vs-Sem Tracking</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Cross-semester comparison</div>
                </div>

                <div class="kpi-card" style="padding: 16px; cursor: pointer; text-align: center; border: 1px dashed var(--border-color);" onclick="switchNavTab('requirements')">
                    <div style="font-size: 2rem; margin-bottom: 8px;">📋</div>
                    <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">Requirement Portal</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Approve grades & COR uploads</div>
                </div>
            </div>

            <!-- Distribution Highlights -->
            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                    <span style="font-size: 0.82rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Quick Status Breakdown</span>
                    <button class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="switchNavTab('reports'); generateMatrixReport();">View Full Matrix →</button>
                </div>
                <div id="dashStatusChips" style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <!-- Dynamically populated chips -->
                    <span class="badge-lgu badge-lgu-neutral">Loading status breakdown...</span>
                </div>
            </div>
        </div>

        <!-- Right: Portal Status & Malungon Mission -->
        <div class="card-lgu" style="display: flex; flex-direction: column;">
            <div class="card-header">
                <h3 class="card-title">Portal System Status</h3>
                <p class="card-subtitle">Local database & server health</p>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px; flex-grow: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface-alt); border-radius: var(--radius-md);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="status-indicator status-online"></span>
                        <span style="font-size: 0.85rem; font-weight: 600;">MySQL Database</span>
                    </div>
                    <span class="badge-lgu badge-lgu-success" style="font-size: 0.72rem;">CONNECTED</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface-alt); border-radius: var(--radius-md);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="status-indicator status-online"></span>
                        <span style="font-size: 0.85rem; font-weight: 600;">Student Upload Portal</span>
                    </div>
                    <span id="dashUploadStatusBadge" class="badge-lgu badge-lgu-neutral" style="font-size: 0.72rem;">CHECKING</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface-alt); border-radius: var(--radius-md);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1rem;">🏛️</span>
                        <span style="font-size: 0.85rem; font-weight: 600;">Municipality</span>
                    </div>
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--malungon-navy);">Malungon, Sarangani</span>
                </div>

                <!-- LGU Malungon Civic Badge -->
                <div style="margin-top: auto; padding: 16px; background: rgba(12, 35, 64, 0.04); border-radius: var(--radius-md); border-left: 3px solid var(--malungon-navy);">
                    <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--malungon-navy); letter-spacing: 0.05em; margin-bottom: 4px;">Subida Malungon!</div>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">
                        Empowering underprivileged youth through sustainable tertiary education grants.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

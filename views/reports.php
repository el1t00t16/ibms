<?php
/**
 * Reports & Matrix Analytics Executive Suite
 * Includes Executive Demographics, Cross-Tabulation Pivot Matrices, Cohort Retention Tracking, and Alumni Matrix
 */
?>
<!-- REPORT & SUMMARY TAB -->
<div id="reportsTab" class="view-panel" style="display: none;">
    
    <!-- Top Sub-Navigation Bar -->
    <div class="report-nav-header" style="background: var(--bg-surface); padding: 12px 18px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: 20px; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="reportSubTabBtns">
            <button type="button" class="btn-lgu btn-lgu-primary report-tab-btn active" id="btnReportTab-analytics" data-report-tab="analytics" onclick="switchReportSubTab('analytics')">
                📊 Executive Demographics
            </button>
            <button type="button" class="btn-lgu btn-lgu-ghost report-tab-btn" id="btnReportTab-matrices" data-report-tab="matrices" onclick="switchReportSubTab('matrices')">
                🗺️ Cross-Tabulation Matrices
            </button>
            <button type="button" class="btn-lgu btn-lgu-ghost report-tab-btn" id="btnReportTab-tracking" data-report-tab="tracking" onclick="switchReportSubTab('tracking')">
                🔄 Retention & Movement
            </button>
            <button type="button" class="btn-lgu btn-lgu-ghost report-tab-btn" id="btnReportTab-alumni" data-report-tab="alumni" onclick="switchReportSubTab('alumni')">
                🎓 Alumni & Latin Honors
            </button>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
            <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="promptPrintMasterList()" title="Print Official Master List">
                🖨️ Print Master List
            </button>
            <button type="button" class="btn-lgu btn-lgu-secondary btn-lgu-sm" onclick="exportActiveReportView()" title="Export Current View as CSV">
                ⬇️ Export Excel/CSV
            </button>
        </div>
    </div>

    <!-- SUB-TAB 1: EXECUTIVE DEMOGRAPHICS & STANDARD ANALYTICS -->
    <div id="standardSummaryContainer" class="report-sub-view">
        <div class="report-grid">
            <!-- Sidebar Controls -->
            <div class="report-sidebar">
                <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 16px; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                    <span>⚙️</span> Report Configuration
                </h3>
                
                <div class="form-group">
                    <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary);">Report Scope</label>
                    <select id="reportMode" class="form-control" onchange="toggleReportInputs()">
                        <option value="utilized" selected>💳 Certified List (Paid / OK)</option>
                        <option value="active_baseline">🎓 Active Baseline Cohort (925)</option>
                        <option value="all">🏛️ Full Masterlist (All Records)</option>
                        <option value="pending">⚠️ Target for Renewal (Pending)</option>
                        <option value="overstaying">⏳ Overstaying (Sem 8+)</option>
                        <option value="atrisk">🚨 At-Risk (2 Consecutive Blank Sems)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary);">Target Semester</label>
                    <select id="reportSem" class="form-control" onchange="generateReport()">
                        <!-- Populated by JS -->
                    </select>
                    <div class="form-text" id="targetSemHelp" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Period being queried or validated.</div>
                </div>

                <div class="form-group" id="prevSemGroup" style="display: none;">
                    <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; color: var(--warning);">Qualifying Semester (Baseline)</label>
                    <select id="reportPrevSem" class="form-control" onchange="generateReport()">
                        <!-- Populated by JS -->
                    </select>
                    <div class="form-text" style="color: var(--warning); font-size: 0.75rem; margin-top: 4px;">Baseline semester used for cross-comparison.</div>
                </div>

                <div class="form-group">
                    <label style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary);">Primary Grouping</label>
                    <select id="reportGroup" class="form-control" onchange="generateReport()">
                        <option value="barangay">Barangay (31 Barangays)</option>
                        <option value="school">School / College</option>
                        <option value="yearLevel">Year Level</option>
                        <option value="course">Degree / Course</option>
                        <option value="sex">Sex / Gender</option>
                        <option value="tribe">Indigenous Tribe</option>
                        <option value="status">Academic Status</option>
                    </select>
                </div>

                <!-- PRE-FILTERS -->
                <div style="border-top: 1px solid var(--border); padding-top: 14px; margin-top: 14px; margin-bottom: 14px;">
                    <h4 style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.05em;">Refine Filters</h4>
                    
                    <div class="form-group" style="margin-bottom: 8px;">
                        <select id="reportFilterBrgy" class="form-control" style="font-size: 0.8rem;" onchange="generateReport()">
                            <option value="">All Barangays</option>
                            <option value="Alkikan">Alkikan</option><option value="Ampon">Ampon</option><option value="Atlae">Atlae</option><option value="Banahaw">Banahaw</option><option value="Banate">Banate</option><option value="Blaan">Blaan</option><option value="Datal Batong">Datal Batong</option><option value="Datal Bila">Datal Bila</option><option value="Datal Tampal">Datal Tampal</option><option value="J.P. Laurel">J.P. Laurel</option><option value="Kawayan">Kawayan</option><option value="Kibala">Kibala</option><option value="Kiblat">Kiblat</option><option value="Kinabalan">Kinabalan</option><option value="Lower Mainit">Lower Mainit</option><option value="Lutay">Lutay</option><option value="Malabod">Malabod</option><option value="Malalag Cogon">Malalag Cogon</option><option value="Malandag">Malandag</option><option value="Malungon Gamay">Malungon Gamay</option><option value="Nagpan">Nagpan</option><option value="Panamin">Panamin</option><option value="Poblacion">Poblacion</option><option value="San Juan">San Juan</option><option value="San Miguel">San Miguel</option><option value="San Roque">San Roque</option><option value="Talus">Talus</option><option value="Tamban">Tamban</option><option value="Upper Biangan">Upper Biangan</option><option value="Upper Lumabat">Upper Lumabat</option><option value="Upper Mainit">Upper Mainit</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 8px;">
                        <select id="reportFilterYear" class="form-control" style="font-size: 0.8rem;" onchange="generateReport()">
                            <option value="">All Year Levels</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="5th Year">5th Year</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 8px;">
                        <select id="reportFilterSex" class="form-control" style="font-size: 0.8rem;" onchange="generateReport()">
                            <option value="">All Genders</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 8px;">
                        <select id="reportFilterStatus" class="form-control" style="font-size: 0.8rem;" onchange="generateReport()">
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="EXTENDED">EXTENDED</option>
                            <option value="NEW">NEW</option>
                            <option value="PROBATION">PROBATION</option>
                            <option value="WARNING">WARNING</option>
                            <option value="ON-LEAVE (MEDICAL)">ON-LEAVE (MEDICAL)</option>
                            <option value="ON-LEAVE (FINANCIAL)">ON-LEAVE (FINANCIAL)</option>
                            <option value="STOPPED">STOPPED</option>
                            <option value="GRADUATED">GRADUATED</option>
                            <option value="DELISTED">DELISTED</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top: 18px;">
                    <button class="btn btn-primary" style="width: 100%; margin-bottom: 8px; font-weight: 700;" onclick="generateReport()">
                        &#8635; Recalculate Report
                    </button>
                    <button class="btn btn-ghost" style="width: 100%; font-size: 0.8rem;" onclick="resetReportFilters()">
                        Reset Filters
                    </button>
                </div>

                <div style="margin-top: 24px; border-top: 1px solid var(--border); padding-top: 16px;">
                    <div id="reportTotalLabel" style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Total Cohort Count</div>
                    <div id="reportTotalCount" style="font-size: 2.3rem; font-weight: 800; color: var(--primary); letter-spacing: -0.02em;">0</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Matching current scope & filters</div>
                    <span id="reportGroupCount" style="display: none;">0</span>
                    <span id="reportActiveFilterCount" style="display: none;">0</span>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="report-main">
                
                <!-- Smart Insights Strip (Dynamic) -->
                <div id="reportInsights" style="display: none; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 20px; animation: slideUp 0.3s ease;">
                    <!-- Rendered via JS -->
                </div>

                <!-- CHART + SUMMARY SPLIT -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <!-- TABLE SUMMARY -->
                    <div class="summary-box">
                        <div class="summary-header">
                            <span style="font-weight: 800;">Summary Breakdown</span>
                            <button class="btn btn-sm btn-ghost" onclick="exportSummaryCSV()" title="Download Summary as CSV">⬇️ Export CSV</button>
                        </div>
                        <div style="max-height: 320px; overflow-y: auto;">
                            <table id="reportGroupTable" style="width: 100%;">
                                <thead style="position: sticky; top: 0; z-index: 10;">
                                    <tr><th>Category</th><th style="text-align: right;">Count</th><th style="text-align: right; width: 25%;">Share</th></tr>
                                </thead>
                                <tbody id="reportSummaryBody">
                                    <tr><td colspan="3" style="text-align: center; color: var(--text-muted); font-weight: 500; padding: 30px;">Select options to generate report</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- DATA VISUALIZATION (CHART.JS) -->
                    <div class="summary-box" style="padding: 16px; display: flex; flex-direction: column; justify-content: center; background: var(--bg-surface);">
                        <canvas id="reportChart" style="max-height: 280px; width: 100%; display: none;"></canvas>
                        <div id="chartPlaceholder" style="text-align: center; color: var(--text-muted); font-weight: 500; padding: 40px 0;">
                            <div style="font-size: 2.2rem; margin-bottom: 8px;">📊</div>
                            Visual breakdown will appear here.
                        </div>
                    </div>
                </div>

                <!-- DETAILED LIST (PAGINATED) -->
                <div class="summary-box">
                    <div class="summary-header">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span id="detailListTitle" style="font-weight: 800;">Detailed List</span>
                            <span class="badge badge-payroll" id="detailListCount">0 Records</span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-sm btn-ghost" onclick="exportDetailCSV()">⬇️ Export List</button>
                            <button class="btn btn-sm btn-ghost" onclick="printReportList()">🖨️ Print List</button>
                        </div>
                    </div>
                    <div style="min-height: 220px; max-height: 480px; overflow-y: auto;">
                        <table style="width: 100%;">
                            <thead style="position: sticky; top: 0; z-index: 10;">
                                <tr><th>No</th><th>IBM ID</th><th>Scholar Name</th><th>School / University</th><th>Course & Year</th><th>Status</th></tr>
                            </thead>
                            <tbody id="reportDetailBody">
                                <tr><td colspan="6" style="text-align: center; color: var(--text-muted); font-weight: 500; padding: 30px;">Select a category above to view detailed scholar roster</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- Detail Pagination -->
                    <div class="pagination-bar" id="reportPaginationBar" style="display: none;">
                        <div class="page-info" id="reportPageInfo">Showing 0 to 0</div>
                        <div class="pagination-controls">
                            <button class="page-btn" id="btnPrevReport" onclick="changeReportPage(-1)">Previous</button>
                            <button class="page-btn" id="btnNextReport" onclick="changeReportPage(1)">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SUB-TAB 2: CROSS-TABULATION PIVOT MATRICES -->
    <div id="matrixSummaryContainer" class="report-sub-view" style="display: none;">
        <!-- Matrix Top Controls -->
        <div class="summary-box" style="margin-bottom: 20px; padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: 800; font-size: 0.9rem; text-transform: uppercase; color: var(--text-secondary);">Matrix Dimension:</span>
                    <select id="matrixDimensionSelector" class="form-control" style="font-weight: 700; width: auto; font-size: 0.85rem;" onchange="renderSelectedMatrix()">
                        <option value="brgy_year" selected>Barangay vs. Year Level</option>
                        <option value="status_year">Academic Status vs. Year Level</option>
                        <option value="school_year">Top Schools vs. Year Level</option>
                    </select>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm btn-ghost" onclick="printMatrixReport()">🖨️ Print Matrix</button>
                    <button class="btn btn-sm btn-ghost" onclick="exportMatrixCSV()">⬇️ Export Matrix CSV</button>
                </div>
            </div>
        </div>

        <!-- Primary Matrix Card -->
        <div class="summary-box" style="margin-bottom: 24px;">
            <div class="summary-header">
                <span id="matrixMainTitle" style="font-weight: 800;">Matrix Breakdown: Barangay vs. Year Level</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">* Click any count to view scholars</span>
            </div>
            <div class="matrix-table-container">
                <table class="matrix-table" id="matrixTable">
                    <!-- Dynamic Content -->
                </table>
            </div>
        </div>

        <!-- Secondary Matrix Card: Status Breakdown -->
        <div class="summary-box" style="margin-bottom: 24px;" id="secondaryStatusMatrixBox">
            <div class="summary-header">
                <span style="font-weight: 800;">Academic Status vs. Year Level Breakdown</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">* Click any status count to inspect scholars</span>
            </div>
            <div class="matrix-table-container">
                <table class="matrix-table" id="statusMatrixTable">
                    <!-- Dynamic Content -->
                </table>
            </div>
        </div>

        <!-- Duration Matrix Card -->
        <div class="summary-box" id="durationMatrixContainer" style="margin-bottom: 24px;">
            <div class="summary-header">
                <span style="font-weight: 800;">Program Duration & Overstaying Analysis</span>
            </div>
            <div class="matrix-table-container">
                <table class="matrix-table" id="durationTable">
                    <!-- Dynamic Content -->
                </table>
            </div>
        </div>
    </div>

    <!-- SUB-TAB 3: SEMESTER RETENTION & MOVEMENT TRACKING -->
    <div id="trackingSummaryContainer" class="report-sub-view" style="display: none;">
        <div class="summary-box" style="margin-bottom: 24px;">
            <div class="summary-header" style="flex-wrap: wrap; gap: 10px;">
                <span id="trackingTitleSpan" style="font-weight: 800;">Payroll Tracking: Previous vs Current Semester</span>
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    
                    <!-- DB STATUS FILTER DROPDOWN -->
                    <select id="trackingDbStatusFilter" class="form-control" style="font-size: 0.75rem; padding: 6px 10px; width: auto; height: auto;" onchange="renderTrackingTable()">
                        <option value="">All DB Statuses</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="EXTENDED">EXTENDED</option>
                        <option value="NEW">NEW</option>
                        <option value="PROBATION">PROBATION</option>
                        <option value="WARNING">WARNING</option>
                        <option value="ON-LEAVE (MEDICAL)">ON-LEAVE (MEDICAL)</option>
                        <option value="ON-LEAVE (FINANCIAL)">ON-LEAVE (FINANCIAL)</option>
                        <option value="ON-HOLD">ON-HOLD</option>
                        <option value="STOPPED">STOPPED</option>
                        <option value="GRADUATED">GRADUATED</option>
                        <option value="DELISTED">DELISTED</option>
                    </select>

                    <select id="trackingBrgyFilter" class="form-control" style="font-size: 0.75rem; padding: 6px 10px; width: auto;" onchange="renderTrackingTable()">
                        <option value="">All Barangays</option>
                    </select>

                    <select id="trackingSchoolFilter" class="form-control" style="font-size: 0.75rem; padding: 6px 10px; width: auto; max-width: 180px;" onchange="renderTrackingTable()">
                        <option value="">All Schools</option>
                    </select>

                    <button class="btn btn-sm btn-ghost" onclick="renderTrackingTable('ALL')">👁️ Show All</button>
                    <button class="btn btn-sm btn-ghost" onclick="printTrackingMatrix()">🖨️ Print List</button>
                    <button class="btn btn-sm btn-secondary" onclick="exportTrackingCSV()">⬇️ Export CSV</button>
                </div>
            </div>
            
            <!-- Mini Stats for the Tracking -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; padding: 16px; background: var(--bg-surface); border-bottom: 1px solid var(--border);">
                <div class="stat-card trk-stat-card" id="card-BASELINE" style="padding: 14px; box-shadow: none; border: 1px solid var(--border); border-left: 4px solid var(--text-muted); cursor: pointer;" onclick="renderTrackingTable('BASELINE')">
                    <div class="label" style="color: var(--text-main); font-weight: 700;">Baseline (Prev Sem)</div>
                    <div class="value" id="trackingTotalBaseline" style="font-size: 1.6rem;">0</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Enrolled last semester</div>
                </div>
                <div class="stat-card trk-stat-card" id="card-PROCESSED" style="padding: 14px; box-shadow: none; border: 1px solid var(--border); border-left: 4px solid var(--primary); cursor: pointer;" onclick="renderTrackingTable('PROCESSED')">
                    <div class="label" style="color: var(--primary); font-weight: 700;">Processed (Target)</div>
                    <div class="value" id="trackingTotalTarget" style="font-size: 1.6rem; color: var(--primary);">0</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Renewed & paid current sem</div>
                </div>
                <div class="stat-card trk-stat-card" id="card-PENDING-MISSING" style="padding: 14px; box-shadow: none; border: 1px solid var(--border); border-left: 4px solid var(--warning); cursor: pointer;" onclick="renderTrackingTable('PENDING/MISSING')">
                    <div class="label" style="color: var(--warning); font-weight: 700;">Pending / Missing</div>
                    <div class="value" id="trackingTotalPending" style="font-size: 1.6rem; color: var(--warning);">0</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">In baseline but unrenewed</div>
                </div>
                <div class="stat-card trk-stat-card" id="card-NEW-RETURNING" style="padding: 14px; box-shadow: none; border: 1px solid var(--border); border-left: 4px solid var(--success); cursor: pointer;" onclick="renderTrackingTable('NEW/RETURNING')">
                    <div class="label" style="color: var(--success); font-weight: 700;">New / Returning</div>
                    <div class="value" id="trackingTotalReturning" style="font-size: 1.6rem; color: var(--success);">0</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Re-enrolled or new intake</div>
                </div>
            </div>

            <!-- TRACKING SUMMARY SECTION -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 16px 8px; flex-wrap: wrap; gap: 8px;">
                <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-main); text-transform: uppercase;">Tracking Summary Breakdown</h4>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700;">GROUP BY:</span>
                    <select id="trackingSummaryGroup" class="form-control" style="width: auto; font-size: 0.8rem; font-weight: bold; color: var(--primary);" onchange="renderTrackingSummary()">
                        <option value="barangay">Group by Barangay</option>
                        <option value="school">Group by School</option>
                        <option value="yearLevel">Group by Year Level</option>
                    </select>
                </div>
            </div>
            <div class="matrix-table-container" style="max-height: 380px; overflow-y: auto; margin-bottom: 20px; border-bottom: 1px solid var(--border);">
                <table class="matrix-table" id="trackingSummaryTable">
                    <!-- Dynamic Content -->
                </table>
            </div>

            <!-- Detailed Tracking Table -->
            <div class="matrix-table-container" style="max-height: 520px; overflow-y: auto;">
                <table class="matrix-table" id="trackingTable">
                    <!-- Dynamic Content goes here -->
                </table>
            </div>
        </div>
    </div>

    <!-- SUB-TAB 4: ALUMNI & LATIN HONORS MATRIX -->
    <div id="alumniMatrixContainer" class="report-sub-view" style="display: none;">
        <div class="summary-box" style="margin-bottom: 20px; padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">🎓 Iskolar Bayan Alumni Analytics</h3>
                    <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">Historical graduates demographic distribution & Latin honors achievement breakdown</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm btn-ghost" onclick="printAlumniMatrixReport()">🖨️ Print Alumni Report</button>
                    <button class="btn btn-sm btn-secondary" onclick="exportAlumniMatrixCSV()">⬇️ Export Alumni CSV</button>
                </div>
            </div>
        </div>

        <!-- Matrix 1: Barangay vs Graduation Batch -->
        <div class="summary-box" style="margin-bottom: 24px;">
            <div class="summary-header">
                <span style="font-weight: 800;">Alumni Matrix: Barangay vs. Graduation Batch</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">* Click any alumni count to view graduates</span>
            </div>
            <div class="matrix-table-container">
                <table class="matrix-table" id="alumniBatchMatrixTable">
                    <!-- Dynamic Content -->
                </table>
            </div>
        </div>

        <!-- Matrix 2: Latin Honors vs Graduation Batch -->
        <div class="summary-box" style="margin-bottom: 24px;">
            <div class="summary-header">
                <span style="font-weight: 800;">Academic Honors & Latin Awards Breakdown</span>
            </div>
            <div class="matrix-table-container">
                <table class="matrix-table" id="alumniHonorsMatrixTable">
                    <!-- Dynamic Content -->
                </table>
            </div>
        </div>
    </div>

</div>

<!-- UNIVERSAL INTERACTIVE MATRIX DRILL-DOWN MODAL -->
<div class="modal-overlay" id="reportDrilldownModal" style="display: none;">
    <div class="modal-body lgu-modal-body" style="max-width: 950px; width: 95%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
            <div>
                <h3 id="drilldownTitle" style="margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                    <span>🔎</span> Cohort Drill-Down
                </h3>
                <div id="drilldownSubtitle" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Filtered scholars matching matrix intersection</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button type="button" class="btn-lgu btn-lgu-secondary btn-lgu-sm" onclick="exportDrilldownCSV()">⬇️ Export CSV</button>
                <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="closeReportDrilldownModal()" style="font-size: 1.3rem; line-height: 1; padding: 4px 8px;">&times;</button>
            </div>
        </div>
        <div style="max-height: 58vh; overflow-y: auto;">
            <table class="table-lgu" style="width: 100%;">
                <thead style="position: sticky; top: 0; z-index: 10; background: var(--bg-surface-alt);">
                    <tr>
                        <th style="width: 5%;">No</th>
                        <th style="width: 15%;">IBM ID</th>
                        <th style="width: 25%;">Scholar Name</th>
                        <th style="width: 22%;">School / College</th>
                        <th style="width: 15%;">Year & Course</th>
                        <th style="width: 10%;">Barangay</th>
                        <th style="width: 8%;">Status</th>
                    </tr>
                </thead>
                <tbody id="drilldownTableBody">
                    <tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">Loading cohort data...</td></tr>
                </tbody>
            </table>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color);">
            <span id="drilldownCountBadge" class="badge-lgu badge-lgu-primary" style="font-size: 0.8rem;"><span id="drilldownTotalCount">0</span> Scholars</span>
            <button type="button" class="btn-lgu btn-lgu-ghost" onclick="closeReportDrilldownModal()">Close</button>
        </div>
    </div>
</div>

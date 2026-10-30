<?php
/**
 * Iskolar Registry View (Formerly Verification Tab)
 * Core database view with advanced filters, pagination, batch actions, and scholar records
 */
?>
<!-- VERIFICATION TAB (ISKOLAR REGISTRY) -->
<div id="verificationTab" class="view-panel" style="display: none;">
    
    <!-- Top KPI Strip -->
    <div class="stats-grid" style="margin-bottom: 20px;">
        <div class="stat-card" style="border-left: 4px solid var(--primary); cursor: pointer;" onclick="showActiveScholarsFromDashboard()" title="Filter Active Baseline Scholars">
            <div class="label" id="stat-active-label">Total Active (Baseline)</div>
            <div class="value" id="stat-total-active" style="color: var(--primary);">0</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; font-weight: 500;">
                Scholars with Active Status
            </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid var(--success);">
            <div class="label" id="stat-progress-label">Payroll Progress</div>
            <div class="value">
                <span id="stat-payroll-current" style="color: var(--success)">0</span>
                <span style="font-size: 1.2rem; color: var(--text-muted); font-weight: 600;">/</span>
                <span id="stat-payroll-total" style="font-size: 1.2rem; color: var(--text-secondary);">0</span>
            </div>
            
            <div style="width: 100%; background: var(--border); height: 6px; border-radius: 3px; margin-top: 8px; overflow:hidden;">
                <div id="stat-progress-bar" style="width: 0%; background: var(--success); height: 100%; transition: width 0.5s ease;"></div>
            </div>
            <div id="stat-pct-text" style="font-size: 0.75rem; color: var(--success); font-weight: 800; text-align: right; margin-top: 2px;">0% Complete</div>
        </div>

        <!-- OTHER GRANTS STAT CARD -->
        <div class="stat-card" style="border-left: 4px solid #e11d48; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
            <div style="font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Other Grants</div>
            <div id="statOtherGrants" style="font-size: 2rem; font-weight: 800; color: #0f172a; margin-top: 8px;">0</div>
            <div style="font-size: 0.75rem; color: #e11d48; margin-top: auto; font-weight: 500;">Moved to DOST/CHED/etc.</div>
        </div>
    </div>

    <!-- Quick Filter Chips -->
    <div class="filter-chips-bar" style="margin-bottom: 16px;">
        <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; align-self: center; margin-right: 4px;">Status:</span>
        <button type="button" class="filter-chip active" onclick="applyChipFilter('ALL', this)">All Scholars</button>
        <button type="button" class="filter-chip" onclick="applyChipFilter('ACTIVE', this)">Active Only</button>
        <button type="button" class="filter-chip" onclick="applyChipFilter('EXTENDED', this)">Extended</button>
        <button type="button" class="filter-chip" onclick="applyChipFilter('PROBATION', this)">Probation</button>
        <button type="button" class="filter-chip" onclick="applyChipFilter('WARNING', this)">Warning</button>
        <button type="button" class="filter-chip" onclick="applyChipFilter('ON-HOLD', this)">On-Hold</button>
        <button type="button" class="filter-chip" onclick="applyChipFilter('PENDING_RENEWAL', this)">Pending Renewal</button>
        <button type="button" class="filter-chip" onclick="applyChipFilter('GRADUATED', this)">Graduated</button>
        <button type="button" class="filter-chip" onclick="applyChipFilter('DELISTED', this)">Delisted</button>
    </div>

    <!-- Search and Actions Toolbar -->
    <div class="toolbar" style="flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
        <div class="search-container" style="display: flex; gap: 8px; align-items: center; min-width: 380px; flex-grow: 1;">
            <div style="position: relative; flex-grow: 1;">
                <span class="search-icon">&#128269;</span>
                <input type="text" class="search-input" id="searchV" placeholder="Search by name, ID, school, or course..." oninput="applyAdvancedFilters()">
            </div>
            <button class="btn btn-ghost btn-icon" onclick="toggleFilterPanel()" title="Advanced Filters" style="border: 1px solid var(--border);">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            </button>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-ghost" onclick="addNewSemesterDialog()"><span>+</span> New Semester</button>
            <button class="btn btn-ghost" id="btnBatchUpdate" onclick="openBatchUpdateModal()" style="display:none; border: 1px solid var(--primary); color: var(--primary); font-weight: 600;">Batch Edit (<span id="batchUpdateCount">0</span>)</button>
            <button class="btn btn-primary" id="btnBatch" onclick="openBatchModal()" style="display:none;">Batch Add (<span id="batchCount">0</span>)</button>
            
            <!-- BATCH GRADUATE BUTTON -->
            <button class="btn btn-ghost" id="btnBatchGrad" onclick="openBatchGraduateModal()" style="display:none; border: 1px solid #059669; color: #059669; font-weight: 600;">🎓 Batch Grad (<span id="batchGradCount">0</span>)</button>
            <button class="btn btn-ghost" id="btnBatchOtherGrant" onclick="openBatchOtherGrantModal()" style="display:none; border: 1px solid #e11d48; color: #e11d48; font-weight: 600;">🏅 Batch Grants (<span id="batchOtherGrantCount">0</span>)</button>
            
            <button class="btn btn-success" onclick="openScholarModal(false)"><span>+</span> New Scholar</button>
            <button class="btn btn-ghost" onclick="loadData()"><span>&#8635;</span> Sync</button>
        </div>
    </div>

    <!-- Advanced Filter Panel (Collapsible) -->
    <div id="advFilterPanel" style="display: none; background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px; box-shadow: var(--shadow-sm); animation: fadeIn 0.2s ease;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; align-items: end;">
            
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 0.05em; text-transform: uppercase;">BARANGAY</label>
                <select id="af-barangay" class="form-control" onchange="applyAdvancedFilters()">
                    <option value="">All Barangays</option>
                </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 0.05em; text-transform: uppercase;">YEAR LEVEL</label>
                <select id="af-year" class="form-control" onchange="applyAdvancedFilters()">
                    <option value="">All Levels</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 0.05em; text-transform: uppercase;">PAYROLL STATUS</label>
                <select id="af-payroll" class="form-control" onchange="applyAdvancedFilters()" style="font-weight: 700; color: var(--primary);">
                    <option value="">Show All</option>
                    <option value="yes">✅ In Payroll Only</option>
                    <option value="no">❌ Not In Payroll</option>
                </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 0.05em; text-transform: uppercase;">SEMESTER STATUS</label>
                <select id="af-sem-status" class="form-control" onchange="applyAdvancedFilters()" style="font-weight: 700; color: var(--success);">
                    <option value="">Show All</option>
                    <option id="opt-active-baseline" value="active_baseline">🎓 Active Scholars (Baseline)</option>
                    <option id="opt-active-curr" value="active_current">✅ Active: Current</option>
                    <option id="opt-active-prev" value="active_prev">⏳ Active: Previous</option>
                    <option id="opt-pending" value="pending">⚠️ Pending Renewal</option>
                </select>
            </div>

            <button class="btn btn-ghost btn-sm" onclick="resetFilters()" style="height: 40px; color: var(--danger); font-weight: 600;">Reset Filters</button>
        </div>
    </div>

    <!-- Table Container -->
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th class="chk-cell"><input type="checkbox" id="selectAll" onclick="toggleSelectAll()"></th>
                    <th>No</th>
                    <th>IBM ID</th>
                    <th>Scholar Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="vBody">
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Loading scholar records...</td></tr>
            </tbody>
        </table>
        
        <!-- PAGINATION CONTROLS -->
        <div class="pagination-bar">
            <div class="page-info" id="vPageInfo">Showing 0 to 0 of 0</div>
            <div class="pagination-controls">
                <button class="page-btn" id="btnPrev" onclick="changePage(-1)">Previous</button>
                <button class="page-btn" id="btnNext" onclick="changePage(1)">Next</button>
            </div>
        </div>
    </div>

    <!-- Floating Batch Action Bar (Appears when >= 1 scholar is checked) -->
    <div id="floatingBatchBar" class="batch-action-bar">
        <div style="font-weight: 700; color: var(--text-primary);">
            <span id="batchSelectedDisplayCount">0</span> scholars selected
        </div>
        <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-lgu btn-lgu-primary btn-lgu-sm" onclick="openBatchModal()">Add to Payroll</button>
            <button type="button" class="btn-lgu btn-lgu-secondary btn-lgu-sm" onclick="openBatchUpdateModal()">Batch Edit</button>
            <button type="button" class="btn-lgu btn-lgu-success btn-lgu-sm" onclick="openBatchGraduateModal()">Graduate</button>
            <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="clearAllSelections()" style="color: var(--danger);">Clear</button>
        </div>
    </div>

</div>

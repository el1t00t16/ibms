<?php
/**
 * Payroll Registry View
 * Manages disbursement periods, Landbank accounts, voucher tracking, and exports
 */
?>
<!-- PAYROLL TAB -->
<div id="payrollTab" class="view-panel" style="display: none;">
    
    <!-- KPI Strip -->
    <div class="stats-grid" style="margin-bottom: 20px;">
        <div class="stat-card" style="border-left: 4px solid var(--primary);">
            <div class="label">Payroll Registry Size</div>
            <div class="value" id="p-total" style="color: var(--primary);">0</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; font-weight: 500;">
                Current active disbursement entries
            </div>
        </div>

        <div class="stat-card" style="border-left: 4px solid var(--civic-gold);">
            <div class="label">Disbursement Channel</div>
            <div class="value" style="font-size: 1.5rem; color: var(--civic-gold);">Land Bank of the Philippines</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; font-weight: 500;">
                Direct Credit / ADA Account
            </div>
        </div>

        <div class="stat-card" style="border-left: 4px solid var(--emerald); display: flex; flex-direction: column; justify-content: space-between;">
            <div class="label">Payroll Quick Actions</div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button type="button" class="btn-lgu btn-lgu-primary btn-lgu-sm" onclick="openPrintModal()" style="flex: 1; justify-content: center;">
                    🖨️ Print Form / ADA
                </button>
                <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="exportData()" style="flex: 1; justify-content: center;">
                    📥 Export CSV
                </button>
            </div>
        </div>
    </div>
    
    <!-- Toolbar -->
    <div class="toolbar" style="margin-bottom: 16px;">
        <div class="search-container" style="max-width: 450px; flex-grow: 1;">
            <span class="search-icon">&#128269;</span>
            <input type="text" class="search-input" id="searchP" placeholder="Search by name, ID, or account number..." oninput="filterTable('p')">
        </div>
        
        <div style="display: flex; gap: 8px;">
            <button class="btn btn-ghost" onclick="loadData()"><span>&#8635;</span> Sync</button>
            <button class="btn btn-ghost" onclick="exportData()">📥 Export CSV</button>
        </div>
    </div>

    <!-- Payroll Table -->
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>IBM ID</th>
                    <th>Name</th>
                    <th>Account</th>
                    <th>Year</th>
                    <th>Period</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="pBody">
                <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">Loading payroll entries...</td></tr>
            </tbody>
        </table>
        
        <!-- PAYROLL PAGINATION BAR -->
        <div class="pagination-bar">
            <div class="page-info" id="pPageInfo">Showing 0 to 0 of 0</div>
            <div class="pagination-controls">
                <button class="page-btn" id="btnPrevP" onclick="changePageP(-1)">Previous</button>
                <button class="page-btn" id="btnNextP" onclick="changePageP(1)">Next</button>
            </div>
        </div>
    </div>
</div>

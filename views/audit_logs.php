<?php
/**
 * System Audit Trail View
 * Provides transparency and accountability for all administrative changes, logins, and status updates
 */
?>
<!-- AUDIT LOGS TAB -->
<div id="auditLogsTab" class="view-panel" style="display: none;">
    <div class="card-lgu" style="margin-bottom: 20px;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
                <h3 class="card-title">System Audit Trail</h3>
                <p class="card-subtitle">Chronological record of system activities, database modifications, and user sessions</p>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="loadAuditLogs()">🔄 Refresh Trail</button>
                <button type="button" class="btn-lgu btn-lgu-secondary btn-lgu-sm" onclick="exportAuditLogsCSV()">⬇️ Export Trail</button>
            </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap;">
            <div class="search-container" style="flex-grow: 1; min-width: 280px;">
                <span class="search-icon">&#128269;</span>
                <input type="text" class="search-input" id="searchAudit" placeholder="Search actions, users, or scholar IDs..." oninput="filterAuditLogs()">
            </div>
            <select id="auditActionFilter" class="form-control" style="width: auto; min-width: 180px; font-size: 0.85rem;" onchange="filterAuditLogs()">
                <option value="">All Actions</option>
                <option value="EDIT_SCHOLAR">✏️ EDIT_SCHOLAR</option>
                <option value="ADD_SCHOLAR">➕ ADD_SCHOLAR</option>
                <option value="BATCH">⚡ BATCH ACTIONS</option>
                <option value="PAYROLL">💳 PAYROLL</option>
                <option value="DISMISSAL">⚖️ DISMISSAL</option>
                <option value="GRADUATE">🎓 ALUMNI</option>
                <option value="LOGIN">🔐 LOGIN / SESSIONS</option>
            </select>
        </div>
    </div>

    <!-- Audit Logs Table -->
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details / Changes</th>
                    <th>IP Address</th>
                </tr>
            </thead>
            <tbody id="auditLogsBody">
                <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Loading audit trail...</td></tr>
            </tbody>
        </table>

        <!-- Audit Pagination Bar -->
        <div class="pagination-bar">
            <div class="page-info" id="auditPageInfo">Showing 0 to 0 of 0 entries</div>
            <div class="pagination-controls">
                <button class="page-btn" id="btnPrevAudit" onclick="changeAuditPage(-1)">Previous</button>
                <button class="page-btn" id="btnNextAudit" onclick="changeAuditPage(1)">Next</button>
            </div>
        </div>
    </div>
</div>

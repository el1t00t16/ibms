<?php
/**
 * Requirements Validation View
 * Controls student submission portal, semester document uploads, and validation approvals
 */
?>
<!-- REQUIREMENTS VALIDATION TAB -->
<div id="requirementsTab" class="view-panel" style="display: none;">
    
    <!-- Settings Control Panel -->
    <div class="settings-panel card-lgu" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; padding: 18px 24px;">
        <div style="min-width: 200px;">
            <h3 style="margin: 0 0 4px; font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">Student Upload Portal Control</h3>
            <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center;">
                <span id="reqStatusDot" class="status-dot dot-closed"></span>
                <span style="margin-left: 6px;">Portal Status:</span>
                <strong id="reqStatusText" style="margin-left: 4px;">CLOSED</strong>
            </div>
        </div>
        
        <div style="display: flex; gap: 12px; align-items: flex-end; flex-grow: 1; max-width: 520px;">
            <div style="flex: 1;">
                <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--text-secondary); margin-bottom:4px; text-transform: uppercase;">Active Semester for Uploads</label>
                <select id="reqActiveSemester" class="form-control" style="width: 100%;">
                    <!-- Populated dynamically via JS -->
                </select>
            </div>
            <button class="btn btn-primary" id="btnToggleReqs" onclick="toggleRequirementPortal()" style="height: 42px; white-space: nowrap;">Open Portal</button>
        </div>
        
        <div style="display: flex; gap: 8px;">
            <button class="btn btn-ghost" onclick="loadRequirementsData()"><span>&#8635;</span> Refresh</button>
            <button class="btn-lgu btn-lgu-secondary btn-lgu-sm" onclick="window.open('upload_requirement.php', '_blank')">🌐 View Student Form</button>
        </div>
    </div>

    <!-- Filter Controls -->
    <div style="margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-ghost" style="border-color: var(--primary); color: var(--primary); font-weight: 600;" onclick="filterReqTable('PENDING')">Show Pending</button>
        <button class="btn btn-ghost" onclick="filterReqTable('APPROVED')">Show Approved</button>
        <button class="btn btn-ghost" onclick="filterReqTable('REJECTED')">Show Rejected</button>
        <button class="btn btn-ghost" onclick="filterReqTable('ALL')">Show All</button>
    </div>

    <!-- Requirements Table -->
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Date Submitted</th>
                    <th>IBM ID</th>
                    <th>Scholar Name</th>
                    <th>Semester</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="reqBody">
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Loading requirements data...</td></tr>
            </tbody>
        </table>
    </div>
</div>

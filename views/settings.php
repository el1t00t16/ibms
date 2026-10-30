<?php
/**
 * Portal Settings View
 * System administration, semester lifecycle, database backups, and security management
 */
?>
<!-- SETTINGS TAB -->
<div id="settingsTab" class="view-panel" style="display: none;">
    <div style="max-width: 960px; margin: 0 auto;">
        
        <!-- System Health & Overview -->
        <div class="card-lgu" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3 class="card-title">Portal Administration & Environment</h3>
                <p class="card-subtitle">Server parameters, active database connections, and operational configuration</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-top: 14px;">
                <div style="padding: 14px; background: var(--bg-surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted);">Database Name</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-top: 4px;">ibms_db (MySQL)</div>
                    <div style="font-size: 0.75rem; color: var(--emerald); font-weight: 600; margin-top: 2px;">● Connected via PDO</div>
                </div>

                <div style="padding: 14px; background: var(--bg-surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted);">Host & Port</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-top: 4px;">localhost:3306</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">XAMPP Apache Server</div>
                </div>

                <div style="padding: 14px; background: var(--bg-surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted);">Total Scholars</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--malungon-navy); margin-top: 4px;" id="settingsTotalScholars">2,376</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Masterlist rows</div>
                </div>

                <div style="padding: 14px; background: var(--bg-surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted);">Total Alumni</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--civic-gold); margin-top: 4px;" id="settingsTotalGraduates">1,227</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Graduated beneficiaries</div>
                </div>
            </div>
        </div>

        <!-- Semester Lifecycle Management -->
        <div class="card-lgu" style="margin-bottom: 24px;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h3 class="card-title">Academic Semester Management</h3>
                    <p class="card-subtitle">Manage registered academic semesters and initialize new grant terms</p>
                </div>
                <button type="button" class="btn-lgu btn-lgu-primary btn-lgu-sm" onclick="addNewSemesterDialog()">➕ Add New Semester</button>
            </div>
            
            <div style="margin-top: 14px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Registered Semesters in Database:</div>
                <div id="settingsSemestersList" style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <!-- Semesters loaded dynamically -->
                    <span class="badge-lgu badge-lgu-neutral">Loading semesters...</span>
                </div>
            </div>
        </div>

        <!-- Database Backups & Data Protection -->
        <div class="card-lgu" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3 class="card-title">Database Maintenance & Local Backups</h3>
                <p class="card-subtitle">Safeguard all scholar records and semester histories with one-click database export</p>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-top: 14px; padding: 18px; background: rgba(12, 35, 64, 0.03); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
                <div>
                    <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">Export Complete Database (SQL Dump)</div>
                    <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted); max-width: 500px;">
                        Generates a full SQL backup file containing the entire schema, all 2,376+ scholars, 13,800+ semester marks, 1,227 graduates, and audit trails.
                    </p>
                </div>
                <button type="button" class="btn-lgu btn-lgu-secondary" onclick="backupDatabase()">
                    💾 Download SQL Backup
                </button>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-top: 14px; padding: 18px; background: rgba(5, 150, 105, 0.04); border-radius: var(--radius-md); border: 1px dashed #a7f3d0;">
                <div>
                    <div style="font-weight: 700; font-size: 0.95rem; color: #047857;">Re-Import from Excel Sheet (ibms-database from sheet.xlsx)</div>
                    <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted); max-width: 500px;">
                        Re-parses the master Excel spreadsheet, refreshes all 11 semester columns, and reloads all scholar milestones.
                    </p>
                </div>
                <button type="button" class="btn-lgu btn-lgu-success" onclick="triggerExcelReimport()">
                    🔄 Re-Import from Excel
                </button>
            </div>
        </div>

        <!-- Security & Access Credentials -->
        <div class="card-lgu">
            <div class="card-header">
                <h3 class="card-title">Administrator Security & Password</h3>
                <p class="card-subtitle">Update portal administrative credentials and access control</p>
            </div>

            <form id="changePasswordForm" onsubmit="handlePasswordChange(event)" style="max-width: 480px; margin-top: 14px;">
                <div class="form-group" style="margin-bottom: 14px;">
                    <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Current Password</label>
                    <input type="password" id="currPassword" class="form-control" required placeholder="Enter current admin password">
                </div>
                <div class="form-group" style="margin-bottom: 14px;">
                    <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">New Password</label>
                    <input type="password" id="newPassword" class="form-control" required placeholder="At least 6 characters">
                </div>
                <div class="form-group" style="margin-bottom: 18px;">
                    <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Confirm New Password</label>
                    <input type="password" id="confirmPassword" class="form-control" required placeholder="Confirm new password">
                </div>
                <button type="submit" class="btn-lgu btn-lgu-primary">Update Admin Password</button>
            </form>
        </div>

    </div>
</div>

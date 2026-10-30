<?php
/**
 * Payroll Entry Modal
 * Component for adding/editing individual scholar payroll entries
 */
?>
<!-- PAYROLL ENTRY MODAL -->
<div class="modal-overlay" id="payrollModal">
    <div class="modal-body lgu-modal-body" style="max-width: 520px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5rem;">💳</span>
                <div>
                    <h3 id="modalTitle" style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">Payroll Registry Entry</h3>
                    <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--text-muted);">Manage disbursement records, Landbank accounts, and period status</p>
                </div>
            </div>
            <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="closeModal()" style="font-size: 1.2rem; line-height: 1; padding: 4px 8px;">&times;</button>
        </div>
        
        <form id="payrollForm">
            <input type="hidden" id="f-row">
            
            <div class="form-group" style="margin-bottom: 14px;">
                <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Scholar Name & ID</label>
                <input type="text" id="f-display" class="form-control" readonly style="font-weight: 600; background: var(--bg-surface-alt);">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div class="form-group">
                    <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">LandBank Account No</label>
                    <input type="text" id="f-account" class="form-control" placeholder="10-digit LBP account">
                </div>
                <div class="form-group">
                    <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Year Level</label>
                    <select id="f-year" class="form-control">
                        <option value="">Select Year Level</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                    </select>
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
                <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Payroll Period *</label>
                <select id="f-period" class="form-control" required></select>
            </div>

            <div class="form-group" style="margin-bottom: 20px;">
                <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Remarks / Voucher Reference</label>
                <input type="text" id="f-remarks" class="form-control" placeholder="Optional disbursement or voucher notes">
            </div>

            <div style="display: flex; gap: 12px;">
                <button type="submit" class="btn-lgu btn-lgu-primary" style="flex: 1; justify-content: center;">Save Entry</button>
                <button type="button" class="btn-lgu btn-lgu-ghost" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>

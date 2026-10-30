<?php
/**
 * Batch Payroll Entry Modal
 */
?>
<div class="modal-overlay" id="batchModal">
    <div class="modal-body" style="max-width: 650px;">
        <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--lgu-navy); margin-bottom: 6px;">Batch Payroll Enrollment</h2>
        <p style="margin-bottom: 16px; color: var(--text-secondary); font-size: 0.9rem;">
            You are about to add <strong id="batchDisplayCount" style="color: var(--primary);">0</strong> selected scholar(s) to the active payroll registry.
        </p>
        
        <div class="batch-review-box" style="max-height: 240px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 20px;">
            <table class="batch-table" style="width: 100%; font-size: 0.85rem;">
                <thead style="position: sticky; top: 0; background: var(--bg-surface-alt);">
                    <tr>
                        <th style="padding: 10px;">IBM ID</th>
                        <th style="padding: 10px;">Name</th>
                        <th style="padding: 10px;">LBP Account</th>
                    </tr>
                </thead>
                <tbody id="batchReviewBody"></tbody>
            </table>
        </div>

        <form id="batchForm">
            <div class="form-group">
                <label>Target Grant Period / Semester *</label>
                <select id="b-period" class="form-control" required style="font-weight: 700; color: var(--primary);"></select>
                <small style="color: var(--text-muted); font-size: 0.75rem; display: block; margin-top: 4px;">
                    * Scholars will be marked as "OK" in this semester column automatically.
                </small>
            </div>
            
            <div class="form-group">
                <label>Batch Remarks (Optional)</label>
                <input type="text" id="b-remarks" class="form-control" placeholder="e.g. 1st Batch - Direct Payout">
            </div>

            <div class="form-group" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 12px; margin-top: 12px;">
                <label style="display: flex; align-items: flex-start; gap: 8px; margin: 0; cursor: pointer;">
                    <input type="checkbox" id="b-auto-promote" checked style="margin-top: 3px;">
                    <span style="font-size: 0.82rem; color: #166534; font-weight: 700;">
                        Auto-promote continuing scholars to next Year Level (1st Sem only)
                        <span style="display: block; font-size: 0.73rem; color: #4b5563; font-weight: 400; margin-top: 2px;">
                            🛡️ <strong>Smart Shield Active:</strong> Newly added intake grantees (with no prior semester history) will stay in their current Year Level and will NOT be promoted.
                        </span>
                    </span>
                </label>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 20px;">
                <button type="submit" class="btn-lgu btn-lgu-primary" style="flex: 1; padding: 13px;">Confirm & Enroll to Payroll</button>
                <button type="button" class="btn-lgu btn-lgu-ghost" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>

<?php
/**
 * Dismissal / Disciplinary Action Modal
 * Component for processing scholar violations, status changes, and academic deficiencies
 */
?>
<!-- DISMISSAL / DISCIPLINARY MODAL -->
<div class="modal-overlay" id="dismissalModal">
    <div class="modal-body lgu-modal-body" style="max-width: 580px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5rem;">⚖️</span>
                <div>
                    <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--danger);">Disciplinary & Status Action</h3>
                    <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--text-muted);">Process violation and apply official municipal scholarship guidelines</p>
                </div>
            </div>
            <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="closeModal()" style="font-size: 1.2rem; line-height: 1; padding: 4px 8px;">&times;</button>
        </div>
        
        <form id="dismissalForm">
            <input type="hidden" id="d-row-index">
            <input type="hidden" id="d-ibm-id">
            
            <div class="form-group" style="margin-bottom: 14px;">
                <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Scholar Name & ID</label>
                <input type="text" id="d-scholar-name" class="form-control" readonly style="font-weight: 600; background: var(--bg-surface-alt);">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div class="form-group">
                    <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Reason / Category *</label>
                    <select id="d-type" class="form-control" onchange="updateDismissalPreview()" required>
                        <option value="">Select Reason / Status</option>
                        <option value="Graduated">🎓 Graduated</option>
                        <option value="ACADEMIC">📉 Grade Deficiency (Failed Subjects)</option>
                        <option value="COMPLIANCE">⚠️ Non-Compliance / Attendance</option>
                        <option value="MEDICAL">🏥 On-Leave (Medical) - ❄️ Frozen</option>
                        <option value="FINANCIAL">⏳ On-Leave (Financial/Other) - Counts</option>
                        <option value="MAJOR">🚨 Major Offense / Misconduct</option>
                        <option value="VOLUNTARY">🚪 Voluntary Withdrawal</option>
                        <option value="OTHER_SCHOLARSHIP">🏅 External Scholarship (Double Grant)</option>
                        <option value="DEATH">🕊️ Deceased</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Date of Incident / Effectivity *</label>
                    <input type="date" id="d-date" class="form-control" required>
                </div>
            </div>

            <!-- Conditional Section for Grades -->
            <div class="form-group" id="d-grade-section" style="display:none; margin-bottom: 14px; background: rgba(239, 68, 68, 0.05); padding: 12px; border-radius: var(--radius-md); border: 1px dashed var(--danger);">
                <label style="font-size: 0.8rem; font-weight: 700; color: var(--danger); margin-bottom: 6px; display: block;">Number of Failed Subjects *</label>
                <input type="number" id="d-fail-count" class="form-control" min="0" value="0" oninput="updateDismissalPreview()">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Policy: 1 Fail = Probation status, 2 or more Fails = Delisted / Dismissed</div>
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
                <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Remarks / Specific Details</label>
                <textarea id="d-remarks" class="form-control" rows="2" placeholder="Add specific administrative notes or resolution details..."></textarea>
            </div>

            <!-- Dynamic Decision Preview -->
            <div id="d-preview" class="dismissal-preview" style="padding: 14px; border-radius: var(--radius-md); background: var(--bg-surface-alt); border: 1px solid var(--border-color); margin-bottom: 20px;">
                <label style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.06em; color: var(--text-muted); display: block; margin-bottom: 4px;">Resulting Administrative Action</label>
                <div id="d-preview-text" style="font-weight: 700; font-size: 1.05rem; color: var(--text-primary);">Waiting for input...</div>
            </div>

            <div style="display: flex; gap: 12px;">
                <button type="submit" class="btn-lgu btn-lgu-danger" style="flex: 1; justify-content: center;">Confirm Action</button>
                <button type="button" class="btn-lgu btn-lgu-ghost" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>

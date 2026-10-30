<?php
/**
 * View Scholar Modal (Backup & Certificate Modal)
 * Preserved for full compatibility with legacy printScholarProfile and initiateCertificate
 */
?>
<!-- VIEW SCHOLAR MODAL -->
<div class="modal-overlay" id="viewModal">
    <div class="modal-body lgu-modal-body" style="max-width: 750px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5rem;">📜</span>
                <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">Scholar Record Profile</h3>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" style="color:var(--danger);" onclick="promptAddOtherGrant(currentViewScholar.ibmId, currentViewScholar.fullName)">🏅 Other Grant</button>
                <button type="button" class="btn-lgu btn-lgu-secondary btn-lgu-sm" onclick="initiateCertificate()">📜 Certificate</button>
                <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="printScholarProfile()">🖨️ Print Record</button>
                <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="closeModal()" style="font-size: 1.2rem; line-height: 1; padding: 4px 8px;">&times;</button>
            </div>
        </div>
        <div id="viewContent" style="max-height: 60vh; overflow-y: auto;"></div>
        <div style="text-align: right; margin-top: 20px; padding-top: 12px; border-top: 1px solid var(--border-color);">
            <button type="button" class="btn-lgu btn-lgu-ghost" onclick="closeModal()">Close</button>
        </div>
    </div>
</div>

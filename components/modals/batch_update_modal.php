<?php
/**
 * Batch Update Scholars Modal
 */
?>
<div class="modal-overlay" id="batchUpdateModal">
    <div class="modal-body" style="max-width: 860px;">
        <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--lgu-navy); margin-bottom: 6px;">Batch Update Scholars</h2>
        <p style="margin-bottom: 16px; color: var(--text-secondary); font-size: 0.9rem;">
            Updating <strong id="buDisplayCount" style="color: var(--primary);">0</strong> selected scholar(s). 
            Adjust common attributes below, or modify individual year levels in the table.
        </p>
        
        <form id="batchUpdateForm">
            <!-- COMMON ATTRIBUTES -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label>School Year (All Selected)</label>
                    <input type="text" id="bu-sy" class="form-control" placeholder="e.g. 2026-2027 (Blank to keep)">
                </div>
                <div class="form-group">
                    <label>Status (All Selected)</label>
                    <select id="bu-status" class="form-control">
                        <option value="">-- No Change --</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="EXTENDED">EXTENDED</option>
                        <option value="NEW">NEW</option>
                        <option value="PROBATION">PROBATION</option>
                        <option value="WARNING">WARNING</option>
                        <option value="STOPPED">STOPPED</option>
                        <option value="GRADUATED">GRADUATED</option>
                        <option value="DELISTED">DELISTED</option>
                    </select>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label>Course (All Selected)</label>
                    <input type="text" id="bu-course" class="form-control" list="dl-courses" placeholder="Blank to keep">
                </div>
                <div class="form-group">
                    <label>School (All Selected)</label>
                    <input type="text" id="bu-school" class="form-control" list="dl-schools" placeholder="Blank to keep">
                </div>
            </div>

            <div class="form-group">
                <label>Remarks (All Selected)</label>
                <input type="text" id="bu-remarks" class="form-control" placeholder="Append to or set remark (Blank to keep)">
            </div>

            <!-- INDIVIDUAL YEAR LEVEL TABLE -->
            <div style="margin-top: 20px; border-top: 1px solid var(--border); padding-top: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <label style="font-size: 0.82rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary);">
                        Individual Year Levels
                    </label>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <span style="font-size: 0.75rem; color: var(--text-muted);">Quick set all:</span>
                        <button type="button" class="btn-lgu btn-lgu-ghost" style="padding: 3px 10px; font-size: 0.75rem;" onclick="setAllBatchYears('1st Year')">1st</button>
                        <button type="button" class="btn-lgu btn-lgu-ghost" style="padding: 3px 10px; font-size: 0.75rem;" onclick="setAllBatchYears('2nd Year')">2nd</button>
                        <button type="button" class="btn-lgu btn-lgu-ghost" style="padding: 3px 10px; font-size: 0.75rem;" onclick="setAllBatchYears('3rd Year')">3rd</button>
                        <button type="button" class="btn-lgu btn-lgu-ghost" style="padding: 3px 10px; font-size: 0.75rem;" onclick="setAllBatchYears('4th Year')">4th</button>
                    </div>
                </div>

                <div class="batch-review-box" style="max-height: 260px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-sm);">
                    <table class="batch-table" style="width: 100%; font-size: 0.85rem;">
                        <thead style="position: sticky; top: 0; background: var(--bg-surface-alt);">
                            <tr>
                                <th style="padding: 10px; width: 25%;">IBM ID</th>
                                <th style="padding: 10px; width: 45%;">Name</th>
                                <th style="padding: 10px; width: 30%;">Year Level</th>
                            </tr>
                        </thead>
                        <tbody id="buReviewBody"></tbody>
                    </table>
                </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button type="submit" class="btn-lgu btn-lgu-primary" style="flex: 1; padding: 13px;">Apply Batch Updates</button>
                <button type="button" class="btn-lgu btn-lgu-ghost" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>

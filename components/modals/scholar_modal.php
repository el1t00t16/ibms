<?php
/**
 * Add / Edit Scholar Modal
 */
?>
<div class="modal-overlay" id="scholarModal">
    <div class="modal-body" style="max-width: 720px;">
        <h2 id="scholarModalTitle" style="font-size: 1.4rem; font-weight: 800; color: var(--lgu-navy); margin-bottom: 20px;">Add New Scholar</h2>
        
        <form id="scholarForm">
            <input type="hidden" id="ns-row-index">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label>School Year *</label>
                    <input type="text" id="ns-sy" class="form-control" required placeholder="e.g. 2025-2026">
                </div>
                <div class="form-group">
                    <label>IBM ID (Auto-Generated)</label>
                    <input type="text" id="ns-ibm" class="form-control" readonly placeholder="Auto-generated on save" style="font-family: monospace; font-weight: bold; background: var(--bg-surface-alt);">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; gap: 14px;">
                <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" id="ns-first" class="form-control" required placeholder="First Name">
                </div>
                <div class="form-group">
                    <label>Middle Name</label>
                    <input type="text" id="ns-middle" class="form-control" placeholder="Middle Name">
                </div>
                <div class="form-group">
                    <label>Last Name *</label>
                    <input type="text" id="ns-last" class="form-control" required placeholder="Last Name">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label>Sex / Gender</label>
                    <select id="ns-sex" class="form-control">
                        <option value="">Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Tribe / Ethnicity</label>
                    <select id="ns-tribe" class="form-control">
                        <option value="">Select Tribe</option>
                    </select>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label>Course / Program</label>
                    <input type="text" id="ns-course" class="form-control" list="dl-courses" placeholder="Type or select degree">
                </div>
                <div class="form-group">
                    <label>School / University</label>
                    <input type="text" id="ns-school" class="form-control" list="dl-schools" placeholder="Type or select institution">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div class="form-group">
                    <label>School ID Number</label>
                    <input type="text" id="ns-school-id" class="form-control" placeholder="Institutional Student ID">
                </div>
                <div class="form-group">
                    <label>Contact Mobile Number</label>
                    <input type="text" id="ns-contact" class="form-control" placeholder="09xxxxxxxxx">
                </div>
            </div>

            <div class="form-group">
                <label>Barangay *</label>
                <select id="ns-barangay" class="form-control" required>
                    <option value="">Select Barangay</option>
                </select>
            </div>

            <div style="display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 14px;">
                <div class="form-group">
                    <label>Landbank Account No.</label>
                    <input type="text" id="ns-lbp" class="form-control" placeholder="LBP Account #" style="font-family: monospace;">
                </div>
                <div class="form-group">
                    <label>Starting Year</label>
                    <select id="ns-starting-year" class="form-control">
                        <option value="">Select</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Current Year</label>
                    <select id="ns-year" class="form-control">
                        <option value="">Select</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                    </select>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 16px;">
                <div class="form-group">
                    <label>Status</label>
                    <select id="ns-status" class="form-control">
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
                <div class="form-group">
                    <label>Remarks</label>
                    <input type="text" id="ns-remarks" class="form-control" placeholder="Optional administrative note">
                </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 28px;">
                <button type="submit" class="btn-lgu btn-lgu-primary" style="flex: 1; padding: 13px;">Save Scholar Record</button>
                <button type="button" class="btn-lgu btn-lgu-ghost" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>

<datalist id="dl-schools"></datalist>
<datalist id="dl-courses"></datalist>

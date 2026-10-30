<!-- PRINT MANAGER - PRESERVED 100% AS IS PER REQUIREMENT -->
<div class="modal-overlay" id="printModal">
    <div class="modal-body">
        <h2>Print Manager</h2>
        
        <div class="form-group">
            <label>Print Type</label>
            <select id="printType" class="form-control" onchange="togglePrintInputs()">
                <option value="list">Admin & Accounting List (Portrait)</option>
                <option value="form">Official IBM Payroll Form (Landscape)</option>
                <option value="furs">Fund Utilization Request (FURS)</option>
                <option value="ada">Authority to Debit Account (ADA)</option>
                <option value="finance">💰 Financial Expenditure Report</option>
                <option value="financialList">🧾 Total Claimed Financial List</option>
            </select>
        </div>
        
        <div id="rangeInputContainer" class="form-group">
            <label>Print Range</label>
            <input type="text" id="printRange" class="form-control" placeholder="Empty for all (e.g., 1-20)">
            <div class="form-text">For official forms, use 1-20, 21-40 etc. for best results.</div>
        </div>

        <div id="adaInputContainer" style="display: none;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                 <div class="form-group">
                    <label>ADA No.</label>
                    <input type="text" id="adaNo" class="form-control" placeholder="e.g. 2026-02-009">
                </div>
                 <div class="form-group">
                    <label>ADA Date</label>
                    <input type="date" id="adaDate" class="form-control">
                </div>
            </div>
            <div style="margin-bottom: 12px; font-weight: 800; font-size: 0.9rem; color: var(--text-secondary); display:flex; justify-content:space-between; align-items:center; text-transform: uppercase; letter-spacing: 0.05em;">
                <span>ADA Entries</span>
                <button type="button" class="btn btn-sm btn-ghost" onclick="addAdaEntryRow()" style="color: var(--primary);">+ Add Entry</button>
            </div>
            <div id="adaEntriesWrapper" style="max-height: 300px; overflow-y: auto; padding-right: 5px;"></div>
        </div>

        <div id="financeInputContainer" style="display: none;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border);">
                <div class="form-group">
                    <label>For Year</label>
                    <input type="number" id="finYear" class="form-control" value="2026" placeholder="e.g. 2026">
                </div>
                <div class="form-group">
                    <label>Total Annual Fund</label>
                    <input type="number" id="finBudget" class="form-control" value="14000000">
                </div>
            </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 0.85rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Expenditure Entries</span>
        <button type="button" class="btn btn-sm btn-ghost" onclick="addFinanceRow()" style="color: var(--primary);">+ Add Entry</button>
    </div>

    <div style="max-height: 350px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-body);">
        
        <div style="display: grid; grid-template-columns: 1.2fr 2fr 1.5fr 0.8fr 0.6fr 1fr 0.3fr; gap: 6px; padding: 12px; background: var(--border-light); font-size: 0.7rem; font-weight: 800; color: var(--text-secondary); position: sticky; top: 0; z-index: 5; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border);">
            <div>DATE</div>
            <div>PAYEE (Search)</div>
            <div>GRANT PERIOD</div>
            <div>SERIES NO.</div>
            <div>QTY</div>
            <div style="text-align: right;">AMOUNT</div>
            <div></div>
        </div>
        
        <div id="financeEntriesWrapper" style="padding: 6px;">
            </div>
    </div>
        </div>
    <!-- ADD/REPLACE THIS BLOCK FOR FINANCIAL LIST FILTERS -->
<div id="financialListInputContainer" style="display: none;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 20px;">
        <div class="form-group">
            <label>From Semester</label>
            <select id="flSemFrom" class="form-control" style="font-size: 0.8rem; font-weight: bold; color: var(--primary);">
                <option value="">Start (Earliest)</option>
            </select>
        </div>
        <div class="form-group">
            <label>To Semester</label>
            <select id="flSemTo" class="form-control" style="font-size: 0.8rem; font-weight: bold; color: var(--primary);">
                <option value="">End (Latest)</option>
            </select>
        </div>
        <div class="form-group">
            <label>Barangay</label>
            <select id="flBrgy" class="form-control" style="font-size: 0.8rem;">
                <option value="">All Barangays</option>
            </select>
        </div>
        <div class="form-group">
            <label>School</label>
            <select id="flSchool" class="form-control" style="font-size: 0.8rem;">
                <option value="">All Schools</option>
            </select>
        </div>
        <div class="form-group">
            <label>Year Level</label>
            <select id="flYear" class="form-control" style="font-size: 0.8rem;">
                <option value="">All Levels</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
            </select>
        </div>
    </div>
</div>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="btn btn-warning" onclick="generatePrint()" style="flex: 1;">Generate</button>
            <button class="btn btn-ghost" onclick="closeModal()">Close</button>
        </div>
    </div>
</div>

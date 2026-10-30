<?php
/**
 * Other Grants & External Scholarships View
 * Monitoring portal for scholars transitioning to CHED, DOST, and other national scholarship grants
 */
?>
<!-- OTHER GRANTS TAB -->
<div id="otherGrantsTab" class="view-panel" style="display: none;">
    <!-- Other Grants Header Strip (Premium Light Design) -->
    <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden mb-5">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <div class="inline-flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-2">
                    <span class="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>External Scholarship Monitoring</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0 mb-1">
                    Other Grants Registry
                </h2>
                <p class="text-sm text-slate-600 m-0">
                    Tracks beneficiaries who transferred or transitioned to national scholarship programs (CHED, DOST, TDP, etc.).
                </p>
            </div>
            <div class="flex items-center gap-2.5 flex-wrap">
                <button type="button" class="btn-lgu btn-lgu-primary text-xs font-bold flex items-center gap-1.5" onclick="printOtherGrantsReport()">
                    <span>🖨️</span> Print Other Grants Report
                </button>
                <button type="button" class="btn-lgu btn-lgu-ghost text-xs font-bold flex items-center gap-1.5" onclick="exportOtherGrantsCSV()">
                    <span>⬇️</span> Export CSV
                </button>
            </div>
        </div>
    </div>

    <!-- Filter and Search Bar -->
    <div class="toolbar" style="margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div class="search-container" style="min-width: 320px; flex-grow: 1;">
            <span class="search-icon">&#128269;</span>
            <input type="text" class="search-input" id="searchOtherGrants" placeholder="Search other grants by scholar name, IBM ID, or grant program..." oninput="filterOtherGrantsTable()">
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
            <select id="ogFilterYear" class="form-control" style="width: auto; min-width: 140px; font-size: 0.85rem;" onchange="filterOtherGrantsTable()">
                <option value="">All Years</option>
            </select>
            <select id="ogFilterGrant" class="form-control" style="width: auto; min-width: 160px; font-size: 0.85rem;" onchange="filterOtherGrantsTable()">
                <option value="">All Grant Programs</option>
            </select>
            <button class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="renderOtherGrantsTable()" title="Refresh Other Grants">🔄</button>
        </div>
    </div>

    <!-- Other Grants Table -->
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>IBM ID</th>
                    <th>Scholar Name</th>
                    <th>External Grant Program</th>
                    <th>Year Transitioned</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="otherGrantsBody">
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Loading other grants records...</td></tr>
            </tbody>
        </table>

        <!-- Other Grants Pagination Bar -->
        <div class="pagination-bar">
            <div class="page-info" id="otherGrantsPageInfo">Showing 0 to 0 of 0 records</div>
            <div class="pagination-controls">
                <button class="page-btn" id="btnPrevOg" onclick="changeOtherGrantsPage(-1)">Previous</button>
                <button class="page-btn" id="btnNextOg" onclick="changeOtherGrantsPage(1)">Next</button>
            </div>
        </div>
    </div>
</div>

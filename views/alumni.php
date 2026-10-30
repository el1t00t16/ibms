<?php
/**
 * Alumni Directory View
 * Dedicated directory of all graduated scholars with batch year, degree, and Latin honors tracking
 */
?>
<!-- ALUMNI TAB -->
<div id="alumniTab" class="view-panel" style="display: none;">
    <!-- Alumni Header Strip (Premium Light Design) -->
    <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden mb-5">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <div class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-2">
                    <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Municipal Success Story</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0 mb-1">
                    Iskolar Bayan Alumni Directory
                </h2>
                <p class="text-sm text-slate-600 m-0">
                    Directory of all proud Malungon graduates who completed their tertiary degrees through the Iskolar Bayan Program.
                </p>
            </div>
            <div class="flex items-center gap-2.5 flex-wrap">
                <button type="button" class="btn-lgu btn-lgu-success text-xs font-bold flex items-center gap-1.5" onclick="openAddScholarToAlumniModal()">
                    <span>🎓</span> + Add Scholar to Alumni
                </button>
                <button type="button" class="btn-lgu btn-lgu-primary text-xs font-bold flex items-center gap-1.5" onclick="generateGraduatesMatrix()">
                    <span>📊</span> View Alumni Matrix
                </button>
                <button type="button" class="btn-lgu btn-lgu-ghost text-xs font-bold flex items-center gap-1.5" onclick="exportAlumniCSV()">
                    <span>⬇️</span> Export Alumni
                </button>
            </div>
        </div>
    </div>

    <!-- Alumni Filter and Search Bar -->
    <div class="toolbar" style="margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div class="search-container" style="min-width: 320px; flex-grow: 1;">
            <span class="search-icon">&#128269;</span>
            <input type="text" class="search-input" id="searchAlumni" placeholder="Search alumni by name, IBM ID, course, or school..." oninput="filterAlumniTable()">
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
            <select id="alumniFilterYear" class="form-control" style="width: auto; min-width: 140px; font-size: 0.85rem;" onchange="filterAlumniTable()">
                <option value="">All Graduation Years</option>
            </select>
            <select id="alumniFilterBrgy" class="form-control" style="width: auto; min-width: 150px; font-size: 0.85rem;" onchange="filterAlumniTable()">
                <option value="">All Barangays</option>
            </select>
            <button class="btn-lgu btn-lgu-ghost btn-lgu-sm" onclick="renderAlumniTable()" title="Refresh Alumni List">🔄</button>
        </div>
    </div>

    <!-- Alumni Table -->
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>IBM ID</th>
                    <th>Graduate Name</th>
                    <th>Course / Degree</th>
                    <th>School</th>
                    <th>Barangay</th>
                    <th>Year Graduated</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="alumniBody">
                <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Loading alumni directory...</td></tr>
            </tbody>
        </table>

        <!-- Alumni Pagination Bar -->
        <div class="pagination-bar">
            <div class="page-info" id="alumniPageInfo">Showing 0 to 0 of 0 graduates</div>
            <div class="pagination-controls">
                <button class="page-btn" id="btnPrevAlumni" onclick="changeAlumniPage(-1)">Previous</button>
                <button class="page-btn" id="btnNextAlumni" onclick="changeAlumniPage(1)">Next</button>
            </div>
        </div>
    </div>
</div>

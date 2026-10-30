<?php
/**
 * Slide-Over Scholar Quick Profile Drawer
 * Municipality of Malungon - e-Iskolar Bayan Management Portal
 * Balanced, modern premium light layout
 */
?>
<div class="lgu-drawer-backdrop" id="scholarDrawerBackdrop" onclick="closeScholarDrawer()"></div>

<div class="lgu-drawer" id="scholarDrawer">
    <!-- Drawer Header -->
    <div class="drawer-header border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
        <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h3 class="drawer-title text-base font-bold text-slate-900 m-0" id="drawerScholarName">Scholar Record</h3>
        </div>
        <button class="drawer-close-btn w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer text-lg" onclick="closeScholarDrawer()" title="Close Drawer">✕</button>
    </div>

    <div class="drawer-body p-6 space-y-5 overflow-y-auto">
        <!-- Identity Summary Card -->
        <div class="bg-gradient-to-b from-slate-50 to-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
            <div class="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-xs border border-blue-200/60" id="drawerAvatarInitial">
                A
            </div>
            <h2 class="text-lg font-extrabold text-slate-900 tracking-tight m-0 mb-1 leading-snug" id="drawerHeaderFullName">---</h2>
            
            <div class="flex items-center justify-center gap-2 my-2 flex-wrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-mono text-xs font-bold" id="drawerHeaderIbmId">
                    IBM-00-00-00000
                </span>
                <span id="drawerStatusBadge">
                    <span class="lgu-badge badge-active">ACTIVE</span>
                </span>
            </div>
        </div>

        <!-- Section 1: Academic Information -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div class="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>🎓</span>
                <span>Academic Information</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="col-span-2">
                    <span class="text-slate-400 text-xs font-bold uppercase block">School / University</span>
                    <strong class="text-slate-800 font-semibold block leading-tight mt-0.5" id="drawerSchool">---</strong>
                </div>
                <div class="col-span-2">
                    <span class="text-slate-400 text-xs font-bold uppercase block">Degree / Course</span>
                    <strong class="text-slate-800 font-semibold block leading-tight mt-0.5" id="drawerCourse">---</strong>
                </div>
                <div>
                    <span class="text-slate-400 text-xs font-bold uppercase block">Year Level</span>
                    <strong class="text-slate-800 font-semibold block mt-0.5" id="drawerYearLevel">---</strong>
                </div>
                <div>
                    <span class="text-slate-400 text-xs font-bold uppercase block">School ID</span>
                    <strong class="text-slate-800 font-semibold font-mono block mt-0.5" id="drawerSchoolId">---</strong>
                </div>
            </div>
        </div>

        <!-- Section 2: Personal & Resident Demographics -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div class="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>📍</span>
                <span>Resident & Demographic Details</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <span class="text-slate-400 text-xs font-bold uppercase block">Barangay</span>
                    <strong class="text-slate-800 font-semibold block mt-0.5" id="drawerBarangay">---</strong>
                </div>
                <div>
                    <span class="text-slate-400 text-xs font-bold uppercase block">Tribe / Ethnicity</span>
                    <strong class="text-slate-800 font-semibold block mt-0.5" id="drawerTribe">---</strong>
                </div>
                <div>
                    <span class="text-slate-400 text-xs font-bold uppercase block">Sex / Gender</span>
                    <strong class="text-slate-800 font-semibold block mt-0.5" id="drawerSex">---</strong>
                </div>
                <div>
                    <span class="text-slate-400 text-xs font-bold uppercase block">Contact Number</span>
                    <strong class="text-slate-800 font-semibold block mt-0.5" id="drawerContact">---</strong>
                </div>
            </div>
        </div>

        <!-- Section 3: Financial & Disbursement Account -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div class="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>💳</span>
                <span>Disbursement Account</span>
            </div>
            <div>
                <span class="text-slate-400 text-xs font-bold uppercase block">Landbank Account Number</span>
                <div class="mt-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <span class="font-mono text-sm font-bold text-slate-800 tracking-wider" id="drawerLbpAccount">Not Provided</span>
                    <button type="button" class="btn-lgu btn-lgu-ghost btn-lgu-sm text-xs px-2 py-1" onclick="copyDrawerLbp()" title="Copy Account Number">
                        📋 Copy
                    </button>
                </div>
            </div>
        </div>

        <!-- Section 3.1: Financial Record (IBM Grant) -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div class="flex items-center justify-between mb-2.5">
                <div class="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💰</span>
                    <span>Financial Record (IBM Grant)</span>
                </div>
                <div class="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full" id="drawerTotalStipendBadge">
                    Total: ₱0.00
                </div>
            </div>
            <div class="overflow-x-auto rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                <table class="w-full text-xs text-left">
                    <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                        <tr>
                            <th class="py-1.5 px-2.5">Semester</th>
                            <th class="py-1.5 px-2">Status</th>
                            <th class="py-1.5 px-2 text-right">Stipend</th>
                        </tr>
                    </thead>
                    <tbody id="drawerFinancialTableBody" class="divide-y divide-slate-100 text-slate-700 font-medium">
                        <tr>
                            <td colspan="3" class="py-2.5 px-2 text-center text-slate-400 italic">No grant records found.</td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                        <tr>
                            <td colspan="2" class="py-1.5 px-2.5 text-slate-600 uppercase text-[10px] tracking-wider">Total Received</td>
                            <td class="py-1.5 px-2 text-right text-emerald-700 font-mono font-extrabold" id="drawerTotalStipendFoot">₱0.00</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <p class="text-[10px] text-slate-400 mt-2 italic">
                * ₱7,000/sem starting 2nd Sem 2023-2024 (₱5,000 prior terms).
            </p>
        </div>

        <!-- Section 4: Administrative Remarks & Notes -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div class="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📝</span>
                <span>Administrative Remarks</span>
            </div>
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs leading-relaxed text-slate-600 font-medium" id="drawerRemarks">
                No recorded administrative remarks.
            </div>
        </div>

        <!-- Section 5: Action Buttons (Balanced Layout) -->
        <div class="pt-2 pb-6 space-y-2.5">
            <button type="button" class="btn-lgu btn-lgu-primary w-full py-2.5 font-bold shadow-sm flex items-center justify-center gap-2" onclick="drawerEditScholar()">
                <span>✏️</span>
                <span>Edit Scholar Record</span>
            </button>

            <button type="button" class="btn-lgu btn-lgu-success w-full py-2.5 font-bold shadow-sm flex items-center justify-center gap-2" onclick="drawerMoveToAlumni()" id="drawerAlumniBtn">
                <span>🎓</span>
                <span>Move to Alumni / Graduates</span>
            </button>

            <div class="grid grid-cols-2 gap-2">
                <button type="button" class="btn-lgu btn-lgu-gold py-2 text-xs font-bold flex items-center justify-center gap-1.5" onclick="initiateCertificate()">
                    <span>📜</span>
                    <span>Certificate</span>
                </button>
                <button type="button" class="btn-lgu btn-lgu-ghost py-2 text-xs font-bold flex items-center justify-center gap-1.5" onclick="printScholarProfile()">
                    <span>🖨️</span>
                    <span>Print Profile</span>
                </button>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <button type="button" class="btn-lgu btn-lgu-danger py-2 text-xs font-bold flex items-center justify-center gap-1.5" onclick="drawerDisciplinaryAction()">
                    <span>⚖️</span>
                    <span>Disciplinary</span>
                </button>
                <button type="button" class="btn-lgu btn-lgu-ghost py-2 text-xs font-bold flex items-center justify-center gap-1.5" onclick="drawerAddOtherGrant()">
                    <span>🏅</span>
                    <span>Other Grant</span>
                </button>
            </div>
        </div>
    </div>
</div>

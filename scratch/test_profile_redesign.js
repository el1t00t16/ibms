const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function testProfileRedesign() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--remote-debugging-port=9222',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const json = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json', (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });

    const pageTab = json.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

    let id = 1;
    function send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const curId = id++;
            const handler = (evt) => {
                const msg = JSON.parse(evt.data);
                if (msg.id === curId) {
                    ws.removeEventListener('message', handler);
                    if (msg.error) reject(msg.error);
                    else resolve(msg.result);
                }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id: curId, method, params }));
        });
    }

    await new Promise(r => ws.addEventListener('open', r));
    await send('Page.enable');
    await send('Runtime.enable');

    // Create the redesigned HTML
    const testScholar = {
        ibmId: 'IBM-21-22-00001',
        controlNo: 1,
        fullName: 'DEMIE KHISSA VANESSA SAMULDE PACHECO',
        sex: 'M',
        tribe: 'Ilonggo',
        barangay: 'Poblacion',
        contact: '9462528273',
        lbpAccount: '1234-5678-90',
        school: 'Ramon Magsaysay Memorial Colleges',
        course: 'B Secondary Education',
        startingYear: '2021-2022',
        yearLevel: '4th Year',
        schoolId: '2011310003',
        status: 'GRADUATED',
        remarks: 'Sem 5/8 – Graduated with Honors',
        records: [
            { sem: '2021-2022/2nd Sem', status: 'OK', releaseDate: '06/15/2022', amount: 5000 },
            { sem: '2022-2023/1st Sem', status: 'OK', releaseDate: '12/20/2022', amount: 5000 },
            { sem: '2022-2023/2nd Sem', status: 'OK', releaseDate: '06/22/2023', amount: 5000 },
            { sem: '2023-2024/1st Sem', status: 'OK', releaseDate: '12/18/2023', amount: 5000 },
            { sem: '2023-2024/2nd Sem', status: 'OK', releaseDate: '06/28/2024', amount: 7000 }
        ]
    };

    const totalStipend = testScholar.records.reduce((acc, r) => acc + r.amount, 0);

    const rowsHtml = testScholar.records.map((r, i) => `
        <tr>
            <td style="text-align: center; font-weight: 600; color: #475569;">${i + 1}</td>
            <td style="font-weight: 700; color: #0f172a;">${r.sem}</td>
            <td style="text-align: center;"><span class="badge-ok">${r.status}</span></td>
            <td style="text-align: center; font-family: monospace; font-size: 8.5pt; color: #334155;">${r.releaseDate}</td>
            <td style="text-align: right; font-weight: 800; font-family: monospace; color: #047857; font-size: 9pt;">₱ ${r.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        </tr>
    `).join('');

    const pageHtml = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Grantee Profile - ${testScholar.fullName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cinzel:wght@700;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --lgu-navy: #0c2340;
                --civic-gold: #d97706;
                --emerald: #059669;
                --text-dark: #0f172a;
                --text-muted: #475569;
                --border-color: #cbd5e1;
            }
            @page {
                size: portrait;
                margin: 8mm 10mm 8mm 10mm;
            }
            * { box-sizing: border-box; }
            html, body {
                margin: 0;
                padding: 0;
                background: #ffffff;
                color: var(--text-dark);
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .profile-dossier {
                max-width: 8.2in;
                margin: 0 auto;
                padding: 10px 14px;
                background: #ffffff;
            }

            /* ===== HEADER ===== */
            .gov-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding-bottom: 10px;
                border-bottom: 2.5px solid var(--lgu-navy);
                position: relative;
            }
            .gov-header::after {
                content: '';
                position: absolute;
                bottom: -4.5px;
                left: 0;
                right: 0;
                height: 1.5px;
                background: var(--civic-gold);
            }
            .logo-crest {
                width: 62px;
                height: 62px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                border: 2px solid var(--lgu-navy);
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(12,35,64,0.12);
            }
            .header-text-block {
                text-align: center;
                flex: 1;
            }
            .rep-title {
                font-size: 8.5pt;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: var(--text-muted);
                margin: 0;
            }
            .prov-title {
                font-size: 8.5pt;
                font-weight: 600;
                color: var(--text-muted);
                margin: 1px 0;
            }
            .agency-title {
                font-size: 10pt;
                font-weight: 800;
                color: var(--lgu-navy);
                letter-spacing: 0.04em;
                margin: 1px 0;
            }
            .program-title {
                font-size: 9.5pt;
                font-weight: 700;
                color: var(--civic-gold);
                margin: 1px 0;
            }
            .main-doc-title {
                font-size: 14pt;
                font-weight: 900;
                color: var(--lgu-navy);
                text-transform: uppercase;
                letter-spacing: 0.06em;
                margin-top: 4px;
                line-height: 1.15;
            }

            /* ===== SECTION HEADERS ===== */
            .section-bar {
                background: var(--lgu-navy);
                color: #ffffff;
                padding: 4px 10px;
                font-size: 8pt;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                margin-top: 10px;
                margin-bottom: 4px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .section-bar-gold {
                color: #fde68a;
                font-weight: 800;
            }

            /* ===== DATA TABLES ===== */
            .dossier-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                overflow: hidden;
                font-size: 8.2pt;
                margin-bottom: 2px;
            }
            .dossier-table td {
                padding: 4.5px 8px;
                border: 1px solid var(--border-color);
                vertical-align: middle;
            }
            .lbl-cell {
                background: #f8fafc;
                color: #475569;
                font-weight: 700;
                text-transform: uppercase;
                font-size: 7.2pt;
                letter-spacing: 0.03em;
                width: 16%;
            }
            .val-cell {
                color: #0f172a;
                width: 34%;
            }
            .val-cell.bold {
                font-weight: 700;
            }
            .val-cell.highlight {
                font-size: 9.5pt;
                font-weight: 800;
                color: var(--lgu-navy);
            }

            /* ===== REMARKS CALLOUT ===== */
            .remarks-panel {
                border: 1px solid #cbd5e1;
                border-left: 4px solid var(--civic-gold);
                background: #f8fafc;
                padding: 6px 10px;
                border-radius: 0 4px 4px 0;
                font-size: 8.5pt;
                color: #1e293b;
                min-height: 24px;
                line-height: 1.35;
            }

            /* ===== FINANCIAL LEDGER ===== */
            .ledger-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid var(--border-color);
                font-size: 8.2pt;
            }
            .ledger-table th {
                background: #f1f5f9;
                color: var(--lgu-navy);
                border: 1px solid var(--border-color);
                padding: 5px 8px;
                font-weight: 800;
                text-transform: uppercase;
                font-size: 7.5pt;
                letter-spacing: 0.04em;
            }
            .ledger-table td {
                padding: 4px 8px;
                border: 1px solid var(--border-color);
            }
            .ledger-table tbody tr:nth-child(even) {
                background: #f8fafc;
            }
            .badge-ok {
                background: #dcfce7;
                color: #15803d;
                border: 1px solid #86efac;
                padding: 1px 6px;
                border-radius: 3px;
                font-size: 7.2pt;
                font-weight: 800;
            }
            .ledger-total-row td {
                background: #f1f5f9 !important;
                border-top: 2px solid var(--lgu-navy);
                border-bottom: 2px solid var(--lgu-navy);
                padding: 6px 8px;
            }

            /* ===== SIGNATURES & AUDIT ===== */
            .dossier-footer {
                margin-top: 14px;
                padding-top: 10px;
                border-top: 1px solid #cbd5e1;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                font-size: 7.5pt;
            }
            .audit-stamp {
                color: #64748b;
                line-height: 1.4;
            }
            .sign-box {
                text-align: center;
                min-width: 220px;
            }
            .sign-line {
                border-bottom: 1.5px solid #0f172a;
                margin-bottom: 4px;
                height: 24px;
            }
            .sign-name {
                font-weight: 800;
                font-size: 8.5pt;
                color: #0f172a;
                text-transform: uppercase;
            }
            .sign-title {
                font-size: 7.2pt;
                color: #475569;
            }
        </style>
    </head>
    <body>
        <div class="profile-dossier">
            <!-- CIVIC HEADER -->
            <header class="gov-header">
                <div class="logo-crest" title="Official Seal of Malungon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0c2340" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <circle cx="12" cy="11" r="3"/>
                        <path d="M12 2v2"/>
                    </svg>
                </div>
                <div class="header-text-block">
                    <p class="rep-title">Republic of the Philippines</p>
                    <p class="prov-title">Province of Sarangani &bull; Municipality of Malungon</p>
                    <p class="agency-title">OFFICE OF THE MUNICIPAL MAYOR</p>
                    <p class="program-title">Iskolar Bayan ng Malungon (IBM) Program</p>
                    <h1 class="main-doc-title">Official Grantee Dossier</h1>
                </div>
                <div class="logo-crest" title="IBM Scholarship Program">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                </div>
            </header>

            <!-- SECTION I: IDENTIFICATION -->
            <div class="section-bar">
                <span>I. Grantee Identification &amp; Demographic Profile</span>
                <span class="section-bar-gold">Control No: ${testScholar.controlNo}</span>
            </div>
            <table class="dossier-table">
                <tr>
                    <td class="lbl-cell">IBM ID No.</td>
                    <td class="val-cell bold" style="font-family: monospace; font-size: 9.5pt; color: #1e40af;">${testScholar.ibmId}</td>
                    <td class="lbl-cell">Official Status</td>
                    <td class="val-cell">
                        <span style="background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; font-weight: 800; font-size: 7.5pt; padding: 2px 7px; border-radius: 3px;">
                            ${testScholar.status}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td class="lbl-cell">Full Name</td>
                    <td class="val-cell highlight" colspan="3">${testScholar.fullName}</td>
                </tr>
                <tr>
                    <td class="lbl-cell">Sex &bull; Tribe</td>
                    <td class="val-cell bold">${testScholar.sex === 'M' ? 'Male' : (testScholar.sex === 'F' ? 'Female' : testScholar.sex)} &bull; ${testScholar.tribe || '—'}</td>
                    <td class="lbl-cell">Contact No.</td>
                    <td class="val-cell" style="font-family: monospace;">${testScholar.contact || '—'}</td>
                </tr>
                <tr>
                    <td class="lbl-cell">Barangay Address</td>
                    <td class="val-cell">${testScholar.barangay}, Malungon, Sarangani</td>
                    <td class="lbl-cell">Land Bank Account</td>
                    <td class="val-cell" style="font-family: monospace; font-weight: 600;">${testScholar.lbpAccount || '—'}</td>
                </tr>
            </table>

            <!-- SECTION II: ACADEMIC PROFILE -->
            <div class="section-bar">
                <span>II. Academic &amp; Institutional Enrollment Record</span>
                <span style="font-size: 7.2pt; opacity: 0.9;">Curricular Standing</span>
            </div>
            <table class="dossier-table">
                <tr>
                    <td class="lbl-cell">School / University</td>
                    <td class="val-cell bold" colspan="3" style="font-size: 8.8pt;">${testScholar.school}</td>
                </tr>
                <tr>
                    <td class="lbl-cell">Degree Program / Course</td>
                    <td class="val-cell bold" colspan="3">${testScholar.course}</td>
                </tr>
                <tr>
                    <td class="lbl-cell">Starting Academic Year</td>
                    <td class="val-cell">${testScholar.startingYear}</td>
                    <td class="lbl-cell">Current Year Level</td>
                    <td class="val-cell bold" style="color: #0c2340;">${testScholar.yearLevel}</td>
                </tr>
                <tr>
                    <td class="lbl-cell">School ID No.</td>
                    <td class="val-cell" style="font-family: monospace;">${testScholar.schoolId}</td>
                    <td class="lbl-cell">Grant Type</td>
                    <td class="val-cell">Iskolar Bayan ng Malungon (Municipal Grant)</td>
                </tr>
            </table>

            <!-- SECTION III: CASE HISTORY & REMARKS -->
            <div class="section-bar">
                <span>III. Administrative Case History &amp; Remarks</span>
                <span style="font-size: 7.2pt; opacity: 0.9;">Program Standing</span>
            </div>
            <div class="remarks-panel">
                ${testScholar.remarks || 'No adverse disciplinary records on file. Scholar maintained good academic standing throughout term.'}
            </div>

            <!-- SECTION IV: FINANCIAL DISBURSEMENT HISTORY -->
            <div class="section-bar">
                <span>IV. Financial Disbursement History &amp; Grant Ledger</span>
                <span class="section-bar-gold">Cumulative Disbursed: ₱${totalStipend.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <p style="font-size: 7.2pt; color: #64748b; margin: 3px 0 5px 0;">
                Stipend rate coverage: ₱5,000.00/term prior to 2nd Semester AY 2023-2024; ₱7,000.00/term onwards upon verified 'OK' status and Land Bank LGU disbursement.
            </p>
            <table class="ledger-table">
                <thead>
                    <tr>
                        <th style="width: 6%; text-align: center;">No.</th>
                        <th style="width: 38%; text-align: left;">Academic Period / Semester</th>
                        <th style="width: 16%; text-align: center;">Record Status</th>
                        <th style="width: 20%; text-align: center;">Date of Release</th>
                        <th style="width: 20%; text-align: right;">Amount Disbursed</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                    <tr class="ledger-total-row">
                        <td colspan="4" style="text-align: right; font-weight: 800; font-size: 8.5pt; text-transform: uppercase; color: var(--lgu-navy);">
                            Cumulative Grant Stipend Received:
                        </td>
                        <td style="text-align: right; font-weight: 900; font-size: 10pt; font-family: monospace; color: #047857;">
                            ₱ ${totalStipend.toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- SECTION V: CERTIFICATION & SYSTEM FOOTER -->
            <footer class="dossier-footer">
                <div class="audit-stamp">
                    <div><strong>Iskolar Bayan ng Malungon Management System (e-IBM)</strong></div>
                    <div>Official System-Generated Dossier &bull; No physical seal required for internal auditing.</div>
                    <div>Printed: ${new Date().toLocaleString()} &bull; System Operator: Administrator</div>
                </div>
                <div class="sign-box">
                    <div class="sign-line"></div>
                    <div class="sign-name">ROY A. DELA CRUZ</div>
                    <div class="sign-title">AA-II / IBM Scholarship Coordinator</div>
                    <div class="sign-title">Office of the Municipal Mayor</div>
                </div>
            </footer>
        </div>
    </body>
    </html>`;

    await send('Page.setDocumentContent', {
        frameId: pageTab.id,
        html: pageHtml
    });

    await new Promise(r => setTimeout(r, 1000));

    // Capture screenshot to see layout
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync('scratch/redesigned_profile.png', Buffer.from(shot.data, 'base64'));

    // Capture PDF
    const pdf = await send('Page.printToPDF', { printBackground: true });
    fs.writeFileSync('scratch/redesigned_profile.pdf', Buffer.from(pdf.data, 'base64'));

    console.log('Saved scratch/redesigned_profile.png and scratch/redesigned_profile.pdf');
    console.log('PDF byte size:', pdf.data.length);

    chrome.kill();
    process.exit(0);
}

testProfileRedesign().catch(e => {
    console.error(e);
    process.exit(1);
});

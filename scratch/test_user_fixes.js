const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function testUserFixes() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--remote-debugging-port=9233',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const json = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9233/json', (res) => {
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

    console.log('Navigating to http://localhost/ibms/index.php...');
    await send('Page.navigate', { url: 'http://localhost/ibms/index.php' });

    // Wait for scripts to load
    let loaded = false;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const check = await send('Runtime.evaluate', {
            expression: 'typeof window.printScholarProfile === "function" && typeof window.openScholarModal === "function"'
        });
        if (check.result && check.result.value) {
            loaded = true;
            break;
        }
    }

    if (!loaded) throw new Error('Timeout waiting for scripts');
    console.log('Scripts fully loaded!');

    // Test 1: Check isEditMode and openScholarModal
    const editTest = await send('Runtime.evaluate', {
        expression: `(function() {
            try {
                // Ensure dbData has a test record
                if (!window.dbData) window.dbData = [];
                window.dbData.push({
                    ibmId: 'IBM-21-22-00001',
                    rowIndex: 2,
                    schoolYear: '2021-2022',
                    firstName: 'Demie',
                    middleName: 'Khissa',
                    lastName: 'Pacheco',
                    fullName: 'DEMIE KHISSA PACHECO',
                    sex: 'M',
                    tribe: 'Ilonggo',
                    course: 'B Secondary Education',
                    school: 'RMMC',
                    schoolId: '2011310003',
                    contact: '09123456789',
                    barangay: 'Poblacion',
                    lbpAccount: '1234-5678-90',
                    startingYear: '2021-2022',
                    yearLevel: '4th Year',
                    dbStatus: 'ACTIVE',
                    remarks: 'None'
                });

                // Call openScholarModal(true, 'IBM-21-22-00001')
                window.openScholarModal(true, 'IBM-21-22-00001');

                const title = document.getElementById('scholarModalTitle').innerText;
                const modalVisible = document.getElementById('scholarModal').style.display === 'flex';
                const ibmVal = document.getElementById('ns-ibm').value;

                return {
                    success: true,
                    isEditMode: window.isEditMode,
                    title: title,
                    modalVisible: modalVisible,
                    ibmVal: ibmVal
                };
            } catch(e) {
                return {
                    success: false,
                    error: e.toString(),
                    stack: e.stack
                };
            }
        })()`,
        returnByValue: true
    });

    console.log('Edit Button / isEditMode Test Result:', editTest.result.value);

    // Test 2: Check printScholarProfile
    const printTest = await send('Runtime.evaluate', {
        expression: `(function() {
            try {
                window.print = function() {}; // Prevent real print dialog
                const testScholar = window.dbData[0];
                window.printScholarProfile(testScholar);

                const area = document.getElementById('printProfileArea');
                const html = area ? area.innerHTML : '';

                return {
                    hasSheetTitle: html.includes('IBM Grantee Information Sheet'),
                    hasOldHeader: html.includes('REPUBLIC OF THE PHILIPPINES') || html.includes('OFFICE OF THE MUNICIPAL MAYOR') || html.includes('Official Grantee Dossier'),
                    hasRoyDelaCruz: html.includes('ROY A. DELA CRUZ'),
                    hasLogos: html.includes('logo-crest') || html.includes('svg width="38"'),
                    areaLength: html.length
                };
            } catch(e) {
                return { error: e.toString() };
            }
        })()`,
        returnByValue: true
    });

    console.log('Print Profile Header & Footer Test Result:', printTest.result.value);

    // Screenshot of the print preview
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync('scratch/new_grantee_sheet.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot to scratch/new_grantee_sheet.png');

    chrome.kill();
    process.exit(0);
}

testUserFixes().catch(e => {
    console.error(e);
    process.exit(1);
});

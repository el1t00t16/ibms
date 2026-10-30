const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function testLiveProfile() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--remote-debugging-port=9230',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const json = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9230/json', (res) => {
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
    
    // Wait for window.printScholarProfile to be defined
    let loaded = false;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const check = await send('Runtime.evaluate', {
            expression: 'typeof window.printScholarProfile === "function"'
        });
        if (check.result && check.result.value) {
            loaded = true;
            break;
        }
    }

    if (!loaded) {
        throw new Error('window.printScholarProfile failed to load within 10s');
    }

    console.log('Page scripts fully loaded!');

    // Test printScholarProfile
    const res = await send('Runtime.evaluate', {
        expression: `(function() {
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
                semesterRecords: {
                    '2021-2022/2nd Sem': 'OK',
                    '2022-2023/1st Sem': 'OK',
                    '2022-2023/2nd Sem': 'OK',
                    '2023-2024/1st Sem': 'OK',
                    '2023-2024/2nd Sem': 'OK'
                }
            };

            window.currentViewScholar = testScholar;
            window.sems = [
                '2021-2022/2nd Sem',
                '2022-2023/1st Sem',
                '2022-2023/2nd Sem',
                '2023-2024/1st Sem',
                '2023-2024/2nd Sem'
            ];
            window.pData = [
                { ibmId: 'IBM-21-22-00001', grantPeriod: '2021-2022/2nd Sem', remarks: '06/15/2022' },
                { ibmId: 'IBM-21-22-00001', grantPeriod: '2022-2023/1st Sem', remarks: '12/20/2022' },
                { ibmId: 'IBM-21-22-00001', grantPeriod: '2022-2023/2nd Sem', remarks: '06/22/2023' },
                { ibmId: 'IBM-21-22-00001', grantPeriod: '2023-2024/1st Sem', remarks: '12/18/2023' },
                { ibmId: 'IBM-21-22-00001', grantPeriod: '2023-2024/2nd Sem', remarks: '06/28/2024' }
            ];

            // Prevent actual modal popups or window.print blocking
            window.print = function() {};

            // Run printScholarProfile with testScholar
            window.printScholarProfile(testScholar);

            const profileArea = document.getElementById('printProfileArea');
            return {
                profileAreaFound: !!profileArea,
                profileAreaLength: profileArea ? profileArea.innerHTML.length : 0,
                hasOfficialDossier: profileArea ? profileArea.innerHTML.includes('Official Grantee Dossier') : false,
                bodyHasClass: document.body.classList.contains('printing-profile')
            };
        })()`,
        returnByValue: true
    });

    console.log('Result from browser:', res.result.value);

    // Print to PDF
    const pdf = await send('Page.printToPDF', { printBackground: true });
    fs.writeFileSync('scratch/live_profile_print.pdf', Buffer.from(pdf.data, 'base64'));
    console.log('Generated PDF, size:', pdf.data.length);

    chrome.kill();
    process.exit(0);
}

testLiveProfile().catch(e => {
    console.error(e);
    process.exit(1);
});

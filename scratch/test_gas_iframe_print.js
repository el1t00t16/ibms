const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function testGasIframe() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--remote-debugging-port=9231',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const json = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9231/json', (res) => {
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

    if (!loaded) throw new Error('Timeout waiting for scripts');

    // Simulate iframe environment by setting window.top to a dummy object != window.self
    const res = await send('Runtime.evaluate', {
        expression: `(function() {
            // Mock window.self !== window.top
            Object.defineProperty(window, 'top', {
                get: function() { return {}; }
            });

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

            // Run printScholarProfile with testScholar
            window.printScholarProfile(testScholar);

            const pFrame = document.getElementById('ibmsPrintHelperFrame');
            const frameDoc = pFrame ? (pFrame.contentDocument || pFrame.contentWindow.document) : null;
            return {
                isInIframe: window.self !== window.top,
                frameCreated: !!pFrame,
                frameDocHasDossier: frameDoc ? frameDoc.body.innerHTML.includes('Official Grantee Dossier') : false,
                frameDocLength: frameDoc ? frameDoc.body.innerHTML.length : 0
            };
        })()`,
        returnByValue: true
    });

    console.log('Iframe GAS print test result:', res.result.value);

    chrome.kill();
    process.exit(0);
}

testGasIframe().catch(e => {
    console.error(e);
    process.exit(1);
});

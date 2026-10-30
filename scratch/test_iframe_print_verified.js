const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function testIframePrintVerified() {
    fs.writeFileSync('C:\\xampp\\htdocs\\ibms\\gas_sim_host.html', `<!DOCTYPE html>
    <html>
    <head><title>GAS Simulation Host</title></head>
    <body style="margin:0; padding:0; height:100vh;">
        <iframe id="gasFrame" src="/ibms/index.php" style="width:100%; height:100%; border:none;"></iframe>
    </body>
    </html>`);

    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--remote-debugging-port=9222',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        'http://localhost/ibms/gas_sim_host.html'
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

    await new Promise(r => setTimeout(r, 1500));

    // Test inside iframe with sample data
    const res = await send('Runtime.evaluate', {
        expression: `(() => {
            const f = document.getElementById('gasFrame');
            const win = f.contentWindow;
            const doc = f.contentDocument;

            // Sample data
            const samplePayroll = [
                { no: 1, ibmId: 'IBM-24-001', fullName: 'Dela Cruz, Juan M.', yearLevel: '4th Year', lbpAccount: '1234567890', grantPeriod: '2025-2026/1st Sem' },
                { no: 2, ibmId: 'IBM-24-002', fullName: 'Santos, Maria C.', yearLevel: '3rd Year', lbpAccount: '0987654321', grantPeriod: '2025-2026/1st Sem' }
            ];

            // Test list print
            win.generateListPrint(samplePayroll);

            // Check helper frame
            const helper = doc.getElementById('ibmsPrintHelperFrame');
            const helperDoc = helper ? (helper.contentDocument || helper.contentWindow.document) : null;
            const bodyContent = helperDoc && helperDoc.body ? helperDoc.body.innerHTML : '';
            const printAreaEl = helperDoc ? helperDoc.getElementById('printArea') : null;

            return {
                isInIframe: win.self !== win.top,
                hasHelper: !!helper,
                helperContentLength: bodyContent.length,
                printAreaFound: !!printAreaEl,
                printAreaVisible: printAreaEl ? (win.getComputedStyle(printAreaEl).display !== 'none') : false,
                tableRowsCount: helperDoc ? helperDoc.querySelectorAll('.p-table tr').length : 0
            };
        })()`,
        returnByValue: true
    });

    console.log('IFRAME TEST RESULTS:', JSON.stringify(res.result.value, null, 2));

    chrome.kill();
    process.exit(0);
}

testIframePrintVerified().catch(e => {
    console.error(e);
    process.exit(1);
});

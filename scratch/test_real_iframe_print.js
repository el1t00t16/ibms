const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function testRealIframePrint() {
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

    await new Promise(r => setTimeout(r, 2000));

    // Interact with iframe
    const loginRes = await send('Runtime.evaluate', {
        expression: `(() => {
            const f = document.getElementById('gasFrame');
            const win = f.contentWindow;
            const doc = f.contentDocument;

            return new Promise((resolve) => {
                win.google.script.run.withSuccessHandler(res => {
                    doc.getElementById('loginPage').style.display = 'none';
                    doc.getElementById('appLayout').style.display = 'block';
                    win.loadData();
                    win.loadSems();
                    resolve({ loggedIn: true, inIframe: win.self !== win.top });
                }).loginUser('admin', 'admin123');
            });
        })()`,
        awaitPromise: true,
        returnByValue: true
    });

    console.log('Login inside real iframe:', loginRes.result.value);

    // Wait until pData is populated in the iframe
    await send('Runtime.evaluate', {
        expression: `new Promise((resolve) => {
            const f = document.getElementById('gasFrame');
            const win = f.contentWindow;
            const check = () => {
                if (win.pData && win.pData.length > 0) {
                    resolve({ count: win.pData.length });
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        })`,
        awaitPromise: true
    });

    console.log('pData confirmed loaded in iframe!');

    // Now test printing from inside the iframe
    const printRes = await send('Runtime.evaluate', {
        expression: `(() => {
            const f = document.getElementById('gasFrame');
            const win = f.contentWindow;
            const doc = f.contentDocument;

            // Spy on helper frame
            doc.getElementById('printType').value = 'list';
            doc.getElementById('printRange').value = '1-20';
            const target = win.parseRange('1-20', win.pData);

            win.generateListPrint(target);

            const helperFrame = doc.getElementById('ibmsPrintHelperFrame');
            const helperDoc = helperFrame ? (helperFrame.contentDocument || helperFrame.contentWindow.document) : null;

            return {
                targetLen: target.length,
                hasHelperFrame: !!helperFrame,
                helperContentLength: helperDoc && helperDoc.body ? helperDoc.body.innerHTML.length : 0,
                helperDocTitle: helperDoc ? helperDoc.title : null
            };
        })()`,
        returnByValue: true
    });

    console.log('Print inside real iframe:', printRes.result.value);

    chrome.kill();
    process.exit(0);
}

testRealIframePrint().catch(e => {
    console.error(e);
    process.exit(1);
});

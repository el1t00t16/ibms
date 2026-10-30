const http = require('http');
const { spawn } = require('child_process');

async function testGasIframeExecutor() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--remote-debugging-port=9222',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        'http://localhost/ibms/index.php'
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

    // Login
    await send('Runtime.evaluate', {
        expression: `new Promise((resolve) => {
            google.script.run.withSuccessHandler(res => {
                document.getElementById('loginPage').style.display = 'none';
                document.getElementById('appLayout').style.display = 'block';
                loadData();
                loadSems();
                resolve();
            }).loginUser('admin', 'admin123');
        })`,
        awaitPromise: true
    });

    await new Promise(r => setTimeout(r, 2500));

    // Force isInIframe simulation by overriding window.top
    const simRes = await send('Runtime.evaluate', {
        expression: `(() => {
            // Emulate iframe context
            Object.defineProperty(window, 'top', {
                get: () => ({ fakeTop: true }),
                configurable: true
            });

            // Set up list print
            document.getElementById('printType').value = 'list';
            document.getElementById('printRange').value = '1-20';
            const target = parseRange('1-20', pData);

            // Spy on helper frame
            let helperFrameDocLength = 0;
            let helperFrameTitle = '';
            let printTriggered = false;

            // Call generateListPrint
            generateListPrint(target);

            // Check if helper frame was created
            const pFrame = document.getElementById('ibmsPrintHelperFrame');
            if (pFrame) {
                const doc = pFrame.contentDocument || pFrame.contentWindow.document;
                helperFrameDocLength = doc.body ? doc.body.innerHTML.length : 0;
                helperFrameTitle = doc.title;
            }

            return {
                isInIframe: window.self !== window.top,
                hasHelperFrame: !!pFrame,
                helperFrameDocLength,
                helperFrameTitle,
                bodyClass: document.body.className
            };
        })()`,
        returnByValue: true
    });

    console.log('simRes full:', JSON.stringify(simRes, null, 2));

    chrome.kill();
    process.exit(0);
}

testGasIframeExecutor().catch(e => {
    console.error(e);
    process.exit(1);
});

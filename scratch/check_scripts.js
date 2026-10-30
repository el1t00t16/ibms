const http = require('http');
const { spawn } = require('child_process');

async function checkScripts() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--remote-debugging-port=9227',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);
    await new Promise(r => setTimeout(r, 2000));
    const json = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9227/json', (res) => {
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

    ws.addEventListener('message', (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.method === 'Runtime.exceptionThrown') {
            console.error('EXCEPTION:', msg.params.exceptionDetails);
        }
    });

    await send('Page.navigate', { url: 'http://localhost/ibms/index.php' });
    await new Promise(r => setTimeout(r, 3000));

    const scripts = await send('Runtime.evaluate', {
        expression: 'JSON.stringify(Array.from(document.querySelectorAll("script")).map(s => s.src || s.innerHTML.substring(0, 50)))'
    });
    console.log('Scripts on page:', scripts.result.value);

    const adminCheck = await send('Runtime.evaluate', {
        expression: 'JSON.stringify({ hasPrintProfile: typeof window.printScholarProfile, hasDbData: typeof window.dbData, hasAdminPrint: typeof window.adminPrintScholarProfile })'
    });
    console.log('Admin check:', adminCheck.result.value);

    chrome.kill();
    process.exit(0);
}
checkScripts();

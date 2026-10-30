const http = require('http');
const { spawn } = require('child_process');

async function testGasRealIframe() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--remote-debugging-port=9232',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const json = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9232/json', (res) => {
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
    await new Promise(r => setTimeout(r, 3000));

    // Create an iframe and test print inside it
    const res = await send('Runtime.evaluate', {
        expression: `(function() {
            const ifr = document.createElement('iframe');
            document.body.appendChild(ifr);
            const doc = ifr.contentDocument || ifr.contentWindow.document;
            
            // Check isInIframe logic
            const isInIframe = ifr.contentWindow.self !== ifr.contentWindow.top;
            
            // Check if printProfileArea works inside iframe
            const pArea = doc.createElement('div');
            pArea.id = 'printProfileArea';
            doc.body.appendChild(pArea);

            ifr.remove();

            return {
                isInIframe: isInIframe
            };
        })()`,
        returnByValue: true
    });

    console.log('Real Iframe result:', res.result.value);

    chrome.kill();
    process.exit(0);
}

testGasRealIframe().catch(e => {
    console.error(e);
    process.exit(1);
});

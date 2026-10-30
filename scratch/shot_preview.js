const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function shotOutput() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--remote-debugging-port=9237',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);
    await new Promise(r => setTimeout(r, 2000));
    const json = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9237/json', (res) => {
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

    const inner = fs.readFileSync('scratch/test_output.html', 'utf8');
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Preview</title></head><body style="background:#ffffff; margin:0; padding:10px;">${inner}</body></html>`;

    await send('Page.setDocumentContent', {
        frameId: pageTab.id,
        html: fullHtml
    });
    await new Promise(r => setTimeout(r, 1000));
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync('scratch/exact_preview.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved scratch/exact_preview.png, bytes:', shot.data.length);
    chrome.kill();
    process.exit(0);
}
shotOutput().catch(e => { console.error(e); process.exit(1); });

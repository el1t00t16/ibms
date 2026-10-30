const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function renderSheet() {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--remote-debugging-port=9235',
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    const json = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9235/json', (res) => {
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

    // Extract HTML directly by running printScholarProfile with a mock DOM
    await send('Page.navigate', { url: 'http://localhost/ibms/index.php' });
    await new Promise(r => setTimeout(r, 3000));

    const htmlRes = await send('Runtime.evaluate', {
        expression: `(function() {
            window.print = function() {};
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
            window.printScholarProfile(testScholar);
            return document.getElementById('printProfileArea').innerHTML;
        })()`,
        returnByValue: true
    });

    const renderedHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Print Preview</title></head><body>${htmlRes.result.value}</body></html>`;

    // Render in new document
    await send('Page.setDocumentContent', {
        frameId: pageTab.id,
        html: renderedHtml
    });

    await new Promise(r => setTimeout(r, 1000));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync('scratch/rendered_sheet.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved scratch/rendered_sheet.png (Size:', shot.data.length, ')');

    chrome.kill();
    process.exit(0);
}

renderSheet().catch(e => {
    console.error(e);
    process.exit(1);
});

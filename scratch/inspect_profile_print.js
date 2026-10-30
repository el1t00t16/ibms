const http = require('http');
const { spawn } = require('child_process');

async function inspectProfilePrint() {
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

    // Setup sample scholar
    await send('Runtime.evaluate', {
        expression: `(() => {
            window.currentViewScholar = {
                no: 1,
                ibmId: 'IBM-21-22-00001',
                controlNo: 1,
                fullName: 'DEMIE KHISSA VANESSA SAMULDE PACHECO',
                sex: 'M',
                tribe: 'Ilonggo',
                barangay: 'Poblacion',
                contact: '9462528273',
                lbpAccount: '',
                school: 'Ramon Magsaysay Memorial Colleges',
                course: 'B Secondary Education',
                startingYear: 'Not Recorded',
                yearLevel: '4th Year',
                schoolId: '2011310003',
                status: 'GRADUATED',
                remarks: 'Sem 5/8 – Graduated',
                semesterRecords: {
                    '2021-2022/2nd Sem': 'OK',
                    '2022-2023/1st Sem': 'OK',
                    '2022-2023/2nd Sem': 'OK',
                    '2023-2024/1st Sem': 'OK',
                    '2023-2024/2nd Sem': 'OK'
                }
            };
            window.sems = ['2021-2022/2nd Sem', '2022-2023/1st Sem', '2022-2023/2nd Sem', '2023-2024/1st Sem', '2023-2024/2nd Sem'];
            window.pData = [];

            // Override print
            window.realPrint = window.print;
            window.print = () => {};

            printScholarProfile();
        })()`,
        returnByValue: true
    });

    // Inspect the rendered DOM inside #printProfileArea
    const profileDom = await send('Runtime.evaluate', {
        expression: `(() => {
            const area = document.getElementById('printProfileArea');
            const page = area ? area.querySelector('.modern-page') : null;
            const header = page ? page.querySelector('.header') : null;
            const sections = page ? Array.from(page.querySelectorAll('.section-box')) : [];

            return {
                areaDisplay: window.getComputedStyle(area).display,
                pageDisplay: window.getComputedStyle(page).display,
                pageWidth: page ? page.getBoundingClientRect().width : 0,
                pageHeight: page ? page.getBoundingClientRect().height : 0,
                headerRect: header ? header.getBoundingClientRect() : null,
                headerDisplay: header ? window.getComputedStyle(header).display : null,
                section1Rect: sections[0] ? sections[0].getBoundingClientRect() : null,
                section1Display: sections[0] ? window.getComputedStyle(sections[0]).display : null,
                section1HeaderRect: sections[0] && sections[0].querySelector('.section-header') ? sections[0].querySelector('.section-header').getBoundingClientRect() : null
            };
        })()`,
        returnByValue: true
    });

    console.log('profileDom full:', JSON.stringify(profileDom, null, 2));

    chrome.kill();
    process.exit(0);
}

inspectProfilePrint().catch(e => {
    console.error(e);
    process.exit(1);
});

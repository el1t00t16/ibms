const fs = require('fs');
const portal = fs.readFileSync('Portal.html', 'utf8');
const required = [
    'printArea', 'printProfileArea', 'printPayrollFormArea', 'printFursArea',
    'printAdaArea', 'printReportArea', 'printMatrixArea', 'printFinanceArea',
    'printTrackingArea', 'printFinancialListArea', 'dashboardTab',
    'verificationTab', 'payrollTab', 'reportsTab', 'requirementsTab',
    'alumniTab', 'otherGrantsTab', 'auditLogsTab', 'settingsTab',
    'scholarDrawer', 'printModal'
];

const missing = required.filter(id => !portal.includes(`id="${id}"`));
if (missing.length === 0) {
    console.log('SUCCESS: All 21 required containers & tabs present in Portal.html!');
} else {
    console.error('MISSING IDs:', missing);
    process.exit(1);
}

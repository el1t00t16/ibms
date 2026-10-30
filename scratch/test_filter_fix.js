const assert = require('assert');

// Mock data replicating the user's dashboard breakdown
const dbData = [
  { ibmId: '2024-001', fullName: 'Juan Dela Cruz', school: 'SPAMAST', course: 'BSIT', barangay: 'Poblacion', status: 'ON-HOLD', dbStatus: 'ON-HOLD', yearLevel: '1st Year', remarks: 'Awaiting COR', controlNo: 1, semesterRecords: {} },
  { ibmId: '2024-002', fullName: 'Maria Santos', school: 'NDDU', course: 'BSED', barangay: 'Malandag', status: 'ON-HOLD', dbStatus: 'ON-HOLD', yearLevel: '2nd Year', remarks: 'Pending clearance', controlNo: 2, semesterRecords: {} },
  { ibmId: '2024-003', fullName: 'Pedro Penduko', school: 'Holy Cross', course: 'BSBA', barangay: 'Banate', status: 'ACTIVE', dbStatus: 'ACTIVE', yearLevel: '3rd Year', remarks: '', controlNo: 3, semesterRecords: {} },
  { ibmId: '2024-004', fullName: 'Ana Reyes', school: 'SPAMAST', course: 'BS Criminology', barangay: 'Alkikan', status: 'GRADUATED', dbStatus: 'GRADUATED', yearLevel: '4th Year', remarks: '', controlNo: 4, semesterRecords: {} },
  { ibmId: '2024-005', fullName: 'Kurt Cobain', school: 'GSC', course: 'BSIT', barangay: 'Poblacion', status: 'SEE KURT', dbStatus: 'SEE KURT', yearLevel: '1st Year', remarks: '', controlNo: 5, semesterRecords: {} },
  { ibmId: '2024-006', fullName: 'Rosa Parks', school: 'NDDU', course: 'BS Nursing', barangay: 'Kiblat', status: 'STOPPED', dbStatus: 'STOPPED', yearLevel: '2nd Year', remarks: '', controlNo: 6, semesterRecords: {} },
];

function filterData(searchVal) {
    searchVal = searchVal.toLowerCase().trim();
    return dbData.filter(s => {
        const sIbm = String(s.ibmId || '').toLowerCase();
        const sName = String(s.fullName || '').toLowerCase();
        const sSchool = String(s.school || '').toLowerCase();
        const sCourse = String(s.course || '').toLowerCase();
        const sBrgy = String(s.barangay || '').toLowerCase();
        const sStatus = String(s.status || '').toLowerCase();
        const sDbStatus = String(s.dbStatus || '').toLowerCase();
        const sYear = String(s.yearLevel || '').toLowerCase();
        const sRemarks = String(s.remarks || '').toLowerCase();
        const sControl = String(s.controlNo || s.no || '').toLowerCase();

        // Normalized strings so "on-hold" matches "on hold" and vice versa
        const searchNormalized = searchVal.replace(/[-_\s]+/g, ' ');
        const statusNormalized = sStatus.replace(/[-_\s]+/g, ' ');

        const matchesSearch = !searchVal || 
            sIbm.includes(searchVal) || 
            sName.includes(searchVal) || 
            sSchool.includes(searchVal) ||
            sCourse.includes(searchVal) ||
            sBrgy.includes(searchVal) ||
            sStatus.includes(searchVal) ||
            sDbStatus.includes(searchVal) ||
            statusNormalized.includes(searchNormalized) ||
            sYear.includes(searchVal) ||
            sRemarks.includes(searchVal) ||
            sControl.includes(searchVal);

        return matchesSearch;
    });
}

// Tests
console.log('Testing filter logic:');

const onHoldResults = filterData('ON-HOLD');
console.log('Search "ON-HOLD": found', onHoldResults.length, '(expected 2)');
assert.strictEqual(onHoldResults.length, 2);
assert.strictEqual(onHoldResults[0].status, 'ON-HOLD');
assert.strictEqual(onHoldResults[1].status, 'ON-HOLD');

const onHoldSpaceResults = filterData('on hold');
console.log('Search "on hold" (space): found', onHoldSpaceResults.length, '(expected 2)');
assert.strictEqual(onHoldSpaceResults.length, 2);

const seeKurtResults = filterData('SEE KURT');
console.log('Search "SEE KURT": found', seeKurtResults.length, '(expected 1)');
assert.strictEqual(seeKurtResults.length, 1);

const stoppedResults = filterData('STOPPED');
console.log('Search "STOPPED": found', stoppedResults.length, '(expected 1)');
assert.strictEqual(stoppedResults.length, 1);

const graduatedResults = filterData('GRADUATED');
console.log('Search "GRADUATED": found', graduatedResults.length, '(expected 1)');
assert.strictEqual(graduatedResults.length, 1);

const nameResults = filterData('Juan');
console.log('Search "Juan": found', nameResults.length, '(expected 1)');
assert.strictEqual(nameResults.length, 1);

const schoolResults = filterData('SPAMAST');
console.log('Search "SPAMAST": found', schoolResults.length, '(expected 2)');
assert.strictEqual(schoolResults.length, 2);

const courseResults = filterData('BSIT');
console.log('Search "BSIT": found', courseResults.length, '(expected 2)');
assert.strictEqual(courseResults.length, 2);

const emptyResults = filterData('');
console.log('Search "": found', emptyResults.length, '(expected 6)');
assert.strictEqual(emptyResults.length, 6);

console.log('ALL TESTS PASSED SUCCESSFULLY!');

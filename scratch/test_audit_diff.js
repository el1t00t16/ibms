const assert = require('assert');

function computeFieldDiff(oldRow, newData) {
    const fieldMap = [
      { label: 'First Name', oldVal: oldRow[4], newVal: newData.firstName },
      { label: 'Middle Name', oldVal: oldRow[5], newVal: newData.middleName },
      { label: 'Last Name', oldVal: oldRow[3], newVal: newData.lastName },
      { label: 'Sex', oldVal: oldRow[6], newVal: newData.sex },
      { label: 'School Year', oldVal: oldRow[2], newVal: newData.schoolYear },
      { label: 'Starting Year', oldVal: oldRow[18], newVal: newData.startingYear },
      { label: 'Course', oldVal: oldRow[7], newVal: newData.course },
      { label: 'School', oldVal: oldRow[8], newVal: newData.school },
      { label: 'School ID', oldVal: oldRow[10], newVal: newData.schoolId },
      { label: 'Barangay', oldVal: oldRow[9], newVal: newData.barangay },
      { label: 'Contact', oldVal: oldRow[11], newVal: newData.contact },
      { label: 'Tribe', oldVal: oldRow[12], newVal: newData.tribe },
      { label: 'Year Level', oldVal: oldRow[13], newVal: newData.yearLevel },
      { label: 'Status', oldVal: oldRow[14], newVal: newData.status },
      { label: 'LBP Account', oldVal: oldRow[17], newVal: newData.lbpAccount },
      { label: 'Remarks', oldVal: oldRow[15], newVal: newData.remarks }
    ];

    const changes = [];
    fieldMap.forEach(f => {
      const o = String(f.oldVal ?? '').trim();
      const n = String(f.newVal ?? '').trim();
      if (o !== n) {
        changes.push(`${f.label}: "${o || '(blank)'}" ➔ "${n || '(blank)'}"`);
      }
    });

    const scholarName = [newData.firstName, newData.lastName].filter(Boolean).join(' ') || newData.ibmId;
    const details = changes.length > 0 
      ? `Updated ${newData.ibmId} (${scholarName}) — ${changes.join(', ')}`
      : `Updated ${newData.ibmId} (${scholarName}) — No field changes detected`;

    return { changes, details };
}

// Mock old row representing Database sheet row (19 cols)
const oldRow = [
  1,               // 0: Control No
  '2024-00123',    // 1: IBM ID
  '2024-2025',     // 2: School Year
  'Dela Cruz',     // 3: Last Name
  'Juan',          // 4: First Name
  'Protacio',      // 5: Middle Name
  'Male',          // 6: Sex
  'BSIT',          // 7: Course
  'SPAMAST',       // 8: School
  'Poblacion',     // 9: Barangay
  'SC-9988',       // 10: School ID
  '09123456789',   // 11: Contact
  'Blaan',         // 12: Tribe
  '1st Year',      // 13: Year Level
  'ACTIVE',        // 14: Status
  'Good standing', // 15: Remarks
  2,               // 16: Semester Count
  '',              // 17: LBP Account (blank)
  '2024-2025'      // 18: Starting Year
];

// Case 1: Editing Year Level, Status, LBP Account
const updateData1 = {
  ibmId: '2024-00123',
  schoolYear: '2024-2025',
  firstName: 'Juan',
  middleName: 'Protacio',
  lastName: 'Dela Cruz',
  sex: 'Male',
  course: 'BSIT',
  school: 'SPAMAST',
  schoolId: 'SC-9988',
  barangay: 'Poblacion',
  contact: '09123456789',
  tribe: 'Blaan',
  yearLevel: '2nd Year',  // CHANGED
  status: 'WARNING',       // CHANGED
  lbpAccount: '1234567890', // CHANGED
  startingYear: '2024-2025',
  remarks: 'Good standing'
};

const result1 = computeFieldDiff(oldRow, updateData1);
console.log('Result 1 Details:\n', result1.details);
assert.strictEqual(result1.changes.length, 3);
assert.ok(result1.details.includes('Year Level: "1st Year" ➔ "2nd Year"'));
assert.ok(result1.details.includes('Status: "ACTIVE" ➔ "WARNING"'));
assert.ok(result1.details.includes('LBP Account: "(blank)" ➔ "1234567890"'));

// Case 2: No changes made
const updateData2 = {
  ibmId: '2024-00123',
  schoolYear: '2024-2025',
  firstName: 'Juan',
  middleName: 'Protacio',
  lastName: 'Dela Cruz',
  sex: 'Male',
  course: 'BSIT',
  school: 'SPAMAST',
  schoolId: 'SC-9988',
  barangay: 'Poblacion',
  contact: '09123456789',
  tribe: 'Blaan',
  yearLevel: '1st Year',
  status: 'ACTIVE',
  lbpAccount: '',
  startingYear: '2024-2025',
  remarks: 'Good standing'
};

const result2 = computeFieldDiff(oldRow, updateData2);
console.log('\nResult 2 Details:\n', result2.details);
assert.strictEqual(result2.changes.length, 0);
assert.ok(result2.details.includes('No field changes detected'));

console.log('\nALL AUDIT LOG DIFF TESTS PASSED SUCCESSFULLY! ✅');

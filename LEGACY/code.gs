const CONFIG = {
  SPREADSHEET_ID: '1sKWX1wGQdmHc675xKf_Q-_iDM0kiWzgAX0lstZPKJLY',
  CERTIFICATES_FOLDER_ID: '1Yo3LbI9AFtAHfJBrN5piN81sT8MRLQTu',
  CERTIFICATE_TEMPLATE_ID: '1NIuSo8sd0_NqmxQjePda95tcHCnFemVhRkzUukc7EJ8',
  SHEETS: {
    DATABASE: 'Database',
    PAYROLL: 'Payroll Data',
    EXPORT: 'Payroll_Export',
    USERS: 'User-portal',
    REQUIREMENTS: 'Requirements',
    SETTINGS: 'Settings',
    GRADUATES: 'graduatesDb',
    OTHER_GRANTS: 'otherGrantsDb' // <-- ADD THIS LINE
  },
  START_ROW: 2,
  SEMESTER_START_COL: 20 // Index where semesters start
};

function doGet() {
  return HtmlService.createTemplateFromFile('Portal')
      .evaluate()
      .setTitle('IBMS 1.2.05')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSS() {
  try { return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID); } catch (e) { return SpreadsheetApp.getActiveSpreadsheet(); }
}

function loginUser(username, password) {
  const ss = getSS();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  
  if (!sheet) throw new Error("User configuration sheet not found.");
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error("No users configured.");

  const data = sheet.getRange(2, 4, lastRow - 1, 2).getValues(); 
  
  const validUser = data.find(row => String(row[0]).toLowerCase() === String(username).toLowerCase() && String(row[1]) === String(password));
  
  if (validUser) {
    return { success: true };
  } else {
    throw new Error("Invalid username or password.");
  }
}

function logoutUser() {
  return { success: true };
}

function getSemestersMapping() {
    const ss = getSS();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
    if (!sheet) return {};

    const lastCol = sheet.getLastColumn();
    // Assuming headers are in row 1
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    const semesters = {};
    for (let i = CONFIG.SEMESTER_START_COL - 1; i < lastCol; i++) {
        if (headers[i]) {
            semesters[headers[i]] = i + 1; // 1-based index
        }
    }
    return semesters;
}

function getNextSemesterColumn() {
     const ss = getSS();
     const sheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
     if(!sheet) return null;
     return sheet.getLastColumn() + 1;
}

function addNewSemester(semesterName) {
    const ss = getSS();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
    if(!sheet) throw new Error("Database sheet not found.");
    
    const nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue(semesterName);
    return {success: true, message: `Semester ${semesterName} added.`};
}


function getData() {
  const ss = getSS();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  if (!sheet) throw new Error(`Sheet "${CONFIG.SHEETS.DATABASE}" not found.`);

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow < CONFIG.START_ROW) return [];

  const data = sheet.getRange(CONFIG.START_ROW, 1, lastRow - CONFIG.START_ROW + 1, lastCol).getValues();
  const payrollIds = getPayrollIbmIds();
  const SEMESTERS = getSemestersMapping();
  const sortedSemesters = Object.entries(SEMESTERS).sort((a, b) => a[1] - b[1]);

  return data.map((row, idx) => {
    const ibmId = String(row[1] || '').trim();
    if (!ibmId) return null;

    const fName = row[4];
    const mName = row[5];
    const lName = row[3];
    const fullName = [fName, mName, lName].filter(Boolean).join(' ');

    const semRecords = {};
    sortedSemesters.forEach(([semName, colIndex]) => {
        semRecords[semName] = String(row[colIndex - 1] || '').trim();
    });

    return {
      rowIndex: idx + CONFIG.START_ROW,
      controlNo: row[0],
      ibmId: ibmId,
      schoolYear: row[2],
      lastName: lName,
      firstName: fName,
      middleName: mName,
      sex: row[6],
      course: row[7],
      school: row[8],
      barangay: row[9],
      schoolId: row[10],
      contact: row[11],
      tribe: row[12],
      yearLevel: String(row[13] || '').trim(),
      status: String(row[14] || '').trim().toUpperCase(),
      dbStatus: String(row[14] || '').trim(),
      remarks: row[15],
      semesterCount: row[16],
      lbpAccount: String(row[17] || '').trim(),
      startingYear: String(row[18] || '').trim(),
      fullName: fullName,
      semesterRecords: semRecords,
      isInPayroll: payrollIds.includes(ibmId)
    };
  }).filter(Boolean);
}

function recalculateSemesterCount(sheet, rowIndex, sortedSems) {
  if (!sheet || !sortedSems) return 0;
  
  const lastCol = sheet.getLastColumn();
  const rowValues = sheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0];
  
  let currentStatus = String(rowValues[14] || '').trim().toUpperCase();
  let manualRemarks = String(rowValues[15] || '').trim();
  
  if(manualRemarks.startsWith("Sem ") && manualRemarks.includes("–")) {
     if(manualRemarks.includes("|")) {
       manualRemarks = manualRemarks.split("|")[1].trim(); 
     } else {
       manualRemarks = ""; 
     }
  }

  let count = 0;
  let hasStarted = false;

  sortedSems.forEach(([semName, colIndex]) => {
    const rawVal = rowValues[colIndex - 1]; 
    const status = String(rawVal || '').toUpperCase().trim();
    
    if (status === 'OK' || status === 'FIN' || status === 'MED' || status === 'NEW') {
      hasStarted = true;
    }

    if (hasStarted) {
      if (status === 'OK' || status === 'NEW') {
        count++; 
      } else if (status === 'FIN') {
        count++; 
      } 
    }
  });

  let autoTag = '';

  if (currentStatus === 'ACTIVE' || currentStatus === 'NEW') {
    if (count > 8) {
       autoTag = `Sem ${count}/8 – Extended`;
       currentStatus = 'EXTENDED';
    } else {
       autoTag = `Sem ${count}/8 – Active`;
    }
  } 
  else if (currentStatus.includes('MEDICAL')) {
    autoTag = `Sem ${count}/8 – Frozen (Medical)`;
  } 
  else if (currentStatus.includes('FINANCIAL')) {
    autoTag = `Sem ${count}/8 – On-Leave`;
  } 
  else if (currentStatus === 'GRADUATED') {
    autoTag = `Sem ${count}/8 – Graduated`; 
  }
  else if (currentStatus === 'DELISTED' || currentStatus === 'STOPPED') {
    autoTag = `Delisted / Removed`; 
  }
  else {
    autoTag = `Sem ${count}/8 – ${currentStatus}`;
  }

  let finalRemark = autoTag;
  if(manualRemarks && manualRemarks !== "") {
    finalRemark = `${autoTag} | ${manualRemarks}`;
  }

  sheet.getRange(rowIndex, 15).setValue(currentStatus);
  sheet.getRange(rowIndex, 16).setValue(finalRemark);
  sheet.getRange(rowIndex, 17).setValue(count);
  
  return count;
}

function updateAllSemesterCounts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Database');
  
  if (!sheet) {
    Logger.log("Error: 'Database' sheet not found!");
    return;
  }

  const SEMESTERS = getSemestersMapping();
  const sortedSems = Object.entries(SEMESTERS).sort((a, b) => a[1] - b[1]);
  const lastRow = sheet.getLastRow();
  const startRow = 2; 

  if (lastRow < startRow) {
    Logger.log("No data found.");
    return;
  }

  Logger.log(`Processing ${lastRow - startRow + 1} scholars...`);

  for (let i = startRow; i <= lastRow; i++) {
    const count = recalculateSemesterCount(sheet, i, sortedSems);
    Logger.log(`Row ${i}: Count = ${count}`);
  }

  Logger.log("✅ All semester counts updated!");
}


function getPayrollIbmIds() {
  const ss = getSS();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.START_ROW) return [];
  return sheet.getRange(CONFIG.START_ROW, 2, lastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(id => String(id).trim());
}

function getPayrollData() {
  const ss = getSS();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.START_ROW) return [];
  return sheet.getRange(CONFIG.START_ROW, 1, lastRow - CONFIG.START_ROW + 1, 8).getValues().map((row, idx) => ({
      rowIndex: idx + CONFIG.START_ROW,
      no: row[0],
      ibmId: String(row[1]),
      fullName: row[2],
      lbpAccount: row[3],
      status: row[4],
      yearLevel: row[5],
      grantPeriod: row[6],
      remarks: row[7]
  })).filter(r => r.ibmId);
}

function addScholarToDatabase(data) {
  const ss = getSS();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  
  const lastRow = sheet.getLastRow();
  let maxControl = 0;
  if (lastRow >= CONFIG.START_ROW) {
    const controls = sheet.getRange(CONFIG.START_ROW, 1, lastRow - CONFIG.START_ROW + 1, 1).getValues().flat();
    controls.forEach(c => {
      const num = parseInt(c, 10);
      if (!isNaN(num) && num > maxControl) maxControl = num;
    });
  }
  const newControl = maxControl + 1;
  const newControlPadded = String(newControl).padStart(5, '0');
  const syParts = data.schoolYear.split('-').map(p => p.trim().slice(-2));
  const syShort = syParts.length === 2 ? `${syParts[0]}-${syParts[1]}` : '00-00';
  const newIbmId = `IBM-${syShort}-${newControlPadded}`;

  const rowData = new Array(19).fill(''); 
  rowData[0] = newControl;            
  rowData[1] = newIbmId;              
  rowData[2] = data.schoolYear;       
  rowData[3] = data.lastName;         
  rowData[4] = data.firstName;        
  rowData[5] = data.middleName;       
  rowData[6] = data.sex;              
  rowData[7] = data.course;           
  rowData[8] = data.school;           
  rowData[9] = data.barangay;         
  rowData[10] = data.schoolId;        
  rowData[11] = data.contact;         
  rowData[12] = data.tribe;           
  rowData[13] = data.yearLevel;       
  rowData[14] = data.status;          
  rowData[15] = data.remarks;  
  rowData[16] = 0;        
  rowData[17] = data.lbpAccount;       
  rowData[18] = data.startingYear;       

  sheet.appendRow(rowData);
  logAction('ADD_SCHOLAR', `Added ${data.firstName} ${data.lastName} (ID: ${newIbmId})`);
  return { success: true };
}

function updateScholarInDatabase(data) {
    const ss = getSS();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
    const row = parseInt(data.rowIndex);
    
    const currentId = sheet.getRange(row, 2).getValue();
    if (String(currentId).trim() !== String(data.ibmId).trim()) {
        throw new Error("ID Mismatch. Data may have shifted. Please sync and try again.");
    }

    const part1 = [[
        data.schoolYear, data.lastName, data.firstName, data.middleName,
        data.sex, data.course, data.school, data.barangay,
        data.schoolId, data.contact, data.tribe, data.yearLevel,
        data.status, data.remarks
    ]];
    
    sheet.getRange(row, 3, 1, 14).setValues(part1);
    
    sheet.getRange(row, 18, 1, 2).setValues([[data.lbpAccount, data.startingYear]]);

    const SEMESTERS = getSemestersMapping();
    const sortedSems = Object.entries(SEMESTERS).sort((a, b) => a[1] - b[1]);
    recalculateSemesterCount(sheet, row, sortedSems);

    // ==========================================
    // NEW LOGIC: Sync changes to Payroll
    // ==========================================
    const pSheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL);
    if (pSheet) {
        const pLastRow = pSheet.getLastRow();
        if (pLastRow >= CONFIG.START_ROW) {
            const pIds = pSheet.getRange(CONFIG.START_ROW, 2, pLastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(String);
            const pIndex = pIds.indexOf(String(data.ibmId));
            
            if (pIndex !== -1) {
                const pRow = pIndex + CONFIG.START_ROW;
                const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
                
                pSheet.getRange(pRow, 3).setValue(fullName);       // Full Name
                pSheet.getRange(pRow, 4).setValue(data.lbpAccount); // LBP Account
                pSheet.getRange(pRow, 5).setValue(data.status);     // Status
                pSheet.getRange(pRow, 6).setValue(data.yearLevel);  // Year Level
                
                // Note: pSheet.getRange(pRow, 8).setValue(data.remarks); HAS BEEN REMOVED HERE
            }
        }
    }
    // ==========================================

    logAction('EDIT_SCHOLAR', `Updated info for ${data.ibmId}`);
    return { success: true };
}

function processDismissal(payload) {
  const { ibmId, type, failCount, remarks, date } = payload;
  const ss = getSS();
  const dSheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  const SEMESTERS = getSemestersMapping();
  
  let newStatus = 'OK';
  let violationText = '';
  
  if (type === 'MAJOR') {
    newStatus = 'DELISTED';
    violationText = `Major Offense: ${remarks}`;
  } 
  else if (type === 'VOLUNTARY') {
    newStatus = 'STOPPED';
    violationText = `Voluntary Withdrawal: ${remarks}`;
  } 
  else if (type === 'DEATH') {
    newStatus = 'STOPPED';
    violationText = 'Deceased';
  } 
  else if (type === 'OTHER_SCHOLARSHIP') {
    newStatus = 'DELISTED'; 
    const desc = remarks ? remarks.toUpperCase() : "EXTERNAL GRANT";
    violationText = `Double Grant: ${desc}`;
  } 
  else if (type === 'COMPLIANCE') {
    newStatus = 'WARNING';
    violationText = `Non-Compliance: ${remarks}`;
  } 
  else if (type === 'ACADEMIC') {
    const count = parseInt(failCount);
    if (count > 1) {
      newStatus = 'DELISTED';
      violationText = `Grade Deficiency: ${count} Subjects Failed`;
    } else {
      newStatus = 'PROBATION';
      violationText = `Probation: 1 Subject Failed`;
    }
  } 
  else if (type === 'MEDICAL') {
    newStatus = 'ON-LEAVE (MEDICAL)';
    violationText = `Medical Leave: ${remarks}`;
  } 
  else if (type === 'FINANCIAL') {
    newStatus = 'ON-LEAVE (FINANCIAL)';
    violationText = `Financial Leave: ${remarks}`;
  }
  else if (type === 'Graduated') {
    newStatus = 'GRADUATED';
    violationText = remarks ? `Graduated: ${remarks}` : 'Successfully Completed Program';
  }

  const lastRow = dSheet.getLastRow();
  const ids = dSheet.getRange(CONFIG.START_ROW, 2, lastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(String);
  const rowIndex = ids.indexOf(String(ibmId));
  if (rowIndex === -1) throw new Error('Scholar not found');
  const sheetRow = rowIndex + CONFIG.START_ROW;

  dSheet.getRange(sheetRow, 15).setValue(newStatus);

  let currentRemarks = String(dSheet.getRange(sheetRow, 16).getValue());
  if(currentRemarks.includes("|")) currentRemarks = currentRemarks.split("|")[1].trim(); 
  
  const finalManualRemark = `[${date}] ${violationText}. ` + currentRemarks;
  dSheet.getRange(sheetRow, 16).setValue(finalManualRemark);

  const sortedSems = Object.entries(SEMESTERS).sort((a, b) => a[1] - b[1]);
  recalculateSemesterCount(dSheet, sheetRow, sortedSems);

  const pSheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL);
  let payrollUpdated = false;

  if (pSheet) {
    const pLastRow = pSheet.getLastRow();
    if (pLastRow >= CONFIG.START_ROW) {
      const pIds = pSheet.getRange(CONFIG.START_ROW, 2, pLastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(String);
      const pIndex = pIds.indexOf(String(ibmId));
      
      if (pIndex !== -1) {
        const pRow = pIndex + CONFIG.START_ROW;
        
        pSheet.getRange(pRow, 5).setValue(newStatus); 
        pSheet.getRange(pRow, 8).setValue(violationText); 
        
        payrollUpdated = true;
        
        const grantPeriod = pSheet.getRange(pRow, 7).getValue();
        if (grantPeriod && SEMESTERS[grantPeriod]) {
             dSheet.getRange(sheetRow, SEMESTERS[grantPeriod]).setValue('OK');
             recalculateSemesterCount(dSheet, sheetRow, sortedSems);
        }
      } 
    }
  }
  
  logAction('DISMISSAL_ACTION', `Processed ${type} for ${ibmId}. Status: ${newStatus}`);
  return { success: true, newStatus: newStatus, payrollRemoved: false };
}

function addToPayroll(scholar) {
  const ss = getSS();
  let pSheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL) || createPayrollSheet(ss);
  const dSheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  const SEMESTERS = getSemestersMapping();

  if (getPayrollIbmIds().includes(scholar.ibmId)) throw new Error('Scholar already in payroll.');

  let finalName = scholar.fullName; 
  let finalStatus = 'ACTIVE'; 

  const is2ndSem = String(scholar.grantPeriod).includes("2nd Sem");
  const isGraduatingYear = String(scholar.yearLevel).includes("4th") || String(scholar.yearLevel).includes("5th");

  if (is2ndSem && isGraduatingYear) {
      finalStatus = 'GRADUATED';
  }

  const dbLastRow = dSheet.getLastRow();
  
  if (dbLastRow >= CONFIG.START_ROW) {
    const ids = dSheet.getRange(CONFIG.START_ROW, 2, dbLastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(String);
    const rowIdx = ids.indexOf(String(scholar.ibmId));

    if (rowIdx !== -1) {
      const sheetRow = rowIdx + CONFIG.START_ROW;
      
      if (scholar.grantPeriod && SEMESTERS[scholar.grantPeriod]) {
        dSheet.getRange(sheetRow, SEMESTERS[scholar.grantPeriod]).setValue('OK');
      }
      
      dSheet.getRange(sheetRow, 15).setValue(finalStatus);

      const sortedSems = Object.entries(SEMESTERS).sort((a, b) => a[1] - b[1]);
      recalculateSemesterCount(dSheet, sheetRow, sortedSems);
    }
  }

  const nextNo = pSheet.getLastRow() < CONFIG.START_ROW ? 1 : (pSheet.getLastRow() - CONFIG.START_ROW + 2);
  const newEntry = {
    rowIndex: pSheet.getLastRow() + 1,
    no: nextNo,
    ibmId: scholar.ibmId,
    fullName: finalName,
    lbpAccount: scholar.lbpAccount,
    status: finalStatus, 
    yearLevel: scholar.yearLevel,
    grantPeriod: scholar.grantPeriod,
    remarks: scholar.remarks
  };

  pSheet.appendRow([
    newEntry.no, newEntry.ibmId, newEntry.fullName, newEntry.lbpAccount, 
    newEntry.status, newEntry.yearLevel, newEntry.grantPeriod, newEntry.remarks
  ]);
  
  logAction('ADD_PAYROLL', `Added ${scholar.ibmId} to payroll`);
  return { success: true, newEntry: newEntry };
}

function batchAddToPayroll(payload) {
  const { ids, grantPeriod, remarks } = payload;
  const ss = getSS();
  const dSheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  let pSheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL) || createPayrollSheet(ss);
  const SEMESTERS = getSemestersMapping();
  
  const existingIds = getPayrollIbmIds();
  const validIds = ids.filter(id => !existingIds.includes(id));
  
  if (validIds.length === 0) return { success: true, addedCount: 0, newEntries: [] };

  const dbLastRow = dSheet.getLastRow();
  const dbLastCol = dSheet.getLastColumn();
  const dbData = dSheet.getRange(CONFIG.START_ROW, 1, dbLastRow - CONFIG.START_ROW + 1, dbLastCol).getValues();
  
  const idMap = new Map();
  dbData.forEach((r, i) => idMap.set(String(r[1]), i));

  const payrollRows = [];
  const newEntries = [];
  let nextNo = pSheet.getLastRow() < CONFIG.START_ROW ? 1 : (pSheet.getLastRow() - CONFIG.START_ROW + 2);
  const semColIndex = SEMESTERS[grantPeriod] ? SEMESTERS[grantPeriod] - 1 : -1;
  const sortedSems = Object.entries(SEMESTERS).sort((a, b) => a[1] - b[1]);

  const isPromotionTime = grantPeriod.includes("1st Sem");
  
  const is2ndSem = grantPeriod.includes("2nd Sem");

  validIds.forEach(id => {
    if (idMap.has(id)) {
      const idx = idMap.get(id);
      const row = dbData[idx];
      const sheetRow = CONFIG.START_ROW + idx;
      
      const fullName = [row[4], (row[5] ? row[5].charAt(0) + '.' : ''), row[3]].filter(Boolean).join(' ');
      const lbp = row[17]; 
      
      let currentYear = row[13] || "1st Year";
      let currentStatus = String(row[14] || '').toUpperCase();
      
      if (isPromotionTime && currentStatus !== 'NEW' && currentStatus !== 'STOPPED') {
          const nextYear = getNextYearLevel(currentYear);
          if (nextYear !== currentYear) {
             currentYear = nextYear; 
             dSheet.getRange(sheetRow, 14).setValue(currentYear);
          }
      }

      let newStatus = 'ACTIVE';
      
      if (is2ndSem && (String(currentYear).includes("4th") || String(currentYear).includes("5th"))) {
          newStatus = 'GRADUATED';
      }

      const pRow = [nextNo, id, fullName, lbp, newStatus, currentYear, grantPeriod, remarks];
      payrollRows.push(pRow);
      
      newEntries.push({
        rowIndex: -1, 
        no: nextNo,
        ibmId: id,
        fullName: fullName,
        lbpAccount: lbp,
        status: newStatus,
        yearLevel: currentYear,
        grantPeriod: grantPeriod,
        remarks: remarks
      });
      nextNo++;

      if (semColIndex !== -1) {
         dSheet.getRange(sheetRow, semColIndex + 1).setValue('OK');
         dSheet.getRange(sheetRow, 15).setValue(newStatus); 
         recalculateSemesterCount(dSheet, sheetRow, sortedSems);
      }
    }
  });

  if (payrollRows.length > 0) {
    pSheet.getRange(pSheet.getLastRow() + 1, 1, payrollRows.length, 8).setValues(payrollRows);
  }
  
  logAction('BATCH_ADD', `Batch added ${validIds.length} scholars (Auto-Promotion: ${isPromotionTime})`);
  return { success: true, addedCount: validIds.length, newEntries: newEntries };
}

function updatePayrollEntry(data) {
  const ss = getSS();
  const pSheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL);
  const dSheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);

  pSheet.getRange(data.rowIndex, 1, 1, 8).setValues([[
    data.no, data.ibmId, data.fullName, data.lbpAccount, data.status, data.yearLevel, data.grantPeriod, data.remarks
  ]]);

  const dbLastRow = dSheet.getLastRow();
  if (dbLastRow >= CONFIG.START_ROW) {
    const ids = dSheet.getRange(CONFIG.START_ROW, 2, dbLastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(String);
    const rowIdx = ids.indexOf(String(data.ibmId));
    if (rowIdx !== -1) {
      const sheetRow = rowIdx + CONFIG.START_ROW;
      if (data.yearLevel) dSheet.getRange(sheetRow, 14).setValue(data.yearLevel);
    }
  }
  return { success: true };
}

function removeFromPayroll(rowIndex) {
  const ss = getSS();
  const pSheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL);
  const dSheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  const SEMESTERS = getSemestersMapping();
  
  const ibmId = pSheet.getRange(rowIndex, 2).getValue();
  const grantPeriod = pSheet.getRange(rowIndex, 7).getValue();

  pSheet.deleteRow(rowIndex);
  
  const lastRow = pSheet.getLastRow();
  if (lastRow >= CONFIG.START_ROW) {
    const range = pSheet.getRange(CONFIG.START_ROW, 1, lastRow - CONFIG.START_ROW + 1, 1);
    const vals = range.getValues().map((r, i) => [i + 1]);
    range.setValues(vals);
  }

  if (ibmId && grantPeriod && SEMESTERS[grantPeriod]) {
    const dbLastRow = dSheet.getLastRow();
    
    if (dbLastRow >= CONFIG.START_ROW) {
       const ids = dSheet.getRange(CONFIG.START_ROW, 2, dbLastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(String);
       const scholarIdx = ids.indexOf(String(ibmId));
       
       if (scholarIdx !== -1) {
         const sheetRow = scholarIdx + CONFIG.START_ROW;
         const semCol = SEMESTERS[grantPeriod];
         const sortedSems = Object.entries(SEMESTERS).sort((a, b) => a[1] - b[1]);

         dSheet.getRange(sheetRow, semCol).setValue(''); 

         dSheet.getRange(sheetRow, 15).setValue('ON-HOLD');

         recalculateSemesterCount(dSheet, sheetRow, sortedSems);
       }
    }
  }
  
  logAction('REMOVE_PAYROLL', `Removed ${ibmId} from payroll and reverted status.`);
  return { success: true };
}

function createPayrollSheet(ss) {
  const sheet = ss.insertSheet(CONFIG.SHEETS.PAYROLL);
  sheet.appendRow(['No.', 'IBM ID', 'Full Name', 'LBP Account', 'Status', 'Year', 'Period', 'Remarks']);
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  return sheet;
}

function getAvailableSemesters() {
  const SEMESTERS = getSemestersMapping();
  return Object.entries(SEMESTERS)
    .sort((a, b) => a[1] - b[1])
    .map(entry => entry[0]);
}

function exportPayrollCSV() {
  const ss = getSS();
  const pSheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL);
  let eSheet = ss.getSheetByName(CONFIG.SHEETS.EXPORT) || ss.insertSheet(CONFIG.SHEETS.EXPORT);
  eSheet.clear();
  pSheet.getDataRange().copyTo(eSheet.getRange(1, 1));
  return { success: true };
}

function logAction(action, details) {
  const ss = getSS();
  let sheet = ss.getSheetByName('Logs');
  if (!sheet) {
    sheet = ss.insertSheet('Logs');
    sheet.appendRow(['Timestamp', 'User', 'Action', 'Details']);
  }
  sheet.appendRow([new Date(), Session.getActiveUser().getEmail(), action, details]);
}


function getNextYearLevel(currentLevel) {
  if (!currentLevel) return "";
  
  const match = currentLevel.match(/^(\d+)/);
  if (!match) return currentLevel; 
  
  let num = parseInt(match[1]);
  
  if (num >= 5) return currentLevel; 
  
  num++; 
  
  let suffix = 'th';
  if (num === 1) suffix = 'st';
  else if (num === 2) suffix = 'nd';
  else if (num === 3) suffix = 'rd';
  
  return `${num}${suffix} Year`;
}

function generateCertificate(scholarId, removalDate) {
  try {
    const ss = getSS();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
    const lastRow = sheet.getLastRow();
    
    let scholarData = null;
    if (lastRow >= CONFIG.START_ROW) {
      const ids = sheet.getRange(CONFIG.START_ROW, 2, lastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(String);
      const rowIdx = ids.indexOf(String(scholarId));
      
      if (rowIdx !== -1) {
        const rowValues = sheet.getRange(CONFIG.START_ROW + rowIdx, 1, 1, 28).getValues()[0];
        
        const fName = rowValues[4];
        const mName = rowValues[5];
        const lName = rowValues[3];
        const fullName = [fName, mName, lName].filter(Boolean).join(' ');

        scholarData = {
          ibmId: rowValues[1],
          fullName: fullName,
          firstName: fName,
          lastName: lName,
          barangay: rowValues[9]
        };
      }
    }

    if (!scholarData) throw new Error(`Scholar with ID ${scholarId} not found.`);

    const folder = DriveApp.getFolderById(CONFIG.CERTIFICATES_FOLDER_ID);
    const templateFile = DriveApp.getFileById(CONFIG.CERTIFICATE_TEMPLATE_ID);
    
    const newFileName = `Certificate - ${scholarData.lastName}, ${scholarData.firstName}`;
    const tempFile = templateFile.makeCopy(newFileName, folder);
    const doc = DocumentApp.openById(tempFile.getId());
    const body = doc.getBody();

    const removalDateStr = new Date(removalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const now = new Date();
    const day = now.getDate();
    const year = now.getFullYear();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const currentDateStr = `${getOrdinal(day)} day of ${month}, ${year}`;

    body.replaceText('{{FULL_NAME}}', scholarData.fullName);
    body.replaceText('{{IBM_ID}}', scholarData.ibmId);
    body.replaceText('{{Barangay}}', scholarData.barangay || '________');
    body.replaceText('{{date_removal}}', removalDateStr);
    body.replaceText('{{DATE}}', currentDateStr);

    doc.saveAndClose();

    const pdfBlob = tempFile.getAs('application/pdf');
    const pdfFile = folder.createFile(pdfBlob).setName(newFileName + ".pdf");
    tempFile.setTrashed(true);

    return { success: true, url: pdfFile.getUrl() };

  } catch (error) {
    throw new Error('Cert Error: ' + error.message);
  }
}

function getReqSettings() {
  const ss = getSS();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.SETTINGS);
    sheet.appendRow(['REQUIREMENTS_OPEN', 'false']);
    sheet.appendRow(['ACTIVE_SEMESTER', '']);
  }
  const data = sheet.getRange(1, 1, 2, 2).getValues();
  return {
    isOpen: String(data[0][1]).toLowerCase() === 'true',
    activeSemester: String(data[1][1] || '')
  };
}

function updateReqSettings(isOpen, activeSemester) {
  const ss = getSS();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  if (!sheet) return { success: false, error: 'Settings sheet not found.' };
  
  sheet.getRange(1, 2).setValue(isOpen);
  sheet.getRange(2, 2).setValue(activeSemester);
  logAction('SETTINGS_UPDATE', `Reqs Open: ${isOpen}, Sem: ${activeSemester}`);
  return { success: true };
}

function getRequirementsData() {
  const ss = getSS();
  let sheet = ss.getSheetByName(CONFIG.SHEETS.REQUIREMENTS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.REQUIREMENTS);
    sheet.appendRow(['Timestamp', 'IBM ID', 'Name', 'Semester', 'File URL', 'Status', 'Admin Remarks']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return [];
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  return data.map((row, idx) => ({
    rowIndex: idx + 2,
    date: new Date(row[0]).toLocaleDateString(),
    ibmId: row[1],
    fullName: row[2],
    semester: row[3],
    fileUrl: row[4],
    status: row[5],
    remarks: row[6]
  })).reverse(); 
}

function processRequirementValidation(payload) {
  const { rowIndex, ibmId, status, remarks, semester } = payload;
  const ss = getSS();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.REQUIREMENTS);
  if (!sheet) throw new Error("Requirements sheet not found.");
  
  sheet.getRange(rowIndex, 6).setValue(status);
  sheet.getRange(rowIndex, 7).setValue(remarks);
  
  if (status === 'APPROVED') {
    const batchPayload = { ids: [ibmId], grantPeriod: semester, remarks: 'Auto-added via Portal Verification' };
    batchAddToPayroll(batchPayload); 
  }
  
  logAction('REQUIREMENT_VALIDATION', `${status} requirement for ${ibmId} (${semester})`);
  return { success: true };
}

// --- BATCH UPDATE PROCESSING ---
function batchUpdateScholars(payload) {
  const { ids, updates, individualYears } = payload;
  if (!ids || ids.length === 0) return { count: 0 };

  const ss = getSS();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  const pSheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const colMap = {
    ibmId: headers.indexOf('IBM ID') !== -1 ? headers.indexOf('IBM ID') : 1,
    schoolYear: headers.indexOf('School Year'),
    yearLevel: headers.indexOf('Year Level') !== -1 ? headers.indexOf('Year Level') : 13,
    status: 14,
    remarks: headers.indexOf('Remarks') !== -1 ? headers.indexOf('Remarks') : 15,
    course: headers.indexOf('Course') !== -1 ? headers.indexOf('Course') : 7,
    school: headers.indexOf('School') !== -1 ? headers.indexOf('School') : 8
  };

  let updateCount = 0;
  const idsSet = new Set(ids);
  const updatedYears = {};

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][colMap.ibmId]).trim();
    
    if (idsSet.has(rowId)) {
      // 1. Common Updates
      if (updates.schoolYear && colMap.schoolYear > -1) data[i][colMap.schoolYear] = updates.schoolYear;
      if (updates.status) data[i][colMap.status] = updates.status; 
      if (updates.remarks && colMap.remarks > -1) data[i][colMap.remarks] = updates.remarks;
      if (updates.course && colMap.course > -1) data[i][colMap.course] = updates.course;
      if (updates.school && colMap.school > -1) data[i][colMap.school] = updates.school;

      // 2. Individual Year Level Updates
      if (individualYears && individualYears[rowId] && colMap.yearLevel > -1) {
        data[i][colMap.yearLevel] = individualYears[rowId];
        updatedYears[rowId] = individualYears[rowId];
      }
      
      updateCount++;
    }
  }

  if (updateCount > 0) {
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);

    // Sync to Payroll if year level or status changed
    if (pSheet && (updates.status || Object.keys(updatedYears).length > 0)) {
      const pLastRow = pSheet.getLastRow();
      if (pLastRow >= CONFIG.START_ROW) {
        const pRange = pSheet.getRange(CONFIG.START_ROW, 1, pLastRow - CONFIG.START_ROW + 1, 8);
        const pData = pRange.getValues();
        let pUpdated = false;

        for (let i = 0; i < pData.length; i++) {
          const pId = String(pData[i][1]).trim();
          if (idsSet.has(pId)) {
            if (updates.status) {
              pData[i][4] = updates.status;
              pUpdated = true;
            }
            if (updatedYears[pId]) {
              pData[i][5] = updatedYears[pId];
              pUpdated = true;
            }
          }
        }
        
        if (pUpdated) {
          pRange.setValues(pData);
        }
      }
    }
  }

  return { count: updateCount };
}

// ==========================================
// ALUMNI & GRADUATES DATABASE LOGIC
// ==========================================

function addToGraduatesDb(ibmId, gradYear, honor) {
  const ss = getSS();
  const dbSheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  let gradSheet = ss.getSheetByName(CONFIG.SHEETS.GRADUATES);
  
  if (!gradSheet) {
    gradSheet = ss.insertSheet(CONFIG.SHEETS.GRADUATES);
    gradSheet.appendRow(['IBM ID', 'NAME (ln,fn,mi)', 'GENDER', 'TRIBE', 'SCHOOL', 'COURSE', 'BARANGAY', 'YEAR', 'LATIN HONOR']);
    gradSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    gradSheet.setFrozenRows(1);
  }
  
  const gradLastRow = gradSheet.getLastRow();
  if (gradLastRow > 1) {
    const existingIds = gradSheet.getRange(2, 1, gradLastRow - 1, 1).getValues().flat().map(String);
    if (existingIds.includes(String(ibmId))) {
      return { success: false, message: 'This scholar is already in the Graduates Database.' };
    }
  }
  
  const dbLastRow = dbSheet.getLastRow();
  const dbIds = dbSheet.getRange(CONFIG.START_ROW, 2, dbLastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(String);
  const rowIdx = dbIds.indexOf(String(ibmId));
  
  if (rowIdx === -1) throw new Error('Scholar not found in main database.');
  
  const sheetRow = rowIdx + CONFIG.START_ROW;
  const rowData = dbSheet.getRange(sheetRow, 1, 1, 15).getValues()[0];
  
  const lastName = rowData[3];
  const firstName = rowData[4];
  const middleName = rowData[5];
  const mInitial = middleName ? middleName.toString().charAt(0) + '.' : '';
  const fullName = `${lastName}, ${firstName} ${mInitial}`.trim().toUpperCase();
  
  gradSheet.appendRow([
    ibmId, fullName, rowData[6], rowData[12], rowData[8], rowData[7], rowData[9], gradYear, honor || ''
  ]);
  
  if (String(rowData[14]).toUpperCase() !== 'GRADUATED') {
     dbSheet.getRange(sheetRow, 15).setValue('GRADUATED');
     let currentRemarks = String(dbSheet.getRange(sheetRow, 16).getValue() || '');
     if(currentRemarks.includes("|")) currentRemarks = currentRemarks.split("|")[1].trim(); 
     dbSheet.getRange(sheetRow, 16).setValue(`[${new Date().toLocaleDateString()}] Added to Alumni List. ` + currentRemarks);
  }
  
  logAction('ADD_GRADUATE', `Added ${ibmId} to Alumni Database (${gradYear})`);
  return { success: true, message: 'Successfully added to Alumni List and updated status.' };
}

function batchAddToGraduatesDb(payload) {
  const { ids, gradYear } = payload;
  if (!ids || ids.length === 0) return { success: true, message: "No scholars selected." };

  const ss = getSS();
  const dbSheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  let gradSheet = ss.getSheetByName(CONFIG.SHEETS.GRADUATES);

  if (!gradSheet) {
    gradSheet = ss.insertSheet(CONFIG.SHEETS.GRADUATES);
    gradSheet.appendRow(['IBM ID', 'NAME (ln,fn,mi)', 'GENDER', 'TRIBE', 'SCHOOL', 'COURSE', 'BARANGAY', 'YEAR', 'LATIN HONOR']);
    gradSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    gradSheet.setFrozenRows(1);
  }

  const gradLastRow = gradSheet.getLastRow();
  let existingIds = [];
  if (gradLastRow > 1) {
    existingIds = gradSheet.getRange(2, 1, gradLastRow - 1, 1).getValues().flat().map(String);
  }

  const dbData = dbSheet.getDataRange().getValues();
  const colMap = { ibmId: 1, lastName: 3, firstName: 4, middleName: 5, gender: 6, course: 7, school: 8, barangay: 9, tribe: 12, status: 14, remarks: 15 };

  let skippedCount = 0;
  const rowsToAdd = [];
  
  // Update data in-memory for speed
  for (let i = 1; i < dbData.length; i++) {
    const id = String(dbData[i][colMap.ibmId]);
    
    if (ids.includes(id)) {
      if (existingIds.includes(id)) {
        skippedCount++;
        continue; // Skip duplicates silently
      }

      const mName = dbData[i][colMap.middleName];
      const mInitial = mName ? String(mName).charAt(0) + '.' : '';
      const fullName = `${dbData[i][colMap.lastName]}, ${dbData[i][colMap.firstName]} ${mInitial}`.trim().toUpperCase();

      rowsToAdd.push([
        id, fullName, dbData[i][colMap.gender], dbData[i][colMap.tribe],
        dbData[i][colMap.school], dbData[i][colMap.course], dbData[i][colMap.barangay],
        gradYear, ''
      ]);

      // Flip status cleanly
      dbData[i][colMap.status] = 'GRADUATED';
      let rem = String(dbData[i][colMap.remarks] || '');
      if(rem.includes("|")) rem = rem.split("|")[1].trim(); 
      dbData[i][colMap.remarks] = `[${new Date().toLocaleDateString()}] Batch Added to Alumni List. ` + rem;
    }
  }

  // Single bulk write for performance
  if (rowsToAdd.length > 0) {
    gradSheet.getRange(gradLastRow + 1, 1, rowsToAdd.length, 9).setValues(rowsToAdd);
    dbSheet.getRange(1, 1, dbData.length, dbData[0].length).setValues(dbData);
    logAction('BATCH_GRADUATE', `Batch added ${rowsToAdd.length} scholars to Alumni`);
  }

  return { 
    success: true, 
    message: `Successfully moved ${rowsToAdd.length} scholars to Alumni. ${skippedCount > 0 ? `(${skippedCount} skipped as they were already in the DB)` : ''}` 
  };
}


function getGraduatesData() {
  const ss = getSS();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.GRADUATES);
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  // Gets columns A to I (Indexes 0 to 8)
  const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  
  return data.map(r => ({
    ibmId: r[0],
    fullName: r[1],
    gender: r[2],
    tribe: r[3],
    school: r[4],
    course: r[5],
    barangay: r[6],
    gradYear: r[7],
    honor: r[8]
  }));
}


// ==========================================
// OTHER GRANTS DATABASE LOGIC
// ==========================================

function addToOtherGrantsDb(ibmId, grantName, year) {
  const ss = getSS();
  const dbSheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  const pSheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL);
  let ogSheet = ss.getSheetByName(CONFIG.SHEETS.OTHER_GRANTS);
  
  // Create sheet if it doesn't exist
  if (!ogSheet) {
    ogSheet = ss.insertSheet(CONFIG.SHEETS.OTHER_GRANTS);
    ogSheet.appendRow(['IBM ID', 'NAME (ln,fn,mi)', 'GENDER', 'TRIBE', 'SCHOOL', 'COURSE', 'BARANGAY', 'YEAR', 'GRANT NAME']);
    ogSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    ogSheet.setFrozenRows(1);
  }
  
  // Check for duplicates
  const ogLastRow = ogSheet.getLastRow();
  if (ogLastRow > 1) {
    const existingIds = ogSheet.getRange(2, 1, ogLastRow - 1, 1).getValues().flat().map(String);
    if (existingIds.includes(String(ibmId))) {
      return { success: false, message: 'This scholar is already in the Other Grants Database.' };
    }
  }
  
  const dbLastRow = dbSheet.getLastRow();
  const dbIds = dbSheet.getRange(CONFIG.START_ROW, 2, dbLastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(String);
  const rowIdx = dbIds.indexOf(String(ibmId));
  
  if (rowIdx === -1) throw new Error('Scholar not found in main database.');
  
  const sheetRow = rowIdx + CONFIG.START_ROW;
  const rowData = dbSheet.getRange(sheetRow, 1, 1, 15).getValues()[0];
  
  const lastName = rowData[3];
  const firstName = rowData[4];
  const middleName = rowData[5];
  const mInitial = middleName ? middleName.toString().charAt(0) + '.' : '';
  const fullName = `${lastName}, ${firstName} ${mInitial}`.trim().toUpperCase();
  
  // Append to Other Grants Sheet
  ogSheet.appendRow([
    ibmId, fullName, rowData[6], rowData[12], rowData[8], rowData[7], rowData[9], year, grantName || ''
  ]);
  
  // Update Database Status to DELISTED
  const newStatus = 'DELISTED';
  if (String(rowData[14]).toUpperCase() !== newStatus) {
     dbSheet.getRange(sheetRow, 15).setValue(newStatus);
     let currentRemarks = String(dbSheet.getRange(sheetRow, 16).getValue() || '');
     if(currentRemarks.includes("|")) currentRemarks = currentRemarks.split("|")[1].trim(); 
     dbSheet.getRange(sheetRow, 16).setValue(`[${new Date().toLocaleDateString()}] Double Grant: ${grantName}. ` + currentRemarks);
  }

  // Sync Status to Payroll (if they are in it)
  if (pSheet) {
    const pLastRow = pSheet.getLastRow();
    if (pLastRow >= CONFIG.START_ROW) {
      const pIds = pSheet.getRange(CONFIG.START_ROW, 2, pLastRow - CONFIG.START_ROW + 1, 1).getValues().flat().map(String);
      const pIndex = pIds.indexOf(String(ibmId));
      if (pIndex !== -1) {
        pSheet.getRange(pIndex + CONFIG.START_ROW, 5).setValue(newStatus);
      }
    }
  }
  
  logAction('ADD_OTHER_GRANT', `Added ${ibmId} to Other Grants DB (${grantName})`);
  return { success: true, message: 'Successfully added to Other Grants List and marked as Delisted.' };
}

function batchAddToOtherGrantsDb(payload) {
  const { ids, grantName, year } = payload;
  if (!ids || ids.length === 0) return { success: true, message: "No scholars selected." };

  const ss = getSS();
  const dbSheet = ss.getSheetByName(CONFIG.SHEETS.DATABASE);
  const pSheet = ss.getSheetByName(CONFIG.SHEETS.PAYROLL);
  let ogSheet = ss.getSheetByName(CONFIG.SHEETS.OTHER_GRANTS);

  if (!ogSheet) {
    ogSheet = ss.insertSheet(CONFIG.SHEETS.OTHER_GRANTS);
    ogSheet.appendRow(['IBM ID', 'NAME (ln,fn,mi)', 'GENDER', 'TRIBE', 'SCHOOL', 'COURSE', 'BARANGAY', 'YEAR', 'GRANT NAME']);
    ogSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    ogSheet.setFrozenRows(1);
  }

  const ogLastRow = ogSheet.getLastRow();
  let existingIds = [];
  if (ogLastRow > 1) {
    existingIds = ogSheet.getRange(2, 1, ogLastRow - 1, 1).getValues().flat().map(String);
  }

  const dbData = dbSheet.getDataRange().getValues();
  const colMap = { ibmId: 1, lastName: 3, firstName: 4, middleName: 5, gender: 6, course: 7, school: 8, barangay: 9, tribe: 12, status: 14, remarks: 15 };

  let skippedCount = 0;
  const rowsToAdd = [];
  const pUpdates = []; // Keep track of payroll rows to update
  
  let pData = null;
  let pIds = [];
  if (pSheet && pSheet.getLastRow() >= CONFIG.START_ROW) {
      pData = pSheet.getRange(CONFIG.START_ROW, 1, pSheet.getLastRow() - CONFIG.START_ROW + 1, 8).getValues();
      pIds = pData.map(r => String(r[1])); // Column 2 is IBM ID
  }

  for (let i = 1; i < dbData.length; i++) {
    const id = String(dbData[i][colMap.ibmId]);
    
    if (ids.includes(id)) {
      if (existingIds.includes(id)) {
        skippedCount++;
        continue;
      }

      const mName = dbData[i][colMap.middleName];
      const mInitial = mName ? String(mName).charAt(0) + '.' : '';
      const fullName = `${dbData[i][colMap.lastName]}, ${dbData[i][colMap.firstName]} ${mInitial}`.trim().toUpperCase();

      rowsToAdd.push([
        id, fullName, dbData[i][colMap.gender], dbData[i][colMap.tribe],
        dbData[i][colMap.school], dbData[i][colMap.course], dbData[i][colMap.barangay],
        year, grantName || ''
      ]);

      dbData[i][colMap.status] = 'DELISTED';
      let rem = String(dbData[i][colMap.remarks] || '');
      if(rem.includes("|")) rem = rem.split("|")[1].trim(); 
      dbData[i][colMap.remarks] = `[${new Date().toLocaleDateString()}] Batch Added to Other Grants: ${grantName}. ` + rem;

      if (pData) {
          const pIdx = pIds.indexOf(id);
          if (pIdx !== -1) pData[pIdx][4] = 'DELISTED'; // Col 5 is Status
      }
    }
  }

  // Single bulk write for performance
  if (rowsToAdd.length > 0) {
    ogSheet.getRange(ogLastRow + 1, 1, rowsToAdd.length, 9).setValues(rowsToAdd);
    dbSheet.getRange(1, 1, dbData.length, dbData[0].length).setValues(dbData);
    if (pData) pSheet.getRange(CONFIG.START_ROW, 1, pData.length, 8).setValues(pData);
    
    logAction('BATCH_OTHER_GRANT', `Batch added ${rowsToAdd.length} scholars to Other Grants`);
  }

  return { 
    success: true, 
    message: `Successfully moved ${rowsToAdd.length} scholars to Other Grants. ${skippedCount > 0 ? `(${skippedCount} skipped as they were already in the DB)` : ''}` 
  };
}

function getOtherGrantsData() {
  const ss = getSS();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.OTHER_GRANTS);
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  
  return data.map(r => ({
    ibmId: r[0],
    fullName: r[1],
    gender: r[2],
    tribe: r[3],
    school: r[4],
    course: r[5],
    barangay: r[6],
    year: r[7],
    grantName: r[8]
  }));
}


/**
 * IBMS Hybrid Offline Data Service
 * Implements client-side offline-first operations on Dexie IndexedDB
 * with automatic mutation enqueueing for Supabase synchronization.
 */

import { db, ScholarOffline, PayrollOffline, GraduateOffline, OtherGrantOffline } from '../db/indexedDb';
import { syncEngine } from './syncEngine';

export class OfflineDataService {
  /**
   * Fetch all scholars with their semesterRecords and payroll status
   */
  async getData(): Promise<any[]> {
    const scholars = await db.scholars.filter(s => !s.isDeleted).toArray();
    const payrollRecords = await db.payroll.filter(p => !p.isDeleted).toArray();
    const payrollIds = new Set(payrollRecords.map(p => p.ibmId));

    const allSemRecords = await db.scholarSemesters.filter(ss => !ss.isDeleted).toArray();
    const semMap: Record<string, Record<string, string>> = {};
    for (const ss of allSemRecords) {
      if (!semMap[ss.ibmId]) {
        semMap[ss.ibmId] = {};
      }
      semMap[ss.ibmId][ss.semesterName] = ss.status;
    }

    return scholars.map(s => {
      const fName = s.firstName || '';
      const mName = s.middleName || '';
      const lName = s.lastName || '';
      const fullName = [fName, mName, lName].filter(Boolean).join(' ');

      return {
        rowIndex: s.controlNo,
        controlNo: s.controlNo,
        ibmId: s.ibmId,
        schoolYear: s.schoolYear || '',
        lastName: lName,
        firstName: fName,
        middleName: mName,
        sex: s.sex || '',
        course: s.course || '',
        school: s.school || '',
        barangay: s.barangay || '',
        schoolId: s.schoolId || '',
        contact: s.contact || '',
        tribe: s.tribe || '',
        yearLevel: s.yearLevel || '1st Year',
        status: (s.status || 'ACTIVE').toUpperCase(),
        dbStatus: s.status || 'ACTIVE',
        remarks: s.remarks || '',
        removalDate: s.removalDate || null,
        incidentDate: s.removalDate || null,
        semesterCount: s.semesterCount || 0,
        lbpAccount: s.lbpAccount || '',
        startingYear: s.startingYear || '',
        fullName: fullName || s.fullName || s.ibmId,
        semesterRecords: semMap[s.ibmId] || {},
        isInPayroll: payrollIds.has(s.ibmId)
      };
    });
  }

  /**
   * Fetch active payroll table
   */
  async getPayrollData(): Promise<any[]> {
    const rows = await db.payroll.filter(p => !p.isDeleted).toArray();
    return rows.map((p, idx) => ({
      no: p.no || idx + 1,
      ibmId: p.ibmId,
      fullName: p.fullName,
      lbpAccount: p.lbpAccount || '',
      status: p.status || 'ACTIVE',
      yearLevel: p.yearLevel || '',
      grantPeriod: p.grantPeriod || '',
      remarks: p.remarks || ''
    }));
  }

  /**
   * Fetch alumni / graduates directory
   */
  async getGraduatesData(): Promise<any[]> {
    const rows = await db.graduates.filter(g => !g.isDeleted).toArray();
    return rows.map(g => ({
      ibmId: g.ibmId,
      fullName: g.fullName,
      gender: g.gender || '',
      tribe: g.tribe || '',
      school: g.school || '',
      course: g.course || '',
      barangay: g.barangay || '',
      gradYear: g.gradYear || '',
      yearGraduated: g.yearGraduated || g.gradYear || '',
      honor: g.honor || '',
      employmentStatus: g.employmentStatus || '',
      company: g.company || '',
      contact: g.contact || '',
      email: g.email || '',
      gradPhoto: g.gradPhoto || '',
      workPhoto: g.workPhoto || ''
    }));
  }

  /**
   * Fetch other grants directory
   */
  async getOtherGrantsData(): Promise<any[]> {
    const rows = await db.otherGrants.filter(o => !o.isDeleted).toArray();
    return rows.map(o => ({
      ibmId: o.ibmId,
      fullName: o.fullName,
      gender: o.gender || '',
      tribe: o.tribe || '',
      school: o.school || '',
      course: o.course || '',
      barangay: o.barangay || '',
      year: o.year || '',
      grantName: o.grantName || ''
    }));
  }

  /**
   * Fetch available semesters list
   */
  async getAvailableSemesters(): Promise<string[]> {
    const rows = await db.semesters.filter(s => !s.isDeleted).sortBy('semesterOrder');
    return rows.map(r => r.semesterName);
  }

  /**
   * Add a new scholar
   */
  async addScholarToDatabase(scholarData: any): Promise<{ success: boolean; ibmId: string }> {
    const allScholars = await db.scholars.toArray();
    const maxCtrl = allScholars.reduce((max, s) => Math.max(max, s.controlNo || 0), 0);
    const controlNo = maxCtrl + 1;
    const ibmId = scholarData.ibmId || `IBM-${new Date().getFullYear()}-${String(controlNo).padStart(5, '0')}`;

    const newScholar: ScholarOffline = {
      controlNo,
      ibmId,
      schoolYear: scholarData.schoolYear || '',
      lastName: scholarData.lastName || '',
      firstName: scholarData.firstName || '',
      middleName: scholarData.middleName || '',
      fullName: `${scholarData.firstName || ''} ${scholarData.lastName || ''}`.trim(),
      sex: scholarData.sex || '',
      course: scholarData.course || '',
      school: scholarData.school || '',
      barangay: scholarData.barangay || '',
      schoolId: scholarData.schoolId || '',
      contact: scholarData.contact || '',
      email: scholarData.email || '',
      tribe: scholarData.tribe || '',
      yearLevel: scholarData.yearLevel || '1st Year',
      status: scholarData.status || 'ACTIVE',
      remarks: scholarData.remarks || '',
      removalDate: scholarData.removalDate || null,
      semesterCount: Number(scholarData.semesterCount) || 0,
      lbpAccount: scholarData.lbpAccount || '',
      startingYear: scholarData.startingYear || '',
      updatedAt: new Date().toISOString()
    };

    await db.scholars.put(newScholar);
    await syncEngine.enqueueMutation('scholars', 'INSERT', ibmId, newScholar);

    return { success: true, ibmId };
  }

  /**
   * Update an existing scholar record
   */
  async updateScholar(ibmId: string, updatedFields: Partial<ScholarOffline>): Promise<{ success: boolean }> {
    const existing = await db.scholars.get(ibmId);
    if (!existing) {
      throw new Error(`Scholar with IBM ID ${ibmId} not found.`);
    }

    const merged = {
      ...existing,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };

    await db.scholars.put(merged);
    await syncEngine.enqueueMutation('scholars', 'UPDATE', ibmId, merged);

    return { success: true };
  }

  /**
   * Add a new semester
   */
  async addNewSemester(semesterName: string): Promise<{ success: boolean; semester: string }> {
    const cleanName = semesterName.trim();
    if (!cleanName) throw new Error('Semester name cannot be empty.');

    const allSems = await db.semesters.toArray();
    const maxOrder = allSems.reduce((max, s) => Math.max(max, s.semesterOrder || 0), 0);

    const semItem = {
      semesterName: cleanName,
      semesterOrder: maxOrder + 1,
      isActive: true,
      updatedAt: new Date().toISOString()
    };

    await db.semesters.put(semItem);
    await syncEngine.enqueueMutation('semesters', 'INSERT', cleanName, semItem);

    return { success: true, semester: cleanName };
  }

  /**
   * Batch add scholars to payroll
   */
  async batchAddToPayroll(ibmIds: string[], targetPeriod: string, autoPromote: boolean = false): Promise<{ success: boolean; addedCount: number }> {
    const scholars = await db.scholars.where('ibmId').anyOf(ibmIds).toArray();
    const existingPayroll = await db.payroll.toArray();
    let maxNo = existingPayroll.reduce((max, p) => Math.max(max, p.no || 0), 0);

    let addedCount = 0;
    for (const sc of scholars) {
      const alreadyIn = existingPayroll.some(p => p.ibmId === sc.ibmId && !p.isDeleted);
      if (alreadyIn) continue;

      maxNo++;
      let yearLvl = sc.yearLevel || '';
      if (autoPromote) {
        if (yearLvl.includes('1st')) yearLvl = '2nd Year';
        else if (yearLvl.includes('2nd')) yearLvl = '3rd Year';
        else if (yearLvl.includes('3rd')) yearLvl = '4th Year';
      }

      const pItem: PayrollOffline = {
        no: maxNo,
        ibmId: sc.ibmId,
        fullName: sc.fullName || `${sc.firstName} ${sc.lastName}`,
        lbpAccount: sc.lbpAccount || '',
        status: sc.status || 'ACTIVE',
        yearLevel: yearLvl,
        grantPeriod: targetPeriod,
        remarks: 'Batch added',
        updatedAt: new Date().toISOString()
      };

      await db.payroll.put(pItem);
      await syncEngine.enqueueMutation('payroll', 'INSERT', sc.ibmId, pItem);
      addedCount++;
    }

    return { success: true, addedCount };
  }

  /**
   * Remove scholar from payroll
   */
  async removePayrollEntry(ibmId: string): Promise<{ success: boolean }> {
    const item = await db.payroll.where('ibmId').equals(ibmId).first();
    if (item && item.id) {
      await db.payroll.update(item.id, { isDeleted: true });
      await syncEngine.enqueueMutation('payroll', 'DELETE', ibmId, { is_deleted: true });
    }
    return { success: true };
  }

  /**
   * Add scholar to alumni / graduates
   */
  async addGraduate(gradData: any): Promise<{ success: boolean }> {
    const ibmId = gradData.ibmId;
    const gItem: GraduateOffline = {
      ibmId: ibmId,
      fullName: gradData.fullName || '',
      gender: gradData.gender || '',
      tribe: gradData.tribe || '',
      school: gradData.school || '',
      course: gradData.course || '',
      barangay: gradData.barangay || '',
      gradYear: gradData.gradYear || String(new Date().getFullYear()),
      yearGraduated: gradData.gradYear || String(new Date().getFullYear()),
      honor: gradData.honor || '',
      employmentStatus: gradData.employmentStatus || '',
      company: gradData.company || '',
      contact: gradData.contact || '',
      email: gradData.email || '',
      updatedAt: new Date().toISOString()
    };

    await db.graduates.put(gItem);
    await syncEngine.enqueueMutation('graduates', 'INSERT', ibmId, gItem);

    // Also update scholar status to GRADUATED
    const sc = await db.scholars.get(ibmId);
    if (sc) {
      await db.scholars.update(ibmId, { status: 'GRADUATED', updatedAt: new Date().toISOString() });
      await syncEngine.enqueueMutation('scholars', 'UPDATE', ibmId, { status: 'GRADUATED' });
    }

    return { success: true };
  }

  /**
   * Add scholar to other grants
   */
  async addOtherGrant(grantData: any): Promise<{ success: boolean }> {
    const ibmId = grantData.ibmId;
    const ogItem: OtherGrantOffline = {
      ibmId: ibmId,
      fullName: grantData.fullName || '',
      gender: grantData.gender || '',
      tribe: grantData.tribe || '',
      school: grantData.school || '',
      course: grantData.course || '',
      barangay: grantData.barangay || '',
      year: grantData.year || String(new Date().getFullYear()),
      grantName: grantData.grantName || '',
      updatedAt: new Date().toISOString()
    };

    await db.otherGrants.put(ogItem);
    await syncEngine.enqueueMutation('other_grants', 'INSERT', ibmId, ogItem);

    // Also update scholar status
    const sc = await db.scholars.get(ibmId);
    if (sc) {
      await db.scholars.update(ibmId, { status: 'OTHER GRANTS', remarks: `Moved to ${grantData.grantName}`, updatedAt: new Date().toISOString() });
      await syncEngine.enqueueMutation('scholars', 'UPDATE', ibmId, { status: 'OTHER GRANTS' });
    }

    return { success: true };
  }
}

export const offlineDataService = new OfflineDataService();

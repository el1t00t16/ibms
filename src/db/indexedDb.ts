import Dexie, { Table } from 'dexie';

// ============================================================================
// TYPES & INTERFACES FOR HYBRID OFFLINE-FIRST CLIENT
// ============================================================================

export interface ScholarOffline {
  id?: string;
  controlNo: number;
  ibmId: string;
  schoolYear: string;
  lastName: string;
  firstName: string;
  middleName: string;
  fullName: string;
  sex: string;
  course: string;
  school: string;
  barangay: string;
  schoolId: string;
  contact: string;
  email?: string;
  tribe: string;
  yearLevel: string;
  status: string;
  remarks: string;
  removalDate?: string | null;
  semesterCount: number;
  lbpAccount: string;
  startingYear: string;
  isInPayroll?: boolean;
  semesterRecords?: Record<string, string>;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface SemesterOffline {
  id?: number;
  semesterName: string;
  semesterOrder: number;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt: string;
}

export interface ScholarSemesterOffline {
  id?: string;
  ibmId: string;
  semesterName: string;
  status: string;
  isDeleted?: boolean;
  updatedAt: string;
}

export interface PayrollOffline {
  id?: string | number;
  no: number;
  ibmId: string;
  fullName: string;
  lbpAccount: string;
  status: string;
  yearLevel: string;
  grantPeriod: string;
  remarks: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt: string;
}

export interface GraduateOffline {
  id?: string;
  ibmId: string;
  fullName: string;
  gender: string;
  tribe: string;
  school: string;
  course: string;
  barangay: string;
  gradYear: string;
  yearGraduated: string;
  honor: string;
  employmentStatus: string;
  company: string;
  contact: string;
  email: string;
  gradPhoto?: string;
  workPhoto?: string;
  isDeleted?: boolean;
  updatedAt: string;
}

export interface OtherGrantOffline {
  id?: string;
  ibmId: string;
  fullName: string;
  gender: string;
  tribe: string;
  school: string;
  course: string;
  barangay: string;
  year: string;
  grantName: string;
  isDeleted?: boolean;
  updatedAt: string;
}

export interface RequirementOffline {
  id?: string;
  ibmId: string;
  fullName: string;
  semester: string;
  fileUrl: string;
  status: string;
  remarks: string;
  isDeleted?: boolean;
  submittedAt: string;
  updatedAt: string;
}

export interface ActivityLogOffline {
  id?: string | number;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface SyncQueueItem {
  id?: number;
  table: string; // 'scholars' | 'scholar_semesters' | 'payroll' | 'activity_logs'
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;
  payload: Record<string, any>;
  clientTimestamp: string;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  errorMessage?: string;
}

export interface SyncMetadata {
  key: string; // e.g., 'last_synced_at', 'device_id'
  value: string;
}

// ============================================================================
// DEXIE DATABASE DEFINITION
// ============================================================================

export class IbmsOfflineDatabase extends Dexie {
  scholars!: Table<ScholarOffline, string>;
  semesters!: Table<SemesterOffline, string>;
  scholarSemesters!: Table<ScholarSemesterOffline, string>;
  payroll!: Table<PayrollOffline, number>;
  graduates!: Table<GraduateOffline, string>;
  otherGrants!: Table<OtherGrantOffline, string>;
  requirements!: Table<RequirementOffline, string>;
  activityLogs!: Table<ActivityLogOffline, number>;
  syncQueue!: Table<SyncQueueItem, number>;
  syncMetadata!: Table<SyncMetadata, string>;

  constructor() {
    super('IbmsOfflineDatabase');

    this.version(1).stores({
      scholars: '&ibmId, controlNo, fullName, school, barangay, yearLevel, status, isInPayroll, updatedAt, isDeleted',
      semesters: '&semesterName, semesterOrder, isActive, updatedAt',
      scholarSemesters: '++id, [ibmId+semesterName], ibmId, semesterName, status, updatedAt',
      payroll: '++id, no, ibmId, fullName, status, yearLevel, grantPeriod, updatedAt, isDeleted',
      graduates: '&ibmId, fullName, gradYear, updatedAt, isDeleted',
      otherGrants: '&ibmId, fullName, grantName, year, updatedAt, isDeleted',
      requirements: '++id, ibmId, semester, status, submittedAt, updatedAt, isDeleted',
      activityLogs: '++id, timestamp, user, action',
      syncQueue: '++id, table, action, recordId, status, clientTimestamp',
      syncMetadata: '&key'
    });
  }
}

// Singleton database instance
export const db = new IbmsOfflineDatabase();

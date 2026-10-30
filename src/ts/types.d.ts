/**
 * Municipality of Malungon - e-IBM Portal
 * TypeScript Interfaces & Core Type Definitions
 */

interface Window {
    [key: string]: any;
    Swal?: any;
    ModernToast?: any;
    showToast?: (title: string, message?: string, icon?: string) => any;
    switchNavTab?: (tabName: string, subFilter?: string) => void;
    showActiveScholarsFromDashboard?: () => void;
    toggleSidebarCollapse?: () => void;
    toggleSidebar?: () => void;
    toggleMobileSidebar?: () => void;
    expandSidebar?: () => void;
    collapseSidebar?: () => void;
    updateDashboardKPIs?: () => void;
    openScholarDrawer?: (ibmId: string) => void;
    closeScholarDrawer?: () => void;
    copyDrawerLbp?: () => void;
    drawerEditScholar?: () => void;
    drawerDisciplinaryAction?: () => void;
    drawerAddOtherGrant?: () => void;
    initiateCertificate?: () => void;
    printScholarProfile?: () => void;
    getSemesterStipendAmount?: (sem: string) => number;
    clearAllSelections?: () => void;
    renderAlumniTable?: () => void;
    filterAlumniTable?: () => void;
    exportAlumniCSV?: () => void;
    changeAlumniPage?: (delta: number) => void;
    renderOtherGrantsTable?: () => void;
    filterOtherGrantsTable?: () => void;
    exportOtherGrantsCSV?: () => void;
    changeOtherGrantsPage?: (delta: number) => void;
    loadAuditLogs?: () => void;
    filterAuditLogs?: () => void;
    changeAuditPage?: (delta: number) => void;
    exportAuditLogsCSV?: () => void;
    updateSettingsInfo?: () => void;
    backupDatabase?: () => void;
    handlePasswordChange?: (e: Event) => void;
    loadData?: () => void;
    viewScholar?: (ibmId: string) => void;
    switchReportSubTab?: (tab: string) => void;
    generateReport?: () => void;
    generateMatrixReport?: () => void;
    generateGraduatesMatrix?: () => void;
    renderSelectedMatrix?: () => void;
    openMatrixCellDrilldown?: (type: string, rowKey: string, colKey: string) => void;
    closeReportDrilldownModal?: () => void;
    exportDrilldownCSV?: () => void;
    exportActiveReportView?: () => void;
    exportMatrixCSV?: () => void;
    exportAlumniMatrixCSV?: () => void;
    exportTrackingCSV?: () => void;
    printAlumniMatrixReport?: () => void;
    printCurrentReport?: () => void;
}

declare let Swal: any;
declare let google: any;
declare let dbData: any[];
declare let pData: any[];
declare let sems: string[];
declare let gradData: any[];
declare let otherGrantsData: any[];
declare let selectedIds: Set<string>;
declare let currentViewScholar: any;
declare function openScholarModal(edit?: boolean, id?: any): void;
declare function openDismissalModal(id?: any): void;
declare function promptAddOtherGrant(ibmId: string, name: string): void;
declare function openCertModalWithScholar(scholar: any): void;
declare function openPrintModal(): void;
declare function renderTable(): void;
declare function renderPayrollTable(): void;
declare function loadRequirementsData(): void;
declare function updateReportUI(): void;
declare function applyAdvancedFilters(): void;
declare function updateBatchBtn(): void;

interface Scholar {
    ibmId: string;
    controlNo?: string;
    no?: string | number;
    fullName: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    school: string;
    course: string;
    barangay: string;
    tribe?: string;
    yearLevel: string;
    startingYear?: string;
    schoolId?: string;
    contact?: string;
    sex?: string;
    gender?: string;
    lbpAccount?: string;
    status: 'ACTIVE' | 'PROBATION' | 'WARNING' | 'GRADUATED' | 'DELISTED' | 'EXTENDED' | string;
    remarks?: string;
    isInPayroll?: boolean;
    rowIndex?: number;
    [key: string]: any;
}

interface Semester {
    id?: number;
    semester_name: string;
    semester_order: number;
    is_active: number | boolean;
}

interface PayrollEntry {
    ibmId: string;
    controlNo: string;
    fullName: string;
    school: string;
    course: string;
    barangay: string;
    yearLevel: string;
    amount: number;
    period: string;
    status: string;
    lbpAccount?: string;
}

interface Graduate {
    ibmId: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    school: string;
    course: string;
    barangay: string;
    yearGraduated?: number | string;
    year?: number | string;
    honor?: string;
}

interface OtherGrant {
    ibmId: string;
    fullName: string;
    grantName: string;
    year: number | string;
    status?: string;
}

interface AuditLog {
    id?: number;
    created_at: string;
    user: string;
    action: string;
    details: string;
    ip_address?: string;
}

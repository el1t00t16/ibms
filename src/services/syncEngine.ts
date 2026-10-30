import { db, SyncQueueItem } from '../db/indexedDb';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

export type SyncState = 'ONLINE_SYNCED' | 'OFFLINE' | 'SYNCING' | 'ERROR';

export type SyncStatusListener = (state: {
  status: SyncState;
  pendingCount: number;
  lastSyncedAt: string | null;
  errorMessage?: string;
}) => void;

class SyncEngine {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private listeners: Set<SyncStatusListener> = new Set();
  private clientId: string = this.getOrCreateClientId();
  private checkInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Periodic check every 15 seconds to sync if online and pending items exist
      this.checkInterval = setInterval(() => {
        if (this.isOnline && !this.isSyncing) {
          this.triggerSync();
        }
      }, 15000);
    }
  }

  private getOrCreateClientId(): string {
    if (typeof localStorage === 'undefined') return 'server_node';
    let id = localStorage.getItem('ibms_device_client_id');
    if (!id) {
      id = 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('ibms_device_client_id', id);
    }
    return id;
  }

  public subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    this.notifyListeners();
    return () => this.listeners.delete(listener);
  }

  private async notifyListeners(errorMsg?: string) {
    const pendingCount = await db.syncQueue.where('status').equals('pending').count();
    const meta = await db.syncMetadata.get('last_synced_at');
    const lastSyncedAt = meta ? meta.value : null;

    let status: SyncState = 'OFFLINE';
    if (this.isOnline) {
      status = this.isSyncing ? 'SYNCING' : (errorMsg ? 'ERROR' : 'ONLINE_SYNCED');
    }

    this.listeners.forEach(fn => fn({
      status,
      pendingCount,
      lastSyncedAt,
      errorMessage: errorMsg
    }));
  }

  private async handleNetworkChange(online: boolean) {
    this.isOnline = online;
    if (online) {
      // Verify true cloud reachability via heartbeat ping
      const reachable = await this.verifyConnection();
      this.isOnline = reachable;
      if (reachable) {
        this.triggerSync();
      }
    }
    this.notifyListeners();
  }

  public async verifyConnection(): Promise<boolean> {
    if (!navigator.onLine) return false;
    try {
      // Lightweight fetch to test reachability
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('https://www.google.com/generate_204', {
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // OFFLINE MUTATION ENQUEUEING
  // ==========================================================================

  public async enqueueMutation(
    table: string,
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    recordId: string,
    payload: Record<string, any>
  ): Promise<void> {
    const item: SyncQueueItem = {
      table,
      action,
      recordId,
      payload,
      clientTimestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    };

    await db.syncQueue.add(item);
    this.notifyListeners();

    // If online, trigger background push immediately
    if (this.isOnline && !this.isSyncing) {
      this.triggerSync();
    }
  }

  // ==========================================================================
  // BI-DIRECTIONAL SYNC EXECUTION
  // ==========================================================================

  public async triggerSync(): Promise<{ success: boolean; pushed: number; pulled: number }> {
    if (this.isSyncing) return { success: false, pushed: 0, pulled: 0 };
    if (!isSupabaseConfigured()) {
      // Supabase credentials not set yet; operate purely offline in IndexedDB
      this.notifyListeners();
      return { success: false, pushed: 0, pulled: 0 };
    }

    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, pushed: 0, pulled: 0 };

    this.isSyncing = true;
    this.notifyListeners();

    let pushedCount = 0;
    let pulledCount = 0;

    try {
      // 1. PUSH PHASE: Flush local sync_queue to Supabase
      const pendingItems = await db.syncQueue.where('status').equals('pending').sortBy('id');

      if (pendingItems.length > 0) {
        // Mark as syncing
        const ids = pendingItems.map(x => x.id!).filter(Boolean);
        await db.syncQueue.where('id').anyOf(ids).modify({ status: 'syncing' });

        const batchPayload = pendingItems.map(item => ({
          table: item.table,
          action: item.action,
          record_id: item.recordId,
          payload: item.payload,
          client_timestamp: item.clientTimestamp
        }));

        const { data, error } = await supabase.rpc('sync_push_batch', {
          p_mutations: batchPayload,
          p_client_id: this.clientId,
          p_user_name: 'Administrator'
        });

        if (error) {
          throw new Error('Supabase sync_push_batch error: ' + error.message);
        }

        // Successfully applied -> delete from local queue
        await db.syncQueue.where('id').anyOf(ids).delete();
        pushedCount = data?.applied_count || pendingItems.length;
      }

      // 2. PULL PHASE: Fetch remote changes since last_synced_at
      const meta = await db.syncMetadata.get('last_synced_at');
      const since = meta ? meta.value : '1970-01-01T00:00:00Z';

      const { data: delta, error: deltaErr } = await supabase.rpc('get_delta_changes', {
        p_since: since
      });

      if (deltaErr) {
        throw new Error('Supabase get_delta_changes error: ' + deltaErr.message);
      }

      if (delta) {
        // Merge downstream changes into local IndexedDB
        if (delta.scholars && delta.scholars.length > 0) {
          for (const s of delta.scholars) {
            await db.scholars.put({
              controlNo: s.control_no,
              ibmId: s.ibm_id,
              schoolYear: s.school_year,
              lastName: s.last_name,
              firstName: s.first_name,
              middleName: s.middle_name,
              fullName: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
              sex: s.sex,
              course: s.course,
              school: s.school,
              barangay: s.barangay,
              schoolId: s.school_id,
              contact: s.contact,
              email: s.email,
              tribe: s.tribe,
              yearLevel: s.year_level,
              status: s.status,
              remarks: s.remarks,
              removalDate: s.removal_date,
              semesterCount: s.semester_count,
              lbpAccount: s.lbp_account,
              startingYear: s.starting_year,
              isDeleted: s.is_deleted,
              updatedAt: s.updated_at
            });
            pulledCount++;
          }
        }

        if (delta.semesters && delta.semesters.length > 0) {
          for (const sem of delta.semesters) {
            await db.semesters.put({
              semesterName: sem.semester_name,
              semesterOrder: sem.semester_order,
              isActive: sem.is_active,
              isDeleted: sem.is_deleted,
              updatedAt: sem.updated_at
            });
          }
        }

        if (delta.payroll && delta.payroll.length > 0) {
          for (const p of delta.payroll) {
            await db.payroll.put({
              id: p.id,
              no: p.no,
              ibmId: p.ibm_id,
              fullName: p.full_name,
              lbpAccount: p.lbp_account,
              status: p.status,
              yearLevel: p.year_level,
              grantPeriod: p.grant_period,
              remarks: p.remarks,
              isDeleted: p.is_deleted,
              updatedAt: p.updated_at
            });
          }
        }

        if (delta.scholar_semesters && delta.scholar_semesters.length > 0) {
          for (const ss of delta.scholar_semesters) {
            await db.scholarSemesters.put({
              ibmId: ss.ibm_id,
              semesterName: ss.semester_name,
              status: ss.status || '',
              isDeleted: ss.is_deleted,
              updatedAt: ss.updated_at
            });
          }
        }

        if (delta.graduates && delta.graduates.length > 0) {
          for (const g of delta.graduates) {
            await db.graduates.put({
              ibmId: g.ibm_id,
              fullName: g.full_name,
              gender: g.gender || '',
              tribe: g.tribe || '',
              school: g.school || '',
              course: g.course || '',
              barangay: g.barangay || '',
              gradYear: g.grad_year || '',
              yearGraduated: g.year_graduated || g.grad_year || '',
              honor: g.honor || '',
              employmentStatus: g.employment_status || '',
              company: g.company || '',
              contact: g.contact || '',
              email: g.email || '',
              isDeleted: g.is_deleted,
              updatedAt: g.updated_at
            });
          }
        }

        // Update last synced metadata timestamp
        const serverTs = delta.server_timestamp || new Date().toISOString();
        await db.syncMetadata.put({ key: 'last_synced_at', value: serverTs });
      }

      this.isSyncing = false;
      this.notifyListeners();
      return { success: true, pushed: pushedCount, pulled: pulledCount };

    } catch (err: any) {
      console.error('[SyncEngine Error]:', err);
      // Revert in-flight syncing items back to pending
      await db.syncQueue.where('status').equals('syncing').modify({ status: 'pending' });
      this.isSyncing = false;
      this.notifyListeners(err.message || 'Sync failed');
      return { success: false, pushed: 0, pulled: 0 };
    }
  }
}

export const syncEngine = new SyncEngine();

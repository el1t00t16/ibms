/**
 * IBMS PWA Client Bootstrap Entrypoint
 * Connects Dexie.js IndexedDB, Supabase Sync Engine, and the Portal UI.
 */

import { syncEngine, SyncState } from './services/syncEngine';
import { offlineDataService } from './services/offlineDataService';
import { db } from './db/indexedDb';

declare global {
  interface Window {
    google: any;
    ibmsSyncEngine: any;
    ibmsDataService: any;
    triggerManualSync: () => Promise<void>;
  }
}

// 1. Expose to window for debugging and UI handlers
window.ibmsSyncEngine = syncEngine;
window.ibmsDataService = offlineDataService;

// 2. Install Hybrid Offline Bridge for google.script.run
function installOfflineBridge() {
  window.google = window.google || {};
  window.google.script = window.google.script || {};

  function createProxy() {
    let successHandler: ((data: any) => void) | null = null;
    let failureHandler: ((err: any) => void) | null = null;

    const runner = {
      withSuccessHandler(cb: (data: any) => void) {
        successHandler = cb;
        return proxy;
      },
      withFailureHandler(cb: (err: any) => void) {
        failureHandler = cb;
        return proxy;
      }
    };

    const proxy: any = new Proxy(runner, {
      get(target: any, prop: string) {
        if (prop === 'withSuccessHandler' || prop === 'withFailureHandler') {
          return target[prop];
        }

        // Delegate to offlineDataService if available
        const service = offlineDataService as any;
        if (typeof service[prop] === 'function') {
          return async (...args: any[]) => {
            try {
              const res = await service[prop](...args);
              if (successHandler) successHandler(res);
            } catch (err: any) {
              console.error(`[OfflineBridge Error] ${prop}:`, err);
              if (failureHandler) failureHandler(err);
              else if ((window as any).Swal) {
                (window as any).Swal.fire('Error', err.message || 'Operation failed', 'error');
              }
            }
          };
        }

        // Fallback for unhandled GAS methods
        return async (...args: any[]) => {
          console.warn(`[OfflineBridge] Method ${prop} unhandled, returning null.`);
          if (successHandler) successHandler(null);
        };
      }
    });

    return proxy;
  }

  Object.defineProperty(window.google.script, 'run', {
    get() {
      return createProxy();
    },
    configurable: true
  });
}

// 3. UI Sync Status Pill Management
function initSyncPill() {
  const container = document.createElement('div');
  container.id = 'ibms-sync-pill-container';
  container.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  `;

  // Insert into navbar next to the user profile or header
  const targetNav = document.querySelector('.header-actions') || document.querySelector('.lgu-header-right') || document.body;
  targetNav.appendChild(container);

  container.addEventListener('click', () => {
    window.triggerManualSync();
  });

  syncEngine.subscribe(({ status, pendingCount, lastSyncedAt, errorMessage }) => {
    let bg = '#ecfdf5';
    let text = '#065f46';
    let border = '#a7f3d0';
    let icon = '🟢';
    let label = 'Online (Synced)';

    if (status === 'OFFLINE') {
      bg = '#fffbeb';
      text = '#92400e';
      border = '#fde68a';
      icon = '🟠';
      label = pendingCount > 0 ? `Offline (${pendingCount} queued)` : 'Offline Cache Active';
    } else if (status === 'SYNCING') {
      bg = '#eff6ff';
      text = '#1e40af';
      border = '#bfdbfe';
      icon = '🔄';
      label = 'Syncing...';
    } else if (status === 'ERROR') {
      bg = '#fef2f2';
      text = '#991b1b';
      border = '#fecaca';
      icon = '⚠️';
      label = 'Sync Error';
    }

    container.style.background = bg;
    container.style.color = text;
    container.style.border = `1px solid ${border}`;
    container.title = errorMessage || (lastSyncedAt ? `Last Synced: ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Click to Sync Now');
    container.innerHTML = `<span>${icon}</span> <span>${label}</span>`;
  });
}

window.triggerManualSync = async function () {
  const res = await syncEngine.triggerSync();
  if (res.success) {
    if (typeof (window as any).loadData === 'function') {
      (window as any).loadData();
    }
  }
};

// 4. Initialization Pipeline
async function init() {
  console.log('⚡ Initializing IBMS Hybrid Offline-First Client...');
  installOfflineBridge();
  initSyncPill();

  // Check if local cache is empty
  const scholarCount = await db.scholars.count();
  if (scholarCount === 0) {
    console.log('📥 Local cache empty. Pulling initial dataset from Supabase...');
    const syncRes = await syncEngine.triggerSync();
    console.log('📥 Initial pull complete:', syncRes);
  } else {
    // Background pull for latest delta changes
    syncEngine.triggerSync().catch(console.error);
  }

  // Load UI data
  if (typeof (window as any).loadData === 'function') {
    (window as any).loadData();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

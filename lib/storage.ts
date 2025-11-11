/**
 * LocalStorage wrapper for SyncKaro Admin App
 * All keys are prefixed with 'synckaro_admin_' for app-specific namespace isolation
 * This prevents conflicts with teacher/student apps on the same domain
 */

const STORAGE_PREFIX = 'synckaro_admin_';

export const storage = {
  // Auth operations
  setAuth: (data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_PREFIX}auth`, JSON.stringify(data));
    }
  },
  
  getAuth: (): any | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`${STORAGE_PREFIX}auth`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
  
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_PREFIX}auth`);
    }
  },
  
  // Generic CRUD operations
  setItem: (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    }
  },
  
  getItem: (key: string): any | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
  
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    }
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
  },
};


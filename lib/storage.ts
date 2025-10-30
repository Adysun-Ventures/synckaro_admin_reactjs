/**
 * LocalStorage wrapper for SyncKaro platform
 * All keys are prefixed with 'syncKaro_' for namespace isolation
 */

export const storage = {
  // Auth operations
  setAuth: (data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncKaro_auth', JSON.stringify(data));
    }
  },
  
  getAuth: (): any | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('syncKaro_auth');
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
  
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('syncKaro_auth');
    }
  },
  
  // Generic CRUD operations
  setItem: (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`syncKaro_${key}`, JSON.stringify(value));
    }
  },
  
  getItem: (key: string): any | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`syncKaro_${key}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
  
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`syncKaro_${key}`);
    }
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('syncKaro_')) {
          localStorage.removeItem(key);
        }
      });
    }
  },
};


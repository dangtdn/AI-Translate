export const storage = {
  get: async (key: string): Promise<any> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const res = await chrome.storage.local.get(key);
      return res[key];
    }
    const val = localStorage.getItem(key);
    try {
      return val ? JSON.parse(val) : null;
    } catch {
      return val;
    }
  },
  set: async (key: string, value: any): Promise<void> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }
};

import { StorageAdapter } from "./types";

class LocalStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<{ value: string } | null> {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      console.error("LocalStorage get error:", error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("LocalStorage set error:", error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("LocalStorage remove error:", error);
      throw error;
    }
  }
}

class WindowStorageAdapter implements StorageAdapter {
  private storage: any;

  constructor() {
    this.storage = (window as any).storage;
  }

  async get(key: string): Promise<{ value: string } | null> {
    try {
      return await this.storage.get(key);
    } catch (error) {
      console.error("WindowStorage get error:", error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await this.storage.set(key, value);
    } catch (error) {
      console.error("WindowStorage set error:", error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.storage.remove(key);
    } catch (error) {
      console.error("WindowStorage remove error:", error);
      throw error;
    }
  }
}

// ============= STORAGE MANAGER =============

class StorageManager {
  private adapter: StorageAdapter;

  constructor() {
    // Check if window.storage exists, otherwise use localStorage
    if (typeof window !== "undefined" && (window as any).storage) {
      this.adapter = new WindowStorageAdapter();
      console.log("Using WindowStorage adapter");
    } else {
      this.adapter = new LocalStorageAdapter();
      console.log("Using LocalStorage adapter");
    }
  }

  async get(key: string): Promise<{ value: string } | null> {
    return this.adapter.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    return this.adapter.set(key, value);
  }

  async remove(key: string): Promise<void> {
    return this.adapter.remove(key);
  }
}

// Export singleton instance
export const storage = new StorageManager();
class Storage {
    // Store an item in localStorage
    static set(key, value, storageType = 'localStorage') {
      try {
        const storage = this.getStorageType(storageType);
        const serializedValue =
          typeof value === 'object' ? JSON.stringify(value) : value;
        storage.setItem(key, serializedValue);
      } catch (error) {
        console.error(`Error storing ${key} in ${storageType}:`, error);
      }
    }
  
    // Retrieve an item from localStorage
    static get(key, storageType = 'localStorage') {
      try {
        const storage = this.getStorageType(storageType);
        const value = storage.getItem(key);
        return this.isJson(value) ? JSON.parse(value) : value;
      } catch (error) {
        console.error(`Error retrieving ${key} from ${storageType}:`, error);
        return null;
      }
    }
  
    // Remove an item from localStorage
    static remove(key, storageType = 'localStorage') {
      try {
        const storage = this.getStorageType(storageType);
        storage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key} from ${storageType}:`, error);
      }
    }
  
    // Clear all items from localStorage
    static clear(storageType = 'localStorage') {
      try {
        const storage = this.getStorageType(storageType);
        storage.clear();
      } catch (error) {
        console.error(`Error clearing ${storageType}:`, error);
      }
    }
  
    // Helper method to determine storage type
    static getStorageType(storageType) {
      if (storageType === 'localStorage') {
        return window.localStorage;
      } else if (storageType === 'sessionStorage') {
        return window.sessionStorage;
      } else {
        throw new Error(`Invalid storage type: ${storageType}`);
      }
    }
  
    // Helper method to check if a value is JSON
    static isJson(value) {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }
  }
  
  export default Storage;
  
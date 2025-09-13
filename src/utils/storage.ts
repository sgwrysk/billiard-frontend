/**
 * Versioned localStorage utility with type safety and migration support
 * Provides a centralized storage system with version management
 */

export interface StorageVersion {
  version: string;
  timestamp: number;
}

export interface VersionedStorageData<T = unknown> {
  version: string;
  timestamp: number;
  data: T;
}

export class VersionedStorage {
  private readonly currentVersion = 'v1.0';
  
  /**
   * Save data with version information
   */
  set<T>(key: string, data: T): void {
    try {
      const versionedData: VersionedStorageData<T> = {
        version: this.currentVersion,
        timestamp: Date.now(),
        data
      };
      
      const serialized = JSON.stringify(versionedData);
      localStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error(`Failed to save data to localStorage: ${error}`);
    }
  }

  /**
   * Get data with version checking
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed: VersionedStorageData<T> = JSON.parse(item);
      
      // Version compatibility check (can be extended for migrations)
      if (!this.isVersionCompatible(parsed.version)) {
        console.warn(`Storage version mismatch for key ${key}: ${parsed.version} vs ${this.currentVersion}`);
        // For now, return null for incompatible versions
        // In future, implement migration logic here
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error(`Failed to get data from localStorage: ${error}`);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Failed to remove data from localStorage: ${error}`);
    }
  }

  /**
   * Clear all storage (use with caution)
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      throw new Error(`Failed to clear localStorage: ${error}`);
    }
  }

  /**
   * Get storage info for debugging
   */
  getStorageInfo(key: string): StorageVersion | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed: VersionedStorageData = JSON.parse(item);
      return {
        version: parsed.version,
        timestamp: parsed.timestamp
      };
    } catch (error) {
      console.error(`Failed to get storage info: ${error}`);
      return null;
    }
  }

  /**
   * Check if version is compatible with current version
   */
  private isVersionCompatible(version: string): boolean {
    // Simple version check for now
    // Can be extended to handle semantic versioning and migration rules
    return version === this.currentVersion;
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.currentVersion;
  }
}

// Export singleton instance
export const storage = new VersionedStorage();
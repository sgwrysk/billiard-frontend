import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '../storageUtils';

describe('storageUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('returns parsed value when item exists', () => {
      const testData = { name: 'test', value: 42 };
      localStorage.setItem('testKey', JSON.stringify(testData));

      const result = storage.get('testKey', {});
      expect(result).toEqual(testData);
    });

    it('returns default value when item does not exist', () => {
      const defaultValue = { default: true };
      
      const result = storage.get('nonexistentKey', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('returns default value when JSON parsing fails', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem('invalidJson', 'invalid json string');

      const defaultValue = { error: 'handled' };
      const result = storage.get('invalidJson', defaultValue);

      expect(result).toEqual(defaultValue);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('set', () => {
    it('stores value as JSON string', () => {
      const testData = { name: 'test', value: 42 };
      
      storage.set('testKey', testData);
      
      const stored = localStorage.getItem('testKey');
      expect(JSON.parse(stored!)).toEqual(testData);
    });
  });

  describe('getString', () => {
    it('returns string value when item exists', () => {
      localStorage.setItem('testKey', 'test string value');

      const result = storage.getString('testKey');
      expect(result).toBe('test string value');
    });

    it('returns default value when item does not exist', () => {
      const result = storage.getString('nonexistentKey', 'default value');
      expect(result).toBe('default value');
    });

    it('returns empty string as default when no default provided', () => {
      const result = storage.getString('nonexistentKey');
      expect(result).toBe('');
    });
  });

  describe('setString', () => {
    it('stores string value directly', () => {
      storage.setString('testKey', 'test string value');
      
      const stored = localStorage.getItem('testKey');
      expect(stored).toBe('test string value');
    });
  });

  describe('remove', () => {
    it('removes item from storage', () => {
      localStorage.setItem('testKey', 'value');
      
      storage.remove('testKey');
      
      expect(localStorage.getItem('testKey')).toBeNull();
    });
  });

  describe('clear', () => {
    it('clears all storage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      
      storage.clear();
      
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
    });
  });

  describe('integration tests', () => {
    it('can store and retrieve complex objects', () => {
      const complexObject = {
        user: {
          id: 1,
          name: 'John Doe',
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true,
          },
        },
        settings: [1, 2, 3],
        metadata: null,
      };

      storage.set('complexData', complexObject);
      const retrieved = storage.get('complexData', {});

      expect(retrieved).toEqual(complexObject);
    });

    it('can store and retrieve strings directly', () => {
      const testString = 'This is a test string with special chars: àáâã';
      
      storage.setString('stringData', testString);
      const retrieved = storage.getString('stringData');

      expect(retrieved).toBe(testString);
    });

    it('maintains separate storage for different keys', () => {
      storage.set('key1', { value: 'object1' });
      storage.setString('key2', 'string1');

      expect(storage.get('key1', {})).toEqual({ value: 'object1' });
      expect(storage.getString('key2')).toBe('string1');

      storage.remove('key1');
      
      expect(storage.get('key1', { default: true })).toEqual({ default: true });
      expect(storage.getString('key2')).toBe('string1');
    });
  });
});
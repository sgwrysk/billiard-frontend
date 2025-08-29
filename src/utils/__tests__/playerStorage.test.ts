import { vi, beforeEach, describe, it, expect } from 'vitest';
import {
  validatePlayerName,
  getAllPlayers,
  getVisiblePlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  hidePlayer,
  showPlayer,
  getDefaultPlayerSettings,
  setDefaultPlayer,
  getDefaultPlayer,
  autoSavePlayer,
  getSuggestedPlayers,
} from '../playerStorage';

// Mock the storage utility with simple implementation
const mockStorageData = {
  players: [],
  defaults: { player1DefaultId: null, player2DefaultId: null },
  nextId: 1
};

vi.mock('../storage', () => ({
  storage: {
    get: vi.fn(() => mockStorageData),
    set: vi.fn(),
  },
}));

describe('playerStorage basic functionality', () => {
  beforeEach(() => {
    // Reset mock data
    mockStorageData.players = [];
    mockStorageData.defaults = { player1DefaultId: null, player2DefaultId: null };
    mockStorageData.nextId = 1;
  });

  describe('validatePlayerName', () => {
    it('should return error for empty name', () => {
      const errors = validatePlayerName('');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Player name is required');
    });

    it('should return error for name too long', () => {
      const longName = 'a'.repeat(21);
      const errors = validatePlayerName(longName);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Player name must be 20 characters or less');
    });

    it('should return error for duplicate name', () => {
      mockStorageData.players = [
        { id: 1, name: 'Existing Player', isVisible: true, createdAt: Date.now(), updatedAt: Date.now() }
      ];
      
      const errors = validatePlayerName('Existing Player');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Player name already exists');
    });

    it('should allow valid name', () => {
      const errors = validatePlayerName('Valid Name');
      expect(errors).toHaveLength(0);
    });
  });

  describe('getAllPlayers', () => {
    it('should return empty array when no players exist', () => {
      const players = getAllPlayers();
      expect(players).toEqual([]);
    });

    it('should return all players when they exist', () => {
      const mockPlayers = [
        { id: 1, name: 'Player 1', isVisible: true, createdAt: Date.now(), updatedAt: Date.now() },
        { id: 2, name: 'Player 2', isVisible: false, createdAt: Date.now(), updatedAt: Date.now() }
      ];
      mockStorageData.players = mockPlayers;

      const players = getAllPlayers();
      expect(players).toEqual(mockPlayers);
    });
  });

  describe('getVisiblePlayers', () => {
    it('should return only visible players', () => {
      mockStorageData.players = [
        { id: 1, name: 'Visible Player', isVisible: true, createdAt: Date.now(), updatedAt: Date.now() },
        { id: 2, name: 'Hidden Player', isVisible: false, createdAt: Date.now(), updatedAt: Date.now() }
      ];

      const players = getVisiblePlayers();
      expect(players).toHaveLength(1);
      expect(players[0].name).toBe('Visible Player');
    });

    it('should return empty array when no visible players', () => {
      mockStorageData.players = [
        { id: 1, name: 'Hidden Player', isVisible: false, createdAt: Date.now(), updatedAt: Date.now() }
      ];

      const players = getVisiblePlayers();
      expect(players).toEqual([]);
    });
  });

  describe('createPlayer', () => {
    it('should create a new player successfully', () => {
      const player = createPlayer({ name: 'New Player' });

      expect(player.id).toBe(1);
      expect(player.name).toBe('New Player');
      expect(player.isVisible).toBe(true);
      expect(typeof player.createdAt).toBe('number');
      expect(typeof player.updatedAt).toBe('number');
    });

    it('should trim whitespace from name', () => {
      const player = createPlayer({ name: '  Trimmed Name  ' });
      expect(player.name).toBe('Trimmed Name');
    });

    it('should throw error for empty name', () => {
      expect(() => createPlayer({ name: '' })).toThrow('Player name is required');
    });

    it('should increment nextId correctly', () => {
      createPlayer({ name: 'Player 1' });
      expect(mockStorageData.nextId).toBe(2);
      
      createPlayer({ name: 'Player 2' });
      expect(mockStorageData.nextId).toBe(3);
    });
  });

  describe('autoSavePlayer', () => {
    it('should create new player if not exists', () => {
      const player = autoSavePlayer('New Player');
      expect(player.name).toBe('New Player');
      expect(player.id).toBe(1);
      expect(player.isVisible).toBe(true);
    });

    it('should return existing player if found (case insensitive)', () => {
      const existingPlayer = {
        id: 1,
        name: 'Existing Player',
        isVisible: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      mockStorageData.players = [existingPlayer];

      const player = autoSavePlayer('existing player');
      expect(player.id).toBe(1);
      expect(player.name).toBe('Existing Player');
    });

    it('should make hidden player visible', () => {
      const hiddenPlayer = {
        id: 1,
        name: 'Hidden Player',
        isVisible: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      mockStorageData.players = [hiddenPlayer];

      const player = autoSavePlayer('Hidden Player');
      expect(player.isVisible).toBe(true);
    });

    it('should throw error for empty name', () => {
      expect(() => autoSavePlayer('')).toThrow('Player name cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => autoSavePlayer('   ')).toThrow('Player name cannot be empty');
    });
  });

  describe('getPlayerById', () => {
    it('should return player by ID', () => {
      const mockPlayer = { id: 1, name: 'Player 1', isVisible: true, createdAt: Date.now(), updatedAt: Date.now() };
      mockStorageData.players = [mockPlayer];

      const player = getPlayerById(1);
      expect(player).toEqual(mockPlayer);
    });

    it('should return null for non-existent ID', () => {
      const player = getPlayerById(999);
      expect(player).toBeNull();
    });
  });

  describe('updatePlayer', () => {
    beforeEach(() => {
      mockStorageData.players = [
        { id: 1, name: 'Test Player', isVisible: true, createdAt: Date.now(), updatedAt: Date.now() - 1000 }
      ];
    });

    it('should update player name', () => {
      const updatedPlayer = updatePlayer(1, { name: 'Updated Name' });
      expect(updatedPlayer.name).toBe('Updated Name');
      expect(updatedPlayer.id).toBe(1);
      expect(updatedPlayer.updatedAt).toBeGreaterThan(Date.now() - 1000);
    });

    it('should update player visibility', () => {
      const updatedPlayer = updatePlayer(1, { isVisible: false });
      expect(updatedPlayer.isVisible).toBe(false);
      expect(updatedPlayer.name).toBe('Test Player');
    });

    it('should trim name when updating', () => {
      const updatedPlayer = updatePlayer(1, { name: '  Trimmed  ' });
      expect(updatedPlayer.name).toBe('Trimmed');
    });

    it('should throw error for non-existent player', () => {
      expect(() => updatePlayer(999, { name: 'New Name' })).toThrow('Player not found');
    });

    it('should validate name when updating', () => {
      expect(() => updatePlayer(1, { name: '' })).toThrow('Player name is required');
    });
  });

  describe('hidePlayer and showPlayer', () => {
    beforeEach(() => {
      mockStorageData.players = [
        { id: 1, name: 'Test Player', isVisible: true, createdAt: Date.now(), updatedAt: Date.now() }
      ];
    });

    it('should hide player', () => {
      const hiddenPlayer = hidePlayer(1);
      expect(hiddenPlayer.isVisible).toBe(false);
    });

    it('should show player', () => {
      const shownPlayer = showPlayer(1);
      expect(shownPlayer.isVisible).toBe(true);
    });
  });

  describe('default player settings', () => {
    it('should get default player settings', () => {
      mockStorageData.defaults = { player1DefaultId: 1, player2DefaultId: null };
      
      const defaults = getDefaultPlayerSettings();
      expect(defaults.player1DefaultId).toBe(1);
      expect(defaults.player2DefaultId).toBe(null);
    });

    it('should set default player for position 1', () => {
      mockStorageData.players = [
        { id: 1, name: 'Player 1', isVisible: true, createdAt: Date.now(), updatedAt: Date.now() }
      ];

      setDefaultPlayer(1, 1);
      expect(mockStorageData.defaults.player1DefaultId).toBe(1);
    });

    it('should set default player for position 2', () => {
      mockStorageData.players = [
        { id: 1, name: 'Player 1', isVisible: true, createdAt: Date.now(), updatedAt: Date.now() }
      ];

      setDefaultPlayer(2, 1);
      expect(mockStorageData.defaults.player2DefaultId).toBe(1);
    });

    it('should clear default player', () => {
      setDefaultPlayer(1, null);
      expect(mockStorageData.defaults.player1DefaultId).toBe(null);
    });

    it('should get default player', () => {
      const mockPlayer = { id: 1, name: 'Default Player', isVisible: true, createdAt: Date.now(), updatedAt: Date.now() };
      mockStorageData.players = [mockPlayer];
      mockStorageData.defaults.player1DefaultId = 1;

      const player = getDefaultPlayer(1);
      expect(player).toEqual(mockPlayer);
    });

    it('should return null for hidden default player', () => {
      const hiddenPlayer = { id: 1, name: 'Hidden Player', isVisible: false, createdAt: Date.now(), updatedAt: Date.now() };
      mockStorageData.players = [hiddenPlayer];
      mockStorageData.defaults.player1DefaultId = 1;

      const player = getDefaultPlayer(1);
      expect(player).toBe(null);
    });

    it('should throw error when setting non-existent player as default', () => {
      expect(() => setDefaultPlayer(1, 999)).toThrow('Player not found');
    });

    it('should throw error when setting hidden player as default', () => {
      const hiddenPlayer = { id: 1, name: 'Hidden', isVisible: false, createdAt: Date.now(), updatedAt: Date.now() };
      mockStorageData.players = [hiddenPlayer];

      expect(() => setDefaultPlayer(1, 1)).toThrow('Cannot set hidden player as default');
    });
  });

  describe('getSuggestedPlayers', () => {
    it('should return visible players sorted by recent usage', () => {
      mockStorageData.players = [
        { id: 1, name: 'Player 1', isVisible: true, createdAt: 1000, updatedAt: 2000 },
        { id: 2, name: 'Player 2', isVisible: false, createdAt: 2000, updatedAt: 3000 },
        { id: 3, name: 'Player 3', isVisible: true, createdAt: 3000, updatedAt: 1000 }
      ];

      const players = getSuggestedPlayers();
      expect(players).toHaveLength(2); // Only visible players
      expect(players[0].name).toBe('Player 1'); // Most recently updated visible player
      expect(players[1].name).toBe('Player 3');
    });
  });

  describe('CRUD operations integration', () => {
    it('should handle full player lifecycle', () => {
      // Create
      const player = createPlayer({ name: 'Test Player' });
      expect(player.id).toBe(1);
      expect(player.name).toBe('Test Player');
      expect(player.isVisible).toBe(true);

      // Update
      const updatedPlayer = updatePlayer(1, { name: 'Updated Player' });
      expect(updatedPlayer.name).toBe('Updated Player');

      // Hide
      const hiddenPlayer = hidePlayer(1);
      expect(hiddenPlayer.isVisible).toBe(false);

      // Show
      const shownPlayer = showPlayer(1);
      expect(shownPlayer.isVisible).toBe(true);

      // Set as default
      setDefaultPlayer(1, 1);
      expect(mockStorageData.defaults.player1DefaultId).toBe(1);

      // Get default
      const defaultPlayer = getDefaultPlayer(1);
      expect(defaultPlayer?.name).toBe('Updated Player');
    });
  });

  describe('error handling', () => {
    it('should handle empty storage gracefully', () => {
      // Reset to empty storage
      mockStorageData.players = [];
      mockStorageData.defaults = { player1DefaultId: null, player2DefaultId: null };

      const players = getAllPlayers();
      expect(players).toEqual([]);

      const defaults = getDefaultPlayerSettings();
      expect(defaults).toEqual({ player1DefaultId: null, player2DefaultId: null });
    });

    it('should validate duplicate names case-insensitively', () => {
      mockStorageData.players = [
        { id: 1, name: 'Test Player', isVisible: true, createdAt: Date.now(), updatedAt: Date.now() }
      ];

      const errors1 = validatePlayerName('test player');
      expect(errors1).toHaveLength(1);

      const errors2 = validatePlayerName('TEST PLAYER');
      expect(errors2).toHaveLength(1);

      const errors3 = validatePlayerName('Test Player');
      expect(errors3).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('should handle 20-character name limit exactly', () => {
      const exactName = 'a'.repeat(20);
      const errors = validatePlayerName(exactName);
      expect(errors).toHaveLength(0);

      const player = createPlayer({ name: exactName });
      expect(player.name).toBe(exactName);
    });

    it('should handle unicode characters in names', () => {
      const unicodeName = '太郎🎱';
      const errors = validatePlayerName(unicodeName);
      expect(errors).toHaveLength(0);

      const player = createPlayer({ name: unicodeName });
      expect(player.name).toBe(unicodeName);
    });

    it('should handle multiple validation errors', () => {
      const longName = 'a'.repeat(25);
      const errors = validatePlayerName(longName);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Player name must be 20 characters or less');
    });

    it('should handle whitespace-only names', () => {
      const errors = validatePlayerName('   ');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Player name is required');
    });
  });
});
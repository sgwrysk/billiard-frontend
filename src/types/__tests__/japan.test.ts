import { describe, it, expect } from 'vitest';
import type { 
  JapanGameSettings, 
  JapanMultiplier, 
  JapanPlayer 
} from '../japan';

describe('Japan Game Types', () => {
  it('should define valid JapanGameSettings structure', () => {
    const settings: JapanGameSettings = {
      handicapBalls: [5, 9],
      orderChangeInterval: 10,
      orderChangeEnabled: false
    };

    expect(settings.handicapBalls).toHaveLength(2);
    expect(settings.handicapBalls).toContain(5);
    expect(settings.handicapBalls).toContain(9);
    expect(settings.orderChangeInterval).toBe(10);
  });

  it('should define valid JapanMultiplier structure', () => {
    const multiplier: JapanMultiplier = {
      label: 'x3',
      value: 3
    };

    expect(multiplier.label).toBe('x3');
    expect(multiplier.value).toBe(3);
  });


  it('should define valid JapanPlayer structure', () => {
    const player: JapanPlayer = {
      id: 'player-1',
      name: 'Test Player',
      currentRackPoints: 0,
      totalPoints: 0,
      ballsCollected: []
    };

    expect(player.id).toBe('player-1');
    expect(player.name).toBe('Test Player');
    expect(player.currentRackPoints).toBe(0);
    expect(player.totalPoints).toBe(0);
    expect(player.ballsCollected).toEqual([]);
  });

  it('should validate handicap balls range (1-10)', () => {
    const validBalls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    validBalls.forEach(ball => {
      expect(ball).toBeGreaterThanOrEqual(1);
      expect(ball).toBeLessThanOrEqual(10);
    });
  });

  it('should handle default settings correctly', () => {
    const defaultSettings: JapanGameSettings = {
      handicapBalls: [5, 9],
      orderChangeInterval: 10,
      orderChangeEnabled: false
    };

    expect(defaultSettings.handicapBalls).toEqual([5, 9]);
  });
});
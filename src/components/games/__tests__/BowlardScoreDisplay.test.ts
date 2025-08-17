import { describe, it, expect } from 'vitest';
import type { BowlingFrame } from '../../../types/index';

// Extract the renderRollResult logic for testing
const renderRollResult = (frame: BowlingFrame, rollIndex: number) => {
  const roll = frame.rolls[rollIndex];
  if (roll === undefined) return '';
  
  if (frame.frameNumber === 10) {
    // 10フレーム目
    if (rollIndex === 0) {
      // 1投目: 0はガーター（G）
      return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
    } else if (rollIndex === 1) {
      if (frame.rolls[0] === 10) {
        // 1投目がストライクの場合、2投目は新しいフレーム扱い
        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
      } else {
        // 1投目がストライクでない場合、2投目は0をミス（-）で表示
        return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
      }
    } else {
      // 3投目
      const firstRoll = frame.rolls[0];
      const secondRoll = frame.rolls[1];
      
      if (firstRoll === 10) {
        // 1投目がストライクの場合
        if (secondRoll === 10) {
          // 2投目もストライクの場合、3投目は新しいフレーム扱い
          return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
        } else {
          // 2投目がストライクでない場合、3投目は0をミス（-）で表示
          return (secondRoll + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
        }
      } else {
        // 1投目がストライクでない場合（スペアの場合のみ3投目がある）
        // 3投目は新しいフレーム扱い
        return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
      }
    }
  } else {
    // 1-9フレーム
    if (rollIndex === 0) {
      // 1投目: 0はガーター（G）
      return roll === 10 ? 'X' : roll === 0 ? 'G' : roll.toString();
    } else {
      // 2投目: 0はミス（-）
      return (frame.rolls[0] + roll) === 10 ? '/' : roll === 0 ? '-' : roll.toString();
    }
  }
};

const createFrame = (
  frameNumber: number,
  rolls: number[],
  score: number | undefined,
  isStrike: boolean,
  isSpare: boolean,
  isComplete: boolean
): BowlingFrame => ({
  frameNumber,
  rolls,
  score,
  isStrike,
  isSpare,
  isComplete,
});

describe('Bowlard Score Display', () => {
  describe('renderRollResult - Gutter vs Miss Display', () => {
    describe('1-9 frames', () => {
      it('should display "G" for gutter on first roll', () => {
        const frame = createFrame(1, [0, 5], 5, false, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('G');
        expect(renderRollResult(frame, 1)).toBe('5');
      });

      it('should display "-" for miss on second roll', () => {
        const frame = createFrame(1, [5, 0], 5, false, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('5');
        expect(renderRollResult(frame, 1)).toBe('-');
      });

      it('should display "X" for strike on first roll', () => {
        const frame = createFrame(1, [10], 10, true, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('X');
      });

      it('should display "/" for spare', () => {
        const frame = createFrame(1, [7, 3], 10, false, true, true);
        
        expect(renderRollResult(frame, 0)).toBe('7');
        expect(renderRollResult(frame, 1)).toBe('/');
      });
    });

    describe('10th frame', () => {
      it('should display "G" for gutter on first roll', () => {
        const frame = createFrame(10, [0, 5], 5, false, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('G');
        expect(renderRollResult(frame, 1)).toBe('5'); // 2投目は通常の数字表示
      });

      it('should display "-" for miss on second roll (no strike)', () => {
        const frame = createFrame(10, [5, 0], 5, false, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('5');
        expect(renderRollResult(frame, 1)).toBe('-');
      });

      it('should display "G" for gutter on second roll after strike', () => {
        const frame = createFrame(10, [10, 0, 5], 15, true, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('X');
        expect(renderRollResult(frame, 1)).toBe('G'); // New frame after strike
        expect(renderRollResult(frame, 2)).toBe('5'); // 3投目は通常の数字表示
      });

      it('should display "/" for spare and then handle third roll', () => {
        const frame = createFrame(10, [7, 3, 0], 10, false, true, true);
        
        expect(renderRollResult(frame, 0)).toBe('7');
        expect(renderRollResult(frame, 1)).toBe('/');
        expect(renderRollResult(frame, 2)).toBe('G'); // New frame after spare
      });

      it('should handle double strike correctly', () => {
        const frame = createFrame(10, [10, 10, 0], 20, true, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('X');
        expect(renderRollResult(frame, 1)).toBe('X');
        expect(renderRollResult(frame, 2)).toBe('G'); // New frame after double strike
      });

      it('should handle strike then spare correctly', () => {
        const frame = createFrame(10, [10, 5, 5], 20, true, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('X');
        expect(renderRollResult(frame, 1)).toBe('5');
        expect(renderRollResult(frame, 2)).toBe('/');
      });

      it('should handle strike then miss correctly', () => {
        const frame = createFrame(10, [10, 5, 0], 15, true, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('X');
        expect(renderRollResult(frame, 1)).toBe('5');
        expect(renderRollResult(frame, 2)).toBe('-');
      });

      it('should display "-" for miss on second roll after non-strike first roll', () => {
        const frame = createFrame(10, [3, 0], 3, false, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('3');
        expect(renderRollResult(frame, 1)).toBe('-'); // Miss on second roll
      });

      it('should display "-" for miss on third roll after strike then non-strike', () => {
        const frame = createFrame(10, [10, 3, 0], 13, true, false, true);
        
        expect(renderRollResult(frame, 0)).toBe('X');
        expect(renderRollResult(frame, 1)).toBe('3');
        expect(renderRollResult(frame, 2)).toBe('-'); // Miss on third roll
      });
    });
  });
});

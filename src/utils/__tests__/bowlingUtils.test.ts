import { describe, it, expect } from 'vitest';
import { calculateBowlingScores, initializeBowlingFrames, updateFrameStatus } from '../bowlingUtils';
import type { BowlingFrame } from '../../types/index';

describe('bowlingUtils', () => {
  describe('initializeBowlingFrames', () => {
    it('should create 10 empty frames', () => {
      const frames = initializeBowlingFrames();
      expect(frames).toHaveLength(10);
      frames.forEach((frame, index) => {
        expect(frame.frameNumber).toBe(index + 1);
        expect(frame.rolls).toEqual([]);
        expect(frame.score).toBeUndefined();
        expect(frame.isStrike).toBe(false);
        expect(frame.isSpare).toBe(false);
        expect(frame.isComplete).toBe(false);
      });
    });
  });

  describe('calculateBowlingScores', () => {
    it('should calculate simple scores without strikes or spares', () => {
      const frames = initializeBowlingFrames();
      
      // Frame 1: 3, 4 = 7
      frames[0].rolls = [3, 4];
      frames[0].isComplete = true;
      
      // Frame 2: 2, 5 = 7
      frames[1].rolls = [2, 5];
      frames[1].isComplete = true;
      
      const calculated = calculateBowlingScores(frames);
      
      expect(calculated[0].score).toBe(7);
      expect(calculated[1].score).toBe(14); // 7 + 7
    });

    it('should calculate spare bonus correctly', () => {
      const frames = initializeBowlingFrames();
      
      // Frame 1: 7, 3 = spare (10 + next roll)
      frames[0].rolls = [7, 3];
      frames[0].isSpare = true;
      frames[0].isComplete = true;
      
      // Frame 2: 4, 2 = 6
      frames[1].rolls = [4, 2];
      frames[1].isComplete = true;
      
      const calculated = calculateBowlingScores(frames);
      
      expect(calculated[0].score).toBe(14); // 10 + 4 (next roll)
      expect(calculated[1].score).toBe(20); // 14 + 6
    });

    it('should calculate strike bonus correctly', () => {
      const frames = initializeBowlingFrames();
      
      // Frame 1: Strike (10 + next two rolls)
      frames[0].rolls = [10];
      frames[0].isStrike = true;
      frames[0].isComplete = true;
      
      // Frame 2: 3, 4 = 7
      frames[1].rolls = [3, 4];
      frames[1].isComplete = true;
      
      const calculated = calculateBowlingScores(frames);
      
      expect(calculated[0].score).toBe(17); // 10 + 3 + 4 (next two rolls)
      expect(calculated[1].score).toBe(24); // 17 + 7
    });

    it('should calculate 9th frame strike with 10th frame spare correctly', () => {
      const frames = initializeBowlingFrames();
      
      // Frames 1-8: simple scores
      for (let i = 0; i < 8; i++) {
        frames[i].rolls = [3, 4];
        frames[i].isComplete = true;
      }
      
      // Frame 9: Strike
      frames[8].rolls = [10];
      frames[8].isStrike = true;
      frames[8].isComplete = true;
      
      // Frame 10: 3, 7 (spare)
      frames[9].rolls = [3, 7];
      frames[9].isSpare = true;
      frames[9].isComplete = true;
      
      const calculated = calculateBowlingScores(frames);
      
      // Frame 9 should be: 10 (strike) + 3 + 7 (next two rolls) = 20
      expect(calculated[8].score).toBe(8 * 7 + 20); // 56 + 20 = 76
      // Frame 10 should be: previous score + 10 (3 + 7)
      expect(calculated[9].score).toBe(76 + 10); // 86
    });

    it('should calculate 9th frame strike with 10th frame spare (with 3rd roll) correctly', () => {
      const frames = initializeBowlingFrames();
      
      // Frames 1-8: simple scores
      for (let i = 0; i < 8; i++) {
        frames[i].rolls = [3, 4];
        frames[i].isComplete = true;
      }
      
      // Frame 9: Strike
      frames[8].rolls = [10];
      frames[8].isStrike = true;
      frames[8].isComplete = true;
      
      // Frame 10: 3, 7, 5 (spare + bonus roll)
      frames[9].rolls = [3, 7, 5];
      frames[9].isSpare = true;
      frames[9].isComplete = true;
      
      const calculated = calculateBowlingScores(frames);
      
      // Frame 9 should be: 10 (strike) + 3 + 7 (next two rolls) = 20
      // NOT 10 + 3 + 10 = 23 (incorrect)
      expect(calculated[8].score).toBe(8 * 7 + 20); // 56 + 20 = 76
      // Frame 10 should be: previous score + 15 (3 + 7 + 5)
      expect(calculated[9].score).toBe(76 + 15); // 91
    });

    it('should calculate 9th frame strike with 10th frame strike correctly', () => {
      const frames = initializeBowlingFrames();
      
      // Frames 1-8: simple scores
      for (let i = 0; i < 8; i++) {
        frames[i].rolls = [3, 4];
        frames[i].isComplete = true;
      }
      
      // Frame 9: Strike
      frames[8].rolls = [10];
      frames[8].isStrike = true;
      frames[8].isComplete = true;
      
      // Frame 10: Strike, 5, 3
      frames[9].rolls = [10, 5, 3];
      frames[9].isStrike = true;
      frames[9].isComplete = true;
      
      const calculated = calculateBowlingScores(frames);
      
      // Frame 9 should be: 10 (strike) + 10 + 5 (next two rolls) = 25
      expect(calculated[8].score).toBe(8 * 7 + 25); // 56 + 25 = 81
      // Frame 10 should be: previous score + 18 (10 + 5 + 3)
      expect(calculated[9].score).toBe(81 + 18); // 99
    });

    it('should calculate perfect game correctly', () => {
      const frames = initializeBowlingFrames();
      
      // Frames 1-9: All strikes
      for (let i = 0; i < 9; i++) {
        frames[i].rolls = [10];
        frames[i].isStrike = true;
        frames[i].isComplete = true;
      }
      
      // Frame 10: Strike, Strike, Strike
      frames[9].rolls = [10, 10, 10];
      frames[9].isStrike = true;
      frames[9].isComplete = true;
      
      const calculated = calculateBowlingScores(frames);
      
      // Perfect game should be 300
      expect(calculated[9].score).toBe(300);
    });

    it('should calculate 9 strikes with 10th frame starting with 3 correctly', () => {
      const frames = initializeBowlingFrames();
      
      // Frames 1-9: All strikes
      for (let i = 0; i < 9; i++) {
        frames[i].rolls = [10];
        frames[i].isStrike = true;
        frames[i].isComplete = true;
      }
      
      // Frame 10: 3 pins only (incomplete game for testing)
      frames[9].rolls = [3];
      frames[9].isComplete = false;
      
      const calculated = calculateBowlingScores(frames);
      
      // Correct calculation:
      // Frames 1-7: Each gets 30 points (strike + next two strikes) = 210
      // Frame 8: Strike + next strike (10) + 10th frame first roll (3) = 10 + 10 + 3 = 23
      // Frame 8 cumulative: 210 + 23 = 233
      // Frame 9: Strike + 10th frame first roll (3) + (incomplete, no second roll yet)
      // For incomplete 10th frame, we can only add what we have: 10 + 3 = 13
      // Frame 9 cumulative: 233 + 13 = 246
      
      expect(calculated[0].score).toBe(30);  // Frame 1: 10 + 10 + 10 = 30
      expect(calculated[1].score).toBe(60);  // Frame 2: 30 + (10 + 10 + 10) = 60
      expect(calculated[2].score).toBe(90);  // Frame 3: 60 + (10 + 10 + 10) = 90
      expect(calculated[3].score).toBe(120); // Frame 4: 90 + (10 + 10 + 10) = 120
      expect(calculated[4].score).toBe(150); // Frame 5: 120 + (10 + 10 + 10) = 150
      expect(calculated[5].score).toBe(180); // Frame 6: 150 + (10 + 10 + 10) = 180
      expect(calculated[6].score).toBe(210); // Frame 7: 180 + (10 + 10 + 10) = 210
      expect(calculated[7].score).toBe(233); // Frame 8: 210 + (10 + 10 + 3) = 233
      expect(calculated[8].score).toBe(246); // Frame 9: 233 + (10 + 3) = 246 (incomplete)
    });

    it('should handle 10th frame with no bonus correctly', () => {
      const frames = initializeBowlingFrames();
      
      // Frames 1-9: simple scores
      for (let i = 0; i < 9; i++) {
        frames[i].rolls = [3, 4];
        frames[i].isComplete = true;
      }
      
      // Frame 10: 5, 3 (no strike, no spare)
      frames[9].rolls = [5, 3];
      frames[9].isComplete = true;
      
      const calculated = calculateBowlingScores(frames);
      
      // Frame 10 should be: previous score + 8 (5 + 3)
      expect(calculated[9].score).toBe(9 * 7 + 8); // 63 + 8 = 71
    });
  });

  describe('updateFrameStatus', () => {
    it('should mark strike correctly for frames 1-9', () => {
      const frame: BowlingFrame = {
        frameNumber: 1,
        rolls: [10],
        score: undefined,
        isStrike: false,
        isSpare: false,
        isComplete: false,
      };
      
      const updated = updateFrameStatus(frame, 0);
      
      expect(updated.isStrike).toBe(true);
      expect(updated.isComplete).toBe(true);
      expect(updated.isSpare).toBe(false);
    });

    it('should mark spare correctly for frames 1-9', () => {
      const frame: BowlingFrame = {
        frameNumber: 1,
        rolls: [7, 3],
        score: undefined,
        isStrike: false,
        isSpare: false,
        isComplete: false,
      };
      
      const updated = updateFrameStatus(frame, 0);
      
      expect(updated.isSpare).toBe(true);
      expect(updated.isComplete).toBe(true);
      expect(updated.isStrike).toBe(false);
    });

    it('should handle 10th frame correctly', () => {
      const frame: BowlingFrame = {
        frameNumber: 10,
        rolls: [3, 7, 5],
        score: undefined,
        isStrike: false,
        isSpare: false,
        isComplete: false,
      };
      
      const updated = updateFrameStatus(frame, 9);
      
      expect(updated.isSpare).toBe(true);
      expect(updated.isComplete).toBe(true);
      expect(updated.isStrike).toBe(false);
    });
  });
});

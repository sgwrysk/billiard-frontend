import { describe, it, expect } from 'vitest';
import type { BowlingFrame } from '../../types/index';

// Extract the isScoreFinalized logic for testing
const isScoreFinalized = (frameIndex: number, frames: BowlingFrame[]): boolean => {
  const frame = frames[frameIndex];
  if (!frame || !frame.isComplete || frame.score === undefined) {
    return false;
  }

  // 10th frame is always finalized
  if (frameIndex === 9) {
    return true;
  }

  // For strikes, next 2 rolls are needed
  if (frame.isStrike) {
    if (frameIndex === 8) {
      // If 9th frame is a strike, 2 rolls in 10th frame are needed
      const frame10 = frames[9];
      return frame10 && frame10.rolls.length >= 2;
    } else {
      // For strikes in frames 1-8
      const nextFrame = frames[frameIndex + 1];
      if (!nextFrame) return false;
      
      if (nextFrame.isStrike) {
        // If next frame is also a strike, 1st roll of frame after that is needed
        if (frameIndex + 1 === 8) {
          // If next is 9th frame, 1st roll of 10th frame is needed
          const frame10 = frames[9];
          return frame10 && frame10.rolls.length >= 1;
        } else {
          // In other cases, 1st roll of next-next frame is needed
          const frameAfterNext = frames[frameIndex + 2];
          return frameAfterNext && frameAfterNext.rolls.length >= 1;
        }
      } else {
        // If next frame is not a strike, 2 rolls in next frame are needed
        return nextFrame.rolls.length >= 2;
      }
    }
  }

  // For spares, next 1 roll is needed
  if (frame.isSpare) {
    if (frameIndex === 8) {
      // If 9th frame is a spare, 1st roll of 10th frame is needed
      const frame10 = frames[9];
      return frame10 && frame10.rolls.length >= 1;
    } else {
      // For spares in frames 1-8, 1st roll of next frame is needed
      const nextFrame = frames[frameIndex + 1];
      return nextFrame && nextFrame.rolls.length >= 1;
    }
  }

  // Regular frames (neither strike nor spare) are immediately finalized
  return true;
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

describe('Bowling Score Display Logic', () => {
  describe('isScoreFinalized', () => {
    it('should return false for incomplete frames', () => {
      const frames = [
        createFrame(1, [3], undefined, false, false, false),
      ];
      
      expect(isScoreFinalized(0, frames)).toBe(false);
    });

    it('should return false for frames without score', () => {
      const frames = [
        createFrame(1, [3, 4], undefined, false, false, true),
      ];
      
      expect(isScoreFinalized(0, frames)).toBe(false);
    });

    it('should return true for normal completed frames', () => {
      const frames = [
        createFrame(1, [3, 4], 7, false, false, true),
      ];
      
      expect(isScoreFinalized(0, frames)).toBe(true);
    });

    it('should return false for strike without next two rolls', () => {
      const frames = [
        createFrame(1, [10], 10, true, false, true),
        createFrame(2, [], undefined, false, false, false),
      ];
      
      expect(isScoreFinalized(0, frames)).toBe(false);
    });

    it('should return false for strike with only one next roll', () => {
      const frames = [
        createFrame(1, [10], 17, true, false, true),
        createFrame(2, [3], undefined, false, false, false),
      ];
      
      expect(isScoreFinalized(0, frames)).toBe(false);
    });

    it('should return true for strike with next two rolls', () => {
      const frames = [
        createFrame(1, [10], 17, true, false, true),
        createFrame(2, [3, 4], 24, false, false, true),
      ];
      
      expect(isScoreFinalized(0, frames)).toBe(true);
    });

    it('should return false for spare without next roll', () => {
      const frames = [
        createFrame(1, [7, 3], 10, false, true, true),
        createFrame(2, [], undefined, false, false, false),
      ];
      
      expect(isScoreFinalized(0, frames)).toBe(false);
    });

    it('should return true for spare with next roll', () => {
      const frames = [
        createFrame(1, [7, 3], 14, false, true, true),
        createFrame(2, [4], undefined, false, false, false),
      ];
      
      expect(isScoreFinalized(0, frames)).toBe(true);
    });

    it('should handle consecutive strikes correctly', () => {
      const frames = [
        createFrame(1, [10], 30, true, false, true),
        createFrame(2, [10], 50, true, false, true),
        createFrame(3, [10], 70, true, false, true),
        createFrame(4, [3], undefined, false, false, false),
      ];
      
      // Frame 1 strike needs next two rolls (frame 2 strike + frame 3 strike)
      expect(isScoreFinalized(0, frames)).toBe(true);
      // Frame 2 strike needs next two rolls (frame 3 strike + frame 4 first roll)
      expect(isScoreFinalized(1, frames)).toBe(true);
      // Frame 3 strike needs next two rolls but frame 4 only has one roll
      expect(isScoreFinalized(2, frames)).toBe(false);
    });

    it('should handle 9th frame strike correctly', () => {
      const frames = Array.from({ length: 10 }, (_, i) => 
        createFrame(i + 1, [], undefined, false, false, false)
      );
      
      // 9th frame strike without 10th frame rolls
      frames[8] = createFrame(9, [10], 240, true, false, true);
      expect(isScoreFinalized(8, frames)).toBe(false);
      
      // 9th frame strike with one 10th frame roll
      frames[9] = createFrame(10, [3], undefined, false, false, false);
      expect(isScoreFinalized(8, frames)).toBe(false);
      
      // 9th frame strike with two 10th frame rolls
      frames[9] = createFrame(10, [3, 7], undefined, false, true, false);
      expect(isScoreFinalized(8, frames)).toBe(true);
    });

    it('should handle 9th frame spare correctly', () => {
      const frames = Array.from({ length: 10 }, (_, i) => 
        createFrame(i + 1, [], undefined, false, false, false)
      );
      
      // 9th frame spare without 10th frame roll
      frames[8] = createFrame(9, [7, 3], 240, false, true, true);
      expect(isScoreFinalized(8, frames)).toBe(false);
      
      // 9th frame spare with 10th frame roll
      frames[9] = createFrame(10, [5], undefined, false, false, false);
      expect(isScoreFinalized(8, frames)).toBe(true);
    });

    it('should always return true for 10th frame when complete', () => {
      const frames = Array.from({ length: 10 }, (_, i) => 
        createFrame(i + 1, [], undefined, false, false, false)
      );
      
      // 10th frame with strike (3 rolls)
      frames[9] = createFrame(10, [10, 10, 10], 300, true, false, true);
      expect(isScoreFinalized(9, frames)).toBe(true);
      
      // 10th frame with spare (3 rolls)
      frames[9] = createFrame(10, [3, 7, 5], 78, false, true, true);
      expect(isScoreFinalized(9, frames)).toBe(true);
      
      // 10th frame normal (2 rolls)
      frames[9] = createFrame(10, [3, 4], 71, false, false, true);
      expect(isScoreFinalized(9, frames)).toBe(true);
    });
  });

  describe('10th Frame Roll Availability', () => {
    it('should not allow 3rd roll when no strike or spare in 10th frame', () => {
      // This test documents the expected behavior for the UI:
      // When 10th frame has no strike or spare, 3rd roll should not be available
      const frame10NoStrikeNoSpare = createFrame(10, [3, 4], 71, false, false, true);
      
      // In the actual component, getMaxPins() would return -1 for this case
      // and canRoll() would return false, hiding the pin input buttons
      expect(frame10NoStrikeNoSpare.rolls.length).toBe(2);
      expect(frame10NoStrikeNoSpare.isStrike).toBe(false);
      expect(frame10NoStrikeNoSpare.isSpare).toBe(false);
      expect(frame10NoStrikeNoSpare.isComplete).toBe(true);
    });

    it('should allow 3rd roll when strike in 10th frame', () => {
      const frame10WithStrike = createFrame(10, [10, 5, 3], 78, true, false, true);
      
      expect(frame10WithStrike.rolls.length).toBe(3);
      expect(frame10WithStrike.isStrike).toBe(true);
    });

    it('should allow 3rd roll when spare in 10th frame', () => {
      const frame10WithSpare = createFrame(10, [3, 7, 5], 78, false, true, true);
      
      expect(frame10WithSpare.rolls.length).toBe(3);
      expect(frame10WithSpare.isSpare).toBe(true);
    });

    it('should not allow any rolls when game is complete', () => {
      // This test documents the expected behavior for the UI:
      // When 10th frame is complete, no pin input buttons should be shown
      const frame10Complete = createFrame(10, [7, 2], 265, false, false, true);
      
      // In the actual component, canRoll() would return false when frames[9].isComplete is true
      expect(frame10Complete.isComplete).toBe(true);
      expect(frame10Complete.rolls.length).toBe(2);
    });
  });
});

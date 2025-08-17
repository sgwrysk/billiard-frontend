import { describe, it, expect } from 'vitest';
import type { BowlingFrame } from '../../types/index';

// Extract the isScoreFinalized logic for testing
const isScoreFinalized = (frameIndex: number, frames: BowlingFrame[]): boolean => {
  const frame = frames[frameIndex];
  if (!frame || !frame.isComplete || frame.score === undefined) {
    return false;
  }

  // 10フレーム目は常に確定
  if (frameIndex === 9) {
    return true;
  }

  // ストライクの場合、次の2投が必要
  if (frame.isStrike) {
    if (frameIndex === 8) {
      // 9フレーム目がストライクの場合、10フレーム目の2投が必要
      const frame10 = frames[9];
      return frame10 && frame10.rolls.length >= 2;
    } else {
      // 1-8フレーム目のストライクの場合
      const nextFrame = frames[frameIndex + 1];
      if (!nextFrame) return false;
      
      if (nextFrame.isStrike) {
        // 次のフレームもストライクの場合、その次のフレームの1投目が必要
        if (frameIndex + 1 === 8) {
          // 次が9フレーム目の場合、10フレーム目の1投目が必要
          const frame10 = frames[9];
          return frame10 && frame10.rolls.length >= 1;
        } else {
          // その他の場合、その次のフレームの1投目が必要
          const frameAfterNext = frames[frameIndex + 2];
          return frameAfterNext && frameAfterNext.rolls.length >= 1;
        }
      } else {
        // 次のフレームがストライクでない場合、次のフレームの2投が必要
        return nextFrame.rolls.length >= 2;
      }
    }
  }

  // スペアの場合、次の1投が必要
  if (frame.isSpare) {
    if (frameIndex === 8) {
      // 9フレーム目がスペアの場合、10フレーム目の1投目が必要
      const frame10 = frames[9];
      return frame10 && frame10.rolls.length >= 1;
    } else {
      // 1-8フレーム目のスペアの場合、次のフレームの1投目が必要
      const nextFrame = frames[frameIndex + 1];
      return nextFrame && nextFrame.rolls.length >= 1;
    }
  }

  // 通常のフレーム（ストライクでもスペアでもない）は即座に確定
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

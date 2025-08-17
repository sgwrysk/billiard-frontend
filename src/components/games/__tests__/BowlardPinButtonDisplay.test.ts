import { describe, it, expect } from 'vitest';
import type { BowlingFrame } from '../../../types/index';
import { BowlardColors } from '../../../constants/colors';

// Mock frame info structure
interface FrameInfo {
  frameIndex: number;
  rollIndex: number;
  frame: BowlingFrame;
}

// Extract the getPinButtonText logic for testing
const getPinButtonText = (pins: number, frameInfo: FrameInfo | null) => {
  if (!frameInfo) return pins.toString();
  
  const { frameIndex, rollIndex, frame } = frameInfo;
  
  if (rollIndex === 0) {
    // 1投目
    if (pins === 0) return 'G'; // ガーター
    if (pins === 10) return 'X'; // ストライク
    return pins.toString();
  } else {
    // 2投目以降
    if (frameIndex < 9) {
      // 1-9フレーム
      if (pins === 0) return '-'; // ミス
      if (frame.rolls[0] + pins === 10) return '/'; // スペア
      return pins.toString();
    } else {
      // 10フレーム目
      if (rollIndex === 1) {
        if (frame.rolls[0] === 10) {
          // 1投目がストライクの場合、2投目は新しいフレーム扱い
          if (pins === 0) return 'G'; // ガーター
          if (pins === 10) return 'X'; // ストライク
          return pins.toString();
        } else {
          // 1投目がストライクでない場合
          if (pins === 0) return '-'; // ミス
          if (frame.rolls[0] + pins === 10) return '/';
          return pins.toString();
        }
      } else {
        // 3投目
        const firstRoll = frame.rolls[0];
        const secondRoll = frame.rolls[1];
        
        if (firstRoll === 10) {
          // 1投目がストライクの場合
          if (secondRoll === 10) {
            // 2投目もストライクの場合、3投目は新しいフレーム扱い
            if (pins === 0) return 'G'; // ガーター
            if (pins === 10) return 'X'; // ストライク
            return pins.toString();
          } else {
            // 2投目がストライクでない場合
            if (pins === 0) return '-'; // ミス
            if (secondRoll + pins === 10) return '/';
            return pins.toString();
          }
        } else {
          // 1投目がストライクでない場合（スペアの場合のみ3投目がある）
          if (pins === 0) return 'G'; // ガーター
          if (pins === 10) return 'X'; // ストライク
          return pins.toString();
        }
      }
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

const createFrameInfo = (
  frameIndex: number,
  rollIndex: number,
  frame: BowlingFrame
): FrameInfo => ({
  frameIndex,
  rollIndex,
  frame,
});

describe('Bowlard Pin Button Display', () => {
  describe('getPinButtonText - First Roll (1投目)', () => {
    it('should display "G" for 0 pins on first roll', () => {
      const frame = createFrame(1, [], undefined, false, false, false);
      const frameInfo = createFrameInfo(0, 0, frame);
      
      expect(getPinButtonText(0, frameInfo)).toBe('G');
    });

    it('should display "X" for 10 pins on first roll', () => {
      const frame = createFrame(1, [], undefined, false, false, false);
      const frameInfo = createFrameInfo(0, 0, frame);
      
      expect(getPinButtonText(10, frameInfo)).toBe('X');
    });

    it('should display number for 1-9 pins on first roll', () => {
      const frame = createFrame(1, [], undefined, false, false, false);
      const frameInfo = createFrameInfo(0, 0, frame);
      
      for (let pins = 1; pins <= 9; pins++) {
        expect(getPinButtonText(pins, frameInfo)).toBe(pins.toString());
      }
    });
  });

  describe('getPinButtonText - Second Roll (2投目) - Frames 1-9', () => {
    it('should display "-" for 0 pins on second roll', () => {
      const frame = createFrame(1, [5], undefined, false, false, false);
      const frameInfo = createFrameInfo(0, 1, frame);
      
      expect(getPinButtonText(0, frameInfo)).toBe('-');
    });

    it('should display "/" for spare on second roll', () => {
      const frame = createFrame(1, [7], undefined, false, false, false);
      const frameInfo = createFrameInfo(0, 1, frame);
      
      expect(getPinButtonText(3, frameInfo)).toBe('/'); // 7 + 3 = 10 (spare)
    });

    it('should display number for non-spare on second roll', () => {
      const frame = createFrame(1, [5], undefined, false, false, false);
      const frameInfo = createFrameInfo(0, 1, frame);
      
      expect(getPinButtonText(3, frameInfo)).toBe('3'); // 5 + 3 = 8 (not spare)
    });
  });

  describe('getPinButtonText - 10th Frame', () => {
    describe('Second Roll after Strike', () => {
      it('should display "G" for 0 pins after strike', () => {
        const frame = createFrame(10, [10], undefined, true, false, false);
        const frameInfo = createFrameInfo(9, 1, frame);
        
        expect(getPinButtonText(0, frameInfo)).toBe('G'); // New frame after strike, so gutter
      });

      it('should display "X" for 10 pins after strike', () => {
        const frame = createFrame(10, [10], undefined, true, false, false);
        const frameInfo = createFrameInfo(9, 1, frame);
        
        expect(getPinButtonText(10, frameInfo)).toBe('X');
      });

      it('should display number for 1-9 pins after strike', () => {
        const frame = createFrame(10, [10], undefined, true, false, false);
        const frameInfo = createFrameInfo(9, 1, frame);
        
        expect(getPinButtonText(5, frameInfo)).toBe('5');
      });
    });

    describe('Second Roll after Non-Strike', () => {
      it('should display "-" for 0 pins', () => {
        const frame = createFrame(10, [5], undefined, false, false, false);
        const frameInfo = createFrameInfo(9, 1, frame);
        
        expect(getPinButtonText(0, frameInfo)).toBe('-');
      });

      it('should display "/" for spare', () => {
        const frame = createFrame(10, [3], undefined, false, false, false);
        const frameInfo = createFrameInfo(9, 1, frame);
        
        expect(getPinButtonText(7, frameInfo)).toBe('/'); // 3 + 7 = 10 (spare)
      });

      it('should display number for non-spare', () => {
        const frame = createFrame(10, [5], undefined, false, false, false);
        const frameInfo = createFrameInfo(9, 1, frame);
        
        expect(getPinButtonText(3, frameInfo)).toBe('3'); // 5 + 3 = 8 (not spare)
      });
    });

    describe('Third Roll Scenarios', () => {
      it('should display "X" for strike on third roll after double strike', () => {
        const frame = createFrame(10, [10, 10], undefined, true, false, false);
        const frameInfo = createFrameInfo(9, 2, frame);
        
        expect(getPinButtonText(10, frameInfo)).toBe('X');
      });

      it('should display "-" for 0 pins on third roll after strike+number', () => {
        const frame = createFrame(10, [10, 5], undefined, true, false, false);
        const frameInfo = createFrameInfo(9, 2, frame);
        
        expect(getPinButtonText(0, frameInfo)).toBe('-');
      });

      it('should display "/" for spare on third roll after strike+number', () => {
        const frame = createFrame(10, [10, 3], undefined, true, false, false);
        const frameInfo = createFrameInfo(9, 2, frame);
        
        expect(getPinButtonText(7, frameInfo)).toBe('/'); // 3 + 7 = 10 (spare)
      });

      it('should display "X" for strike on third roll after spare', () => {
        const frame = createFrame(10, [7, 3], undefined, false, true, false);
        const frameInfo = createFrameInfo(9, 2, frame);
        
        expect(getPinButtonText(10, frameInfo)).toBe('X');
      });

      it('should display "G" for gutter on third roll after spare', () => {
        const frame = createFrame(10, [7, 3], undefined, false, true, false);
        const frameInfo = createFrameInfo(9, 2, frame);
        
        expect(getPinButtonText(0, frameInfo)).toBe('G');
      });

      it('should display "G" for gutter on third roll after double strike', () => {
        const frame = createFrame(10, [10, 10], undefined, true, false, false);
        const frameInfo = createFrameInfo(9, 2, frame);
        
        expect(getPinButtonText(0, frameInfo)).toBe('G');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return number string when frameInfo is null', () => {
      expect(getPinButtonText(5, null)).toBe('5');
      expect(getPinButtonText(0, null)).toBe('0');
      expect(getPinButtonText(10, null)).toBe('10');
    });
  });

  describe('Button Color Logic', () => {
    // Extract the getPinButtonColor logic for testing
    const getPinButtonColor = (buttonText: string) => {
      switch (buttonText) {
        case 'G':
        case '-':
          return BowlardColors.gutter.background; // 残念感を表現
        case '/':
          return BowlardColors.spare.background; // 穏やかな成功を表現
        case 'X':
          return BowlardColors.strike.background; // 華やかな成功を表現
        default:
          return BowlardColors.number.background; // ニュートラルな数字ボタン
      }
    };

    const getPinButtonTextColor = (buttonText: string) => {
      switch (buttonText) {
        case 'G':
        case '-':
          return BowlardColors.gutter.text; // 残念感を表現
        case '/':
          return BowlardColors.spare.text; // 穏やかな成功を表現
        case 'X':
          return BowlardColors.strike.text; // 華やかな成功を表現
        default:
          return BowlardColors.number.text; // ニュートラルな数字ボタン
      }
    };

    it('should return correct colors for different button types', () => {
      // Gutter and Miss - light grey (disappointment)
      expect(getPinButtonColor('G')).toBe(BowlardColors.gutter.background);
      expect(getPinButtonColor('-')).toBe(BowlardColors.gutter.background);
      
      // Spare - slightly bluish grey (moderate joy)
      expect(getPinButtonColor('/')).toBe(BowlardColors.spare.background);
      
      // Strike - more bluish grey (maximum joy)
      expect(getPinButtonColor('X')).toBe(BowlardColors.strike.background);
      
      // Numbers - score table background (default)
      expect(getPinButtonColor('1')).toBe(BowlardColors.number.background);
      expect(getPinButtonColor('5')).toBe(BowlardColors.number.background);
      expect(getPinButtonColor('9')).toBe(BowlardColors.number.background);
    });

    it('should return correct text colors for different button types', () => {
      // Gutter and Miss - dark grey text
      expect(getPinButtonTextColor('G')).toBe(BowlardColors.gutter.text);
      expect(getPinButtonTextColor('-')).toBe(BowlardColors.gutter.text);
      
      // Spare - blue text
      expect(getPinButtonTextColor('/')).toBe(BowlardColors.spare.text);
      
      // Strike - darker blue text
      expect(getPinButtonTextColor('X')).toBe(BowlardColors.strike.text);
      
      // Numbers - dark grey text
      expect(getPinButtonTextColor('1')).toBe(BowlardColors.number.text);
      expect(getPinButtonTextColor('5')).toBe(BowlardColors.number.text);
      expect(getPinButtonTextColor('9')).toBe(BowlardColors.number.text);
    });

    it('should use default colors for unknown button text', () => {
      expect(getPinButtonColor('unknown')).toBe(BowlardColors.number.background);
      expect(getPinButtonColor('')).toBe(BowlardColors.number.background);
      expect(getPinButtonTextColor('unknown')).toBe(BowlardColors.number.text);
      expect(getPinButtonTextColor('')).toBe(BowlardColors.number.text);
    });
  });
});

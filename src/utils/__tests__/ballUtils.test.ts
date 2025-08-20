import { describe, it, expect } from 'vitest';
import { getBallColor, getBallTextColor, getBallScore, getBallStyle } from '../ballUtils';
import { GameType } from '../../types/index';
import { BallColors } from '../../constants/colors';

describe('ballUtils', () => {
  describe('getBallColor', () => {
    it('returns correct colors for ball numbers 1-15', () => {
      expect(getBallColor(1)).toBe('#FFD700'); // Yellow
      expect(getBallColor(2)).toBe('#6495ED'); // Blue
      expect(getBallColor(3)).toBe('#FF6B6B'); // Red
      expect(getBallColor(4)).toBe('#9370DB'); // Purple
      expect(getBallColor(5)).toBe('#FF8C00'); // Orange
      expect(getBallColor(6)).toBe('#32CD32'); // Green
      expect(getBallColor(7)).toBe('#CD853F'); // Maroon
      expect(getBallColor(8)).toBe('#000000'); // Black
      expect(getBallColor(9)).toBe('#FFD700'); // Yellow stripe
      expect(getBallColor(10)).toBe('#6495ED'); // Blue stripe
      expect(getBallColor(11)).toBe('#FF6B6B'); // Red stripe
      expect(getBallColor(12)).toBe('#9370DB'); // Purple stripe
      expect(getBallColor(13)).toBe('#FF8C00'); // Orange stripe
      expect(getBallColor(14)).toBe('#32CD32'); // Green stripe
      expect(getBallColor(15)).toBe('#CD853F'); // Maroon stripe
    });

    it('returns default color for invalid ball numbers', () => {
      expect(getBallColor(0)).toBe(BallColors.default);
      expect(getBallColor(16)).toBe(BallColors.default);
      expect(getBallColor(-1)).toBe(BallColors.default);
      expect(getBallColor(100)).toBe(BallColors.default);
    });

    it('handles edge cases', () => {
      expect(getBallColor(NaN)).toBe(BallColors.default);
      expect(getBallColor(Infinity)).toBe(BallColors.default);
      expect(getBallColor(-Infinity)).toBe(BallColors.default);
    });
  });

  describe('getBallTextColor', () => {
    it('returns white text for dark balls (2, 3, 4, 7, 8)', () => {
      expect(getBallTextColor(2)).toBe(BallColors.text.dark); // Blue
      expect(getBallTextColor(3)).toBe(BallColors.text.dark); // Red
      expect(getBallTextColor(4)).toBe(BallColors.text.dark); // Purple
      expect(getBallTextColor(7)).toBe(BallColors.text.dark); // Maroon
      expect(getBallTextColor(8)).toBe(BallColors.text.dark); // Black
    });

    it('returns black text for light balls', () => {
      expect(getBallTextColor(1)).toBe(BallColors.text.light); // Yellow
      expect(getBallTextColor(5)).toBe(BallColors.text.light); // Orange
      expect(getBallTextColor(6)).toBe(BallColors.text.light); // Green
      expect(getBallTextColor(9)).toBe(BallColors.text.light); // Yellow stripe
      // For stripe balls 10-15, the function only checks the exact ball number
      // not the color similarity, so 10-15 would be light text unless specifically in darkBalls array
      expect(getBallTextColor(10)).toBe(BallColors.text.light); // Blue stripe (not in darkBalls array)
      expect(getBallTextColor(11)).toBe(BallColors.text.light); // Red stripe (not in darkBalls array)
      expect(getBallTextColor(12)).toBe(BallColors.text.light); // Purple stripe (not in darkBalls array)
      expect(getBallTextColor(13)).toBe(BallColors.text.light); // Orange stripe (not in darkBalls array)
      expect(getBallTextColor(14)).toBe(BallColors.text.light); // Green stripe (not in darkBalls array)
      expect(getBallTextColor(15)).toBe(BallColors.text.light); // Maroon stripe (not in darkBalls array)
    });

    it('handles invalid ball numbers', () => {
      expect(getBallTextColor(0)).toBe(BallColors.text.light);
      expect(getBallTextColor(16)).toBe(BallColors.text.light);
      expect(getBallTextColor(-1)).toBe(BallColors.text.light);
    });
  });

  describe('getBallScore', () => {
    describe('SET_MATCH game type', () => {
      it('returns 10 points for 9-ball', () => {
        expect(getBallScore(9, GameType.SET_MATCH)).toBe(10);
      });

      it('returns 1 point for other balls', () => {
        expect(getBallScore(1, GameType.SET_MATCH)).toBe(1);
        expect(getBallScore(2, GameType.SET_MATCH)).toBe(1);
        expect(getBallScore(8, GameType.SET_MATCH)).toBe(1);
        expect(getBallScore(10, GameType.SET_MATCH)).toBe(1);
        expect(getBallScore(15, GameType.SET_MATCH)).toBe(1);
      });
    });

    describe('ROTATION game type', () => {
      it('returns ball number as points', () => {
        expect(getBallScore(1, GameType.ROTATION)).toBe(1);
        expect(getBallScore(5, GameType.ROTATION)).toBe(5);
        expect(getBallScore(9, GameType.ROTATION)).toBe(9);
        expect(getBallScore(15, GameType.ROTATION)).toBe(15);
      });
    });

    describe('BOWLARD game type', () => {
      it('returns 1 point for all balls', () => {
        expect(getBallScore(1, GameType.BOWLARD)).toBe(1);
        expect(getBallScore(9, GameType.BOWLARD)).toBe(1);
        expect(getBallScore(15, GameType.BOWLARD)).toBe(1);
      });
    });

    describe('unknown game type', () => {
      it('returns 1 point for unknown game types', () => {
        expect(getBallScore(1, 'UNKNOWN' as GameType)).toBe(1);
        expect(getBallScore(9, 'UNKNOWN' as GameType)).toBe(1);
      });
    });
  });

  describe('getBallStyle', () => {
    it('returns base style with correct dimensions', () => {
      const style = getBallStyle(1);
      
      expect(style.width).toBe(40);
      expect(style.height).toBe(40);
      expect(style.borderRadius).toBe('50%');
      expect(style.border).toBe(`2px solid ${BallColors.border}`);
      expect(style.display).toBe('flex');
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
      expect(style.fontWeight).toBe('bold');
      expect(style.fontSize).toBe('14px');
      expect(style.cursor).toBe('pointer');
      expect(style.transition).toBe('all 0.2s ease');
    });

    it('uses correct text color for different balls', () => {
      const yellowBallStyle = getBallStyle(1);
      expect(yellowBallStyle.color).toBe(BallColors.text.light);

      const blueBallStyle = getBallStyle(2);
      expect(blueBallStyle.color).toBe(BallColors.text.dark);

      const blackBallStyle = getBallStyle(8);
      expect(blackBallStyle.color).toBe(BallColors.text.dark);
    });

    it('applies stripe gradient for balls 9-15', () => {
      const stripeBallStyle = getBallStyle(9);
      const expectedGradient = `linear-gradient(to bottom, white 0%, white 20%, ${getBallColor(9)} 20%, ${getBallColor(9)} 80%, white 80%, white 100%)`;
      
      expect(stripeBallStyle.background).toBe(expectedGradient);
    });

    it('applies radial gradient for solid balls 1-8', () => {
      const solidBallStyle = getBallStyle(1);
      const expectedGradient = `radial-gradient(circle at 30% 30%, ${getBallColor(1)}dd, ${getBallColor(1)} 70%)`;
      
      expect(solidBallStyle.background).toBe(expectedGradient);
    });

    it('handles ball number 8 as solid (not stripe)', () => {
      const eightBallStyle = getBallStyle(8);
      const expectedGradient = `radial-gradient(circle at 30% 30%, ${getBallColor(8)}dd, ${getBallColor(8)} 70%)`;
      
      expect(eightBallStyle.background).toBe(expectedGradient);
    });

    it('handles edge case ball numbers', () => {
      const invalidBallStyle = getBallStyle(0);
      expect(invalidBallStyle.width).toBe(40);
      expect(invalidBallStyle.color).toBe(BallColors.text.light);
      
      // Ball 0 should use solid style (not stripe)
      const expectedGradient = `radial-gradient(circle at 30% 30%, ${getBallColor(0)}dd, ${getBallColor(0)} 70%)`;
      expect(invalidBallStyle.background).toBe(expectedGradient);
    });

    it('applies consistent styling properties across different ball numbers', () => {
      const styles = [1, 5, 9, 13].map(num => getBallStyle(num));
      
      // Check that all styles have the same base properties
      styles.forEach(style => {
        expect(style.width).toBe(40);
        expect(style.height).toBe(40);
        expect(style.borderRadius).toBe('50%');
        expect(style.fontWeight).toBe('bold');
        expect(style.fontSize).toBe('14px');
        expect(style.cursor).toBe('pointer');
        expect(style.transition).toBe('all 0.2s ease');
      });
    });

    it('uses correct background pattern for stripe vs solid balls', () => {
      // Test solid ball (1-8)
      const solidStyle = getBallStyle(5);
      expect(solidStyle.background).toContain('radial-gradient');
      
      // Test stripe ball (9-15)
      const stripeStyle = getBallStyle(10);
      expect(stripeStyle.background).toContain('linear-gradient');
      expect(stripeStyle.background).toContain('white 0%');
      expect(stripeStyle.background).toContain('white 20%');
      expect(stripeStyle.background).toContain('20%');
      expect(stripeStyle.background).toContain('80%');
    });
  });
});
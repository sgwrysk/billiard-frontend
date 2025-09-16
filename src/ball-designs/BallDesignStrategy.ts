import type { BallSizeSpec } from './types/BallSize';

/**
 * Abstract Strategy for Ball Design Rendering
 * ボールデザイン描画用抽象戦略
 * 
 * This is the base class for all ball design implementations using Strategy Pattern.
 * これはStrategy パターンを使用した全てのボールデザイン実装の基底クラスです。
 * 
 * IMPORTANT: When adding new ball designs, extend this class and implement all abstract methods.
 * 重要: 新しいボールデザインを追加する際は、このクラスを継承して全ての抽象メソッドを実装してください。
 * 
 * Design Pattern: Strategy Pattern
 * - Strategy (this class): Defines interface for different ball design algorithms
 * - ConcreteStrategy: DefaultBallDesign, AramithTournamentDesign, etc.
 * - Context: BallRenderer class that uses these strategies
 */
export abstract class BallDesignStrategy {
  /**
   * Get unique identifier for this design
   * このデザインの一意識別子を取得
   */
  abstract getId(): string;

  /**
   * Get display name for this design (localized)
   * このデザインの表示名を取得（ローカライズ済み）
   */
  abstract getName(): string;

  /**
   * Get manufacturer name for this design
   * このデザインのメーカー名を取得
   */
  abstract getManufacturer(): string;

  /**
   * Get the color for a specific ball number
   * 特定のボール番号の色を取得
   * @param ballNumber - Ball number (1-15)
   */
  abstract getBallColor(ballNumber: number): string;

  /**
   * Get the stripe background color (white for standard, black for special designs)
   * ストライプ背景色を取得（標準は白、特殊デザインは黒）
   */
  abstract getStripeBackground(): string;

  /**
   * Check if this design has special border styling (like Aramith black border)
   * このデザインが特殊枠線スタイル（Aramithの黒枠など）を持つかチェック
   */
  abstract hasSpecialBorder(): boolean;

  /**
   * Generate CSS background style for a ball
   * ボール用CSS背景スタイルを生成
   * @param ballNumber - Ball number (1-15)
   * @returns CSS background string (gradient for stripes, radial for solids)
   */
  generateBackground(ballNumber: number): string {
    const ballColor = this.getBallColor(ballNumber);
    const stripeBackground = this.getStripeBackground();

    return ballNumber > 8
      ? `linear-gradient(to bottom, ${stripeBackground} 0%, ${stripeBackground} 20%, ${ballColor} 20%, ${ballColor} 80%, ${stripeBackground} 80%, ${stripeBackground} 100%)`
      : `radial-gradient(circle at 30% 30%, ${ballColor}dd, ${ballColor} 70%)`;
  }

  /**
   * Generate inner white circle style (for ball number background)
   * 内側白円スタイルを生成（ボール番号背景用）
   * @param size - Circle size specification
   */
  getInnerCircleStyle(size: { xs: string; sm: string }): object {
    return {
      content: '""',
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: size,
      height: size,
      backgroundColor: 'white',
      borderRadius: '50%',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
      zIndex: 1,
    };
  }

  /**
   * Generate special border style (for Aramith designs)
   * 特殊枠線スタイルを生成（Aramithデザイン用）
   * @param size - Border size specification
   */
  getSpecialBorderStyle(size?: { xs: string; sm: string }): object {
    if (!this.hasSpecialBorder() || !size) return {};
    
    return {
      content: '""',
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: size,
      height: size,
      backgroundColor: 'transparent',
      borderRadius: '50%',
      border: '1px solid #000',
      zIndex: 2,
    };
  }

  /**
   * Generate complete ball style for any size configuration
   * あらゆるサイズ設定に対応した完全なボールスタイルを生成
   * 
   * This is the main method that combines all styling elements into a complete MUI sx object.
   * これは全てのスタイリング要素を完全なMUI sxオブジェクトに結合するメインメソッドです。
   * 
   * @param ballNumber - Ball number (1-15)
   * @param sizeSpec - Size specification from BALL_SIZES
   * @returns Complete MUI sx style object ready for use in components
   */
  generateCompleteStyle(ballNumber: number, sizeSpec: BallSizeSpec): object {
    return {
      // Basic ball shape and dimensions / 基本的なボール形状と寸法
      width: sizeSpec.width,
      height: sizeSpec.height,
      minWidth: sizeSpec.minWidth,
      borderRadius: '50%',
      
      // Typography / タイポグラフィ
      fontWeight: 'bold',
      fontSize: sizeSpec.fontSize,
      color: '#000',
      
      // Layout / レイアウト
      position: 'relative',
      overflow: 'hidden',
      border: 'none',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      
      // Appearance / 外観
      background: this.generateBackground(ballNumber),
      boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.3)',
      
      // Pseudo-elements for inner circle and special borders / 内側円と特殊枠線用疑似要素
      '&::before': this.getInnerCircleStyle(sizeSpec.innerCircle),
      
      // Conditional special border (only for designs that need it) / 条件付き特殊枠線（必要なデザインのみ）
      ...(this.hasSpecialBorder() && sizeSpec.specialBorder && {
        '&::after': this.getSpecialBorderStyle(sizeSpec.specialBorder)
      })
    };
  }
}
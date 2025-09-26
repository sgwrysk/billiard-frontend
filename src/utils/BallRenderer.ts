import { BallDesignFactory } from '../ball-designs/BallDesignFactory';
import { BALL_SIZES, type BallSizeKey } from '../ball-designs/types/BallSize';

/**
 * Ball color constants for consistent styling across all components
 * 全コンポーネントでの一貫したスタイリングのためのボール色定数
 */
export const BallColors = {
  // Pocketed ball color
  pocketed: {
    background: 'linear-gradient(145deg, #e6e6e6, #cccccc)',
    shadow: 'inset 2px 2px 4px rgba(0,0,0,0.2)',
  },
  
  // Normal ball shadow effect
  shadow: {
    normal: '0 4px 12px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.3)',
  },
} as const;

/**
 * Unified Ball Renderer using Strategy Pattern
 * Strategy パターンを使用した統一ボールレンダラー
 * 
 * This is the SINGLE ENTRY POINT for all ball rendering across the application.
 * これがアプリケーション全体でのボール描画の唯一のエントリーポイントです。
 * 
 * Design Pattern: Strategy Pattern Context
 * - This class acts as the Context in the Strategy Pattern
 * - It delegates ball rendering to appropriate BallDesignStrategy instances
 * - Provides a unified interface for all ball rendering needs
 * 
 * CRITICAL: All components MUST use this class for ball rendering consistency.
 * 重要: 全てのコンポーネントは、ボール描画の一貫性のためにこのクラスを使用する必要があります。
 * 
 * Usage examples across different contexts:
 * 使用例（異なる文脈での）:
 * 
 * Settings preview:
 * const style = BallRenderer.getStyle(ballNumber, designId, 'medium')
 * 
 * Game board (RotationBoard):
 * const style = BallRenderer.getStyle(ballNumber, currentDesign.id, 'medium')
 * 
 * Score display:
 * const style = BallRenderer.getStyle(ballNumber, currentDesign.id, 'scoreDisplay')
 * 
 * BallButton component:
 * const style = BallRenderer.getStyle(ballNumber, currentDesign.id, size) // where size is 'scoreDisplay'|'medium'
 */
export class BallRenderer {
  /**
   * Get complete ball style for any context
   * あらゆる文脈での完全なボールスタイルを取得
   * 
   * This is the primary method that all components should use for ball rendering.
   * これは全てのコンポーネントがボール描画に使用すべき主要メソッドです。
   * 
   * @param ballNumber - Ball number (1-15)
   * @param designId - Design ID ('default', 'aramith-tournament-tv', 'aramith-tournament-tv-black')
   * @param sizeKey - Size key from BALL_SIZES ('scoreDisplay', 'medium')
   * @returns Complete MUI sx style object that can be applied to any Box/Button component
   * 
   * @throws Error if sizeKey is invalid
   * 
   * IMPORTANT: This method ensures all balls look identical across components for the same design.
   * 重要: このメソッドは、同じデザインに対して全コンポーネントで同じボール外観を保証します。
   */
  static getStyle(ballNumber: number, designId: string, sizeKey: BallSizeKey): object {
    // Validate ball number / ボール番号を検証
    if (ballNumber < 1 || ballNumber > 15) {
      // Invalid ball number, using ball 1 as fallback
      ballNumber = 1;
    }

    // Get the design strategy / デザイン戦略を取得
    const strategy = BallDesignFactory.getStrategy(designId);
    
    // Get the size specification / サイズ仕様を取得
    const sizeSpec = BALL_SIZES[sizeKey];
    if (!sizeSpec) {
      throw new Error(
        `Unknown ball size: ${sizeKey}. Available sizes: ${Object.keys(BALL_SIZES).join(', ')}`
      );
    }

    // Generate complete style using the strategy / 戦略を使用して完全なスタイルを生成
    return strategy.generateCompleteStyle(ballNumber, sizeSpec);
  }

  /**
   * Get just the background style (for legacy compatibility)
   * 背景スタイルのみ取得（レガシー互換性のため）
   * 
   * @deprecated Use getStyle() instead for complete styling consistency
   * @param ballNumber - Ball number (1-15)
   * @param designId - Design ID
   * @returns CSS background string
   */
  static getBackground(ballNumber: number, designId: string): string {
    const strategy = BallDesignFactory.getStrategy(designId);
    return strategy.generateBackground(ballNumber);
  }

  /**
   * Get ball color only
   * ボール色のみ取得
   * 
   * @param ballNumber - Ball number (1-15)
   * @param designId - Design ID
   * @returns Hex color string
   */
  static getColor(ballNumber: number, designId: string): string {
    const strategy = BallDesignFactory.getStrategy(designId);
    return strategy.getBallColor(ballNumber);
  }

  /**
   * Check if a design has special border styling
   * デザインが特殊枠線スタイルを持つかチェック
   * 
   * @param designId - Design ID
   * @returns True if the design has special borders (like Aramith black borders)
   */
  static hasSpecialBorder(designId: string): boolean {
    const strategy = BallDesignFactory.getStrategy(designId);
    return strategy.hasSpecialBorder();
  }

  /**
   * Get design information for UI display
   * UI表示用のデザイン情報を取得
   * 
   * @param designId - Design ID
   * @returns Design information object
   */
  static getDesignInfo(designId: string): { id: string; name: string; manufacturer: string } {
    const strategy = BallDesignFactory.getStrategy(designId);
    return {
      id: strategy.getId(),
      name: strategy.getName(),
      manufacturer: strategy.getManufacturer()
    };
  }

  /**
   * Get all available designs for Settings UI
   * 設定UI用の利用可能な全デザインを取得
   * 
   * @returns Array of design information objects
   */
  static getAllDesigns(): Array<{ id: string; name: string; manufacturer: string }> {
    return BallDesignFactory.getAllStrategies().map(strategy => ({
      id: strategy.getId(),
      name: strategy.getName(),
      manufacturer: strategy.getManufacturer()
    }));
  }

  /**
   * Debug method to verify ball rendering consistency
   * ボール描画一貫性を検証するデバッグメソッド
   * 
   * @param ballNumber - Ball number to test
   * @param designId - Design ID to test
   * @param sizeKey - Size key to test
   * @returns Debug information about the rendered ball
   */
  static debug(ballNumber: number, designId: string, sizeKey: BallSizeKey): object {
    const strategy = BallDesignFactory.getStrategy(designId);
    const sizeSpec = BALL_SIZES[sizeKey];
    
    return {
      ballNumber,
      designId,
      sizeKey,
      designName: strategy.getName(),
      manufacturer: strategy.getManufacturer(),
      color: strategy.getBallColor(ballNumber),
      hasSpecialBorder: strategy.hasSpecialBorder(),
      stripeBackground: strategy.getStripeBackground(),
      sizeSpec,
      totalDesigns: BallDesignFactory.getDesignCount()
    };
  }
}
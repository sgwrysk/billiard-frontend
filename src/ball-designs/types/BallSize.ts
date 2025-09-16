/**
 * Ball size specifications for different UI contexts
 * 各UI文脈でのボールサイズ仕様
 * 
 * This defines standardized sizes for balls across the entire application.
 * これはアプリケーション全体でのボールの標準化サイズを定義します。
 * 
 * When adding new ball contexts, add the size specification here first.
 * 新しいボール使用文脈を追加する際は、まずここにサイズ仕様を追加してください。
 */
export interface BallSizeSpec {
  // Main ball dimensions / メインボール寸法
  width: { xs: number; sm: number };
  height: { xs: number; sm: number };
  minWidth: { xs: number; sm: number };
  
  // Inner white circle dimensions / 内側白円寸法
  innerCircle: { xs: string; sm: string };
  
  // Special border dimensions for Aramith designs / Aramithデザイン用特殊枠線寸法
  specialBorder?: { xs: string; sm: string };
  
  // Font size for ball numbers / ボール番号フォントサイズ
  fontSize: { xs: string; sm: string };
}

/**
 * Pre-defined size configurations for different UI contexts
 * 異なるUI文脈用の事前定義サイズ設定
 * 
 * IMPORTANT: All ball rendering must use these standardized sizes
 * 重要: 全てのボール描画はこれらの標準化サイズを使用する必要があります
 * 
 * ACTUAL USAGE LOCATIONS / 実際の使用箇所:
 */
export const BALL_SIZES: Record<string, BallSizeSpec> = {
  
  
  // CURRENTLY USED IN / 現在使用中:
  // - BallButton.tsx: デフォルトサイズ (size='medium')
  // - JapanBoard.tsx: ハンディキャップボール選択画面
  // - JapanGameScreen.tsx: ハンディキャップボール表示
  // - BallDesignContext.tsx: getBallStyle()の下位互換用
  medium: {
    width: { xs: 60, sm: 52 },
    height: { xs: 60, sm: 52 },
    minWidth: { xs: 60, sm: 52 },
    innerCircle: { xs: '32px', sm: '28px' },
    specialBorder: { xs: '30px', sm: '26px' },
    fontSize: { xs: '1.2rem', sm: '1.1rem' }
  },
  
  // CURRENTLY USED IN / 現在使用中:
  // - RotationBoard.tsx: プレイヤーのスコア履歴表示の小さいボール
  // - JapanGameScreen.tsx: 各プレイヤーのpocketed ballsの表示（小さいボール）
  scoreDisplay: {
    width: { xs: 32, sm: 28 },
    height: { xs: 32, sm: 28 },
    minWidth: { xs: 32, sm: 28 },
    innerCircle: { xs: '18px', sm: '16px' },
    specialBorder: { xs: '16px', sm: '14px' },
    fontSize: { xs: '0.8rem', sm: '0.75rem' }
  }
};

/**
 * Type for ball size keys - ensures type safety when specifying sizes
 * ボールサイズキー用型 - サイズ指定時の型安全性を保証
 */
export type BallSizeKey = keyof typeof BALL_SIZES;
import { BallDesignStrategy } from '../BallDesignStrategy';

/**
 * Default Ball Design Strategy
 * デフォルトボールデザイン戦略
 * 
 * This is the standard/original ball design used as the application default.
 * これはアプリケーションのデフォルトとして使用される標準/オリジナルのボールデザインです。
 * 
 * Design characteristics:
 * - Standard billiard ball colors
 * - White stripe background for balls 9-15
 * - No special border styling
 * - Classic radial gradient for solid balls (1-8)
 * 
 * デザイン特徴:
 * - 標準ビリヤードボール色
 * - 9-15番ボールは白ストライプ背景
 * - 特殊枠線スタイルなし
 * - ソリッドボール（1-8番）はクラシック放射グラデーション
 */
export class DefaultBallDesign extends BallDesignStrategy {
  /**
   * Standard billiard ball color mapping
   * 標準ビリヤードボール色マッピング
   * 
   * Color pairs: solid balls (1-8) share colors with stripe balls (9-15)
   * 色ペア: ソリッドボール（1-8）はストライプボール（9-15）と色を共有
   */
  private readonly colors = {
    1: '#FFD700',   // Yellow (solid 1 = striped 9) / イエロー
    2: '#6495ED',   // Blue (solid 2 = striped 10) / ブルー
    3: '#FF6B6B',   // Red (solid 3 = striped 11) / レッド
    4: '#9370DB',   // Purple (solid 4 = striped 12) / パープル
    5: '#FF8C00',   // Orange (solid 5 = striped 13) / オレンジ
    6: '#32CD32',   // Green (solid 6 = striped 14) / グリーン
    7: '#CD853F',   // Maroon (solid 7 = striped 15) / マルーン
    8: '#000000',   // Black (special 8-ball) / ブラック（特別な8番ボール）
    9: '#FFD700',   // Yellow stripe / イエローストライプ
    10: '#6495ED',  // Blue stripe / ブルーストライプ
    11: '#FF6B6B',  // Red stripe / レッドストライプ
    12: '#9370DB',  // Purple stripe / パープルストライプ
    13: '#FF8C00',  // Orange stripe / オレンジストライプ
    14: '#32CD32',  // Green stripe / グリーンストライプ
    15: '#CD853F',  // Maroon stripe / マルーンストライプ
  };

  getId(): string {
    return 'default';
  }

  getName(): string {
    return 'デフォルト';
  }

  getManufacturer(): string {
    return 'オリジナル';
  }

  getBallColor(ballNumber: number): string {
    return this.colors[ballNumber as keyof typeof this.colors] || '#CCCCCC';
  }

  getStripeBackground(): string {
    // Default design uses white stripe background / デフォルトデザインは白ストライプ背景を使用
    return 'white';
  }

  hasSpecialBorder(): boolean {
    // Default design has no special border styling / デフォルトデザインは特殊枠線スタイルなし
    return false;
  }
}
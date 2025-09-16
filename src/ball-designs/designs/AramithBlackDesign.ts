import { BallDesignStrategy } from '../BallDesignStrategy';

/**
 * Aramith Tournament TV BLACK Duramis Ball Design Strategy
 * Aramith トーナメントTV BLACK デュラミス ボールデザイン戦略
 * 
 * This represents the special black stripe variant of Aramith Tournament TV balls.
 * これはAramith Tournament TVボールの特別な黒ストライプバリアントを表現します。
 * 
 * Design characteristics:
 * - Same professional colors as Tournament TV
 * - BLACK stripe background for balls 9-15 (unique feature)
 * - Special black border around ball numbers
 * - Enhanced contrast for specific tournament conditions
 * 
 * デザイン特徴:
 * - Tournament TVと同じプロ仕様色
 * - 9-15番ボールは黒ストライプ背景（ユニーク機能）
 * - ボール番号周りの特殊黒枠線
 * - 特定トーナメント条件用の強化コントラスト
 * 
 * IMPORTANT: The key difference from regular Tournament TV is the black stripe background.
 * 重要: 通常のTournament TVとの主な違いは黒ストライプ背景です。
 */
export class AramithBlackDesign extends BallDesignStrategy {
  /**
   * Aramith Tournament TV BLACK ball color mapping
   * Aramith Tournament TV BLACKボール色マッピング
   * 
   * These colors match the Tournament TV design but are optimized for black stripe contrast.
   * これらの色はTournament TVデザインに合わせつつ、黒ストライプコントラスト用に最適化されています。
   */
  private readonly colors = {
    1: '#FFA500',   // Orange (ball 1 in BLACK variant) / オレンジ（BLACKバリアントのボール1）
    2: '#0066CC',   // Blue (ball 2 in BLACK variant) / ブルー（BLACKバリアントのボール2）
    3: '#CC0000',   // Red (ball 3 in BLACK variant) / レッド（BLACKバリアントのボール3）
    4: '#FF6BB3',   // Pink (ball 4 in BLACK variant) / ピンク（BLACKバリアントのボール4）
    5: '#9966CC',   // Purple (ball 5 in BLACK variant) / パープル（BLACKバリアントのボール5）
    6: '#00AA44',   // Green (ball 6 in BLACK variant) / グリーン（BLACKバリアントのボール6）
    7: '#8B4513',   // Brown (ball 7 in BLACK variant) / ブラウン（BLACKバリアントのボール7）
    8: '#000000',   // Black (ball 8 remains black) / ブラック（8番ボールは黒のまま）
    9: '#FFA500',   // Orange stripe / オレンジストライプ
    10: '#0066CC',  // Blue stripe / ブルーストライプ
    11: '#CC0000',  // Red stripe / レッドストライプ
    12: '#FF6BB3',  // Pink stripe / ピンクストライプ
    13: '#9966CC',  // Purple stripe / パープルストライプ
    14: '#00AA44',  // Green stripe / グリーンストライプ
    15: '#8B4513',  // Brown stripe / ブラウンストライプ
  };

  getId(): string {
    return 'aramith-tournament-tv-black';
  }

  getName(): string {
    return 'トーナメントTV BLACK デュラミス';
  }

  getManufacturer(): string {
    return 'Aramith';
  }

  getBallColor(ballNumber: number): string {
    return this.colors[ballNumber as keyof typeof this.colors] || '#CCCCCC';
  }

  getStripeBackground(): string {
    // The key feature: BLACK stripe background instead of white
    // 主要機能: 白の代わりに黒ストライプ背景
    return 'black';
  }

  hasSpecialBorder(): boolean {
    // Aramith BLACK also features the signature black border around numbers
    // Aramith BLACKも番号周りのシグネチャー黒枠線を特徴とする
    return true;
  }
}
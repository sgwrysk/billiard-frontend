import { BallDesignStrategy } from '../BallDesignStrategy';

/**
 * Aramith Tournament TV Pro Cup Duramis Ball Design Strategy
 * Aramith トーナメントTVプロカップ デュラミス ボールデザイン戦略
 * 
 * This represents the professional Aramith Tournament TV ball set used in competitions.
 * これは競技で使用されるプロ仕様のAramith Tournament TVボールセットを表現します。
 * 
 * Design characteristics:
 * - Professional tournament-grade colors
 * - White stripe background for balls 9-15
 * - Special black border around ball numbers (Aramith signature feature)
 * - Enhanced color saturation for TV broadcast visibility
 * 
 * デザイン特徴:
 * - プロトーナメントグレード色
 * - 9-15番ボールは白ストライプ背景
 * - ボール番号周りの特殊黒枠線（Aramithシグネチャー機能）
 * - TV放送用視認性向上のための色彩強調
 */
export class AramithTournamentDesign extends BallDesignStrategy {
  /**
   * Aramith Tournament TV ball color mapping
   * Aramith Tournament TVボール色マッピング
   * 
   * These colors are based on the actual Aramith Tournament TV Pro Cup product
   * and optimized for television broadcast visibility.
   * これらの色は実際のAramith Tournament TV Pro Cup製品に基づき、
   * テレビ放送での視認性に最適化されています。
   */
  private readonly colors = {
    1: '#F4C430',   // Rich Tournament Yellow / リッチトーナメントイエロー
    2: '#1E3A8A',   // Deep Tournament Blue / ディープトーナメントブルー
    3: '#DC2626',   // Vivid Tournament Red / ビビッドトーナメントレッド
    4: '#FF69B4',   // Tournament Pink (more accurate to product) / トーナメントピンク（製品により忠実）
    5: '#EA580C',   // Tournament Orange / トーナメントオレンジ
    6: '#16A34A',   // Tournament Green / トーナメントグリーン
    7: '#8B4513',   // Tournament Brown / トーナメントブラウン
    8: '#1F2937',   // Tournament Black / トーナメントブラック
    9: '#F4C430',   // Rich Tournament Yellow stripe / リッチトーナメントイエローストライプ
    10: '#1E3A8A',  // Deep Tournament Blue stripe / ディープトーナメントブルーストライプ
    11: '#DC2626',  // Vivid Tournament Red stripe / ビビッドトーナメントレッドストライプ
    12: '#FF69B4',  // Tournament Pink stripe / トーナメントピンクストライプ
    13: '#EA580C',  // Tournament Orange stripe / トーナメントオレンジストライプ
    14: '#16A34A',  // Tournament Green stripe / トーナメントグリーンストライプ
    15: '#8B4513',  // Tournament Brown stripe / トーナメントブラウンストライプ
  };

  getId(): string {
    return 'aramith-tournament-tv';
  }

  getName(): string {
    return 'トーナメントTVプロカップ デュラミス';
  }

  getManufacturer(): string {
    return 'Aramith';
  }

  getBallColor(ballNumber: number): string {
    return this.colors[ballNumber as keyof typeof this.colors] || '#CCCCCC';
  }

  getStripeBackground(): string {
    // Aramith Tournament uses standard white stripe background / Aramith Tournamentは標準白ストライプ背景を使用
    return 'white';
  }

  hasSpecialBorder(): boolean {
    // Aramith Tournament features the signature black border around numbers
    // Aramith Tournamentは番号周りのシグネチャー黒枠線を特徴とする
    return true;
  }
}
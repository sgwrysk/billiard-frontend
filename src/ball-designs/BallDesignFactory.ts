import { BallDesignStrategy } from './BallDesignStrategy';
import { DefaultBallDesign } from './designs/DefaultBallDesign';
import { AramithTournamentDesign } from './designs/AramithTournamentDesign';
import { AramithBlackDesign } from './designs/AramithBlackDesign';

/**
 * Ball Design Factory using Strategy Pattern
 * Strategy パターンを使用したボールデザインファクトリ
 * 
 * This factory manages all available ball design strategies and provides unified access.
 * このファクトリは利用可能な全てのボールデザイン戦略を管理し、統一されたアクセスを提供します。
 * 
 * Design Pattern: Factory Pattern combined with Strategy Pattern
 * - Factory: Creates and manages strategy instances
 * - Strategy: Each ball design is a separate strategy
 * - Singleton-like: Strategies are created once and reused
 * 
 * IMPORTANT: When adding new ball designs:
 * 1. Create a new class extending BallDesignStrategy
 * 2. Add it to the strategies Map in this factory
 * 3. Update the type definitions if needed
 * 
 * 重要: 新しいボールデザインを追加する際は:
 * 1. BallDesignStrategyを継承した新しいクラスを作成
 * 2. このファクトリのstrategies Mapに追加
 * 3. 必要に応じて型定義を更新
 */
export class BallDesignFactory {
  /**
   * Static registry of all available ball design strategies
   * 利用可能な全ボールデザイン戦略の静的レジストリ
   * 
   * Each strategy is instantiated once and reused for performance.
   * 各戦略は一度インスタンス化され、パフォーマンスのために再利用されます。
   */
  private static readonly strategies = new Map<string, BallDesignStrategy>([
    // Default/Original ball design / デフォルト/オリジナル ボールデザイン
    ['default', new DefaultBallDesign()],
    
    // Aramith Tournament TV Pro Cup Duramis / Aramith トーナメントTVプロカップ デュラミス
    ['aramith-tournament-tv', new AramithTournamentDesign()],
    
    // Aramith Tournament TV BLACK Duramis / Aramith トーナメントTV BLACK デュラミス
    ['aramith-tournament-tv-black', new AramithBlackDesign()],
    
    // TODO: Add more ball designs here as they are implemented
    // TODO: 実装されたら、ここにより多くのボールデザインを追加
    // ['brunswick-centennial', new BrunswickCentennialDesign()],
    // ['cyclop-hyperion', new CyclopHyperionDesign()],
  ]);

  /**
   * Get a ball design strategy by its ID
   * IDによってボールデザイン戦略を取得
   * 
   * @param designId - Design identifier (e.g., 'default', 'aramith-tournament-tv')
   * @returns Ball design strategy instance, or default if not found
   * 
   * IMPORTANT: Always returns a valid strategy. Unknown IDs fall back to default.
   * 重要: 常に有効な戦略を返します。不明なIDはデフォルトにフォールバックします。
   */
  static getStrategy(designId: string): BallDesignStrategy {
    const strategy = this.strategies.get(designId);
    
    if (!strategy) {
      // Unknown ball design ID, falling back to default design
      return this.strategies.get('default')!;
    }
    
    return strategy;
  }

  /**
   * Get all available ball design strategies
   * 利用可能な全ボールデザイン戦略を取得
   * 
   * @returns Array of all registered ball design strategies
   * 
   * This is used by the Settings component to display all available designs.
   * これは設定コンポーネントで利用可能な全デザインを表示するために使用されます。
   */
  static getAllStrategies(): BallDesignStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get all available design IDs
   * 利用可能な全デザインIDを取得
   * 
   * @returns Array of all registered design IDs
   */
  static getAllDesignIds(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Check if a design ID exists
   * デザインIDが存在するかチェック
   * 
   * @param designId - Design identifier to check
   * @returns True if the design exists, false otherwise
   */
  static hasDesign(designId: string): boolean {
    return this.strategies.has(designId);
  }

  /**
   * Get design count for debugging/monitoring
   * デバッグ/監視用のデザイン数を取得
   * 
   * @returns Number of registered ball designs
   */
  static getDesignCount(): number {
    return this.strategies.size;
  }
}
/**
 * Japan Game type definitions
 */

export interface JapanMultiplier {
  label: string;
  value: number;
}

export interface JapanDeduction {
  label: string;
  value: number;
}

export interface JapanGameSettings {
  handicapBalls: number[];
  multipliers: JapanMultiplier[];
  deductionEnabled: boolean;
  deductions: JapanDeduction[];
  orderChangeInterval: number;
  orderChangeEnabled: boolean; // 順替えラック数変更の有効/無効
  multipliersEnabled: boolean; // 倍率ボタン変更の有効/無効
}

export interface JapanPlayer {
  id: string;
  name: string;
  currentRackPoints: number;
  totalPoints: number;
  ballsCollected: Array<{
    ball: number;
    count: number;
    isMultiplier?: boolean;
    isDeduction?: boolean;
  }>;
}

export interface JapanBallAction {
  ball: number;
  type: 'ball' | 'multiplier' | 'deduction';
  value: number;
  label?: string;
}

export interface JapanRackResult {
  rackNumber: number;
  playerResults: JapanPlayerRackResult[];
}

export interface JapanPlayerOrder {
  fromRack: number;
  toRack: number;
  playerOrder: string[]; // Player IDs in order
}

export interface JapanPlayerRackResult {
  playerId: string;
  earnedPoints: number;    // そのラックで獲得したポイント（ボールクリック）
  deltaPoints: number;     // そのラックでの増減ポイント（他プレイヤーからの移動分）
  totalPoints: number;     // そのラック終了時の累計ポイント
}
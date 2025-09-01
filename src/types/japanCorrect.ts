/**
 * Japan Game Correct Implementation type definitions
 */

export interface JapanMultiplier {
  label: string;
  value: number;
}

export interface JapanGameSettings {
  handicapBalls: number[];
  multipliers: JapanMultiplier[];
  orderChangeInterval: number;
  orderChangeEnabled: boolean;
  multipliersEnabled: boolean;
}

export interface JapanPlayer {
  id: string;
  name: string;
  currentRackPoints: number; // このラックでの獲得ポイント
  totalPoints: number; // 累計ポイント
  ballsCollected: JapanBallCollection[]; // このラックで取った球
}

export interface JapanBallCollection {
  ballNumber: number;
  count: number;
  order: number; // 取得順序
}

export interface JapanRackAction {
  type: 'ball' | 'multiplier';
  ballNumber?: number; // ballの場合のみ
  value: number; // ポイント値
  label: string;
  order: number; // アクション順序
  playerId: string;
}

export interface JapanRackResult {
  rackNumber: number;
  players: Array<{
    playerId: string;
    earnedPoints: number; // 獲得ポイント
    deltaPoints: number; // 増減ポイント（他プレイヤーから移動したポイント）
    totalPoints: number; // 累計ポイント
  }>;
}

export interface JapanGameState {
  currentRack: number;
  playerOrder: string[]; // プレイヤーの現在の順序（D&Dで変更可能）
  rackHistory: JapanRackResult[];
  actions: JapanRackAction[]; // 現在のラックのアクション履歴
  isScoreEditMode: boolean;
}
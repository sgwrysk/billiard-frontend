/**
 * アプリ全体で使用する色の定数
 * 統一感のあるデザインを実現するための共通色設定
 */

export const AppColors = {
  // ニュートラル（中立）色
  neutral: {
    // 基本的な背景色（数字ボタン、スコア表背景など）
    background: '#f5f5f5',
    // 基本的なテキスト色
    text: '#333333',
    // 境界線色
    border: '#ddd',
  },

  // 残念・失敗を表現する色
  disappointment: {
    // 背景色（ガーター、ミスなど）
    background: '#e0e0e0',
    // テキスト色
    text: '#666666',
  },

  // 成功・強調を表現する色（段階的）
  success: {
    // 軽い成功（スペアなど）
    mild: {
      background: '#f0f4f8', // 数字のグレーに少しだけ青みを加えた色
      text: '#1976d2',       // タイトルベースの青色
    },
    // 強い成功（ストライクなど）
    strong: {
      background: '#e8f2fd', // スペアより少し青みが強い色
      text: '#1565c0',       // より濃い青色
    },
  },

  // アプリのテーマ色（既存のテーマから）
  theme: {
    primary: '#1976d2',      // メインの青色
    primaryLight: '#42a5f5', // 明るい青色
    primaryDark: '#1565c0',  // 濃い青色
    secondary: '#ffc107',    // ゴールドアクセント
  },

  // チェスクロック用の色
  chessClock: {
    activePlayer: '#d4e4f7',      // アクティブプレイヤー用の輝度が低い青
    activePlayerHover: '#e8f2fd', // ボーラードのストライク色（マウスオン時）
  },

  // 影・エフェクト用
  effects: {
    shadow: {
      light: 'rgba(0,0,0,0.1)',
      medium: 'rgba(0,0,0,0.15)',
      dark: 'rgba(0,0,0,0.2)',
    },
  },
} as const;

/**
 * ボーラードゲーム用の色設定
 * AppColorsを使用してボーラード特有の色を定義
 */
export const BowlardColors = {
  // 数字ボタン
  number: {
    background: AppColors.neutral.background,
    text: AppColors.neutral.text,
  },
  // ガーター・ミス
  gutter: {
    background: AppColors.disappointment.background,
    text: AppColors.disappointment.text,
  },
  // スペア
  spare: {
    background: AppColors.success.mild.background,
    text: AppColors.success.mild.text,
  },
  // ストライク
  strike: {
    background: AppColors.success.strong.background,
    text: AppColors.success.strong.text,
  },
} as const;

/**
 * ビリヤードボールの色設定
 * ローテーション等のゲームで使用
 */
export const BallColors = {
  // ソリッドボール（1-8番）とストライプボール（9-15番）の色定義
  // 1番と9番、2番と10番...のように同色ペアで定義
  colors: {
    1: '#FFD700',  // Yellow (1番ソリッド = 9番ストライプ)
    2: '#6495ED',  // Blue (2番ソリッド = 10番ストライプ)
    3: '#FF6B6B',  // Red (3番ソリッド = 11番ストライプ)
    4: '#9370DB',  // Purple (4番ソリッド = 12番ストライプ)
    5: '#FF8C00',  // Orange (5番ソリッド = 13番ストライプ)
    6: '#32CD32',  // Green (6番ソリッド = 14番ストライプ)
    7: '#CD853F',  // Maroon (7番ソリッド = 15番ストライプ)
    8: '#000000',  // Black (8番は特別な黒)
    9: '#FFD700',  // Yellow stripe (1番と同色)
    10: '#6495ED', // Blue stripe (2番と同色)
    11: '#FF6B6B', // Red stripe (3番と同色)
    12: '#9370DB', // Purple stripe (4番と同色)
    13: '#FF8C00', // Orange stripe (5番と同色)
    14: '#32CD32', // Green stripe (6番と同色)
    15: '#CD853F', // Maroon stripe (7番と同色)
  },
  
  // ボールのテキスト色（数字の色）
  text: {
    // 明るい色のボールには黒文字
    light: '#000000',
    // 暗い色のボールには白文字  
    dark: '#FFFFFF',
  },
  
  // ボールの境界線・影の色
  border: '#333333',
  
  // ポケット済みボールの色
  pocketed: {
    background: 'linear-gradient(145deg, #e6e6e6, #cccccc)',
    shadow: 'inset 2px 2px 4px rgba(0,0,0,0.2)',
  },
  
  // 通常のボールの影効果
  shadow: {
    normal: '0 4px 12px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.3)',
  },
  
  // デフォルト色（定義されていないボール番号の場合）
  default: '#CCCCCC',
} as const;

/**
 * UI要素の共通色設定
 * 境界線、影、ホバー効果など
 */
export const UIColors = {
  // 境界線・枠線
  border: {
    light: '#e0e0e0',    // 薄いグレーの境界線
    medium: '#ddd',      // 中程度のグレーの境界線  
    dark: '#333',        // 濃いグレーの境界線
  },
  
  // 背景色
  background: {
    white: 'white',
    lightGray: '#f5f5f5',
    mediumGray: '#ddd',
    disabled: '#999',
    success: '#e8f5e8',  // 成功・完了状態の背景色
  },
  
  // テキスト色
  text: {
    black: '#000',
    darkGray: '#333',
    mediumGray: '#666',
    lightGray: '#999',
    white: 'white',
  },
  
  // ホバー効果
  hover: {
    lightBackground: '#f5f5f5',
    shadow: '0 8px 16px rgba(0,0,0,0.15)',
  },
  
  // 影効果
  shadow: {
    light: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 2px 8px rgba(0,0,0,0.1)',
    strong: '0 4px 12px rgba(0,0,0,0.15)',
    inset: 'inset 0 1px 3px rgba(0,0,0,0.2)',
  },
  
  // チャート・グラフ用の色
  chart: {
    playerColors: ['#2196F3', '#F44336', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'],
    primary: '#2196F3',
    primaryBackground: '#2196F320',
  },
} as const;

/**
 * 他のゲーム用の色設定も同様に定義可能
 * 例：セットマッチ、ローテーション用の色設定
 */
export const GameColors = {
  // プレイヤー選択状態
  playerSelected: {
    background: AppColors.theme.primary,
    text: 'white',
    border: `3px solid ${AppColors.theme.primary}`,
  },
  // プレイヤー非選択状態
  playerUnselected: {
    background: UIColors.background.white,
    text: AppColors.neutral.text,
    border: `1px solid ${UIColors.border.light}`,
  },
  // 勝利・成功状態
  victory: {
    background: AppColors.success.strong.background,
    text: AppColors.success.strong.text,
  },
} as const;

/**
 * チェスクロック用の色設定
 * 時間管理の状態を視覚的に表現する色
 */
export const ChessClockColors = {
  // チェスクロック全体の背景色（ボーラードのイニング数表と同様の薄いグレー）
  background: UIColors.background.lightGray,
  
  // プレイヤーボタンの色
  player: {
    // デフォルト状態（非アクティブ）- グレーな感じ
    default: {
      background: UIColors.background.lightGray,
      text: UIColors.text.mediumGray,
      border: `1px solid ${UIColors.border.medium}`,
    },
    // アクティブプレイヤー（選択中）- 輝度が低い青を使用
    active: {
      background: AppColors.chessClock.activePlayer,
      text: AppColors.success.strong.text,
      border: `1px solid ${AppColors.chessClock.activePlayer}`,
    },
    // 警告状態（警告時間を超えた場合）
    warning: {
      background: AppColors.theme.secondary, // ゴールドアクセント
      text: 'white',
      border: `1px solid ${AppColors.theme.secondary}`,
    },
    // 時間切れ状態
    timeUp: {
      background: '#d32f2f', // 赤色（時間切れ）
      text: 'white',
      border: `1px solid #d32f2f`,
    },
  },
  
  // スタート/ストップボタンの色
  control: {
    start: {
      background: '#4caf50', // 緑色（開始）
      text: 'white',
      hover: '#388e3c',
    },
    stop: {
      background: '#f44336', // 赤色（停止）
      text: 'white',
      hover: '#d32f2f',
    },
  },
} as const;

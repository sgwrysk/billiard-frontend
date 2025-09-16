# 色設定ガイド

このディレクトリには、アプリ全体で統一感のあるデザインを実現するための色定数が含まれています。

## 📁 ファイル構成

- `colors.ts` - アプリ全体で使用する色の定数定義

## 🎨 色の分類

### AppColors - 基本色設定

#### ニュートラル（中立）色
```typescript
AppColors.neutral.background  // '#f5f5f5' - 基本的な背景色
AppColors.neutral.text        // '#333333' - 基本的なテキスト色
AppColors.neutral.border      // '#ddd'     - 境界線色
```

#### 残念・失敗を表現する色
```typescript
AppColors.disappointment.background  // '#e0e0e0' - 失敗時の背景色
AppColors.disappointment.text        // '#666666' - 失敗時のテキスト色
```

#### 成功・強調を表現する色（段階的）
```typescript
// 軽い成功（スペアなど）
AppColors.success.mild.background    // '#f0f4f8' - 穏やかな成功の背景色
AppColors.success.mild.text          // '#1976d2' - 穏やかな成功のテキスト色

// 強い成功（ストライクなど）
AppColors.success.strong.background  // '#e8f2fd' - 華やかな成功の背景色
AppColors.success.strong.text        // '#1565c0' - 華やかな成功のテキスト色
```

#### テーマ色
```typescript
AppColors.theme.primary      // '#1976d2' - メインの青色
AppColors.theme.primaryLight // '#42a5f5' - 明るい青色
AppColors.theme.primaryDark  // '#1565c0' - 濃い青色
AppColors.theme.secondary    // '#ffc107' - ゴールドアクセント
```

#### エフェクト用
```typescript
AppColors.effects.shadow.light   // 'rgba(0,0,0,0.1)' - 軽い影
AppColors.effects.shadow.medium  // 'rgba(0,0,0,0.15)' - 中程度の影
AppColors.effects.shadow.dark    // 'rgba(0,0,0,0.2)' - 濃い影
```

### ゲーム固有の色設定

#### BowlardColors - ボーラードゲーム用
```typescript
BowlardColors.number.background  // 数字ボタンの背景色
BowlardColors.number.text        // 数字ボタンのテキスト色
BowlardColors.gutter.background  // ガーター・ミスの背景色
BowlardColors.gutter.text        // ガーター・ミスのテキスト色
BowlardColors.spare.background   // スペアの背景色
BowlardColors.spare.text         // スペアのテキスト色
BowlardColors.strike.background  // ストライクの背景色
BowlardColors.strike.text        // ストライクのテキスト色
```

#### BallColors - ビリヤードボール用
```typescript
BallColors.colors[1]          // '#FFD700' - 1番ボール（黄色）
BallColors.colors[2]          // '#6495ED' - 2番ボール（青色）
BallColors.colors[8]          // '#000000' - 8番ボール（黒色）
BallColors.colors[9]          // '#FFD700' - 9番ボール（黄色ストライプ、1番と同色）
BallColors.text.light         // '#000000' - 明るいボール用の黒文字
BallColors.text.dark          // '#FFFFFF' - 暗いボール用の白文字
BallColors.border             // '#333333' - ボールの境界線色
BallColors.pocketed.background // ポケット済みボールの背景色
BallColors.pocketed.shadow    // ポケット済みボールの影効果
BallColors.shadow.normal      // 通常のボールの影効果
BallColors.default            // '#CCCCCC' - デフォルト色
```

#### UIColors - UI要素の共通色
```typescript
UIColors.border.light         // '#e0e0e0' - 薄いグレーの境界線
UIColors.border.medium        // '#ddd'     - 中程度のグレーの境界線
UIColors.border.dark          // '#333'     - 濃いグレーの境界線
UIColors.background.white     // 'white'    - 白背景
UIColors.background.lightGray // '#f5f5f5'  - 薄いグレー背景
UIColors.background.mediumGray// '#ddd'     - 中程度のグレー背景
UIColors.background.disabled  // '#999'     - 無効状態の背景
UIColors.text.black           // '#000'     - 黒文字
UIColors.text.darkGray        // '#333'     - 濃いグレー文字
UIColors.text.mediumGray      // '#666'     - 中程度のグレー文字
UIColors.text.lightGray       // '#999'     - 薄いグレー文字
UIColors.text.white           // 'white'    - 白文字
UIColors.hover.lightBackground// '#f5f5f5'  - ホバー時の薄いグレー背景
UIColors.hover.shadow         // ホバー時の影効果
UIColors.shadow.light         // 軽い影効果
UIColors.shadow.medium        // 中程度の影効果
UIColors.shadow.strong        // 強い影効果
UIColors.shadow.inset         // 内側の影効果
```

#### GameColors - 汎用ゲーム用
```typescript
GameColors.playerSelected.background    // プレイヤー選択時の背景色
GameColors.playerSelected.text          // プレイヤー選択時のテキスト色
GameColors.playerSelected.border        // プレイヤー選択時の境界線
GameColors.playerUnselected.background  // プレイヤー非選択時の背景色
GameColors.playerUnselected.text        // プレイヤー非選択時のテキスト色
GameColors.playerUnselected.border      // プレイヤー非選択時の境界線
GameColors.victory.background           // 勝利時の背景色
GameColors.victory.text                 // 勝利時のテキスト色
```

## 🚀 使用方法

### 1. インポート
```typescript
import { AppColors, BowlardColors, UIColors, GameColors } from '../constants/colors';
import { BallColors } from '../utils/ballUtils';
```

### 2. コンポーネントでの使用例
```typescript
// MUIのsxプロパティで使用
<Button
  sx={{
    backgroundColor: BowlardColors.strike.background,
    color: BowlardColors.strike.text,
    boxShadow: `0 2px 4px ${AppColors.effects.shadow.light}`,
    '&:hover': {
      boxShadow: `0 4px 8px ${AppColors.effects.shadow.medium}`,
    },
  }}
>
  ストライク
</Button>

// CSS-in-JSで使用
const styles = {
  container: {
    backgroundColor: AppColors.neutral.background,
    border: `1px solid ${AppColors.neutral.border}`,
  },
  successButton: {
    backgroundColor: AppColors.success.strong.background,
    color: AppColors.success.strong.text,
  },
};

// ビリヤードボールのスタイル
const ballStyle = {
  backgroundColor: BallColors.colors[1], // 1番ボール（黄色）
  color: BallColors.text.light,          // 明るいボール用の黒文字
  border: `2px solid ${BallColors.border}`,
  boxShadow: BallColors.shadow.normal,
};

// UI要素のスタイル
const cardStyle = {
  border: `1px solid ${UIColors.border.light}`,
  backgroundColor: UIColors.background.white,
  boxShadow: UIColors.shadow.medium,
  '&:hover': {
    backgroundColor: UIColors.hover.lightBackground,
    boxShadow: UIColors.hover.shadow,
  },
};
```

### 3. 条件分岐での使用例
```typescript
const getButtonColor = (type: 'success' | 'failure' | 'neutral') => {
  switch (type) {
    case 'success':
      return AppColors.success.strong.background;
    case 'failure':
      return AppColors.disappointment.background;
    default:
      return AppColors.neutral.background;
  }
};
```

## 🎯 設計思想

### 統一感
- 全てのゲームで同じ色体系を使用
- 感情的な表現を色で統一（成功=青系、失敗=グレー系）

### 拡張性
- 新しいゲームを追加する際も、既存の色設定を再利用可能
- ゲーム固有の色設定は別途定義

### メンテナンス性
- 色の変更は一箇所で管理
- TypeScriptの型安全性により、存在しない色の参照を防止

## 📝 新しいゲームを追加する場合

1. `colors.ts`に新しいゲーム用の色設定を追加
```typescript
export const NewGameColors = {
  // 基本的にはAppColorsを参照
  button: {
    background: AppColors.neutral.background,
    text: AppColors.neutral.text,
  },
  // ゲーム固有の色があれば定義
  special: {
    background: '#custom-color',
    text: AppColors.theme.primary,
  },
} as const;
```

2. コンポーネントで使用
```typescript
import { NewGameColors } from '../constants/colors';
```

これにより、アプリ全体で一貫した色使いを維持できます。

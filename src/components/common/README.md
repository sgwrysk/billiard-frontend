# 共通コンポーネント

このディレクトリには、アプリケーション全体で再利用可能な共通コンポーネントが含まれています。

## ToggleSwitch

オン/オフの設定を直感的に操作できるトグルスイッチコンポーネントです。

### 使用方法

```tsx
import { ToggleSwitch } from '../components/common';

// 基本的な使用
<ToggleSwitch
  checked={isEnabled}
  onChange={setIsEnabled}
  label="機能を有効にする"
/>

// 説明文付き
<ToggleSwitch
  checked={isEnabled}
  onChange={setIsEnabled}
  label="交互ブレイク"
  description="勝者に関わらず、セット毎にブレイクするプレイヤーが変わる"
/>

// 無効化状態
<ToggleSwitch
  checked={isEnabled}
  onChange={setIsEnabled}
  label="機能を有効にする"
  disabled={true}
/>

// カスタムスタイル
<ToggleSwitch
  checked={isEnabled}
  onChange={setIsEnabled}
  label="機能を有効にする"
  sx={{ mt: 2, mb: 1 }}
/>
```

### プロパティ

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|----|------|------------|------|
| `checked` | `boolean` | ✓ | - | トグルスイッチの状態 |
| `onChange` | `(checked: boolean) => void` | ✓ | - | 状態が変更された時のコールバック |
| `label` | `string` | ✓ | - | トグルスイッチのラベル |
| `description` | `string` | - | - | 説明文（オプション） |
| `disabled` | `boolean` | - | `false` | 無効化するかどうか |
| `sx` | `any` | - | `{}` | カスタムスタイル |

### 特徴

- Material-UIのSwitchコンポーネントを使用
- アクセシビリティに配慮したラベルと説明文の表示
- 無効化状態での適切な動作
- カスタマイズ可能なスタイリング
- TypeScript対応
- 包括的なテストカバレッジ

## NumberInputStepper

数値入力用のステッパーコンポーネントです。+/-ボタンでの調整と直接テキスト入力の両方に対応しています。

### 使用方法

```tsx
import { NumberInputStepper } from '../components/common';

// 基本的な使用
<NumberInputStepper
  value={timeLimit}
  onChange={setTimeLimit}
/>

// ラベル付き
<NumberInputStepper
  value={warningTime}
  onChange={setWarningTime}
  label="警告時間（分）"
/>

// 範囲とステップ指定
<NumberInputStepper
  value={handicap}
  onChange={setHandicap}
  min={0}
  max={50}
  step={5}
  label="ハンデ"
/>

// 無効化状態
<NumberInputStepper
  value={value}
  onChange={setValue}
  disabled={true}
/>
```

### プロパティ

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|----|------|------------|------|
| `value` | `number` | ✓ | - | 現在の値 |
| `onChange` | `(value: number) => void` | ✓ | - | 値が変更された時のコールバック |
| `min` | `number` | - | `1` | 最小値 |
| `max` | `number` | - | `999` | 最大値 |
| `step` | `number` | - | `1` | ステップ値 |
| `label` | `string` | - | - | ラベル（オプション） |
| `disabled` | `boolean` | - | `false` | 無効化するかどうか |

### 特徴

- +/-ボタンでの簡単な値調整
- 直接テキスト入力による詳細な値設定
- 最小値・最大値の範囲チェック
- カスタムステップ値対応
- モノスペースフォント使用で数値表示が安定
- Enterキーで入力確定、Escapeキーでキャンセル
- 無効化状態での適切な動作
- TypeScript対応
- 包括的なテストカバレッジ

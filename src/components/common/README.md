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

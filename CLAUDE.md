# AI Assistant Guidelines for Billiard Frontend Project / ビリヤード・フロントエンドプロジェクト AIアシスタントガイドライン

This file contains project-specific guidelines and instructions for Claude Code, Cursor, and other AI tools.  
このファイルはClaude Code、Cursor、その他AIツール向けのプロジェクト固有のガイドラインと指示を記載しています。

## 📋 Required Workflow / 必須のワークフロー

### 🔧 **Pre-Code Change & Deploy Checklist / コードの変更・デプロイ前チェックリスト**
1. **Run Tests / テスト実行**: `npm test` - Ensure all tests pass / 全テストがパスすることを確認
2. **Build Check / ビルド確認**: `npm run build` - Verify no TypeScript errors / TypeScriptエラーがないことを確認
3. **Lint Check / リントチェック**: `npm run lint` (warnings OK, fix errors / 警告は許可、エラーは修正)
4. **Coverage Check / カバレッジ確認**: `npm test -- --coverage` (maintain 90%+ / 90%以上を維持)

### 📤 **Git Operations Rules / Git操作のルール**
- **Pre-commit / コミット前**: Always run above checklist / 必ず上記チェックリストを実行
- **Commit messages / コミットメッセージ**: **English description of functional changes** / **機能追加内容を英語で明確に記載**
- **AI signature / AI署名**: Always add `🤖 Generated with [Claude Code](https://claude.ai/code)` and `Co-Authored-By: Claude <noreply@anthropic.com>`
- **Push timing / Push実行**: Only when explicitly requested / 明示的な指示がある場合のみ
- **README updates / README更新**: **MUST update README.md and README.ja.md before every push** / **Push前に必ずREADME.mdとREADME.ja.mdを最新に更新**

## 🎯 **テスト品質基準**

### **カバレッジ目標**
- **全体**: 90%以上を維持
- **重要コンポーネント**: 95%以上
- **新規コード**: 必ず対応するテストを追加

### **テスト構造**
- 共通テストユーティリティ: `src/__tests__/utils/testHelpers.tsx` を活用
- 大きなテストファイル（1000行超）は機能別分割を検討
- モック設定は各テストファイル内で適切に管理

## 🏗️ **開発規約**

### **コード品質**
- TypeScriptの厳密な型定義を維持
- ESLintエラーは必ず修正（警告は許可）
- 既存のコード規約とパターンに従う
- **コメント言語**: すべてのコード内コメントは英語で記述

### **UIコンポーネント**
- Material-UIの使用を継続
- レスポンシブデザイン対応（xs, sm, md, lg）
- 日本語UIを基本とする

### **UI/UXガイドライン**
- **シンプル重視**: UIやUX、動作を極力シンプルに保つ
- **国際化対応**: 画面の文言はハードコードせずに `useLanguage()` hook を使用
- **共通化**: できるだけ共通コンポーネントとして実装し、テスト可能な状態を維持
- **色管理**: 色指定をハードコードしない、`src/constants/colors.ts` を活用
- **統一感**: アプリ全体で統一されたカラーフォーマット・デザインシステムを維持
- **ファイル管理**: 500行を超えたら分割を提案、1000行超は必須分割

### **ゲーム機能**
- **セットマッチ**: セット履歴とプレイヤー入れ替え機能
- **ローテーション**: ボールポケット履歴とスコア計算
- **ボーラード**: フレーム管理とスコア表示
- **チェスクロック**: レスポンシブ対応と正しい操作ロジック

## 📁 **ファイル構造規約**

```
src/
├── components/          # UIコンポーネント
│   ├── games/          # ゲーム固有コンポーネント
│   ├── common/         # 共通コンポーネント  
│   └── __tests__/      # テストファイル
├── __tests__/utils/    # 共通テストユーティリティ
├── games/              # ゲームエンジン
├── hooks/              # カスタムフック
├── contexts/           # React Context
├── types/              # TypeScript型定義
└── utils/              # ユーティリティ関数
```

## 🚨 **注意事項**

### **禁止事項**
- `any` 型の使用は最小限に抑制
- 新規ファイル作成は必要最小限
- 既存テストを壊さない
- 機能性に影響するリントエラーは放置しない
- **文言のハードコード禁止** - 必ず言語設定対応
- **色のハードコード禁止** - `src/constants/colors.ts` を使用
- **巨大ファイルの放置禁止** - 500行超で分割検討、1000行超で必須分割
- **日本語コメント禁止** - コード内コメントは必ず英語で記述

### **推奨事項**
- 既存パターンとコード規約の継承
- 段階的改善アプローチ
- ユーザビリティを重視した実装
- モバイルファーストの設計
- **共通コンポーネント優先** - 再利用可能な設計
- **テスト駆動開発** - コンポーネント作成時は対応テストも作成

### **リファクタリングルール**
- **リファクタ前の必須確認**: 対象コードに自動テストが存在することを確認
- **テストが無い場合**: リファクタ前に必ずテストを追加
- **リファクタ後の必須確認**: `npm test` で全テストが通ることを確認
- **動作保証**: リファクタ前後で機能・動作が変わらないことをテストで担保
- **段階的実施**: 大きなリファクタは小さな単位に分割して実行

## 💡 **トラブルシューティング**

### **よくある問題**
- TypeScriptエラー: 型定義の確認と修正
- テスト失敗: モック設定とテストデータの確認
- ビルドエラー: インポートパスとエクスポートの確認
- カバレッジ低下: 新規コードに対応するテスト追加
- リファクタ後の動作不具合: テスト不足が原因、事前テスト追加が必要

### **デバッグコマンド**
```bash
# 特定のテストファイルのみ実行
npm test -- --run path/to/test.tsx

# カバレッジ詳細表示
npm test -- --coverage --reporter=verbose

# ビルド詳細ログ
npm run build --verbose

# リファクタ前後のテスト確認
npm test                    # リファクタ前の動作確認
# ... リファクタ実行 ...
npm test                    # リファクタ後の動作確認
```

## 📝 **定期メンテナンス**

- 月1回: 依存関係の更新確認
- ファイルサイズ監視（500行超の分割検討、1000行超の必須分割）
- カバレッジレポートの確認と改善
- 不要なコードとコメントの削除
- 国際化対応漏れの確認（ハードコード文言のチェック）
- カラーシステムの統一性確認

---

**最終更新**: 2025-08-24
**対象AIツール**: Claude Code, Cursor, GitHub Copilot, その他
# FUN FISHING

時期と場所から、魚・釣り方・必要な道具・準備リストへ進む、ログイン不要の釣り具選定プロトタイプです。

## 起動

Node.js **22.12以降**を使用します。

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

表示されたURLの `/fun-fishing/` を開きます。通常は `http://127.0.0.1:5173/fun-fishing/` です。

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview -- --host 127.0.0.1
```

このWindows環境で既存のPlaywrightブラウザを使う場合は、PowerShellで以下を実行します。他の環境では不要です。

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:USERPROFILE 'AppData\Local\ms-playwright'
npm run test:e2e
```

本番ビルドは `dist/`。Viteのbaseは既存GitHub Pages構成に合わせた `/fun-fishing/` です。既存ブランチ `codex/fishing-hero` へのPushで既存のPagesデプロイが走ります。別のパスで公開する際は `vite.config.ts` のbaseを変更してください。

## 試せる体験

1. 時期・地域/エリア・フィールドを選択。未対応条件は代替サンプルを案内。
2. 東京湾の堤防でアジ・イワシ・小サバとサビキ釣りを選択。
3. 道具8カテゴリのおまかせ構成を確認。商品変更、仕様比較、条件付き汎用品比較、所持品の除外、不足・非推奨の表示。
4. Amazonで個別商品の価格を確認。準備チェック、自動保存、構成URL共有・復元、戻る・やり直し。

通常のアプリ利用で外部APIは呼びません。データは同梱しており、ネットワーク取得失敗で選択フローは止まりません。商品・魚・釣具のイラストはオリジナルです。

## データと制約

14実商品・8カテゴリを収録。東京湾の堤防で4〜10月（アジは5〜10月）を対象に、公開資料に基づく一般的な季節傾向を提案します。現地の直近釣果、立入許可、天候を予測・保証するサービスではありません。

購入先は全商品Amazonに統一しています。全14商品についてAmazonの実画面で型番・選択仕様を照合した個別ページへリンクします。旧DAISOの3商品はRISEWAYの6号/10号サビキカゴとRISUアクティブバケツ8Lに置換し、検索リンクは使用しません。仕様の出典は引き続きメーカー等の公開資料です。詳細は docs/AMAZON_LINKS.md を参照してください。

価格・在庫フィード、アフィリエイト契約は未設定です。価格を0円と扱わず、合計は表示していません。現物装着・エサを含む総重量・結束強度・ライフジャケットの体格適合は未検証で、画面に要確認として残します。

## 保存と共有

構成は `localStorage` の `fun-fishing-build-v1` に自動保存します。共有URLには構成・所持品・チェック状態を含むバージョン付きデータを格納します。URLを知る人は同じリストを復元できます。個人情報は収集しません。共有後の変更は各ブラウザで独立します。

入力データは商品ID・カテゴリ・月・魚・釣法等を検証し、不正なURLや破損データは検索へ復帰します。URLから外部購入先を受け取らず、コード内の許可済みホストのみ開きます。ブラウザ履歴にも構成を保存し、戻る・進むで復元します。

## 構成

- `src/App.tsx`: 4ステップの状態、ブラウザ履歴、保存/共有、ガイド。
- `src/SearchPage.tsx`, `src/DiscoverPage.tsx`, `src/EquipmentPages.tsx`: 画面。
- `src/catalog.ts`: 型付き商品・季節・カテゴリ・出典データ。
- `src/domain.ts`: 互換性、対応条件、共有データの検証。UIから独立した純粋関数。
- `src/Illustrations.tsx`, `public/images/harbor.svg`: オリジナルSVG。
- `src/domain.test.ts`, `tests/`: Vitestの単体テストとPlaywrightの実ブラウザテスト。

将来DBへ移す場合は `catalog.ts` のデータ取得層を交換し、型と判定関数を維持できます。現段階で認証・バックエンド・Supabaseは導入していません。

## 検証記録

- [プロダクト仕様](docs/PRODUCT_SPEC.md)
- [データ出典・リンク検証](docs/DATA_SOURCES.md)
- [互換性ルール](docs/COMPATIBILITY_RULES.md)
- [QA実行結果・制約](docs/QA_REPORT.md)
- [UI/UXレビューと修正履歴](docs/UX_REVIEW.md)
- [スクリーンショット](artifacts/screenshots/)

スクリーンリーダーの手動検証、実機タッチ、実在ユーザー調査、完全なWCAG準拠認証は実施していません。自動検査の成功とこれらを混同しません。

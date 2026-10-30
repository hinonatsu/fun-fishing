# Amazon価格の毎朝の更新

GitHub Actionsの `Update Amazon prices every morning` が毎朝 **7:17（日本時間）** に起動し、サイト内の全商品のAmazon個別ページをChromiumで順番に開きます。cronは `17 22 * * *`（UTC）。GitHub側の混雑によって開始時刻が遅れることがあります。

## データの流れ

1. `src/data/amazon-products.json` の全商品ID・ASINを取得対象にする。同じ表からアプリの購入リンクも生成する。カタログと対象表の一致はテストで確認する。
2. `scripts/scrape-amazon-prices.mjs` が日本語・日本時間の匿名ブラウザを使用。5秒以上の間隔で逐次取得し、通信失敗は1回再試行する。一巡後、失敗した商品だけ60秒以上空けてもう一度取得する。価格欄の描画を待ち、通常ページに戻らなければ取得失敗を記録する。APIキー・アカウント・外部有料サービスは不要。
3. 表示された選択ASINとアクセス先のASINを照合し、主商品の購入価格領域から円価格を読む。参考価格・おすすめ商品の価格・ポイント・価格帯を価格として使わない。
4. `src/data/amazon-prices.json` に円価格、通貨、最終成功日時、試行日時、結果状態を原子的に保存する。削除された商品の価格は除去する。
5. テストとビルドを実行し、価格データをコミット・Push。そのコミットを既存のPagesデプロイ処理へ明示的に渡し、サイトを再公開する。`GITHUB_TOKEN` によるPushだけでは別のPushワークフローが起動しないため、デプロイを直接呼び出す。

自動取得では通常の配送先設定画面から **東京の代表郵便番号100-0001** を指定する。海外の実行環境の既定配送先による価格非表示を避け、取得条件を一定にする。利用者個人の住所は使わない。配送先を確認できなければ価格を採用しない。

価格は掲載された購入単位の税込表示価格で、送料を含まない。配送地域、出品者、会員条件、クーポン、セット内容などによって購入時の金額は変わり得る。ログイン・クーポン適用・購入操作は行わない。

## 表示と失敗時の動作

- `ok`: 取得後36時間以内の価格を道具一覧・商品候補・構成確認・買い物リストに表示し、合計・候補比較に使用。取得日時は日本時間で表示する。
- `unavailable`: Amazonの在庫切れ表示を確認。価格をnullにし、0円として集計しない。
- `blocked`: CAPTCHAまたはHTTP 403/429/503。回避処理は実行せず、取得失敗を記録する。
- `error`: 通信失敗、ASIN不一致、未対応の価格表示など。価格を推定しない。
- 取得失敗時は同じASINの前回成功価格と元の取得日時を保持し、「前回」「取得失敗」「集計対象外」を表示する。36時間を超える価格も集計しない。
- 手入力価格を優先する。空欄で保存すると自動取得価格に戻る。自動取得価格をlocalStorageや共有URLへ複製しないため、共有後も最新の同梱価格を参照する。
- 送料は既存の手入力。未選択・所持品・付属品を合計から除外する。

一部商品が失敗しても残りの商品を取得し、成功価格と失敗状態を公開する。その後、失敗があった実行をGitHub Actions上で失敗として報告する。実行サマリーに商品別の状態、`amazon-price-report` アーティファクトに全結果を30日間保持する。全体障害・テスト失敗・Push失敗では公開を停止する。

## 実行と検証

```sh
npm ci
npx playwright install chromium
npm run prices:update -- --dry-run
npm run prices:update
npm run test:prices
npm test
npm run build
```

`--dry-run` は価格スナップショットを変更せず、`artifacts/amazon-prices/latest.json` に結果だけ保存する。通常実行は一部商品でも取得失敗があれば終了コード1を返す。ワークフローは `--allow-partial` で結果を公開した後、別ジョブで失敗を報告する。

Windowsで既存のブラウザを使う場合：

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = 'C:\Users\ntksh\AppData\Local\ms-playwright'
npm run prices:update -- --dry-run
```

手動実行はGitHubのActions画面から `Update Amazon prices every morning` → `Run workflow`。スケジュールは既定ブランチ上のワークフローが対象。このリポジトリの既定・公開ブランチは `codex/fishing-hero`。ブランチ名を変更する場合は、取得ワークフローのcheckout/Push先とデプロイ側のPush対象も変更する。公開リポジトリでは長期間リポジトリに活動がないとスケジュールが無効化される場合があるため、停止時はActions画面を確認する。

テストは外部サイトへ接続せず、HTMLフィクスチャで価格抽出・品切れ・ロボット確認・別ASIN・参考価格の除外を検証。全商品の巡回、エラー後の継続、前回価格の保持、期限切れと手入力の優先、PC/モバイル表示と合計も検証する。

参考：[GitHub schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)、[GITHUB_TOKENによるトリガー制限](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow)。

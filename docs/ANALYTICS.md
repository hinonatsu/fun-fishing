# GA4の商品クリック計測

測定ID: `G-PNP61S32H6`。Googleタグは `src/main.tsx` から `src/analytics.ts` を通じて読み込む。HTMLやGTMに同じタグを重ねて追加しない。

## 公開後にGA4で行う設定

### 1. SPAのページビューの重複を防ぐ（必須）

GA4の「管理」→「データの収集と修正」→「データ ストリーム」→対象のウェブストリーム→「拡張計測機能」の歯車→「ページビュー」の詳細設定で、**「ブラウザの履歴イベントに基づくページの変更」**をオフにして保存する。

このアプリは画面遷移だけでなく、数量などの保存にも `history.replaceState` を使う。サイト側で `send_page_view: false` を設定し、初回表示・実際の画面切替・戻る/進むに対して手動で `page_view` を1回送る。履歴イベントによる自動送信も止めることで、入力のたびのPVや二重PVを防ぐ。React StrictModeの再実行でも同じ表示を重複送信しない。

拡張計測の離脱クリック `click` を併用してもよいが、商品ランキングは専用イベント `amazon_click` だけで集計する。`click` と合算しない。

参考: [Google公式のページビュー計測](https://developers.google.com/analytics/devguides/collection/ga4/views)、[SPA計測](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)。

### 2. カスタム ディメンションを登録

「管理」→「データの表示」→「カスタム定義」→「カスタム ディメンションを作成」。以下をすべて **スコープ「イベント」** で登録する。イベントパラメータは手入力できるので、候補一覧への出現を待つ必要はない。

| ディメンション名 | イベント パラメータ | 値の例 |
|---|---|---|
| 商品ID | `product_id` | `rod-3-300` |
| 商品名 | `product_name` | カタログの商品名 |
| 商品カテゴリ | `product_category` | `rod`, `bait`, `rig` |
| 商品グループ | `product_group` | `equipment`, `consumable`, `lure` |
| 画面 | `screen_id` | `builder/rod`, `list`, `prices` |
| ボタンの設置場所 | `link_position` | `candidate`, `shopping`, `price_selected` |
| 確認操作 | `confirmation_action` | `select_product`, `review_gear` |
| 対象魚 | `fish_id` | `aji` |
| 釣法 | `method_id` | `sabiki` |

登録前の期間を後から商品別に分析できるとは限らないので、公開後すぐに登録する。通常のレポート・探索への反映には24～48時間かかる場合がある。

参考: [Google公式のイベントスコープのカスタム ディメンション作成](https://support.google.com/analytics/answer/14239696?hl=ja)。

### 3. 受信を確認

1. 公開サイトを開き、商品候補の画面で商品を1秒以上表示する。
2. Amazonの商品リンクを1回押す。
3. GA4「レポート」→「リアルタイム」で `flow_step_view`、`product_view`、`amazon_click` を確認する。
4. `amazon_click` の商品ID・カテゴリ・画面が実際に押した商品と一致するか確認する。

詳細な検証には、公開サイトのURLに `?analytics_debug=1` を付けて開き、「管理」→「データの表示」→「DebugView」でパラメータを確認する。既存のクエリがあるURLには `&analytics_debug=1` を使い、`#` より前に置く。確認後はこのパラメータを外す。広告ブロッカーや同意設定によって受信されないことがある。

## 記録するイベント

| イベント | タイミング | 用途 |
|---|---|---|
| `page_view` | 初回および実際の画面切替 | 画面ごとのPV・経路 |
| `flow_step_view` | 初回および実際の画面切替 | 選択・確認の各段階の到達人数 |
| `product_view` | 商品情報の領域の50%以上が画面内で連続1秒表示されたとき | 商品を見た人数 |
| `amazon_click` | 商品に紐づくAmazonリンクの通常・キーボード・中クリック | 商品別の興味 |
| `confirmation_click` | 商品選択、道具確認、購入先/保存への進行 | 次の操作へ進んだ人数 |

商品に紐づくイベントはカタログのID・商品名・カテゴリ・商品グループを持つ。各イベントに画面・対象魚・釣法を付ける。未選択の魚・釣法は `unselected`。

`confirmation_action` は `select_product`（商品選択）、`review_gear`（道具の一覧から構成確認）、`finish_review`（構成確認から次へ）、`open_shopping_list`、`open_save`。

`link_position` は `candidate`（商品候補）、`shopping`（買い物リスト）、`price_selected`（選択商品の価格入力）、`price_comparison`（比較候補の価格入力）。詳細内の購入リンクは `_details`、仕様の出典がAmazon商品ページの場合は `_source` を付ける。メーカーなどAmazon以外へのリンクは `amazon_click` に含めない。商品IDを明示するため、同じASINを使う候補も区別できる。

商品表示は同じ表示場所・画面訪問中に1回。数量入力などの再描画、非表示の比較候補、閉じた交換候補、手持ちや付属品を購入商品の表示として数えない。別の画面へ移動して戻った場合は新しい訪問として数える。短時間でクリックすると表示の1秒条件に達せず、クリックだけ記録される場合がある。

## 商品ランキングを作る

「探索」→「自由形式」で次を設定する。

- 行: 商品名、商品ID（必要に応じて商品カテゴリ）
- 値: イベント数、総ユーザー数
- フィルタ: イベント名が `amazon_click` と完全一致
- 並び順: イベント数の降順
- 消耗品だけ見る場合: 商品グループが `consumable` と完全一致

カテゴリ内訳は `rod` が竿、`reel` がリール、`line` が糸、`rig` が仕掛け、`bait` と `chum` がエサ。消耗品グループには糸・仕掛け・エサ・ウキ止め・オモリ・ハリス・サルカン・針・スナップ・クッション・ショックリーダーを含む。ルアー・エギ・ブラクリは `lure` として分け、それ以外は `equipment`。

仕入れ候補の比較はクリック数だけで決めず、同じ期間・商品・画面で「表示したユーザーのうちクリックしたユーザーの割合」も確認する。クリックの連打で関心が過大にならないよう、人数を併記する。分子は表示イベントのあるユーザーに絞る。商品表示の条件が異なる画面や、候補の並び順・表示量が異なる商品を無条件に比較しない。

「竿で止まるか」は「探索」→「ファネルデータ探索」で、`flow_step_view` かつ `screen_id=builder/rod` → `confirmation_click` かつ `confirmation_action=select_product`、`product_category=rod` を設定する。竿→リールという固定順で選ぶサイトではないので、その順序を全員に要求しない。Amazonクリックは関心の指標で、購入完了・購入数・仕入れ需要を直接示すものではない。

## 計測とテストの範囲

- `src/analytics.ts`: Googleタグの初期化、商品分類、送信データの共通処理。
- `src/AnalyticsTracking.tsx`: 画面表示・表示時間・Reactコンテキスト。
- 商品候補、買い物リスト、価格入力、比較候補、商品詳細のAmazonリンクを計測。
- 共有URLの `build`、デバッグ指定、任意のクエリはサイト側の計測URLから除去し、UTMなどのキャンペーン情報だけを保持する。共有プラン、自由入力・体格・釣行日・価格・人数・コピーした質問文はカスタムイベントに付けない。
- 開発サーバーとローカルの本番プレビューは通常送信しない。ローカルで検証するときだけ `analytics_debug=1` を付ける。
- 自動テストはGoogleタグの読み込みを遮断し、実際の `gtag` キューを検証する。本番GA4にテストデータを送らない。GA4管理画面への受信確認は所有者が行う。
- GAが遮断・故障しても購入リンク・商品選択を継続する。

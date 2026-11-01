# 仕掛け図と選択状態

実装日：2026-11-01（日本時間）

12種類の代表的な仕掛けを、部品ごとに状態を変更できるオリジナルSVGとして作成した。Web画像検索で全体の見せ方を比較し、下表の解説と公式仕掛け図で接続関係を確認した。外部の画像・ロゴは製品に同梱せず、輪郭・配色・座標は独自に描画している。

|釣り方|今回描いた基本形|主な確認資料|
|---|---|---|
|サビキ|枝針→オモリ付き下カゴ|[DAIWA サビキ](https://www.daiwa.com/jp/beginner/place/sabiki)|
|浮き釣り|遊動ウキ→サルカン→ハリス・ガン玉→針|[DAIWA ウキ釣り](https://www.daiwa.com/jp/beginner/place/uminouki)|
|ルアー|PE→リーダー→スナップ→ミノー|[Honda スズキ](https://www.honda.co.jp/fishing/picture-book/suzuki/trap01/)|
|穴釣り|道糸→リーダー→ブラクリ→エサ|[Honda カサゴ](https://www.honda.co.jp/fishing/picture-book/kasago/trap01/)|
|ぶっこみ|中通しオモリ→保護ゴム→サルカン→ハリス・針|[Honda ウナギ](https://www.honda.co.jp/fishing/picture-book/unagi/trap01/)|
|投げ釣り|道糸→力糸→天秤・オモリ→投げ仕掛け|[Honda シロギス](https://www.honda.co.jp/fishing/picture-book/shirogisu/trap01/)|
|ちょい投げ|小型天秤・オモリ→短い2本針仕掛け|[浜田商会 投げ入門](https://www.hamadashokai.co.jp/tsurinyumon/nage.html)、Honda シロギス|
|胴付き|幹糸の枝針→一番下のオモリ|[マルシン漁具 胴突](https://www.mr-dragon.jp/products/sea-fishing/fishing-gear/9936/)|
|浮きサビキ|ウキ止め・ウキ→枝針→下カゴ|DAIWA サビキ、[SHIMANO サビキ入門](https://fish.shimano.com/ja-JP/content/beginners/fishingstyle/baitfishing/sabiki/index.html)|
|エギング|PE→リーダー→スナップ→エギ・傘針|[Honda アオリイカ](https://www.honda.co.jp/fishing/picture-book/aoriika/trap01/)|
|ヘチ|タイコリール→道糸→ハリス→針元ガン玉・針|[Honda クロダイ](https://www.honda.co.jp/fishing/picture-book/kurodai/trap01/)、[つり人 ヘチ釣り](https://web.tsuribito.co.jp/beginner/kurodai-hechi-fishing-guide)|
|カゴ|遊動ウキ→天秤・オモリ付きカゴ→長いハリス・針|[Honda イサキ](https://www.honda.co.jp/fishing/picture-book/isaki/trap01/)|

## 表示・操作

- `#rigs/<id>` は診断なしで閲覧できる仕掛け図鑑。12種類を切り替え、道具名を押すと対応部品と役割を確認できる。図鑑の閲覧は道具の選択を変更しない。
- `#builder` は一覧と全体図を並べる。図の凡例からも各カテゴリの商品選択へ進める。
- 選択済み・手持ち・付属品は常にカラー表示する。未選択の道具は、一覧の行・図の部品・凡例のセルをホバーした間だけカラー表示し、対応する行と凡例を強調する。ホバーを外すと未選択だけグレーに戻す。キーボードフォーカスも連動し、タッチではホバーを残さない。プレビュー中も保存データは変更しない。
- ホバー中はカーソルの近くに道具名を小さく表示する。図の番号にも対応し、画面端では位置を調整する。ホバー解除・Escape・ウィンドウ外への移動で消え、タッチでは表示しない。
- `#builder/<category>` は商品候補と全体図を並べ、現在のカテゴリに金色の縁と「いま選ぶ」を表示する。スマホは候補の上に小さな図を置き、番号の凡例を折りたたむ。下部バーにも現在のカテゴリを表示する。
- 未選択はグレー。購入用の商品を選択するとその部品がカラーになる。手持ちと付属品もカラーにし、文字の状態表示を分ける。選択済みは適合確認済み・購入済みを意味しない。
- 商品選択後、一覧の該当行と図の部品を短く強調する。動きの軽減設定ではアニメーションを止める。
- 付属糸の指定はユーザーの明示操作が必要。リール変更で指定が解除された場合、道糸をグレーに戻す。保存URL・再読み込みは既存の選択情報から同じ状態を復元する。

## 構成と制約

`src/rigs.ts` が釣り方・部品・説明・資料と状態の対応を持ち、`src/RigDiagram.tsx` が接続された竿・リール・糸・仕掛けを描く。`TackleOverview.tsx` が既存ビルドの状態と連動し、`RigLibraryPage.tsx` が12種類の閲覧を担当する。バケツ・安全用品は仕掛けの線へ接続しない。コマセのパックとカゴ内のエサは同じカテゴリに連動する。

図は接続関係と役割を理解するための代表例で、部品の寸法・長さ・号数・結び方・針の本数を保証する組立説明図ではない。投げとちょい投げは構造が似ており、道具の仕様・負荷が異なることを説明する。色は製品の実際の色ではなく、サイト共通の状態表現。

商品の選択・価格・互換性判定は全12釣法に対応。2026-11-01の一次資料による追加照合・セット付属品・特殊対象の接続は [仕掛け監査](research/rig-audit.md) と [道具選択仕様](METHOD_EQUIPMENT.md) を参照。SHIMANOのメンテナンス転送先は根拠にせず、確認できたメーカー解説・完成セット図へ差し替えた。

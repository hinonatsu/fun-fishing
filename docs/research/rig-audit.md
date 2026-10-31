# 12釣法の仕掛け照合記録

確認日：2026-11-01（日本時間）。対象：変更前の `src/rigs.ts`、`src/RigDiagram.tsx`、`src/fish-catalog.ts`。

メーカー公式・Honda公式・自治体資料をWeb検索で確認し、仕掛け画像も一時フォルダに取得して目視で接続を比較した。図は基本構造の例であり、製品の実寸・強度・結束の適合を保証するものではない。商品を登録する際は、以下の基本形に加え、その商品の付属品と取扱説明を確認する。

## 全12釣法の確認

| ID | 確認した基本形 | 既存図・道具定義への必要な対応 | 一次資料 |
|---|---|---|---|
| sabiki | 道糸→市販サビキ→オモリ付き下カゴ。上カゴ式もあるが別構成。 | 現行の下カゴ式は妥当。完成サビキにサルカン等が付属する場合は重複購入させない。カマス用投げサビキは別プロファイルにする。 | [DAIWA サビキ](https://www.daiwa.com/jp/beginner/place/sabiki)、同ページの下カゴ式の説明 |
| float | 道糸→ウキ止め→シモリ玉→中通し円錐ウキ→クッションゴム→サルカン→ハリス・ガン玉→針・付けエサ。 | DAIWA元図には下クッションがあるが現図にない。現図のウキは棒形なのに糸が本体中央を通る。棒ウキ商品を採用するならウキスイベルで底環へ接続する図へ変更。中通し円錐商品なら円錐の形と下クッションを描く。サヨリ・タチウオには専用分岐。 | [DAIWA ウキ釣り](https://www.daiwa.com/jp/beginner/place/uminouki)、[公式仕掛け画像](https://www.daiwa.com/-/media/Project/globeride/daiwa_com_jp/beginner/legacy/images/beginner/contents/first/uminouki/3a5p03v1.jpg)、[釣研 小物の役割](https://tsuriken.co.jp/ukitsuri/?cat=6) |
| lure | PE→リーダー→スナップ→ルアー（針はルアーに付く）。 | シーバス等のプラグ例として接続は妥当。しかしジグヘッド＋ワーム、ロック用、クロダイ用、青物用へミノーを一律流用しない。ジグヘッドセットなら針・オモリを別の必須品にしない。 | [Honda スズキ](https://www.honda.co.jp/fishing/picture-book/suzuki/trap01/)、[Honda カサゴ](https://www.honda.co.jp/fishing/picture-book/kasago/trap01/)、[Honda クロダイ](https://www.honda.co.jp/fishing/picture-book/kurodai/trap01/) |
| hole | PE→リーダー→ブラクリ（オモリ＋短ハリス＋針）→切り身等。 | 接続はHondaブラクリ図と整合。PEを使う代表例なのでリーダー必須にできる。ナイロン直結構成を用意するならリーダー条件を別にする。ブラクリに加えて針とオモリを重複必須にしない。 | [Honda カサゴ](https://www.honda.co.jp/fishing/picture-book/kasago/trap01/)、[公式ブラクリ画像](https://www.honda.co.jp/fishing/picture-book/kasago/image/trap_4.jpg) |
| bukkomi | 道糸→中通しオモリ→保護ゴム管→サルカン→ハリス→針・エサ。 | 接続はHondaのブッコミ図と整合。元資料の対象はウナギであり、その針・エサ・号数を海の全対象魚へ転用しない。カレイ・アナゴ・クロダイ等の針付きハリスを魚別にする。 | [Honda ウナギ](https://www.honda.co.jp/fishing/picture-book/unagi/trap01/)、[公式ブッコミ画像](https://www.honda.co.jp/fishing/picture-book/unagi/image/trap_bukkomi.gif) |
| nage | 道糸→力糸→L型固定天秤・オモリ→スナップスイベル→投げ仕掛け→エサ。 | 現図の接続は概ね整合。接続金具が天秤・完成仕掛けに付属するか記録。力糸と指保護品を準備対象へ。本格投げの竿・リール・糸・オモリをサビキの小型一式で代替しない。 | [Honda シロギス](https://www.honda.co.jp/fishing/picture-book/shirogisu/trap01/)、[公式投げ画像](https://www.honda.co.jp/fishing/picture-book/shirogisu/image/trap_nage.gif)、[SHIMANO 本格投げの道糸・力糸](https://fish.shimano.com/ja-JP/content/fishingstyle/article/nage-iroha/hioki/hikitsuri-02.html) |
| choi-nage | 道糸→スナップ付ヨリモドシ→小型天秤・オモリ→スナップ付接続金具→短い投げ仕掛け→エサ。 | 構造は妥当。天秤・オモリ一体型/セットの提供部品を登録し二重購入を防ぐ。DAIWA例のオモリ幅を全ルアーロッドの許容値とは扱わず、購入竿のg上限と実重量で照合。 | [DAIWA ちょい投げ](https://www.daiwa.com/jp/beginner/place/nage)、[公式仕掛け画像](https://www.daiwa.com/-/media/Project/globeride/daiwa_com_jp/beginner/legacy/images/beginner/contents/first/nage/3a2p04.jpg) |
| dozuki | 道糸→幹糸・枝針の完成仕掛け→一番下のオモリ。枝針に付けエサ。 | 現図は妥当。マルシンの確認例はオモリ込み。こうしたセットへ別の下オモリを強制しない。カワハギ用、ハゼ用、メバル・カサゴ用で針を分ける。 | [マルシン かんたん五目胴突セット](https://www.mr-dragon.jp/products/sea-fishing/fishing-gear/9936/) |
| uki-sabiki | 道糸→ウキ止め・玉→遊動ウキの接続部→下ストッパー→サビキ→オモリ付き下カゴ。 | 棒ウキならウキスイベル等の取付部品と下ストッパーを選択肢/セットに含める。HA230等の下カゴセットと図を合わせ、上カゴセットを同じ図で案内しない。投げ総重量とウキの浮力を別に確認。 | [HAYABUSA HA230](https://www.hayabusa.co.jp/hayabusa/products/HA230/index.html)、[HA195](https://www.hayabusa.co.jp/hayabusa/products/HA195/index.html)、[HA184](https://www.hayabusa.co.jp/hayabusa/products/HA184/index.html) |
| eging | PE→フロロリーダー→スナップ→エギ（腹側のオモリ・尾側の傘針）。 | 現図の接続・形状は妥当。アオリイカ用の通常エギングと、ツツイカ用ライトエギングで竿・糸・リーダー・エギを分ける。エギの号数はオモリ号数へ換算しない。 | [Honda アオリイカ](https://www.honda.co.jp/fishing/picture-book/aoriika/trap01/)、[YAMASHITA ライトエギング](https://www.yamaria.co.jp/yamashita/naory/detail/1) |
| hechi | タイコ型リールの道糸→小サルカンまたは明示した直結→ハリス→針元のガン玉→チヌ針・エサ。 | 現図は直結例として成立するが、参照Honda図は極小サルカン使用。購入品に合わせて直結と明記するか小サルカンを描く。タイコリールを必ず候補にし、スピニング共通候補へ戻さない。ガン玉と投げ用オモリを別種として扱う。 | [Honda クロダイ](https://www.honda.co.jp/fishing/picture-book/kurodai/trap01/)、[公式落とし込み画像](https://www.honda.co.jp/fishing/picture-book/kurodai/image/trap_otoshikomi.gif) |
| kago | 道糸→ウキ止め→シモリ玉→ウキ取付部→下ストッパー→天秤・オモリ付きカゴ→必要に応じゴムクッション→ハリス・針→付けエサ。 | 現図は下ストッパー・取付部を省略。採用セットの構成と一致させる。サビキカゴと同じ図形を使う場合は形状模式図と明記。撒きエサと付けエサを別用途として準備する。天秤一体型カゴでは天秤を重複購入させない。 | [がまかつ 遠投カゴ入門](https://www.gamakatsu.co.jp/column/entokago/)、[愛媛県 釣り道場 p.20（PDFの21枚目）](https://www.pref.ehime.jp/uploaded/attachment/7149.pdf) |

## 必ず分ける判定

- 「ウキ負荷」は水中で支える仕掛けの浮力釣り合い。「竿の投げ負荷」はカゴ本体・オモリ・エサ・ウキ等の投げる総重量。公称カゴ6号だけで総重量適合を断定しない。
- 小物金具の号数、針の号数、エギの号数、ガン玉のB/号、投げオモリの号はそれぞれ別の単位・系列。数値だけで比較しない。
- PE・ナイロンの号数を、リールの同じ糸巻量として扱わない。各材質と号数ごとの容量表を照合する。
- 力糸は投げる負荷を受ける太い先糸。ルアー/エギングのショックリーダーと同じ必須スロットへ潰さない。
- 公開仕様が不明な項目は「要確認」。未確認の重さ・強度を仮定して適合済みとしない。
- セットの付属品は商品仕様として記録し、その商品を外したら付属状態も解除する。

## 対象魚別のプロファイル案（既存30項目）

以下はUIの候補群を分けるための編集上の分類であり、全個体・全地域への適合保証ではない。名称が若魚・小型を示す場合もサイズ・現地条件を別途確認する。各セルは既存の `methodIds` に対応する。

| 魚ID | 道具候補群の分け方 |
|---|---|
| aji | sabiki/uki-sabiki＝小アジ用。float＝小針の堤防ウキ。lure＝軽量ジグヘッド＋小型ワーム等のライトゲーム。kago＝小アジ用針/ハリス。 |
| saba | sabiki/uki-sabiki＝小サバ用。float＝小魚用ウキ。lure＝小型ジグ等。kago＝対象サイズを限定。大型サバ・青物強度の推奨とは分ける。 |
| iwashi | sabiki/uki-sabiki＝口に合う小針・短い仕掛け。大きい針を一律推奨しない。 |
| madai | kago/float/bukkomi＝小〜中型を対象と明示した針・ハリス。サビキ小物の数値で大型対応を主張しない。 |
| buri | lure＝若魚向けショアジギング。kago＝若魚向けカゴ。アジング竿・細糸を流用しない。 |
| hirame | lure＝サーフ/砂地用のミノー・ジグヘッド＋シャッド等。ライトゲームの小型ワームだけに限定しない。 |
| karei | choi-nage/nage/bukkomi＝カレイ用針・エサ。キス用の最小針を無条件推奨しない。 |
| tsutsuika | eging＝ヒイカ等のライトエギング。通常アオリ用エギングとは別。小型エギと軽い竿を用意し、グループ全種全サイズに適合とは主張しない。 |
| suzuki | float/bukkomi＝セイゴ用針付きハリス等。lure＝シーバス用プラグ。 |
| sawara | lure＝サゴシ向けジグ/プラグ。歯によるリーダー損傷を確認する。アジングの一式へ流さない。 |
| anago | bukkomi/choi-nage＝アナゴ向け針付き仕掛け。竿掛け・夜の視認用具は準備品へ。 |
| kanpachi | lure/kago＝ショゴ・シオの若魚向け。大型カンパチ対応ではない旨と取り込み用品を表示。 |
| hokke | float/sabiki/nage＝ホッケ向けの針サイズ・エサ。足元小アジだけの6号針候補へ自動固定しない。 |
| nishin | sabiki＝ニシン向けサビキ。小アジ用との対象別候補を検証する。 |
| kawahagi | dozuki＝堤防カワハギ向け胴付き・小さく付けるエサ。船用重オモリを混在させない。 |
| tachiuo | float＝タチウオ用電気ウキ/発光体・専用ワイヤー針仕掛け・対応オモリ・魚餌。lure＝専用ルアーまたはワインドセット＋歯対策。ワインドを採用するなら専用ヘッド＋ワーム＋ワイヤーを欠落させない。 |
| kisu | choi-nage/nage＝キス向け投げ針・短い仕掛け（ちょい投げ）と本格用を分ける。 |
| mebaru | float/dozuki＝小針・エビ/虫餌等。lure＝ライトゲームのジグヘッド＋ワーム/小型プラグ。 |
| kasago | dozuki/hole＝堤防根魚用・ブラクリ用。lure＝底を探れる根魚リグまたは根魚向け完成ワーム。 |
| kurodai | float＝チヌ/グレ系ウキフカセ。bukkomi＝チヌ用針。lure＝チニング用トップ/ボトムリグ。hechi＝専用竿・タイコ・ハリス・チヌ針・ガン玉。 |
| aoriika | eging＝通常エギング。例として秋の小型用エギを表示するなら、その対象を明記。 |
| kouika | eging＝底を探れるエギ。アオリ用から適合を確認した候補を共有可能だが、接岸・底質条件を説明。 |
| shimaaji | float/sabiki/kago＝岸に寄る小型用。船の大型シマアジ仕掛けへ自動展開しない。 |
| isaki | uki-sabiki/kago/float＝岸近くの小型イサキ用。船用80号カゴ等を候補に混ぜない。 |
| haze | choi-nage/float/dozuki＝ハゼ用小針・軽い近距離仕掛け。グレ針のみの候補へ固定しない。 |
| bora | float＝表層を自然に流す専用/適合確認済み小針仕掛け。大型ボラの抜き上げ前提にはしない。 |
| ainame | dozuki/choi-nage/hole＝堤防のアイナメ・クジメの対象サイズに合う根魚/虫餌仕掛け。 |
| sayori | float＝専用小針・浅ダナのサヨリ仕掛け。3B〜1号の一般ウキフカセ＋チヌ針をそのまま推奨しない。完成セットならシモリ等を付属で扱い、表層用と図/文言で示す。 |
| kamasu | lure＝小型プラグ/ジグ等。sabiki＝カマス専用の投げサビキ（HA202等）。下カゴ・コマセが必須の小アジサビキとは別構成。 |
| mejina | float/kago＝堤防の小〜中型向けグレ針・ハリス。大型尾長の磯用一式とは分ける。 |

### 特殊対象の一次資料

- [Honda サヨリ](https://www.honda.co.jp/fishing/picture-book/sayori/trap01/)：表層のウキ釣り、付けエサ/水コマセ。公式図は飛ばしウキ＋セル玉＋短いハリスの形。一般ウキフカセ図と同じではない。
- [Honda タチウオ](https://www.honda.co.jp/fishing/picture-book/tachiuo/trap01/)：堤防ワインドの専用ヘッド・ワーム・ワイヤー。船ジギングや船テンヤの説明を岸釣りのセットへ混同しない。
- [Honda カマス](https://www.honda.co.jp/fishing/picture-book/kamasu/trap01/)：投げサビキとライトソルトルアーの両方を記載。[HAYABUSA HA202](https://www.hayabusa.co.jp/hayabusa/products/HA202/index.html)はカマス専用サビキ・太ハリス・オモリ付きのセット。小アジ用コマセセットとは別。
- [YAMASHITA ライトエギング](https://www.yamaria.co.jp/yamashita/naory/detail/1)：ツツイカ類は通常アオリ用より軽いタックルの例。ライトゲーム竿・小型スピニング・細いPE・フロロリーダーの組み合わせを提示。
- [DAIWA ヒラメ・マゴチのルアー](https://www.daiwa.com/jp/beginner/place/hirame_magochi_lure)：サーフの底・地形に応じたルアー。小魚ライトゲームと候補群を分ける根拠。

## 検証上の制約・出典の状態

- SHIMANOの既存サビキ入門URLは確認時に2026-10-22付の「一部ページ 緊急メンテナンス」へ転送された。現時点でその本文を再確認したとは扱わない。HA230/HA195/HA184のハヤブサ公式製品本文を代替に確認した。
- ハヤブサの一部ページはWeb取得ツールでは表示不能だったが、通常のHTTPS取得で公式本文を確認できた。HA230は全長1.1m・4本鈎の下カゴ式、HA184は全長80cmの飛ばしサビキ丸ごとセット、HA202は専用太ハリスのカマス投げセットであることを確認。
- 釣研の小物解説は検索インデックスで役割を確認、直接取得は503。実装の決め手は採用製品の公式付属品表/図を優先する。
- 海外版や別号数のAmazonバリエーションで代用した検証はしない。Amazon ASINの検証は別の調査JSONへ分離する。
- 外部リンク許可リストへ新しい一次資料ドメインを追加する場合は、`www.mr-dragon.jp`、`tsuriken.co.jp`、`www.pref.ehime.jp` 等の完全一致ホストを検討する。共有URLから購入URLを受け取らない既存の制約は維持する。

## 図の実装時のチェック項目

1. 商品選択で準備済みになった部品と、その商品が実際に提供する部品が一致する。
2. セット商品を外すと、その商品由来の付属品表示も未選択へ戻る。
3. 棒ウキの道糸はウキ本体を貫通せず、取付スイベル側を通る。
4. 中通しウキは上止め・玉と下クッション/ストッパーを区別する。
5. カゴ釣りの付けエサは針、撒きエサはカゴに位置し、用途を混同しない。
6. 針付き完成仕掛け、エギ、ルアーに含まれる針を重複必須にしない。
7. 釣法を切り替えた際、前釣法の部品・進捗・価格が現在の図に残らない。
8. 必須進捗と図の全部品数は別概念。推奨/任意用品が未選択でも必須完成を妨げない。

## 採用予定セットの公式画像による付属品照合（追加確認）

2026-11-01、ハヤブサの公式製品ページと同ページに掲載された商品写真・仕掛け図を通常のHTTPSで取得し、原寸画像を目視した。以下はメーカーのセット構造を確認した記録。代表写真の鈎サイズと登録するAmazonバリエーションが異なる場合、その違いも明記する。写真にない梱包重量・配送重量から仕掛け重量を推測していない。

### HA176 カンタンウキ釣りセット 堤防用

- 一次資料：[製品本文](https://www.hayabusa.co.jp/hayabusa/products/HA176/index.html)、[商品写真](https://www.hayabusa.co.jp/wp/wp-content/themes/hayabusa2019/web_img/him_img/HA176.png)、[公式仕掛け図](https://www.hayabusa.co.jp/wp/wp-content/themes/hayabusa2019/web_img/him_img/HA176_s.jpeg)。商品写真の代表サイズはLL。M/Lの針・ハリス・道糸号数は本文の各行で確認。
- 付属構成：上のウキ止めゴム・玉、中通し遊動ウキ、下の玉・ウキ止めゴム、オモリ、スナップ付サルカン、針付きハリス。リール本体・竿・リールに巻くメインライン全量・エサは含まない。
- `provides` 推奨：`rig, float, stopper, sinker, swivel, leader, hook`。針付きハリス等を別途購入させない。
- 公式図の接続：リールの道糸→仕掛け上端のチチワ→上のウキ止めゴム・玉→**中通し**遊動ウキ→下の玉・ウキ止めゴム→**中通しオモリ**→スナップ付サルカン→チチワ→50cmの針付きハリス。全長4mで、ウキ側3.5m＋針側0.5mの図。
- 公式図にはウキ1号・オモリ1号を明記。これは**ガン玉ではない**。HA176を初期候補にするなら、`float` の図・部品ラベルを「中通しウキ・中通しオモリ式」へ合わせる。ガン玉を必須にしない。
- 1号は公称オモリ/浮力の表示であり、ウキ自重・金具・エサまで含んだ投げ総重量ではない。ウキには発光体2.9mmを別売で装着可能とあるが、発光体は付属扱いにしない。

### HA230 小アジ専科 下カゴ飛ばしサビキセット

- 一次資料：[製品本文](https://www.hayabusa.co.jp/hayabusa/products/HA230/index.html)、[商品写真](https://www.hayabusa.co.jp/wp/wp-content/themes/hayabusa2019/web_img/him_img/HA230.png)、[公式仕掛け図](https://www.hayabusa.co.jp/wp/wp-content/themes/hayabusa2019/web_img/him_img/HA230_s.jpg)。代表写真は鈎6号・ハリス2号・幹糸4号。登録予定ASINの8-3の針仕様は本文の8号行で確認。
- 付属構成：飛ばしウキと遊動取付金具、上のウキ止め/玉、下のストッパー、接続用スナップ付サルカン、4本鈎サビキ、下端のタルサルカン・スナップオンリー、オモリ付き下カゴ。
- `provides` 推奨：`rig, float, stopper, swivel, basket, sinker`。サビキの枝糸・針は`rig`に含まれるため、独立の汎用針・リーダーを必須追加しない。
- 公式図の接続：道糸上のウキ止め/玉→**環付きウキを下端スイベルで遊動取付**→下ストッパー→スナップ付サルカン→4本鈎サビキ→タルサルカン・スナップ→下カゴ。**ウキ本体へ道糸を貫通させる描き方は一致しない**。
- 代表商品写真の公称表示は**ウキ10号・カゴ8号**。登録ASIN8-3のハードウェアまで同一と直接照合したわけではないため、厳密なバリエーション別数値は「シリーズ代表写真の値、同梱現品要確認」とする。実測投げ総重量は不明。

### HA240 天秤カゴ釣りセット リアルアミエビ＆カラ鈎2本

- 一次資料：[製品本文](https://www.hayabusa.co.jp/hayabusa/products/HA240/index.html)、[商品写真](https://www.hayabusa.co.jp/wp/wp-content/themes/hayabusa2019/web_img/him_img/HA240.png)、[公式仕掛け図](https://www.hayabusa.co.jp/wp/wp-content/themes/hayabusa2019/web_img/him_img/HA240_s.jpg)。代表商品写真は新アジ8号/カラ鈎2号・ハリス/幹糸3号。登録予定7/1-2-2は本文の7/1行で確認。
- 付属構成：環付き遊動ウキと取付部、上止め/玉、下ストッパー、タルサルカン、天秤・オモリ付きカゴ、スナップ付サルカン、2本鈎1mの針付きハリス（2セット）。
- `provides` 推奨：`rig, float, stopper, swivel, tenbin, basket, sinker, leader, hook`。別の天秤・カゴ・針・ハリスを強制追加しない。
- 公式図の接続：上止め/玉→**ウキを下端スイベルから遊動取付**→下ストッパー→タルサルカン→天秤の上側。天秤の縦側にカゴ、横腕の先のスナップ付サルカンから針仕掛け。針仕掛けは上側にリアルアミエビの枝鈎、下端にカラ鈎の2本で、各区間50cm。カラ鈎へ付けエサ、カゴへ撒きエサを用意する。
- 代表商品写真の公称表示は**オモリ8号・ウキ10号**。登録ASIN7/1のハードウェアまで個別照合したわけではないため、バリエーションの確定値として使う場合は現品または該当ASIN写真の照合が必要。投げ総重量は不明。
- 既存の1本針・オモリ付きサビキ下カゴ風のカゴ図を、そのままHA240の完成セット組立図として表示しない。少なくとも2本針と取付方向を合わせる。

### HA143 弾丸サヨリ3連シモリ

- 一次資料：[製品本文](https://www.hayabusa.co.jp/hayabusa/products/HA143/index.html)、[商品写真](https://www.hayabusa.co.jp/wp/wp-content/themes/hayabusa2019/web_img/him_img/HA143.png)、[公式仕掛け図](https://www.hayabusa.co.jp/wp/wp-content/themes/hayabusa2019/web_img/him_img/HA143_s.jpeg)。代表商品写真は針5号・ハリス1.2号。登録予定3.5-0.8は本文に針3.5号・ハリス0.8号・幹糸5号・JAN4993722862574・全長1mとある。
- **ロケットカゴが付属することを公式写真と図で確定**。未確認として除外されていた`basket`を提供部品に追加できる。
- 付属構成：上サルカン、パイプ付き弾丸飛ばしウキ、回転で撒きエサ量を調節するロケットカゴ、下サルカン、3連シモリ、自動ハリス止め、針付きハリス。写真にはスペア鈎3本付きの表記もある。
- `provides` 推奨：`rig, float, basket, swivel, leader, hook`。独立の中通しオモリ・ガン玉・遊動ウキ止めを必須にしない。3連シモリはこの専用セットのウキ部品に含める。
- 接続：リール道糸を上サルカンに結ぶ→パイプ付き弾丸飛ばしウキ→ロケットカゴ→下サルカン→3連シモリ→自動ハリス止め→針付きハリス。表層用の専用構造で、HA176と同じ「遊動ウキ・オモリ1号」図を流用しない。
- カゴは撒きエサ用、針は付けエサ用。両用途のエサ準備が必要。カゴの公称号数/実重量は確認できず、推測登録しない。

### 取扱データへの反映優先順位

1. HA176：オモリ種別を`splitshot`から`sliding`へ。HA176使用時にガン玉の重さ比較を適用しない。
2. HA143：`basket`と`swivel`を提供部品へ。サヨリの道具一覧に撒きエサを準備する導線を追加。
3. HA230/HA240：ウキスイベルを含む`stopper/float`セットとして図と付属品を反映。公称8/10号は出典・代表写真のバリエーションを明示。
4. HA240：2本針の仕掛け図へ変更、上の擬餌鈎と下の付けエサ鈎を区別。

### HA202 ちょいマジ堤防 カマスサビキセット

- 一次資料：[製品本文](https://www.hayabusa.co.jp/hayabusa/products/HA202/index.html)、[商品写真](https://www.hayabusa.co.jp/wp/wp-content/themes/hayabusa2019/web_img/him_img/HA202.png)、[公式仕掛け図](https://www.hayabusa.co.jp/wp/wp-content/themes/hayabusa2019/web_img/him_img/HA202_s.png)。
- 形状は**枝鈎4本の下端に棒状オモリ**。天秤式・コマセカゴ式ではない。ウキもない。底を取ってゆっくり巻く、またはリフト＆フォールの説明。
- 公式図に下オモリ**8号（約30g）**を明記。これは付属オモリの公称質量で、サビキ等を含む総投げ重量ではない。
- 付属構成：上サルカン、4本枝鈎の専用太ハリスサビキ、下端のサルカン/スナップ、棒状オモリ8号。仕掛け全長1.15m。本文は針9〜13号のバリエーションを記載。
- `provides` 推奨：`rig, swivel, sinker`。枝糸・擬餌鈎は`rig`に含める。`basket`・`bait`・`float`・`tenbin`を必須にしない。
- 商品写真の代表サイズは11号・ハリス4号・幹糸5号。採用するASINの針サイズは別途照合する。

## 最終実装監査で追加確認した一次資料（2026-11-01）

対象は `src/equipment.ts`、`src/rigs.ts`、`src/RigDiagram.tsx`、`src/data/method-products.json`。既存資料との明確な矛盾を確認し、未解決部分だけ外部資料を追加確認した。コードは本監査では編集していない。

### 冨士灯器 TYPE-L3 LG：発光体の取付順と公称負荷

- 一次資料：[セット製品本文](https://fujitoki.co.jp/353)、[公式パッケージ裏面・仕掛け方法](https://fujitoki.co.jp/wp-content/uploads/2023/03/cc8742511e6d13454d922d2f1602b6fd-1.jpg)、[公式付属品写真](https://fujitoki.co.jp/wp-content/uploads/2023/03/81a58d24d4deb604d4afe34e9bd32a64-5.jpg)。裏面のJANは4955458420534でTYPE-L3 LGに一致。
- 付属品は電気ウキ、シモリペット、リチウム電池、ウキ止めゴム、タル付オモリ、スパークライト/太刀魚75、からまん軸、クッションゴム2個、シングル・水平2本針の仕掛け各1。二つの針仕掛けは選択して一つずつ使用する。汎用のHA176中通しオモリ式を流用しない。
- **発光体はタル付オモリより道糸側**。裏面の説明⑤と図の両方で確認。発光体をオモリ下のハリスへ描く実装と、接続順「タル付オモリ→専用ハリス・発光体」は修正対象。
- 正しい概略順は、道糸→ウキ止め・シモリペット→環付き電気ウキ→からまん軸・クッション→発光体→タル付オモリ→仕掛け側スナップ→専用ハリス→針・キビナゴ。図では発光体の位置を上流へ移し、オモリとハリスの接続を保つ。
- 裏面上端の表にL3/L3LGの**オモリ3号**を明記。`technical.sinkerSize=3`を登録できる。これは仕掛け全体の実測重量ではない。
- セット本文の付属ウキはFF-14 LG。[FF-14 LG公式仕様](https://fujitoki.co.jp/271)では**適合オモリ3号**。現行[FF-14 I LG公式仕様](https://fujitoki.co.jp/225)も3号である。`technical.floatLoadSize=3`を登録できるが、ウキ本体質量・電池本数は両製品で異なるため、同一規格として転記しない。

### SASAME D-309：現在の3本枝針図の確認

- 一次資料：[波止際族のさぐり胴突（極太ハリス）D-309](https://www.sasame.co.jp/products/10563/)。全長90cm、3本鈎×2セット。針5号の行はハリス3号・モトス4号。
- 現在の胴付き3本枝針・下オモリ式はこの製品構造と一致する。下オモリは別途用意する。針5号の仕様値を追加する場合は、この製品個別ページを根拠にできる。

### 既存セットの注記と図の最終照合

- HA176のウキ1号・中通しオモリ1号、HA143のロケットカゴ付属は公式図で確定済み。「仕様へ未採用」「カゴ未確認」といった旧注記を公開商品詳細に残すと、現在の付属品データと矛盾するため更新対象。最終監査中にオーナーが注記の更新を反映したことを確認。
- ホッケNB602は2本枝針の投げ胴突、カマスHA202は4本枝針と8号棒状オモリ、HA240は上側擬餌鈎と下端付けエサ鈎の2本針として分岐済み。これらの現実装に追加の構造上の矛盾は確認しなかった。

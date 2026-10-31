# 全12釣法の道具選択

確認・実装日：2026-11-01。

30対象魚が持つ69通りの魚・釣法の組み合わせに商品選択を実装した。季節データの有無で選択画面を閉じない。全80商品候補はAmazonの個別ページへリンクする（アミ姫を付けエサ/コマセの用途別に扱うため、固有ASINは79件）。追加66候補は今回、既存14候補は2026-10-30の照合記録を使用。現在価格・在庫・実物の装着を保証するものではない。

## 画面の動作

- 魚と釣法を選び、必要な道具を一覧から選択する。最初は未選択。推奨商品は選択操作を代行しない。
- 必須品がそろうと構成確認へ進める。バケツ・プライヤー・玉網・保冷用品は用途に応じた推奨品。ヘチ/カゴなどの玉網、タチウオのプライヤーは必須とする。
- 完成セットを選ぶと、確認できた付属品を追加購入なしとして表示する。親セットを外すと付属状態も解除する。別商品を明示選択した場合は残し、重複を確認事項として表示する。
- セット由来の部品は価格へ二重計上しない。準備チェックも親セットに従う。未選択の推奨品は購入リストへ含めない。
- 魚・釣法ごとに構成を保存し、切り替えて戻ると復元する。保存はv3、v1/v2も読み込める。共有URL、再読込、ブラウザの戻る/進むに対応する。
- 図・表・凡例の対応を表示する。図の部品から選択画面へ進め、タッチ操作でホバーを残さない。推奨アクセサリーは一覧で選ぶ。持ち帰り用品は小型魚向け6.5Lと内寸幅56.5cmの32Lを区別し、魚と氷が収まるかを確認する。

## 釣法と構成

竿・リール・道糸・ライフジャケットは共通。以下は釣り方ごとの先端構成で、セットに含まれる部品を別に買う必要はない。

| 釣法 | 基本構成 | 個別の扱い |
|---|---|---|
| サビキ | サビキ → オモリ付き下カゴ、コマセ | ホッケ/ニシンはHS556。カマスはHA202の4本針 → 棒状オモリで、カゴ・コマセを使わない。 |
| 浮き釣り | HA176の上下ウキ止め・玉 → 中通しウキ → 中通しオモリ → サルカン → 針付きハリス | サヨリはHA143の飛ばしウキ・ロケットカゴ・3連シモリ。タチウオはTYPE-L3LGの環付き電気ウキ・発光体・タル付オモリ・専用針。 |
| ルアー釣り | PE → リーダー → スナップ → ルアー | ライトゲーム、カサゴ用ブレード、チニング用ポッパー、シーバス/小型青物等を分ける。 |
| 穴釣り | 道糸 → リーダー → ブラクリ、付けエサ | ブラクリの針と短いハリスを二重に追加しない。 |
| ぶっこみ釣り | 中通しオモリ → 保護ゴム → サルカン → ハリス付き針、エサ | 糸付き針のハリスは付属品に含める。 |
| 投げ釣り | 道糸 → 力糸 → オモリ付き天秤 → 2本針投げ仕掛け、エサ | ホッケはNB602投げ胴突 → 下端ナス型25号。天秤を追加しない。 |
| ちょい投げ釣り | 小型天秤・オモリ → 短い2本針仕掛け、エサ | K-017の天秤8号と仕掛けをセットとして扱う。 |
| 胴付き | 3本枝針のD-309 → 下オモリ、エサ | ナス型5/6号を別に選ぶ。 |
| 浮きサビキ | 遊動取付ウキ → 4本針HA230 → オモリ付き下カゴ、コマセ | 環付きウキの接続部を通し、ウキ本体を貫通させない。6号と8号を区別する。 |
| エギング | PE → リーダー → スナップ → エギ | アオリ/コウイカとツツイカのライトエギングで竿・糸・エギを分ける。 |
| ヘチ釣り | タイコリールの道糸 → ハリス → 針元ガン玉 → チヌ針・カニ | この例は直結。ヘチ竿・タイコリールをスピニング用品と混在させない。 |
| カゴ釣り | 遊動取付ウキ → 天秤・オモリ付きカゴ → 上の擬餌針＋下のエサ針 | HA240の2本針。撒きエサと付けエサを別に用意。 |

図は構造を示す模式図。サビキの一般図は針の本数を省略する。専用セットでは確認した枝針数・取付方式に合わせた。総重量や結び目の強度を図だけで保証しない。

## Web・Amazon照合

構造監査と一次資料は [rig-audit.md](research/rig-audit.md)。メーカー公式の仕掛け図・パッケージ裏面を確認した。Amazonでは初期表示に別サイズの説明が残る場合があり、選択されたサイズ・商品詳細・遷移後ASINを照合した。梱包重量をオモリ1個の重量として登録していない。廃番・矛盾する仕様の商品は候補から除外した。

原調査JSONは探索途中の候補・未確認事項・除外品も含む。実際に表示する確定候補は `src/data/method-products.json`、購入ASIN台帳は `src/data/amazon-products.json` を正とする。確認できなかった仕様・現物適合は商品詳細の注記に残す。

- [HA176中通しウキセット](https://www.hayabusa.co.jp/hayabusa/products/HA176/index.html)
- [HA143サヨリ専用](https://www.hayabusa.co.jp/hayabusa/products/HA143/index.html)
- [HA202カマスサビキ](https://www.hayabusa.co.jp/hayabusa/products/HA202/index.html)
- [HA230浮きサビキ](https://www.hayabusa.co.jp/hayabusa/products/HA230/)
- [HA240天秤カゴ](https://www.hayabusa.co.jp/hayabusa/products/HA240/)
- [TYPE-L3LG](https://fujitoki.co.jp/353)、[付属ウキの負荷](https://fujitoki.co.jp/271)
- [ホッケ投げ釣り](https://www.honda.co.jp/fishing/picture-book/hokke/trap01/)、[NB602](https://www.hayabusa.co.jp/hayabusa/products/NB602/)
- [D-309の3本針・個別規格](https://www.sasame.co.jp/products/10563/)

## 追加商品の台帳

全件、2026-11-01にAmazon商品・選択バリエーションを確認。購入URLはASINの個別ページに固定し、サイズ選択を保つ `th=1&psc=1` を付ける。

| 商品ID | 商品・規格 | ASIN | 仕様出典 |
|---|---|---|---|
| egi-k-30-005 | YAMASHITA エギ王K ベーシック 3.0号 005 ムラムラチェリー | [B07CWXSDRX](https://www.amazon.co.jp/dp/B07CWXSDRX?th=1&psc=1) | [出典](https://www.yamaria.co.jp/yamashita/product/detail/522) |
| rod-lurenist-68ls | DAIWA ルアーニスト 68L-S | [B07CZ62TMR](https://www.amazon.co.jp/dp/B07CZ62TMR?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/jif8hho) |
| rod-lurenist-86ml | DAIWA ルアーニスト 86ML | [B07CZ6Z5TN](https://www.amazon.co.jp/dp/B07CZ6Z5TN?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/jif8hho) |
| rod-lurenist-86m | DAIWA ルアーニスト 86M | [B07CZ67WKZ](https://www.amazon.co.jp/dp/B07CZ67WKZ?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/jif8hho) |
| rod-anazuri-m110 | DAIWA 穴釣り専科 M110 | [B083SF82FD](https://www.amazon.co.jp/dp/B083SF82FD?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/w7m7qxv) |
| reel-crest-lt2500 | DAIWA 20 クレスト LT2500 | [B089NGG3LC](https://www.amazon.co.jp/dp/B089NGG3LC?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/nwl7zus) |
| reel-chinumaster90 | DAIWA 19 チヌマスター90 | [B07MZX8H73](https://www.amazon.co.jp/dp/B07MZX8H73?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/hefba3b) |
| line-pe-x8-08 | Seaguar シーガー PE X8 150m 0.8号 マルチ | [B06X6FR6L8](https://www.amazon.co.jp/dp/B06X6FR6L8?th=1&psc=1) | [出典](https://www.seaguar.ne.jp/) |
| line-pe-lure-08 | Seaguar シーガー PEX8 ルアーエディション 150m 0.8号 | [B07NHCBCJ4](https://www.amazon.co.jp/dp/B07NHCBCJ4?th=1&psc=1) | [出典](https://www.seaguar.ne.jp/) |
| leader-yamatoyo-2 | YAMATOYO フロロショックリーダー 30m 2号 8lb クリア | [B002NPHMFQ](https://www.amazon.co.jp/dp/B002NPHMFQ?th=1&psc=1) | [出典](https://yamatoyo.com/products/fluoro-shock-leader/) |
| egi-k-35-005 | YAMASHITA エギ王K ベーシック 3.5号 005 ムラムラチェリー | [B078ZWQHQ8](https://www.amazon.co.jp/dp/B078ZWQHQ8?th=1&psc=1) | [出典](https://www.yamaria.co.jp/yamashita/) |
| egi-naory-18 | YAMASHITA NAORY レンジ ベーシック 1.8号 010 金アジ | [B0DTWZPR2S](https://www.amazon.co.jp/dp/B0DTWZPR2S?th=1&psc=1) | [出典](https://www.yamaria.co.jp/yamashita/product/detail/713) |
| rod-surf-25-420 | DAIWA リバティクラブ サーフT 25-420・K | [B00T4950YE](https://www.amazon.co.jp/dp/B00T4950YE?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/obywwcy) |
| rod-surf-20-360 | DAIWA リバティクラブ サーフT 20-360・K | [B00T494M2A](https://www.amazon.co.jp/dp/B00T494M2A?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/obywwcy) |
| rod-isokaze-4-53 | DAIWA リバティクラブ 磯風 4-53 遠投・K | [B00T4954UY](https://www.amazon.co.jp/dp/B00T4954UY?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/2023/05/09/09/55/d1jdu8h) |
| line-pitbull4-04 | SHIMANO ピットブル4 PL-M54R 150m 0.4号 ライムグリーン | [B079M5QW7Q](https://www.amazon.co.jp/dp/B079M5QW7Q?th=1&psc=1) | [出典](https://fish.shimano.com/ja-JP/product/line/generalpurpose/pe/a155f00000c53ktqab_p.html) |
| lure-jpm-3-glow | Major Craft ジグパラ マイクロ 3g #03 レッドゴールド | [B00NXP6UM6](https://www.amazon.co.jp/dp/B00NXP6UM6?th=1&psc=1) | [出典](https://www.majorcraft.co.jp/lure/jpm/) |
| float-kit-ha176-m | HAYABUSA コンパクトロッド カンタンウキ釣りセット 堤防用 HA176 M | [B01GG5DBQM](https://www.amazon.co.jp/dp/B01GG5DBQM?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/HA176/) |
| float-kit-ha176-l | HAYABUSA コンパクトロッド カンタンウキ釣りセット 堤防用 HA176 L | [B01GG5G17S](https://www.amazon.co.jp/dp/B01GG5G17S?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/HA176/) |
| burakuri-ve803-3 | SASAME VE803 ブラクリ 3号 | [B002NP8ESK](https://www.amazon.co.jp/dp/B002NP8ESK?th=1&psc=1) | [出典](https://www.sasame.co.jp/products/1567/) |
| sliding-sinker-daiichi-8 | 第一精工 ゴム管入りブッコミオモリ 8号 23108 | [B001HNKYFA](https://www.amazon.co.jp/dp/B001HNKYFA?th=1&psc=1) | [出典](https://www.daiichiseiko.com/) |
| sliding-sinker-daiichi-6 | 第一精工 ゴム管オモリ 長型 6号 | [B000AR6VF6](https://www.amazon.co.jp/dp/B000AR6VF6?th=1&psc=1) | [出典](https://www.daiichiseiko.com/) |
| tenbin-jet-25 | 富士工業 ジェット天秤 2JO25 25号 | [B000AQR33Q](https://www.amazon.co.jp/dp/B000AQR33Q?th=1&psc=1) | [出典](https://www.fujitackle.com/cms-fuji/wp-content/uploads/2023/04/2023_sinker_2.pdf) |
| gandama-fujiwara-black | フジワラ ゴムコートガン玉セット スタンダード 黒 | [B01MFDG16V](https://www.amazon.co.jp/dp/B01MFDG16V?th=1&psc=1) | [出典](https://fishing-fujiwara.com/product/gumcoatset_s/) |
| hook-chinu-aa302-3-15 | SASAME AA302 チヌ 黒 糸付 3号-1.5号 | [B00J3EV6O8](https://www.amazon.co.jp/dp/B00J3EV6O8?th=1&psc=1) | [出典](https://www.sasame.co.jp/) |
| rig-dozuki-d309-5 | SASAME D-309 波止際族のさぐり胴突 極太ハリス 5号 | [B07NVN1RCD](https://www.amazon.co.jp/dp/B07NVN1RCD?th=1&psc=1) | [出典](https://www.sasame.co.jp/products/10563/) |
| rig-kago-ha240-7 | HAYABUSA ひとっ飛び 天秤カゴ釣りセット リアルアミエビ＆カラ鈎2本 HA240 7/1-2-2 | [B00J3BEY4K](https://www.amazon.co.jp/dp/B00J3BEY4K?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/HA240/) |
| rig-uki-sabiki-ha230-6 | HAYABUSA 小アジ専科 下カゴ飛ばしサビキセット リアルアミエビ HA230 6-2 | [B00D3RLN62](https://www.amazon.co.jp/dp/B00D3RLN62?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/HA230/) |
| rig-uki-sabiki-ha230-8 | HAYABUSA 小アジ専科 下カゴ飛ばしサビキセット リアルアミエビ HA230 8-3 | [B00D3RLNHQ](https://www.amazon.co.jp/dp/B00D3RLNHQ?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/HA230/) |
| rig-sayori-ha143-35 | HAYABUSA サヨリ仕掛 弾丸サヨリ3連シモリ リール竿用 HA143 3.5-0.8 | [B01HT91DIC](https://www.amazon.co.jp/dp/B01HT91DIC?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/HA143/index.html) |
| bait-power-isome-blue-thick | マルキユー パワーイソメ 太 青イソメ | [B004XV0MD2](https://www.amazon.co.jp/dp/B004XV0MD2?th=1&psc=1) | [出典](https://www.marukyu.com/) |
| bait-oki-hard-m | マルキユー くわせオキアミ スーパーハード M | [B00LGDBWNO](https://www.amazon.co.jp/dp/B00LGDBWNO?th=1&psc=1) | [出典](https://www.marukyu.com/) |
| rod-hechi-bjx270 | DAIWA BJスナイパー ヘチX XH-270 | [B083QHVD81](https://www.amazon.co.jp/dp/B083QHVD81?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/2023/05/09/09/31/75iji6s) |
| leader-yamatoyo-15 | YAMATOYO フロロショックリーダー 30m 1.5号 6lb クリア | [B002NPJP5Q](https://www.amazon.co.jp/dp/B002NPJP5Q?th=1&psc=1) | [出典](https://yamatoyo.com/products/fluoro-shock-leader/) |
| leader-yamatoyo-4 | YAMATOYO フロロショックリーダー 20m 4号 16lb クリア | [B002NPFKG4](https://www.amazon.co.jp/dp/B002NPFKG4?th=1&psc=1) | [出典](https://yamatoyo.com/products/fluoro-shock-leader/) |
| leader-yamatoyo-5 | YAMATOYO フロロショックリーダー 20m 5号 20lb クリア | [B002NPHMKQ](https://www.amazon.co.jp/dp/B002NPHMKQ?th=1&psc=1) | [出典](https://yamatoyo.com/products/fluoro-shock-leader/) |
| lure-jps-20 | Major Craft ジグパラ ショート20g #01 イワシ | [B00JRT99KW](https://www.amazon.co.jp/dp/B00JRT99KW?th=1&psc=1) | [出典](https://www.majorcraft.co.jp/lure/jps/) |
| lure-rapala-cd9 | Rapala カウントダウン CD9 P パーチ | [B001NXC95M](https://www.amazon.co.jp/dp/B001NXC95M?th=1&psc=1) | [出典](https://rapala.co.jp/cn4/cn5/cd.html) |
| lure-chinu-rise50 | SHIMANO ブレニアス ライズポップ50F OP-150Q 015 キョウリンレッドヘッド | [B08VMTLDPC](https://www.amazon.co.jp/dp/B08VMTLDPC?th=1&psc=1) | [出典](https://fish.shimano.com/ja-JP/product/lure/bream/topwater/a155f00000c5ctuqaf_p.html) |
| snap-owner-00 | OWNER P-02 クイックスナップ #00 | [B000BSAWS6](https://www.amazon.co.jp/dp/B000BSAWS6?th=1&psc=1) | [出典](https://www.owner.co.jp/search/1970/) |
| net-lsfc500 | Major Craft ファーストキャスト ランディングシャフト ネットセット LSFC-500 | [B0BDRL3VFK](https://www.amazon.co.jp/dp/B0BDRL3VFK?th=1&psc=1) | [出典](https://www.majorcraft.co.jp/other_items/lsfc/) |
| cooler-minicool2-s650 | DAIWA ミニクール2 S650 パステルグリーン | [B0GFL71WXV](https://www.amazon.co.jp/dp/B0GFL71WXV?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/2ya8o4q) |
| reel-crest-lt2000 | DAIWA 20 クレスト LT2000 | [B089NLF95Y](https://www.amazon.co.jp/dp/B089NLF95Y?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/nwl7zus) |
| reel-crest-lt4000 | DAIWA 20 クレスト LT4000-C | [B089N6JZJW](https://www.amazon.co.jp/dp/B089N6JZJW?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/nwl7zus) |
| pliers-staincore190 | DAIWA ステンコアプライヤー 190H ブラック | [B08ZSM87SF](https://www.amazon.co.jp/dp/B08ZSM87SF?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/trk81yk) |
| chum-amihime | マルキユー アミ姫 600g（寄せエサ用） | [B0711KFYX7](https://www.amazon.co.jp/dp/B0711KFYX7?th=1&psc=1) | [出典](https://www.marukyu.com/product/1944/) |
| rig-choi-k017-6 | SASAME K-017 ちょい投げセット 針6号・オモリ8号 | [B003UDR7AU](https://www.amazon.co.jp/dp/B003UDR7AU?th=1&psc=1) | [出典](https://www.sasame.co.jp/products/742/) |
| lure-riseblade-10 | SHIMANO ソアレ ライズショットブレード10g JJ-210U 014 ヒモカガミ | [B0FHH5VNDR](https://www.amazon.co.jp/dp/B0FHH5VNDR?th=1&psc=1) | [出典](https://fish.shimano.com/ja-JP/product/lure/lightgame/jig_vibration_blade/a155f00000c6difqa3_p.html) |
| rig-choi-k017-10 | SASAME K-017 ちょい投げセット 針10号・オモリ8号 | [B003B8G0D4](https://www.amazon.co.jp/dp/B003B8G0D4?th=1&psc=1) | [出典](https://www.sasame.co.jp/products/742/) |
| rig-kago-ha240-9 | HAYABUSA ひとっ跳び 天秤カゴ釣りセット HA240 9/3-4-4 | [B00J3BEZ0S](https://www.amazon.co.jp/dp/B00J3BEZ0S?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/HA240/) |
| shock-surf-caster-3-12 | DAIWA サーフキャスターちから糸(R) クリア 3-12号 15m×5本 | [B001HYAZF8](https://www.amazon.co.jp/dp/B001HYAZF8?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/2023/05/09/09/43/iuoxqmh) |
| rig-kisu-k001-7 | SASAME K-001 ちょい投げ2本鈎 7号-1.5号 | [B00I1AS2S8](https://www.amazon.co.jp/dp/B00I1AS2S8?th=1&psc=1) | [出典](https://www.sasame.co.jp/products/736/) |
| rig-karei-nt364-12 | HAYABUSA 投げの達人 速潮カレイ 全身レッド NT364 12-4 | [B002NPF8NO](https://www.amazon.co.jp/dp/B002NPF8NO?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/NT364/index.html) |
| sinker-nasu-daiichi-5 | 第一精工 パックオモリ(小袋入) ナス型 5号 23045 | [B000AR6WIW](https://www.amazon.co.jp/dp/B000AR6WIW?th=1&psc=1) | [出典](https://www.daiichiseiko.com/pricerevision/img/pricerevision.pdf) |
| sinker-nasu-daiichi-6 | 第一精工 パックオモリ(小袋入) ナス型 6号 23046 | [B000AR6WJ6](https://www.amazon.co.jp/dp/B000AR6WJ6?th=1&psc=1) | [出典](https://www.daiichiseiko.com/pricerevision/img/pricerevision.pdf) |
| swivel-nt-8 | NTスイベル タル型サルカン クロ #8 | [B007JJS21O](https://www.amazon.co.jp/dp/B007JJS21O?th=1&psc=1) | [出典](https://www.amazon.co.jp/dp/B007JJS21O?th=1&psc=1) |
| bait-power-crab-black-m | マルキユー パワークラブ M 黒ガニ | [B07FQ1SSGT](https://www.amazon.co.jp/dp/B07FQ1SSGT?th=1&psc=1) | [出典](https://www.marukyu.com/product/1111/) |
| bait-kibinago | マルキユー くわせきびなご 60g | [B0F4D2TSNT](https://www.amazon.co.jp/dp/B0F4D2TSNT?th=1&psc=1) | [出典](https://www.marukyu.com/product/1150/) |
| hook-owner-maruseigo-13-3 | OWNER OH 白丸せいご 糸付 13号-3 20607 | [B000AR25KG](https://www.amazon.co.jp/dp/B000AR25KG?th=1&psc=1) | [出典](https://www.owner.co.jp/search/1143/) |
| float-tachiuo-l3lg | 冨士灯器 こだわり太刀魚仕掛けセット TYPE-L3 LG | [B00V5M80ZY](https://www.amazon.co.jp/dp/B00V5M80ZY?th=1&psc=1) | [出典](https://fujitoki.co.jp/353) |
| rig-hokke-nb602-12 | HAYABUSA 投げ カレイ・アブラコ・ホッケ 胴突式3セット NB602 12号-3 | [B00GAUW39K](https://www.amazon.co.jp/dp/B00GAUW39K?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/NB602/) |
| rig-hokkaido-hs556-6 | HAYABUSA ホッケ・サバ・ニシン オーロラフィルム＆緑ウーリー6本鈎 HS556 6号-2 | [B01M9FCUD7](https://www.amazon.co.jp/dp/B01M9FCUD7?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/30106/index.html) |
| sinker-nasu25 | 第一精工 パックオモリ(小袋入) ナス型 25号 23078 | [B000AR6WMS](https://www.amazon.co.jp/dp/B000AR6WMS?th=1&psc=1) | [出典](https://www.daiichiseiko.com/pricerevision/img/pricerevision.pdf) |
| cushion-toho-2200 | 東邦産業 N.T.うきゴム ヘッダー式 2200 | [B008ULQ9VA](https://www.amazon.co.jp/dp/B008ULQ9VA?th=1&psc=1) | [出典](https://www.amazon.co.jp/dp/B008ULQ9VA?th=1&psc=1) |
| rig-kamasu-ha202-10 | HAYABUSA ちょいマジ堤防 カマスサビキセット HA202 10号/4-5 | [B0DTYDZ5KK](https://www.amazon.co.jp/dp/B0DTYDZ5KK?th=1&psc=1) | [出典](https://www.hayabusa.co.jp/hayabusa/products/HA202/index.html) |
| cooler-lighttrunk-s3200 | DAIWA ライトトランクα S3200 ブルー | [B083WGRWJP](https://www.amazon.co.jp/dp/B083WGRWJP?th=1&psc=1) | [出典](https://www.daiwa.com/jp/product/twjlq4i) |

# 魚のイラストの描画基準

掲載する30項目すべてを、内蔵の画像生成ツールで魚種別の写実イラストとして新規制作した。ぬれた体表の光沢、銀色や青緑の反射、うろこの立体感、ひれの透け方を描き、明るく自然な色と光で、生きた魚に出会う魅力を伝える。外部の図鑑画像の転載・トレースは行っていない。複数種をまとめた項目は下表の代表種を描く。色彩には個体差・環境・成長による変化があり、各図の縮尺は共通ではない。

魚の選択カードと釣り方の概要は `FishArtwork` を共用する。旧 `FishIllustration` も同じ描画を呼び出し、古い3種類の図が残らないようにした。

## 制作と配信

- 生成方法：内蔵 `image_gen`。魚種ごとの個別プロンプトで生成し、必要な形態修正も同じツールで行った。
- 生成指示の全文：`docs/fish-artwork-prompts.json`。
- 配信用画像：`public/images/fish/{魚ID}.webp`。30枚すべて背景の透明度を保ち、1200 × 800ピクセルに揃えた。
- 画像一覧とハッシュ：`public/images/fish/manifest.json`。
- 配信変換：`scripts/prepare-fish-artwork.mjs`。生成PNGの透明度を検査し、構図を変えずに余白と縮小、WebPへの符号化だけを行う。元のPNGはワークスペースの無視対象キャッシュにも保存する。
- スマートフォンでも魚を大きく見せるため、カード上部にイラストを配置。遅延読み込みとWebPで読み込み量を抑える。

## 代表種と確認資料

| 掲載項目 | 描画する代表種・段階 | 主に描き分けた形態 | 参照資料 |
| --- | --- | --- | --- |
| アジ | マアジ | 二つの背びれ、長い胸びれ、尾側のゼイゴ、えらぶたの斑点 | [Honda](https://www.honda.co.jp/fishing/picture-book/maaji/) |
| サバ | マサバ | 紡錘形、背中の波状紋、尾の前の小離鰭 | [Honda](https://www.honda.co.jp/fishing/picture-book/masaba/) |
| イワシ | マイワシ | 細長い銀色の体、背びれ1基、体側の黒点列 | [Honda](https://www.honda.co.jp/fishing/picture-book/maiwashi/) |
| マダイ | マダイ | 高い体、赤い体色、青い小斑点、連続した棘状の背びれ | [Honda](https://www.honda.co.jp/fishing/picture-book/madai/) |
| ブリの若魚 | イナダ・ハマチ | 流線形、黄色い縦帯、短い胸びれ、二叉した尾 | [Honda](https://www.honda.co.jp/fishing/picture-book/buri/) |
| ヒラメ | ヒラメ | 左の有眼面、両眼、大きな口と歯、上下の長いひれ、丸みのある尾 | [Honda](https://www.honda.co.jp/fishing/picture-book/hirame/) |
| カレイ | マコガレイ | 右の有眼面、小さな口、丸い楕円形の体と尾 | [Honda](https://www.honda.co.jp/fishing/picture-book/makogarei/) |
| ツツイカ | ヤリイカ | 細い外套、後半の三角形のひれ、8腕と2触腕 | [Honda](https://www.honda.co.jp/fishing/picture-book/yariika/) |
| スズキ | スズキ | 大きな口、下あご、分かれた背びれ、銀灰色の体 | [Honda](https://www.honda.co.jp/fishing/picture-book/suzuki/) |
| サワラの若魚 | サゴシ | 細長い体、尖った口、体側の暗色斑、小離鰭 | [Honda](https://www.honda.co.jp/fishing/picture-book/sawara/) |
| マアナゴ | マアナゴ | 長い体、連続するひれ、胸びれ、白い点列、腹側の淡色 | [Honda](https://www.honda.co.jp/fishing/picture-book/anago/) |
| カンパチの若魚 | ショゴ・シオ | ブリより高い体、目を通る斜帯、黄色い縦帯 | [Honda](https://www.honda.co.jp/fishing/picture-book/kanpachi/) |
| ホッケ | ホッケ | 長い背びれ、斑紋、大きな胸びれ、浅く切れ込む尾 | [Honda](https://www.honda.co.jp/fishing/picture-book/hokke/) |
| ニシン | ニシン | 銀色の体、背びれ1基、深い二叉尾、黒点列を付けない | [北海道立総合研究機構『底魚資源管理支援マニュアル』p.13](https://www.hro.or.jp/upload/35263/manual2018a.pdf) |
| カワハギ | カワハギ | 菱形の体、おちょぼ口、高い目、背の1本の長い棘、扇形の尾 | [Honda](https://www.honda.co.jp/fishing/picture-book/kawahagi/) |
| タチウオ | タチウオ | 薄い帯状の銀色の体、長い背びれ、牙、糸状に細くなる尾端。二叉尾を付けない | [Honda](https://www.honda.co.jp/fishing/picture-book/tachiuo/) |
| シロギス | シロギス | 細い淡色の体、小さな下向きの口、二つの背びれ | [Honda](https://www.honda.co.jp/fishing/picture-book/shirogisu/) |
| メバル | アカメバル | 大きな目、高い体、大きな胸びれ、棘のある背びれ | [Honda](https://www.honda.co.jp/fishing/picture-book/mebaru/) |
| カサゴ | カサゴ | 凹凸のある大きな頭、赤褐色のまだら、棘、丸い胸びれと尾 | [Honda](https://www.honda.co.jp/fishing/picture-book/kasago/) |
| クロダイ | クロダイ | 高い銀灰色の体、暗い縞、棘のある連続した背びれ | [Honda](https://www.honda.co.jp/fishing/picture-book/kurodai/) |
| アオリイカ | アオリイカ | 胴のほぼ全長に及ぶ幅広い半円形のひれ、透明感、8腕と2触腕 | [Honda](https://www.honda.co.jp/fishing/picture-book/aoriika/) |
| コウイカ | コウイカ | 丸く幅広い外套、細い縁状のひれ、霜降り状の模様と暗色斑、W形の瞳孔、8腕と2触腕 | [YAMASHITA](https://www.yamaria.co.jp/yamashita/support/detail/39)・[マリンピア日本海](https://www.marinepia.or.jp/picturebook/invertebrate/entry-11320.html) |
| シマアジ | シマアジの若魚 | 高い体、黄色い縦帯、長い鎌形の胸びれ、えらの黒斑、ゼイゴ | [Honda](https://www.honda.co.jp/fishing/picture-book/shimaaji/) |
| イサキ | ウリボウ | 黄褐色の体、若魚の3本の暗い縦帯 | [Honda](https://www.honda.co.jp/fishing/picture-book/isaki/) |
| ハゼ | マハゼ | 底に沿う体形、高い目、二つの背びれ、大きな胸びれ、丸い尾 | [Honda](https://www.honda.co.jp/fishing/picture-book/mahaze/) |
| ボラ | ボラ | 鈍い頭、小さな口、大きな鱗、体側の細い線、離れた二つの背びれ | [Honda](https://www.honda.co.jp/fishing/picture-book/bora/) |
| アイナメ | アイナメ | 細長いまだらの体、長い背びれ、大きな胸びれ、浅い尾の縁 | [Honda](https://www.honda.co.jp/fishing/picture-book/ainame/) |
| サヨリ | サヨリ | 細い体、下あごだけが長く赤い先端、尾寄りの背びれ・尻びれ | [Honda](https://www.honda.co.jp/fishing/picture-book/sayori/) |
| カマス | アカカマス | 長い体、大きく尖った口、離れた二つの背びれ | [Honda](https://www.honda.co.jp/fishing/picture-book/kamasu/) |
| メジナ | メジナ（口太） | 高く丸い暗緑色の体、小さな口、連続する背びれ | [Honda](https://www.honda.co.jp/fishing/picture-book/mejina/) |

## 表示の確認

サワラの小離鰭は[水産庁の生態資料](https://www.jfa.maff.go.jp/j/gyoko_gyozyo/g_thema/pdf/sub40b.pdf)、コウイカ類の瞳孔は[函館市のイカマイスター資料](https://marine-hakodate.jp/ikamai/pdf/dai7kai.pdf)も参照した。

`node --test scripts/fish-artwork-assets.test.mjs` で全30項目のファイルとハッシュ、画像の重複・欠落、透明度を確認する。`tests/fish-artwork.spec.ts` でカタログ全30項目との対応と画像読み込み、代表6項目の釣り方概要への表示、画像の比率維持と描画枠への収まり、デスクトップとスマートフォンでの横方向のはみ出しを確認する。実際の表示画像を集めた一覧を `artifacts/screenshots/fish-artwork-realistic-30.png` に保存し、魚種ごとの特徴や、目・ひれ・腕などの形態も目視確認する。

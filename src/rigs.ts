import { products, type CategoryId } from './catalog';
import type { FishingBuild } from './domain';
import { coveringProduct, equipmentFor, equipmentProfile } from './equipment';

export type RigId = 'sabiki' | 'float' | 'lure' | 'hole' | 'bukkomi' | 'nage' | 'choi-nage' | 'dozuki' | 'uki-sabiki' | 'eging' | 'hechi' | 'kago';
export type RigPartId = CategoryId | 'float' | 'stopper' | 'sinker' | 'leader' | 'swivel' | 'hook' | 'tenbin' | 'snap' | 'lure' | 'egi' | 'burakuri' | 'cushion' | 'shock';
export type PartState = 'missing' | 'selected' | 'owned' | 'included';
export interface RigPart { id: RigPartId; label: string; description: string; category?: CategoryId }
export interface RigDefinition {
  id: RigId; name: string; variant: string; summary: string; connection: string[];
  parts: RigPart[]; sources: { title: string; url: string }[]; note?: string;
}
const part = (id: RigPartId, label: string, description: string, category: CategoryId = id): RigPart => ({ id, label, description, category });
const rod = part('rod', 'ロッド', '仕掛けを操作し、魚を引き寄せる竿。釣り方に合った長さ・負荷を選びます。', 'rod');
const reel = part('reel', 'リール', '糸を巻き取り、送り出す道具。図は形のイメージです。', 'reel');
const line = part('line', 'メインライン', 'リールから竿のガイドを通って、仕掛けまでつながる道糸です。', 'line');
const leader = part('leader', 'ハリス・リーダー', '道糸と針・ルアーの間をつなぐ糸。摩擦への強さや太さを合わせます。');
const swivel = part('swivel', 'サルカン', '糸同士をつなぎ、糸のヨレを軽減する小さな金具です。');
const hook = part('hook', '針', 'エサを付けて魚を掛ける部分。魚に合わせた大きさを使います。');
const sinker = part('sinker', 'オモリ', '仕掛けを沈める重り。竿の負荷と釣り場に合わせて選びます。');
const float = part('float', 'ウキ', '狙う深さを保ち、魚が食いついた反応を水面で知らせます。');
const stopper = part('stopper', 'ウキ取付セット', 'ウキ止め・シモリ玉・ウキスイベル・下側のストッパー。採用するウキの取付方式に合わせます。');
const tenbin = part('tenbin', '天秤', 'オモリと針の付いた糸を離し、絡まりを減らす金具です。');
const snap = part('snap', 'スナップ', 'ルアーなどを取り替えやすくする接続金具です。');
const bait = part('bait', 'エサ', '針に付けるエサ。魚や釣り方に合わせて準備します。', 'bait');
const chum = part('bait', 'エサ・コマセ', 'カゴに詰めて魚を寄せるエサ。図の粒とパックは同じエサを表します。', 'bait');
const bucket = part('bucket', 'バケツ', '手洗い・道具洗いなどの準備品。吊り下げ水くみは対応製品だけで行います。', 'bucket');
const safety = part('safety', 'ライフジャケット', '体格と利用環境に合うものを着用します。仕掛けとは別の準備品です。', 'safety');
const sabiki = part('rig', 'サビキ仕掛け', '幹糸から枝分かれした擬餌針で魚を掛けます。針の本数は省略しています。', 'rig');
const basket = part('basket', 'サビキカゴ', 'コマセを入れる下カゴ。図はオモリ付きのタイプです。', 'basket');
const common = [rod, reel, line];
const extras = [bucket, safety];
const honda = (slug: string, title: string) => ({ title: `Honda釣り倶楽部｜${title}`, url: `https://www.honda.co.jp/fishing/picture-book/${slug}/trap01/` });
const sabikiSource = { title: 'DAIWA｜サビキ仕掛けで釣る', url: 'https://www.daiwa.com/jp/beginner/place/sabiki' };
const castSource = honda('shirogisu', 'シロギスの仕掛け');

/** Original diagrams of representative rigs, not scaled assembly instructions or product specifications. */
export const rigs: RigDefinition[] = [
  { id: 'sabiki', name: 'サビキ釣り', variant: '足元・下カゴ式', summary: '枝分かれした擬餌針の下に、コマセを入れるカゴ。足元へ下ろす基本形です。', connection: ['道糸', 'サビキ仕掛け', 'オモリ付き下カゴ'], parts: [...common, sabiki, basket, chum, ...extras], sources: [sabikiSource] },
  { id: 'float', name: '浮き釣り', variant: '中通し遊動ウキ・完成セット式', summary: 'ウキ止めで深さを決め、中通しウキとオモリ、その先のハリス・針で魚を誘います。', connection: ['道糸', 'ウキ止め・玉', '中通しウキ', '下側の玉・ストッパー', '中通しオモリ', 'サルカン', 'ハリス・針・エサ'], parts: [...common, stopper, float, part('sinker','中通しオモリ','完成セットに付属する中通しオモリ。図は1号ウキ・1号オモリのHA176の基本形です。'), swivel, leader, hook, bait, ...extras], sources: [{ title: 'HAYABUSA｜HA176 完成ウキ釣りセット', url: 'https://www.hayabusa.co.jp/hayabusa/products/HA176/' }] },
  { id: 'lure', name: 'ルアー釣り', variant: 'PE＋リーダー・ミノーの例', summary: '道糸にリーダーを結び、先端のルアーを動かして誘うシンプルな形です。', connection: ['PEの道糸', 'リーダー', 'スナップ', 'ルアー'], parts: [...common, leader, snap, part('lure', 'ルアー', '小魚などに似せた疑似餌。図はミノーの例で、針もルアーの一部として表示します。'), ...extras], sources: [honda('suzuki', 'スズキの仕掛け')] },
  { id: 'hole', name: '穴釣り', variant: 'ブラクリ式', summary: 'オモリと針が近いブラクリを、岩などの隙間へそっと下ろします。', connection: ['道糸', 'リーダー', 'ブラクリ', 'エサ'], parts: [...common, leader, part('burakuri', 'ブラクリ', 'オモリと短いハリス・針を組み合わせた仕掛けです。'), bait, ...extras], sources: [honda('kasago', 'カサゴのブラクリ釣り')], note: '図は立ち入れる場所から下ろすイメージです。消波ブロックへの立ち入りを勧めるものではありません。' },
  { id: 'bukkomi', name: 'ぶっこみ釣り', variant: '中通しオモリ式', summary: '道糸を通したオモリの先に、ハリスと針。底へ届けて反応を待つ形です。', connection: ['道糸', '中通しオモリ', '保護ゴム', 'サルカン', 'ハリス', '針・エサ'], parts: [...common, part('sinker', '中通しオモリ', '中心に道糸を通すオモリ。糸が穴を通って動く遊動式を描いています。'), part('cushion', '保護ゴム', 'オモリが結び目へ直接当たるのを防ぐためのゴム管です。'), swivel, leader, hook, bait, ...extras], sources: [honda('unagi', 'ブッコミ釣り')] },
  { id: 'nage', name: '投げ釣り', variant: '力糸＋天秤式', summary: '投げる負荷に備える力糸と、天秤・投げ仕掛けを組み合わせた例です。', connection: ['道糸', '力糸', '天秤・オモリ', '投げ仕掛け', 'エサ'], parts: [...common, part('shock', '力糸', '投げる瞬間の負荷を受ける、先端側の太い糸です。'), tenbin, sinker, part('rig', '投げ仕掛け', '天秤から先へ延びる幹糸・枝糸・針の組み合わせ。図は2本針の例です。'), bait, ...extras], sources: [castSource], note: '投げ釣りとちょい投げは構造が似ています。竿・糸・オモリの仕様や投げる負荷が異なります。' },
  { id: 'choi-nage', name: 'ちょい投げ釣り', variant: '小型天秤・2本針の例', summary: '小型の天秤と短めの投げ仕掛けで、近い範囲の底を探る形です。', connection: ['道糸', '小型天秤・オモリ', '短い投げ仕掛け', 'エサ'], parts: [...common, tenbin, sinker, part('rig', 'ちょい投げ仕掛け', '取り回しやすい短めの仕掛け。図は2本針の例です。'), bait, ...extras], sources: [castSource, { title: '浜田商会｜投げ釣り入門', url: 'https://www.hamadashokai.co.jp/tsurinyumon/nage.html' }], note: '近距離でも、投げる総重量が竿の適合範囲に収まるか確認します。' },
  { id: 'dozuki', name: '胴付き', variant: '枝針3本・下オモリ式', summary: '幹糸からエサ付きの針が枝分かれし、一番下にオモリが付きます。', connection: ['道糸', '胴付き仕掛け', '下オモリ'], parts: [...common, part('rig', '胴付き仕掛け', '幹糸と枝分かれした針のセット。下オモリで底を取り、エサを底から浮かせます。'), sinker, bait, ...extras], sources: [{ title: 'マルシン漁具｜かんたん五目胴突仕掛けセット', url: 'https://www.mr-dragon.jp/products/sea-fishing/fishing-gear/9936/' }] },
  { id: 'uki-sabiki', name: '浮きサビキ', variant: '遊動ウキ＋下カゴ式', summary: 'サビキの上にウキを加え、針とカゴを狙う深さに保ちます。', connection: ['道糸', 'ウキ止め・玉', 'ウキ', 'サビキ仕掛け', 'オモリ付き下カゴ'], parts: [...common, stopper, float, sabiki, basket, chum, ...extras], sources: [sabikiSource, { title: 'HAYABUSA｜HA230 下カゴ飛ばしサビキセット', url: 'https://www.hayabusa.co.jp/hayabusa/products/HA230/' }] },
  { id: 'eging', name: 'エギング', variant: 'PE＋リーダー・エギ式', summary: 'PEの道糸からリーダー、スナップ、エギへ。先端の傘針でイカを掛けます。', connection: ['PEの道糸', 'リーダー', 'スナップ', 'エギ'], parts: [...common, leader, snap, part('egi', 'エギ', 'エビに似せた疑似餌。先端側のオモリと尾側の傘針を持つ形です。'), ...extras], sources: [honda('aoriika', 'アオリイカのエギング')] },
  { id: 'hechi', name: 'ヘチ釣り', variant: 'タイコリール・ガン玉式', summary: 'ウキを使わず、軽いオモリとエサを壁際へ自然に落とす形です。', connection: ['道糸', 'ハリス', '針元のガン玉', '針・エサ'], parts: [...common, leader, part('sinker', 'ガン玉', '針元に打つ小さなオモリ。潮やエサに合わせ、沈み方を調節します。'), hook, bait, ...extras], sources: [honda('kurodai', 'クロダイの落とし込み釣り'), { title: 'つり人｜クロダイのヘチ釣り・針とガン玉', url: 'https://web.tsuribito.co.jp/beginner/kurodai-hechi-fishing-guide' }] },
  { id: 'kago', name: 'カゴ釣り', variant: '遊動ウキ・天秤カゴ式', summary: 'ウキの下にコマセカゴと天秤。長いハリスの先の付けエサで魚を掛けます。', connection: ['道糸', 'ウキ止め・玉', 'ウキ', '天秤・カゴ', 'ハリス', '針・付けエサ'], parts: [...common, stopper, float, tenbin, part('basket', 'コマセカゴ', '寄せエサを入れるカゴ。図は天秤と組み合わせるオモリ付きの例です。'), leader, hook, part('bait', 'コマセ・付けエサ', 'カゴの寄せエサと針の付けエサ。図では同じ色で位置を示します。', 'bait'), ...extras], sources: [{title:'HAYABUSA｜HA240 天秤カゴ釣りセット',url:'https://www.hayabusa.co.jp/hayabusa/products/HA240/'},honda('isaki', 'イサキのカゴ釣り')] },
];

export const rigById = (id: string) => rigs.find(r => r.id === id);
export function rigForBuild(build:FishingBuild):RigDefinition {
  const rig=rigById(build.methodId)||rigById('sabiki')!;
  const equipment=equipmentFor(build),profile=equipmentProfile(build);
  const selectedLure=products.find(p=>p.id===build.selection.lure);
  const variant=profile==='light-game'?'小型メタルジグ':profile==='rock-game'?'ブレード付きルアー':profile==='chinning'?'チヌ用ポッパー':profile==='shore-lure'?(selectedLure?.id==='lure-rapala-cd9'?'ミノー':'メタルジグ'):profile==='hokke-cast'?'ホッケ用投げ胴突式':profile==='light-eging'?'小型イカ・ライトエギング':profile==='sayori-float'?'サヨリ用完成仕掛け':profile==='tachiuo-float'?'タチウオ用完成仕掛け':profile==='kamasu-sabiki'?'カマス用サビキ':rig.variant;
  let components=rig.parts;
  let connection=rig.connection;
  let summary=rig.summary;
  let sources=rig.sources;
  if(profile==='light-eging') summary='小型のツツイカに合わせ、軽いエギと細いPE・リーダーを使うライトエギングの構成です。';
  if(profile==='hokke-cast') {components=[...common,part('shock','力糸','投げる負荷に備えるテーパー力糸。上端サルカンへ接続します。'),part('rig','投げ胴突仕掛け','2本枝針のホッケ用投げ仕掛け。天秤は使いません。'),sinker,bait,...extras];connection=['道糸','力糸','上端サルカン','投げ胴突2本針','下端スナップ','ナス型オモリ'];summary='ホッケ対応の投げ胴突仕掛けを使用します。枝針の下にオモリを接続し、天秤は加えません。';sources=[{title:'Honda釣り倶楽部｜ホッケの投げ釣り',url:'https://www.honda.co.jp/fishing/picture-book/hokke/trap01/'},{title:'HAYABUSA｜NB602 投げ胴突式',url:'https://www.hayabusa.co.jp/hayabusa/products/NB602/'}];}
  if(build.methodId==='lure') {summary=`道糸からリーダーとスナップを通し、${variant}を接続する構成です。疑似餌の重量と対象魚を確認します。`;if(selectedLure) sources=[{title:`${selectedLure.brand}｜${selectedLure.name}`,url:selectedLure.sourceUrl},...sources];}
  if(profile==='kamasu-sabiki') {components=[...common,part('rig','カマス専用サビキ','カマス用の4本枝針仕掛け。コマセは使いません。'),part('sinker','棒状オモリ','完成セットに付属する下オモリ。カゴではありません。'),...extras];connection=['道糸','上サルカン','カマス専用4本針','下スナップ','棒状オモリ'];summary='4本の擬餌針の下に棒状オモリを付け、投げてカマスの群れを探る専用サビキです。カゴ・コマセは使いません。';sources=[{title:'HAYABUSA｜HA202 カマス専用サビキ',url:'https://www.hayabusa.co.jp/hayabusa/products/HA202/'}];}
  if(profile==='sayori-float') {components=[...common,float,part('basket','ロケットカゴ','寄せエサを入れる軽いロケットカゴ。独立した下オモリは使いません。'),swivel,leader,hook,part('chum','コマセ','ロケットカゴへ入れる寄せエサです。'),bait,...extras];connection=['道糸','サルカン','飛ばしウキ','ロケットカゴ','サルカン','3連シモリ','自動ハリス止め','ハリス・針・エサ'];summary='飛ばしウキとロケットカゴの先に3連シモリ。表層の反応を見ながら、小針に付けたエサでサヨリを狙います。';}
  if(profile==='tachiuo-float') {components=components.map(p=>p.id==='sinker'?part('sinker','タル付オモリ','タチウオ用完成セットに付属するタル付オモリ。中通しオモリではありません。'):p);summary='電気ウキの下にタル付オモリと専用の針仕掛け。発光体を添えた付けエサでタチウオを狙います。';connection=['道糸','ウキ止め・シモリペット','環付き電気ウキ','からまん軸・クッション','発光体','タル付オモリ','専用ハリス','針・キビナゴ'];sources=[{title:'冨士灯器｜TYPE-L3 LG 太刀魚仕掛けセット',url:'https://fujitoki.co.jp/353'}];}
  if(profile==='sayori-float') sources=[{title:'HAYABUSA｜HA143 サヨリ専用仕掛け',url:'https://www.hayabusa.co.jp/hayabusa/products/HA143/index.html'}];
  if(build.methodId==='uki-sabiki') sources=[{title:'HAYABUSA｜HA230 下カゴ飛ばしサビキ',url:'https://www.hayabusa.co.jp/hayabusa/products/HA230/'}];
  if(build.methodId==='kago') {components=[...components.filter(p=>p.id!=='bait'),part('chum','コマセ','カゴに入れる寄せエサです。'),bait];sources=[{title:'HAYABUSA｜HA240 天秤カゴ釣りセット',url:'https://www.hayabusa.co.jp/hayabusa/products/HA240/'},...sources];}
  return {...rig,variant,connection,summary,sources,parts:components.map(p=>({...p,label:p.id==='safety'?p.label:equipment.find(c=>c.id===p.category)?.label||p.label}))};
}
export const partStateLabel: Record<PartState, string> = { missing: '未選択', selected: '選択済み', owned: '手持ち', included: '付属品' };
export function buildPartStates(build: FishingBuild, rig: RigDefinition): Partial<Record<RigPartId, PartState>> {
  return Object.fromEntries(rig.parts.map(p => {
    const category = p.category;
    const state: PartState = !category ? 'missing' : build.owned.includes(category) ? 'owned' : build.included.includes(category)||!!coveringProduct(build,category) ? 'included' : products.some(product => product.id === build.selection[category] && product.category === category) ? 'selected' : 'missing';
    return [p.id, state];
  }));
}

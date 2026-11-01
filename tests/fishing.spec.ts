import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { categories, products } from '../src/catalog';
import { equipmentFor } from '../src/equipment';
import { questions } from '../src/diagnosis';
import { createDefaultBuild, decodeBuild, encodeBuild } from '../src/domain';
import { builder, chooseAll, complete, completedBuild, diagnose, fresh, noOverflow } from './helpers';

test('conditions, questions, fish and method are separate decisions',async({page})=>{
  const errors: string[] = []; page.on('pageerror',e=>errors.push(e.message));
  await fresh(page);
  await expect(page.getByRole('heading',{level:1})).toHaveText('次の休日、何を釣ろう。');
  await page.getByRole('button',{name:'釣りのプランをつくる',exact:true}).click();
  await expect(page).toHaveURL(/#conditions\/month$/);
  await expect(page.getByRole('group')).toHaveCount(1);
  await page.getByRole('button',{name:/^10月/}).click();
  await expect(page).toHaveURL(/#conditions\/area$/);
  await page.getByRole('button',{name:/東京湾/}).click();
  await expect(page).toHaveURL(/#conditions\/field$/);
  await page.getByRole('button',{name:/^堤防・海釣り施設/}).click();
  await expect(page).toHaveURL(/#diagnosis\/goal$/);
  await page.getByRole('button',{name:/まずは一匹、釣ってみたい/}).click();
  await expect(page).toHaveURL(/#diagnosis\/pace$/);
  await page.getByRole('button',{name:/のんびり、魚の反応を待つ/}).click();
  await expect(page).toHaveURL(/#diagnosis\/budget$/);
  await expect(page.getByRole('button',{name:'おすすめの魚を見る',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:/相場を見ながら決めたい/}).click();
  await page.getByRole('button',{name:'おすすめの魚を見る',exact:true}).click();
  await expect(page).toHaveURL(/#discover$/);
  await expect(page.getByRole('button').filter({has:page.getByRole('heading',{level:2})}).first()).toContainText('イワシ');
  await expect(page.getByRole('heading',{name:'サビキ釣り',exact:true})).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('all optional questions can be answered and results are always reachable',async({page})=>{
  await diagnose(page);
  await page.getByRole('button',{name:'もっと質問に答える',exact:true}).click();
  for (const q of questions.slice(3)) {
    await expect(page.getByRole('heading',{level:1})).toHaveText(q.title);
    await expect(page.getByRole('button',{name:'ここまでの回答でおすすめを見る',exact:true})).toBeVisible();
    await page.getByRole('button',{name:new RegExp(q.options[0].label)}).click();
  }
  await expect(page).toHaveURL(/#diagnosis\/ready$/);
  await expect(page.getByRole('button',{name:'もっと質問に答える',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'おすすめの魚を見る',exact:true}).click();
  await expect(page).toHaveURL(/#discover$/);
  await page.reload();
  await expect(page).toHaveURL(/#discover$/);
});

test('every gear slot requires an explicit choice and recommendations do not preselect',async({page},info)=>{
  await builder(page);
  await expect(page.getByRole('table',{name:'必要な道具と選択中の商品',exact:true}).getByRole('row')).toHaveCount(equipmentFor(completedBuild()).length+1);
  await expect(page.getByRole('button',{name:'選んだ道具を確認する',exact:true})).toBeDisabled();
  await page.screenshot({path:info.outputPath('overview-empty.png'),fullPage:true,scale:'css'});
  expect(decodeBuild(await page.evaluate(()=>localStorage.getItem('fun-fishing-build-v1')!))?.selection.rod).toBe('');
  for (let i=0;i<categories.length;i++) {
    const c = categories[i];
    await expect(page).toHaveURL(/#builder$/);
    await page.getByRole('button',{name:`${c.label}の商品を選ぶ`,exact:true}).click();
    await expect(page.getByRole('heading',{level:1})).toHaveText(`${c.label}を選ぼう。`);
    const stored = decodeBuild(await page.evaluate(()=>localStorage.getItem('fun-fishing-build-v1')!))!;
    expect(Object.values(stored.selection).filter(Boolean)).toHaveLength(i);
    const recommended = page.getByRole('article').filter({hasText:'この用途のおすすめ'});
    await expect(recommended).toHaveCount(1);
    if (i === 0) await page.screenshot({path:info.outputPath('gear.png'),fullPage:true});
    await recommended.getByRole('button',{name:/^この商品を選ぶ：/}).click();
  }
  await expect(page).toHaveURL(/#builder$/);
  await page.screenshot({path:info.outputPath('overview-complete.png'),fullPage:true,scale:'css'});
  await page.getByRole('button',{name:'選んだ道具を確認する',exact:true}).click();
  await expect(page).toHaveURL(/#review$/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('選んだ道具と購入前の確認');
  await page.screenshot({path:info.outputPath('review.png'),fullPage:true});
  await noOverflow(page);
});

test('changing a previous choice preserves later selections and recomputes available products',async({page})=>{
  await complete(page);
  await page.getByRole('button',{name:'釣り竿（ロッド）を選び直す',exact:true}).click();
  await page.getByRole('button',{name:'この商品を選ぶ：リバティクラブ 小継 磯 2-300',exact:true}).click();
  await expect(page).toHaveURL(/#builder$/);
  await expect(page.getByRole('row').filter({hasText:'リバティクラブ 小継 磯 2-300'})).toContainText('選択済み');
  await page.getByRole('button',{name:'サビキカゴを変更する',exact:true}).click();
  await expect(page.getByRole('button',{name:'この商品を選ぶ：UPK-001 3Pプラカゴ サビキ L-10号',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'この商品を選ぶ：UPK-001 3Pプラカゴ サビキ S-6号',exact:true})).toBeVisible();
});

test('using included line is explicit and changing the reel requires a new line decision',async({page})=>{
  const build = completedBuild(); build.selection.reel = 'reel-2500';
  await page.goto(`./?build=${encodeBuild(build)}#builder/line`);
  await page.getByRole('button',{name:'リール付属の糸を使う',exact:true}).click();
  await expect(page).toHaveURL(/#builder$/);
  await expect(page.getByRole('row').filter({hasText:'リール付属のナイロン3号150m'})).toContainText('追加購入なし');
  await page.getByRole('button',{name:'リールを変更する',exact:true}).click();
  await page.getByRole('button',{name:'この商品を選ぶ：17 ワールドスピン CF2500',exact:true}).click();
  await expect(page).toHaveURL(/#builder$/);
  await expect(page.getByRole('button',{name:'選んだ道具を確認する',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'リールに巻く糸（道糸）の商品を選ぶ',exact:true}).click();
  await expect(page).toHaveURL(/#builder\/line$/);
});

test('manual purchase prices and shipping compare complete costs without inventing prices',async({page})=>{
  await page.route('**/src/data/amazon-prices.json*', route=>route.fulfill({contentType:'application/javascript',body:'export default {schemaVersion:1,updatedAt:null,products:{}};'}));
  const build = completedBuild(); build.selection.bucket = 'bucket-risu-8'; build.answers = {...build.answers,water:'tap'};
  for (const p of products) build.prices[p.id] = 1000;
  delete build.prices['bucket-risu-8'];
  await page.goto(`./?build=${encodeBuild(build)}#review`);
  const cost=page.getByLabel('今回の購入費用');
  await expect(cost).toContainText('確認済み分 7,000円');
  await page.getByRole('button',{name:'バケツ：価格をまとめて確認',exact:true}).click();
  await page.getByRole('spinbutton',{name:'アクティブバケツ ホワイト 8Lの税込価格',exact:true}).fill('500');
  await page.getByRole('button',{name:'価格を保存して戻る',exact:true}).click();
  await cost.getByText('別の道具一式と比較する（任意）',{exact:true}).click();
  await expect(cost).toContainText('500円抑えられます');
  await page.getByRole('button',{name:'購入先ごとの送料を確認',exact:true}).click();
  await page.getByRole('spinbutton',{name:'注文1の送料',exact:true}).fill('900');
  await page.getByText('比較用の別の道具一式の送料も入力する（任意）',{exact:true}).click();
  await page.getByLabel('比較する注文全体の送料合計（円）',{exact:true}).fill('0');
  await page.getByRole('button',{name:'送料を保存して戻る',exact:true}).click();
  await expect(cost).toContainText('8,400円');
  await cost.getByText('別の道具一式と比較する（任意）',{exact:true}).click();
  await expect(cost).toContainText('入力した送料を含む差額：400円高い');
  await page.reload();
  await expect(cost).toContainText('8,400円');
});

test('owned gear is an explicit decision and excluded from purchase links',async({page})=>{
  await builder(page);
  await page.getByRole('button',{name:'釣り竿（ロッド）の商品を選ぶ',exact:true}).click();
  await page.getByText('持っている道具を使いたい',{exact:true}).click();
  await page.getByRole('button',{name:'釣り竿（ロッド）は手持ちの道具を使う',exact:true}).click();
  for (const c of categories.slice(1)) {
    await page.getByRole('button',{name:`${c.label}の商品を選ぶ`,exact:true}).click();
    await page.getByRole('article').filter({hasText:'この用途のおすすめ'}).getByRole('button',{name:/^この商品を選ぶ：/}).click();
  }
  await page.getByRole('button',{name:'選んだ道具を確認する',exact:true}).click();
  await page.getByRole('button',{name:'購入先の確認・リストの保存へ',exact:true}).click();
  await page.getByRole('button',{name:/購入先と当日の持ち物を確認する/}).click();
  const owned = page.getByRole('article').filter({has:page.getByRole('checkbox',{name:'釣り竿（ロッド）を準備済みにする',exact:true})});
  await expect(owned.getByRole('link')).toHaveCount(0);
  await expect(owned.getByRole('checkbox')).toBeDisabled();
});

test('checklist, share, reload, reset and browser back restore the same plan',async({page,context},info)=>{
  await complete(page);
  await page.getByRole('button',{name:'購入先の確認・リストの保存へ',exact:true}).click();
  await page.getByRole('button',{name:/購入先と当日の持ち物を確認する/}).click();
  await expect(page).toHaveURL(/#list$/);
  const checkbox = page.getByRole('checkbox',{name:'釣り竿（ロッド）を準備済みにする',exact:true});
  await checkbox.check();
  await page.reload(); await expect(checkbox).toBeChecked();
  await page.getByRole('button',{name:'このチェックリストを保存・共有',exact:true}).click();
  await page.getByText('リンクの文字列を表示・手動コピー',{exact:true}).click();
  const url = await page.getByLabel('この買い物リストを開くリンク',{exact:true}).inputValue();
  expect(url).toMatch(/\?build=.+#list$/);
  await page.screenshot({path:info.outputPath('save.png'),fullPage:true});
  const shared = await context.newPage();
  await shared.goto(url);
  await expect(shared.getByRole('checkbox',{name:'釣り竿（ロッド）を準備済みにする',exact:true})).toBeChecked();
  await page.getByRole('button',{name:'新しいプランをつくる',exact:true}).click();
  await page.getByRole('button',{name:'最初からはじめる',exact:true}).click();
  await expect(page).toHaveURL(/#search$/);
  await page.goBack();
  await page.getByText('リンクの文字列を表示・手動コピー',{exact:true}).click();
  await expect(page.getByLabel('この買い物リストを開くリンク',{exact:true})).toHaveValue(url);
  await shared.close();
});

test('browser back and forward preserve completed decisions',async({page})=>{
  await builder(page);
  await page.getByRole('button',{name:'釣り竿（ロッド）の商品を選ぶ',exact:true}).click();
  await page.getByRole('button',{name:'この商品を選ぶ：リバティクラブ 小継 磯 3-300',exact:true}).click();
  await expect(page).toHaveURL(/#builder$/);
  await page.goBack();
  await expect(page).toHaveURL(/#builder\/rod$/);
  await expect(page.getByText('現在選択中',{exact:true})).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/#builder$/);
});

test('the overview allows any category first and returning without choosing preserves the list',async({page})=>{
  await builder(page);
  await page.getByRole('button',{name:'バケツの商品を選ぶ',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('バケツを選ぼう。');
  await page.getByRole('button',{name:'戻る',exact:true}).click();
  await expect(page).toHaveURL(/#builder$/);
  await expect(page.getByRole('table',{name:'必要な道具と選択中の商品'}).getByText('未選択',{exact:true})).toHaveCount(equipmentFor(completedBuild()).length);
  await page.getByRole('button',{name:'安全用品の商品を選ぶ',exact:true}).click();
  await page.getByRole('button',{name:'この商品を選ぶ：トカラウ BSJ-201ARS レッド M',exact:true}).click();
  await expect(page).toHaveURL(/#builder$/);
  await expect(page.getByRole('row').filter({hasText:'トカラウ BSJ-201ARS レッド M'})).toContainText('Bluestorm');
  await expect(page.getByRole('table',{name:'必要な道具と選択中の商品'}).getByText('未選択',{exact:true})).toHaveCount(equipmentFor(completedBuild()).length-1);
  await expect(page.getByRole('button',{name:'選んだ道具を確認する',exact:true})).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('row').filter({hasText:'トカラウ BSJ-201ARS レッド M'})).toContainText('選択済み');
  await page.getByRole('button',{name:'釣り竿（ロッド）の商品を選ぶ',exact:true}).click();
  await expect(page).toHaveURL(/#builder\/rod$/);
});

test('a new plan never inherits automatically populated or previously selected gear',async({page})=>{
  await page.goto(`./?build=${encodeBuild(completedBuild())}#review`);
  await page.getByRole('button',{name:'FUN FISHING その一投を、もっと気軽に。 トップへ',exact:true}).click();
  await expect(page.getByRole('button',{name:'プランの続きへ',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'釣りのプランをつくる',exact:true}).click();
  const build = decodeBuild(await page.evaluate(()=>localStorage.getItem('fun-fishing-build-v1')!))!;
  expect(Object.values(build.selection).filter(Boolean)).toHaveLength(0);
  expect(build.answers).toEqual({});
  expect(build.fishId).toBe('');
});

test('unsupported conditions, malformed sharing and direct skips recover',async({page})=>{
  await fresh(page);
  await page.goto('./?build=invalid#list');
  await expect(page).toHaveURL(/#search$/);
  await expect(page.getByRole('status')).toContainText('共有URLを読み込めませんでした');
  await page.goto(`./?build=${encodeBuild(createDefaultBuild({month:10,area:'tokyo-bay',field:'pier'}))}#list`);
  await expect(page).toHaveURL(/#diagnosis\/goal$/);
  await page.getByRole('button',{name:'戻る',exact:true}).click();
  await page.getByRole('button',{name:/^砂浜/}).click();
  await expect(page).toHaveURL(/#diagnosis\/goal$/);
  await page.getByRole('button',{name:/まずは一匹、釣ってみたい/}).click();
  await page.getByRole('button',{name:/のんびり、魚の反応を待つ/}).click();
  await page.getByRole('button',{name:/相場を見ながら決めたい/}).click();
  await page.getByRole('button',{name:'おすすめの魚を見る',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('どの魚を釣ってみたい？');
  await expect(page.getByRole('group',{name:'狙う魚を選ぶ'}).getByRole('button')).toHaveCount(3);
  await expect(page.getByText(/この地域の情報は、まだ掲載していません/)).toBeVisible();
});

test('keyboard operation, focus and Escape remain usable',async({page})=>{
  await fresh(page);
  await page.getByRole('button',{name:'釣りのプランをつくる',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{level:1})).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#conditions\/area$/);
  await page.getByRole('button',{name:'使い方',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'使い方',exact:true})).toBeFocused();
  await page.getByRole('link',{name:'本文へスキップ',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#conditions\/area$/);
  expect(await page.evaluate(()=>document.activeElement?.id)).toBe('main-content');
});

test('automated accessibility across all decision types',async({page})=>{
  const check = async()=>{
    const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  };
  await fresh(page); await check();
  await page.getByRole('button',{name:'釣りのプランをつくる',exact:true}).click(); await check();
  await diagnose(page); await check();
  await page.getByRole('button',{name:'おすすめの魚を見る',exact:true}).click(); await check();
  await builder(page); await check();
  await page.getByRole('button',{name:'釣り竿（ロッド）の商品を選ぶ',exact:true}).click(); await check();
  await page.getByRole('button',{name:'戻る',exact:true}).click();
  await chooseAll(page); await check();
  await page.getByRole('button',{name:'釣り竿（ロッド）：価格をまとめて確認',exact:true}).click(); await check();
  await page.getByRole('button',{name:'戻る',exact:true}).click();
  await page.getByRole('button',{name:'購入先の確認・リストの保存へ',exact:true}).click(); await check();
  await page.getByRole('button',{name:/リストのリンクを保存・共有する/}).click(); await check();
});

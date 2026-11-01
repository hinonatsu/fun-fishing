import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createDefaultBuild, decodeBuild, encodeBuild } from '../src/domain';
import { equipmentFor, requiredEquipment } from '../src/equipment';
import { chooseProduct, hasChoice, recommendedProduct } from '../src/planner';
import { noOverflow } from './helpers';

const examples=[['aji','sabiki'],['aji','float'],['suzuki','lure'],['kasago','hole'],['kurodai','bukkomi'],['kisu','nage'],['haze','choi-nage'],['kawahagi','dozuki'],['aji','uki-sabiki'],['aoriika','eging'],['kurodai','hechi'],['aji','kago'],['sayori','float'],['tachiuo','float'],['kamasu','sabiki'],['hokke','nage'],['tsutsuika','eging'],['nishin','sabiki']] as const;
for(const [fishId,methodId] of examples) test(`${fishId}/${methodId}: choose every required tool, review, Amazon links and share`,async({page,context},info)=>{
  test.setTimeout(120_000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const build={...createDefaultBuild({month:11,area:'osaka-bay',field:'pier'}),fishId,methodId,answers:{goal:'first',pace:'calm',budget:'30000'}};
  await page.goto(`./?build=${encodeBuild(build)}#builder`);
  await expect(page.getByRole('table',{name:'必要な道具と選択中の商品'}).getByRole('row')).toHaveCount(equipmentFor(build).length+1);
  await expect(page.getByRole('button',{name:'選んだ道具を確認する',exact:true})).toBeDisabled();
  for(const c of requiredEquipment(build)) {
    const saved=decodeBuild(await page.evaluate(()=>localStorage.getItem('fun-fishing-build-v1')!))!;
    if(hasChoice(saved,c.id)) continue;
    await page.getByRole('button',{name:`${c.label}の商品を選ぶ`,exact:true}).click();
    await expect(page).toHaveURL(new RegExp(`#builder/${c.id}$`));
    const recommended=page.getByRole('article').filter({hasText:'好み・用途からの候補'});
    await expect(recommended).toHaveCount(1);
    await recommended.getByRole('button',{name:/^この商品を選ぶ：/}).click();
    await expect(page).toHaveURL(/#builder$/);
  }
  await expect(page.getByRole('button',{name:'選んだ道具を確認する',exact:true})).toBeEnabled();
  await noOverflow(page);
  await page.mouse.move(0,0);
  const closeToast=page.getByRole('button',{name:'通知を閉じる',exact:true});
  if(await closeToast.isVisible()) await closeToast.click();
  await page.mouse.move(0,0);
  await page.screenshot({path:info.outputPath(`${methodId}-complete.png`),fullPage:true,animations:'disabled'});
  await page.screenshot({path:info.outputPath(`${methodId}-viewport.png`),fullPage:false,animations:'disabled'});
  await page.getByRole('button',{name:'選んだ道具を確認する',exact:true}).click();
  await expect(page).toHaveURL(/#review$/);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button',{name:'購入先の確認・リストの保存へ',exact:true}).click();
  await page.getByRole('button',{name:/購入先と当日の持ち物を確認する/}).click();
  await expect(page).toHaveURL(/#list$/);
  const links=page.getByRole('link',{name:/^Amazonの商品ページへ/});
  await expect(links.first()).toBeVisible();
  expect(await links.count()).toBeGreaterThan(0);
  for(const href of await links.evaluateAll(els=>els.map(e=>(e as HTMLAnchorElement).href))) expect(href).toMatch(/^https:\/\/www\.amazon\.co\.jp\/dp\/[A-Z0-9]{10}\?/);
  await page.getByRole('button',{name:'このチェックリストを保管・共有',exact:true}).click();
  await page.getByText('リンクの文字列を表示・手動コピー',{exact:true}).click();
  const url=await page.getByLabel('この買い物リストを開くリンク',{exact:true}).inputValue();
  const saved=decodeBuild(await page.evaluate(()=>localStorage.getItem('fun-fishing-build-v1')!));
  const shared=await context.newPage();await shared.goto(url);
  await expect(shared).toHaveURL(/#list$/);
  expect(decodeBuild(await shared.evaluate(()=>localStorage.getItem('fun-fishing-build-v1')!))?.selection).toEqual(saved?.selection);
  await shared.close();
  expect(errors).toEqual([]);
});

test('switching methods restores each explicit setup after reload',async({page})=>{
  const build={...createDefaultBuild(),fishId:'aji',methodId:'sabiki',answers:{goal:'first',pace:'calm',budget:'30000'}};
  await page.goto(`./?build=${encodeBuild(build)}#builder`);
  await page.getByRole('button',{name:'釣り竿（ロッド）の商品を選ぶ',exact:true}).click();
  await page.getByRole('button',{name:/^この商品を選ぶ：.*3-300/}).click();
  await page.getByRole('button',{name:'戻る',exact:true}).click();
  const choose=async(name:string)=>page.locator('.style-choice').filter({has:page.getByRole('heading',{name,exact:true})}).getByRole('button').click();
  await choose('浮き釣り');
  await expect(page.locator('tr[data-category="rod"]')).toContainText('まだ選んでいません');
  await page.getByRole('button',{name:'ウキ・完成仕掛けの商品を選ぶ',exact:true}).click();
  await page.getByRole('article').filter({hasText:'好み・用途からの候補'}).getByRole('button',{name:/^この商品を選ぶ：/}).click();
  await expect(page.locator('tr[data-category="hook"]')).toContainText('付属品');
  await page.getByRole('button',{name:'戻る',exact:true}).click();
  await choose('サビキ釣り');
  await expect(page.locator('tr[data-category="rod"]')).toContainText('3-300');
  await page.reload();
  await page.getByRole('button',{name:'戻る',exact:true}).click();
  await choose('浮き釣り');
  await expect(page.locator('tr[data-category="hook"]')).toContainText('付属品');
  await expect(page.locator('tr[data-category="rod"]')).toContainText('まだ選んでいません');
});

test('optional cooler selection fits the larger-fish context and adds an Amazon purchase',async({page})=>{
  let build={...createDefaultBuild(),fishId:'suzuki',methodId:'lure',answers:{goal:'first',pace:'calm',budget:'30000',keep:'eat'}};
  for(const c of requiredEquipment(build)) if(!hasChoice(build,c.id)) build=chooseProduct(build,c.id,recommendedProduct(build,c.id)!.id) as typeof build;
  await page.goto(`./?build=${encodeBuild(build)}#builder/cooler`);
  const recommended=page.getByRole('article').filter({hasText:'好み・用途からの候補'});
  await expect(recommended).toContainText('ライトトランクα S3200');
  await recommended.getByRole('button',{name:/^この商品を選ぶ：/}).click();
  await expect(page.locator('tr[data-category="cooler"]')).toContainText('S3200');
  await page.getByRole('button',{name:'選んだ道具を確認する',exact:true}).click();
  await page.getByRole('button',{name:'購入先の確認・リストの保存へ',exact:true}).click();
  await page.getByRole('button',{name:/購入先と当日の持ち物を確認する/}).click();
  await expect(page.locator('a.buy-link[href="https://www.amazon.co.jp/dp/B083WGRWJP?th=1&psc=1"]')).toBeVisible();
});

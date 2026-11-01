import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fishSpecies, methods } from '../src/catalog';
import { createDefaultBuild, decodeBuild, encodeBuild } from '../src/domain';
import { noOverflow } from './helpers';

function plan(month = 10) {
  return {...createDefaultBuild({month,area:'tokyo-bay',field:'pier'}),answers:{goal:'food',pace:'calm',budget:'30000'}};
}

test('all 30 groups can be searched by aliases, sorted and filtered accessibly', async ({page}, info) => {
  await page.goto(`./?build=${encodeBuild(plan())}#discover`);
  await page.getByRole('button',{name:'すべての魚・イカを見る',exact:true}).click();
  await page.getByText('魚の検索・絞り込み',{exact:true}).click();
  const cards = page.getByRole('group',{name:'狙う魚を選ぶ'}).getByRole('button');
  await expect(cards).toHaveCount(30);
  await expect(page.getByText('難易度の目安',{exact:true})).toBeVisible();
  for (const fish of fishSpecies) {
    const card = cards.filter({has:page.getByRole('heading',{name:fish.name,exact:true})});
    await expect(card.getByRole('img',{name:`星${fish.difficulty} / 3`,exact:true})).toBeVisible();
    await expect(card.locator('.fish-difficulty-stars .filled')).toHaveCount(fish.difficulty);
  }
  await expect(cards.filter({has:page.getByRole('heading',{name:'アジ',exact:true})}).getByRole('img',{name:'星1 / 3',exact:true})).toBeVisible();
  await expect(cards.filter({has:page.getByRole('heading',{name:'カワハギ',exact:true})}).getByRole('img',{name:'星2 / 3',exact:true})).toBeVisible();
  await expect(cards.filter({has:page.getByRole('heading',{name:'ヒラメ',exact:true})}).getByRole('img',{name:'星3 / 3',exact:true})).toBeVisible();
  await page.getByRole('combobox',{name:'並び順',exact:true}).selectOption('popular');
  await expect(cards.first().getByRole('heading')).toHaveText('アジ');
  await expect(cards.nth(1).getByRole('heading')).toHaveText('サバ');
  await expect(cards.last().getByRole('heading')).toHaveText('メジナ');
  await page.getByLabel('魚の名前・別名で検索').fill('がしら');
  await expect(cards).toHaveCount(1);
  await expect(cards.first().getByRole('heading')).toHaveText('カサゴ');
  await page.getByLabel('魚の名前・別名で検索').fill('やりいか');
  await expect(cards.first().getByRole('heading')).toHaveText('ツツイカ');
  await page.getByLabel('魚の名前・別名で検索').fill('');
  await page.getByRole('combobox',{name:'釣り方で絞り込む',exact:true}).selectOption('eging');
  await expect(cards).toHaveCount(3);
  await page.getByLabel('魚の名前・別名で検索').fill('アジ');
  await expect(page.getByRole('heading',{name:'一致する魚が見つかりませんでした。'})).toBeVisible();
  await page.getByRole('button',{name:'検索・絞り込みを解除する'}).click();
  await expect(cards).toHaveCount(30);
  await noOverflow(page);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:info.outputPath('fish-30-selection.png'),fullPage:true,scale:'css'});
  await page.screenshot({path:info.outputPath('fish-30-viewport.png'),fullPage:false,scale:'css'});
});

test('every target reaches its selected style and survives reload', async ({page}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror',e => errors.push(e.message));
  for (const fish of fishSpecies) {
    await page.goto(`./?build=${encodeBuild(plan())}#discover`);
    await page.getByRole('button',{name:'すべての魚・イカを見る',exact:true}).click();
    await page.getByRole('button').filter({has:page.getByRole('heading',{name:fish.name,exact:true})}).click();
    await expect(page).toHaveURL(/#method$/);
    await expect(page.getByRole('heading',{level:1})).toContainText(fish.name);
    const firstMethod = methods.find(m => fish.methodIds.includes(m.id))!;
    const choice = page.locator('.style-choice').filter({has:page.getByRole('heading',{name:firstMethod.name,exact:true})});
    await choice.getByRole('button').click();
    await expect(page).toHaveURL(/#builder$/);
    const saved = decodeBuild(await page.evaluate(() => localStorage.getItem('fun-fishing-build-v1')!))!;
    expect(saved.fishId).toBe(fish.id);
    expect(saved.methodId).toBe(firstMethod.id);
    await page.reload();
    await expect(page).toHaveURL(/#builder$/);
    {
      await expect(page.getByRole('table',{name:'必要な道具と選択中の商品',exact:true})).toBeVisible();
      await expect(page.locator('.trip-facts strong')).toContainText(fish.name);
      if(!['sabiki','uki-sabiki'].includes(firstMethod.id)) await expect(page.getByRole('button',{name:'サビキ仕掛けの商品を選ぶ',exact:true})).toHaveCount(0);
    }
  }
  expect(errors).toEqual([]);
});

test('November and other regions allow selection without claiming local seasonality', async ({page,isMobile}, info) => {
  const build = {...plan(11),conditions:{month:11,area:'osaka-bay',field:'surf'}};
  await page.goto(`./?build=${encodeBuild(build)}#discover`);
  await expect(page.getByText(/この地域の情報は、まだ掲載していません/)).toBeVisible();
  await expect(page.getByRole('group',{name:'狙う魚を選ぶ'}).getByRole('button')).toHaveCount(3);
  await page.getByRole('button',{name:'すべての魚・イカを見る',exact:true}).click();
  await page.getByRole('button').filter({has:page.getByRole('heading',{name:'アオリイカ',exact:true})}).click();
  await page.getByRole('button',{name:'この釣り方の道具を選ぶ',exact:true}).click();
  await expect(page.locator('.trip-facts strong')).toContainText('アオリイカ エギング');
  if(!isMobile) await page.locator('tr[data-category="rod"]').hover();
  await noOverflow(page);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:info.outputPath('fish-eging-guide.png'),fullPage:true,scale:'css'});
  await page.goBack();
  await expect(page).toHaveURL(/#method$/);
  await page.goForward();
  await expect(page.locator('.trip-facts strong')).toContainText('アオリイカ エギング');
});

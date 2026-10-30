import { test, expect } from '@playwright/test';
import { encodeBuild } from '../src/domain';
import { completedBuild, fresh, noOverflow } from './helpers';

for (const size of [{width:360,height:800},{width:390,height:844},{width:768,height:1024},{width:1280,height:800},{width:1440,height:900},{width:1920,height:1080}]) {
  test(`responsive decisions ${size.width}x${size.height}`,async({page},info)=>{
    await page.setViewportSize(size);
    await fresh(page);
    const capture = async(name:string)=>{await expect(page.getByRole('heading',{level:1})).toBeVisible();await noOverflow(page);await page.screenshot({path:info.outputPath(`${name}.png`),fullPage:true,animations:'disabled'});};
    await capture('home');
    await page.getByRole('button',{name:'釣りのプランをつくる',exact:true}).click(); await capture('month');
    const build = completedBuild();
    for (const screen of ['diagnosis/goal','diagnosis/ready','discover','method','builder','builder/rod','builder/bucket','review','prices/bucket','checkout','save','list']) {
      await page.goto(`./?build=${encodeBuild(build)}#${screen}`);
      await capture(screen.replace('/','-'));
    }
  });
}

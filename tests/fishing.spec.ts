import { test as base, expect, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { createDefaultBuild, encodeBuild } from "../src/domain";
import { amazonLinkLabel, categories, products } from "../src/catalog";

const test = base.extend<{ browserErrors: string[] }>({
  browserErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      const expectedImageFailure = test.info().annotations.some(a => a.type === "expected-image-failure")
        && message.location().url.includes("/images/harbor.svg")
        && message.text().includes("net::ERR_FAILED");
      if (message.type() === "error" && !expectedImageFailure) errors.push(message.text());
    });
    await use(errors);
    expect(errors, "No unhandled JavaScript errors or console errors").toEqual([]);
  }, { auto: true }],
});

async function fresh(page: Page) {
  await page.goto("./");
  await page.evaluate(() => localStorage.clear());
  await page.goto("./#search");
  await page.reload();
}

async function sample(page: Page) {
  await fresh(page);
  await page.getByRole("button", { name: "まずはサンプルで試す", exact: true }).click();
  await expect(page).toHaveURL(/#discover$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("どんな魚に、出会いたい？");
}

async function builder(page: Page) {
  await sample(page);
  await page.getByRole("button", { name: "この釣り方で道具を見る", exact: true }).click();
  await expect(page).toHaveURL(/#builder$/);
}

async function complete(page: Page) {
  await builder(page);
  await page.getByRole("button", { name: "このセットで準備する", exact: true }).click();
  await expect(page).toHaveURL(/#list$/);
}

async function shot(page: Page, info: TestInfo, name: string) {
  await mkdir("artifacts/screenshots", { recursive: true });
  const overlay = ["02-search-open", "06-product-picker", "10-share"].includes(name);
  await page.screenshot({ path: `artifacts/screenshots/${info.project.name}-${name}.png`, fullPage: !overlay, animations: "disabled", scale: "css" });
  if (["05-builder", "08-compatibility-warning"].includes(name)) {
    await page.screenshot({ path: `artifacts/screenshots/${info.project.name}-${name}-viewport.png`, animations: "disabled", scale: "css" });
  }
}

async function noHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(widths.document, "Main document should fit the viewport").toBeLessThanOrEqual(widths.viewport);
}

test("top search, changing all conditions, unsupported result and recovery", async ({ page }, info) => {
  await fresh(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("釣りの準備");
  const browserMonth = await page.evaluate(() => new Date().getMonth() + 1);
  await expect(page.getByRole("button", { name: /いつ行く？/ })).toContainText(`今月（${browserMonth}月）`);
  await shot(page, info, "01-home");
  await page.getByRole("button", { name: /いつ行く？/ }).click();
  await expect(page.getByRole("group", { name: "いつ行く？を選択" })).toBeVisible();
  await shot(page, info, "02-search-open");
  await page.getByRole("group", { name: "いつ行く？を選択" }).getByRole("button").filter({ hasText: /^1月$/ }).click();
  await page.getByRole("button", { name: /どこで釣る？/ }).click();
  const areaChoices = page.getByRole("group", { name: "どこで釣る？を選択" });
  await areaChoices.getByRole("button").filter({ hasText: "データ準備中" }).first().click();
  await page.getByRole("button", { name: /どんな場所？/ }).click();
  await page.getByRole("group", { name: "どんな場所？を選択" }).getByRole("button", { name: /サーフ/ }).click();
  await page.getByRole("button", { name: "釣り方を見つける", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("この条件のデータを準備中です。");
  await expect(page.getByRole("group", { name: "狙う魚を選択" })).toHaveCount(0);
  await shot(page, info, "11-no-data");
  await noHorizontalOverflow(page);
  await page.getByRole("button", { name: "このサンプルに変更", exact: true }).click();
  await expect(page.getByRole("group", { name: "狙う魚を選択" })).toBeVisible();
  await expect(page.getByRole("button", { name: "この釣り方で道具を見る", exact: true })).toBeEnabled();
});

test("service guide and supported-area dialogs work in desktop and mobile navigation", async ({ page }) => {
  await fresh(page);
  const menu = page.getByRole("button", { name: "メニュー", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "はじめての方へ", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("ログインせずに利用できます");
  await page.getByRole("dialog").getByRole("button", { name: "閉じる", exact: true }).click();
  if (await menu.isVisible()) await expect(menu).toBeFocused();
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "対応エリア", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("東京湾の堤防・サビキ釣り");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  if (await menu.isVisible()) await expect(menu).toBeFocused();
});

test("fish and method choice, full recommended build and list", async ({ page }, info) => {
  await sample(page);
  await shot(page, info, "03-fish");
  const fishGroup = page.getByRole("group", { name: "狙う魚を選択" });
  await fishGroup.getByRole("button").filter({ hasText: "イワシ" }).click();
  await expect(fishGroup.getByRole("button").filter({ hasText: "イワシ" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: /イワシ、どうやって釣る/ })).toBeVisible();
  await fishGroup.getByRole("button").filter({ hasText: "アジ" }).click();
  await page.getByRole("group", { name: "釣り方を選択" }).getByRole("button", { name: /サビキ釣り/ }).click();
  await page.getByText("ほかの釣り方も知りたい", { exact: true }).click();
  await expect(page.getByText("道具提案は準備中", { exact: true })).toBeVisible();
  await shot(page, info, "04-method");
  await page.getByRole("button", { name: "この釣り方で道具を見る", exact: true }).click();
  await expect(page).toHaveURL(/#builder$/);
  await shot(page, info, "05-builder");
  await noHorizontalOverflow(page);
  await expect(page.getByRole("button", { name: "ロッドを変更", exact: true })).toBeVisible();
  await expect(page.getByText("購入先で価格を確認", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/合計.*[¥￥]0/)).toHaveCount(0);
  await page.getByRole("button", { name: "このセットで準備する", exact: true }).click();
  await expect(page).toHaveURL(/#list$/);
  await shot(page, info, "09-list");
  await noHorizontalOverflow(page);
  const links = await page.getByRole("main").getByRole("link").evaluateAll(elements => elements.map(a => ({ href: (a as HTMLAnchorElement).href, target: (a as HTMLAnchorElement).target, rel: (a as HTMLAnchorElement).rel })));
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    expect(link.href).toMatch(/^https:\/\//);
    expect(link.target).toBe("_blank");
    expect(link.rel).toContain("noopener");
  }
  const firstPurchase = page.getByRole("link", { name: /Amazonで価格を確認/ }).first();
  const intendedUrl = await firstPurchase.getAttribute("href");
  const popupPromise = page.waitForEvent("popup");
  await firstPurchase.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(intendedUrl!);
  await popup.close();
});

test("all candidates and the complete list offer only Amazon purchase destinations", async ({ page }) => {
  await builder(page);
  for (const category of categories) {
    await page.getByRole("button", { name: `${category.label}を変更`, exact: true }).click();
    const candidates = products.filter(p => p.category === category.id);
    const links = page.getByRole("dialog").getByRole("link", { name: /^Amazonで/ });
    await expect(links).toHaveCount(candidates.length);
    for (let i = 0; i < candidates.length; i++) {
      await expect(links.nth(i)).toHaveAttribute("href", candidates[i].purchaseUrl!);
      await expect(links.nth(i)).toContainText(amazonLinkLabel(candidates[i]));
    }
    await page.getByRole("dialog").getByRole("button", { name: "閉じる", exact: true }).click();
  }
  await page.getByRole("button", { name: "このセットで準備する", exact: true }).click();
  const links = page.getByRole("main").getByRole("link", { name: /^Amazonで/ });
  await expect(links).toHaveCount(8);
  const destinations = await links.evaluateAll(nodes => nodes.map(n => (n as HTMLAnchorElement).href));
  expect(destinations.every(url => new URL(url).hostname === "www.amazon.co.jp")).toBe(true);
  await expect(page.getByRole("article").filter({ hasText: "アミ姫" }).getByRole("link", { name: /^Amazonで価格/ })).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: "BSJ-201ARS" }).getByRole("link", { name: /^Amazonで価格/ })).toBeVisible();
});

test("storage restrictions provide a share-based fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Storage unavailable", "SecurityError"); };
  });
  await page.goto("./#search");
  await expect(page.getByRole("status")).toContainText("自動保存が使えません");
  await page.getByRole("button", { name: "まずはサンプルで試す", exact: true }).click();
  await page.getByRole("button", { name: "この釣り方で道具を見る", exact: true }).click();
  await page.getByRole("button", { name: "このセットで準備する", exact: true }).click();
  await page.getByRole("button", { name: "構成URLを共有", exact: true }).first().click();
  await expect(page.getByLabel("構成URL", { exact: true })).toHaveValue(/\?build=.+#list$/);
});

test("old DAISO shared lists migrate without keeping the replacements marked ready", async ({ page }) => {
  const old = createDefaultBuild({ month: 10, area: "tokyo-bay", field: "pier" });
  old.selection.basket = "basket-6";
  old.selection.bucket = "bucket-generic";
  old.checked = ["rod", "basket", "bucket"];
  await page.goto(`./?build=${encodeBuild(old)}#list`);
  await expect(page.getByRole("status")).toContainText("カゴ・バケツの候補を更新しました");
  await expect(page.getByRole("checkbox", { name: "ロッドを準備済みにする", exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "サビキカゴを準備済みにする", exact: true })).not.toBeChecked();
  await expect(page.getByRole("checkbox", { name: "バケツを準備済みにする", exact: true })).not.toBeChecked();
  await expect(page.getByRole("heading", { name: "アクティブバケツ ホワイト 8L", exact: true })).toBeVisible();
  const links = page.getByRole("main").getByRole("link", { name: /^Amazonで/ });
  await expect(links).toHaveCount(8);
});

test("a failed hero image has a fallback and does not block preparing a list", async ({ page }) => {
  test.info().annotations.push({ type: "expected-image-failure", description: "Intentionally abort only the harbor illustration request" });
  await page.route("**/images/harbor.svg", route => route.abort("failed"));
  await page.goto("./#search");
  await expect(page.getByRole("img", { name: "海のイメージの代替表示", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /いつ行く？/ }).click();
  await page.getByRole("group", { name: "いつ行く？を選択" }).getByRole("button", { name: /10月/ }).click();
  await page.getByRole("button", { name: "釣り方を見つける", exact: true }).click();
  await page.getByRole("button", { name: "この釣り方で道具を見る", exact: true }).click();
  await page.getByRole("button", { name: "このセットで準備する", exact: true }).click();
  await expect(page).toHaveURL(/#list$/);
});

test("skip to main content preserves the current list and focuses its main region", async ({ page }) => {
  await complete(page);
  await page.getByRole("link", { name: "本文へスキップ", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#list$/);
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("main-content");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("準備ができたら、海へ行こう。");
});

test("sharing restores selection and checked purchases after reload", async ({ page, context }, info) => {
  await complete(page);
  const checks = page.getByRole("main").getByRole("checkbox", { name: /を準備済みにする/ });
  expect(await checks.count()).toBeGreaterThan(0);
  await checks.first().check();
  await expect(checks.first()).toBeChecked();
  await page.reload();
  await expect(page.getByRole("main").getByRole("checkbox", { name: /を準備済みにする/ }).first()).toBeChecked();
  await page.getByRole("button", { name: "構成URLを共有", exact: true }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const dialogBounds = await page.getByRole("dialog").boundingBox();
  const viewport = page.viewportSize()!;
  expect(Math.abs(dialogBounds!.x + dialogBounds!.width / 2 - viewport.width / 2)).toBeLessThan(2);
  expect(Math.abs(dialogBounds!.y + dialogBounds!.height / 2 - viewport.height / 2)).toBeLessThan(2);
  const shareUrl = await page.getByLabel("構成URL", { exact: true }).inputValue();
  expect(shareUrl).toMatch(/\?build=.+#list$/);
  await shot(page, info, "10-share");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "構成URLをコピー", exact: true }).click();
  await expect(page.getByRole("button", { name: "コピーしました", exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(shareUrl);
  const newContext = await context.browser()!.newContext({ viewport: page.viewportSize() ?? undefined });
  const sharedPage = await newContext.newPage();
  await sharedPage.goto(shareUrl);
  await expect(sharedPage).toHaveURL(/#list$/);
  await expect(sharedPage.getByRole("main").getByRole("checkbox", { name: /を準備済みにする/ }).first()).toBeChecked();
  await noHorizontalOverflow(sharedPage);
  await newContext.close();
});

test("changing rod and basket recalculates incompatibility without discarding choices", async ({ page }, info) => {
  await builder(page);
  await page.getByRole("button", { name: "ロッドを変更", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "ロッドを選ぶ", exact: true })).toBeVisible();
  await shot(page, info, "06-product-picker");
  await page.getByRole("button", { name: "リバティクラブ 小継 磯 2-300を選ぶ", exact: true }).click();
  await expect(page.getByRole("button", { name: "ロッドを変更", exact: true })).toBeFocused();
  const rodSlot = page.getByRole("article").filter({ has: page.getByRole("button", { name: "ロッドを変更", exact: true }) });
  await expect(rodSlot).toContainText("リバティクラブ 小継 磯 2-300");
  await shot(page, info, "07-product-changed");
  await page.getByRole("button", { name: "サビキカゴを変更", exact: true }).click();
  await page.getByRole("button", { name: "UPK-001 3Pプラカゴ サビキ L-10号を選ぶ", exact: true }).click();
  await expect(page.getByText("非推奨の組み合わせを変更してください。", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "このセットで準備する", exact: true })).toBeDisabled();
  await expect(rodSlot).toContainText("リバティクラブ 小継 磯 2-300");
  await expect(page.getByRole("article").filter({ has: page.getByRole("button", { name: "サビキカゴを変更", exact: true }) })).toContainText("10号");
  await shot(page, info, "08-compatibility-warning");
  await noHorizontalOverflow(page);
  await page.getByRole("button", { name: "おまかせ構成に戻す", exact: true }).click();
  await expect(page.getByRole("button", { name: "このセットで準備する", exact: true })).toBeEnabled();
});

test("a missing required item blocks completion and can be selected again", async ({ page }) => {
  await builder(page);
  await page.getByRole("button", { name: "ロッドを変更", exact: true }).click();
  await page.getByRole("button", { name: "この道具の選択を外す", exact: true }).click();
  await expect(page.getByText("必須の道具をあと1点選んでください。", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "このセットで準備する", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "ロッドを変更", exact: true }).click();
  await page.getByRole("button", { name: "リバティクラブ 小継 磯 3-300を選ぶ", exact: true }).click();
  await expect(page.getByRole("button", { name: "このセットで準備する", exact: true })).toBeEnabled();
});

test("owned equipment is excluded from purchases and remains unverified", async ({ page }) => {
  await builder(page);
  await page.getByRole("checkbox", { name: "ロッドは持っている", exact: true }).check();
  const rodSlot = page.getByRole("article").filter({ has: page.getByRole("button", { name: "ロッドを変更", exact: true }) });
  await expect(rodSlot).toContainText("所持品の型番・仕様は未確認");
  await expect(rodSlot).toContainText("要確認");
  const reelSlot = page.getByRole("article").filter({ has: page.getByRole("button", { name: "リールを変更", exact: true }) });
  await expect(reelSlot).toContainText("要確認");
  await page.getByRole("button", { name: "このセットで準備する", exact: true }).click();
  const rodItem = page.getByRole("article").filter({ has: page.getByRole("checkbox", { name: "ロッドを準備済みにする", exact: true }) });
  await expect(rodItem).toContainText("購入対象外");
  await expect(rodItem.getByRole("link")).toHaveCount(0);
  await expect(rodItem.getByRole("checkbox")).toBeDisabled();
  await page.getByRole("checkbox", { name: "所持品も表示", exact: true }).uncheck();
  await expect(rodItem).toHaveCount(0);
});

test("generic bucket comparison explains restricted use and updates selection", async ({ page }) => {
  await builder(page);
  await page.getByRole("button", { name: "バケツを変更", exact: true }).click();
  await page.getByRole("button", { name: "釣り用と汎用品を比較する", exact: true }).click();
  await expect(page.getByRole("table", { name: "用途と条件を比較して選びましょう", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("海への投下や水汲みには使わない");
  await noHorizontalOverflow(page);
  await page.getByRole("button", { name: "アクティブバケツ ホワイト 8Lを選ぶ", exact: true }).click();
  const bucketSlot = page.getByRole("article").filter({ has: page.getByRole("button", { name: "バケツを変更", exact: true }) });
  await expect(bucketSlot).toContainText("アクティブバケツ ホワイト 8L");
  await expect(bucketSlot).toContainText("要確認");
});

test("invalid shared data and corrupted local data recover without crashing", async ({ page }) => {
  await page.goto("./?build=%7Bnot-a-build%7D#list");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("釣りの準備");
  await expect(page.getByRole("status")).toContainText("共有URLを読み込めませんでした");
  await expect(page).toHaveURL(/#search$/);
  const tampered = createDefaultBuild({ month: 10, area: "tokyo-bay", field: "pier" });
  tampered.selection.rod = "unknown-product-id";
  await page.goto(`./?build=${encodeBuild(tampered)}#list`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("釣りの準備");
  await expect(page.getByRole("status")).toContainText("共有URLを読み込めませんでした");
  await page.evaluate(() => localStorage.setItem("fun-fishing-build-v1", "broken-not-valid-json"));
  await page.goto("./#builder");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("釣りの準備");
  await expect(page.getByRole("status")).toContainText("保存データを読み込めなかった");
});

test("browser back, forward and reset keep the flow usable", async ({ page }) => {
  await complete(page);
  await page.goBack();
  await expect(page).toHaveURL(/#builder$/);
  await expect(page.getByRole("button", { name: "ロッドを変更", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#discover$/);
  await page.goForward();
  await expect(page).toHaveURL(/#builder$/);
  await page.getByRole("button", { name: "このセットで準備する", exact: true }).click();
  await page.getByRole("button", { name: "最初からやり直す", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "最初からはじめる", exact: true }).click();
  await expect(page).toHaveURL(/#search$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("釣りの準備");
});

test("browser back to a shared list restores its URL state after resetting", async ({ page }) => {
  await complete(page);
  const firstCheck = page.getByRole("checkbox", { name: "ロッドを準備済みにする", exact: true });
  await firstCheck.check();
  await page.getByRole("button", { name: "構成URLを共有", exact: true }).first().click();
  const shared = await page.getByLabel("構成URL", { exact: true }).inputValue();
  await page.goto(shared);
  await expect(page.getByRole("checkbox", { name: "ロッドを準備済みにする", exact: true })).toBeChecked();
  await page.getByRole("checkbox", { name: "リールを準備済みにする", exact: true }).check();
  await page.getByRole("button", { name: "最初からやり直す", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "最初からはじめる", exact: true }).click();
  await expect(page).toHaveURL(/#search$/);
  await page.goBack();
  await expect(page).toHaveURL(/\?build=.+#list$/);
  await expect(page.getByRole("checkbox", { name: "ロッドを準備済みにする", exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "リールを準備済みにする", exact: true })).toBeChecked();
});

test("keyboard-only sample flow and dialog Escape handling", async ({ page }) => {
  await fresh(page);
  // All navigation below uses Tab/Enter/Space/Escape rather than mouse clicks.
  async function tabTo(name: string) {
    for (let i = 0; i < 80; i++) {
      const current = await page.evaluate(() => {
        const active = document.activeElement;
        return active && !["BODY", "HTML"].includes(active.tagName) ? active.textContent?.trim() || "" : "";
      });
      if (current.includes(name)) return;
      await page.keyboard.press("Tab");
    }
    throw new Error(`Keyboard focus did not reach ${name}`);
  }
  await tabTo("いつ行く？");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("group", { name: "いつ行く？を選択" })).toBeVisible();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /いつ行く？/ })).toContainText("2月");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("group", { name: "いつ行く？を選択" })).toHaveCount(0);
  await tabTo("まずはサンプルで試す");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#discover$/);
  await tabTo("この釣り方で道具を見る");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#builder$/);
  await tabTo("このセットで準備する");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#list$/);
  await tabTo("構成URLを共有");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const focusedText = await page.evaluate(() => document.activeElement?.textContent || "");
  expect(focusedText).toContain("構成URLを共有");
});

test("automated accessibility checks on four primary screens", async ({ page }) => {
  await fresh(page);
  const violations: { screen: string; issues: unknown[] }[] = [];
  const check = async (screen: string) => {
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const issues = results.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) }));
    if (issues.length) violations.push({ screen, issues });
  };
  await check("home");
  await page.getByRole("button", { name: "まずはサンプルで試す", exact: true }).click();
  await check("discover");
  await page.getByRole("button", { name: "この釣り方で道具を見る", exact: true }).click();
  await check("builder");
  await page.getByRole("button", { name: "このセットで準備する", exact: true }).click();
  await check("list");
  expect(violations).toEqual([]);
});

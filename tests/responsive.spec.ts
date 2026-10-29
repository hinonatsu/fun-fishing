import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const sizes = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

for (const size of sizes) {
  test(`responsive primary screens ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("./#search");
    await mkdir("artifacts/screenshots", { recursive: true });
    const capture = async (screen: string) => {
      const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.viewport);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.screenshot({ path: `artifacts/screenshots/responsive-${size.width}x${size.height}-${screen}.png`, fullPage: true, animations: "disabled", scale: "css" });
    };
    await capture("home");
    await page.getByRole("button", { name: "まずはサンプルで試す", exact: true }).click();
    await capture("discover");
    await page.getByRole("button", { name: "この釣り方で道具を見る", exact: true }).click();
    await capture("builder");
    await page.getByRole("button", { name: "このセットで準備する", exact: true }).click();
    await capture("list");
  });
}

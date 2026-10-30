export const DELIVERY_POSTAL_CODE = '100-0001';

/** Set a public representative Tokyo delivery area; never use a personal address. */
export async function configureAmazonDelivery(page) {
  const header = page.locator('#nav-global-location-popover-link');
  const matches = value => value.replace(/[\s-]/g, '').includes('1000001');
  if (await header.count() && matches(await header.innerText())) return true;
  if (!await header.isVisible()) return false;
  try {
    await header.click({ timeout: 5000 });
    await page.locator('#GLUXZipUpdateInput_0').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('#GLUXZipUpdateInput_0').fill('100');
    await page.locator('#GLUXZipUpdateInput_1').fill('0001');
    await page.locator('#GLUXZipUpdate').click({ timeout: 5000 });
    const close = page.locator('#GLUXConfirmClose');
    if (await close.isVisible()) await close.click({ timeout: 5000 });
    await page.waitForFunction(() => document.querySelector('#nav-global-location-popover-link')?.textContent?.replace(/[\s-]/g, '').includes('1000001'), null, { timeout: 8000 });
    return matches(await header.innerText());
  } catch (error) {
    console.warn(`Delivery configuration failed: ${error.message.split('\n')[0]}`);
    const close = page.locator('#GLUXConfirmClose');
    if (await close.isVisible().catch(() => false)) await close.click({ timeout: 1000 }).catch(() => {});
    return false;
  }
}

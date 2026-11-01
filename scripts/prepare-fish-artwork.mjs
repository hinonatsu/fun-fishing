import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { chromium } from '@playwright/test';

// Encode the built-in image generator's PNGs for the website without changing the artwork.
const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/prepare-fish-artwork.mjs <source-manifest.json>');
const sources = JSON.parse(await readFile(input, 'utf8'));
const output = resolve('public/images/fish');
const originals = resolve('node_modules/.cache/fish-artwork-sources');
await Promise.all([mkdir(output, { recursive: true }), mkdir(originals, { recursive: true })]);
const browser = await chromium.launch({ headless: true });
const inventory = [];
try {
  const page = await browser.newPage();
  for (const source of sources) {
    if (!/^[a-z][a-z0-9-]*$/.test(source.id)) throw new Error('Invalid species identifier');
    const png = await readFile(source.path);
    if (png.readUInt32BE(0) !== 0x89504e47) throw new Error(`Expected PNG: ${source.id}`);
    await copyFile(source.path, join(originals, `${source.id}.png`));
    const encoded = await page.evaluate(async data => {
      const image = new globalThis.Image();
      image.src = data;
      await image.decode();
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = image.width;
      sourceCanvas.height = image.height;
      const sourceContext = sourceCanvas.getContext('2d');
      sourceContext.drawImage(image, 0, 0);
      const sourcePixels = sourceContext.getImageData(0, 0, image.width, image.height).data;
      let sourceTransparentPixels = 0;
      for (let i = 3; i < sourcePixels.length; i += 4) if (sourcePixels[i] === 0) sourceTransparentPixels++;
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const context = canvas.getContext('2d');
      const scale = Math.min(1200 / image.width, 800 / image.height) * .94;
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(image, (1200 - width) / 2, (800 - height) / 2, width, height);
      const pixels = context.getImageData(0, 0, 1200, 800).data;
      let opaquePixels = 0;
      let transparentPixels = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] > 240) opaquePixels++;
        if (pixels[i] === 0) transparentPixels++;
      }
      return { data: canvas.toDataURL('image/webp', .91).split(',')[1], opaquePixels, transparentPixels, sourceTransparentPixels };
    }, `data:image/png;base64,${png.toString('base64')}`);
    if (!encoded.opaquePixels || encoded.transparentPixels < 30_000 || encoded.sourceTransparentPixels < 10_000) throw new Error(`Invalid alpha/empty artwork: ${source.id}`);
    const webp = Buffer.from(encoded.data, 'base64');
    await writeFile(join(output, `${source.id}.webp`), webp);
    const item = { id: source.id, model: source.name, scientificName: source.latin, file: `${source.id}.webp`, width: 1200, height: 800, bytes: webp.length, sha256: createHash('sha256').update(webp).digest('hex'), sourceTransparentPixels: encoded.sourceTransparentPixels, transparentPixels: encoded.transparentPixels };
    inventory.push(item);
    console.log(`${source.id}: ${webp.length} bytes, transparent alpha preserved`);
  }
} finally {
  await browser.close();
}
await writeFile(join(output, 'manifest.json'), `${JSON.stringify(inventory, null, 2)}\n`);
console.log(`Prepared ${inventory.length} illustrations (${inventory.reduce((n, item) => n + item.bytes, 0)} bytes total).`);

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const directory = fileURLToPath(new URL('../public/images/fish/', import.meta.url));
const manifest = JSON.parse(readFileSync(`${directory}/manifest.json`, 'utf8'));

test('all 30 illustrations ship as distinct images without missing or extra files', () => {
  assert.equal(manifest.length, 30);
  assert.equal(new Set(manifest.map(item => item.id)).size, 30);
  assert.equal(new Set(manifest.map(item => item.sha256)).size, 30);
  assert.deepEqual(readdirSync(directory).filter(file => file.endsWith('.webp')).sort(), manifest.map(item => item.file).sort());
});

test('shipped WebP files preserve transparency and match their recorded bytes', () => {
  for (const item of manifest) {
    const data = readFileSync(`${directory}/${item.file}`);
    assert.equal(data.toString('ascii', 0, 4), 'RIFF', item.id);
    assert.equal(data.toString('ascii', 8, 12), 'WEBP', item.id);
    assert.equal(data.length, item.bytes, item.id);
    assert.equal(createHash('sha256').update(data).digest('hex'), item.sha256, item.id);
    assert.deepEqual([item.width, item.height], [1200, 800], item.id);
    assert.ok(item.sourceTransparentPixels > 10_000, item.id);
    assert.ok(item.transparentPixels > 30_000, item.id);
  }
});

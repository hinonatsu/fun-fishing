import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const sourceUrl = new URL('./gear-artwork-source.tsx', import.meta.url);
const temporaryModule = new URL(`./.gear-artwork-${process.pid}.mjs`, import.meta.url);
const output = new URL('../public/images/gear/', import.meta.url);
const source = await readFile(sourceUrl, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: fileURLToPath(sourceUrl),
}).outputText;

await mkdir(output, { recursive: true });
try {
  await writeFile(temporaryModule, compiled);
  const { GearIllustration, gearArtworkCategories } = await import(temporaryModule.href);
  const drawings = [
    ...gearArtworkCategories.map(category => ({ category, file: category })),
    { category: 'rod', variant: 'vertical-rod', file: 'rod-vertical' },
    { category: 'reel', variant: 'drum', file: 'reel-drum' },
  ];
  for (const { file, ...props } of drawings) {
    const svg = renderToStaticMarkup(createElement(GearIllustration, {
      ...props, shadow: false, xmlns: 'http://www.w3.org/2000/svg',
    }));
    await writeFile(new URL(`${file}.svg`, output), `${svg}\n`);
  }
  console.log(`Prepared ${drawings.length} original SVG illustrations.`);
} finally {
  await unlink(temporaryModule);
}

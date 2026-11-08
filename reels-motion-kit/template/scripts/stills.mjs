// Renderiza quadros de teste (PNG, metade da resolução) sem renderizar o vídeo inteiro.
// Uso: node scripts/stills.mjs --comp Main --times 5 12.5 30      (segundos)
//      npm run stills -- 5 12.5 30
//      npm run ds:preview                                         (prancha do design system)
import path from 'path';
import fs from 'fs';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const comp = args.includes('--comp') ? args[args.indexOf('--comp') + 1] : 'Main';
const ti = args.indexOf('--times');
const times = (ti >= 0 ? args.slice(ti + 1) : []).filter((x) => !x.startsWith('--')).map(Number);
if (!times.length) times.push(0);
const scale = args.includes('--scale') ? Number(args[args.indexOf('--scale') + 1]) : 0.5;

// Browser: usa REMOTION_BROWSER (caminho do chrome-headless-shell) se existir; senão o Remotion baixa o dele na primeira vez.
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const outDir = path.join(root, 'work', 'stills');
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable});
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = path.join(outDir, `${comp}_${String(t).replace('.', '_')}.png`);
  await renderStill({composition, serveUrl, frame, output, browserExecutable, scale});
  console.log('quadro', t, '->', output);
}

// Render completo com validações. Uso: npm run render   (saída: out/video.mp4; depois: npm run finalize)
import path from 'path';
import fs from 'fs';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const root = path.resolve(import.meta.dirname, '..');
if (!fs.existsSync(path.join(root, 'public/source.mp4'))) throw new Error('public/source.mp4 não existe — coloque o vídeo bruto lá.');
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const concurrency = Number(process.env.CONCURRENCY || 4);
fs.mkdirSync(path.join(root, 'out'), {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: 'Main', browserExecutable});
console.log(`renderizando ${composition.durationInFrames} quadros (${(composition.durationInFrames / composition.fps / 60).toFixed(1)} min) com concurrency ${concurrency}`);
let last = 0;
await renderMedia({
  composition, serveUrl, codec: 'h264', crf: 20, concurrency, browserExecutable,
  outputLocation: path.join(root, 'out/video.mp4'),
  onProgress: ({progress, renderedFrames}) => {
    const pct = Math.floor(progress * 100);
    if (pct >= last + 5) { last = pct; console.log(`${pct}%  (${renderedFrames} quadros)`); }
  },
});
console.log('pronto: out/video.mp4');

// Gera um source.mp4 de teste (720x1280, 24 s, tom de voz sintético) para o "smoke test" do template, sem precisar de vídeo real.
// Uso: node scripts/make_demo_source.mjs        → public/source.mp4
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
fs.mkdirSync(path.join(root, 'public'), {recursive: true});
const out = path.join(root, 'public/source.mp4');
execFileSync('ffmpeg', [
  '-y', '-v', 'error',
  '-f', 'lavfi', '-i', 'testsrc2=size=720x1280:rate=30:duration=24',
  '-f', 'lavfi', '-i', 'sine=frequency=220:duration=24',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28', '-c:a', 'aac', '-shortest', out,
], {stdio: 'inherit'});
console.log('gerado', out);

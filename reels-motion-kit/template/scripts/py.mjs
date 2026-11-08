// Executa um script Python do kit com o Python certo (o venv do Whisper, se existir) e UTF-8 ligado.
// Uso: node scripts/py.mjs scripts/transcribe.py public/source.mp4 --lang pt --model small
//      node scripts/py.mjs scripts/corte/diagnostico.py public/source.mp4
// Ordem de busca: $KIT_PYTHON · C:\wh\v\Scripts\python.exe · ~/.venvs/whisper/bin/python · python3 · python · py
import {spawnSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const cands = [
  process.env.KIT_PYTHON,
  'C:\\wh\\v\\Scripts\\python.exe',
  path.join(os.homedir(), '.venvs', 'whisper', 'bin', 'python'),
  'python3', 'python', 'py',
].filter(Boolean);
const works = (c) => {
  if (path.isAbsolute(c) && !fs.existsSync(c)) return false;
  const r = spawnSync(c, ['-c', 'import sys; print(sys.version_info[:2] >= (3, 9))'], {encoding: 'utf8'});
  return r.status === 0 && r.stdout.trim() === 'True';
};
const py = cands.find(works);
if (!py) {
  console.error('Nenhum Python 3.9+ encontrado. Veja references/01-setup.md (venv curto em C:\\wh\\v).');
  process.exit(1);
}
const r = spawnSync(py, process.argv.slice(2), {stdio: 'inherit', env: {...process.env, PYTHONUTF8: '1'}});
process.exit(r.status ?? 1);

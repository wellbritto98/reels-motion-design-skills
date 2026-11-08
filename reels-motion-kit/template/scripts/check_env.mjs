// Diagnóstico do ambiente. Uso: node scripts/check_env.mjs
// Imprime OK/FALTA com o comando exato para corrigir. Não instala nada.
import {execSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const out = [];
const sh = (cmd) => { try { return execSync(cmd, {stdio: ['ignore', 'pipe', 'ignore']}).toString().trim(); } catch { return null; } };
const ok = (name, detail) => out.push(`OK     ${name}${detail ? ' — ' + detail : ''}`);
const miss = (name, fix) => out.push(`FALTA  ${name}\n         → ${fix}`);

const node = process.versions.node.split('.').map(Number);
node[0] >= 20 ? ok('Node', process.version) : miss('Node >= 20', 'instale o Node LTS (https://nodejs.org) ou winget install OpenJS.NodeJS.LTS');

const ff = sh('ffmpeg -version');
ff ? ok('ffmpeg', ff.split('\n')[0].slice(0, 60)) : miss('ffmpeg', 'Windows: winget install Gyan.FFmpeg · macOS: brew install ffmpeg · Linux: sudo apt install ffmpeg');
sh('ffprobe -version') ? ok('ffprobe') : miss('ffprobe', 'vem junto com o ffmpeg; reabra o terminal depois de instalar');

const py = ['python', 'python3', 'py'].map((c) => [c, sh(`${c} --version`)]).find(([, v]) => v && /Python 3\.(9|1\d)/.test(v));
py ? ok('Python', `${py[0]} (${py[1]})`) : miss('Python 3.9+', 'Windows: winget install Python.Python.3.11 · macOS: brew install python · evite o alias da Microsoft Store');

const cache = path.join(os.homedir(), '.cache', 'whisper');
const models = fs.existsSync(cache) ? fs.readdirSync(cache).filter((f) => f.endsWith('.pt')) : [];
models.length ? ok('modelos Whisper', models.join(', ') + (models.every((m) => m.includes('.en')) ? '  ⚠ só inglês (.en): para português baixe small/medium (sem .en)' : '')) : miss('modelo Whisper', 'rode scripts/transcribe.py: ele baixa o modelo escolhido (small ≈ 461 MB) — peça autorização ao usuário antes');

const venv = ['C:/wh/v', path.join(os.homedir(), '.venvs', 'whisper')].find((p) => fs.existsSync(p));
venv ? ok('venv do Whisper', venv) : miss('venv do Whisper', 'veja references/01-setup.md §Python (use caminho CURTO, ex. C:\\wh\\v, no Windows)');

const chromeDirs = [path.join(process.cwd(), 'node_modules', '.remotion')];
const chrome = chromeDirs.find((d) => fs.existsSync(d));
process.env.REMOTION_BROWSER && fs.existsSync(process.env.REMOTION_BROWSER)
  ? ok('Chrome Headless Shell (REMOTION_BROWSER)', process.env.REMOTION_BROWSER)
  : chrome
    ? ok('Chrome Headless Shell do Remotion', chrome)
    : out.push('AVISO  Chrome Headless Shell ainda não existe → o Remotion baixa sozinho no 1º render/still (~100 MB; peça autorização). Para evitar: REMOTION_BROWSER=<caminho do chrome-headless-shell.exe>');

console.log(out.join('\n'));
console.log(`\nCPU: ${os.cpus().length} núcleos · RAM livre: ${(os.freemem() / 1e9).toFixed(1)} GB → CONCURRENCY sugerido: ${Math.max(2, Math.min(6, Math.floor(os.cpus().length / 2)))}`);
process.exitCode = out.some((l) => l.startsWith('FALTA')) ? 1 : 0;

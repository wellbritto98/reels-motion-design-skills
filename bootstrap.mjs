#!/usr/bin/env node
// Setup inicial das skills deste repositório para QUALQUER harness (Claude Code, Codex, Antigravity, outros). Sem dependências (Node ≥ 18).
//
//   node bootstrap.mjs check                                              diagnóstico do ambiente (não instala nada)
//   node bootstrap.mjs install-skills --target <claude|codex|antigravity|all> [--scope project|global] [--project <pasta>] [--skills reels,design|all] [--dry-run] [--force]
//   node bootstrap.mjs new-project <pasta-curta> [--demo] [--install] [--design]      cria um projeto de vídeo a partir do template
//   node bootstrap.mjs whisper-venv [--venv <pasta>] [--gpu] [--yes]      cria o venv do Whisper (baixa ~700 MB; só executa com --yes)
//   node bootstrap.mjs --help
//
// Regra de ouro: comandos que baixam/instalam algo pesado só executam com --yes (ou --install). Mostre o plano ao usuário e peça autorização antes.
import {execFileSync, execSync, spawnSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const here = import.meta.dirname;
const args = process.argv.slice(2);
const cmd = args[0];
const flag = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const has = (n) => args.includes(n);
const isWin = process.platform === 'win32';
const home = os.homedir();
const sh = (c, a = []) => { try { const o = c === 'npm' ? execSync(['npm', ...a].join(' '), {stdio: ['ignore', 'pipe', 'ignore']}) : execFileSync(c, a, {stdio: ['ignore', 'pipe', 'ignore']}); return o.toString().trim(); } catch { return null; } };

const SKILLS = {reels: {dir: 'reels-motion-kit', name: 'reels-motion-kit'}, design: {dir: 'design-system-skill/design-system', name: 'design-system'}};
const DEST = {
  claude: {project: '.claude/skills', global: path.join(home, '.claude/skills')},
  codex: {project: '.agents/skills', global: path.join(home, '.agents/skills')},
  antigravity: {project: '.agents/skills', global: path.join(home, '.gemini/config/skills')},
};

function usage() {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 12).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
}

function check() {
  const rows = [];
  const ok = (n, d = '') => rows.push(`OK     ${n}${d ? ' — ' + d : ''}`);
  const no = (n, fix) => rows.push(`FALTA  ${n}\n         → ${fix}`);
  const warn = (n, d) => rows.push(`AVISO  ${n} — ${d}`);
  const major = Number(process.versions.node.split('.')[0]);
  major >= 20 ? ok('Node', process.version) : no('Node >= 20', isWin ? 'winget install OpenJS.NodeJS.LTS' : 'https://nodejs.org (ou brew/apt)');
  sh('npm', ['-v']) ? ok('npm', sh('npm', ['-v'])) : no('npm', 'vem com o Node');
  sh('git', ['--version']) ? ok('git') : warn('git', 'necessário só para versionar/publicar');
  const ff = sh('ffmpeg', ['-version']);
  ff ? ok('ffmpeg', ff.split('\n')[0].slice(0, 50)) : no('ffmpeg/ffprobe', isWin ? 'winget install Gyan.FFmpeg' : 'brew install ffmpeg | sudo apt install ffmpeg');
  const py = ['python3', 'python', 'py'].map((c) => [c, sh(c, ['--version'])]).find(([, v]) => v && /Python 3\.(9|\d{2})/.test(v));
  py ? ok('Python', `${py[0]} ${py[1]}`) : no('Python 3.9+', isWin ? 'winget install Python.Python.3.11 (evite o alias da Microsoft Store)' : 'brew install python | sudo apt install python3 python3-venv');
  const venv = [process.env.KIT_VENV, isWin ? 'C:\\wh\\v' : path.join(home, '.venvs', 'whisper')].filter(Boolean).find((p) => fs.existsSync(p));
  venv ? ok('venv do Whisper', venv) : warn('venv do Whisper', 'não existe (só necessário para transcrever/cortar): node bootstrap.mjs whisper-venv --yes');
  const cache = path.join(home, '.cache', 'whisper');
  const models = fs.existsSync(cache) ? fs.readdirSync(cache).filter((f) => f.endsWith('.pt')) : [];
  models.length ? ok('modelos Whisper', models.join(', ') + (models.every((m) => m.includes('.en')) ? '  (⚠ só inglês: para PT use small/medium)' : '')) : warn('modelo Whisper', 'nenhum em ~/.cache/whisper (baixa no 1º uso; peça autorização: small ≈ 461 MB)');
  const targets = Object.entries(DEST).flatMap(([t, d]) => [[t + ' global', path.join(d.global)]]);
  for (const [n, p] of targets) {
    const found = Object.values(SKILLS).filter((s) => fs.existsSync(path.join(p, s.name, 'SKILL.md'))).map((s) => s.name);
    found.length ? ok(`skills em ${n}`, found.join(', ')) : rows.push(`INFO   skills em ${n}: nenhuma (${p})`);
  }
  console.log(rows.join('\n'));
  console.log(`\nCPU ${os.cpus().length} núcleos · RAM livre ${(os.freemem() / 1e9).toFixed(1)} GB · plataforma ${process.platform}`);
  process.exitCode = rows.some((r) => r.startsWith('FALTA')) ? 1 : 0;
}

function installSkills() {
  const target = flag('--target');
  const scope = flag('--scope', 'project');
  const project = path.resolve(flag('--project', process.cwd()));
  const which = (flag('--skills', 'all') === 'all' ? Object.keys(SKILLS) : flag('--skills').split(','));
  if (!['claude', 'codex', 'antigravity', 'all'].includes(target) || !['project', 'global'].includes(scope)) { usage(); process.exit(1); }
  const targets = target === 'all' ? ['claude', 'codex', 'antigravity'] : [target];
  const seen = new Set();
  for (const t of targets) for (const k of which) {
    const s = SKILLS[k];
    if (!s) { console.error('skill desconhecida: ' + k); process.exit(1); }
    const base = scope === 'project' ? path.join(project, DEST[t].project) : DEST[t].global;
    const to = path.join(base, s.name);
    if (seen.has(to)) { console.log(`= ${t}/${s.name}: mesmo destino já coberto (${to})`); continue; }
    seen.add(to);
    if (fs.existsSync(to) && !has('--force')) { console.log(`! ${to} já existe (use --force)`); continue; }
    console.log(`${has('--dry-run') ? '[dry-run] ' : ''}${t} (${scope}) ${s.name} → ${to}`);
    if (has('--dry-run')) continue;
    fs.mkdirSync(path.dirname(to), {recursive: true});
    fs.cpSync(path.join(here, s.dir), to, {recursive: true, force: true, filter: (p) => !/[\\/](node_modules|\.git|work|out)([\\/]|$)/.test(p)});
  }
  if (!has('--dry-run')) console.log('\nFeito. Reinicie a sessão do agente para redescobrir as skills (Antigravity CLI: /skills).');
}

function newProject() {
  const dir = path.resolve(args[1] ?? '');
  if (!args[1]) { usage(); process.exit(1); }
  if (fs.existsSync(dir) && fs.readdirSync(dir).length) { console.error(`pasta ${dir} não está vazia`); process.exit(1); }
  if (isWin && dir.length > 40) console.warn('AVISO: caminho longo no Windows quebra o pip/torch; prefira algo como C:\\reels\\meu-video');
  fs.mkdirSync(dir, {recursive: true});
  fs.cpSync(path.join(here, 'reels-motion-kit/template'), dir, {recursive: true, filter: (p) => !/[\\/](node_modules|work|out)([\\/]|$)/.test(p)});
  console.log('projeto criado em ' + dir);
  const run = (c, a) => (c === 'npm' ? spawnSync([c, ...a].join(' '), {cwd: dir, stdio: 'inherit', shell: true}) : spawnSync(c, a, {cwd: dir, stdio: 'inherit'}));
  if (has('--install')) { console.log('\n> npm install'); if (run('npm', ['install']).status !== 0) process.exit(1); }
  if (has('--demo')) { console.log('\n> vídeo de teste'); run('node', ['scripts/make_demo_source.mjs']); }
  if (has('--design') || has('--install')) { console.log('\n> design system'); run('node', ['scripts/apply-design-system.mjs', 'design-system/design-system.json']); }
  console.log(`\nPróximo: cd "${dir}" ${has('--install') ? '' : '&& npm install '}&& node scripts/check_env.mjs  (fluxo completo: reels-motion-kit/SKILL.md)`);
}

function whisperVenv() {
  const venv = path.resolve(flag('--venv', isWin ? 'C:\\wh\\v' : path.join(home, '.venvs', 'whisper')));
  const py = ['python3', 'python', 'py'].find((c) => { const v = sh(c, ['--version']); return v && /Python 3\.(9|\d{2})/.test(v); });
  const bin = path.join(venv, isWin ? 'Scripts/python.exe' : 'bin/python');
  const torchIdx = has('--gpu') ? '(índice padrão: build com CUDA, ~2,5 GB)' : 'https://download.pytorch.org/whl/cpu (≈ 200 MB)';
  console.log(`Plano: criar venv em ${venv}; instalar torch ${torchIdx} e openai-whisper (~700 MB no total, só CPU).\nModelos do Whisper NÃO são baixados aqui (baixam no 1º uso, com autorização).`);
  if (isWin && venv.length > 20) console.warn('AVISO: no Windows use caminho CURTO (ex.: C:\\wh\\v) — caminhos longos quebram o pip.');
  if (!py) { console.error('Python 3.9+ não encontrado.'); process.exit(1); }
  if (!has('--yes')) { console.log('\n(simulação) Rode de novo com --yes depois de o usuário autorizar.'); return; }
  fs.mkdirSync(path.dirname(venv), {recursive: true});
  const steps = [[py, ['-m', 'venv', venv]], [bin, ['-m', 'pip', 'install', '--upgrade', 'pip']], [bin, ['-m', 'pip', 'install', 'torch', ...(has('--gpu') ? [] : ['--index-url', 'https://download.pytorch.org/whl/cpu'])]], [bin, ['-m', 'pip', 'install', 'openai-whisper']], [bin, ['-c', 'import torch, whisper; print("ok", torch.__version__)']]];
  for (const [c, a] of steps) { console.log('\n> ' + [c, ...a].join(' ')); if (spawnSync(c, a, {stdio: 'inherit'}).status !== 0) { console.error('falhou — veja a mensagem acima (reels-motion-kit/references/01-setup.md §6)'); process.exit(1); } }
  console.log(`\nPronto. Use KIT_PYTHON="${bin}" ou deixe o node scripts/py.mjs achar o venv.`);
}

if (!cmd || has('--help')) usage();
else if (cmd === 'check') check();
else if (cmd === 'install-skills') installSkills();
else if (cmd === 'new-project') newProject();
else if (cmd === 'whisper-venv') whisperVenv();
else { usage(); process.exit(1); }

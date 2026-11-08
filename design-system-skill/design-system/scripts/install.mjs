#!/usr/bin/env node
// Instala esta skill nos diretórios que cada agente lê. Sem dependências. Quem executa é o USUÁRIO (ou a IA com autorização dele).
//
//   node scripts/install.mjs --target <claude|codex|antigravity|all> [--scope project|global] [--project <pasta>] [--dry-run] [--force]
//
// Caminhos (conferidos nas docs oficiais em 08/11/2026 — confira de novo se a ferramenta mudou):
//   Claude Code   projeto: <proj>/.claude/skills/design-system        global: ~/.claude/skills/design-system
//   Codex         projeto: <proj>/.agents/skills/design-system        global: ~/.agents/skills/design-system   (legado: $CODEX_HOME/skills)
//   Antigravity   projeto: <proj>/.agents/skills/design-system        global: ~/.gemini/config/skills/design-system
//                 (legado IDE: ~/.gemini/antigravity/skills · CLI: ~/.gemini/antigravity-cli/skills · .agent/skills ainda funciona)
// Codex e Antigravity compartilham .agents/skills no projeto: instalar um já serve ao outro.
import fs from 'fs';
import os from 'os';
import path from 'path';

const args = process.argv.slice(2);
const flag = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const target = flag('--target');
const scope = flag('--scope', 'project');
const project = path.resolve(flag('--project', process.cwd()));
const dry = args.includes('--dry-run');
const force = args.includes('--force');
const NAME = 'design-system';
const src = path.resolve(import.meta.dirname, '..');
const home = os.homedir();

if (!target || !['claude', 'codex', 'antigravity', 'all'].includes(target) || !['project', 'global'].includes(scope)) {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 14).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(target ? 1 : 0);
}
const dest = {
  claude: {project: path.join(project, '.claude/skills', NAME), global: path.join(home, '.claude/skills', NAME)},
  codex: {project: path.join(project, '.agents/skills', NAME), global: path.join(home, '.agents/skills', NAME)},
  antigravity: {project: path.join(project, '.agents/skills', NAME), global: path.join(home, '.gemini/config/skills', NAME)},
};
const targets = target === 'all' ? ['claude', 'codex', 'antigravity'] : [target];
const seen = new Set();
for (const t of targets) {
  const to = dest[t][scope];
  if (seen.has(to)) { console.log(`= ${t}: mesmo destino de outro alvo (${to}); já coberto`); continue; }
  seen.add(to);
  if (fs.existsSync(to) && !force) { console.log(`! ${t}: ${to} já existe (use --force para sobrescrever)`); continue; }
  console.log(`${dry ? '[dry-run] ' : ''}${t} (${scope}) → ${to}`);
  if (dry) continue;
  fs.mkdirSync(path.dirname(to), {recursive: true});
  fs.cpSync(src, to, {recursive: true, force: true, filter: (p) => !/[\\/](node_modules|\.git)([\\/]|$)/.test(p)});
}
if (!dry) console.log('\nFeito. Reinicie a sessão do agente (ou rode /skills no Antigravity CLI) para ele redescobrir as skills.');

#!/usr/bin/env node
// Gera os ARTEFATOS (HTML autocontido + Markdown) de um audit / documento de componente / proposta de componente / extração de tokens.
// Funciona igual em qualquer agente (Claude Code, Codex, Antigravity): entra JSON, saem arquivos.
//
//   node scripts/render-artifact.mjs <audit|component|extend|extract> <entrada.json> [--out design-system/artifacts] [--no-html] [--no-md]
//   node scripts/render-artifact.mjs --help
//
// Saída: <out>/<tipo>-<slug>.html  e  <out>/<tipo>-<slug>.md   (o .md segue EXATAMENTE os formatos originais de audit/document/extend)
// Esquemas de entrada: references/artifacts.md. Campos ausentes são omitidos (nunca inventados).
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.includes('--help') || args.length < 2) {
  console.log('uso: node scripts/render-artifact.mjs <audit|component|extend|extract> <entrada.json> [--out pasta] [--no-html] [--no-md]\nEsquemas: references/artifacts.md');
  process.exit(args.includes('--help') ? 0 : 1);
}
const [kind, input] = args;
const outDir = path.resolve(args.includes('--out') ? args[args.indexOf('--out') + 1] : 'design-system/artifacts');
const d = JSON.parse(fs.readFileSync(input, 'utf8'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => String(s ?? 'sem-nome').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sem-nome';
const arr = (x) => (Array.isArray(x) ? x : []);

/* ---------------------------------- Markdown (formatos originais) ---------------------------------- */
const mdTable = (head, rows) => (rows.length ? `| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n${rows.map((r) => `| ${r.map((c) => String(c ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`).join('\n')}\n` : '_nenhum_\n');
const icon = (v) => ({ok: '✅', warn: '⚠️', missing: '❌'}[v] ?? v ?? '—');

const md = {
  audit: () => `## Design System Audit

### Summary
**Components reviewed:** ${d.summary?.components ?? arr(d.components).length} | **Issues found:** ${d.summary?.issues ?? '—'} | **Score:** ${d.summary?.score ?? '—'}/100

### Naming Consistency
${mdTable(['Issue', 'Components', 'Recommendation'], arr(d.naming).map((n) => [n.issue, arr(n.components).join(', '), n.recommendation]))}
### Token Coverage
${mdTable(['Category', 'Defined', 'Hardcoded Values Found'], arr(d.tokens).map((t) => [t.category, t.defined, t.hardcoded + (t.note ? ` — ${t.note}` : '')]))}
### Component Completeness
${mdTable(['Component', 'States', 'Variants', 'Docs', 'Score'], arr(d.components).map((c) => [c.name, icon(c.states), icon(c.variants), icon(c.docs), `${c.score}/10`]))}
### Priority Actions
${arr(d.priorities).map((p, i) => `${i + 1}. ${p}`).join('\n') || '_nenhuma_'}
${arr(d.reviewPasses).length ? '\n### Review Passes\n' + mdTable(['Pass', 'Findings', 'Severity', 'Notes'], arr(d.reviewPasses).map((r) => [r.pass, r.findings, r.severity, r.notes])) : ''}${d.notes ? `\n### Notes\n${d.notes}\n` : ''}`,

  component: () => `## Component: ${d.name}

### Description
${d.description ?? '—'}

### Variants
${mdTable(['Variant', 'Use When'], arr(d.variants).map((v) => [v.name, v.useWhen]))}
### Props / Properties
${mdTable(['Property', 'Type', 'Default', 'Description'], arr(d.props).map((p) => [p.name, p.type, p.default, p.description]))}
### States
${mdTable(['State', 'Visual', 'Behavior'], arr(d.states).map((s) => [s.state, s.visual, s.behavior]))}
### Accessibility
- **Role**: ${d.accessibility?.role ?? '—'}
- **Keyboard**: ${d.accessibility?.keyboard ?? '—'}
- **Screen reader**: ${d.accessibility?.screenReader ?? '—'}

### Do's and Don'ts
${mdTable(['✅ Do', "❌ Don't"], Array.from({length: Math.max(arr(d.dos).length, arr(d.donts).length)}, (_, i) => [arr(d.dos)[i], arr(d.donts)[i]]))}
### Code Example
${d.code?.source ? '```' + (d.code.lang ?? '') + '\n' + d.code.source + '\n```' : '_sem exemplo_'}
`,

  extend: () => `## New Component: ${d.name}

### Problem
${d.problem ?? '—'}

### Existing Patterns
${mdTable(['Related Component', 'Similarity', "Why It's Not Enough"], arr(d.existing).map((e) => [e.component, e.similarity, e.whyNot]))}
### Proposed Design

#### API / Props
${mdTable(['Property', 'Type', 'Default', 'Description'], arr(d.api).map((p) => [p.name, p.type, p.default, p.description]))}
#### Variants
${mdTable(['Variant', 'Use When', 'Visual'], arr(d.variants).map((v) => [v.name, v.useWhen, v.visual]))}
#### States
${mdTable(['State', 'Behavior', 'Notes'], arr(d.states).map((s) => [s.state, s.behavior, s.notes]))}
#### Tokens Used
- Colors: ${arr(d.tokens?.colors).join(', ') || '—'}
- Spacing: ${arr(d.tokens?.spacing).join(', ') || '—'}
- Typography: ${arr(d.tokens?.typography).join(', ') || '—'}

### Accessibility
- **Role**: ${d.accessibility?.role ?? '—'}
- **Keyboard**: ${d.accessibility?.keyboard ?? '—'}
- **Screen reader**: ${d.accessibility?.screenReader ?? '—'}

### Open Questions
${arr(d.openQuestions).map((q) => `- ${q}`).join('\n') || '_nenhuma_'}
`,

  extract: () => `## Design Tokens Extraction

### Sources
${arr(d.sources).map((s) => `- ${s}`).join('\n') || '_não informadas_'}

### Extracted
${mdTable(['Category', 'Count', 'Notes'], arr(d.categories).map((c) => [c.category, c.count, c.notes]))}
### Gaps (decisões do usuário — nada foi inventado)
${arr(d.gaps).map((g) => `- ${g}`).join('\n') || '_nenhum_'}

### Inconsistencies (sinalizadas, não mescladas)
${mdTable(['Issue', 'Values', 'Where', 'Suggestion'], arr(d.inconsistencies).map((i) => [i.issue, arr(i.values).join(', '), i.where, i.suggestion]))}
### Output
${d.output ? `Tokens escritos em \`${d.output}\`.` : '_arquivo de tokens não gerado_'}

### Next Steps
${arr(d.nextSteps).map((s, i) => `${i + 1}. ${s}`).join('\n') || '_—_'}
`,
};

/* ---------------------------------- HTML (autocontido, claro/escuro, responsivo) ---------------------------------- */
const css = `:root{--bg:#f6f7f9;--card:#fff;--ink:#14181f;--mute:#5b6676;--line:#dde2ea;--accent:#3b5bdb;--ok:#1f9d63;--warn:#c27c0e;--bad:#d1384b;--chip:#eef1f6}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0f1319;--card:#171d27;--ink:#eef1f6;--mute:#9aa6b8;--line:#283140;--accent:#7c93ff;--ok:#38d996;--warn:#f0b445;--bad:#ff6b7d;--chip:#212a38}}
:root[data-theme="dark"]{--bg:#0f1319;--card:#171d27;--ink:#eef1f6;--mute:#9aa6b8;--line:#283140;--accent:#7c93ff;--ok:#38d996;--warn:#f0b445;--bad:#ff6b7d;--chip:#212a38}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:980px;margin:0 auto;padding:32px 16px 64px}h1{font-size:clamp(26px,5vw,38px);margin:0 0 4px;letter-spacing:-.02em}
h2{font-size:20px;margin:36px 0 12px}.sub{color:var(--mute);margin:0 0 24px}.kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:700}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:20px 0}.stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.stat b{display:block;font-size:30px;line-height:1.1}.stat span{color:var(--mute);font-size:13px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:4px 0;overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:560px}
th,td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--line);vertical-align:top;font-size:14.5px}th{color:var(--mute);font-weight:600;font-size:12.5px;text-transform:uppercase;letter-spacing:.06em}tr:last-child td{border-bottom:0}
.pill{display:inline-block;padding:2px 10px;border-radius:99px;background:var(--chip);font-size:12.5px;font-weight:600}.ok{color:var(--ok)}.warn{color:var(--warn)}.bad{color:var(--bad)}
.bar{height:10px;border-radius:5px;background:var(--chip);overflow:hidden;min-width:120px}.bar i{display:block;height:100%;background:var(--accent)}
ol.prio{padding-left:22px}ol.prio li{margin:8px 0}pre{background:var(--chip);border-radius:12px;padding:14px;overflow-x:auto;font-size:13.5px}code{font-family:ui-monospace,Menlo,Consolas,monospace}
.swatch{display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid var(--line);vertical-align:-2px;margin-right:6px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:640px){.grid2{grid-template-columns:1fr}}
.dos li::marker{color:var(--ok)}.donts li::marker{color:var(--bad)}footer{margin-top:40px;color:var(--mute);font-size:12.5px}`;
const tbl = (head, rows) => (rows.length ? `<div class="card"><table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="sub">Nenhum item.</p>');
const status = (v) => ({ok: '<span class="ok">✅</span>', warn: '<span class="warn">⚠️</span>', missing: '<span class="bad">❌</span>'}[v] ?? esc(v ?? '—'));
const colorChip = (v) => (/^#[0-9a-f]{3,8}$/i.test(String(v).trim()) ? `<span class="swatch" style="background:${esc(v)}"></span>` : '');
const stat = (n, l) => `<div class="stat"><b>${esc(n)}</b><span>${esc(l)}</span></div>`;
const list = (a, cls = '') => (arr(a).length ? `<ul class="${cls}">${arr(a).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="sub">Nenhum.</p>');
const scoreColor = (s) => (s >= 80 ? 'ok' : s >= 55 ? 'warn' : 'bad');

const html = {
  audit: () => {
    const sc = d.summary?.score;
    return `<p class="kicker">Design System Audit</p><h1>${esc(d.title ?? d.project ?? 'Auditoria')}</h1><p class="sub">${esc(d.project ?? '')} ${d.date ? '· ' + esc(d.date) : ''}</p>
<div class="stats">${stat(d.summary?.components ?? arr(d.components).length, 'componentes revisados')}${stat(d.summary?.issues ?? '—', 'problemas encontrados')}<div class="stat"><b class="${scoreColor(sc)}">${esc(sc ?? '—')}<small>/100</small></b><span>pontuação</span></div></div>
<h2>Cobertura de tokens</h2>${tbl(['Categoria', 'Definidos', 'Valores fixos', 'Cobertura'], arr(d.tokens).map((t) => [esc(t.category), esc(t.defined), esc(t.hardcoded) + (t.note ? `<br><small class="sub">${esc(t.note)}</small>` : ''), t.coverage != null ? `<div class="bar" title="${esc(t.coverage)}%"><i style="width:${Math.min(100, Math.max(0, t.coverage))}%"></i></div>` : '—']))}
<h2>Consistência de nomes</h2>${tbl(['Problema', 'Componentes', 'Recomendação'], arr(d.naming).map((n) => [esc(n.issue), esc(arr(n.components).join(', ')), esc(n.recommendation)]))}
<h2>Completude dos componentes</h2>${tbl(['Componente', 'Estados', 'Variantes', 'Docs', 'Nota'], arr(d.components).map((c) => [`<b>${esc(c.name)}</b>`, status(c.states), status(c.variants), status(c.docs), `<span class="pill">${esc(c.score)}/10</span>`]))}
${arr(d.reviewPasses).length ? `<h2>Passes de revisão</h2>${tbl(['Passe', 'Achados', 'Severidade', 'Notas'], arr(d.reviewPasses).map((r) => [esc(r.pass), esc(r.findings), `<span class="pill">${esc(r.severity)}</span>`, esc(r.notes)]))}` : ''}
<h2>Ações prioritárias</h2><ol class="prio">${arr(d.priorities).map((p) => `<li>${esc(p)}</li>`).join('')}</ol>${d.notes ? `<h2>Notas</h2><p>${esc(d.notes)}</p>` : ''}`;
  },
  component: () => `<p class="kicker">Componente</p><h1>${esc(d.name)}</h1><p class="sub">${esc(d.description)}</p>
<h2>Variantes</h2>${tbl(['Variante', 'Usar quando'], arr(d.variants).map((v) => [`<b>${esc(v.name)}</b>`, esc(v.useWhen)]))}
<h2>Propriedades</h2>${tbl(['Propriedade', 'Tipo', 'Padrão', 'Descrição'], arr(d.props).map((p) => [`<code>${esc(p.name)}</code>`, `<code>${esc(p.type)}</code>`, esc(p.default), esc(p.description)]))}
<h2>Estados</h2>${tbl(['Estado', 'Visual', 'Comportamento'], arr(d.states).map((s) => [`<b>${esc(s.state)}</b>`, esc(s.visual), esc(s.behavior)]))}
<h2>Acessibilidade</h2><div class="card" style="padding:14px 18px"><p><b>Papel (role):</b> ${esc(d.accessibility?.role ?? '—')}</p><p><b>Teclado:</b> ${esc(d.accessibility?.keyboard ?? '—')}</p><p style="margin:0"><b>Leitor de tela:</b> ${esc(d.accessibility?.screenReader ?? '—')}</p></div>
<h2>Faça / Não faça</h2><div class="grid2"><div class="card" style="padding:12px 18px"><b>✅ Faça</b>${list(d.dos, 'dos')}</div><div class="card" style="padding:12px 18px"><b>❌ Não faça</b>${list(d.donts, 'donts')}</div></div>
${d.code?.source ? `<h2>Exemplo</h2><pre><code>${esc(d.code.source)}</code></pre>` : ''}`,
  extend: () => `<p class="kicker">Novo componente · proposta</p><h1>${esc(d.name)}</h1><p class="sub">${esc(d.problem)}</p>
<h2>Padrões existentes</h2>${tbl(['Componente relacionado', 'Semelhança', 'Por que não basta'], arr(d.existing).map((e) => [`<b>${esc(e.component)}</b>`, esc(e.similarity), esc(e.whyNot)]))}
<h2>API</h2>${tbl(['Propriedade', 'Tipo', 'Padrão', 'Descrição'], arr(d.api).map((p) => [`<code>${esc(p.name)}</code>`, `<code>${esc(p.type)}</code>`, esc(p.default), esc(p.description)]))}
<h2>Variantes</h2>${tbl(['Variante', 'Usar quando', 'Visual'], arr(d.variants).map((v) => [`<b>${esc(v.name)}</b>`, esc(v.useWhen), esc(v.visual)]))}
<h2>Estados</h2>${tbl(['Estado', 'Comportamento', 'Notas'], arr(d.states).map((s) => [`<b>${esc(s.state)}</b>`, esc(s.behavior), esc(s.notes)]))}
<h2>Tokens usados</h2><div class="card" style="padding:14px 18px"><p><b>Cores:</b> ${esc(arr(d.tokens?.colors).join(', ') || '—')}</p><p><b>Espaçamento:</b> ${esc(arr(d.tokens?.spacing).join(', ') || '—')}</p><p style="margin:0"><b>Tipografia:</b> ${esc(arr(d.tokens?.typography).join(', ') || '—')}</p></div>
<h2>Acessibilidade</h2><div class="card" style="padding:14px 18px"><p><b>Papel:</b> ${esc(d.accessibility?.role ?? '—')}</p><p><b>Teclado:</b> ${esc(d.accessibility?.keyboard ?? '—')}</p><p style="margin:0"><b>Leitor de tela:</b> ${esc(d.accessibility?.screenReader ?? '—')}</p></div>
<h2>Perguntas em aberto</h2>${list(d.openQuestions)}`,
  extract: () => `<p class="kicker">Extração de tokens</p><h1>${esc(d.title ?? 'Design tokens')}</h1><p class="sub">${esc(arr(d.sources).join(' · '))}</p>
<h2>Extraído</h2>${tbl(['Categoria', 'Qtde', 'Notas'], arr(d.categories).map((c) => [`<b>${esc(c.category)}</b>`, esc(c.count), esc(c.notes)]))}
${arr(d.palette).length ? `<h2>Paleta</h2>${tbl(['Token', 'Valor'], arr(d.palette).map((p) => [`<code>${esc(p.name)}</code>`, colorChip(p.value) + `<code>${esc(p.value)}</code>`]))}` : ''}
<h2>Lacunas <small class="sub">(decisões do usuário — nada foi inventado)</small></h2>${list(d.gaps)}
<h2>Inconsistências <small class="sub">(sinalizadas, não mescladas)</small></h2>${tbl(['Problema', 'Valores', 'Onde', 'Sugestão'], arr(d.inconsistencies).map((i) => [esc(i.issue), esc(arr(i.values).join(', ')), esc(i.where), esc(i.suggestion)]))}
${d.output ? `<h2>Saída</h2><p>Tokens escritos em <code>${esc(d.output)}</code>.</p>` : ''}<h2>Próximos passos</h2><ol class="prio">${arr(d.nextSteps).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`,
};

if (!md[kind]) { console.error('tipo inválido: use audit | component | extend | extract'); process.exit(1); }
const title = d.name ?? d.title ?? d.project ?? kind;
const base = `${kind}-${slug(String(title).replace(/^\s*(audit|auditoria|component|componente|extend|extract|extra[cç][aã]o)\b[\s:—–-]*/i, '') || title)}`;
fs.mkdirSync(outDir, {recursive: true});
const written = [];
if (!args.includes('--no-md')) { const p = path.join(outDir, base + '.md'); fs.writeFileSync(p, md[kind]()); written.push(p); }
if (!args.includes('--no-html')) {
  const p = path.join(outDir, base + '.html');
  fs.writeFileSync(p, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${css}</style></head><body><main>${html[kind]()}<footer>Gerado por design-system · ${new Date().toISOString().slice(0, 10)}</footer></main></body></html>`);
  written.push(p);
}
console.log(written.map((w) => 'gerado ' + w).join('\n'));

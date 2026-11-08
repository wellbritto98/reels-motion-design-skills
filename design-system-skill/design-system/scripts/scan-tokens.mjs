#!/usr/bin/env node
// Varredura determinística de um projeto para o AUDIT do design system. Sem dependências (só Node ≥ 18).
//
//   node scripts/scan-tokens.mjs [pasta-do-projeto] [--out design-system/artifacts/scan.json] [--ignore dir1,dir2] [--help]
//
// O que mede (tudo HEURÍSTICO — a IA deve conferir uma amostra antes de afirmar números):
//  - tokens DEFINIDOS: custom properties CSS (--x), objetos de tema/tokens em JS/TS, tailwind theme, JSON no formato DTCG ($value)
//  - valores FIXOS no código: cores (#hex, rgb(), hsl()), famílias e tamanhos de fonte, espaçamentos fora da escala de 4 px,
//    border-radius, box-shadow, z-index, durações de transição, valores arbitrários do Tailwind [..]
//  - USO de tokens: var(--x), theme(), theme./tokens./colors./palette./C. etc.
//  - NOMENCLATURA: estilo dos nomes de tokens (kebab/camel/snake) e dos arquivos de componente
//  - COMPONENTES: inventário com props, variantes, estados e sinais de acessibilidade
// Saída: JSON (`--out`) + resumo na tela. Não altera nenhum arquivo do projeto.
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 16).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}
const flag = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const root = path.resolve(args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--'))) ?? '.');
const out = path.resolve(root, flag('--out', 'design-system/artifacts/scan.json'));
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '.svelte-kit', 'coverage', 'work', '.remotion', '.turbo', '.cache', 'vendor', '__pycache__', 'artifacts', 'public', ...(flag('--ignore', '') ? flag('--ignore', '').split(',') : [])]);
const CODE_EXT = new Set(['.css', '.scss', '.sass', '.less', '.styl', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.vue', '.svelte', '.html', '.astro', '.mdx']);
const MAX_BYTES = 400_000;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    if (e.name.startsWith('.') && e.name !== '.storybook') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!IGNORE_DIRS.has(e.name)) walk(p); continue; }
    if (/\.min\.|\.lock$|package-lock|\.d\.ts$/.test(e.name)) continue;
    const ext = path.extname(e.name).toLowerCase();
    if (CODE_EXT.has(ext) || /\.tokens?\.json$|^tokens?\.json$|design-system\.json$|theme\.json$/i.test(e.name)) {
      if (fs.statSync(p).size <= MAX_BYTES) files.push(p);
    }
  }
})(root);

const rel = (p) => path.relative(root, p).replace(/\\/g, '/');
const isTokenFile = (p, txt) => /(tokens?|theme|design-system|brand|colors?|palette|variables|tailwind\.config|globals?)\b/i.test(rel(p)) || /:root\s*\{|\bdata-theme\b|\$value/.test(txt.slice(0, 20000));

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
const FUNC_COLOR = /\b(?:rgba?|hsla?|oklch|oklab)\([^)]*\)/g;
const FONT_FAMILY = /font-?[fF]amily\s*[:=]\s*['"`]?([^;'"`}\n]+)/g;
const FONT_SIZE = /font-?[sS]ize\s*[:=]\s*['"`]?(\d+(?:\.\d+)?)(px|rem|em)?/g;
const SPACING = /\b(?:padding|margin|gap|row-gap|column-gap|top|right|bottom|left)(?:-(?:top|right|bottom|left|block|inline))?\s*[:=]\s*['"`]?(\d+(?:\.\d+)?)(px)?['"`]?/gi;
const RADIUS = /border-?[rR]adius\s*[:=]\s*['"`]?(\d+(?:\.\d+)?)(px|rem)?/g;
const SHADOW = /(?:box-?[sS]hadow|text-?[sS]hadow)\s*[:=]\s*['"`]?([^;'"`}\n]+)/g;
const ZINDEX = /z-?[iI]ndex\s*[:=]\s*['"`]?(-?\d+)/g;
const DURATION = /(?:transition|animation)[^;{}\n]*?(\d*\.?\d+)(ms|s)\b/g;
const TW_ARB = /\b[a-z-]+-\[(?:#[0-9a-fA-F]+|[\d.]+(?:px|rem|em|%)|rgba?\([^\]]+\))\]/g;
const CSS_VAR_DEF = /(^|[;{\s])(--[a-zA-Z0-9_-]+)\s*:/g;
const CSS_VAR_USE = /var\(\s*(--[a-zA-Z0-9_-]+)/g;
const OBJ_TOKEN_USE = /\b(?:theme|tokens?|colors?|palette|spacing|typography|C|FONT|SHAPE|BRAND)\.[A-Za-z_][A-Za-z0-9_]*/g;
const OBJ_TOKEN_DEF = /export\s+(?:const|let)\s+(theme|tokens?|colors?|palette|spacing|typography|C|FONT|SHAPE|BRAND)\b/g;
const TW_THEME = /theme\s*:\s*\{[\s\S]{0,4000}?extend/;

const hard = {colors: new Map(), fonts: new Map(), fontSizes: new Map(), offScaleSpacing: new Map(), radii: new Map(), shadows: new Map(), zIndex: new Map(), durations: new Map(), tailwindArbitrary: new Map()};
const tally = (m, key, file) => { const e = m.get(key) ?? {count: 0, files: new Set()}; e.count++; e.files.add(file); m.set(key, e); };
const defs = {cssVars: new Map(), objects: [], tailwindTheme: [], dtcg: []};
let varUses = 0, objUses = 0;
const objectKeys = [];
const hexNorm = (h) => { let x = h.toLowerCase(); if (x.length === 4) x = '#' + [...x.slice(1)].map((c) => c + c).join(''); return x; };

for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  const r = rel(f);
  const tokenFile = isTokenFile(f, txt);
  if (/\.json$/i.test(f)) {
    if (/\$value/.test(txt)) defs.dtcg.push(r);
    continue;
  }
  for (const m of txt.matchAll(CSS_VAR_DEF)) { const e = defs.cssVars.get(m[2]) ?? {count: 0, files: new Set()}; e.count++; e.files.add(r); defs.cssVars.set(m[2], e); }
  for (const m of txt.matchAll(OBJ_TOKEN_DEF)) {
    defs.objects.push({name: m[1], file: r});
    const body = txt.slice(m.index, m.index + 3000).split(/\n\};?|\}\s*as const/)[0]; // chaves do objeto (para medir nomenclatura)
    for (const k of body.matchAll(/(?:^|[{,\s])([A-Za-z_][\w]*)\s*:/g)) objectKeys.push(k[1]);
  }
  if (TW_THEME.test(txt) && /tailwind/i.test(r)) defs.tailwindTheme.push(r);
  varUses += [...txt.matchAll(CSS_VAR_USE)].length;
  objUses += [...txt.matchAll(OBJ_TOKEN_USE)].length;
  if (tokenFile) continue; // arquivos de definição de tokens não contam como "valor fixo"
  const lines = txt.split('\n');
  lines.forEach((line) => {
    if (/^\s*(\/\/|\*|\/\*|<!--)/.test(line)) return;
    for (const m of line.matchAll(HEX)) tally(hard.colors, hexNorm(m[0]), r);
    for (const m of line.matchAll(FUNC_COLOR)) {
      const inner = m[0].slice(m[0].indexOf('(') + 1, -1);
      if (/[A-Za-z_]\w*\.[A-Za-z]|\$\{|[A-Za-z_]\w*\(|\b[a-z_]{3,}\b(?!\s*(?:deg|%))/.test(inner.replace(/\b(?:none|deg|turn|rad)\b/g, ''))) continue; // rgba(token, alpha) / variáveis ≠ valor fixo
      tally(hard.colors, m[0].replace(/\s+/g, ''), r);
    }
    for (const m of line.matchAll(FONT_FAMILY)) if (!/var\(|inherit|\$\{|props\.|FONT\./.test(m[1])) tally(hard.fonts, m[1].trim().slice(0, 60), r);
    for (const m of line.matchAll(FONT_SIZE)) tally(hard.fontSizes, `${m[1]}${m[2] ?? 'px'}`, r);
    for (const m of line.matchAll(SPACING)) { const n = parseFloat(m[1]); if (n > 0 && (m[2] === 'px' || !m[2]) && n % 4 !== 0 && n !== 2 && n !== 1) tally(hard.offScaleSpacing, `${n}px`, r); }
    for (const m of line.matchAll(RADIUS)) tally(hard.radii, `${m[1]}${m[2] ?? 'px'}`, r);
    for (const m of line.matchAll(SHADOW)) if (!/var\(|none|\$\{|\?/.test(m[1]) && /\d+px|rgba?\(|#[0-9a-f]{3}/i.test(m[1])) tally(hard.shadows, m[1].trim().replace(/[,;]+$/, '').slice(0, 70), r);
    for (const m of line.matchAll(ZINDEX)) tally(hard.zIndex, m[1], r);
    for (const m of line.matchAll(DURATION)) tally(hard.durations, `${m[1]}${m[2]}`, r);
    for (const m of line.matchAll(TW_ARB)) tally(hard.tailwindArbitrary, m[0], r);
  });
}

const top = (m, n = 12) => [...m.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, n).map(([value, e]) => ({value, count: e.count, files: [...e.files].slice(0, 4)}));
const total = (m) => [...m.values()].reduce((s, e) => s + e.count, 0);
const hardcoded = Object.fromEntries(Object.entries(hard).map(([k, m]) => [k, {count: total(m), distinct: m.size, top: top(m)}]));
const hardTotal = Object.values(hardcoded).reduce((s, v) => s + v.count, 0);
const refs = varUses + objUses;

// ---- nomenclatura
const styleOf = (n) => (/^--?[a-z0-9]+(-[a-z0-9]+)+$/.test(n) ? 'kebab' : /[a-z][A-Z]/.test(n) ? 'camel' : /_/.test(n) ? 'snake' : 'single');
const varNames = [...defs.cssVars.keys()];
const nameStyles = {};
varNames.forEach((n) => { const s = styleOf(n); nameStyles[s] = (nameStyles[s] ?? 0) + 1; });
const objStyles = {};
objectKeys.forEach((n) => { const s = /^[a-z0-9]+$/.test(n) ? 'single-word' : /[a-z][A-Z]/.test(n) ? 'camel' : /_/.test(n) ? 'snake' : /^[A-Z0-9_]+$/.test(n) ? 'CONSTANT' : 'other'; objStyles[s] = (objStyles[s] ?? 0) + 1; });
const prefixes = {};
varNames.forEach((n) => { const p = n.replace(/^--/, '').split(/[-_]/)[0]; prefixes[p] = (prefixes[p] ?? 0) + 1; });

// ---- componentes
const compDirs = /(^|\/)(components?|ui|inserts?|widgets?|elements?|atoms|molecules|organisms)(\/|$)/i;
const components = [];
for (const f of files) {
  const r = rel(f);
  if (!/\.(tsx|jsx|vue|svelte|astro)$/.test(f) && !(compDirs.test(r) && /\.(ts|js)$/.test(f))) continue;
  if (!compDirs.test(r) && !/\.(vue|svelte)$/.test(f) && !/export (default )?(function|const) [A-Z]/.test(fs.readFileSync(f, 'utf8'))) continue;
  const txt = fs.readFileSync(f, 'utf8');
  const names = new Set();
  for (const m of txt.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+([A-Z][A-Za-z0-9]*)/g)) names.add(m[1]);
  if (/\.(vue|svelte)$/.test(f)) names.add(path.basename(f).replace(/\.\w+$/, ''));
  for (const name of names) {
    const propsBlock = txt.match(new RegExp(`(?:interface|type)\\s+${name}Props\\s*(?:=\\s*)?\\{([\\s\\S]*?)\\n\\}`)) || txt.match(/(?:interface|type)\s+Props\s*(?:=\s*)?\{([\s\S]*?)\n\}/);
    const props = propsBlock ? [...propsBlock[1].matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)(\?)?\s*:\s*([^;\n]+)/gm)].map((m) => ({name: m[1], optional: !!m[2], type: m[3].trim().replace(/,$/, '')})) : [];
    const has = (re) => re.test(txt);
    components.push({
      name, file: r, lines: txt.split('\n').length, props,
      variants: has(/\bvariant\b|\bkind\b|\btone\b|\bintent\b/i),
      sizes: has(/\bsize\b\s*[?:=]|\bsizes?\b.*(sm|md|lg)/),
      states: {hover: has(/hover/i), focus: has(/focus/i), active: has(/\bactive\b|pressed/i), disabled: has(/disabled/i), loading: has(/loading|spinner|skeleton/i), error: has(/\berror\b|invalid/i)},
      a11y: {aria: (txt.match(/aria-[a-z]+/g) ?? []).length, role: (txt.match(/\brole=/g) ?? []).length, alt: (txt.match(/\balt=/g) ?? []).length, tabIndex: (txt.match(/tabIndex/g) ?? []).length},
      usesTokens: has(CSS_VAR_USE) || has(OBJ_TOKEN_USE),
      hardcodedColors: (txt.match(HEX) ?? []).length + (txt.match(FUNC_COLOR) ?? []).length,
      documented: fs.existsSync(f.replace(/\.(tsx|jsx|vue|svelte)$/, '.stories.$1')) || fs.existsSync(f.replace(/\.(tsx|jsx|vue|svelte)$/, '.md')) || fs.existsSync(f.replace(/\.(tsx|jsx|vue|svelte)$/, '.mdx')) || /^\s*\/\*\*/m.test(txt),
    });
  }
}
// estados/a11y/cores fixas são medidos no ARQUIVO inteiro: com vários componentes no mesmo arquivo, confirme abrindo o componente
const perFile = {};
components.forEach((c) => { perFile[c.file] = (perFile[c.file] ?? 0) + 1; });
components.forEach((c) => { c.componentsInFile = perFile[c.file]; });
const fileStyles = {};
[...new Set(components.map((c) => c.file))].map((f) => ({file: f})).forEach((c) => { const b = path.basename(c.file).replace(/\.\w+$/, ''); const s = /^[A-Z]/.test(b) ? 'PascalCase' : /-/.test(b) ? 'kebab-case' : /_/.test(b) ? 'snake_case' : 'camelCase'; fileStyles[s] = (fileStyles[s] ?? 0) + 1; });

const coverage = refs + hardTotal === 0 ? null : Math.round((100 * refs) / (refs + hardTotal));
const result = {
  generatedAt: new Date().toISOString(), root: root.replace(/\\/g, '/'), scannedFiles: files.length,
  tokensDefined: {
    cssCustomProperties: varNames.length, objects: defs.objects, tailwindTheme: defs.tailwindTheme, dtcgJson: defs.dtcg,
    sampleVars: varNames.slice(0, 40),
  },
  tokenUsage: {cssVarReferences: varUses, objectReferences: objUses, hardcodedValues: hardTotal, coveragePercent: coverage,
    note: 'cobertura = referências a tokens ÷ (referências + valores fixos). Heurística: confira uma amostra antes de citar.'},
  hardcoded,
  naming: {tokenNameStyles: nameStyles, tokenObjectKeyStyles: objStyles, tokenObjectKeys: [...new Set(objectKeys)].slice(0, 60), tokenPrefixes: prefixes, componentFileStyles: fileStyles},
  components,
};
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, JSON.stringify(result, null, 2));

const L = (s) => console.log(s);
L(`Varredura de ${root}\n  arquivos analisados: ${files.length} · componentes: ${components.length}`);
L(`  tokens definidos: ${varNames.length} custom properties CSS · ${defs.objects.length} objeto(s) de tema JS/TS · ${defs.tailwindTheme.length} tailwind theme · ${defs.dtcg.length} JSON DTCG`);
L(`  uso de tokens: ${refs} referências  vs  valores fixos: ${hardTotal}  →  cobertura ≈ ${coverage ?? 'n/d'}%`);
for (const [k, v] of Object.entries(hardcoded)) if (v.count) L(`    ${k.padEnd(18)} ${String(v.count).padStart(5)} usos · ${v.distinct} distintos · ex.: ${v.top.slice(0, 3).map((t) => t.value).join(' | ')}`);
L(`  nomenclatura: tokens CSS ${JSON.stringify(nameStyles)} · chaves de objetos de tema ${JSON.stringify(objStyles)} · arquivos de componente ${JSON.stringify(fileStyles)}`);
L(`→ ${rel(out)}`);

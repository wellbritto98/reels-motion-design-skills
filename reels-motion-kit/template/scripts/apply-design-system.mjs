// Lê design-system/design-system.json e gera src/brand.generated.ts (cores, fontes, formas, legenda).
// Uso: npm run design   (ou: node scripts/apply-design-system.mjs <arquivo.json>)
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.resolve(root, process.argv[2] ?? 'design-system/design-system.json');
const ds = JSON.parse(fs.readFileSync(file, 'utf8'));

const need = ['colors', 'fonts', 'shape', 'captions', 'background', 'speaker', 'motion', 'sfx'];
for (const k of need) if (!ds[k]) throw new Error(`design system sem a chave "${k}"`);
const hex = /^#[0-9a-fA-F]{6}$/;
for (const [k, v] of Object.entries(ds.colors)) if (!hex.test(v)) throw new Error(`cor inválida ${k}: ${v} (use #rrggbb)`);

// contraste mínimo texto x fundo (WCAG aproximado) — avisa, não bloqueia
const lum = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
for (const [fg, bg] of [['text', 'ink'], ['text', 'card'], ['mute', 'card'], ['accent', 'card'], ['positive', 'card'], ['negative', 'card']]) {
  const r = ratio(ds.colors[fg], ds.colors[bg]);
  if (r < 4.5) console.warn(`aviso: contraste ${fg}/${bg} = ${r.toFixed(1)} (< 4.5). Textos pequenos podem ficar ilegíveis.`);
}

const fontModule = (family) => family.replace(/\s+/g, '');
const fontImports = ['head', 'body']
  .map((k) => ({k, f: ds.fonts[k]}))
  .filter((x, i, a) => a.findIndex((y) => y.f.family === x.f.family) === i)
  .map(({f}) => `import {loadFont as load${fontModule(f.family)}} from '@remotion/google-fonts/${fontModule(f.family)}';\nload${fontModule(f.family)}('normal', {weights: ${JSON.stringify(f.weights)}});`)
  .join('\n');

const c = ds.colors;
const out = `// GERADO por scripts/apply-design-system.mjs a partir de design-system/design-system.json — não edite à mão.
${fontImports}

export const BRAND = ${JSON.stringify(ds.brand ?? {}, null, 2)} as const;

/** Nomes semânticos: gold = destaque (accent), green = positivo, red = negativo, blue = informação, violet = extra. */
export const C = {
  ink: '${c.ink}', navy: '${c.navy}', card: '${c.card}', card2: '${c.card2}', line: '${c.line}',
  text: '${c.text}', mute: '${c.mute}',
  gold: '${c.accent}', green: '${c.positive}', red: '${c.negative}', blue: '${c.info}', violet: '${c.extra}',
};
export const FONT = {
  head: '${ds.fonts.head.family}, "Segoe UI", Arial, sans-serif',
  body: '${ds.fonts.body.family}, "Segoe UI", Arial, sans-serif',
};
export const SHAPE = ${JSON.stringify(ds.shape)};
export const GRADIENT: [string, string] = ['${c[ds.gradient?.[0] ?? 'accent'] ?? c.accent}', '${c[ds.gradient?.[1] ?? 'positive'] ?? c.positive}'];
export const CAPTION = {
  highlight: '${c[ds.captions.highlight] ?? ds.captions.highlight}',
  plate: '${c[ds.captions.plateColor] ?? ds.captions.plateColor}',
  sizeFull: ${ds.captions.sizeFull},
  sizeSplit: ${ds.captions.sizeSplit},
  uppercase: ${!!ds.captions.uppercase},
};
export const BACKGROUND = ${JSON.stringify(ds.background)};
export const SPEAKER_RING = '${c[ds.speaker.ring] ?? ds.speaker.ring}';
export const MOTION = ${JSON.stringify(ds.motion)};
export const SFX_GAIN = ${ds.sfx.gain};
`;
fs.writeFileSync(path.join(root, 'src/brand.generated.ts'), out);
console.log(`design system "${ds.name}" aplicado -> src/brand.generated.ts`);

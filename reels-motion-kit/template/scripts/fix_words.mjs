// Corrige erros do Whisper preservando o tempo por palavra e gera src/content/captions.json.
// Uso: node scripts/fix_words.mjs            (lê work/words_raw.json + content-fixes/word-fixes.json)
//
// word-fixes.json = lista de regras:  [{"match": ["Saigip"], "replace": ["Sergipe"]},
//                                      {"match": ["da","Simu","Teseiro","Feras"], "replace": ["décimo","terceiro","férias"]},
//                                      {"match": ["econômico"], "replace": ["economista"], "first": true}]
// - match compara palavras sem pontuação final, sem diferenciar maiúsculas, em Unicode NFC.
// - Se replace tem outra quantidade de palavras, o intervalo de tempo é repartido igualmente.
// - A pontuação final da última palavra casada é mantida (importante: a legenda quebra em , . ? !).
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const rawPath = path.join(root, 'work/words_raw.json');
const rulesPath = path.join(root, 'content-fixes/word-fixes.json');
const outPath = path.join(root, 'src/content/captions.json');

const nfc = (s) => s.normalize('NFC');
const strip = (s) => nfc(s).replace(/[.,?!…:;]+$/, '');
const punct = (s) => (nfc(s).match(/[.,?!…:;]+$/) || [''])[0];

let W = JSON.parse(fs.readFileSync(rawPath, 'utf8')).map((w) => ({...w, t: nfc(w.t)}));
const rules = fs.existsSync(rulesPath) ? JSON.parse(fs.readFileSync(rulesPath, 'utf8')) : [];
const report = [];
for (const rule of rules) {
  const pat = rule.match.map(nfc);
  let hits = 0;
  for (let i = 0; i <= W.length - pat.length; i++) {
    if (!pat.every((p, k) => strip(W[i + k].t).toLowerCase() === p.toLowerCase())) continue;
    const span = W.slice(i, i + pat.length);
    const s = span[0].s, e = span[span.length - 1].e, tail = punct(span[span.length - 1].t);
    const rep = rule.replace.map(nfc), n = rep.length, step = (e - s) / n;
    W.splice(i, pat.length, ...rep.map((r, k) => ({t: r + (k === n - 1 ? tail : ''), s: +(s + k * step).toFixed(2), e: +(s + (k + 1) * step).toFixed(2)})));
    hits++;
    if (rule.first) break;
  }
  report.push(`${hits ? 'ok   ' : 'SEM ACERTO'} ${rule.match.join(' ')} -> ${rule.replace.join(' ')} (${hits}x)`);
}
fs.mkdirSync(path.dirname(outPath), {recursive: true});
fs.writeFileSync(outPath, JSON.stringify(W.map((w) => ({w: w.t, s: w.s, e: w.e}))), 'utf8');
console.log(report.join('\n') || 'sem regras de correção');
console.log(`${W.length} palavras -> src/content/captions.json`);

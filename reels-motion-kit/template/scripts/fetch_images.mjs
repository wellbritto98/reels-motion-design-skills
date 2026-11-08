// Busca e baixa IMAGENS COM LICENÇA LIVRE (Wikimedia Commons e Openverse), registra a licença e monta CREDITOS.md.
//
//   node scripts/fetch_images.mjs search "fachada Congresso Nacional"            # Commons: lista candidatos + licença
//   node scripts/fetch_images.mjs get "File:Nome do arquivo.jpg" congresso.jpg [largura=1400]
//   node scripts/fetch_images.mjs ov-search "brazilian real banknote"            # Openverse: lista candidatos + licença
//   node scripts/fetch_images.mjs ov-get <id-openverse> nota.jpg
//   node scripts/fetch_images.mjs credits                                         # imprime o bloco de créditos p/ a descrição
//
// REGRAS (a IA deve seguir):
//  1. PEÇA AUTORIZAÇÃO ao usuário antes de baixar: liste arquivo, fonte, licença e tamanho aproximado.
//  2. Só aceita PD/CC0, CC BY e CC BY-SA (use --allow-sa). Recusa NC, ND, "editorial", desconhecida.
//  3. Salva em public/img/ e registra em public/img/credits.json (a fonte da verdade dos créditos).
//  4. Commons limita requisições: o script espera 6 s entre chamadas. Não rode em paralelo.
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const imgDir = path.join(root, 'public/img');
const creditsJson = path.join(imgDir, 'credits.json');
const H = {'User-Agent': 'reels-motion-kit/1.0 (projeto pessoal de edição de vídeo)'};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const args = process.argv.slice(2);
const allowSA = args.includes('--allow-sa');
const pos = args.filter((a) => !a.startsWith('--'));
const [cmd, ...rest] = pos;

const strip = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const licOk = (l = '') => {
  const x = l.toLowerCase();
  if (/\b(nc|nd)\b|noncommercial|non-commercial|noderiv|editorial|all rights|unknown|fair use/.test(x)) return false;
  if (/cc0|public domain|\bpd\b|pdm|no restrictions/.test(x)) return true;
  if (/cc[- ]by-sa/.test(x)) return allowSA;
  if (/cc[- ]by/.test(x)) return true;
  return false;
};
const needsCredit = (l = '') => /cc[- ]by/i.test(l);
const loadCredits = () => (fs.existsSync(creditsJson) ? JSON.parse(fs.readFileSync(creditsJson, 'utf8')) : []);
const saveCredit = (c) => {
  const all = loadCredits().filter((x) => x.file !== c.file);
  all.push(c);
  fs.mkdirSync(imgDir, {recursive: true});
  fs.writeFileSync(creditsJson, JSON.stringify(all, null, 2));
  const md = ['# Créditos de imagens', '', ...all.map((x) => `- \`${x.file}\`: "${x.title}" — ${x.author} — ${x.license} — ${x.url}${x.needsCredit ? '  **(crédito obrigatório na descrição)**' : ''}`)];
  fs.writeFileSync(path.join(root, 'CREDITOS.md'), md.join('\n') + '\n');
};
const commons = async (params) => {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({format: 'json', ...params}).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, {headers: H});
  const t = await r.text();
  try { return JSON.parse(t); } catch { throw new Error('Commons respondeu algo que não é JSON (limite de requisições?): ' + t.slice(0, 80)); }
};

if (cmd === 'search') {
  const d = await commons({action: 'query', generator: 'search', gsrsearch: `${rest.join(' ')} filetype:bitmap`, gsrnamespace: 6, gsrlimit: 10, prop: 'imageinfo', iiprop: 'url|size|extmetadata'});
  for (const p of Object.values(d.query?.pages ?? {})) {
    const i = p.imageinfo[0], m = i.extmetadata;
    const lic = m.LicenseShortName?.value ?? '?';
    console.log(`${licOk(lic) ? 'OK    ' : 'RECUSA'} ${p.title} | ${i.width}x${i.height} | ${lic} | ${strip(m.Artist?.value).slice(0, 40)}`);
  }
} else if (cmd === 'get') {
  const [title, outName, width = '1400'] = rest;
  const d = await commons({action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: width});
  const i = Object.values(d.query.pages)[0].imageinfo?.[0];
  if (!i) throw new Error('arquivo não encontrado: ' + title);
  const m = i.extmetadata, lic = m.LicenseShortName?.value ?? '?';
  if (!licOk(lic)) throw new Error(`licença "${lic}" não permitida (ou CC BY-SA sem --allow-sa). Escolha outra imagem.`);
  await sleep(6000);
  const buf = Buffer.from(await (await fetch(i.thumburl || i.url, {headers: H})).arrayBuffer());
  fs.mkdirSync(imgDir, {recursive: true});
  fs.writeFileSync(path.join(imgDir, outName), buf);
  saveCredit({file: outName, title: title.replace('File:', ''), author: strip(m.Artist?.value) || '?', license: lic, url: i.descriptionshorturl, needsCredit: needsCredit(lic)});
  console.log(`baixado public/img/${outName} (${(buf.length / 1024).toFixed(0)} KB) · ${lic}`);
} else if (cmd === 'ov-search') {
  const u = new URL('https://api.openverse.org/v1/images/');
  u.searchParams.set('q', rest.join(' ')); u.searchParams.set('license_type', 'commercial,modification'); u.searchParams.set('page_size', '10');
  const d = await (await fetch(u, {headers: H})).json();
  for (const r of d.results ?? []) {
    const lic = `${r.license}${r.license_version ? ' ' + r.license_version : ''}`.toUpperCase().replace(/^BY/, 'CC BY').replace(/^CC0/, 'CC0');
    console.log(`${licOk(lic) ? 'OK    ' : 'RECUSA'} ${r.id} | ${lic} | ${r.creator ?? '?'} | ${r.title?.slice(0, 50)} | ${r.source}`);
  }
} else if (cmd === 'ov-get') {
  const [id, outName] = rest;
  const r = await (await fetch(`https://api.openverse.org/v1/images/${id}/`, {headers: H})).json();
  const lic = `${r.license}${r.license_version ? ' ' + r.license_version : ''}`.toUpperCase().replace(/^BY/, 'CC BY');
  if (!licOk(lic)) throw new Error(`licença "${lic}" não permitida (ou -SA sem --allow-sa).`);
  const buf = Buffer.from(await (await fetch(r.url, {headers: H})).arrayBuffer());
  fs.mkdirSync(imgDir, {recursive: true});
  fs.writeFileSync(path.join(imgDir, outName), buf);
  saveCredit({file: outName, title: r.title, author: r.creator ?? '?', license: lic, url: r.foreign_landing_url, needsCredit: needsCredit(lic)});
  console.log(`baixado public/img/${outName} (${(buf.length / 1024).toFixed(0)} KB) · ${lic}`);
} else if (cmd === 'credits') {
  const all = loadCredits().filter((x) => x.needsCredit);
  console.log(all.length ? 'Imagens:\n' + all.map((x) => `• "${x.title}" — ${x.author} (${x.license}) — ${x.url}`).join('\n') : 'Nenhuma imagem exige crédito.');
} else {
  console.log('uso: search | get | ov-search | ov-get | credits  (veja o cabeçalho do arquivo)');
}

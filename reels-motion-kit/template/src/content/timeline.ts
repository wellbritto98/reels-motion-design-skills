/**
 * LINHA DO TEMPO DO REEL — é o único arquivo que a IA edita para montar um vídeo novo (junto com captions.json e meta.json).
 *
 * Conceitos:
 *  - GROUP  = uma "tela dividida": o apresentador encolhe para a janela do layout e aparece um cartão de gráfico.
 *             Tem layout (stack | top | pip), início/fim em SEGUNDOS do vídeo e uma lista de ITEMS.
 *  - ITEM   = uma "página" do cartão (type + props). Troca de página dentro do grupo = swipe, sem sair da tela dividida.
 *  - OVERLAY= peça sobre o apresentador em TELA CHEIA (nome na abertura, palavra-chave).
 *  - CUES   = efeitos sonoros [segundo, nome, volume?] presos ao que aparece na tela.
 * Todos os tempos são ABSOLUTOS (segundos do vídeo original). Nas props de cada item, `at` também é absoluto.
 */
import React from 'react';
import captions from './captions.json';
import meta from './meta.json';
import type {LayoutKey, LayoutName} from '../layout';
import {INSERTS} from '../inserts';

export const FPS = meta.fps;
export const TOTAL_FRAMES = Math.round(meta.durationSeconds * FPS);
export const PRE = 5; // quadros em que o apresentador começa a encolher antes do cartão
export const EXIT = 12;

export type Cue = [number, string, number?];
export type Item = {from: number; to: number; type?: keyof typeof INSERTS; Comp?: React.FC<any>; props?: Record<string, unknown>; cues?: Cue[]};
export type Group = {id: string; layout: Exclude<LayoutName, 'full'>; from: number; to: number; items: Item[]};
export type Overlay = {from: number; to: number; kind: 'name' | 'kw'; title: string; sub?: string};

/** Atalho: item({from,to,type,props,cues}). */
export const item = (from: number, to: number, type: keyof typeof INSERTS, props: Record<string, unknown> = {}, cues: Cue[] = []): Item => ({from, to, type, props, cues});
/** Série de "tick" para contadores subindo. */
export const ticks = (start: number, step: number, n: number, vol = 0.2): Cue[] => Array.from({length: n}, (_, i) => [start + i * step, 'tick', vol] as Cue);
/** Segundo em que uma palavra é dita (procura em captions.json depois de `after`). Use para prender gráficos à fala. */
export const wordTime = (text: string, after = 0) => (captions as {w: string; s: number}[]).find((x) => x.s > after && x.w.toLowerCase().replace(/[.,?!]/g, '') === text.toLowerCase())?.s ?? after + 1;

/* ===================== CONTEÚDO (exemplo — substitua) ===================== */
export const GROUPS: Group[] = [
  {id: 'g1', layout: 'stack', from: 2.0, to: 6.0, items: [
    item(2.0, 6.0, 'TitleCard', {kicker: 'Exemplo', title: 'Seu título aqui', highlight: 'destaque', sub: 'Subtítulo curto de uma linha', icons: ['clock', 'coin']},
      [[2.3, 'pop'], [2.6, 'pop'], [3.2, 'swipe']]),
  ]},
  {id: 'g2', layout: 'top', from: 7.0, to: 12.0, items: [
    item(7.0, 12.0, 'RowsList', {kicker: 'Três pontos', rows: [
      {text: 'Primeiro ponto', icon: 'check', at: 7.3},
      {text: 'Segundo ponto', icon: 'check', at: 8.6},
      {text: 'Terceiro ponto (problema)', icon: 'cross', at: 10.0},
    ]}, [[7.3, 'success', 0.25], [8.6, 'success', 0.25], [10.0, 'buzz', 0.3]]),
  ]},
  {id: 'g3', layout: 'pip', from: 13.0, to: 19.0, items: [
    item(13.0, 16.0, 'BigStat', {kicker: 'Número em destaque', label: 'Valor', value: 1621, format: 'brl', color: 'green', at: 13.3, sub: 'subtítulo opcional'}, [[13.3, 'coin'], ...ticks(13.3, 0.12, 8)]),
    item(16.0, 19.0, 'Bars', {kicker: 'Comparação', bars: [
      {label: 'Antes', pct: 100, color: 'green', value: 'R$ 1.621', at: 16.2},
      {label: 'Depois', pct: 80, color: 'red', value: 'R$ 1.297', at: 17.2},
    ], pill: {text: '−20%', tone: 'red', at: 18.0}}, [[16.2, 'swipe'], [18.0, 'thud', 0.4]]),
  ]},
];

export const OVERLAYS: Overlay[] = [
  {from: 0.4, to: 1.9, kind: 'name', title: 'Nome do Apresentador', sub: 'Cargo · Instituição'},
  {from: 19.6, to: 21.6, kind: 'kw', title: 'Palavra-chave', sub: 'frase de apoio'},
];

/* ===================== DERIVADOS (não edite) ===================== */
export const LAYOUT_KEYS: LayoutKey[] = (() => {
  const keys: LayoutKey[] = [];
  GROUPS.forEach((g, i) => {
    keys.push({frame: Math.round(g.from * FPS) - PRE, layout: g.layout});
    const next = GROUPS[i + 1];
    const endF = Math.round(g.to * FPS);
    if (!next || Math.round(next.from * FPS) - PRE - endF > 20) keys.push({frame: endF, layout: 'full'});
  });
  return keys;
})();

export const SFX_BASE: Record<string, {vol: number; dur: number}> = {
  whoosh_in: {vol: 0.34, dur: 0.45}, whoosh_out: {vol: 0.3, dur: 0.4}, swipe: {vol: 0.22, dur: 0.22}, pop: {vol: 0.3, dur: 0.12},
  tick: {vol: 0.2, dur: 0.05}, blip: {vol: 0.2, dur: 0.03}, ding: {vol: 0.3, dur: 1.1}, coin: {vol: 0.3, dur: 0.28},
  thud: {vol: 0.45, dur: 0.6}, buzz: {vol: 0.3, dur: 0.4}, riser: {vol: 0.25, dur: 1.6}, success: {vol: 0.3, dur: 0.8},
};

export const SFX_CUES: {t: number; name: string; vol: number}[] = (() => {
  const out: {t: number; name: string; vol: number}[] = [];
  const add = (t: number, name: string, vol?: number) => {
    if (!SFX_BASE[name]) throw new Error(`efeito sonoro desconhecido: "${name}" (veja SFX_BASE em timeline.ts)`);
    out.push({t, name, vol: vol ?? SFX_BASE[name].vol});
  };
  GROUPS.forEach((g, i) => {
    add(g.from - PRE / FPS - 0.05, 'whoosh_in');
    const next = GROUPS[i + 1];
    if (!next || next.from - g.to > 0.7) add(g.to - 0.05, 'whoosh_out');
    g.items.forEach((x) => (x.cues ?? []).forEach((c) => add(c[0], c[1], c[2])));
  });
  OVERLAYS.forEach((o) => add(o.from, o.kind === 'name' ? 'swipe' : 'pop'));
  return out.filter((c) => c.t >= 0).sort((a, b) => a.t - b.t);
})();

/** Validações que quebram cedo (antes de gastar 40 min de render). */
export const validate = () => {
  const errs: string[] = [];
  GROUPS.forEach((g, i) => {
    if (g.to <= g.from) errs.push(`${g.id}: to <= from`);
    if (i && g.from < GROUPS[i - 1].to - 0.01) errs.push(`${g.id}: começa antes de ${GROUPS[i - 1].id} terminar`);
    if (g.to * FPS > TOTAL_FRAMES) errs.push(`${g.id}: passa do fim do vídeo`);
    g.items.forEach((x, k) => {
      if (!x.type && !x.Comp) errs.push(`${g.id}[${k}]: sem type`);
      if (x.type && !(x.type in INSERTS)) errs.push(`${g.id}[${k}]: type "${String(x.type)}" não existe em inserts/index.ts`);
      if (x.from < g.from - 0.01 || x.to > g.to + 0.01) errs.push(`${g.id}[${k}]: item fora da janela do grupo`);
    });
  });
  if (errs.length) throw new Error('timeline inválida:\n' + errs.join('\n'));
};
validate();

// EXEMPLO COMPLETO (reel real de 8:54 sobre finanças): 24 grupos, 35 páginas, cues de SFX. Não é importado pelo Main; serve de referência de ritmo e densidade.
import React from 'react';
import words from './captions.json';
import type {LayoutKey, LayoutName} from '../../layout';
import type {ItemP} from './inserts1';
import * as A from './inserts1';
import * as B from './inserts2';

export const FPS = 30;
export const TOTAL_FRAMES = 16039; // 534.63 s of source video
export const PRE = 5; // frames the speaker starts shrinking before the first graphic
export const EXIT = 12;

export type Cue = [number, string, number?];
export type Item = {from: number; to: number; Comp: React.FC<any>; props?: Record<string, unknown>; cues?: Cue[]};
export type Group = {id: string; layout: Exclude<LayoutName, 'full'>; from: number; to: number; items: Item[]};

const it = (from: number, to: number, Comp: React.FC<ItemP & any>, cues: Cue[] = [], props?: Record<string, unknown>): Item => ({from, to, Comp, cues, props});
const ticks = (start: number, step: number, n: number, vol = 0.2): Cue[] => Array.from({length: n}, (_, i) => [start + i * step, 'tick', vol] as Cue);
const wordT = (text: string, after: number) => (words as {w: string; s: number}[]).find((x) => x.s > after && x.w === text)?.s ?? after + 2;

export const GROUPS: Group[] = [
  {id: 'g1', layout: 'stack', from: 4.7, to: 10.2, items: [
    it(4.7, 10.2, A.TitleCard, [[4.95, 'pop'], [5.2, 'pop'], [5.75, 'swipe'], [6.1, 'swipe'], [7.2, 'ding', 0.3]]),
  ]},
  {id: 'g2', layout: 'top', from: 17.0, to: 32.3, items: [
    it(17.0, 27.5, A.ClaimsList, [[17.2, 'swipe'], [17.9, 'success', 0.25], [21.2, 'swipe'], [21.9, 'success', 0.25]]),
    it(27.5, 32.3, A.ClaimsList, [[27.7, 'buzz', 0.35], [28.3, 'buzz', 0.3], [28.9, 'thud', 0.5]], {struck: true}),
  ]},
  {id: 'g3', layout: 'stack', from: 36.7, to: 51.2, items: [
    it(36.7, 41.9, A.QuestionsPage, [[36.9, 'pop'], [37.1, 'swipe'], [39.8, 'swipe']]),
    it(41.9, 51.2, A.NeedVsOffer, [[42.1, 'swipe'], [42.3, 'tick'], [47.7, 'swipe'], [49.1, 'thud', 0.4]]),
  ]},
  {id: 'g4', layout: 'top', from: 51.4, to: 76.3, items: [
    it(51.4, 62.1, A.PecPage, [[51.6, 'pop'], [53.1, 'swipe'], [56.8, 'swipe'], [57.0, 'ding', 0.25]]),
    it(62.2, 76.3, A.RightsPage, [[63.0, 'swipe'], [63.3, 'swipe'], [63.6, 'swipe'], [67.2, 'coin'], [67.5, 'coin'], [67.8, 'coin']]),
  ]},
  {id: 'g5', layout: 'stack', from: 76.3, to: 104.5, items: [
    it(76.3, 91.6, A.TwoModalities, [[76.5, 'pop'], [79.9, 'swipe'], [80.2, 'ding', 0.25], [83.1, 'swipe'], [83.4, 'pop']]),
    it(91.8, 104.5, A.CollectivePage, [[92.0, 'swipe'], [95.4, 'pop'], [96.4, 'pop'], [97.4, 'pop']]),
  ]},
  {id: 'g6', layout: 'top', from: 105.0, to: 137.6, items: [
    it(105.0, 125.1, A.ContractVsConv, [[105.2, 'pop'], [107.4, 'swipe'], [112.6, 'swipe'], [112.9, 'pop'], [116.0, 'pop'], [119.4, 'thud', 0.45], [119.5, 'swipe']]),
    it(125.1, 137.6, A.ConventionOut, [[125.3, 'pop'], [129.9, 'swipe'], [130.3, 'success', 0.25], [132.7, 'swipe'], [133.1, 'buzz', 0.3]]),
  ]},
  {id: 'g7', layout: 'stack', from: 137.6, to: 168.0, items: [
    it(137.6, 168.0, A.BargainPower, [[137.8, 'pop'], [140.6, 'thud', 0.45], [142.9, 'pop'], [143.4, 'pop'], [145.8, 'riser', 0.2], [152.1, 'pop'], [153.6, 'pop'], [160.2, 'buzz', 0.3]]),
  ]},
  {id: 'g8', layout: 'top', from: 175.9, to: 188.6, items: [
    it(175.9, 183.7, A.EmployeeWants, [[176.1, 'pop'], [178.1, 'thud', 0.3], [178.9, 'swipe']]),
    it(183.7, 188.6, A.ProfitUp, [[183.9, 'swipe'], [184.0, 'tick'], [184.3, 'tick'], [184.6, 'tick'], [184.9, 'tick'], [185.2, 'coin'], [186.0, 'pop']]),
  ]},
  {id: 'g8b', layout: 'stack', from: 192.8, to: 215.0, items: [
    it(192.8, 202.7, A.IncentivesA, [[193.0, 'pop'], [198.3, 'pop'], [199.8, 'pop'], [201.2, 'pop']]),
    it(202.7, 215.0, A.IncentivesB, [[202.9, 'swipe'], [204.7, 'swipe'], [206.7, 'coin'], [210.7, 'swipe'], [210.9, 'ding', 0.25]]),
  ]},
  {id: 'g9', layout: 'stack', from: 217.8, to: 227.7, items: [
    it(217.8, 227.7, A.Asymmetry, [[218.0, 'thud', 0.45], [218.4, 'pop'], [223.2, 'riser', 0.15], [224.2, 'pop']]),
  ]},
  {id: 'g10', layout: 'top', from: 227.7, to: 256.2, items: [
    it(227.7, 240.5, A.NeedMoney, [[228.0, 'pop'], [228.7, 'coin'], ...ticks(228.7, 0.12, 6), [233.2, 'pop']]),
    it(240.5, 249.6, A.FlexJobs, [[240.7, 'swipe'], [241.1, 'pop'], [241.3, 'pop'], [241.5, 'pop'], [241.7, 'pop'], [242.0, 'pop'], [243.2, 'swipe'], [244.3, 'buzz', 0.3]]),
    it(249.6, 256.2, A.HoursGap, [[249.8, 'swipe'], [250.0, 'tick'], [252.6, 'swipe'], [254.2, 'buzz', 0.4]]),
  ]},
  {id: 'g11', layout: 'pip', from: 256.2, to: 300.9, items: [
    it(256.2, 271.2, B.MinWage, [[256.4, 'pop'], [256.6, 'pop'], [260.0, 'swipe'], [260.5, 'coin'], ...ticks(260.5, 0.12, 8), [264.8, 'pop'], [264.9, 'ding', 0.25]]),
    it(271.2, 280.0, B.HourValue, [[271.4, 'swipe'], [272.0, 'coin'], ...ticks(272.0, 0.12, 8), [274.4, 'pop']]),
    it(280.0, 292.5, B.HundredHours, [[280.2, 'swipe'], [281.2, 'pop'], [282.4, 'pop'], [283.0, 'pop'], [284.4, 'pop'], [285.0, 'coin'], ...ticks(285.0, 0.1, 8)]),
    it(292.5, 300.9, B.Hours176, [[292.7, 'swipe'], [293.8, 'pop'], ...ticks(293.8, 0.1, 8), [297.3, 'ding', 0.4]]),
  ]},
  {id: 'g12', layout: 'stack', from: 300.9, to: 313.3, items: [
    it(300.9, 313.3, B.PaidRest, [[301.1, 'pop'], [302.4, 'pop'], [302.57, 'pop'], [302.74, 'pop'], [302.9, 'pop'], [303.07, 'pop'], [305.3, 'coin'], [305.8, 'coin'], [307.9, 'ding', 0.25]]),
  ]},
  {id: 'g13', layout: 'pip', from: 313.3, to: 337.7, items: [
    it(313.3, 326.3, B.Result1, [[313.5, 'swipe'], [313.7, 'pop'], [314.4, 'pop'], [314.9, 'pop'], [321.5, 'pop'], [321.9, 'riser', 0.2], ...ticks(321.9, 0.1, 10)]),
    it(326.3, 333.8, B.Compare, [[326.5, 'swipe'], [326.7, 'tick'], [328.5, 'tick'], [330.9, 'thud', 0.5]]),
    it(333.8, 337.7, B.ThinkNot, [[333.9, 'buzz', 0.4], [334.2, 'pop'], [334.4, 'thud', 0.4]]),
  ]},
  {id: 'g14', layout: 'top', from: 338.0, to: 367.8, items: [
    it(338.0, 350.5, B.InssFgtsA, [[338.2, 'swipe'], [339.6, 'buzz', 0.25], [340.6, 'pop'], [340.9, 'pop'], [344.3, 'swipe'], [347.7, 'swipe']]),
    it(350.5, 361.9, B.InssRule, [[350.7, 'swipe'], [351.3, 'tick'], [354.9, 'tick'], [355.2, 'buzz', 0.35]]),
    it(361.9, 367.8, B.HoursTicker, [[362.0, 'swipe'], [wordT('12,', 361), 'tick', 0.35], [wordT('13,', 361), 'tick', 0.35], [wordT('14,', 361), 'tick', 0.35], [wordT('16', 361), 'buzz', 0.35]]),
  ]},
  {id: 'g15', layout: 'stack', from: 371.4, to: 382.0, items: [
    it(371.4, 382.0, B.End6x1, [[371.6, 'thud', 0.4], [376.4, 'swipe'], [377.7, 'pop'], [378.0, 'swipe'], [380.8, 'success', 0.3]]),
  ]},
  {id: 'g16', layout: 'top', from: 382.1, to: 409.2, items: [
    it(382.1, 398.3, B.FlowChips, [[382.3, 'pop'], [384.3, 'swipe'], [388.1, 'pop'], [390.1, 'swipe'], [394.1, 'pop'], [395.3, 'buzz', 0.4], [395.4, 'thud', 0.45]]),
    it(398.3, 409.2, B.ProfitFlex, [[398.5, 'swipe'], [398.7, 'coin'], [401.0, 'swipe'], [402.0, 'riser', 0.15]]),
  ]},
  {id: 'g17', layout: 'stack', from: 411.6, to: 426.8, items: [
    it(411.6, 426.8, B.ToggleDays, [[411.8, 'swipe'], [412.0, 'success', 0.25], [414.2, 'swipe'], [414.4, 'buzz', 0.3], [417.6, 'swipe'], [417.8, 'buzz', 0.3], [421.9, 'thud', 0.5]]),
  ]},
  {id: 'g18', layout: 'top', from: 426.9, to: 442.1, items: [
    it(426.9, 442.1, B.Cascade, [[427.0, 'swipe'], [430.4, 'thud', 0.45], ...ticks(434.5, 0.167, 18, 0.18)]),
  ]},
  {id: 'g19', layout: 'stack', from: 461.2, to: 479.0, items: [
    it(461.2, 479.0, B.BelowMin, [[461.4, 'pop'], [461.6, 'swipe'], [467.4, 'swipe'], [468.2, 'tick'], [469.6, 'tick'], [474.6, 'buzz', 0.35], [474.9, 'pop']]),
  ]},
  {id: 'g20', layout: 'top', from: 479.4, to: 494.6, items: [
    it(479.4, 494.6, B.FallingChart, [[479.6, 'pop'], [480.2, 'riser', 0.25], [489.2, 'buzz', 0.3], [491.4, 'buzz', 0.3]]),
  ]},
  {id: 'g21', layout: 'stack', from: 494.7, to: 516.7, items: [
    it(494.7, 516.7, B.RealWage, [[494.9, 'pop'], [499.7, 'riser', 0.2], [501.0, 'pop'], [501.6, 'pop'], [503.0, 'ding', 0.3], [507.2, 'pop']]),
  ]},
  {id: 'g22', layout: 'top', from: 517.3, to: 531.9, items: [
    it(517.3, 531.9, B.Governments, [[517.5, 'pop'], [520.9, 'swipe'], [521.0, 'success', 0.3], [523.6, 'swipe'], [523.8, 'buzz', 0.3]]),
  ]},
];

export type Overlay = {from: number; to: number; kind: 'name' | 'kw'; title: string; sub?: string; accent?: string};
export const OVERLAYS: Overlay[] = [
  {from: 0.6, to: 4.6, kind: 'name', title: 'João Victor', sub: 'Economista · UFS'},
  {from: 12.6, to: 16.6, kind: 'kw', title: 'Proposta de Flávio Bolsonaro', sub: 'Flexibilidade de salário e de horas'},
  {from: 32.5, to: 36.5, kind: 'kw', title: 'Uma pergunta importante', sub: 'Quem decide?'},
  {from: 368.0, to: 371.3, kind: 'kw', title: 'PEC do fim da escala 6×1', sub: 'Redução da jornada'},
  {from: 409.3, to: 411.5, kind: 'kw', title: 'Conclusão', sub: 'Trabalha por hora, recebe por hora'},
  {from: 442.3, to: 446.5, kind: 'kw', title: 'Para fechar', sub: 'Atenção, trabalhador'},
  {from: 446.8, to: 455.0, kind: 'kw', title: 'Abra o olho', sub: 'Quem é assalariado será fortemente impactado'},
  {from: 455.4, to: 460.9, kind: 'kw', title: 'E se a empresa só quiser contratos por hora?'},
  {from: 532.5, to: 534.6, kind: 'kw', title: 'E você?', sub: 'Fica o questionamento'},
];

/* ---------- derived: layout keys + sfx cues ---------- */
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
  const add = (t: number, name: string, vol?: number) => out.push({t, name, vol: vol ?? SFX_BASE[name].vol});
  GROUPS.forEach((g, i) => {
    add(g.from - PRE / FPS - 0.05, 'whoosh_in');
    const next = GROUPS[i + 1];
    if (!next || next.from - g.to > 0.7) add(g.to - 0.05, 'whoosh_out');
    g.items.forEach((x) => (x.cues ?? []).forEach((c) => add(c[0], c[1], c[2])));
  });
  OVERLAYS.forEach((o) => add(o.from, o.kind === 'name' ? 'swipe' : 'pop'));
  return out.filter((c) => c.t >= 0).sort((a, b) => a.t - b.t);
})();

export const CAPTION_WORDS = words;
export const _unusedLayoutName: LayoutName = 'full';

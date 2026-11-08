import {spring} from 'remotion';
import {CAPTION, SHAPE} from './brand.generated';

/**
 * Motor de layout: o apresentador NUNCA sai de quadro.
 *  - full : tela cheia (vídeo 720x1280 escalado 1.5x → 1080x1920)
 *  - stack: gráfico em cima, legenda no meio, apresentador embaixo
 *  - top  : apresentador em cima, legenda no meio, gráfico embaixo
 *  - pip  : gráfico grande, apresentador numa janela pequena embaixo à esquerda, legenda ao lado
 *
 * O vídeo fonte tem SRC_W x SRC_H (padrão 720x1280, vertical). Cada janela mostra uma faixa vertical do
 * vídeo (cropY = onde começa, em pixels do ORIGINAL). Mantenha o rosto dentro da faixa e fora de
 * qualquer legenda queimada do original (em geral abaixo de ~78% da altura).
 */
export const SRC_W = 720;
export const SRC_H = 1280;

export type LayoutName = 'full' | 'stack' | 'top' | 'pip';

export type LRect = {
  x: number; y: number; w: number; h: number; // janela do apresentador
  s: number; cropY: number; r: number; // escala do vídeo (w = SRC_W*s), início da faixa no original, raio
  cx: number; cy: number; cw: number; ch: number; cfs: number; // caixa da legenda + tamanho da fonte
  plate: number; // 1 = placa opaca atrás da legenda (esconde a legenda queimada em tela cheia)
};

const R = SHAPE.windowRadius;
export const LAYOUTS: Record<LayoutName, LRect> = {
  full: {x: 0, y: 0, w: 1080, h: 1920, s: 1.5, cropY: 0, r: 0, cx: 50, cy: 1475, cw: 980, ch: 245, cfs: CAPTION.sizeFull, plate: 1},
  stack: {x: 180, y: 990, w: 720, h: 840, s: 1, cropY: 120, r: R, cx: 40, cy: 855, cw: 1000, ch: 120, cfs: CAPTION.sizeSplit, plate: 0},
  top: {x: 180, y: 110, w: 720, h: 840, s: 1, cropY: 120, r: R, cx: 40, cy: 972, cw: 1000, ch: 120, cfs: CAPTION.sizeSplit, plate: 0},
  pip: {x: 40, y: 1340, w: 480, h: 560, s: 480 / 720, cropY: 120, r: R * 0.8, cx: 550, cy: 1340, cw: 490, ch: 560, cfs: CAPTION.sizeSplit - 2, plate: 0},
};

/** Área do gráfico (cartão) em cada layout. */
export const ZONES: Record<Exclude<LayoutName, 'full'>, {x: number; y: number; w: number; h: number; zoom: number}> = {
  stack: {x: 40, y: 110, w: 1000, h: 720, zoom: 1},
  top: {x: 40, y: 1115, w: 1000, h: 715, zoom: 1},
  pip: {x: 40, y: 110, w: 1000, h: 1190, zoom: 1.3}, // zoom: o conteúdo é desenhado menor e ampliado, para preencher o cartão alto
};

export type LayoutKey = {frame: number; layout: LayoutName};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const layoutAt = (frame: number, fps: number, keys: LayoutKey[]): LRect => {
  let idx = -1;
  for (let i = 0; i < keys.length; i++) if (keys[i].frame <= frame) idx = i;
  if (idx < 0) return LAYOUTS.full;
  const prev = idx > 0 ? keys[idx - 1].layout : 'full';
  const cur = keys[idx];
  const t = spring({frame: frame - cur.frame, fps, config: {damping: 19, stiffness: 120, mass: 0.9}});
  const a = LAYOUTS[prev];
  const b = LAYOUTS[cur.layout];
  const o = {} as LRect;
  (Object.keys(a) as (keyof LRect)[]).forEach((k) => {
    o[k] = lerp(a[k], b[k], t);
  });
  return o;
};

import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import words from './content/captions.json';
import {C, FONT, rgba} from './ui';
import {CAPTION} from './brand.generated';
import type {LRect} from './layout';

type W = {w: string; s: number; e: number};
type Chunk = {words: W[]; start: number; end: number};

/** Agrupa as palavras (com tempo) em blocos curtos: ≤5 palavras / ≤30 caracteres, quebra em pausa >0,55 s e em pontuação. */
const buildChunks = (): Chunk[] => {
  const out: Chunk[] = [];
  let cur: W[] = [];
  const flush = () => {
    if (cur.length) {
      out.push({words: cur, start: cur[0].s, end: cur[cur.length - 1].e});
      cur = [];
    }
  };
  (words as W[]).forEach((w, i, arr) => {
    const gap = i > 0 ? w.s - arr[i - 1].e : 0;
    const chars = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (gap > 0.55 || cur.length >= 5 || chars > 30)) flush();
    cur.push(w);
    if (/[.?!]$/.test(w.w) && cur.length >= 2) flush();
    else if (/,$/.test(w.w) && cur.length >= 3) flush();
  });
  flush();
  return out;
};

export const Captions: React.FC<{rect: LRect}> = ({rect}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = useMemo(buildChunks, []);
  let ci = -1;
  for (let i = 0; i < chunks.length; i++) if (chunks[i].start - 0.04 <= t) ci = i;
  const chunk = ci >= 0 ? chunks[ci] : null;
  const visible = chunk && t <= chunk.end + 0.35;
  const plateOpacity = rect.plate;
  return (
    <div
      style={{
        position: 'absolute', left: rect.cx, top: rect.cy, width: rect.cw, height: rect.ch,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 36,
        background: rgba(CAPTION.plate, plateOpacity),
        border: plateOpacity > 0.05 ? `3px solid ${rgba(CAPTION.highlight, plateOpacity * 0.9)}` : 'none',
        boxShadow: plateOpacity > 0.05 ? `0 10px 40px rgba(0,0,0,${0.45 * plateOpacity})` : 'none',
        padding: '0 26px',
      }}
    >
      {visible && chunk ? (
        <div style={{fontFamily: FONT.head, fontWeight: 800, fontSize: rect.cfs, lineHeight: 1.12, textAlign: 'center', color: C.text, textShadow: '0 3px 14px rgba(0,0,0,0.55)', textTransform: CAPTION.uppercase ? 'uppercase' : 'none'}}>
          {chunk.words.map((w, i) => {
            const active = t >= w.s - 0.02 && t < w.e + 0.02;
            return (
              <span key={i} style={{color: active ? CAPTION.highlight : C.text}}>
                {w.w}{' '}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

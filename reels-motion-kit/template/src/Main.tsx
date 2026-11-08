import React from 'react';
import {AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from './Captions';
import {BACKGROUND, GRADIENT, SFX_GAIN, SHAPE} from './brand.generated';
import {LAYOUT_KEYS, EXIT, FPS, GROUPS, OVERLAYS, PRE, SFX_BASE, SFX_CUES, TOTAL_FRAMES} from './content/timeline';
import type {Group, Overlay} from './content/timeline';
import {INSERTS} from './inserts';
import {layoutAt, ZONES} from './layout';
import {Speaker} from './Speaker';
import {C, FONT, rgba, useSp} from './ui';

const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const off = (f * 0.6) % 90;
  return (
    <AbsoluteFill style={{background: `radial-gradient(1200px 900px at 50% 20%, ${C.navy} 0%, ${C.ink} 70%)`}}>
      {BACKGROUND.style === 'grid' ? (
        <div style={{position: 'absolute', inset: -90, backgroundImage: `linear-gradient(${rgba(C.blue, BACKGROUND.gridOpacity)} 2px, transparent 2px), linear-gradient(90deg, ${rgba(C.blue, BACKGROUND.gridOpacity)} 2px, transparent 2px)`, backgroundSize: '90px 90px', transform: `translate(${off}px, ${off}px)`}} />
      ) : null}
    </AbsoluteFill>
  );
};

const ItemWrap: React.FC<{children: React.ReactNode; fadeOut: boolean; dur: number}> = ({children, fadeOut, dur}) => {
  const lf = useCurrentFrame();
  const o = fadeOut ? interpolate(lf, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  return <div style={{position: 'absolute', inset: 0, opacity: o}}>{children}</div>;
};

const GroupView: React.FC<{g: Group}> = ({g}) => {
  const lf = useCurrentFrame();
  const z = ZONES[g.layout];
  const p = useSp(3, {damping: 16, stiffness: 120});
  const base = Math.round(g.from * FPS) - PRE;
  const exitStart = Math.round(g.to * FPS) - base;
  const q = interpolate(lf, [exitStart, exitStart + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute', left: z.x, top: z.y, width: z.w, height: z.h,
        borderRadius: SHAPE.cardRadius, background: `linear-gradient(160deg, ${C.card} 0%, ${C.navy} 100%)`, border: `${SHAPE.borderWidth}px solid ${C.line}`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)', overflow: 'hidden',
        opacity: Math.min(1, p * 1.6) * (1 - q), transform: `scale(${(0.92 + 0.08 * p) * (1 - q * 0.06)}) translateY(${(1 - p) * 40 * (g.layout === 'top' ? 1 : -1)}px)`,
      }}
    >
      {SHAPE.accentBar ? <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 8, background: `linear-gradient(90deg, ${GRADIENT[0]}, ${GRADIENT[1]})`}} /> : null}
      <div style={{position: 'absolute', left: 0, top: 0, width: z.w / z.zoom, height: z.h / z.zoom, transform: `scale(${z.zoom})`, transformOrigin: '0 0'}}>
        {g.items.map((x, i) => {
          const from = Math.round(x.from * FPS) - base;
          const last = i === g.items.length - 1;
          const dur = Math.round((x.to - x.from) * FPS) + (last ? 0 : 4);
          const Comp = (x.Comp ?? INSERTS[x.type as keyof typeof INSERTS]) as React.FC<any>;
          return (
            <Sequence key={i} from={from} durationInFrames={Math.max(1, dur)} layout="none">
              <ItemWrap fadeOut={!last} dur={dur}>
                <Comp w={z.w / z.zoom} h={z.h / z.zoom} t0={x.from} {...(x.props ?? {})} />
              </ItemWrap>
            </Sequence>
          );
        })}
      </div>
    </div>
  );
};

const OverlayView: React.FC<{o: Overlay}> = ({o}) => {
  const lf = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = useSp(0, {damping: 15, stiffness: 140});
  const dur = Math.round((o.to - o.from) * fps);
  const out = interpolate(lf, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o.kind === 'name') {
    return (
      <div style={{position: 'absolute', left: 48, top: 170, opacity: Math.min(1, p * 1.5) * out, transform: `translateX(${(1 - p) * -260}px)`}}>
        <div style={{display: 'flex', alignItems: 'stretch', background: rgba(C.ink, 0.9), borderRadius: 26, overflow: 'hidden', border: `2px solid ${C.line}`, boxShadow: '0 16px 40px rgba(0,0,0,0.45)'}}>
          <div style={{width: 14, background: C.gold}} />
          <div style={{padding: '18px 34px 18px 26px'}}>
            <div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 52, color: C.text, lineHeight: 1.05}}>{o.title}</div>
            <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: 30, color: C.gold, marginTop: 6}}>{o.sub}</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 190, display: 'flex', justifyContent: 'center', opacity: Math.min(1, p * 1.5) * out, transform: `translateY(${(1 - p) * -50}px) scale(${0.9 + p * 0.1})`}}>
      <div style={{background: rgba(C.ink, 0.92), borderRadius: 32, border: `3px solid ${C.gold}`, padding: '24px 36px', textAlign: 'center', boxShadow: '0 18px 50px rgba(0,0,0,0.5)', maxWidth: 960}}>
        <div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 60, color: C.text, lineHeight: 1.08}}>{o.title}</div>
        {o.sub ? <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: 34, color: C.gold, marginTop: 10}}>{o.sub}</div> : null}
      </div>
    </div>
  );
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rect = layoutAt(frame, fps, LAYOUT_KEYS);
  return (
    <AbsoluteFill style={{background: C.ink, fontFamily: FONT.body}}>
      <Backdrop />
      {GROUPS.map((g) => {
        const from = Math.round(g.from * FPS) - PRE;
        return (
          <Sequence key={g.id} from={from} durationInFrames={Math.round(g.to * FPS) - from + EXIT} layout="none">
            <GroupView g={g} />
          </Sequence>
        );
      })}
      <Speaker rect={rect} />
      {OVERLAYS.map((o, i) => (
        <Sequence key={i} from={Math.round(o.from * FPS)} durationInFrames={Math.round((o.to - o.from) * FPS)} layout="none">
          <OverlayView o={o} />
        </Sequence>
      ))}
      <Captions rect={rect} />
      <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: `${(frame / TOTAL_FRAMES) * 100}%`, background: `linear-gradient(90deg, ${GRADIENT[0]}, ${GRADIENT[1]})`}} />
      {SFX_CUES.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.t * FPS))} durationInFrames={Math.ceil(SFX_BASE[c.name].dur * FPS) + 2} layout="none">
          <Html5Audio src={staticFile(`sfx/${c.name}.wav`)} volume={Math.min(1, c.vol * SFX_GAIN)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

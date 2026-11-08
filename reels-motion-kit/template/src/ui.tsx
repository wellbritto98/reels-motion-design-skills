import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MOTION} from './brand.generated';

// Tokens do design system (gerados de design-system/design-system.json). Todo componente importa daqui.
export {C, FONT};
export const sec = (s: number) => Math.round(s * 30);
/** '#rrggbb' + alpha (0-1) → 'rgba(...)'. */
export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
};

export const useSp = (delay = 0, cfg: {damping?: number; stiffness?: number; mass?: number} = {damping: MOTION.damping, stiffness: MOTION.stiffness}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: cfg});
};
export const useProg = (start: number, dur: number, ease = Easing.out(Easing.cubic)) => {
  const f = useCurrentFrame();
  return interpolate(f, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
};
export const brl = (n: number, dec = 0) =>
  'R$ ' + n.toLocaleString('pt-BR', {minimumFractionDigits: dec, maximumFractionDigits: dec});
export const num = (n: number, dec = 0) => n.toLocaleString('pt-BR', {minimumFractionDigits: dec, maximumFractionDigits: dec});

type PopProps = {delay?: number; from?: 'up' | 'down' | 'left' | 'right' | 'scale'; children: React.ReactNode; style?: React.CSSProperties};
export const Pop: React.FC<PopProps> = ({delay = 0, from = 'up', children, style}) => {
  const p = useSp(delay);
  const o = Math.min(1, Math.max(0, p * 1.5));
  const d = (1 - p) * 60;
  const t =
    from === 'up' ? `translateY(${d}px)` : from === 'down' ? `translateY(${-d}px)` : from === 'left' ? `translateX(${-d * 1.5}px)` : from === 'right' ? `translateX(${d * 1.5}px)` : `scale(${0.6 + p * 0.4})`;
  return <div style={{opacity: o, transform: t, ...style}}>{children}</div>;
};

export const Panel: React.FC<{children: React.ReactNode; gap?: number; style?: React.CSSProperties}> = ({children, gap = 26, style}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap, padding: '28px 44px', textAlign: 'center', ...style}}>
    {children}
  </div>
);
export const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.gold}) => (
  <div style={{fontFamily: FONT.head, fontWeight: 800, fontSize: 30, letterSpacing: 6, textTransform: 'uppercase', color}}>{children}</div>
);
export const H1: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 74, color = C.text}) => (
  <div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: size, lineHeight: 1.05, color, letterSpacing: -1}}>{children}</div>
);
export const Body: React.FC<{children: React.ReactNode; size?: number; color?: string; weight?: number}> = ({children, size = 40, color = C.mute, weight = 600}) => (
  <div style={{fontFamily: FONT.body, fontWeight: weight, fontSize: size, lineHeight: 1.25, color}}>{children}</div>
);
export const Gold: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.gold}) => <span style={{color}}>{children}</span>;

export const Pill: React.FC<{children: React.ReactNode; color?: string; bg?: string; size?: number; style?: React.CSSProperties}> = ({children, color = C.ink, bg = C.gold, size = 34, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: '12px 28px', borderRadius: 999, background: bg, color, fontFamily: FONT.head, fontWeight: 800, fontSize: size, ...style}}>{children}</div>
);
export const Row: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.line, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 28, width: '100%', padding: '24px 32px', borderRadius: 28, background: C.card2, border: `3px solid ${color}`, textAlign: 'left', ...style}}>{children}</div>
);

/* ---------- icons (stroke style) ---------- */
type IconP = {size?: number; color?: string; sw?: number};
const Svg: React.FC<{size: number; children: React.ReactNode}> = ({size, children}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
export const IconClock: React.FC<IconP> = ({size = 80, color = C.gold, sw = 4}) => (
  <Svg size={size}><circle cx="32" cy="32" r="26" stroke={color} strokeWidth={sw} /><path d="M32 16v17l11 7" stroke={color} strokeWidth={sw} /></Svg>
);
export const IconCoin: React.FC<IconP & {label?: string}> = ({size = 80, color = C.gold, sw = 4, label = 'R$'}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="26" stroke={color} strokeWidth={sw} /><circle cx="32" cy="32" r="19" stroke={color} strokeWidth={sw / 2} opacity={0.5} /><text x="32" y="40" textAnchor="middle" fontFamily={FONT.head} fontWeight={900} fontSize="22" fill={color}>{label}</text></svg>
);
export const IconCheck: React.FC<IconP> = ({size = 64, color = C.green, sw = 7}) => (
  <Svg size={size}><circle cx="32" cy="32" r="27" stroke={color} strokeWidth={4} /><path d="M19 33l9 9 18-20" stroke={color} strokeWidth={sw} /></Svg>
);
export const IconCross: React.FC<IconP> = ({size = 64, color = C.red, sw = 7}) => (
  <Svg size={size}><circle cx="32" cy="32" r="27" stroke={color} strokeWidth={4} /><path d="M21 21l22 22M43 21L21 43" stroke={color} strokeWidth={sw} /></Svg>
);
export const IconUser: React.FC<IconP> = ({size = 80, color = C.blue, sw = 4}) => (
  <Svg size={size}><circle cx="32" cy="22" r="11" stroke={color} strokeWidth={sw} /><path d="M10 56c2-13 11-19 22-19s20 6 22 19" stroke={color} strokeWidth={sw} /></Svg>
);
export const IconPeople: React.FC<IconP> = ({size = 80, color = C.green, sw = 4}) => (
  <Svg size={size}><circle cx="32" cy="20" r="9" stroke={color} strokeWidth={sw} /><path d="M16 50c1-9 7-14 16-14s15 5 16 14" stroke={color} strokeWidth={sw} /><circle cx="12" cy="26" r="6" stroke={color} strokeWidth={sw - 1} opacity={0.7} /><circle cx="52" cy="26" r="6" stroke={color} strokeWidth={sw - 1} opacity={0.7} /></Svg>
);
export const IconBuilding: React.FC<IconP> = ({size = 80, color = C.gold, sw = 4}) => (
  <Svg size={size}><rect x="14" y="8" width="26" height="48" rx="2" stroke={color} strokeWidth={sw} /><rect x="40" y="26" width="12" height="30" rx="2" stroke={color} strokeWidth={sw} /><path d="M21 18h4M29 18h4M21 28h4M29 28h4M21 38h4M29 38h4M21 48h4M29 48h4M44 34h4M44 44h4" stroke={color} strokeWidth={sw - 1} /></Svg>
);
export const IconDoc: React.FC<IconP> = ({size = 80, color = C.blue, sw = 4}) => (
  <Svg size={size}><path d="M16 6h22l12 12v38a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke={color} strokeWidth={sw} /><path d="M38 6v12h12M22 30h20M22 38h20M22 46h12" stroke={color} strokeWidth={sw - 1} /></Svg>
);
export const IconCalendar: React.FC<IconP> = ({size = 80, color = C.green, sw = 4}) => (
  <Svg size={size}><rect x="8" y="12" width="48" height="44" rx="6" stroke={color} strokeWidth={sw} /><path d="M8 26h48M20 6v12M44 6v12" stroke={color} strokeWidth={sw} /></Svg>
);
export const IconLeaf: React.FC<IconP> = ({size = 80, color = C.green, sw = 4}) => (
  <Svg size={size}><path d="M12 52C10 28 24 12 54 10c2 28-10 42-34 42z" stroke={color} strokeWidth={sw} /><path d="M12 52C24 40 34 30 46 20" stroke={color} strokeWidth={sw - 1} /></Svg>
);
export const IconFlask: React.FC<IconP> = ({size = 80, color = C.violet, sw = 4}) => (
  <Svg size={size}><path d="M24 8h16M27 8v18L11 52a4 4 0 0 0 4 6h34a4 4 0 0 0 4-6L37 26V8" stroke={color} strokeWidth={sw} /><path d="M19 42h26" stroke={color} strokeWidth={sw - 1} /></Svg>
);
export const IconChip: React.FC<IconP> = ({size = 80, color = C.blue, sw = 4}) => (
  <Svg size={size}><rect x="16" y="16" width="32" height="32" rx="4" stroke={color} strokeWidth={sw} /><rect x="26" y="26" width="12" height="12" stroke={color} strokeWidth={sw - 1} /><path d="M24 6v10M32 6v10M40 6v10M24 48v10M32 48v10M40 48v10M6 24h10M6 32h10M6 40h10M48 24h10M48 32h10M48 40h10" stroke={color} strokeWidth={sw - 1} /></Svg>
);
export const IconArrow: React.FC<IconP & {dir?: 'right' | 'down' | 'up'}> = ({size = 60, color = C.gold, sw = 6, dir = 'right'}) => (
  <div style={{transform: `rotate(${dir === 'right' ? 0 : dir === 'down' ? 90 : -90}deg)`, display: 'flex'}}>
    <Svg size={size}><path d="M10 32h42M36 14l18 18-18 18" stroke={color} strokeWidth={sw} /></Svg>
  </div>
);
export const IconTrend: React.FC<IconP & {down?: boolean}> = ({size = 80, color = C.green, sw = 5, down = false}) => (
  <Svg size={size}>{down ? <path d="M6 16l18 18 12-10 22 22M42 46h16V30" stroke={color} strokeWidth={sw} /> : <path d="M6 48l18-18 12 10 22-22M42 18h16v16" stroke={color} strokeWidth={sw} />}</Svg>
);

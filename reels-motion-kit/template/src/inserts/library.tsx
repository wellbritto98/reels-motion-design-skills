/**
 * BIBLIOTECA DE INSERÇÕES — componentes de motion graphics 100% dirigidos por dados.
 * A IA monta um reel novo só preenchendo `props` no timeline (sem escrever React). Para um gráfico novo,
 * crie outro componente aqui seguindo o mesmo padrão e registre em inserts/index.ts.
 *
 * Convenções
 *  - Cada componente recebe {w, h, t0, ...props}. w/h = tamanho útil do cartão; t0 = segundo em que a página começa.
 *  - `at` (em props) é o SEGUNDO ABSOLUTO do vídeo em que a peça aparece (prenda à fala com wordTime()).
 *  - Cores são nomes do design system: gold | green | red | blue | violet | mute | text.
 *  - Texto curto: ≤ 6 palavras por linha de título, ≤ 10 por linha de apoio (cartão é lido em 1–2 s).
 */
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {
  Body, brl, C, FONT, Gold, H1, IconArrow, IconBuilding, IconCalendar, IconCheck, IconChip, IconClock, IconCoin, IconCross, IconDoc, IconFlask,
  IconLeaf, IconPeople, IconTrend, IconUser, Kicker, num, Panel, Pill, Pop, Row, sec, useProg, useSp,
} from '../ui';

export type ColorName = 'gold' | 'green' | 'red' | 'blue' | 'violet' | 'mute' | 'text';
const col = (n: ColorName | string | undefined, fallback: string = C.gold) => (n && n in C ? (C as Record<string, string>)[n] : n ?? fallback);
const onColor = (bg: string) => (bg === C.mute || bg === C.gold || bg === C.green || bg === C.blue ? C.ink : '#fff');

export const ICONS: Record<string, React.FC<any>> = {
  clock: IconClock, coin: IconCoin, check: IconCheck, cross: IconCross, user: IconUser, people: IconPeople, building: IconBuilding,
  doc: IconDoc, calendar: IconCalendar, leaf: IconLeaf, flask: IconFlask, chip: IconChip, trend: IconTrend, 'trend-down': (p: any) => <IconTrend down {...p} />,
  arrow: IconArrow,
};
const Icon: React.FC<{name?: string; size?: number; color?: string}> = ({name, size = 70, color}) => {
  const I = name ? ICONS[name] : undefined;
  return I ? <I size={size} {...(color ? {color} : {})} /> : null;
};

type Base = {w: number; h: number; t0: number};
/** frames de atraso locais para um `at` absoluto */
const d = (at: number | undefined, t0: number, fallback = 0) => (at === undefined ? fallback : Math.max(0, sec(at - t0)));

/* ---------- 1. TitleCard ---------- */
export const TitleCard: React.FC<Base & {kicker?: string; title: string; highlight?: string; sub?: string; icons?: string[]}> = ({kicker, title, highlight, sub, icons = []}) => {
  const f = useCurrentFrame();
  const spin = Math.sin(f / 14) * 8;
  return (
    <Panel gap={22}>
      {icons.length ? (
        <div style={{display: 'flex', gap: 36, alignItems: 'center'}}>
          {icons.map((n, i) => (
            <Pop key={i} from="scale" delay={i * 5}><div style={{transform: `rotate(${i % 2 ? -spin : spin}deg)`}}><Icon name={n} size={140} color={i % 2 ? C.green : C.gold} /></div></Pop>
          ))}
        </div>
      ) : null}
      {kicker ? <Pop delay={9}><Kicker>{kicker}</Kicker></Pop> : null}
      <Pop delay={13}><H1 size={80}>{title} {highlight ? <Gold>{highlight}</Gold> : null}</H1></Pop>
      {sub ? <Pop delay={22}><Body size={42}>{sub}</Body></Pop> : null}
    </Panel>
  );
};

/* ---------- 2. RowsList ---------- */
export const RowsList: React.FC<Base & {kicker?: string; rows: {text: string; icon?: string; lead?: string; at?: number; tag?: string; tone?: ColorName}[]; closing?: {text: string; tone?: ColorName; at: number}}> = ({t0, kicker, rows, closing}) => (
  <Panel gap={20}>
    {kicker ? <Pop><Kicker>{kicker}</Kicker></Pop> : null}
    {rows.map((r, i) => {
      const tone = r.icon === 'cross' ? C.red : r.icon === 'check' ? C.green : col(r.tone, C.line);
      return (
        <Pop key={i} delay={d(r.at, t0, i * 6)} from={i % 2 ? 'right' : 'left'} style={{width: '100%'}}>
          <Row color={tone}>
            {r.lead ? <Icon name={r.lead} size={64} /> : null}
            <Body size={40} color={C.text} weight={800}>{r.text}</Body>
            <div style={{flex: 1}} />
            {r.tag ? <Pill bg={C.gold} size={28}>{r.tag}</Pill> : null}
            {r.icon === 'check' || r.icon === 'cross' ? <Icon name={r.icon} size={56} /> : r.icon ? <Icon name={r.icon} size={56} /> : null}
          </Row>
        </Pop>
      );
    })}
    {closing ? <Pop delay={d(closing.at, t0)} from="scale"><Pill bg={col(closing.tone, C.gold)} color={onColor(col(closing.tone, C.gold))} size={36}>{closing.text}</Pill></Pop> : null}
  </Panel>
);

/* ---------- 3. BigStat (número contando) ---------- */
export const BigStat: React.FC<Base & {kicker?: string; label?: string; value: number; format?: 'brl' | 'brl2' | 'int' | 'dec1' | 'dec2' | 'pct'; prefix?: string; suffix?: string; color?: ColorName; at: number; sub?: string; icon?: string}> = ({t0, kicker, label, value, format = 'int', prefix = '', suffix = '', color = 'green', at, sub, icon}) => {
  const p = useProg(d(at, t0), 36);
  const v = value * p;
  const text = format === 'brl' ? brl(v) : format === 'brl2' ? brl(v, 2) : format === 'pct' ? num(v, 0) + '%' : format === 'dec1' ? num(v, 1) : format === 'dec2' ? num(v, 2) : num(v, 0);
  return (
    <Panel gap={22}>
      {icon ? <Pop from="scale"><Icon name={icon} size={110} color={col(color)} /></Pop> : null}
      {kicker ? <Pop delay={3}><Kicker>{kicker}</Kicker></Pop> : null}
      {label ? <Pop delay={8}><Body size={46} color={C.text} weight={800}>{label}</Body></Pop> : null}
      <Pop delay={d(at, t0)} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 160, color: col(color), lineHeight: 1, letterSpacing: -2}}>{prefix}{text}{suffix}</div></Pop>
      {sub ? <Pop delay={d(at, t0) + 30}><Body size={38}>{sub}</Body></Pop> : null}
    </Panel>
  );
};

/* ---------- 4. Equation (a × b = resultado) ---------- */
export const Equation: React.FC<Base & {kicker?: string; parts: {t: string; at: number; color?: ColorName}[]; result?: {value: number; format?: 'brl' | 'brl2' | 'int'; at: number; color?: ColorName; prefix?: string}; note?: string}> = ({t0, kicker, parts, result, note}) => {
  const p = useProg(d(result?.at, t0), 34);
  const rv = (result?.value ?? 0) * p;
  return (
    <Panel gap={30}>
      {kicker ? <Pop><Kicker>{kicker}</Kicker></Pop> : null}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 24}}>
        {parts.map((x, i) => (
          <Pop key={i} delay={d(x.at, t0)} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 84, color: col(x.color, C.text), lineHeight: 1}}>{x.t}</div></Pop>
        ))}
      </div>
      {result ? (
        <>
          <Pop delay={d(result.at, t0) - 6} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 90, color: C.mute}}>=</div></Pop>
          <Pop delay={d(result.at, t0)} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 130, color: col(result.color, C.red), lineHeight: 1}}>{result.prefix ?? ''}{result.format === 'brl2' ? brl(rv, 2) : result.format === 'int' ? num(rv) : brl(rv)}</div></Pop>
        </>
      ) : null}
      {note ? <Pop delay={d(result?.at, t0) + 40}><Body size={38}>{note}</Body></Pop> : null}
    </Panel>
  );
};

/* ---------- 5. Bars (comparação horizontal) ---------- */
const HBar: React.FC<{label: string; pct: number; color: string; delay: number; value?: string; h?: number}> = ({label, pct, color, delay, value, h = 78}) => {
  const p = useProg(delay, 26);
  const o = useProg(delay - 4, 10);
  return (
    <div style={{width: '100%', opacity: o, textAlign: 'left'}}>
      <Body size={34} color={C.text} weight={700}>{label}</Body>
      <div style={{height: h, borderRadius: h / 2, background: C.ink, marginTop: 10, overflow: 'hidden', border: `2px solid ${C.line}`}}>
        <div style={{width: `${pct * p}%`, height: '100%', background: color, borderRadius: h / 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 26, fontFamily: FONT.head, fontWeight: 900, fontSize: 40, color: onColor(color), whiteSpace: 'nowrap'}}>{p > 0.85 ? value : ''}</div>
      </div>
    </div>
  );
};
export const Bars: React.FC<Base & {kicker?: string; bars: {label: string; pct: number; color?: ColorName; value?: string; at: number}[]; pill?: {text: string; tone?: ColorName; at: number}}> = ({t0, kicker, bars, pill}) => (
  <Panel gap={28}>
    {kicker ? <Pop><Kicker>{kicker}</Kicker></Pop> : null}
    {bars.map((b, i) => <HBar key={i} label={b.label} pct={b.pct} color={col(b.color, C.green)} delay={d(b.at, t0)} value={b.value} />)}
    {pill ? <Pop delay={d(pill.at, t0)} from="scale"><Pill bg={col(pill.tone, C.gold)} color={onColor(col(pill.tone, C.gold))} size={40}>{pill.text}</Pill></Pop> : null}
  </Panel>
);

/* ---------- 6. LineChart (1 ou 2 séries, desenhando a linha) ---------- */
export const LineChart: React.FC<Base & {kicker?: string; title?: string; series: {points: number[]; color?: ColorName; label?: string}[]; at: number; fillBetween?: boolean; tags?: {text: string; at: number; tone?: ColorName}[]}> = ({t0, kicker, title, series, at, fillBetween, tags = []}) => {
  const p = useProg(d(at, t0), 70, (t) => t);
  const W = 640;
  const H = 240;
  const all = series.flatMap((s) => s.points);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const xy = (s: number[]) => s.map((v, i) => [(i / (s.length - 1)) * W, H - ((v - lo) / (hi - lo || 1)) * (H - 20) - 10]);
  const path = (s: number[]) => xy(s).map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
  const band = series.length === 2 ? path(series[0].points) + ' ' + xy(series[1].points).reverse().map((q) => `L${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ') + ' Z' : '';
  return (
    <Panel gap={16}>
      {kicker ? <Pop><Kicker>{kicker}</Kicker></Pop> : null}
      {title ? <Pop delay={4}><H1 size={58}>{title}</H1></Pop> : null}
      <svg width={W + 80} height={H + 30} viewBox={`0 0 ${W + 80} ${H + 30}`}>
        <path d={`M30 10V${H + 12}H${W + 60}`} stroke={C.line} strokeWidth={4} fill="none" strokeLinecap="round" />
        <g transform="translate(40 6)">
          {fillBetween && band ? <path d={band} fill={C.green} opacity={0.18 * p} /> : null}
          {series.map((s, i) => (
            <path key={i} d={path(s.points)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} stroke={col(s.color, i ? C.mute : C.green)} strokeWidth={i ? 7 : 10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </g>
      </svg>
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center'}}>
        {series.filter((s) => s.label).map((s, i) => <Pop key={'l' + i} delay={d(at, t0) + 20 + i * 8} from="scale"><Pill bg={col(s.color, i ? C.mute : C.green)} color={onColor(col(s.color, i ? C.mute : C.green))} size={28}>{s.label}</Pill></Pop>)}
        {tags.map((t, i) => <Pop key={i} delay={d(t.at, t0)} from="scale"><Pill bg={C.card2} color={C.text} size={30} style={{border: `3px solid ${col(t.tone, C.red)}`}}>{t.text}</Pill></Pop>)}
      </div>
    </Panel>
  );
};

/* ---------- 7. PhotoCard (foto livre + crédito) ---------- */
export const PhotoCard: React.FC<Base & {src: string; credit: string; title?: string; pills?: {text: string; at: number; tone?: ColorName}[]; note?: string; noteAt?: number; focusY?: number}> = ({t0, src, credit, title, pills = [], note, noteAt, focusY = 50}) => {
  const f = useCurrentFrame();
  return (
    <Panel gap={18} style={{justifyContent: 'flex-start', paddingTop: 36}}>
      <Pop style={{width: '100%'}}>
        <div style={{position: 'relative', width: '100%', height: 340, borderRadius: 30, overflow: 'hidden', border: `3px solid ${C.line}`}}>
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${focusY}%`, transform: `scale(${1.04 + f * 0.0006})`}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)'}} />
          <div style={{position: 'absolute', right: 16, bottom: 10, fontFamily: FONT.body, fontSize: 20, color: 'rgba(255,255,255,0.85)'}}>{credit}</div>
        </div>
      </Pop>
      {title ? <Pop delay={6}><H1 size={64}>{title}</H1></Pop> : null}
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center'}}>
        {pills.map((p, i) => <Pop key={i} delay={d(p.at, t0)} from="scale"><Pill bg={col(p.tone, C.gold)} color={onColor(col(p.tone, C.gold))} size={34}>{p.text}</Pill></Pop>)}
      </div>
      {note ? <Pop delay={d(noteAt, t0, 40)}><Body size={36}>{note}</Body></Pop> : null}
    </Panel>
  );
};

/* ---------- 8. Versus (A × B) ---------- */
export const Versus: React.FC<Base & {kicker?: string; left: {title: string; sub?: string; icon?: string; tone?: ColorName; at: number}; right: {title: string; sub?: string; icon?: string; tone?: ColorName; at: number}; middle?: string; middleAt?: number}> = ({t0, kicker, left, right, middle = 'vs', middleAt}) => {
  const box = (s: typeof left, from: 'left' | 'right') => (
    <Pop delay={d(s.at, t0)} from={from} style={{flex: 1}}>
      <div style={{background: C.card2, border: `4px solid ${col(s.tone, C.blue)}`, borderRadius: 28, padding: 24, textAlign: 'center', minHeight: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
        <Icon name={s.icon} size={100} color={col(s.tone, C.blue)} />
        <Body size={38} color={C.text} weight={900}>{s.title}</Body>
        {s.sub ? <Body size={30}>{s.sub}</Body> : null}
      </div>
    </Pop>
  );
  return (
    <Panel gap={22}>
      {kicker ? <Pop><Kicker>{kicker}</Kicker></Pop> : null}
      <div style={{display: 'flex', alignItems: 'center', gap: 18, width: '100%'}}>
        {box(left, 'left')}
        <Pop delay={d(middleAt ?? left.at + 1, t0)} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 64, color: C.gold}}>{middle}</div></Pop>
        {box(right, 'right')}
      </div>
    </Panel>
  );
};

/* ---------- 9. Balance (balança que pende para um lado) ---------- */
export const Balance: React.FC<Base & {title?: string; left: {label: string; icon?: string; at: number}; right: {label: string; icon?: string; at: number}; heavier: 'left' | 'right'; tiltAt: number; chips?: {text: string; at: number; tone?: ColorName}[]}> = ({t0, title, left, right, heavier, tiltAt, chips = []}) => {
  const tilt = useProg(d(tiltAt, t0), 30, (t) => 1 - Math.pow(1 - t, 3));
  const angle = (heavier === 'left' ? -10 : 10) * tilt;
  const f = useCurrentFrame();
  const width = 700;
  const pan = (s: typeof left, x: number) => (
    <div style={{position: 'absolute', left: x - 120, top: 0, width: 240, transform: `rotate(${-angle}deg)`, transformOrigin: '50% 0', opacity: f >= d(s.at, t0) ? 1 : 0}}>
      <div style={{width: 4, height: 80, background: C.line, margin: '0 auto'}} />
      <div style={{background: C.card2, border: `3px solid ${C.line}`, borderRadius: 24, padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
        <Icon name={s.icon} size={80} />
        <Body size={30} color={C.text} weight={800}>{s.label}</Body>
      </div>
    </div>
  );
  return (
    <Panel gap={8}>
      {title ? <div style={{height: 90, display: 'flex', alignItems: 'center'}}><Pop from="scale"><H1 size={66}>{title}</H1></Pop></div> : null}
      <div style={{position: 'relative', width, height: 400, marginTop: 40}}>
        <div style={{position: 'absolute', left: width / 2 - 9, top: 30, width: 18, height: 330, background: C.line, borderRadius: 9}} />
        <div style={{position: 'absolute', left: width / 2 - 120, top: 352, width: 240, height: 20, background: C.line, borderRadius: 10}} />
        <div style={{position: 'absolute', left: 0, top: 30, width, height: 0, transform: `rotate(${angle}deg)`, transformOrigin: '50% 0'}}>
          <div style={{position: 'absolute', left: 0, top: -8, width, height: 16, borderRadius: 8, background: C.gold}} />
          {pan(left, 0)}
          {pan(right, width)}
        </div>
        <div style={{position: 'absolute', left: width / 2 - 22, top: 8, width: 44, height: 44, borderRadius: 22, background: C.gold, border: `6px solid ${C.ink}`}} />
      </div>
      <div style={{display: 'flex', gap: 14, minHeight: 60}}>
        {chips.map((c, i) => (f >= d(c.at, t0) ? <Pop key={i} from="scale"><Pill bg={col(c.tone, C.gold)} color={onColor(col(c.tone, C.gold))} size={28}>{c.text}</Pill></Pop> : null))}
      </div>
    </Panel>
  );
};

/* ---------- 10. DotsGrid (pessoas/itens que mudam de grupo) ---------- */
export const DotsGrid: React.FC<Base & {title?: string; total?: number; cols?: number; labelA: string; labelB: string; convertFrom: number; convertTo: number; convertCount: number; note?: string}> = ({t0, title, total = 24, cols = 8, labelA, labelB, convertFrom, convertTo, convertCount, note}) => {
  const f = useCurrentFrame();
  const start = d(convertFrom, t0);
  const span = Math.max(1, sec(convertTo - convertFrom));
  const converted = Math.min(convertCount, Math.max(0, Math.floor(((f - start) / span) * convertCount)));
  const order = Array.from({length: total}, (_, i) => (i * 7 + 3) % total); // ordem espalhada, determinística
  const flipped = new Set(order.slice(0, converted));
  return (
    <Panel gap={18}>
      {title ? <Pop from="scale"><H1 size={70}>{title}</H1></Pop> : null}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 96px)`, gap: 12}}>
        {Array.from({length: total}).map((_, i) => (
          <Pop key={i} delay={i * 1.2} from="scale">
            <div style={{width: 96, height: 96, borderRadius: 24, background: flipped.has(i) ? C.gold : C.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><IconUser size={58} color={C.ink} /></div>
          </Pop>
        ))}
      </div>
      <div style={{display: 'flex', gap: 26}}>
        <Pill bg={C.green} size={30}>{labelA} · {total - converted}</Pill>
        <Pill bg={C.gold} size={30}>{labelB} · {converted}</Pill>
      </div>
      {note ? <Body size={34}>{note}</Body> : null}
    </Panel>
  );
};

/* ---------- 11. Flow (passos verticais com seta) ---------- */
export const Flow: React.FC<Base & {kicker?: string; steps: {text: string; icon?: string; at: number; tone?: ColorName; final?: boolean}[]}> = ({t0, kicker, steps}) => (
  <Panel gap={14}>
    {kicker ? <Pop><Kicker>{kicker}</Kicker></Pop> : null}
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        {i > 0 ? <Pop delay={d(s.at, t0) - 8}><IconArrow dir="down" color={C.mute} size={44} /></Pop> : null}
        <Pop delay={d(s.at, t0)} from={s.final ? 'scale' : i % 2 ? 'right' : 'left'} style={s.final ? undefined : {width: '100%'}}>
          {s.final ? <Pill bg={col(s.tone, C.red)} color={onColor(col(s.tone, C.red))} size={42}>{s.text}</Pill> : (
            <Row color={col(s.tone, C.line)}><Icon name={s.icon} size={60} /><Body size={38} color={C.text} weight={800}>{s.text}</Body></Row>
          )}
        </Pop>
      </React.Fragment>
    ))}
  </Panel>
);

/* ---------- 12. Quote ---------- */
export const Quote: React.FC<Base & {text: string; who?: string; tone?: ColorName}> = ({text, who, tone = 'gold'}) => (
  <Panel gap={22}>
    <Pop from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 200, lineHeight: 0.6, color: col(tone)}}>“</div></Pop>
    <Pop delay={6}><H1 size={60}>{text}</H1></Pop>
    {who ? <Pop delay={20}><Body size={36} color={col(tone)} weight={800}>— {who}</Body></Pop> : null}
  </Panel>
);

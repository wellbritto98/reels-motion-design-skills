import React from 'react';
import {useCurrentFrame} from 'remotion';
import words from './captions.json';
import {
  Body, brl, C, FONT, Gold, H1, IconArrow, IconBuilding, IconCalendar, IconCheck, IconClock, IconCoin, IconCross, IconDoc, IconTrend, IconUser,
  Kicker, num, Panel, Pill, Pop, Row, sec, useProg, useSp,
} from '../../ui';
import {HBar, ItemP} from './inserts1';

const Big: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = C.green, size = 150}) => (
  <div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: size, color, lineHeight: 1, letterSpacing: -2}}>{children}</div>
);
const Eq: React.FC<{parts: {t: React.ReactNode; d: number; color?: string; size?: number}[]}> = ({parts}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 24}}>
    {parts.map((p, i) => (
      <Pop key={i} delay={p.d} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: p.size ?? 84, color: p.color ?? C.text, lineHeight: 1}}>{p.t}</div></Pop>
    ))}
  </div>
);

/* ---------- G11: calculation (pip) ---------- */
export const MinWage: React.FC<ItemP> = () => {
  const v = useProg(sec(4.3), 40);
  return (
    <Panel gap={26}>
      <Pop from="scale"><IconTrend size={120} color={C.gold} /></Pop>
      <Pop delay={4}><Kicker>Vamos aos dados</Kicker></Pop>
      <Pop delay={sec(3.8)}><Body size={46} color={C.text} weight={800}>Salário mínimo em 2026</Body></Pop>
      <Pop delay={sec(4.3)} from="scale"><Big size={170}>{brl(1621 * v)}</Big></Pop>
      <Pop delay={sec(8.6)} from="scale"><Pill bg={C.gold} size={36}>E se todos recebessem por hora?</Pill></Pop>
    </Panel>
  );
};
export const HourValue: React.FC<ItemP> = () => {
  const v = useProg(sec(0.8), 36);
  return (
    <Panel gap={26}>
      <Pop><Kicker>Matemática básica</Kicker></Pop>
      <Pop delay={4}><Body size={46} color={C.text} weight={800}>O valor da hora, hoje, equivale a</Body></Pop>
      <Pop delay={sec(0.8)} from="scale"><Big size={190} color={C.gold}>{brl(7.37 * v, 2)}</Big></Pop>
      <Pop delay={sec(3.2)}><Body size={38}>R$ 1.621 ÷ 220 horas por mês</Body></Pop>
    </Panel>
  );
};
export const HundredHours: React.FC<ItemP> = () => {
  const v = useProg(sec(5.0), 30);
  return (
    <Panel gap={34}>
      <Pop><Kicker>Exemplo</Kicker></Pop>
      <Eq parts={[{t: '100 h', d: sec(1.2), color: C.blue}, {t: '×', d: sec(2.4), color: C.mute}, {t: 'R$ 7,37', d: sec(3.0), color: C.gold}]} />
      <Pop delay={sec(4.4)} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 90, color: C.mute}}>=</div></Pop>
      <Pop delay={sec(5.0)} from="scale"><Big size={150} color={C.red}>{brl(737 * v)}</Big></Pop>
      <Pop delay={sec(8.0)}><Body size={38}>por mês, com 100 horas trabalhadas</Body></Pop>
    </Panel>
  );
};
export const Hours176: React.FC<ItemP> = () => {
  const v = useProg(sec(1.3), 30);
  return (
    <Panel gap={30}>
      <Pop><Kicker>Hoje, para ganhar o mínimo</Kicker></Pop>
      <Pop delay={sec(1.3)} from="scale"><Big size={170} color={C.blue}>{Math.round(176 * v)} h</Big></Pop>
      <Pop delay={sec(3.0)}><Body size={40}>trabalhadas por mês</Body></Pop>
      <Pop delay={sec(4.8)} from="scale"><Big size={110} color={C.green}>{'= R$ 1.621'}</Big></Pop>
    </Panel>
  );
};
export const Result1: React.FC<ItemP> = () => {
  const v = useProg(sec(8.6), 34);
  return (
    <Panel gap={30}>
      <Pop><Kicker>As mesmas horas, pagas por hora</Kicker></Pop>
      <Eq parts={[{t: '176 h', d: sec(0.4), color: C.blue}, {t: '×', d: sec(1.2), color: C.mute}, {t: 'R$ 7,37', d: sec(1.8), color: C.gold}]} />
      <Pop delay={sec(8.2)} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 90, color: C.mute}}>=</div></Pop>
      <Pop delay={sec(8.6)} from="scale"><Big size={120} color={C.red}>{brl(1297.12 * v, 2)}</Big></Pop>
    </Panel>
  );
};
export const Compare: React.FC<ItemP> = () => (
  <Panel gap={28}>
    <Pop><Kicker>Mesmas 176 horas</Kicker></Pop>
    <HBar label="Hoje · salário mínimo" pct={100} color={C.green} delay={sec(0.3)} value="R$ 1.621" h={92} />
    <HBar label="Por hora · 176 h × R$ 7,37" pct={80} color={C.red} delay={sec(2.2)} value="R$ 1.297,12" h={92} />
    <Pop delay={sec(4.6)} from="scale"><Pill bg={C.red} color="#fff" size={42}>− R$ 323,88 por mês (−20%)</Pill></Pop>
  </Panel>
);
export const ThinkNot: React.FC<ItemP> = () => (
  <Panel gap={22}>
    <Pop from="scale"><IconCross size={150} /></Pop>
    <Pop delay={6} from="scale"><H1 size={84}>Eu acho que <Gold color={C.red}>não.</Gold></H1></Pop>
    <Pop delay={14}><Body size={40}>Mesmas horas, a mesma renda?</Body></Pop>
  </Panel>
);

/* ---------- G12: paid rest calendar ---------- */
export const PaidRest: React.FC<ItemP> = () => {
  const start = 2; // month starts on a Wednesday (Mon-first grid)
  const cells = Array.from({length: 35}, (_, i) => ({d: i - start + 1, col: i % 7}));
  const holidays = [11, 20];
  return (
    <Panel gap={14}>
      <Pop><Kicker>Hoje, com carteira assinada</Kicker></Pop>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 118px)', gap: 8}}>
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
          <div key={i} style={{textAlign: 'center', fontFamily: FONT.head, fontWeight: 800, fontSize: 26, color: C.mute}}>{d}</div>
        ))}
        {cells.map((c, i) => {
          const valid = c.d >= 1 && c.d <= 30;
          const weekend = c.col >= 5;
          const hol = holidays.includes(c.d);
          const d0 = weekend ? sec(1.5) + Math.floor(i / 7) * 5 : hol ? sec(4.4) + (c.d === 20 ? 14 : 0) : 9999;
          const p = useSp(d0, {damping: 14, stiffness: 160});
          const on = valid && (weekend || hol);
          const col = hol ? C.gold : C.green;
          return (
            <div key={i} style={{height: 72, borderRadius: 16, background: valid ? C.card2 : 'transparent', border: valid ? `2px solid ${C.line}` : 'none', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {valid ? <div style={{fontFamily: FONT.head, fontWeight: 800, fontSize: 30, color: on && p > 0.5 ? C.ink : C.text, zIndex: 1}}>{c.d}</div> : null}
              {on ? <div style={{position: 'absolute', inset: 0, background: col, opacity: p, transform: `scale(${0.4 + p * 0.6})`, borderRadius: 14}} /> : null}
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', gap: 16}}>
        <Pop delay={sec(2.0)} from="scale"><Pill bg={C.green} size={28}>fim de semana remunerado</Pill></Pop>
        <Pop delay={sec(4.8)} from="scale"><Pill bg={C.gold} size={28}>feriado remunerado</Pill></Pop>
      </div>
      <Pop delay={sec(7.0)}><Body size={36} color={C.text} weight={800}>Seguridade nos dias em que não se trabalha</Body></Pop>
    </Panel>
  );
};

/* ---------- G14: INSS / FGTS ---------- */
export const InssFgtsA: React.FC<ItemP> = () => {
  const mk = (label: string, delayShrink: number, color: string) => {
    const p = useProg(delayShrink, 30);
    return (
      <div style={{textAlign: 'center', width: 260}}>
        <div style={{height: 230, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
          <div style={{width: 130, height: 230 * (1 - 0.55 * p), borderRadius: '18px 18px 6px 6px', background: color, border: `3px solid ${C.line}`}} />
        </div>
        <Body size={40} color={C.text} weight={900}>{label}</Body>
        <div style={{height: 40, opacity: p}}><IconArrow dir="down" color={C.red} size={44} /></div>
      </div>
    );
  };
  return (
    <Panel gap={18}>
      <Pop><Kicker>O problema vai além do salário</Kicker></Pop>
      <Pop delay={sec(1.6)}><Pill bg={C.red} color="#fff" size={34}>Se você recebe menos…</Pill></Pop>
      <div style={{display: 'flex', gap: 60}}>
        <Pop delay={sec(2.6)} from="scale">{mk('INSS', sec(6.3), C.blue)}</Pop>
        <Pop delay={sec(2.8)} from="scale">{mk('FGTS', sec(9.7), C.green)}</Pop>
      </div>
    </Panel>
  );
};
export const InssRule: React.FC<ItemP> = () => (
  <Panel gap={26}>
    <Pop><Kicker>Regra do INSS</Kicker></Pop>
    <HBar label="Contribuição de um salário mínimo" pct={100} color={C.green} delay={sec(0.8)} value="conta ✓" />
    <HBar label="Contribuição abaixo do mínimo" pct={62} color={C.red} delay={sec(4.4)} value="não conta ✗" />
    <Pop delay={sec(6.0)}><Body size={36} color={C.text} weight={800}>para o tempo de contribuição</Body></Pop>
  </Panel>
);
const wordT = (text: string, after: number) => (words as {w: string; s: number}[]).find((x) => x.s > after && x.w === text)?.s ?? after + 2;
export const HoursTicker: React.FC<ItemP> = () => {
  const f = useCurrentFrame();
  const t0 = 361.9;
  const steps = [
    {t: wordT('12,', 361), v: '12'}, {t: wordT('13,', 361), v: '13'}, {t: wordT('14,', 361), v: '14'}, {t: wordT('16', 361), v: '16'},
  ];
  let cur = '8';
  let idx = -1;
  steps.forEach((s, i) => {
    if (f >= sec(s.t - t0)) { cur = s.v; idx = i; }
  });
  const bump = useSp(idx >= 0 ? sec(steps[idx].t - t0) : 99999, {damping: 8, stiffness: 220});
  return (
    <Panel gap={20}>
      <Pop><Kicker>Para ganhar o mesmo</Kicker></Pop>
      <Pop from="scale"><IconClock size={110} color={C.red} /></Pop>
      <div style={{transform: `scale(${0.85 + bump * 0.15})`}}><Big size={220} color={idx >= 0 ? C.red : C.mute}>{cur}</Big></div>
      <Pop delay={8}><Body size={44} color={C.text} weight={800}>horas de trabalho por dia?</Body></Pop>
    </Panel>
  );
};

/* ---------- G15: end of 6x1 ---------- */
export const End6x1: React.FC<ItemP> = () => (
  <Panel gap={24}>
    <Pop from="scale"><H1 size={86}>Fim da escala <Gold>6×1</Gold></H1></Pop>
    <div style={{display: 'flex', gap: 20, alignItems: 'center'}}>
      <Pop delay={sec(5.0)} from="left"><Row color={C.green}><IconClock size={60} color={C.green} /><Body size={36} color={C.text} weight={800}>Jornada ↓</Body></Row></Pop>
      <Pop delay={sec(6.3)} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 80, color: C.gold}}>+</div></Pop>
      <Pop delay={sec(6.6)} from="right"><Row color={C.gold}><IconCoin size={60} /><Body size={36} color={C.text} weight={800}>Salário =</Body></Row></Pop>
    </div>
    <Pop delay={sec(9.4)} from="scale"><Pill bg={C.green} size={40}>Esse é o ideal</Pill></Pop>
  </Panel>
);

/* ---------- G16: precarization ---------- */
export const FlowChips: React.FC<ItemP> = () => (
  <Panel gap={16}>
    <Pop><Kicker>A proposta do candidato</Kicker></Pop>
    <Pop delay={sec(2.2)} from="left" style={{width: '100%'}}><Row color={C.gold}><IconClock size={64} /><Body size={40} color={C.text} weight={800}>Trabalhador ganha por hora</Body></Row></Pop>
    <Pop delay={sec(6.0)}><IconArrow dir="down" color={C.mute} size={46} /></Pop>
    <Pop delay={sec(8.0)} from="right" style={{width: '100%'}}><Row color={C.blue}><IconDoc size={64} color={C.gold} /><Body size={40} color={C.text} weight={800}>Contrato individual vale mais que a convenção</Body></Row></Pop>
    <Pop delay={sec(12.0)}><IconArrow dir="down" color={C.mute} size={46} /></Pop>
    <Pop delay={sec(13.2)} from="scale"><Pill bg={C.red} color="#fff" size={42}>Direitos precarizados</Pill></Pop>
  </Panel>
);
export const ProfitFlex: React.FC<ItemP> = () => (
  <Panel gap={22}>
    <Pop from="scale"><IconBuilding size={120} /></Pop>
    <Pop delay={4}><H1 size={64}>A empresa só visa <Gold color={C.green}>lucro</Gold></H1></Pop>
    <Pop delay={sec(2.7)} from="left" style={{width: '100%'}}><Row color={C.gold}><IconTrend size={64} color={C.green} /><Body size={38} color={C.text} weight={800}>Quer flexibilidade para explorar ainda mais a mão de obra</Body></Row></Pop>
  </Panel>
);

/* ---------- G17: toggle days ---------- */
export const ToggleDays: React.FC<ItemP> = () => (
  <Panel gap={16}>
    <Pop><Kicker>Pagamento por hora</Kicker></Pop>
    <Pop from="left" style={{width: '100%'}}><Row color={C.green}><IconClock size={60} color={C.green} /><Body size={38} color={C.text} weight={800}>Trabalhou 1 hora → recebe 1 hora</Body><div style={{flex: 1}} /><IconCheck size={54} /></Row></Pop>
    <Pop delay={sec(2.6)} from="right" style={{width: '100%'}}><Row color={C.red}><IconClock size={60} color={C.red} /><Body size={38} color={C.text} weight={800}>Deixou de trabalhar 1 hora → perde essa hora</Body><div style={{flex: 1}} /><IconCross size={54} /></Row></Pop>
    <Pop delay={sec(6.0)} from="left" style={{width: '100%'}}><Row color={C.red}><IconCalendar size={60} color={C.red} /><Body size={38} color={C.text} weight={800}>Fim de semana sem trabalhar → sem ganho</Body><div style={{flex: 1}} /><IconCross size={54} /></Row></Pop>
    <Pop delay={sec(10.3)} from="scale"><Pill bg={C.red} color="#fff" size={34}>Sábado e domingo remunerados vão acabar</Pill></Pop>
  </Panel>
);

/* ---------- G18: cascade ---------- */
export const Cascade: React.FC<ItemP> = () => {
  const f = useCurrentFrame();
  const total = 24;
  const convertStart = sec(7.6);
  const converted = Math.min(18, Math.max(0, Math.floor((f - convertStart) / 5)));
  const order = [23, 21, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1, 22, 20, 18, 16, 14, 12];
  const flipped = new Set(order.slice(0, converted));
  return (
    <Panel gap={18}>
      <Pop delay={sec(3.5)} from="scale"><H1 size={74}>EFEITO <Gold>CASCATA</Gold></H1></Pop>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(8, 96px)', gap: 12}}>
        {Array.from({length: total}).map((_, i) => {
          const hourly = flipped.has(i);
          return (
            <Pop key={i} delay={i * 1.2} from="scale">
              <div style={{width: 96, height: 96, borderRadius: 24, background: hourly ? C.gold : C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'none'}}>
                <IconUser size={58} color={C.ink} />
              </div>
            </Pop>
          );
        })}
      </div>
      <div style={{display: 'flex', gap: 26}}>
        <Pill bg={C.green} size={30}>CLT · {total - converted}</Pill>
        <Pill bg={C.gold} size={30}>Contrato por hora · {converted}</Pill>
      </div>
      <Pop delay={sec(8.0)}><Body size={34}>Cada vez menos cargos CLT.</Body></Pop>
    </Panel>
  );
};

/* ---------- G19: below the minimum ---------- */
export const BelowMin: React.FC<ItemP> = () => {
  const f = useCurrentFrame();
  const a = useProg(sec(7.0), 30);
  const b = useProg(sec(8.4), 30);
  return (
    <Panel gap={22}>
      {f < sec(6.2) ? (
        <>
          <Pop from="scale"><IconCoin size={120} color={C.red} /></Pop>
          <Pop delay={5}><H1 size={64}>Receber <Gold color={C.red}>menos</Gold> pelo mesmo trabalho</H1></Pop>
        </>
      ) : (
        <>
          <Pop><Kicker>O que diz a lei × o que a empresa quer</Kicker></Pop>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 70, height: 330}}>
            <div style={{textAlign: 'center', width: 280}}>
              <div style={{height: 300 * a, background: C.green, borderRadius: '20px 20px 6px 6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 14}}><Body size={34} color={C.ink} weight={900}>Mínimo legal</Body></div>
            </div>
            <div style={{textAlign: 'center', width: 280}}>
              <div style={{height: 220 * b, background: C.red, borderRadius: '20px 20px 6px 6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 14}}><Body size={34} color="#fff" weight={900}>O que ela paga</Body></div>
            </div>
          </div>
        </>
      )}
      {f > sec(13.4) ? <Pop from="scale"><Pill bg={C.gold} size={38}>“Eu posso pagar menos”</Pill></Pop> : null}
    </Panel>
  );
};

/* ---------- G20: falling aggregate income ---------- */
export const FallingChart: React.FC<ItemP> = () => {
  const p = useProg(sec(0.8), 70, (t) => t);
  const pts = [[0, 40], [110, 60], [220, 52], [330, 120], [440, 150], [550, 215], [660, 250]];
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0]} ${q[1]}`).join(' ');
  return (
    <Panel gap={18}>
      <Pop><Kicker>Perda de renda geral</Kicker></Pop>
      <H1 size={58}>Renda agregada <Gold color={C.red}>↓</Gold></H1>
      <svg width={720} height={290} viewBox="0 0 720 290">
        <path d="M30 20V270H700" stroke={C.line} strokeWidth={4} fill="none" strokeLinecap="round" />
        <g transform="translate(30 0)">
          <path d={d + ' L660 270 L0 270 Z'} fill={C.red} opacity={0.12 * p} />
          <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} stroke={C.red} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <div style={{display: 'flex', gap: 18}}>
        <Pop delay={sec(9.8)} from="scale"><Pill bg={C.card2} color={C.text} size={32} style={{border: `3px solid ${C.red}`}}>Poder de compra ↓</Pill></Pop>
        <Pop delay={sec(12.0)} from="scale"><Pill bg={C.card2} color={C.text} size={32} style={{border: `3px solid ${C.red}`}}>PIB ↓</Pill></Pop>
      </div>
    </Panel>
  );
};

/* ---------- G21: real wage ---------- */
export const RealWage: React.FC<ItemP> = () => {
  const p = useProg(sec(5.0), 60, (t) => t);
  const infl = [[0, 200], [150, 178], [300, 156], [450, 134], [600, 112]];
  const wage = [[0, 200], [150, 160], [300, 118], [450, 76], [600, 34]];
  const mk = (a: number[][]) => a.map((q, i) => `${i ? 'L' : 'M'}${q[0]} ${q[1]}`).join(' ');
  const gap = mk(wage) + ' ' + [...infl].reverse().map((q) => `L${q[0]} ${q[1]}`).join(' ') + ' Z';
  return (
    <Panel gap={16}>
      <Pop><Kicker>Reajuste anual</Kicker></Pop>
      <Pop delay={4}><H1 size={58}>Salário reajustado <Gold color={C.green}>acima da inflação</Gold></H1></Pop>
      <svg width={760} height={290} viewBox="0 0 760 290">
        <path d="M30 20V260H730" stroke={C.line} strokeWidth={4} fill="none" strokeLinecap="round" />
        <g transform="translate(60 14)">
          <path d={gap} fill={C.green} opacity={0.18 * p} />
          <path d={mk(infl)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} stroke={C.mute} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d={mk(wage)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} stroke={C.green} strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>
      </svg>
      <div style={{display: 'flex', gap: 18}}>
        <Pop delay={sec(6.0)} from="scale"><Pill bg={C.green} size={28}>Salário</Pill></Pop>
        <Pop delay={sec(6.6)} from="scale"><Pill bg={C.mute} size={28}>Inflação</Pill></Pop>
        <Pop delay={sec(8.0)} from="scale"><Pill bg={C.card2} color={C.green} size={28} style={{border: `3px solid ${C.green}`}}>valorização real</Pill></Pop>
      </div>
      <Pop delay={sec(12.5)}><Body size={34}>Compra coisas que, sem o reajuste, seriam difíceis.</Body></Pop>
    </Panel>
  );
};

/* ---------- G22: governments (author's claim) ---------- */
export const Governments: React.FC<ItemP> = () => (
  <Panel gap={22}>
    <Pop><Pill bg={C.card2} color={C.mute} size={26} style={{border: `2px solid ${C.line}`}}>Afirmação do economista</Pill></Pop>
    <Pop delay={sec(3.6)} from="left" style={{width: '100%'}}><Row color={C.green}><IconCheck size={60} /><div><Body size={32}>Governo Lula · 4 anos</Body><Body size={38} color={C.text} weight={800}>Aumento real do salário todos os anos</Body></div></Row></Pop>
    <Pop delay={sec(6.3)} from="right" style={{width: '100%'}}><Row color={C.red}><IconCross size={60} /><div><Body size={32}>Governo Bolsonaro</Body><Body size={38} color={C.text} weight={800}>Sem aumento real do salário</Body></div></Row></Pop>
  </Panel>
);

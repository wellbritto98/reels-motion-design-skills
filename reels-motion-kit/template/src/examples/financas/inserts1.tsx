import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {
  Body, C, FONT, Gold, H1, IconArrow, IconBuilding, IconCheck, IconChip, IconClock, IconCoin, IconCross, IconDoc, IconFlask, IconLeaf,
  IconPeople, IconUser, Kicker, Panel, Pill, Pop, Row, sec, useProg, useSp,
} from '../../ui';

export type ItemP = {w: number; h: number};

/* ---------- shared bits ---------- */
export const HBar: React.FC<{label: string; pct: number; color: string; delay: number; value?: string; h?: number; dur?: number}> = ({label, pct, color, delay, value, h = 74, dur = 26}) => {
  const p = useProg(delay, dur);
  const o = useProg(delay - 4, 10);
  return (
    <div style={{width: '100%', opacity: o, textAlign: 'left'}}>
      <Body size={34} color={C.text} weight={700}>{label}</Body>
      <div style={{height: h, borderRadius: h / 2, background: '#0a1a38', marginTop: 10, overflow: 'hidden', border: `2px solid ${C.line}`}}>
        <div style={{width: `${pct * p}%`, height: '100%', background: color, borderRadius: h / 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 26, fontFamily: FONT.head, fontWeight: 900, fontSize: 40, color: C.ink, whiteSpace: 'nowrap'}}>
          {p > 0.85 ? value : ''}
        </div>
      </div>
    </div>
  );
};

export const Balance: React.FC<{angle: number; left: React.ReactNode; right: React.ReactNode; width?: number; hideLeft?: boolean; hideRight?: boolean}> = ({angle, left, right, width = 700, hideLeft, hideRight}) => {
  const pan = (content: React.ReactNode, x: number, hide?: boolean) => (
    <div style={{position: 'absolute', left: x - 120, top: 0, width: 240, transform: `rotate(${-angle}deg)`, transformOrigin: '50% 0', opacity: hide ? 0 : 1}}>
      <div style={{width: 4, height: 80, background: C.line, margin: '0 auto'}} />
      <div style={{background: C.card2, border: `3px solid ${C.line}`, borderRadius: 24, padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>{content}</div>
    </div>
  );
  return (
    <div style={{position: 'relative', width, height: 400, marginTop: 52}}>
      <div style={{position: 'absolute', left: width / 2 - 9, top: 30, width: 18, height: 330, background: C.line, borderRadius: 9}} />
      <div style={{position: 'absolute', left: width / 2 - 120, top: 352, width: 240, height: 20, background: C.line, borderRadius: 10}} />
      <div style={{position: 'absolute', left: 0, top: 30, width, height: 0, transform: `rotate(${angle}deg)`, transformOrigin: '50% 0'}}>
        <div style={{position: 'absolute', left: 0, top: -8, width, height: 16, borderRadius: 8, background: C.gold}} />
        {pan(left, 0, hideLeft)}
        {pan(right, width, hideRight)}
      </div>
      <div style={{position: 'absolute', left: width / 2 - 22, top: 8, width: 44, height: 44, borderRadius: 22, background: C.gold, border: `6px solid ${C.ink}`}} />
    </div>
  );
};

const PhotoBox: React.FC<{src: string; h: number; credit: string; focusY?: number}> = ({src, h, credit, focusY = 50}) => {
  const f = useCurrentFrame();
  const sc = 1.04 + f * 0.0006;
  return (
    <div style={{position: 'relative', width: '100%', height: h, borderRadius: 30, overflow: 'hidden', border: `3px solid ${C.line}`}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${focusY}%`, transform: `scale(${sc})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,18,43,0) 55%, rgba(6,18,43,0.75) 100%)'}} />
      <div style={{position: 'absolute', right: 16, bottom: 10, fontFamily: FONT.body, fontSize: 20, color: 'rgba(255,255,255,0.8)'}}>{credit}</div>
    </div>
  );
};

/* ---------- G1: title ---------- */
export const TitleCard: React.FC<ItemP> = () => {
  const f = useCurrentFrame();
  const spin = Math.sin(f / 14) * 8;
  return (
    <Panel gap={22}>
      <div style={{display: 'flex', gap: 36, alignItems: 'center'}}>
        <Pop from="scale"><div style={{transform: `rotate(${spin}deg)`}}><IconClock size={140} /></div></Pop>
        <Pop from="scale" delay={5}><div style={{transform: `rotate(${-spin}deg)`}}><IconCoin size={140} color={C.green} /></div></Pop>
      </div>
      <Pop delay={9}><Kicker>Análise econômica</Kicker></Pop>
      <Pop delay={13}><H1 size={80}>Salário e jornada <Gold>por hora</Gold></H1></Pop>
      <Pop delay={22}><Body size={42}>Quem decide quanto você trabalha e quanto você ganha?</Body></Pop>
    </Panel>
  );
};

/* ---------- G2: claims ---------- */
export const ClaimsList: React.FC<ItemP & {struck?: boolean}> = ({struck}) => {
  const rows = [
    {icon: <IconClock size={74} color={C.gold} />, text: 'Trabalhe as horas que quiser', d: 0},
    {icon: <IconPeople size={74} color={C.blue} />, text: 'Negocie seu salário com o patrão', d: struck ? 3 : sec(4.2)},
  ];
  const cross = useSp(struck ? 10 : 999);
  const stamp = useSp(struck ? 22 : 999, {damping: 9, stiffness: 160});
  return (
    <Panel gap={22}>
      <Pop><Kicker color={struck ? C.red : C.gold}>{struck ? 'Na prática' : 'A promessa'}</Kicker></Pop>
      {rows.map((r, i) => (
        <Pop key={i} delay={r.d} from="left" style={{width: '100%'}}>
          <Row color={struck ? C.red : C.green}>
            {r.icon}
            <div style={{flex: 1, position: 'relative'}}>
              <Body size={42} color={C.text} weight={800}>{r.text}</Body>
              {struck ? <div style={{position: 'absolute', left: 0, top: '52%', height: 6, width: `${cross * 100}%`, background: C.red, borderRadius: 3}} /> : null}
            </div>
            {struck ? <div style={{opacity: cross}}><IconCross size={64} /></div> : <Pop delay={r.d + 12} from="scale"><IconCheck size={64} /></Pop>}
          </Row>
        </Pop>
      ))}
      {struck ? (
        <div style={{transform: `scale(${0.5 + stamp * 0.5}) rotate(-3deg)`, opacity: Math.min(1, stamp * 2)}}>
          <Pill bg={C.red} color="#fff" size={46}>As coisas não são bem assim</Pill>
        </div>
      ) : null}
    </Panel>
  );
};

/* ---------- G3: questions + needs vs offers ---------- */
export const QuestionsPage: React.FC<ItemP> = () => (
  <Panel gap={26}>
    <Pop from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 150, color: C.gold, lineHeight: 0.9}}>?</div></Pop>
    <Pop delay={4} from="left" style={{width: '100%'}}>
      <Row color={C.gold}><IconClock size={70} /><Body size={44} color={C.text} weight={800}>Quem decide quantas horas você vai trabalhar?</Body></Row>
    </Pop>
    <Pop delay={sec(3.0)} from="right" style={{width: '100%'}}>
      <Row color={C.green}><IconCoin size={70} color={C.green} /><Body size={44} color={C.text} weight={800}>Quem decide quanto você ganha no fim do mês?</Body></Row>
    </Pop>
  </Panel>
);
export const NeedVsOffer: React.FC<ItemP> = () => {
  const pulse = useSp(sec(7.2), {damping: 10, stiffness: 140});
  return (
    <Panel gap={30}>
      <Pop><Kicker>Uma diferença clara</Kicker></Pop>
      <HBar label="Jornada que você PRECISA trabalhar" pct={100} color={C.green} delay={sec(0.3)} />
      <HBar label="Jornada que o patrão OFERECE" pct={66} color={C.red} delay={sec(5.8)} />
      <div style={{transform: `scale(${0.6 + pulse * 0.4})`, opacity: pulse}}><Pill bg={C.gold} size={38}>↔ essa diferença é o problema</Pill></div>
    </Panel>
  );
};

/* ---------- G4: PEC ---------- */
export const PecPage: React.FC<ItemP> = () => (
  <Panel gap={18} style={{justifyContent: 'flex-start', paddingTop: 36}}>
    <Pop style={{width: '100%'}}><PhotoBox src="img/congresso.jpg" h={340} credit="Foto: Senado Federal · CC BY 2.0" focusY={55} /></Pop>
    <Pop delay={6}><div style={{display: 'flex', alignItems: 'center', gap: 20}}><IconDoc size={74} /><H1 size={84}>PEC</H1></div></Pop>
    <Pop delay={sec(1.7)} from="left" style={{width: '100%'}}><Row color={C.blue}><Body size={34}>Criada por</Body><Body size={44} color={C.text} weight={800}>Rogério Marinho</Body></Row></Pop>
    <Pop delay={sec(5.3)} from="right" style={{width: '100%'}}><Row color={C.gold}><Body size={34}>Assinada por</Body><Body size={44} color={C.text} weight={800}>Flávio Bolsonaro</Body></Row></Pop>
  </Panel>
);
export const RightsPage: React.FC<ItemP> = () => {
  const items = ['13º salário', 'Férias', 'FGTS'];
  return (
    <Panel gap={22}>
      <Pop><Kicker>Direitos de quem é CLT</Kicker></Pop>
      {items.map((t, i) => (
        <Pop key={t} delay={sec(0.8) + i * 8} from="left" style={{width: '100%'}}>
          <Row color={C.line}>
            <IconCoin size={64} color={C.green} label="R$" />
            <Body size={46} color={C.text} weight={800}>{t}</Body>
            <div style={{flex: 1}} />
            <Pop delay={sec(5.0) + i * 9} from="right"><Pill bg={C.gold} size={32}>pago proporcional</Pill></Pop>
          </Row>
        </Pop>
      ))}
      <Pop delay={sec(5.0)}><Body size={36}>O trabalhador recebe só uma parte, calculada pelas horas.</Body></Pop>
    </Panel>
  );
};

/* ---------- G5: two modalities + collective ---------- */
export const TwoModalities: React.FC<ItemP> = () => (
  <Panel gap={22}>
    <Pop from="scale"><Pill bg={C.card2} color={C.text} size={36} style={{border: `3px solid ${C.gold}`}}>Duas modalidades de trabalho</Pill></Pop>
    <div style={{display: 'flex', gap: 22, width: '100%'}}>
      <Pop delay={sec(3.6)} from="left" style={{flex: 1}}>
        <div style={{background: C.card2, border: `4px solid ${C.green}`, borderRadius: 30, padding: 26, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
          <IconPeople size={110} />
          <Body size={40} color={C.text} weight={900}>CLT convencional</Body>
          <Pill bg={C.green} size={30}>mantida</Pill>
          <Body size={30}>Salário fixo e direitos garantidos</Body>
        </div>
      </Pop>
      <Pop delay={sec(6.8)} from="right" style={{flex: 1}}>
        <div style={{background: C.card2, border: `4px solid ${C.gold}`, borderRadius: 30, padding: 26, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
          <IconClock size={110} />
          <Body size={40} color={C.text} weight={900}>Nova modalidade</Body>
          <Pill bg={C.gold} size={30}>criada pela PEC</Pill>
          <Body size={30}>Paga só as horas efetivamente trabalhadas</Body>
        </div>
      </Pop>
    </div>
  </Panel>
);
export const CollectivePage: React.FC<ItemP> = () => (
  <Panel gap={18} style={{justifyContent: 'flex-start', paddingTop: 36}}>
    <Pop style={{width: '100%'}}><PhotoBox src="img/assembleia.jpg" h={330} credit="Foto: Amazônia Real · CC BY 2.0" focusY={40} /></Pop>
    <Pop delay={6}><H1 size={64}>Convenções coletivas</H1></Pop>
    <div style={{display: 'flex', gap: 16}}>
      <Pop delay={sec(3.6)} from="scale"><Pill bg={C.blue} size={34}>Sindicatos</Pill></Pop>
      <Pop delay={sec(4.6)} from="scale"><Pill bg={C.green} size={34}>Assembleias</Pill></Pop>
      <Pop delay={sec(5.6)} from="scale"><Pill bg={C.gold} size={34}>Categoria</Pill></Pop>
    </div>
    <Pop delay={sec(8.2)}><Body size={36}>Decidem o que é importante para aquela profissão naquele momento.</Body></Pop>
  </Panel>
);

/* ---------- G6: contract vs convention ---------- */
export const ContractVsConv: React.FC<ItemP> = () => {
  const f = useCurrentFrame();
  const intro = f < sec(7.4);
  const tilt = useProg(sec(14.4), 26, (t) => 1 - Math.pow(1 - t, 3));
  const angle = -11 * tilt;
  if (intro) {
    return (
      <Panel gap={24}>
        <Pop from="scale"><IconClock size={120} /></Pop>
        <Pop delay={5}><H1 size={64}>Nova modalidade: <Gold>horas flexíveis</Gold></H1></Pop>
        <Pop delay={sec(2.4)}><Body size={40}>Paga o trabalhador por hora, em contrato direto com o patrão.</Body></Pop>
      </Panel>
    );
  }
  return (
    <Panel gap={14}>
      <Pop><Kicker>O que a PEC prevê</Kicker></Pop>
      <Balance
        angle={angle}
        hideLeft={f < sec(7.8)}
        hideRight={f < sec(11)}
        left={<><IconDoc size={70} color={C.gold} /><Body size={30} color={C.text} weight={800}>Contrato individual</Body></>}
        right={<><IconPeople size={70} color={C.blue} /><Body size={30} color={C.text} weight={800}>Convenção coletiva</Body></>}
      />
      <div style={{opacity: tilt, transform: `translateY(${(1 - tilt) * 20}px)`}}><Pill bg={C.gold} size={38}>passa a ter mais poder</Pill></div>
    </Panel>
  );
};
export const ConventionOut: React.FC<ItemP> = () => (
  <Panel gap={22}>
    <Pop from="left" style={{width: '100%'}}><Row color={C.line}><IconUser size={70} /><Body size={40} color={C.text} weight={800}>Trabalhador aceita as horas flexíveis</Body></Row></Pop>
    <Pop delay={sec(4.8)} from="right" style={{width: '100%'}}><Row color={C.green}><IconDoc size={70} color={C.gold} /><Body size={40} color={C.text} weight={800}>Contrato individual é o que vale</Body><div style={{flex: 1}} /><IconCheck size={60} /></Row></Pop>
    <Pop delay={sec(7.6)} from="left" style={{width: '100%'}}><Row color={C.red}><IconPeople size={70} color={C.blue} /><Body size={40} color={C.text} weight={800}>Convenção coletiva não interfere</Body><div style={{flex: 1}} /><IconCross size={60} /></Row></Pop>
  </Panel>
);

/* ---------- G7: bargaining power seesaw ---------- */
export const BargainPower: React.FC<ItemP> = () => {
  const f = useCurrentFrame();
  const tilt = useProg(sec(8.2), 30, (t) => 1 - Math.pow(1 - t, 3));
  const angle = -10 * tilt;
  const titleIn = f >= sec(3.0);
  return (
    <Panel gap={8}>
      <div style={{height: 90, display: 'flex', alignItems: 'center'}}>
        {f < sec(3.0) ? <Pop><Body size={40}>Na relação entre patrão e empregado…</Body></Pop> : null}
        {titleIn ? <Pop from="scale"><H1 size={72}>PODER DE <Gold>BARGANHA</Gold></H1></Pop> : null}
      </div>
      <Balance
        angle={angle}
        hideLeft={f < sec(5.3)}
        hideRight={f < sec(5.8)}
        left={<><IconBuilding size={80} /><Body size={32} color={C.text} weight={800}>Patrão</Body></>}
        right={<><IconUser size={80} /><Body size={32} color={C.text} weight={800}>Empregado</Body></>}
      />
      <div style={{display: 'flex', gap: 14, minHeight: 60}}>
        {f > sec(14.5) ? <Pop from="scale"><Pill bg={C.gold} size={28}>capital</Pill></Pop> : null}
        {f > sec(16.0) ? <Pop from="scale"><Pill bg={C.gold} size={28}>meios de produção</Pill></Pop> : null}
        {f > sec(22.6) ? <Pop from="scale"><Pill bg={C.red} color="#fff" size={28}>problema estrutural</Pill></Pop> : null}
      </div>
    </Panel>
  );
};

/* ---------- G8: employee wants vs company offers + profit ---------- */
export const EmployeeWants: React.FC<ItemP> = () => (
  <Panel gap={22}>
    <div style={{display: 'flex', alignItems: 'center', gap: 20, width: '100%'}}>
      <Pop from="left" style={{flex: 1}}>
        <div style={{background: C.card2, border: `4px solid ${C.blue}`, borderRadius: 28, padding: 24, textAlign: 'center'}}>
          <IconUser size={100} /><Body size={36} color={C.text} weight={900}>Você quer</Body><Body size={32}>uma pretensão de horas</Body>
        </div>
      </Pop>
      <Pop delay={sec(2.2)} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 70, color: C.gold}}>≠</div></Pop>
      <Pop delay={sec(3.0)} from="right" style={{flex: 1}}>
        <div style={{background: C.card2, border: `4px solid ${C.gold}`, borderRadius: 28, padding: 24, textAlign: 'center'}}>
          <IconBuilding size={100} /><Body size={36} color={C.text} weight={900}>A empresa oferece</Body><Body size={32}>a quantidade que ela decide</Body>
        </div>
      </Pop>
    </div>
  </Panel>
);
export const ProfitUp: React.FC<ItemP> = () => {
  const bars = [0.3, 0.45, 0.6, 0.8, 1];
  return (
    <Panel gap={18}>
      <Pop><Kicker>O pensamento da empresa</Kicker></Pop>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 22, height: 300}}>
        {bars.map((b, i) => {
          const p = useProg(6 + i * 7, 22);
          return <div key={i} style={{width: 100, height: 300 * b * p, borderRadius: '20px 20px 6px 6px', background: i === 4 ? C.green : C.card2, border: `3px solid ${i === 4 ? C.green : C.line}`}} />;
        })}
      </div>
      <Pop delay={sec(1.0)} from="scale"><H1 size={66}>Maximização de <Gold color={C.green}>lucros</Gold></H1></Pop>
      <Pop delay={sec(3.6)}><Body size={38}>Não existe outra coisa.</Body></Pop>
    </Panel>
  );
};

/* ---------- G8b: incentives ---------- */
export const IncentivesA: React.FC<ItemP> = () => (
  <Panel gap={28}>
    <Pop><Kicker>Quando a empresa investe…</Kicker></Pop>
    <Pop delay={4}><H1 size={64}>O governo oferece <Gold>incentivos</Gold></H1></Pop>
    <div style={{display: 'flex', gap: 24}}>
      {[
        {i: <IconLeaf size={110} />, t: 'Meio ambiente', d: sec(5.5)},
        {i: <IconFlask size={110} />, t: 'Ciência', d: sec(7.0)},
        {i: <IconChip size={110} />, t: 'Inovação', d: sec(8.4)},
      ].map((x) => (
        <Pop key={x.t} delay={x.d} from="scale">
          <div style={{background: C.card2, border: `3px solid ${C.line}`, borderRadius: 26, padding: '22px 20px', width: 290, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            {x.i}<Body size={34} color={C.text} weight={800}>{x.t}</Body>
          </div>
        </Pop>
      ))}
    </div>
  </Panel>
);
export const IncentivesB: React.FC<ItemP> = () => {
  const p = useProg(sec(4.0), 50, (t) => t * t * (3 - 2 * t));
  return (
    <Panel gap={22}>
      <Pop><Kicker>Por que ela investe?</Kicker></Pop>
      <div style={{position: 'relative', width: '100%', height: 220}}>
        <div style={{position: 'absolute', left: 30, top: 20, textAlign: 'center'}}><IconBuilding size={120} /><Body size={30} color={C.text} weight={800}>Empresa</Body></div>
        <div style={{position: 'absolute', right: 30, top: 20, textAlign: 'center', opacity: 0.45}}><IconDoc size={120} color={C.red} /><Body size={30} color={C.text} weight={800}>Imposto</Body></div>
        <div style={{position: 'absolute', left: 190 + p * 560, top: 60 + Math.sin(p * Math.PI) * -30}}><IconCoin size={80} /></div>
      </div>
      <Pop delay={sec(2.0)} from="left" style={{width: '100%'}}><Row color={C.green}><IconCheck size={56} /><Body size={38} color={C.text} weight={800}>Investe e recebe desconto no imposto</Body></Row></Pop>
      <Pop delay={sec(8.0)} from="right" style={{width: '100%'}}><Row color={C.gold}><IconCoin size={56} /><Body size={38} color={C.text} weight={800}>É dinheiro que ela não queria dar ao governo</Body></Row></Pop>
    </Panel>
  );
};

/* ---------- G9: asymmetry ---------- */
export const Asymmetry: React.FC<ItemP> = () => {
  const tilt = useProg(sec(5.4), 28);
  return (
    <Panel gap={22}>
      <Pop from="scale"><H1 size={78}>ASSIMETRIA</H1></Pop>
      <Pop delay={6}><Body size={44} color={C.text} weight={800}>de poder de barganha</Body></Pop>
      <div style={{display: 'flex', alignItems: 'center', gap: 34, marginTop: 10}}>
        <div style={{transform: `translateY(${-tilt * 30}px) scale(${1 + tilt * 0.25})`}}><IconBuilding size={130} /></div>
        <div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 90, color: C.gold}}>{'>'}</div>
        <div style={{transform: `translateY(${tilt * 30}px) scale(${1 - tilt * 0.2})`, opacity: 1 - tilt * 0.3}}><IconUser size={130} /></div>
      </div>
      <Pop delay={sec(6.4)}><Body size={38}>O patrão sempre vai ter mais poder do que o empregado.</Body></Pop>
    </Panel>
  );
};

/* ---------- G10: worked example ---------- */
export const NeedMoney: React.FC<ItemP> = () => {
  const v = useProg(sec(1.0), 36);
  return (
    <Panel gap={18}>
      <Pop><Kicker>Imagine que você, trabalhador…</Kicker></Pop>
      <Pop delay={4}><Body size={42} color={C.text} weight={800}>precisa de</Body></Pop>
      <Pop delay={10} from="scale"><div style={{fontFamily: FONT.head, fontWeight: 900, fontSize: 170, color: C.green, lineHeight: 1}}>{'R$ ' + Math.round(2000 * v).toLocaleString('pt-BR')}</div></Pop>
      <Pop delay={sec(5.5)}><Body size={42}>para sobreviver bem, todo mês.</Body></Pop>
    </Panel>
  );
};
export const FlexJobs: React.FC<ItemP> = () => {
  const dots = Array.from({length: 10});
  return (
    <Panel gap={22}>
      <Pop><Kicker>Na empresa em que você está</Kicker></Pop>
      <div style={{display: 'flex', gap: 18}}>
        {dots.map((_, i) => {
          const clt = i < 2;
          return (
            <Pop key={i} delay={4 + i * 3} from="scale">
              <div style={{width: 76, height: 76, borderRadius: 38, background: clt ? C.green : C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <IconUser size={46} color={C.ink} />
              </div>
            </Pop>
          );
        })}
      </div>
      <Pop delay={sec(1.5)} from="left" style={{width: '100%'}}><Row color={C.green}><div style={{width: 30, height: 30, borderRadius: 15, background: C.green}} /><Body size={38} color={C.text} weight={800}>Poucos cargos em CLT</Body></Row></Pop>
      <Pop delay={sec(2.6)} from="right" style={{width: '100%'}}><Row color={C.gold}><div style={{width: 30, height: 30, borderRadius: 15, background: C.gold}} /><Body size={38} color={C.text} weight={800}>Todo o resto, flexível</Body></Row></Pop>
    </Panel>
  );
};
export const HoursGap: React.FC<ItemP> = () => (
  <Panel gap={22}>
    <Pop><Kicker>Na hora de calcular</Kicker></Pop>
    <HBar label="Horas de que você precisa" pct={100} color={C.green} delay={sec(0.4)} value="40 h" />
    <HBar label="Horas que a empresa oferece" pct={75} color={C.red} delay={sec(3.0)} value="30 h" />
    <Pop delay={sec(4.6)} from="scale"><Pill bg={C.red} color="#fff" size={40}>10 h a menos = renda menor</Pill></Pop>
  </Panel>
);

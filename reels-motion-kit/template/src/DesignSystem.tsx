import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BRAND, C, CAPTION, FONT, GRADIENT, SHAPE} from './brand.generated';
import {Body, H1, IconCheck, IconClock, IconCoin, IconCross, Kicker, Pill, Row} from './ui';

/** Prancha do design system: mostre isto ao usuário (npm run ds:preview) e só siga para o vídeo depois do OK dele. */
export const DesignSystem: React.FC = () => {
  const swatches: [string, string][] = [['ink', C.ink], ['navy', C.navy], ['card', C.card], ['card2', C.card2], ['line', C.line], ['text', C.text], ['mute', C.mute], ['destaque', C.gold], ['positivo', C.green], ['negativo', C.red], ['info', C.blue], ['extra', C.violet]];
  return (
    <AbsoluteFill style={{background: C.ink, padding: 60, gap: 28, display: 'flex', flexDirection: 'column', fontFamily: FONT.body}}>
      <div style={{height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${GRADIENT[0]}, ${GRADIENT[1]})`}} />
      <Kicker>Design system · {BRAND.name ?? ''} {BRAND.handle ?? ''}</Kicker>
      <H1 size={92}>Título em <span style={{color: C.gold}}>destaque</span></H1>
      <Body size={44}>Texto de apoio em fonte de corpo, legível em 1–2 segundos.</Body>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16}}>
        {swatches.map(([n, c]) => (
          <div key={n} style={{background: c, borderRadius: 24, height: 130, border: `2px solid ${C.line}`, padding: 14, display: 'flex', alignItems: 'flex-end'}}>
            <span style={{fontFamily: FONT.head, fontWeight: 800, fontSize: 24, color: n === 'text' || n === 'mute' || n === 'destaque' || n === 'positivo' || n === 'info' ? C.ink : C.text}}>{n}</span>
          </div>
        ))}
      </div>
      <div style={{background: `linear-gradient(160deg, ${C.card}, ${C.navy})`, border: `${SHAPE.borderWidth}px solid ${C.line}`, borderRadius: SHAPE.cardRadius, padding: 36, display: 'flex', flexDirection: 'column', gap: 18}}>
        <Row color={C.green}><IconClock size={60} /><Body size={38} color={C.text} weight={800}>Linha com ícone e verificação</Body><div style={{flex: 1}} /><IconCheck size={54} /></Row>
        <Row color={C.red}><IconCoin size={60} color={C.red} /><Body size={38} color={C.text} weight={800}>Linha em tom negativo</Body><div style={{flex: 1}} /><IconCross size={54} /></Row>
        <div style={{display: 'flex', gap: 14}}><Pill bg={C.gold}>Destaque</Pill><Pill bg={C.green}>Positivo</Pill><Pill bg={C.red} color="#fff">Negativo</Pill><Pill bg={C.blue}>Info</Pill></div>
      </div>
      <div style={{background: C.card, borderRadius: 36, padding: 30, textAlign: 'center'}}>
        <span style={{fontFamily: FONT.head, fontWeight: 800, fontSize: CAPTION.sizeSplit * 1.3, color: C.text, textTransform: CAPTION.uppercase ? 'uppercase' : 'none'}}>
          legenda com <span style={{color: CAPTION.highlight}}>palavra ativa</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

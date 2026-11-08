import React from 'react';
import {OffthreadVideo, staticFile} from 'remotion';
import {SPEAKER_RING, SHAPE} from './brand.generated';
import {SRC_H, SRC_W} from './layout';
import type {LRect} from './layout';

/** Janela do apresentador. O mesmo <OffthreadVideo> fica montado o vídeo todo; só o retângulo muda (animado em layout.ts). */
export const Speaker: React.FC<{rect: LRect}> = ({rect}) => {
  const split = Math.min(1, rect.r / Math.max(1, SHAPE.windowRadius * 0.8));
  return (
    <div
      style={{
        position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h,
        borderRadius: rect.r, overflow: 'hidden', background: '#000',
        boxShadow: split > 0.02 ? `0 0 0 ${4 * split}px ${SPEAKER_RING}, 0 24px 60px rgba(0,0,0,${0.5 * split})` : 'none',
      }}
    >
      <OffthreadVideo
        src={staticFile('source.mp4')}
        style={{position: 'absolute', left: 0, top: -rect.cropY * rect.s, width: SRC_W * rect.s, height: SRC_H * rect.s}}
      />
    </div>
  );
};

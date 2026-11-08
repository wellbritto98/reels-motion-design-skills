import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {DesignSystem} from './DesignSystem';
import {FPS, TOTAL_FRAMES} from './content/timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="DesignSystem" component={DesignSystem} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  </>
);

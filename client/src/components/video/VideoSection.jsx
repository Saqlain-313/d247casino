import React from 'react';
import { useCasino } from '../../context/CasinoContext';
import VirtualVideoPlayer from './VirtualVideoPlayer';
import LiveVideoPlayer from './LiveVideoPlayer';

export default function VideoSection() {
  const { isVirtual } = useCasino();
  return isVirtual ? <VirtualVideoPlayer /> : <LiveVideoPlayer />;
}


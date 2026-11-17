import React from 'react';

import gameIcon from '../assets/game-icon.svg';
import icVir from '../assets/ic_vir.webp';

// Reference-site game-category icons, shown in the listing's right icon row
// (after inplay dot / TV / fancy / BM): iscc 1 -> virtual (ic_vir), 2 ->
// virtual game (gamepad), 4 -> e-games (grey circle "e").
// Real sport events (iscc 0) render nothing.
function IsccIcon({ iscc }) {
  if (iscc === 1) {
    return <img src={icVir} alt='virtual' className='h-[14px] w-[14px]' />;
  }
  if (iscc === 2) {
    return (
      <img src={gameIcon} alt='virtual game' className='h-[14px] w-[14px]' />
    );
  }
  if (iscc === 3) {
    return (
      <span className='flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#c9c9c9] text-[10px] font-bold text-[#333333]'>
        S
      </span>
    );
  }
  if (iscc === 4) {
    return (
      <span className='flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#c9c9c9] text-[11px] font-bold text-[#333333]'>
        e
      </span>
    );
  }
  return null;
}

export default IsccIcon;

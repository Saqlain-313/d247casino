import React from 'react';
import { useCasino } from '../../context/CasinoContext';

export default function OddsBox({
  nation,
  odds,
  volume,
  type = 'back',
  isHeader = false,
  label,
  className = '',
}) {
  const { openBetSlip, betSlip, isSuspended } = useCasino();

  if (isHeader) {
    return (
      <div className={`casino-odds-box ${type} ${className}`}>
        {label || (type === 'lay' ? 'Lay' : 'Back')}
      </div>
    );
  }

  const isSelected =
    betSlip.isOpen && betSlip.nation === nation && betSlip.type === type;

  const handleClick = (e) => {
    e.preventDefault();
    const isMobile = window.innerWidth < 1200;
    openBetSlip(nation, odds, type, isMobile);
  };

  const dead = isSuspended || !(Number(odds) > 1);

  return (
    <div
      className={`casino-odds-box ${type} ${dead ? 'suspended-box' : ''} ${
        isSelected ? 'odds-selected' : ''
      } ${className}`}
      onClick={dead ? undefined : handleClick}
      style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
    >
      <span className='casino-odds'>{dead ? '0' : odds}</span>
      {volume && !dead && <span className='casino-volume'>{volume}</span>}
    </div>
  );
}

import React from 'react';
import { useCasino } from '../../context/CasinoContext';

export default function CasinoHeader() {
  const { gameInfo, roundData, setRulesModalOpen } = useCasino();
  const range = gameInfo?.range || '100 to 50k';

  return (
    <div className="casino-header">
      <span className="casino-name">
        {gameInfo.name}
        <a
          className="ms-1"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.preventDefault();
            setRulesModalOpen(true);
          }}
        >
          <small>Rules</small>
        </a>
      </span>
      <span className="casino-rid d-none d-xl-inline-block">
        <small>
          Round ID: <span>{roundData.roundId}</span>
        </small>
        <small className="ms-2">
          <span>Range: {range}</span>
        </small>
      </span>
      <span className="casino-rid d-xl-none">
        <small className="ms-2">
          <span>Range: {range}</span>
        </small>
      </span>
    </div>
  );
}


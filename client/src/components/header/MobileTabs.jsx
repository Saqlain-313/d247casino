import React from 'react';
import { useCasino } from '../../context/CasinoContext';

export default function MobileTabs() {
  const { roundData, activeTab, setActiveTab, placedBets } = useCasino();

  return (
    <div className="casino-title-header-mobile d-xl-none">
      <ul className="nav nav-tabs menu-tabs">
        <li className="nav-item">
          <div
            className={`nav-link ${activeTab === 'game' ? 'active' : ''}`}
            onClick={() => setActiveTab('game')}
            style={{ cursor: 'pointer' }}
          >
            Game
          </div>
        </li>
        <li className="nav-item">
          <div
            className={`nav-link ${activeTab === 'placedBets' ? 'active' : ''}`}
            onClick={() => setActiveTab('placedBets')}
            style={{ cursor: 'pointer' }}
          >
            Placed Bet ({placedBets.length})
          </div>
        </li>
      </ul>
      <div className="pe-2">
        <span className="casino-rid">
          Round ID: <span>{roundData.roundId}</span>
        </span>
      </div>
    </div>
  );
}


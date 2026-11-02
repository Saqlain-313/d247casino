import React, { useState } from 'react';
import { useCasino } from '../../context/CasinoContext';

export default function MatkaTabs() {
  const { selectedGame, countdown } = useCasino();
  const [activeBazaar, setActiveBazaar] = useState('bazaar-1');

  // Format countdown into MM:SS
  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');
  const timeFormatted = `${mins}:${secs}`;

  const bazaars =
    selectedGame === 'worli2'
      ? [
          { id: 'bazaar-1', name: 'Instant Worli Fast', closeTime: '00:45', countdown: timeFormatted },
        ]
      : [
          { id: 'bazaar-1', name: 'Kalyan Morning', closeTime: '10:45 AM', countdown: timeFormatted },
          { id: 'bazaar-2', name: 'Time Syndicate', closeTime: '01:30 PM', countdown: '12:45' },
          { id: 'bazaar-3', name: 'Milan Day', closeTime: '03:15 PM', countdown: '25:10' },
        ];

  return (
    <div className="matka-tabs">
      <ul className="nav nav-pills">
        {bazaars.map((b) => {
          const isActive = activeBazaar === b.id;
          return (
            <li className="nav-item" key={b.id}>
              <a
                className={`nav-link ${isActive ? 'active' : ''}`}
                href="javascript:void(0)"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveBazaar(b.id);
                }}
              >
                <span>{b.name}</span>
                <div className="remaining-time">
                  <img
                    src="/assets/img/clock.png"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://cdn.926assets.com/g3ver/v107/static/front/img/clock.png';
                    }}
                    alt="clock"
                  />
                  <span>{isActive ? b.countdown : b.closeTime}</span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


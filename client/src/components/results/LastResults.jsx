import React from 'react';
import { useCasino } from '../../context/CasinoContext';

export default function LastResults() {
  const { roundData, selectedGame } = useCasino();
  const { results = [] } = roundData;

  const getBadgeClass = (res) => {
    const str = String(res).toUpperCase();
    if (str.includes('B') || str.includes('T') || str.includes('H') || str.includes('2') || str.includes('AKBAR')) {
      return 'result result-b';
    }
    if (str.includes('TIE') || str.includes('7')) {
      return 'result';
    }
    return 'result result-a';
  };

  return (
    <>
      <div className="casino-last-result-title">
        <span>Last Result</span>
        <span>
          <a href={`/casino-results/${selectedGame}`} onClick={(e) => e.preventDefault()}>
            View All
          </a>
        </span>
      </div>
      <div className="casino-last-results">
        {results.map((r, i) => (
          <span key={i} className={getBadgeClass(r)}>
            {r}
          </span>
        ))}
      </div>
    </>
  );
}


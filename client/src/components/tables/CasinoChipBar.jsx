import React from 'react';
import { useCasino } from '../../context/CasinoContext';

const CHIPS = [
  { val: 25, label: '25', color: '#138cf5' },
  { val: 50, label: '50', color: '#138cf5' },
  { val: 100, label: '100', color: '#138cf5' },
  { val: 200, label: '200', color: '#00d700' },
  { val: 500, label: '500', color: '#00d700' },
  { val: 1000, label: '1K', color: '#9541f9' },
];

export default function CasinoChipBar() {
  const {
    selectedChip,
    setSelectedChip,
    rouletteBets,
    undoRouletteBet,
    repeatRouletteBet,
    clearRouletteBets,
    isSuspended,
  } = useCasino();

  const hasBets = Object.keys(rouletteBets).length > 0;

  return (
    <div className="casino-coins-container">
      <div className="casino-coin-box">
        {CHIPS.map((c) => {
          const isActive = selectedChip === c.val;
          return (
            <div
              key={c.val}
              className={`casino-coin ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedChip(c.val)}
              style={{ cursor: 'pointer' }}
              title={`Select chip ${c.label}`}
            >
              <div
                className="bet-chip-holder"
                style={{ '--g-chip-inner-color': c.color }}
              >
                <div className="bet-chip">
                  <div className="bet-chip-front"></div>
                  <div className="bet-chip-top"></div>
                  <div className="bet-chip-amount">
                    <svg
                      className="bet-chip-amount-in"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 108 108"
                    >
                      <text
                        className="bet-chip-amount-label"
                        x="50%"
                        y="53.5%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="32"
                        fontWeight="700"
                      >
                        {c.label}
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="coin-btns">
        <div>
          <button
            type="button"
            className="btn btn-danger"
            disabled={!hasBets || isSuspended}
            onClick={undoRouletteBet}
          >
            <i className="fas fa-undo"></i>
            <span className="d-none d-md-flex">Undo Bet</span>
          </button>
          <span className="d-md-none">Undo Bet</span>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-info"
            disabled={isSuspended}
            onClick={repeatRouletteBet}
          >
            <i className="fas fa-redo"></i>
            <span className="d-none d-md-flex">Repeat</span>
          </button>
          <span className="d-md-none">Repeat</span>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-warning"
            disabled={!hasBets || isSuspended}
            onClick={clearRouletteBets}
          >
            <i className="fas fa-trash"></i>
            <span className="d-none d-md-flex">Clear</span>
          </button>
          <span className="d-md-none">Clear</span>
        </div>
      </div>
    </div>
  );
}


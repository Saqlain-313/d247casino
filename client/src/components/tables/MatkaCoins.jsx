import React from 'react';
import { useCasino } from '../../context/CasinoContext';

const MATKA_CHIPS = [
  { val: 100, label: '100', color: '#138cf5' },
  { val: 500, label: '500', color: '#00d700' },
  { val: 1000, label: '1K', color: '#9541f9' },
  { val: 5000, label: '5K', color: '#e53935' },
  { val: 10000, label: '10K', color: '#ff9800' },
  { val: 25000, label: '25K', color: '#00bcd4' },
];

export default function MatkaCoins() {
  const { selectedChip, setSelectedChip } = useCasino();

  return (
    <div className="matka-coins">
      <div className="matka-coin-title">
        <span>SELECT COIN:</span>
        <button
          type="button"
          className="btn btn-sm btn-outline-light ms-2"
          onClick={() => setSelectedChip(100)}
        >
          Reset
        </button>
      </div>

      <div className="matka-total-coin">
        <div className="bet-chip-holder" style={{ '--g-chip-inner-color': '#138cf5' }}>
          <div className="casino-coin active">
            <span className="fw-bold">{selectedChip >= 1000 ? `${selectedChip / 1000}K` : selectedChip}</span>
          </div>
        </div>
      </div>

      <div className="matka-other-coins d-flex gap-1 flex-wrap">
        {MATKA_CHIPS.map((chip) => {
          const isActive = selectedChip === chip.val;
          return (
            <div
              key={chip.val}
              className={`casino-coin ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedChip(chip.val)}
              style={{
                cursor: 'pointer',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: chip.color,
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '12px',
                border: isActive ? '2px solid #fdcf13' : '1px solid rgba(255,255,255,0.4)',
                boxShadow: isActive ? '0 0 8px #fdcf13' : 'none',
              }}
              title={`Chip ₹${chip.val}`}
            >
              <span>{chip.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


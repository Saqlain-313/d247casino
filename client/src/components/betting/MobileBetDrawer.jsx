import React from 'react';
import { useSelector } from 'react-redux';
import { useCasino } from '../../context/CasinoContext';

// Fallback jab user ne Set Button Value me casino buttons save na kiye hon
const CASINO_DEFAULTS = [
  { label: '100', value: 100 },
  { label: '500', value: 500 },
  { label: '1k', value: 1000 },
  { label: '5k', value: 5000 },
  { label: '10k', value: 10000 },
  { label: '25k', value: 25000 },
];

const formatStakeLabel = (value) =>
  value >= 1000 ? `${value / 1000}k` : String(value);

export default function MobileBetDrawer() {
  const { betSlip, closeBetSlip, updateStake, adjustOdds, submitBet } =
    useCasino();
  const { userInfo } = useSelector((state) => state.auth);

  if (!betSlip.isOpen || betSlip.mode !== 'mobile') return null;

  // Casino drawer hamesha user ke configured casinoQuickStakes use karta hai
  // (Set Button Value → Casino Buttons tab), warna defaults.
  const quickStakes = (
    userInfo?.casinoQuickStakes?.length
      ? userInfo.casinoQuickStakes
      : CASINO_DEFAULTS
  )
    .map((s) => ({
      label: s.label || formatStakeLabel(Number(s.value)),
      value: Number(s.value),
    }))
    .filter((s) => Number.isFinite(s.value) && s.value > 0);

  return (
    <div
      className='casino-bet-modal place-bet-modal'
      id='mobile-place-bet-modal'
      style={{ display: 'block' }}
    >
      <div className='mobile-slip-dialog'>
        <div
          className={`mobile-slip-header ${betSlip.type}`}
          style={{
            backgroundColor: betSlip.type === 'lay' ? '#faa9ba' : '#72bbef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 15px',
          }}
        >
          <div className='d-flex align-items-center'>
            <span className='badge bg-dark me-2'>
              {betSlip.type.toUpperCase()}
            </span>
            <strong className='text-truncate text-dark'>
              {betSlip.nation}
            </strong>
          </div>
          <button
            type='button'
            className='btn-close-slip text-dark'
            onClick={closeBetSlip}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
        </div>

        <div className='mobile-slip-body p-3'>
          <div className='row g-2 align-items-center mb-2'>
            <div className='col-6'>
              <label className='form-label small text-muted d-block mb-1 text-center'>
                Odds
              </label>
              <div className='input-group input-group-sm'>
                <button
                  className='btn btn-outline-secondary stepper-btn'
                  onClick={() => adjustOdds(-0.01)}
                >
                  -
                </button>
                <input
                  type='text'
                  className='form-control fw-bold text-center'
                  readOnly
                  value={betSlip.odds}
                />
                <button
                  className='btn btn-outline-secondary stepper-btn'
                  onClick={() => adjustOdds(0.01)}
                >
                  +
                </button>
              </div>
            </div>

            <div className='col-6'>
              <label className='form-label small text-muted d-block mb-1 text-center'>
                Stake
              </label>
              <div className='input-group input-group-sm'>
                <button
                  className='btn btn-outline-secondary stepper-btn'
                  onClick={() => updateStake(betSlip.stake - 100)}
                >
                  -
                </button>
                <input
                  type='number'
                  className='form-control fw-bold text-center'
                  value={betSlip.stake}
                  onChange={(e) => updateStake(e.target.value)}
                />
                <button
                  className='btn btn-outline-secondary stepper-btn'
                  onClick={() => updateStake(betSlip.stake + 100)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className='mobile-slip-quick-stakes d-flex mb-2 flex-wrap gap-1'>
            {quickStakes.map((stk) => (
              <button
                key={`${stk.label}-${stk.value}`}
                className='btn btn-sm btn-outline-secondary m-quick-stake flex-fill'
                onClick={() => updateStake(stk.value)}
              >
                {stk.label}
              </button>
            ))}
            <button
              className='btn btn-sm btn-outline-danger m-quick-stake-clear flex-fill'
              onClick={() => updateStake(0)}
            >
              Clear
            </button>
          </div>

          <div className='d-flex justify-content-between align-items-center small mb-3 px-1'>
            <span>{betSlip.type === 'lay' ? 'Liability:' : 'Profit:'}</span>
            <strong
              className={
                betSlip.type === 'lay'
                  ? 'text-danger fs-6'
                  : 'text-success fs-6'
              }
            >
              ₹
              {(betSlip.type === 'lay'
                ? betSlip.liability || betSlip.profit
                : betSlip.profit
              ).toLocaleString('en-IN')}
            </strong>
          </div>

          <div className='d-flex gap-2'>
            <button
              type='button'
              className='btn btn-secondary flex-fill'
              onClick={closeBetSlip}
            >
              Cancel
            </button>
            <button
              type='button'
              className='btn btn-success flex-fill fw-bold'
              onClick={submitBet}
              disabled={
                !betSlip.roundId || !betSlip.selection || betSlip.stake <= 0
              }
            >
              Place Bet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

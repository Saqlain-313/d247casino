import { useState } from 'react';
import { useCasino } from '../../context/CasinoContext';
import ButtonValues from '../header/ButtonValues';
import {
  DEFAULT_MOBILE_CASINO_STAKES,
  useCasinoQuickStakes,
} from './useCasinoQuickStakes';

export default function MobileBetDrawer() {
  const { betSlip, closeBetSlip, updateStake, submitBet } = useCasino();
  const quickStakes = useCasinoQuickStakes(DEFAULT_MOBILE_CASINO_STAKES);
  const [showEditButtons, setShowEditButtons] = useState(false);

  if (!betSlip.isOpen || betSlip.mode !== 'mobile') return null;
  const stakeStep = Math.max(10, Number(betSlip.min || 100));

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
              <input
                type='text'
                className='form-control form-control-sm fw-bold text-center'
                readOnly
                value={betSlip.odds}
              />
            </div>

            <div className='col-6'>
              <label className='form-label small text-muted d-block mb-1 text-center'>
                Stake
              </label>
              <div className='input-group input-group-sm'>
                <button
                  type='button'
                  className='btn btn-outline-secondary stepper-btn'
                  onClick={() =>
                    updateStake(Math.max(0, betSlip.stake - stakeStep))
                  }
                >
                  -
                </button>
                <input
                  type='number'
                  className='form-control fw-bold text-center'
                  value={betSlip.stake || ''}
                  placeholder='0'
                  min='0'
                  onChange={(e) => updateStake(e.target.value)}
                />
                <button
                  type='button'
                  className='btn btn-outline-secondary stepper-btn'
                  onClick={() => updateStake(betSlip.stake + stakeStep)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className='mobile-slip-quick-stakes d-flex mb-2 flex-wrap gap-1'>
            {quickStakes.map((stk, idx) => (
              <button
                key={`${stk.label}-${stk.value}-${idx}`}
                type='button'
                className='btn btn-sm btn-outline-secondary m-quick-stake flex-fill'
                onClick={() =>
                  updateStake(
                    (Number(betSlip.stake) || 0) + Number(stk.value || 0)
                  )
                }
              >
                +{stk.label}
              </button>
            ))}
            <button
              type='button'
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
              className='btn btn-info fw-bold text-white'
              onClick={() => setShowEditButtons(true)}
            >
              Edit
            </button>
            <button
              type='button'
              className='btn btn-danger flex-fill'
              onClick={closeBetSlip}
            >
              Reset
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
      {showEditButtons && (
        <ButtonValues
          initialTab='casino'
          onClose={() => setShowEditButtons(false)}
        />
      )}
    </div>
  );
}

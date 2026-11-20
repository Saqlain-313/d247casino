import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCasino } from '../../context/CasinoContext';
import ButtonValues from '../header/ButtonValues';
import { clearCasinoBetError } from '../../redux/reducer/casinoBetSlice';
import {
  DEFAULT_DESKTOP_CASINO_STAKES,
  useCasinoQuickStakes,
} from './useCasinoQuickStakes';

export default function DesktopBetSlip() {
  const dispatch = useDispatch();

  const { betSlip, closeBetSlip, updateStake, submitBet } = useCasino();

  const { placeBetLoading, placeBetError, balance } = useSelector(
    (state) => state.casinoBet
  );
  const quickStakes = useCasinoQuickStakes(DEFAULT_DESKTOP_CASINO_STAKES);
  const [showEditButtons, setShowEditButtons] = useState(false);

  if (!betSlip.isOpen) return null;

  // -----------------------------------------
  // SUBMIT CASINO BET (unified via CasinoContext.submitBet so Desktop & Mobile
  // share live pre-submit market/odds verification, NationBook & MyBet refresh)
  // -----------------------------------------
  const handleSubmitBet = () => submitBet();

  // -----------------------------------------
  // RESET
  // -----------------------------------------
  const handleReset = () => {
    dispatch(clearCasinoBetError());
    closeBetSlip();
  };

  return (
    <div className='sidebar-box place-bet-container' id='sidebar-place-bet-box'>
      {/* HEADER */}
      <div className='sidebar-title d-flex justify-content-between align-items-center'>
        <h4>Place Bet</h4>

        <button
          type='button'
          className='btn-close-slip text-white'
          onClick={closeBetSlip}
          disabled={placeBetLoading}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 5px',
          }}
        >
          &times;
        </button>
      </div>

      {/* BET HEADER */}
      <div className='place-bet-box-header'>
        <div className='place-bet-for'>(Bet for)</div>
        <div className='place-bet-odds'>Odds</div>
        <div className='place-bet-stake'>Stake</div>

        <div className='place-bet-profit'>
          {betSlip.type === 'lay' ? 'Liability' : 'Profit'}
        </div>
      </div>

      {/* BET BODY */}
      <div className={`place-bet-box-body ${betSlip.type}`}>
        <div className='place-bet-for'>
          <span className='fw-bold'>{betSlip.nation}</span>
        </div>

        <div className='place-bet-odds'>
          <input
            type='text'
            className='form-control fw-bold text-center'
            value={betSlip.odds}
            readOnly
          />
        </div>

        <div className='place-bet-stake'>
          <input
            type='number'
            className='form-control fw-bold text-center'
            value={betSlip.stake || ''}
            onChange={(e) => updateStake(e.target.value)}
            placeholder='0'
            min='0'
            disabled={placeBetLoading}
          />
        </div>

        <div className='place-bet-profit'>
          {betSlip.type === 'lay' ? (
            <span className='fw-bold text-danger'>
              ₹{Number(betSlip.liability || 0).toLocaleString('en-IN')}
            </span>
          ) : (
            <span className='fw-bold text-success'>
              ₹{Number(betSlip.profit || 0).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {/* QUICK STAKE BUTTONS */}
      <div className='place-bet-buttons'>
        {quickStakes.map((stk) => (
          <button
            key={stk.label}
            type='button'
            className='btn btn-place-bet'
            onClick={() => updateStake(stk.value)}
            disabled={placeBetLoading}
          >
            {stk.label}
          </button>
        ))}

        <button
          type='button'
          className='btn btn-place-bet btn-clear-stake'
          onClick={() => updateStake(0)}
          disabled={placeBetLoading}
        >
          Clear
        </button>
      </div>

      {/* BALANCE */}
      {balance !== null && (
        <div className='px-2 py-1'>
          <small>Balance: ₹{Number(balance).toLocaleString('en-IN')}</small>
        </div>
      )}

      {/* ERROR */}
      {placeBetError && (
        <div className='alert alert-danger mx-2 mb-2 py-2'>{placeBetError}</div>
      )}

      {/* ACTION BUTTONS */}
      <div className='place-bet-action-buttons flex items-center justify-between gap-2 px-2 pb-2'>
        <button
          type='button'
          className='btn btn-info cursor-pointer px-3 py-1.5 text-xs font-bold text-white'
          onClick={() => setShowEditButtons(true)}
          disabled={placeBetLoading}
        >
          Edit
        </button>

        <div className='flex gap-1.5'>
          <button
            type='button'
            className='btn btn-danger cursor-pointer px-3 py-1.5 text-xs font-bold'
            onClick={handleReset}
            disabled={placeBetLoading}
          >
            Reset
          </button>

          <button
            type='button'
            className='btn btn-success cursor-pointer px-3 py-1.5 text-xs font-bold'
            onClick={handleSubmitBet}
            disabled={
              placeBetLoading || !betSlip.stake || Number(betSlip.stake) <= 0
            }
          >
            {placeBetLoading ? 'Placing Bet...' : 'Submit'}
          </button>
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

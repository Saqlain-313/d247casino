import React from 'react';
import { useCasino } from '../../context/CasinoContext';

export default function DesktopBetSlip() {
  const { betSlip, closeBetSlip, updateStake, submitBet } = useCasino();

  if (!betSlip.isOpen) return null;

  const quickStakes = [
    { label: '100', val: 100 },
    { label: '500', val: 500 },
    { label: '1k', val: 1000 },
    { label: '2k', val: 2000 },
    { label: '5k', val: 5000 },
    { label: '10k', val: 10000 },
    { label: '25k', val: 25000 },
    { label: '50k', val: 50000 },
  ];

  return (
    <div className="sidebar-box place-bet-container" id="sidebar-place-bet-box">
      <div className="sidebar-title d-flex justify-content-between align-items-center">
        <h4>Place Bet</h4>
        <button
          type="button"
          className="btn-close-slip text-white"
          onClick={closeBetSlip}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', padding: '0 5px' }}
        >
          &times;
        </button>
      </div>

      <div className="place-bet-box-header">
        <div className="place-bet-for">(Bet for)</div>
        <div className="place-bet-odds">Odds</div>
        <div className="place-bet-stake">Stake</div>
        <div className="place-bet-profit">{betSlip.type === 'lay' ? 'Liability' : 'Profit'}</div>
      </div>

      <div className={`place-bet-box-body ${betSlip.type}`}>
        <div className="place-bet-for">
          <span className="fw-bold">{betSlip.nation}</span>
        </div>
        <div className="place-bet-odds">
          <input type="text" className="form-control text-center fw-bold" value={betSlip.odds} readOnly />
        </div>
        <div className="place-bet-stake">
          <input
            type="number"
            className="form-control text-center fw-bold"
            value={betSlip.stake || ''}
            onChange={(e) => updateStake(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="place-bet-profit">
          {betSlip.type === 'lay' ? (
            <span className="fw-bold text-danger">₹{(betSlip.liability || betSlip.profit).toLocaleString('en-IN')}</span>
          ) : (
            <span className="fw-bold text-success">₹{betSlip.profit.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>

      {/* Quick Stake Buttons */}
      <div className="place-bet-buttons">
        {quickStakes.map((stk) => (
          <button
            key={stk.label}
            type="button"
            className="btn btn-place-bet"
            onClick={() => updateStake(stk.val)}
          >
            {stk.label}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-place-bet btn-clear-stake"
          onClick={() => updateStake(0)}
        >
          Clear
        </button>
      </div>

      {/* Action Buttons */}
      <div className="place-bet-action-buttons">
        <button type="button" className="btn btn-danger" onClick={closeBetSlip}>
          Reset
        </button>
        <button type="button" className="btn btn-success" onClick={submitBet}>
          Submit
        </button>
      </div>
    </div>
  );
}


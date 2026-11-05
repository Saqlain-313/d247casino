import React from 'react';
import { useCasino } from '../../context/CasinoContext';

export default function MobileBetDrawer() {
  const { betSlip, closeBetSlip, updateStake, adjustOdds, submitBet } = useCasino();

  if (!betSlip.isOpen || betSlip.mode !== 'mobile') return null;

  const quickStakes = [100, 500, 1000, 5000, 10000, 25000];

  return (
    <div
      className="casino-bet-modal place-bet-modal"
      id="mobile-place-bet-modal"
      style={{ display: 'block' }}
    >
      <div className="mobile-slip-dialog">
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
          <div className="d-flex align-items-center">
            <span className="badge bg-dark me-2">{betSlip.type.toUpperCase()}</span>
            <strong className="text-truncate text-dark">{betSlip.nation}</strong>
          </div>
          <button
            type="button"
            className="btn-close-slip text-dark"
            onClick={closeBetSlip}
            style={{ background: 'none', border: 'none', fontSize: '24px', lineHeight: 1, cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        <div className="mobile-slip-body p-3">
          <div className="row g-2 mb-2 align-items-center">
            <div className="col-6">
              <label className="form-label small text-muted mb-1 d-block text-center">Odds</label>
              <div className="input-group input-group-sm">
                <button className="btn btn-outline-secondary stepper-btn" onClick={() => adjustOdds(-0.01)}>
                  -
                </button>
                <input type="text" className="form-control text-center fw-bold" readOnly value={betSlip.odds} />
                <button className="btn btn-outline-secondary stepper-btn" onClick={() => adjustOdds(0.01)}>
                  +
                </button>
              </div>
            </div>

            <div className="col-6">
              <label className="form-label small text-muted mb-1 d-block text-center">Stake</label>
              <div className="input-group input-group-sm">
                <button className="btn btn-outline-secondary stepper-btn" onClick={() => updateStake(betSlip.stake - 100)}>
                  -
                </button>
                <input
                  type="number"
                  className="form-control text-center fw-bold"
                  value={betSlip.stake}
                  onChange={(e) => updateStake(e.target.value)}
                />
                <button className="btn btn-outline-secondary stepper-btn" onClick={() => updateStake(betSlip.stake + 100)}>
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mobile-slip-quick-stakes d-flex flex-wrap gap-1 mb-2">
            {quickStakes.map((stk) => (
              <button
                key={stk}
                className="btn btn-sm btn-outline-secondary m-quick-stake flex-fill"
                onClick={() => updateStake(stk)}
              >
                {stk >= 1000 ? stk / 1000 + 'k' : stk}
              </button>
            ))}
            <button className="btn btn-sm btn-outline-danger m-quick-stake-clear flex-fill" onClick={() => updateStake(0)}>
              Clear
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-center small mb-3 px-1">
            <span>{betSlip.type === 'lay' ? 'Liability:' : 'Profit:'}</span>
            <strong className={betSlip.type === 'lay' ? 'text-danger fs-6' : 'text-success fs-6'}>
              ₹{(betSlip.type === 'lay' ? (betSlip.liability || betSlip.profit) : betSlip.profit).toLocaleString('en-IN')}
            </strong>
          </div>

          <div className="d-flex gap-2">
            <button type="button" className="btn btn-secondary flex-fill" onClick={closeBetSlip}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success flex-fill fw-bold"
              onClick={submitBet}
              disabled={!betSlip.roundId || !betSlip.selection || betSlip.stake <= 0}
            >
              Place Bet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


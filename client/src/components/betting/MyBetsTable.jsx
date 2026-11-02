import React from 'react';
import { useCasino } from '../../context/CasinoContext';

export default function MyBetsTable({ isMobile = false }) {
  const { placedBets } = useCasino();

  return (
    <div className={`sidebar-box my-bet-container ${isMobile ? 'mb-0' : ''}`} id={isMobile ? undefined : 'sidebar-my-bet-box'}>
      <div className="sidebar-title">
        <h4>{isMobile ? 'Placed Bets' : 'My Bet'}</h4>
      </div>
      <div className="table-responsive">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Matched Bet</th>
              <th className="text-end">Odds</th>
              <th className="text-end">Stake</th>
            </tr>
          </thead>
          <tbody className={isMobile ? 'mobile-my-bets-tbody' : 'sidebar-my-bets-tbody'}>
            {placedBets.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center text-muted py-3">
                  <small>No bets placed yet</small>
                </td>
              </tr>
            ) : (
              placedBets.map((b) => (
                <tr
                  key={b.id}
                  className={
                    b.status === 'won'
                      ? 'table-success'
                      : b.status === 'lost'
                      ? 'table-secondary opacity-75'
                      : b.status === 'half-loss'
                      ? 'table-warning'
                      : b.status === 'push'
                      ? 'table-info'
                      : b.type === 'lay'
                      ? 'table-danger'
                      : 'table-info'
                  }
                >
                  <td>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <strong>{b.nation}</strong>
                        {b.type === 'lay' && <span className="badge bg-danger ms-1" style={{ fontSize: '9px' }}>LAY</span>}
                      </div>
                      {b.status === 'won' && (
                        <span className="badge bg-success text-white" style={{ fontSize: '10px' }}>
                          WON +₹{(b.profit || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                      {b.status === 'lost' && (
                        <span className="badge bg-danger text-white" style={{ fontSize: '10px' }}>
                          LOST -₹{Math.abs(b.profit || b.stake).toLocaleString('en-IN')}
                        </span>
                      )}
                      {b.status === 'half-loss' && (
                        <span className="badge bg-warning text-dark" style={{ fontSize: '10px' }}>
                          HALF-LOSS -₹{Math.abs(b.profit || b.stake * 0.5).toLocaleString('en-IN')}
                        </span>
                      )}
                      {b.status === 'push' && (
                        <span className="badge bg-info text-white" style={{ fontSize: '10px' }}>
                          PUSH (REFUND ₹{b.stake.toLocaleString('en-IN')})
                        </span>
                      )}
                      {b.status === 'pending' && (
                        <span className="badge bg-warning text-dark" style={{ fontSize: '10px' }}>
                          PENDING
                        </span>
                      )}
                    </div>
                    <div className="small text-muted" style={{ fontSize: '11px' }}>
                      {b.time} | #{b.roundId?.slice(-6)}
                    </div>
                  </td>
                  <td className="text-end fw-bold">{b.odds}</td>
                  <td className="text-end fw-bold">₹{b.stake.toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


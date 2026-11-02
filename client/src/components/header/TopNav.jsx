import React from 'react';
import { useCasino } from '../../context/CasinoContext';
import { CASINO_GAMES } from '../../data/casinoRegistry';

export default function TopNav() {
  const { selectedGame, changeGame, isSuspended, countdown, placedBets, balance } = useCasino();

  const virtualGames = CASINO_GAMES.filter((g) => g.category === 'virtual');
  const liveGames = CASINO_GAMES.filter((g) => g.category === 'live');

  return (
    <header className="navbar navbar-dark bg-dark px-3 py-2 d-flex justify-content-between align-items-center shadow-sm" style={{ borderBottom: '2px solid #0088cc' }}>
      <div className="d-flex align-items-center gap-3">
        <span className="navbar-brand fw-bold mb-0 text-white" style={{ fontSize: '18px', letterSpacing: '0.5px' }}>
          <span style={{ color: '#0088cc' }}>DIAMOND</span>247
        </span>

        {/* Quick Game Switcher */}
        <div className="d-flex align-items-center">
          <label className="text-muted small me-2 d-none d-md-inline">Select Game:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: '220px', backgroundColor: '#1a1d20', color: '#fff', borderColor: '#495057' }}
            value={selectedGame}
            onChange={(e) => changeGame(e.target.value)}
          >
            <optgroup label="🎮 Virtual Casino Games">
              {virtualGames.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="🔴 Live Dealer Games">
              {liveGames.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        {/* Round Status */}
        {isSuspended ? (
          <span className="badge bg-danger text-uppercase px-2 py-1">
            <i className="fas fa-lock me-1"></i> Suspended ({countdown}s)
          </span>
        ) : (
          <span className="badge bg-success text-uppercase px-2 py-1">
            <i className="fas fa-circle me-1" style={{ fontSize: '8px' }}></i> Open ({countdown}s)
          </span>
        )}

        {/* Bets Counter */}
        <span className="badge bg-secondary px-2 py-1 d-none d-sm-inline">
          Placed: {placedBets.length}
        </span>

        {/* Live User Balance */}
        <span className="badge bg-warning text-dark fw-bold px-2 py-1">
          ₹{(balance ?? 50000).toLocaleString('en-IN')}
        </span>
      </div>
    </header>
  );
}


import React from 'react';
import { useCasino } from '../../context/CasinoContext';
import OddsBox from './OddsBox';
import RouletteTable from './RouletteTable';
import Goal2Table from './games/Goal2Table';
import Vlucky7Table from './games/Vlucky7Table';

/* ==========================================================================
   AUTHENTIC 93 CASINO GAME DEDICATED MARKET TABLES
   100% INDIVIDUAL, ZERO GROUPING, ZERO FAMILY SPECIFICATION
   ========================================================================== */

// --------------------------------------------------------------------------
// Game: Goal 2 (goal2)
// --------------------------------------------------------------------------
function TableGoal2({ isMobile, isSuspended, openBetSlip, markets }) {
  const quadrants = [
    { key: 'TL', name: 'Top Left', odds: '4.5' },
    { key: 'TR', name: 'Top Right', odds: '4.5' },
    { key: 'BL', name: 'Bottom Left', odds: '4.5' },
    { key: 'BR', name: 'Bottom Right', odds: '4.5' },
    { key: 'C', name: 'Center', odds: '5.0' },
  ];
  return (
    <div className="casino-table goal">
      <div className="casino-table-box">
        <div className="d-flex justify-content-between gap-3 mb-3">
          <div className="w-50 p-3 border rounded text-center">
            <div className="h5 fw-bold text-success">Goal</div>
            <OddsBox nation="Goal" odds={markets?.goal?.back || '1.98'} type="back" className="w-100 mt-2" />
          </div>
          <div className="w-50 p-3 border rounded text-center">
            <div className="h5 fw-bold text-danger">No Goal</div>
            <OddsBox nation="No Goal" odds={markets?.noGoal?.back || '1.98'} type="back" className="w-100 mt-2" />
          </div>
        </div>

        <div className="casino-odds w-100 text-center fw-bold mb-2">Target Penalty Quadrant</div>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {quadrants.map((q) => (
            <div
              key={q.key}
              className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip(`Quadrant ${q.name}`, q.odds, 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '90px', textAlign: 'center' }}
            >
              <div className="casino-odds">{isSuspended ? '-' : q.odds}</div>
              <div className="fw-bold">{q.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Matka (worli3)
// --------------------------------------------------------------------------
function TableWorli3({ isMobile, isSuspended, openBetSlip }) {
  const [activeTab, setActiveTab] = React.useState('jodi');
  const [jodiStakes, setJodiStakes] = React.useState({});
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleJodiClick = (numStr) => {
    if (isSuspended) return;
    openBetSlip(`Jodi ${numStr}`, '95.0', 'back', isMobile);
    setJodiStakes((prev) => ({
      ...prev,
      [numStr]: (prev[numStr] || 0) + 100,
    }));
  };

  const handleClear = () => {
    setJodiStakes({});
  };

  const totalAmount = Object.values(jodiStakes).reduce((a, b) => a + b, 0);

  return (
    <div className="casino-table worli">
      <div className="casino-table-box p-3 border rounded">
        {/* Worli sub-tabs */}
        <div className="worli-tabs mb-3 overflow-auto" id="worli-tabs">
          <ul className="nav nav-pills flex-nowrap gap-1 pb-1">
            {[{"id":"single","name":"Single Ank"},{"id":"jodi","name":"Jodi"},{"id":"singlepatti","name":"Single Patti"},{"id":"doublepatti","name":"Double Patti"},{"id":"triplepatti","name":"Triple Patti"},{"id":"halfsangam","name":"Half Sangam"},{"id":"fullsangam","name":"Full Sangam"},{"id":"spmotor","name":"SP Motor"},{"id":"dpmotor","name":"DP Motor"},{"id":"tpmotor","name":"TP Motor"},{"id":"cyclepana","name":"Cycle Pana"},{"id":"fdpana","name":"FD Pana"},{"id":"sdpana","name":"SD Pana"},{"id":"tdpana","name":"TD Pana"}].map((t) => (
              <li key={t.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-link py-1 px-2 small ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tab 1: Jodi 10x10 Matrix */}
        {activeTab === 'jodi' && (
          <div className="jodi-matrix-container mb-3">
            <h6 className="fw-bold mb-2 text-center">Jodi 00 to 99 (Odds: 95.00)</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered text-center align-middle mb-0">
                <tbody>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((row) => (
                    <tr key={row}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => {
                        const num = `${row}${col}`;
                        const stake = jodiStakes[num];
                        return (
                          <td
                            key={num}
                            className={`p-1 ${stake ? 'table-warning fw-bold' : ''} ${isSuspended ? 'bg-light text-muted' : ''}`}
                            onClick={() => handleJodiClick(num)}
                            style={{
                              cursor: isSuspended ? 'not-allowed' : 'pointer',
                              minWidth: '34px',
                              height: '38px',
                              userSelect: 'none',
                            }}
                          >
                            <div className="small">{num}</div>
                            {stake ? <div className="text-danger" style={{ fontSize: '9px' }}>{stake}</div> : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Single Digit (0-9) */}
        {activeTab === 'single' && (
          <div className="single-digit-container mb-3 text-center">
            <h6 className="fw-bold mb-2">Single Ank (0 to 9) - Odds: 9.50</h6>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {digits.map((d) => (
                <div
                  key={d}
                  className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
                  onClick={isSuspended ? undefined : () => openBetSlip(`Single ${d}`, '9.5', 'back', isMobile)}
                  style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '60px', textAlign: 'center' }}
                >
                  <div className="casino-odds">{isSuspended ? '-' : '9.5'}</div>
                  <div className="fw-bold h5 mb-0">{d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Pana / Patti combinations */}
        {activeTab !== 'jodi' && activeTab !== 'single' && (
          <div className="pana-container mb-3 text-center p-3 bg-light rounded">
            <h6 className="fw-bold mb-2">{activeTab.toUpperCase()} Matrix - Odds: 150.00</h6>
            <p className="text-muted small mb-3">Quick combination selector for {activeTab}</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {['120', '123', '124', '125', '126', '127', '128', '129', '130', '134'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={isSuspended ? undefined : () => openBetSlip(`Pana ${p}`, '150.0', 'back', isMobile)}
                  disabled={isSuspended}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Worli Action Box */}
        <div className="worli-clear-box d-flex justify-content-between align-items-center p-2 bg-light border rounded">
          <div className="total-amount fw-bold">
            Total Amount: <span className="text-primary">{totalAmount}</span>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-danger px-3"
              onClick={handleClear}
              disabled={totalAmount === 0}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-sm btn-success px-3"
              disabled={totalAmount === 0 || isSuspended}
              onClick={() => {
                Object.entries(jodiStakes).forEach(([num, st]) => {
                  openBetSlip(`Jodi ${num}`, '95.0', 'back', isMobile);
                });
              }}
            >
              Place Bet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Dolidana (dolidana)
// --------------------------------------------------------------------------
function TableDolidana({ isMobile, isSuspended, openBetSlip, markets }) {
  const sumOdds = [
    { sum: 3, odd: '70' }, { sum: 4, odd: '35' }, { sum: 5, odd: '20' },
    { sum: 6, odd: '14' }, { sum: 7, odd: '10' }, { sum: 8, odd: '8' },
    { sum: 9, odd: '7' }, { sum: 10, odd: '6.5' }, { sum: 11, odd: '6.5' },
    { sum: 12, odd: '7' }, { sum: 13, odd: '8' }, { sum: 14, odd: '10' },
    { sum: 15, odd: '14' }, { sum: 16, odd: '20' }, { sum: 17, odd: '35' },
    { sum: 18, odd: '70' },
  ];

  return (
    <div className="casino-table dolidana">
      <div className="casino-table-box p-3 border rounded text-center">
        <h5 className="fw-bold mb-3">Dolidana (3-Dice Roll Showdown)</h5>

        {/* 6 Dice Faces */}
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
          {[1, 2, 3, 4, 5, 6].map((face) => (
            <div
              key={face}
              className={`card-odd-box p-2 border rounded bg-white text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip(`Single Dice ${face}`, '5.50', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '65px' }}
            >
              <img
                src={`/assets/img/dice${face}.png`}
                onError={(e) => {
                  e.currentTarget.src = `https://cdn.926assets.com/g3ver/v107/static/front/img/dice${face}.png`;
                }}
                alt={`Dice ${face}`}
                style={{ width: '32px', height: '32px', marginBottom: '4px' }}
              />
              <div className="casino-odds small">{isSuspended ? '-' : '5.50'}</div>
            </div>
          ))}
        </div>

        {/* Small vs Big vs Any Triple */}
        <div className="row g-2 justify-content-center mb-3">
          <div className="col-4">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Small (4-10)', '1.98', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Small (4-10)</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.98'}</div>
            </div>
          </div>
          <div className="col-4">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Any Triple', '31.00', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold text-danger">Any Triple</div>
              <div className="casino-odds text-danger">{isSuspended ? '-' : '31.00'}</div>
            </div>
          </div>
          <div className="col-4">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Big (11-17)', '1.98', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Big (11-17)</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.98'}</div>
            </div>
          </div>
        </div>

        {/* Sum Totals (3 to 18) */}
        <div className="d-flex flex-wrap justify-content-center gap-1">
          {sumOdds.map((s) => (
            <div
              key={s.sum}
              className={`card-odd-box p-1 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip(`Sum ${s.sum}`, s.odd, 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '48px', fontSize: '11px' }}
            >
              <div className="fw-bold">{s.sum}</div>
              <div className="text-muted">{isSuspended ? '-' : s.odd}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Mogambo (mogambo)
// --------------------------------------------------------------------------
function TableMogambo({ isMobile, isSuspended, openBetSlip }) {
  const characters = [
    { key: 'A', name: 'Mogambo', odds: '2.85' },
    { key: 'B', name: 'Mr. India', odds: '2.85' },
    { key: 'C', name: 'Seema', odds: '2.85' },
  ];

  return (
    <div className="casino-table mogambo">
      <div className="casino-table-box p-3 border rounded text-center">
        <h5 className="fw-bold mb-3">Mogambo (Khush Hua Duel)</h5>
        
        {/* 3 Characters */}
        <div className="row g-3 mb-3">
          {characters.map((char) => (
            <div key={char.key} className="col-4">
              <div
                className={`card-odd-box p-3 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`${char.key}. ${char.name}`, char.odds, 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <div className="fw-bold fs-5">{char.name}</div>
                <div className="casino-odds text-primary fs-4">{isSuspended ? '-' : char.odds}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Red / Black & Odd / Even */}
        <div className="row g-2 justify-content-center">
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Red', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold text-danger">Red</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Black', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold text-dark">Black</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Odd', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Odd</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Even', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Even</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Lucky 6 / Lucky 5 (lucky5)
// --------------------------------------------------------------------------
function TableLucky5({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards11 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <div className="casino-table lucky7a lucky5">
      <div className="casino-table-box">
        <div className="casino-table-full-box">
          <div className="lucky7low">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.low?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Low Card (1-5)', markets?.low?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Low (1-5)</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.six?.back || '11')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Exact 6', markets?.six?.back || '11', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Exact 6</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7high">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.high?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('High Card (7-11)', markets?.high?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">High (7-11)</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>
        </div>

        <div className="casino-table-box mt-3">
          <div className="casino-table-left-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.even?.back || '2.05')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Even', markets?.even?.back || '2.05', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Even</span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.odd?.back || '1.85')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Odd', markets?.odd?.back || '1.85', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Odd</span>
              </div>
            </div>
          </div>

          <div className="casino-table-right-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.red?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Red', markets?.red?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-red">Red</span></span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.black?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Black', markets?.black?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-black">Black</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="casino-table-box mt-3 d-flex justify-content-between gap-2">
          {[
            { label: 'A-2-3', odds: '4.00' },
            { label: '4-5-6', odds: '4.00' },
            { label: '8-9-10', odds: '4.00' },
            { label: 'J-Q-K', odds: '4.00' },
          ].map((grp) => (
            <div key={grp.label} className="lucky7cards flex-fill text-center">
              <div className="casino-odds w-100 text-center fw-bold">{isSuspended ? '-' : grp.odds}</div>
              <div
                className={`card-odd-box-container p-1 border rounded ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Group ${grp.label}`, grp.odds, 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', background: '#273646' }}
              >
                <span className="fw-bold text-white">{grp.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="casino-table-full-box lucky7acards mt-3">
          <div className="casino-odds w-100 text-center fw-bold mb-1">11 Cards Market (Payout 11.0)</div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cards11.map((num) => (
              <div
                key={num}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Card ${num}`, '11', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '45px', textAlign: 'center' }}
              >
                <div className="casino-odds">{isSuspended ? '-' : '11'}</div>
                <div className="fw-bold">{num}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Beach Roulette (roulette12)
// --------------------------------------------------------------------------
function TableRoulette12() {
  return <RouletteTable />;
}

// --------------------------------------------------------------------------
// Game: Roulette (roulette13)
// --------------------------------------------------------------------------
function TableRoulette13() {
  return <RouletteTable />;
}

// --------------------------------------------------------------------------
// Game: VIP Roulette (roulette11)
// --------------------------------------------------------------------------
function TableRoulette11() {
  return <RouletteTable />;
}

// --------------------------------------------------------------------------
// Game: Teenpatti Poison One Day (poison)
// --------------------------------------------------------------------------

function TablePoison({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideMarkets = [
    { name: 'Pair Plus A', odds: '2.0' },
    { name: 'Pair Plus B', odds: '2.0' },
    { name: '3 Baccarat A', odds: '1.95' },
    { name: '3 Baccarat B', odds: '1.95' },
  ];

  const LockIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7 text-white"
    >
      <path d="M7 8V6a5 5 0 0110 0v2h1a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1zm2 0h6V6a3 3 0 00-6 0v2zm3 4a2 2 0 00-1 3.73V18h2v-2.27A2 2 0 0012 12z" />
    </svg>
  );

  const OddsButton = ({ nation, odds, type }) => {
    const isBack = type === 'back';

    return (
      <button
        type="button"
        disabled={isSuspended}
        onClick={() => {
          if (!isSuspended) {
            openBetSlip(nation, odds, type, isMobile);
          }
        }}
        className={`flex min-h-[60px] w-full items-center justify-center border-l border-white/50 transition-colors ${
          isSuspended
            ? 'cursor-not-allowed bg-[#414c56]'
            : isBack
              ? 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
              : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
        }`}
      >
        {isSuspended ? (
          <LockIcon />
        ) : (
          <span className="text-lg font-bold text-[#303b45]">
            {odds}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full min-w-0 bg-white p-1">

      {/* MAIN BETTING LAYOUT */}
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1.4fr_1fr]">

        {/* PLAYER MARKETS */}
        <section className="min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]">

          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_85px_85px] bg-[#4b5b6b] text-white">

            <div className="flex items-center px-3 py-3">
              <span className="text-sm font-bold">Nation</span>
            </div>

            <div className="flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]">
              Back
            </div>

            <div className="flex items-center justify-center bg-[#f5a5b8] py-3 text-sm font-bold text-[#303b45]">
              Lay
            </div>

          </div>

          {/* Player Rows */}
          {players.map((player, index) => (
            <div
              key={player.name}
              className={`grid min-h-[65px] grid-cols-[minmax(0,1fr)_85px_85px] border-t border-[#d1d1d1] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
              }`}
            >

              <div className="flex items-center px-3 py-3">
                <span className="text-base font-semibold text-[#333333]">
                  {player.name}
                </span>
              </div>

              <OddsButton
                nation={player.name}
                odds={player.back}
                type="back"
              />

              <OddsButton
                nation={player.name}
                odds={player.lay}
                type="lay"
              />

            </div>
          ))}

        </section>

        {/* SIDE BETS */}
        <section className="min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]">

          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_90px] bg-[#4b5b6b] text-white">

            <div className="flex items-center px-3 py-3">
              <span className="text-sm font-bold">Side Bets</span>
            </div>

            <div className="flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]">
              Back
            </div>

          </div>

          {/* Side Bet Rows */}
          {sideMarkets.map((item, index) => (
            <div
              key={item.name}
              className={`grid min-h-[65px] grid-cols-[minmax(0,1fr)_90px] border-t border-[#d1d1d1] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
              }`}
            >

              <div className="flex items-center px-3 py-3">
                <span className="text-sm font-medium text-[#333333] sm:text-base">
                  {item.name}
                </span>
              </div>

              <OddsButton
                nation={item.name}
                odds={item.odds}
                type="back"
              />

            </div>
          ))}

        </section>

      </div>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Unique Teenpatti (teenunique)
// --------------------------------------------------------------------------

function TableTeenunique({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideMarkets = [
    { name: 'Pair Plus A', odds: '2.0' },
    { name: 'Pair Plus B', odds: '2.0' },
    { name: '3 Baccarat A', odds: '1.95' },
    { name: '3 Baccarat B', odds: '1.95' },
  ];

  const LockIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7 text-white"
    >
      <path d="M7 8V6a5 5 0 0110 0v2h1a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1zm2 0h6V6a3 3 0 00-6 0v2zm3 4a2 2 0 00-1 3.73V18h2v-2.27A2 2 0 0012 12z" />
    </svg>
  );

  const OddsButton = ({ nation, odds, type }) => {
    const isBack = type === 'back';

    return (
      <button
        type="button"
        disabled={isSuspended}
        onClick={() => {
          if (!isSuspended) {
            openBetSlip(nation, odds, type, isMobile);
          }
        }}
        className={`flex min-h-[60px] w-full items-center justify-center border-l border-white/50 transition-colors ${
          isSuspended
            ? 'cursor-not-allowed bg-[#414c56]'
            : isBack
              ? 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
              : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
        }`}
      >
        {isSuspended ? (
          <LockIcon />
        ) : (
          <span className="text-lg font-bold text-[#303b45]">
            {odds}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full min-w-0 bg-white p-1">

      {/* MAIN BETTING LAYOUT */}
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1.4fr_1fr]">

        {/* PLAYER MARKETS */}
        <section className="min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]">

          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_85px_85px] bg-[#4b5b6b] text-white">

            <div className="flex items-center px-3 py-3">
              <span className="text-sm font-bold">Nation</span>
            </div>

            <div className="flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]">
              Back
            </div>

            <div className="flex items-center justify-center bg-[#f5a5b8] py-3 text-sm font-bold text-[#303b45]">
              Lay
            </div>

          </div>

          {/* Player Rows */}
          {players.map((player, index) => (
            <div
              key={player.name}
              className={`grid min-h-[65px] grid-cols-[minmax(0,1fr)_85px_85px] border-t border-[#d1d1d1] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
              }`}
            >

              <div className="flex items-center px-3 py-3">
                <span className="text-base font-semibold text-[#333333]">
                  {player.name}
                </span>
              </div>

              <OddsButton
                nation={player.name}
                odds={player.back}
                type="back"
              />

              <OddsButton
                nation={player.name}
                odds={player.lay}
                type="lay"
              />

            </div>
          ))}

        </section>

        {/* SIDE BETS */}
        <section className="min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]">

          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_90px] bg-[#4b5b6b] text-white">

            <div className="flex items-center px-3 py-3">
              <span className="text-sm font-bold">Side Bets</span>
            </div>

            <div className="flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]">
              Back
            </div>

          </div>

          {/* Side Bet Rows */}
          {sideMarkets.map((item, index) => (
            <div
              key={item.name}
              className={`grid min-h-[65px] grid-cols-[minmax(0,1fr)_90px] border-t border-[#d1d1d1] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
              }`}
            >

              <div className="flex items-center px-3 py-3">
                <span className="text-sm font-medium text-[#333333] sm:text-base">
                  {item.name}
                </span>
              </div>

              <OddsButton
                nation={item.name}
                odds={item.odds}
                type="back"
              />

            </div>
          ))}

        </section>

      </div>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Teenpatti Poison 20-20 (poison20)
// --------------------------------------------------------------------------
function TablePoison20({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideMarkets = [
    { name: 'Pair Plus A', odds: '2.0' },
    { name: 'Pair Plus B', odds: '2.0' },
    { name: '3 Baccarat A', odds: '1.95' },
    { name: '3 Baccarat B', odds: '1.95' },
  ];

  const OddsButton = ({ nation, odds, type }) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() => openBetSlip(nation, odds, type, isMobile)}
      className={`relative flex min-h-[42px] w-full items-center justify-center rounded-sm text-sm font-bold transition-colors ${
        type === 'back'
          ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
          : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
      } ${isSuspended ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
    >
      {isSuspended ? (
        <span className="text-gray-700">🔒</span>
      ) : (
        odds
      )}
    </button>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_1fr]">

        {/* Player A & Player B */}
        <div className="grid grid-cols-2 gap-2">

          {players.map((player) => (
            <div
              key={player.name}
              className="min-w-0 overflow-hidden rounded-sm border border-[#d1d1d1] bg-white"
            >
              <div className="bg-[#4b5b6b] px-2 py-2 text-center text-sm font-semibold text-white">
                {player.name}
              </div>

              <div className="grid grid-cols-2 gap-1 bg-[#f8f9fa] p-2">
                <div className="text-center text-xs font-semibold text-gray-700">
                  Back
                </div>
                <div className="text-center text-xs font-semibold text-gray-700">
                  Lay
                </div>

                <OddsButton
                  nation={player.name}
                  odds={player.back}
                  type="back"
                />

                <OddsButton
                  nation={player.name}
                  odds={player.lay}
                  type="lay"
                />
              </div>
            </div>
          ))}

        </div>

        {/* Side Bets */}
        <div className="min-w-0 overflow-hidden rounded-sm border border-[#d1d1d1] bg-white">
          <div className="grid grid-cols-[minmax(0,1fr)_90px] bg-[#4b5b6b] px-2 py-2 text-sm font-semibold text-white">
            <div>Side Bets</div>
            <div className="text-center">Back</div>
          </div>

          <div>
            {sideMarkets.map((market) => (
              <div
                key={market.name}
                className="grid grid-cols-[minmax(0,1fr)_90px] items-center gap-2 border-b border-[#d1d1d1] px-2 py-1.5 last:border-b-0"
              >
                <div className="truncate text-sm font-medium text-gray-800">
                  {market.name}
                </div>

                <OddsButton
                  nation={market.name}
                  odds={market.odds}
                  type="back"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Unlimited Joker 20-20 (joker120)
// --------------------------------------------------------------------------

function TableJoker120({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  // Use API result when available, otherwise mock results
  const results = Array.isArray(markets?.lastResult)
    ? markets.lastResult
    : Array(10).fill('R');

  // Lock Icon
  const LockIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7 text-white"
    >
      <path
        fillRule="evenodd"
        d="M7 8V6a5 5 0 0110 0v2h1.5A2.5 2.5 0 0121 10.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 19.5v-9A2.5 2.5 0 015.5 8H7zm2 0h6V6a3 3 0 00-6 0v2zm3 4a2 2 0 00-1 3.732V18h2v-2.268A2 2 0 0012 12z"
        clipRule="evenodd"
      />
    </svg>
  );

  // Odds Button
  const OddsButton = ({ nation, odds, type }) => {
    const isBack = type === 'back';

    return (
      <button
        type="button"
        disabled={isSuspended}
        onClick={() => {
          if (!isSuspended) {
            openBetSlip(nation, odds, type, isMobile);
          }
        }}
        className={`
          flex min-h-[64px] w-full flex-col
          items-center justify-center gap-1
          border-l border-white/50
          transition-colors
          ${
            isBack
              ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
              : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
          }
          ${
            isSuspended
              ? 'cursor-not-allowed bg-[#414c56] hover:bg-[#414c56]'
              : 'cursor-pointer'
          }
        `}
      >
        {isSuspended ? (
          <LockIcon />
        ) : (
          <span className="text-xl font-bold leading-6 text-[#293744]">
            {odds}
          </span>
        )}
      </button>
    );
  };

  // Player Card
  const PlayerCard = ({ player }) => (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_98px_98px] overflow-hidden border border-[#d1d1d1] bg-[#f1f1f1]">

      {/* Player Name */}
      <div className="flex min-w-0 items-center px-3 py-4">
        <span className="text-lg font-bold text-[#333333] sm:text-xl">
          {player.name}
        </span>
      </div>

      {/* Back */}
      <OddsButton
        nation={player.name}
        odds={player.back}
        type="back"
      />

      {/* Lay */}
      <OddsButton
        nation={player.name}
        odds={player.lay}
        type="lay"
      />

    </div>
  );

  return (
    <div className="w-full min-w-0 bg-white">

      {/* Player Markets */}
      <div className="grid grid-cols-1 gap-2 p-1 lg:grid-cols-2">

        {players.map((player) => (
          <PlayerCard
            key={player.name}
            player={player}
          />
        ))}

      </div>

      {/* Last Result */}
      <section className="mt-1 w-full">

        {/* Header */}
        <div className="flex items-center justify-between bg-[#4b5b6b] px-3 py-3">

          <h3 className="text-lg font-bold text-white sm:text-xl">
            Last Result
          </h3>

          <button
            type="button"
            onClick={() => {
              // Connect your existing result history action here.
            }}
            className="text-base font-bold text-white transition-colors hover:text-blue-300 sm:text-lg"
          >
            View All
          </button>

        </div>

        {/* Result Balls */}
        <div className="flex min-h-[76px] flex-wrap items-center justify-end gap-2 px-2 py-2">

          {results.map((result, index) => (
            <div
              key={index}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#315d38] shadow-sm sm:h-14 sm:w-14"
            >
              <span className="text-xl font-extrabold text-[#ffff00]">
                {result}
              </span>
            </div>
          ))}

        </div>

      </section>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Teenpatti Joker 20-20 (joker20)
// --------------------------------------------------------------------------

function TableJoker20({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideMarkets = [
    { name: 'Pair Plus A', odds: '2.0' },
    { name: 'Pair Plus B', odds: '2.0' },
    { name: '3 Baccarat A', odds: '1.95' },
    { name: '3 Baccarat B', odds: '1.95' },
  ];

  const LockIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7 text-white"
    >
      <path d="M7 8V6a5 5 0 0110 0v2h1a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1zm2 0h6V6a3 3 0 00-6 0v2zm3 4a2 2 0 00-1 3.73V18h2v-2.27A2 2 0 0012 12z" />
    </svg>
  );

  const OddsButton = ({ nation, odds, type }) => {
    const isBack = type === 'back';

    return (
      <button
        type="button"
        disabled={isSuspended}
        onClick={() => {
          if (!isSuspended) {
            openBetSlip(nation, odds, type, isMobile);
          }
        }}
        className={`flex min-h-[58px] w-full items-center justify-center border-l border-white/50 transition-colors ${
          isSuspended
            ? 'cursor-not-allowed bg-[#414c56]'
            : isBack
              ? 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
              : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
        }`}
      >
        {isSuspended ? (
          <LockIcon />
        ) : (
          <span className="text-lg font-bold text-[#303b45]">
            {odds}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full min-w-0 bg-white p-1">

      {/* MAIN BETTING LAYOUT */}
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1.4fr_1fr]">

        {/* PLAYER MARKETS */}
        <section className="min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]">

          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_85px_85px] bg-[#4b5b6b] text-white">

            <div className="flex items-center px-3 py-3">
              <span className="text-sm font-bold">Nation</span>
            </div>

            <div className="flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]">
              Back
            </div>

            <div className="flex items-center justify-center bg-[#f5a5b8] py-3 text-sm font-bold text-[#303b45]">
              Lay
            </div>

          </div>

          {/* Player Rows */}
          {players.map((player, index) => (
            <div
              key={player.name}
              className={`grid min-h-[65px] grid-cols-[minmax(0,1fr)_85px_85px] border-t border-[#d1d1d1] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
              }`}
            >

              <div className="flex items-center px-3 py-3">
                <span className="text-base font-semibold text-[#333333]">
                  {player.name}
                </span>
              </div>

              <OddsButton
                nation={player.name}
                odds={player.back}
                type="back"
              />

              <OddsButton
                nation={player.name}
                odds={player.lay}
                type="lay"
              />

            </div>
          ))}

        </section>

        {/* SIDE BETS */}
        <section className="min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]">

          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_90px] bg-[#4b5b6b] text-white">

            <div className="flex items-center px-3 py-3">
              <span className="text-sm font-bold">Side Bets</span>
            </div>

            <div className="flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]">
              Back
            </div>

          </div>

          {/* Side Bet Rows */}
          {sideMarkets.map((item, index) => (
            <div
              key={item.name}
              className={`grid min-h-[65px] grid-cols-[minmax(0,1fr)_90px] border-t border-[#d1d1d1] ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
              }`}
            >

              <div className="flex items-center px-3 py-3">
                <span className="text-sm font-medium text-[#333333] sm:text-base">
                  {item.name}
                </span>
              </div>

              <OddsButton
                nation={item.name}
                odds={item.odds}
                type="back"
              />

            </div>
          ))}

        </section>

      </div>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Unlimited Joker Oneday (joker1)
// --------------------------------------------------------------------------
function TableJoker1({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

 return (
  <div className="w-full overflow-hidden border border-[#d1d1d1] bg-white">
    <div className="grid grid-cols-2 gap-[2px]">
      {players.map((player) => (
        <div
          key={player.name}
          className="grid min-w-0 grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)] gap-[2px]"
        >
          {/* Player Name */}
          <div className="flex h-[48px] min-w-0 items-center bg-[#f1f1f1] px-2">
            <span className="truncate text-sm font-bold text-[#333] sm:text-base">
              {player.name}
            </span>
          </div>

          {/* Back */}
          <button
            type="button"
            disabled={isSuspended}
            onClick={() =>
              openBetSlip(player.name, player.back, 'back', isMobile)
            }
            className={`flex h-[48px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#333] sm:text-base ${
              isSuspended
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer hover:bg-[#5da9dc]'
            }`}
          >
            {isSuspended ? '🔒' : player.back}
          </button>

          {/* Lay */}
          <button
            type="button"
            disabled={isSuspended}
            onClick={() =>
              openBetSlip(player.name, player.lay, 'lay', isMobile)
            }
            className={`flex h-[48px] items-center justify-center bg-[#f5a5b8] text-sm font-bold text-[#333] sm:text-base ${
              isSuspended
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer hover:bg-[#ed91a7]'
            }`}
          >
            {isSuspended ? '🔒' : player.lay}
          </button>
        </div>
      ))}
    </div>
  </div>
);
}

// --------------------------------------------------------------------------
// Game: 20-20 Teenpatti C (teen20c)
// --------------------------------------------------------------------------
function TableTeen20c({ isMobile, isSuspended, openBetSlip, markets }) {
  const sections = [
    {
      title: 'Player A',
      markets: [
        {
          name: 'Player A',
          odds: markets?.playerA?.back || '1.98',
        },
        {
          name: '3 Baccarat A',
          odds: markets?.baccaratA?.back || '1.98',
        },
        {
          name: 'Total A',
          odds: markets?.totalA?.back || '2',
        },
        {
          name: 'Pair Plus A',
          odds: markets?.pairPlusA?.back || 'A',
        },
      ],
    },
    {
      title: 'Player B',
      markets: [
        {
          name: 'Player B',
          odds: markets?.playerB?.back || '1.98',
        },
        {
          name: '3 Baccarat B',
          odds: markets?.baccaratB?.back || '1.98',
        },
        {
          name: 'Total B',
          odds: markets?.totalB?.back || '2',
        },
        {
          name: 'Pair Plus B',
          odds: markets?.pairPlusB?.back || 'B',
        },
      ],
    },
  ];

  const suitMarkets = [
    {
      name: 'Black Suits A',
      suits: ['♠', '♣'],
      odds: markets?.blackA?.back || '1.98',
    },
    {
      name: 'Red Suits A',
      suits: ['♥', '♦'],
      odds: markets?.redA?.back || '1.98',
    },
    {
      name: 'Black Suits B',
      suits: ['♠', '♣'],
      odds: markets?.blackB?.back || '1.98',
    },
    {
      name: 'Red Suits B',
      suits: ['♥', '♦'],
      odds: markets?.redB?.back || '1.98',
    },
  ];

  const LockIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 fill-white"
      aria-hidden="true"
    >
      <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z" />
    </svg>
  );

  return (
    <div className="w-full space-y-2">
      {/* Player A & Player B */}
      <div className="grid grid-cols-2 gap-1.5">
        {sections.map((section) => (
          <div
            key={section.title}
            className="min-w-0 overflow-hidden border border-[#c9c9c9]"
          >
            {/* Player Header */}
            <div className="flex h-[28px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
              {section.title}
            </div>

            {/* Market Names */}
            <div className="grid grid-cols-4 border-t border-[#c9c9c9]">
              {section.markets.map((market) => (
                <div
                  key={market.name}
                  className="flex h-[46px] min-w-0 items-center justify-center border-r border-[#c9c9c9] bg-[#f1f1f1] px-1 text-center text-[11px] font-bold text-[#333333] last:border-r-0 sm:text-sm"
                >
                  {market.name}
                </div>
              ))}
            </div>

            {/* Market Odds */}
            <div className="grid grid-cols-4 border-t border-[#c9c9c9]">
              {section.markets.map((market) => (
                <button
                  key={market.name}
                  type="button"
                  disabled={isSuspended}
                  onClick={() =>
                    openBetSlip(
                      market.name,
                      market.odds,
                      'back',
                      isMobile
                    )
                  }
                  className={`flex h-[48px] min-w-0 items-center justify-center border-r border-[#c9c9c9] bg-[#72b9e8] last:border-r-0 ${
                    isSuspended
                      ? 'cursor-not-allowed opacity-70'
                      : 'cursor-pointer hover:bg-[#5da9dc]'
                  }`}
                >
                  {isSuspended ? (
                    <LockIcon />
                  ) : (
                    <span className="text-sm font-bold text-[#333333] sm:text-base">
                      {market.odds}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Suit Markets */}
      <div className="grid grid-cols-4 gap-1.5">
        {suitMarkets.map((market) => (
          <button
            key={market.name}
            type="button"
            disabled={isSuspended}
            onClick={() =>
              openBetSlip(
                market.name,
                market.odds,
                'back',
                isMobile
              )
            }
            className={`flex h-[48px] min-w-0 items-center justify-between gap-1 bg-[#72b9e8] px-2 ${
              isSuspended
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer hover:bg-[#5da9dc]'
            }`}
          >
            {/* Suit Icons */}
            <div className="flex shrink-0 items-center gap-1 text-xl font-bold sm:text-2xl">
              {market.suits.map((suit) => (
                <span
                  key={suit}
                  className={
                    suit === '♥' || suit === '♦'
                      ? 'text-[#d84b4b]'
                      : 'text-[#222222]'
                  }
                >
                  {suit}
                </span>
              ))}
            </div>

            {/* Odds / Lock */}
            {isSuspended ? (
              <LockIcon />
            ) : (
              <span className="truncate text-sm font-bold text-[#333333] sm:text-base">
                {market.odds}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Bollywood Casino 2 (btable2)
// --------------------------------------------------------------------------
function TableBtable2({ isMobile, isSuspended, openBetSlip, markets }) {
  const chars = [
    { key: 'A', name: 'Don', back: '15', lay: '17' },
    { key: 'B', name: 'Amar Akbar Anthony', back: '5.15', lay: '5.5' },
    { key: 'C', name: 'Sahib Bibi Aur Ghulam', back: '5.15', lay: '5.5' },
    { key: 'D', name: 'Dharam Veer', back: '7.65', lay: '8.35' },
    { key: 'E', name: 'Kis Kis ko Pyaar Karoon', back: '3.85', lay: '4.15' },
    { key: 'F', name: 'Ghulam', back: '5.15', lay: '5.5' },
  ];

  const suits = [
    { name: 'Red', symbols: '♥ ♦', odds: '1.97', color: 'text-red-600' },
    { name: 'Black', symbols: '♠ ♣', odds: '1.97', color: 'text-black' },
  ];

  const cards = ['J', 'Q', 'K', 'A'];

  const GradientButton = ({ name, odds, nation }) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() => openBetSlip(nation || name, odds, 'back', isMobile)}
      className="flex h-[55px] w-full items-center justify-center bg-gradient-to-r from-[#078dcc] to-[#293e50] px-2 text-center text-sm font-bold text-white shadow-md disabled:opacity-60 sm:h-[65px] sm:text-lg"
    >
      {name}
    </button>
  );

  return (
    <div className="w-full bg-[#f5f5f5] p-1">

      {/* Character Markets */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-5 md:grid-cols-3">
        {chars.map((char) => (
          <div key={char.key} className="min-w-0">
            <div className="mb-1 truncate text-center text-sm font-bold text-[#333] sm:text-lg">
              {char.key}.{char.name}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(`${char.key}.${char.name}`, char.back, 'back', isMobile)
                }
                className="flex h-[45px] items-center justify-center bg-[#72b9e8] text-base font-bold text-[#333] disabled:opacity-60 sm:h-[80px] sm:text-xl"
              >
                {isSuspended ? '-' : char.back}
              </button>

              <button
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(`${char.key}.${char.name}`, char.lay, 'lay', isMobile)
                }
                className="flex h-[45px] items-center justify-center bg-[#f5a5b8] text-base font-bold text-[#333] disabled:opacity-60 sm:h-[80px] sm:text-xl"
              >
                {isSuspended ? '-' : char.lay}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Odd + Dulha Dulhan + Barati */}
      <div className="mt-6 grid grid-cols-1 gap-2 md:grid-cols-[0.75fr_2.25fr]">

        {/* Odd */}
        <div className="border border-[#c8c8c8] p-1">
          <div className="mb-1 text-center text-lg font-bold text-[#333]">
            Odd
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSuspended}
              onClick={() => openBetSlip('Odd', '1.32', 'back', isMobile)}
              className="flex h-[55px] items-center justify-center bg-[#72b9e8] text-lg font-bold text-[#333]"
            >
              {isSuspended ? '-' : '1.32'}
            </button>

            <button
              type="button"
              disabled={isSuspended}
              onClick={() => openBetSlip('Even', '1.36', 'lay', isMobile)}
              className="flex h-[55px] items-center justify-center bg-[#f5a5b8] text-lg font-bold text-[#333]"
            >
              {isSuspended ? '-' : '1.36'}
            </button>
          </div>
        </div>

        {/* Dulha Dulhan / Barati */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="border border-[#c8c8c8] p-2">
            <div className="mb-1 text-center text-lg font-bold text-[#333]">
              1.97
            </div>
            <GradientButton
              name="Dulha Dulhan K-Q"
              odds="1.97"
            />
          </div>

          <div className="border border-[#c8c8c8] p-2">
            <div className="mb-1 text-center text-lg font-bold text-[#333]">
              1.97
            </div>
            <GradientButton
              name="Barati J-A"
              odds="1.97"
            />
          </div>
        </div>
      </div>

      {/* Suits + Cards */}
      <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">

        {/* Suits */}
        <div className="grid grid-cols-2 gap-2 border border-[#c8c8c8] p-2">
          {suits.map((suit) => (
            <div key={suit.name}>
              <div className="mb-1 text-center text-lg font-bold text-[#333]">
                {suit.odds}
              </div>

              <button
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(suit.name, suit.odds, 'back', isMobile)
                }
                className="flex h-[65px] w-full items-center justify-center bg-gradient-to-r from-[#078dcc] to-[#293e50] text-3xl shadow-md disabled:opacity-60"
              >
                <span className={suit.color}>{suit.symbols}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="flex min-h-[140px] flex-col items-center justify-center border border-[#c8c8c8] p-2">
          <div className="mb-3 text-center text-xl font-bold text-[#333]">
            3.75
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {cards.map((card) => (
              <button
                key={card}
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(`Card ${card}`, '3.75', 'back', isMobile)
                }
                className="flex h-[65px] w-[42px] flex-col items-center justify-between border-2 border-yellow-300 bg-white py-0.5 text-black disabled:opacity-60 sm:h-[82px] sm:w-[55px]"
              >
                <span className="text-2xl font-bold leading-none sm:text-4xl">
                  {card}
                </span>
                <span className="text-base leading-none sm:text-xl">
                  ♠ ♦
                </span>
                <span className="text-base leading-none sm:text-xl">
                  ♣ ♥
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// --------------------------------------------------------------------------
// Game: Unique Roulette (ourroullete)
// --------------------------------------------------------------------------
function TableOurroullete() {
  return <RouletteTable />;
}

// --------------------------------------------------------------------------
// Game: Mini Superover (superover3)
// --------------------------------------------------------------------------
function TableSuperover3({ isMobile, isSuspended, openBetSlip }) {
  const outcomes = [
    { label: '0 Runs (Dot)', odds: '2.50' },
    { label: '1 Run', odds: '2.20' },
    { label: '2 Runs', odds: '4.50' },
    { label: '3 Runs', odds: '12.00' },
    { label: '4 Runs (Boundary)', odds: '5.50' },
    { label: '6 Runs (Sixer)', odds: '8.00' },
    { label: 'Wicket', odds: '4.00' },
    { label: 'Wide / No Ball', odds: '6.00' },
  ];

  return (
    <div className="casino-table cricket superover3">
      <div className="casino-table-box text-center p-3 border rounded">
        <h5 className="fw-bold mb-3">Mini Superover - Live Ball Prediction</h5>
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
          {outcomes.map((o) => (
            <div
              key={o.label}
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip(o.label, o.odds, 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '110px', textAlign: 'center' }}
            >
              <div className="casino-odds">{isSuspended ? '-' : o.odds}</div>
              <div className="fw-bold small">{o.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Goal (goal)
// --------------------------------------------------------------------------
function TableGoal({ isMobile, isSuspended, openBetSlip, markets }) {
  const quadrants = [
    { key: 'TL', name: 'Top Left', odds: '4.5' },
    { key: 'TR', name: 'Top Right', odds: '4.5' },
    { key: 'BL', name: 'Bottom Left', odds: '4.5' },
    { key: 'BR', name: 'Bottom Right', odds: '4.5' },
    { key: 'C', name: 'Center', odds: '5.0' },
  ];
  return (
    <div className="casino-table goal">
      <div className="casino-table-box">
        <div className="d-flex justify-content-between gap-3 mb-3">
          <div className="w-50 p-3 border rounded text-center">
            <div className="h5 fw-bold text-success">Goal</div>
            <OddsBox nation="Goal" odds={markets?.goal?.back || '1.98'} type="back" className="w-100 mt-2" />
          </div>
          <div className="w-50 p-3 border rounded text-center">
            <div className="h5 fw-bold text-danger">No Goal</div>
            <OddsBox nation="No Goal" odds={markets?.noGoal?.back || '1.98'} type="back" className="w-100 mt-2" />
          </div>
        </div>

        <div className="casino-odds w-100 text-center fw-bold mb-2">Target Penalty Quadrant</div>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {quadrants.map((q) => (
            <div
              key={q.key}
              className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip(`Quadrant ${q.name}`, q.odds, 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '90px', textAlign: 'center' }}
            >
              <div className="casino-odds">{isSuspended ? '-' : q.odds}</div>
              <div className="fw-bold">{q.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: ANDAR BAHAR 150 cards (ab4)
// --------------------------------------------------------------------------

function TableAb4({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
  ];

  const fallbackOdds = [
    "11", "6", "10", "10", "11", "10", "7",
    "10", "11", "10", "10", "8", "8"
  ];

  const renderCard = (card, index, type) => {
    const odds =
      markets?.[type.toLowerCase()]?.cards?.[index]?.back ??
      fallbackOdds[index];

    return (
      <button
        key={`${type}-${card}`}
        type="button"
        disabled={isSuspended}
        onClick={() =>
          openBetSlip(`${type} ${card}`, odds, "back", isMobile)
        }
        className="flex w-[48px] shrink-0 flex-col items-center gap-1 border-0 bg-transparent p-0 disabled:cursor-not-allowed sm:w-[52px]"
      >
        <span className="h-[20px] text-[13px] font-bold leading-5 text-[#333] sm:text-[15px]">
          {isSuspended ? "-" : odds}
        </span>

        {type === "ANDAR" ? (
          <div className="flex h-[64px] w-full flex-col justify-between border-2 border-yellow-300 bg-white px-1 py-0.5">
            <span className="text-left text-[27px] font-bold leading-[27px] text-black">
              {card}
            </span>

            <div className="flex justify-between text-[18px] font-bold leading-[17px]">
              <span className="text-black">♠</span>
              <span className="text-red-600">♦</span>
            </div>

            <div className="flex justify-between text-[18px] font-bold leading-[17px]">
              <span className="text-black">♣</span>
              <span className="text-red-600">♥</span>
            </div>
          </div>
        ) : (
          <div
            className="h-[76px] w-full border-2 border-yellow-300 p-[3px]"
            style={{
              backgroundColor: "#fff",
              backgroundImage:
                "radial-gradient(#2879c5 1px, transparent 1px), radial-gradient(#2879c5 1px, transparent 1px)",
              backgroundPosition: "0 0, 3px 3px",
              backgroundSize: "6px 6px",
            }}
          >
            <div className="h-full w-full border border-[#7ba8d0]" />
          </div>
        )}
      </button>
    );
  };

  const renderRow = (type) => (
    <div
      className={`grid grid-cols-[100px_minmax(0,1fr)] border-2 border-black sm:grid-cols-[200px_minmax(0,1fr)] ${
        type === "ANDAR" ? "min-h-[115px] bg-[#fca3a3] sm:min-h-[128px]" : "min-h-[115px] bg-[#ffe59a] sm:min-h-[128px]"
      }`}
    >
      <div className="flex items-center justify-center border-r-2 border-black">
        <span className="text-[17px] font-bold text-[#333] sm:text-[21px]">
          {type}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-center gap-1 overflow-x-auto px-1 py-2 sm:gap-2 sm:px-2">
        {cards.map((card, index) => renderCard(card, index, type))}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-0 bg-white">
      {renderRow("ANDAR")}
      {renderRow("BAHAR")}
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Lucky 15 Cricket (lucky15)
// --------------------------------------------------------------------------
function TableLucky15({ isMobile, isSuspended, openBetSlip, markets }) {
  const cricketRuns = [0, 1, 2, 3, 4, 6];
  return (
    <div className="casino-table cricket20 lucky15">
      <div className="casino-table-box">
        <div className="casino-table-left-box w-100">
          <div className="casino-table-header">
            <div className="casino-nation-detail">15-Ball Cricket Match Odds</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Team A (15 Balls)</div></div>
              <OddsBox nation="Team A" odds={markets?.playerA?.back || '1.98'} type="back" />
              <OddsBox nation="Team A" odds={markets?.playerA?.lay || '2.02'} type="lay" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Team B (15 Balls)</div></div>
              <OddsBox nation="Team B" odds={markets?.playerB?.back || '1.98'} type="back" />
              <OddsBox nation="Team B" odds={markets?.playerB?.lay || '2.02'} type="lay" />
            </div>
          </div>
        </div>

        <div className="casino-table-box mt-3 w-100">
          <div className="casino-odds w-100 text-center fw-bold mb-2">Next Ball Outcome (Runs / Wicket / Extras)</div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cricketRuns.map((r) => (
              <div
                key={r}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`${r} Runs`, r === 4 ? '5.5' : r === 6 ? '8.0' : '3.2', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '60px', textAlign: 'center' }}
              >
                <div className="casino-odds">{isSuspended ? '-' : (r === 4 ? '5.5' : r === 6 ? '8.0' : '3.2')}</div>
                <div className="fw-bold">{r} Runs</div>
              </div>
            ))}
            <div
              className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Wicket', '4.5', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '60px', textAlign: 'center', background: '#ffebee' }}
            >
              <div className="casino-odds text-danger">{isSuspended ? '-' : '4.5'}</div>
              <div className="fw-bold text-danger">Wicket</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Super Over 2 (superover2)
// --------------------------------------------------------------------------
function TableSuperover2({ isMobile, isSuspended, openBetSlip }) {
  const outcomes = [
    { label: '0 Runs (Dot)', odds: '2.50' },
    { label: '1 Run', odds: '2.20' },
    { label: '2 Runs', odds: '4.50' },
    { label: '3 Runs', odds: '12.00' },
    { label: '4 Runs (Boundary)', odds: '5.50' },
    { label: '6 Runs (Sixer)', odds: '8.00' },
    { label: 'Wicket', odds: '4.00' },
    { label: 'Wide / No Ball', odds: '6.00' },
  ];

  const columns = [
    outcomes.slice(0, 4),
    outcomes.slice(4, 8),
  ];

  return (
    <div className="w-full overflow-hidden border border-[#d1d5db] bg-white">
      {/* Header */}
      <div className="flex h-[42px] items-center bg-[#4b5b6b] px-3">
        <h3 className="text-sm font-bold text-white sm:text-base">
          Super Over 2 - Live Ball Prediction
        </h3>
      </div>

      {/* Market Columns */}
      <div className="grid grid-cols-2 gap-2 bg-[#f1f2f4] p-2">
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="min-w-0 overflow-hidden border border-[#d1d5db]"
          >
            {/* Column Header */}
            <div className="grid grid-cols-[minmax(0,1fr)_85px]">
              <div className="flex h-[40px] items-center bg-[#4b5b6b] px-2 text-sm font-bold text-white">
                Market
              </div>

              <div className="flex h-[40px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#253746]">
                Back
              </div>
            </div>

            {/* Outcome Rows */}
            {column.map((outcome, index) => (
              <div
                key={outcome.label}
                className={`grid grid-cols-[minmax(0,1fr)_85px] ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#f5f6f7]'
                }`}
              >
                <div className="flex h-[48px] min-w-0 items-center border-t border-[#d1d5db] px-2 text-xs font-semibold text-[#343a40] sm:text-sm">
                  {outcome.label}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openBetSlip(
                      outcome.label,
                      outcome.odds,
                      'back',
                      isMobile
                    )
                  }
                  className="flex h-[48px] items-center justify-center border-t border-l border-white bg-[#72b9e8] text-sm font-bold text-[#253746] transition-colors hover:bg-[#5da9dc] sm:text-base"
                >
                  {outcome.odds}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Queen Top Open Teenpatti (teen41)
// --------------------------------------------------------------------------
function TableTeen41({ isMobile, isSuspended, openBetSlip, markets }) {
  const playerA = {
    back: markets?.playerA?.back || '1.98',
    lay: markets?.playerA?.lay || '2.02',
  };

  const playerB = {
    back: markets?.playerB?.back || '1.6',
    lay: markets?.playerB?.lay || '1.65',
  };

  const sideMarkets = [
    {
      name: 'Player B Under 21',
      odds: markets?.under21?.back || '2.45',
    },
    {
      name: 'Player B Over 21',
      odds: markets?.over21?.back || '1.69',
    },
  ];

  const LockIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-white"
      aria-hidden="true"
    >
      <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z" />
    </svg>
  );

  const OddsButton = ({ nation, odds, type }) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() => openBetSlip(nation, odds, type, isMobile)}
      className={`flex h-[48px] min-w-0 items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
        type === 'back'
          ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
          : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
      } ${
        isSuspended
          ? 'cursor-not-allowed bg-[#414b54] opacity-100'
          : 'cursor-pointer'
      }`}
    >
      {isSuspended ? <LockIcon /> : odds}
    </button>
  );

  const PlayerSection = ({ name, data }) => (
    <div className="min-w-0 overflow-hidden border border-[#c9c9c9]">
      {/* Header */}
      <div className="grid h-[48px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-[#c9c9c9]">
        <div className="col-span-1 flex items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          {name}
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base">
          Back
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base">
          Lay
        </div>
      </div>

      {/* Main Market */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          Main
        </div>

        <OddsButton
          nation={name}
          odds={data.back}
          type="back"
        />

        <OddsButton
          nation={name}
          odds={data.lay}
          type="lay"
        />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        {/* Player A */}
        <PlayerSection name="Player A" data={playerA} />

        {/* Player B + Side Bets */}
        <div className="min-w-0 space-y-2">
          <PlayerSection name="Player B" data={playerB} />

          {/* Under 21 / Over 21 */}
          <div className="grid grid-cols-2 gap-2">
            {sideMarkets.map((market) => (
              <div
                key={market.name}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_72px] overflow-hidden border border-[#c9c9c9]"
              >
                <div className="flex min-h-[48px] items-center bg-[#f1f1f1] px-2 text-xs font-bold text-[#333333] sm:text-sm">
                  {market.name}
                </div>

                <OddsButton
                  nation={market.name}
                  odds={market.odds}
                  type="back"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Jack Top Open Teenpatti (teen42)
// --------------------------------------------------------------------------
function TableTeen42({ isMobile, isSuspended, openBetSlip, markets }) {
  const playerA = {
    back: markets?.playerA?.back || '1.98',
    lay: markets?.playerA?.lay || '2.02',
  };

  const playerB = {
    back: markets?.playerB?.back || '1.6',
    lay: markets?.playerB?.lay || '1.65',
  };

  const sideMarkets = [
    {
      name: 'Player B Under 21',
      odds: markets?.under21?.back || '2.45',
    },
    {
      name: 'Player B Over 21',
      odds: markets?.over21?.back || '1.69',
    },
  ];

  const LockIcon = () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
      <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z" />
    </svg>
  );

  const OddsButton = ({ nation, odds, type }) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() => openBetSlip(nation, odds, type, isMobile)}
      className={`flex h-[48px] min-w-0 items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
        isSuspended
          ? type === 'back'
            ? 'cursor-not-allowed bg-[#414b54]'
            : 'cursor-not-allowed bg-[#5b4b4f]'
          : type === 'back'
            ? 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
            : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
      }`}
    >
      {isSuspended ? <LockIcon /> : odds}
    </button>
  );

  const PlayerSection = ({ name, data }) => (
    <div className="min-w-0 overflow-hidden border border-[#c9c9c9]">
      {/* Player Header */}
      <div className="grid h-[48px] grid-cols-[3fr_1fr_1fr] border-b border-[#c9c9c9]">
        <div className="flex items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          {name}
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base">
          Back
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base">
          Lay
        </div>
      </div>

      {/* Main Market */}
      <div className="grid grid-cols-[3fr_1fr_1fr]">
        <div className="flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          Main
        </div>

        <OddsButton
          nation={name}
          odds={data.back}
          type="back"
        />

        <OddsButton
          nation={name}
          odds={data.lay}
          type="lay"
        />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">

        {/* LEFT: Player A */}
        <div className="min-w-0">
          <PlayerSection name="Player A" data={playerA} />
        </div>

        {/* RIGHT: Player B + Under/Over */}
        <div className="min-w-0 space-y-2">
          <PlayerSection name="Player B" data={playerB} />

          <div className="grid grid-cols-2 gap-2">
            {sideMarkets.map((market) => (
              <div
                key={market.name}
                className="grid min-w-0 grid-cols-[minmax(0,3fr)_minmax(0,1fr)] overflow-hidden border border-[#c9c9c9]"
              >
                <div className="flex h-[48px] min-w-0 items-center bg-[#f1f1f1] px-2 text-xs font-bold text-[#333333] sm:text-base">
                  {market.name}
                </div>

                <OddsButton
                  nation={market.name}
                  odds={market.odds}
                  type="back"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Sic Bo2 (sicbo2)
// --------------------------------------------------------------------------
function TableSicbo2({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table sicbo">
      <div className="casino-table-box">
        <div className="sicbo-top d-flex justify-content-between mb-3 gap-2">
          <div className="sicbo-top-box sicbo-title-box w-100">Small 4-10 (1:1) Lose to Any Triple</div>
          <div className="sicbo-top-box sicbo-title-box w-100">Specific Triple (150:1)</div>
          <div className="sicbo-top-box sicbo-title-box w-100">Big 11-17 (1:1) Lose to Any Triple</div>
        </div>

        <div className="sicbo-middle d-flex justify-content-between gap-3 mb-3">
          <div
            className={`sicbo-square-box w-50 p-3 text-center rounded border ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Small (4-10)', '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className="h4 fw-bold">Small</div>
            <div className="sicbo-box-value">4 - 10</div>
            <div className="casino-odds">{isSuspended ? '-' : '1.98'}</div>
          </div>

          <div
            className={`sicbo-square-box w-50 p-3 text-center rounded border ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Big (11-17)', '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className="h4 fw-bold">Big</div>
            <div className="sicbo-box-value">11 - 17</div>
            <div className="casino-odds">{isSuspended ? '-' : '1.98'}</div>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-2">
          <div
            className={`sicbo-square-box p-2 text-center rounded border ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Any Triple', '31.0', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '120px' }}
          >
            <div className="fw-bold">Any Triple</div>
            <div className="casino-odds">{isSuspended ? '-' : '31.0'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Instant Teenpatti 3.0 (teen33)
// --------------------------------------------------------------------------
function TableTeen33({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
      suspended: markets?.playerA?.isSuspended ?? true,
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.86',
      lay: markets?.playerB?.lay || '1.91',
      suspended: markets?.playerB?.isSuspended ?? isSuspended,
    },
  ];

  const LockIcon = () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
      <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z" />
    </svg>
  );

  const PlayerSection = ({ player }) => (
    <div className="min-w-0 overflow-hidden border border-[#c9c9c9]">
      {/* Header Row */}
      <div className="grid h-[48px] grid-cols-[3fr_1fr_1fr]">
        <div className="flex items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          {player.name}
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base">
          Back
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base">
          Lay
        </div>
      </div>

      {/* Main Row */}
      <div className="grid grid-cols-[3fr_1fr_1fr]">
        <div className="flex h-[48px] items-center border-t border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          Main
        </div>

        <button
          type="button"
          disabled={player.suspended}
          onClick={() =>
            openBetSlip(player.name, player.back, 'back', isMobile)
          }
          className={`flex h-[48px] items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
            player.suspended
              ? 'cursor-not-allowed bg-[#414b54]'
              : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
          }`}
        >
          {player.suspended ? <LockIcon /> : player.back}
        </button>

        <button
          type="button"
          disabled={player.suspended}
          onClick={() =>
            openBetSlip(player.name, player.lay, 'lay', isMobile)
          }
          className={`flex h-[48px] items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
            player.suspended
              ? 'cursor-not-allowed bg-[#5b4b4f]'
              : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
          }`}
        >
          {player.suspended ? <LockIcon /> : player.lay}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Player A and Player B */}
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => (
          <PlayerSection key={player.name} player={player} />
        ))}
      </div>

      {/* Bottom Message */}
      <div className="flex min-h-[42px] items-center justify-center bg-[#f8f8f8] px-2 text-center">
        <span className="text-sm font-bold text-[#16839a] sm:text-base">
          Play Our New Game Premium Teenpatti 1 Day
        </span>
      </div>

      {/* Bottom Strip */}
      <div className="h-[16px] w-full bg-[#4b5b6b]" />
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Sic Bo (sicbo)
// --------------------------------------------------------------------------
function TableSicbo({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table sicbo">
      <div className="casino-table-box">
        <div className="sicbo-top d-flex justify-content-between mb-3 gap-2">
          <div className="sicbo-top-box sicbo-title-box w-100">Small 4-10 (1:1) Lose to Any Triple</div>
          <div className="sicbo-top-box sicbo-title-box w-100">Specific Triple (150:1)</div>
          <div className="sicbo-top-box sicbo-title-box w-100">Big 11-17 (1:1) Lose to Any Triple</div>
        </div>

        <div className="sicbo-middle d-flex justify-content-between gap-3 mb-3">
          <div
            className={`sicbo-square-box w-50 p-3 text-center rounded border ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Small (4-10)', '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className="h4 fw-bold">Small</div>
            <div className="sicbo-box-value">4 - 10</div>
            <div className="casino-odds">{isSuspended ? '-' : '1.98'}</div>
          </div>

          <div
            className={`sicbo-square-box w-50 p-3 text-center rounded border ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Big (11-17)', '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className="h4 fw-bold">Big</div>
            <div className="sicbo-box-value">11 - 17</div>
            <div className="casino-odds">{isSuspended ? '-' : '1.98'}</div>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-2">
          <div
            className={`sicbo-square-box p-2 text-center rounded border ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Any Triple', '31.0', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '120px' }}
          >
            <div className="fw-bold">Any Triple</div>
            <div className="casino-odds">{isSuspended ? '-' : '31.0'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Ball by Ball (ballbyball)
// --------------------------------------------------------------------------
function TableBallbyball({ isMobile, isSuspended, openBetSlip }) {
  const outcomes = [
    { label: '0 Runs (Dot)', odds: '2.50' },
    { label: '1 Run', odds: '2.20' },
    { label: '2 Runs', odds: '4.50' },
    { label: '3 Runs', odds: '12.00' },
    { label: '4 Runs (Boundary)', odds: '5.50' },
    { label: '6 Runs (Sixer)', odds: '8.00' },
    { label: 'Wicket', odds: '4.00' },
    { label: 'Wide / No Ball', odds: '6.00' },
  ];

  return (
    <div className="casino-table cricket ballbyball">
      <div className="casino-table-box text-center p-3 border rounded">
        <h5 className="fw-bold mb-3">Ball by Ball - Live Ball Prediction</h5>
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
          {outcomes.map((o) => (
            <div
              key={o.label}
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip(o.label, o.odds, 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '110px', textAlign: 'center' }}
            >
              <div className="casino-odds">{isSuspended ? '-' : o.odds}</div>
              <div className="fw-bold small">{o.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Instant Teenpatti 2.0 (teen32)
// --------------------------------------------------------------------------
function TableTeen32({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.81',
      lay: markets?.playerA?.lay || '1.86',
      suspended: isSuspended || (markets?.playerA?.isSuspended ?? false),
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '0',
      lay: markets?.playerB?.lay || '0',
      suspended: isSuspended || (markets?.playerB?.isSuspended ?? true),
    },
  ];

  const LockIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-white"
      aria-hidden="true"
    >
      <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z" />
    </svg>
  );

  const PlayerSection = ({ player }) => (
    <div className="min-w-0 overflow-hidden border border-[#c9c9c9]">
      {/* Header */}
      <div className="grid h-[48px] grid-cols-[3fr_1fr_1fr]">
        <div className="flex items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          {player.name}
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base">
          Back
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base">
          Lay
        </div>
      </div>

      {/* Main Market */}
      <div className="relative grid grid-cols-[3fr_1fr_1fr]">
        <div className="flex h-[48px] items-center border-t border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          Main
        </div>

        <button
          type="button"
          disabled={player.suspended}
          onClick={() =>
            openBetSlip(player.name, player.back, 'back', isMobile)
          }
          className={`flex h-[48px] items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
            player.suspended
              ? 'cursor-not-allowed bg-[#414b54]'
              : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
          }`}
        >
          {player.suspended ? (
            <span className="opacity-30">0</span>
          ) : (
            player.back
          )}
        </button>

        <button
          type="button"
          disabled={player.suspended}
          onClick={() =>
            openBetSlip(player.name, player.lay, 'lay', isMobile)
          }
          className={`flex h-[48px] items-center justify-center text-sm font-bold text-[#333333] sm:text-base ${
            player.suspended
              ? 'cursor-not-allowed bg-[#5b4b4f]'
              : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
          }`}
        >
          {player.suspended ? (
            <span className="opacity-30">0</span>
          ) : (
            player.lay
          )}
        </button>

        {player.suspended && (
          <div className="pointer-events-none absolute inset-y-0 left-[60%] right-0 flex items-center justify-center">
            <LockIcon />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        <PlayerSection player={players[0]} />
        <PlayerSection player={players[1]} />
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Teenpatti 1-day (teen)
// --------------------------------------------------------------------------
function TableTeen({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table teen">
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Nation</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player A</div></div>
              <OddsBox nation="Player A" odds={markets?.playerA?.back || '1.98'} type="back" />
              <OddsBox nation="Player A" odds={markets?.playerA?.lay || '2.02'} type="lay" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player B</div></div>
              <OddsBox nation="Player B" odds={markets?.playerB?.back || '1.98'} type="back" />
              <OddsBox nation="Player B" odds={markets?.playerB?.lay || '2.02'} type="lay" />
            </div>
          </div>
        </div>

        <div className="casino-table-right-box mt-3 mt-md-0">
          <div className="teenpatti20-other-oods">
            <div className="casino-table-header">
              <div className="casino-nation-detail">Side Bets</div>
              <div className="casino-odds-box back">Back</div>
            </div>
            <div className="casino-table-body">
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus A</div>
                <OddsBox nation="Pair Plus A" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus B</div>
                <OddsBox nation="Pair Plus B" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat A</div>
                <OddsBox nation="3 Baccarat A" odds="1.95" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat B</div>
                <OddsBox nation="3 Baccarat B" odds="1.95" type="back" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 20-20 Teenpatti (teen20)
// --------------------------------------------------------------------------

function TableTeen20({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      items: [
        { name: 'Player A', odds: markets?.playerA?.back || '1.98', type: 'back' },
        { name: '3 Baccarat A', odds: markets?.baccaratA?.back || '1.95', type: 'back' },
        { name: 'Total A', odds: markets?.totalA?.back || '2.0', type: 'back' },
        { name: 'Pair Plus A', odds: markets?.pairPlusA?.back || '2.0', type: 'back' },
      ],
    },
    {
      name: 'Player B',
      items: [
        { name: 'Player B', odds: markets?.playerB?.back || '1.98', type: 'back' },
        { name: '3 Baccarat B', odds: markets?.baccaratB?.back || '1.95', type: 'back' },
        { name: 'Total B', odds: markets?.totalB?.back || '2.0', type: 'back' },
        { name: 'Pair Plus B', odds: markets?.pairPlusB?.back || '2.0', type: 'back' },
      ],
    },
  ];

  const suitMarkets = [
    { name: 'Spades + Clubs', symbols: ['♠', '♣'] },
    { name: 'Hearts + Diamonds', symbols: ['♥', '♦'] },
    { name: 'Spades + Clubs B', symbols: ['♠', '♣'] },
    { name: 'Hearts + Diamonds B', symbols: ['♥', '♦'] },
  ];

  const results = Array.isArray(markets?.lastResult)
    ? markets.lastResult
    : ['A', 'A', 'A', 'A', 'B', 'A', 'B', 'A', 'A', 'B'];

  const LockIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7 text-white"
    >
      <path d="M7 8V6a5 5 0 0110 0v2h1a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1zm2 0h6V6a3 3 0 00-6 0v2zm3 4a2 2 0 00-1 3.73V18h2v-2.27A2 2 0 0012 12z" />
    </svg>
  );

  const OddsButton = ({ nation, odds, type = 'back' }) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() => {
        if (!isSuspended) {
          openBetSlip(nation, odds, type, isMobile);
        }
      }}
      className={`flex min-h-[60px] w-full items-center justify-center border border-white/50 transition-colors ${
        isSuspended
          ? 'cursor-not-allowed bg-[#414c56]'
          : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
      }`}
    >
      {isSuspended ? (
        <LockIcon />
      ) : (
        <span className="text-xl font-bold text-[#303b45]">
          {odds}
        </span>
      )}
    </button>
  );

  return (
    <div className="w-full min-w-0 bg-white">

      {/* PLAYER A AND PLAYER B */}
      <div className="grid grid-cols-1 gap-2 p-1 lg:grid-cols-2">

        {players.map((player) => (
          <section
            key={player.name}
            className="min-w-0 overflow-hidden border border-[#cccccc] bg-[#f1f1f1]"
          >

            {/* Player Heading */}
            <div className="border-b border-[#cccccc] px-3 py-2">
              <h3 className="text-lg font-bold text-[#333333]">
                {player.name}
              </h3>
            </div>

            {/* Four Markets */}
            <div className="grid grid-cols-2">
              {player.items.map((item) => (
                <div
                  key={item.name}
                  className="min-w-0 border-b border-r border-[#cccccc]"
                >
                  <div className="flex min-h-[90px] items-center justify-center text-center">
                    <span className="text-sm font-bold text-[#333333] sm:text-base">
                      {item.name}
                    </span>
                  </div>

                  <OddsButton
                    nation={item.name}
                    odds={item.odds}
                    type={item.type}
                  />
                </div>
              ))}
            </div>

          </section>
        ))}

      </div>

      {/* SUIT BETS */}
      <div className="grid grid-cols-1 gap-2 p-1 sm:grid-cols-2 lg:grid-cols-4">

        {suitMarkets.map((item) => (
          <button
            key={item.name}
            type="button"
            disabled={isSuspended}
            onClick={() => {
              if (!isSuspended) {
                openBetSlip(item.name, '2.0', 'back', isMobile);
              }
            }}
            className={`flex min-h-[72px] items-center justify-between gap-2 border border-[#c9c9c9] px-3 ${
              isSuspended
                ? 'cursor-not-allowed bg-[#414c56]'
                : 'cursor-pointer bg-[#414c56] hover:bg-[#35414b]'
            }`}
          >
            <span className="flex items-center gap-2 text-2xl">
              <span className="text-[#252525]">{item.symbols[0]}</span>
              <span className="text-[#252525]">{item.symbols[1]}</span>
            </span>

            {isSuspended ? (
              <LockIcon />
            ) : (
              <span className="text-lg font-bold text-white">0</span>
            )}
          </button>
        ))}

      </div>

      {/* LAST RESULT */}
      <section className="mt-1 w-full">

        <div className="flex items-center justify-between bg-[#4b5b6b] px-3 py-3">
          <h3 className="text-lg font-bold text-white">
            Last Result
          </h3>

          <button
            type="button"
            className="text-base font-bold text-white hover:text-blue-300"
          >
            View All
          </button>
        </div>

        <div className="flex min-h-[72px] flex-wrap items-center justify-end gap-2 px-2 py-2">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#315d38] sm:h-14 sm:w-14"
            >
              <span
                className={`text-xl font-extrabold ${
                  String(result).toUpperCase() === 'A'
                    ? 'text-[#ff4b25]'
                    : 'text-[#ffff00]'
                }`}
              >
                {result}
              </span>
            </div>
          ))}
        </div>

      </section>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Teenpatti Test (teen9)
// --------------------------------------------------------------------------
function TableTeen9({ isMobile, isSuspended, openBetSlip, markets }) {
  const columns = ['Tiger', 'Lion', 'Dragon'];

  const rows = [
    {
      name: 'Winner',
      key: 'winner',
      odds: ['2.94', '2.94', '2.94'],
    },
    {
      name: 'Pair',
      key: 'pair',
      odds: ['5', '5', '5'],
    },
    {
      name: 'Flush',
      key: 'flush',
      odds: ['12', '12', '12'],
    },
    {
      name: 'Straight',
      key: 'straight',
      odds: ['21', '21', '21'],
    },
    {
      name: 'Trio',
      key: 'trio',
      odds: ['126', '126', '126'],
    },
    {
      name: 'Straight Flush',
      key: 'straightFlush',
      odds: ['151', '151', '151'],
    },
  ];

  return (
    <div className="w-full overflow-hidden border border-[#c9c9c9]">
      {/* Column Headers */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="h-[48px] border-b border-[#c9c9c9] bg-[#f1f1f1]" />

        {columns.map((column) => (
          <div
            key={column}
            className="flex h-[48px] items-center justify-center border-b border-l border-[#c9c9c9] bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base"
          >
            {column}
          </div>
        ))}
      </div>

      {/* Market Rows */}
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-[2fr_1fr_1fr_1fr]"
        >
          {/* Market Name */}
          <div className="flex h-[48px] min-w-0 items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
            {row.name}
          </div>

          {/* Tiger, Lion, Dragon Odds */}
          {columns.map((column, index) => {
            const odds =
              markets?.[row.key]?.[column.toLowerCase()] ??
              row.odds[index];

            const marketName = `${row.name} ${column}`;

            return (
              <button
                key={column}
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(marketName, odds, 'back', isMobile)
                }
                className="flex h-[48px] min-w-0 items-center justify-center border-b border-l border-[#c9c9c9] bg-[#72b9e8] text-sm font-bold text-[#333333] transition-colors hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
              >
                {odds}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Teenpatti Open (teen8)
// --------------------------------------------------------------------------
function TableTeen8({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player 1',
      card: 'J ♣',
      odds: '1.98',
      pairPlus: 'Pair Plus 1',
      total: '1.98',
    },
    {
      name: 'Player 2',
      card: '9 ♠',
      odds: '1.98',
      pairPlus: 'Pair Plus 2',
      total: '1.98',
    },
    {
      name: 'Player 3',
      card: '7 ♣',
      odds: '1.98',
      pairPlus: 'Pair Plus 3',
      total: '1.98',
    },
    {
      name: 'Player 4',
      card: '',
      odds: '1.98',
      pairPlus: 'Pair Plus 4',
      total: '1.98',
    },
    {
      name: 'Player 5',
      card: '',
      odds: '1.98',
      pairPlus: 'Pair Plus 5',
      total: '1.98',
    },
    {
      name: 'Player 6',
      card: '',
      odds: '1.98',
      pairPlus: 'Pair Plus 6',
      total: '1.98',
    },
    {
      name: 'Player 7',
      card: '',
      odds: '1.98',
      pairPlus: 'Pair Plus 7',
      total: '1.98',
    },
    {
      name: 'Player 8',
      card: '',
      odds: '1.98',
      pairPlus: 'Pair Plus 8',
      total: '1.98',
    },
  ];

  const columns = ['Odds', 'Pair Plus', 'Total'];

  const LockIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-white"
      aria-hidden="true"
    >
      <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z" />
    </svg>
  );

  return (
    <div className="w-full overflow-x-auto border border-[#c9c9c9]">
      <div className="min-w-[600px]">

        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="h-[48px] border-b border-[#c9c9c9] bg-[#f1f1f1]" />

          {columns.map((column) => (
            <div
              key={column}
              className="flex h-[48px] items-center justify-center border-b border-l border-[#c9c9c9] bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base"
            >
              {column}
            </div>
          ))}
        </div>

        {/* Player Rows */}
        {players.map((player, index) => {
          const odds =
            markets?.[`player${index + 1}`]?.odds ??
            markets?.[`player${index + 1}`]?.back ??
            player.odds;

          const pairPlus =
            markets?.[`player${index + 1}`]?.pairPlus ??
            player.pairPlus;

          const total =
            markets?.[`player${index + 1}`]?.total ??
            player.total;

          const marketItems = [
            { name: `${player.name} Odds`, value: odds },
            { name: `${player.name} Pair Plus`, value: pairPlus },
            { name: `${player.name} Total`, value: total },
          ];

          return (
            <div
              key={player.name}
              className="grid grid-cols-[2fr_1fr_1fr_1fr]"
            >
              {/* Player Name + Card */}
              <div className="flex h-[48px] min-w-0 items-center gap-2 border-b border-[#c9c9c9] bg-[#f1f1f1] px-2">
                <span className="truncate text-sm font-bold text-[#333333] sm:text-base">
                  {player.name}
                </span>

                {player.card && (
                  <span className="flex h-[32px] min-w-[42px] items-center justify-center bg-[#cccccc] px-2 text-sm font-bold text-black">
                    {player.card}
                  </span>
                )}
              </div>

              {/* Odds / Pair Plus / Total */}
              {marketItems.map((market, marketIndex) => (
                <button
                  key={market.name}
                  type="button"
                  disabled={isSuspended}
                  onClick={() =>
                    openBetSlip(
                      market.name,
                      market.value,
                      'back',
                      isMobile
                    )
                  }
                  className={`relative flex h-[48px] min-w-0 items-center justify-center border-b border-l border-[#c9c9c9] text-sm font-bold text-[#333333] sm:text-base ${
                    isSuspended
                      ? 'cursor-not-allowed bg-[#414b54]'
                      : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
                  }`}
                >
                  {isSuspended ? (
                    <>
                      <span className="opacity-30">
                        {market.value}
                      </span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <LockIcon />
                      </span>
                    </>
                  ) : (
                    market.value
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Poker 1-Day (poker)
// --------------------------------------------------------------------------
function TablePoker({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '0',
      twoCards: markets?.playerA?.twoCardsBonus,
      sevenCards: markets?.playerA?.sevenCardsBonus,
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '0',
      twoCards: markets?.playerB?.twoCardsBonus,
      sevenCards: markets?.playerB?.sevenCardsBonus,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => (
          <div key={player.name} className="min-w-0">

            {/* Player Main Market */}
            <div className="grid grid-cols-[minmax(0,3fr)_1fr_1fr] overflow-hidden border border-[#c9c9c9]">
              <div className="flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
                {player.name}
              </div>

              <button
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(player.name, player.back, 'back', isMobile)
                }
                className="flex h-[48px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] disabled:opacity-60 sm:text-base"
              >
                {player.back}
              </button>

              <button
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(player.name, player.lay, 'lay', isMobile)
                }
                className="flex h-[48px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] hover:bg-[#ed91a7] disabled:opacity-60 sm:text-base"
              >
                {player.lay}
              </button>
            </div>

            {/* Bonus Markets */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSuspended || player.twoCards == null}
                onClick={() =>
                  openBetSlip(
                    `2 Cards Bonus ${player.name}`,
                    player.twoCards,
                    'back',
                    isMobile
                  )
                }
                className="flex h-[48px] min-w-0 items-center justify-center bg-[#72b9e8] px-1 text-xs font-bold text-[#333333] hover:bg-[#5da9dc] disabled:cursor-default disabled:opacity-100 sm:text-base"
              >
                2 Cards Bonus
              </button>

              <button
                type="button"
                disabled={isSuspended || player.sevenCards == null}
                onClick={() =>
                  openBetSlip(
                    `7 Cards Bonus ${player.name}`,
                    player.sevenCards,
                    'back',
                    isMobile
                  )
                }
                className="flex h-[48px] min-w-0 items-center justify-center bg-[#72b9e8] px-1 text-xs font-bold text-[#333333] hover:bg-[#5da9dc] disabled:cursor-default disabled:opacity-100 sm:text-base"
              >
                7 Cards Bonus
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 20-20 Poker (poker20)
// --------------------------------------------------------------------------
function TablePoker20({ isMobile, isSuspended, openBetSlip, markets }) {
  const marketNames = [
    'Winner',
    'One Pair',
    'Two Pair',
    'Three of a Kind',
    'Straight',
    'Flush',
    'Full House',
    'Four of a Kind',
    'Straight Flush',
  ];

  const defaultOdds = [
    '1.98',
    '2',
    '3.75',
    '16',
    '16',
    '26',
    '29',
    '251',
    '501',
  ];

  const players = [
    {
      name: 'Player A',
      key: 'playerA',
    },
    {
      name: 'Player B',
      key: 'playerB',
    },
  ];

  return (
    <div className="grid w-full grid-cols-2 gap-2">
      {players.map((player) => (
        <div key={player.key} className="min-w-0">
          <div className="grid grid-cols-3 gap-2">
            {marketNames.map((name, index) => {
              const odds =
                markets?.[player.key]?.[name]
                ?? markets?.[player.key]?.[
                  [
                    'winner',
                    'onePair',
                    'twoPair',
                    'threeOfAKind',
                    'straight',
                    'flush',
                    'fullHouse',
                    'fourOfAKind',
                    'straightFlush',
                  ][index]
                ]
                ?? defaultOdds[index];

              return (
                <div key={name} className="min-w-0">
                  {/* Market Name */}
                  <div className="flex h-[46px] items-center justify-center bg-[#f1f1f1] px-1 text-center text-xs font-bold text-[#333333] sm:text-sm">
                    {name}
                  </div>

                  {/* Odds Button */}
                  <button
                    type="button"
                    disabled={isSuspended}
                    onClick={() =>
                      openBetSlip(
                        `${player.name} ${name}`,
                        odds,
                        'back',
                        isMobile
                      )
                    }
                    className="mt-0.5 flex h-[48px] w-full items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#333333] transition-colors hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                  >
                    {odds}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Poker 6 Players (poker6)
// --------------------------------------------------------------------------
function TablePoker6({ isMobile, isSuspended, openBetSlip, markets }) {
  const [activeTab, setActiveTab] = React.useState('hands');

  const players = [
    { name: 'Player 1', cards: ['A', '♠', '9', '♣'], odds: '4.68' },
    { name: 'Player 2', cards: ['7', '♥', '7', '♦'], odds: '1.29' },
    { name: 'Player 3', cards: ['4', '♥', '7', '♠'], odds: '10.4' },
    { name: 'Player 4', cards: ['6', '♠', 'A', '♦'], odds: '0', suspended: true },
    { name: 'Player 5', cards: ['3', '♥', 'Q', '♣'], odds: '7.9' },
    { name: 'Player 6', cards: ['2', '♦', '2', '♥'], odds: '10.4' },
  ];

  const patterns = [
    { name: 'High Card', odds: '100' },
    { name: 'Pair', odds: '5.8' },
    { name: 'Two Pair', odds: '3.1' },
    { name: 'Three of a Kind', odds: '6.8' },
    { name: 'Straight', odds: '5.7' },
    { name: 'Flush', odds: '8.7' },
    { name: 'Full House', odds: '8.7' },
    { name: 'Four of a Kind', odds: '80' },
    { name: 'Straight Flush', odds: '100' },
  ];

  const getSuitColor = (suit) =>
    suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-black';

  const getPlayerOdds = (player, index) =>
    markets?.[`player${index + 1}`]?.back ?? player.odds;

  return (
    <div className="w-full overflow-hidden bg-[#f5f5f5]">

      {/* Tabs */}
      <div className="flex items-center border-b border-[#d1d1d1]">
        <button
          type="button"
          onClick={() => setActiveTab('hands')}
          className={`h-[48px] px-6 text-sm font-semibold sm:text-base ${
            activeTab === 'hands'
              ? 'bg-[#293d50] text-white'
              : 'bg-[#d1d1d1] text-black'
          }`}
        >
          Hands
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pattern')}
          className={`h-[48px] px-6 text-sm font-semibold sm:text-base ${
            activeTab === 'pattern'
              ? 'bg-[#293d50] text-white'
              : 'bg-[#d1d1d1] text-black'
          }`}
        >
          Pattern
        </button>
      </div>

      {/* HANDS TAB */}
      {activeTab === 'hands' && (
        <div className="grid grid-cols-2 gap-2 p-2">
          {players.map((player, index) => {
            const suspended = player.suspended;

            return (
              <button
                key={player.name}
                type="button"
                disabled={suspended}
                onClick={() =>
                  openBetSlip(
                    player.name,
                    getPlayerOdds(player, index),
                    'back',
                    isMobile
                  )
                }
                className={`relative flex h-[70px] min-w-0 items-center justify-between gap-2 px-2 text-left sm:h-[90px] sm:px-4 ${
                  suspended
                    ? 'bg-[#414d57]'
                    : 'bg-[#72b9e8] hover:bg-[#5da9dc]'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`shrink-0 text-sm font-bold sm:text-base ${
                      suspended ? 'text-[#333]' : 'text-[#293d50]'
                    }`}
                  >
                    {player.name}
                  </span>

                  <div className="flex shrink-0 items-center gap-1 bg-[#dedede] px-2 py-1 sm:gap-2 sm:px-3">
                    {[0, 2].map((cardIndex) => (
                      <span
                        key={cardIndex}
                        className="text-sm font-bold text-black sm:text-base"
                      >
                        {player.cards[cardIndex]}
                        <span className={getSuitColor(player.cards[cardIndex + 1])}>
                          {player.cards[cardIndex + 1]}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <span
                  className={`shrink-0 text-sm font-bold sm:text-base ${
                    suspended ? 'text-[#333]' : 'text-[#293d50]'
                  }`}
                >
                  {getPlayerOdds(player, index)}
                </span>

                {suspended && (
                  <span className="absolute inset-0 flex items-center justify-center bg-[#414d57]/80 text-2xl text-white">
                    🔒
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* PATTERN TAB */}
      {activeTab === 'pattern' && (
        <div className="grid grid-cols-3 gap-2 p-2">
          {patterns.map((pattern, index) => {
            const odds =
              markets?.patterns?.[
                [
                  'highCard',
                  'pair',
                  'twoPair',
                  'threeOfAKind',
                  'straight',
                  'flush',
                  'fullHouse',
                  'fourOfAKind',
                  'straightFlush',
                ][index]
              ]?.back ?? pattern.odds;

            return (
              <button
                key={pattern.name}
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(pattern.name, odds, 'back', isMobile)
                }
                className="flex h-[72px] min-w-0 flex-col items-center justify-center gap-1 bg-[#72b9e8] px-1 text-[#293d50] transition-colors hover:bg-[#5da9dc] sm:h-[90px]"
              >
                <span className="text-xs font-bold text-center sm:text-base">
                  {pattern.name}
                </span>

                <span className="text-sm font-bold sm:text-base">
                  {odds}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
// --------------------------------------------------------------------------
// Game: Baccarat (baccarat)
// --------------------------------------------------------------------------
function TableBaccarat({ isMobile, isSuspended, openBetSlip, markets }) {
  const topMarkets = [
    { name: 'Perfect Pair', odds: markets?.perfectPair?.back || '25:1' },
    { name: 'Big', odds: markets?.big?.back || '0.54:1' },
    { name: 'Small', odds: markets?.small?.back || '1.5:1' },
    { name: 'Either Pair', odds: markets?.eitherPair?.back || '5:1' },
  ];

  const mainMarkets = [
    {
      name: 'Player Pair',
      odds: markets?.playerPair?.back || '11:1',
      background: '#0868b5',
      shape: 'rounded-l-full',
    },
    {
      name: 'Player',
      odds: markets?.player?.back || '1:1',
      background: '#0868b5',
      cards: true,
    },
    {
      name: 'Tie',
      odds: markets?.tie?.back || '8:1',
      background: '#229632',
    },
    {
      name: 'Banker',
      odds: markets?.banker?.back || '1:1',
      background: '#b21e32',
      cards: true,
    },
    {
      name: 'Banker Pair',
      odds: markets?.bankerPair?.back || '11:1',
      background: '#b21e32',
      shape: 'rounded-r-full',
    },
  ];

  const handleBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  return (
    <div className="w-full overflow-hidden border border-[#d1d1d1] bg-[#f1f1f1] p-1">

      {/* TOP SECTION */}
      <div className="grid grid-cols-[190px_minmax(0,1fr)] gap-2">

        {/* Statistics */}
        <div className="flex min-w-0 flex-col items-center justify-start">
          <div className="text-xl font-medium text-[#333]">
            Statistics
          </div>

          <div className="flex w-full items-center justify-center gap-3">
            {/* Pie Chart */}
            <div
              className="relative h-[130px] w-[130px] shrink-0 rounded-full"
              style={{
                background:
                  'conic-gradient(#0871bd 0% 49%, #b51e35 49% 89%, #229632 89% 100%)',
              }}
            >
              <span className="absolute left-[65%] top-[48%] text-xs font-bold text-white">
                49%
              </span>
              <span className="absolute left-[15%] top-[65%] text-xs font-bold text-white">
                40%
              </span>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-1 text-xs text-[#333]">
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-[#0871bd]" />
                Player
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-[#b51e35]" />
                Banker
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-[#229632]" />
                Tie
              </div>
            </div>
          </div>
        </div>

        {/* Top Bonus Markets */}
        <div className="grid grid-cols-4 gap-2">
          {topMarkets.map((market) => (
            <button
              key={market.name}
              type="button"
              disabled={isSuspended}
              onClick={() => handleBet(market.name, market.odds)}
              className="flex h-[85px] min-w-0 flex-col items-center justify-center gap-2 bg-[#2c4052] px-1 text-center text-white hover:bg-[#354f65] disabled:opacity-60"
            >
              <span className="text-xs font-semibold sm:text-base">
                {market.name}
              </span>
              <span className="text-sm font-bold sm:text-base">
                {market.odds}
              </span>
            </button>
          ))}
        </div>
      </div>

   <div className="mt-3 grid w-full grid-cols-[0.85fr_1.3fr_1.3fr_1.3fr_0.85fr] gap-2">

  {/* Player Pair */}
  <div
    onClick={() => openBetSlip('Player Pair', '11.0', 'back', isMobile)}
    className="flex h-[90px] cursor-pointer flex-col items-center justify-center bg-[#096bb5] px-1 text-center text-white"
    style={{ borderRadius: '45px 0 0 45px' }}
  >
    <span className="text-base font-bold sm:text-lg">Player Pair</span>
    <span className="text-base font-bold sm:text-lg">11:1</span>
  </div>

  {/* Player */}
  <div
    onClick={() => openBetSlip('Player', '1.0', 'back', isMobile)}
    className="flex h-[90px] cursor-pointer flex-col justify-center bg-[#096bb5] px-3 text-white"
  >
    <span className="text-base font-bold sm:text-lg">Player</span>
    <span className="text-base font-bold sm:text-lg">1:1</span>
    <div className="mt-1 flex gap-2">
      <div className="h-[28px] w-[23px] border-2 border-yellow-300 bg-[#72b9e8]" />
      <div className="h-[28px] w-[23px] border-2 border-yellow-300 bg-[#72b9e8]" />
    </div>
  </div>

  {/* Tie */}
  <div
    onClick={() => openBetSlip('Tie', '8.0', 'back', isMobile)}
    className="flex h-[90px] cursor-pointer flex-col items-center justify-center bg-[#219638] text-center text-white"
  >
    <span className="text-base font-bold sm:text-lg">Tie</span>
    <span className="text-base font-bold sm:text-lg">8:1</span>
  </div>

  {/* Banker */}
  <div
    onClick={() => openBetSlip('Banker', '1.0', 'back', isMobile)}
    className="flex h-[90px] cursor-pointer flex-col justify-center bg-[#b51e32] px-3 text-white"
  >
    <span className="text-base font-bold sm:text-lg">Banker</span>
    <span className="text-base font-bold sm:text-lg">1:1</span>
    <div className="mt-1 flex gap-2">
      <div className="h-[28px] w-[23px] border-2 border-yellow-300 bg-[#72b9e8]" />
      <div className="h-[28px] w-[23px] border-2 border-yellow-300 bg-[#72b9e8]" />
    </div>
  </div>

  {/* Banker Pair */}
  <div
    onClick={() => openBetSlip('Banker Pair', '11.0', 'back', isMobile)}
    className="flex h-[90px] cursor-pointer flex-col items-center justify-center bg-[#b51e32] px-1 text-center text-white"
    style={{ borderRadius: '0 45px 45px 0' }}
  >
    <span className="text-base font-bold sm:text-lg">Banker Pair</span>
    <span className="text-base font-bold sm:text-lg">11:1</span>
  </div>

</div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Baccarat 2 (baccarat2)
// --------------------------------------------------------------------------
function TableBaccarat2({ isMobile, isSuspended, openBetSlip, markets }) {
  const scoreMarkets = [
    { name: 'Score 1-4', odds: '7.5:1' },
    { name: 'Score 5-6', odds: '4:1' },
    { name: 'Score 7', odds: '4.5:1' },
    { name: 'Score 8', odds: '3:1' },
    { name: 'Score 9', odds: '2.5:1' },
  ];

  const bottomMarkets = [
    {
      name: 'Player Pair',
      odds: '11:1',
      color: '#096bb5',
      radius: '60px 0 0 60px',
    },
    {
      name: 'Player',
      odds: '1:1',
      color: '#096bb5',
      cards: true,
    },
    {
      name: 'Tie',
      odds: '8:1',
      color: '#219638',
    },
    {
      name: 'Banker',
      odds: '1:1',
      color: '#b51e32',
      cards: true,
    },
    {
      name: 'Banker Pair',
      odds: '11:1',
      color: '#b51e32',
      radius: '0 60px 60px 0',
    },
  ];

  const getOdds = (name) => {
    if (name === 'Player') return markets?.player?.back || '1.98';
    if (name === 'Tie') return markets?.tie?.back || '9.0';
    if (name === 'Banker') return markets?.banker?.back || '1.95';
    return '11.0';
  };

  return (
    <div className="w-full bg-[#f1f1f1] p-2">
      {/* Top Section */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        
        {/* Statistics Section (Left Side) */}
        <div className="flex w-full shrink-0 items-center gap-4 px-2 py-1 lg:w-[260px]">
          <div className="flex flex-col items-center">
            <div className="text-xl font-semibold text-[#333]">
              Statistics
            </div>

            {/* Pie Chart with Inner Cutout */}
            <div className="relative mt-2 h-[105px] w-[105px]">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'conic-gradient(#0874bd 0% 49%, #b51e32 49% 89%, #219638 89% 100%)',
                }}
              />
              {/* White Center Cutout */}
              <div className="absolute inset-0 m-auto h-[65px] w-[65px] rounded-full bg-[#f1f1f1]" />
              
              {/* Percentage Labels */}
              <span className="absolute left-[55%] top-[40%] text-[10px] font-bold text-white">49%</span>
              <span className="absolute left-[25%] top-[60%] text-[10px] font-bold text-white">46%</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1.5 text-sm font-medium text-[#333]">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#0874bd]" />
              Player
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#b51e32]" />
              Banker
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#219638]" />
              Tie
            </div>
          </div>
        </div>

        {/* Score Odds (Right Side) */}
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {scoreMarkets.map((item) => (
            <button
              key={item.name}
              type="button"
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(item.name, item.odds, 'back', isMobile)
              }
              className="flex h-[75px] flex-col items-center justify-center bg-[#293e50] text-center text-white disabled:opacity-60"
            >
              <span className="text-base font-semibold sm:text-lg">
                {item.name}
              </span>
              <span className="mt-1 text-base sm:text-lg">
                {item.odds}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Betting Section (Bottom) */}
      <div className="mt-3 grid grid-cols-[1.1fr_1.3fr_1.3fr_1.3fr_1.1fr] gap-2">

        {bottomMarkets.map((item) => (
          <button
            key={item.name}
            type="button"
            disabled={isSuspended}
            onClick={() =>
              openBetSlip(
                item.name,
                getOdds(item.name),
                'back',
                isMobile
              )
            }
            className="flex h-[90px] min-w-0 cursor-pointer flex-col justify-center px-3 text-white disabled:opacity-60 sm:h-[105px] sm:px-4"
            style={{
              backgroundColor: item.color,
              borderRadius: item.radius || '0',
              textAlign: item.cards ? 'left' : 'center',
              alignItems: item.cards ? 'flex-start' : 'center',
            }}
          >
            <span className="text-sm font-semibold leading-tight sm:text-lg">
              {item.name}
            </span>

            <span className="text-sm font-semibold leading-tight sm:text-lg">
              {item.odds}
            </span>

            {/* Card Graphics for Player & Banker */}
            {item.cards && (
              <div className="mt-1 flex gap-1.5">
                {/* First Card */}
                <div className="flex h-[30px] w-[22px] items-center justify-center border-[2px] border-yellow-300 bg-[#e4e4e4] shadow-sm sm:h-[35px] sm:w-[26px]">
                  <div className="h-3 w-2 border border-blue-400 bg-blue-100 sm:h-4 sm:w-3"></div>
                </div>
                {/* Second Card */}
                <div className="flex h-[30px] w-[22px] items-center justify-center border-[2px] border-yellow-300 bg-[#e4e4e4] shadow-sm sm:h-[35px] sm:w-[26px]">
                  <div className="h-3 w-2 border border-blue-400 bg-blue-100 sm:h-4 sm:w-3"></div>
                </div>
              </div>
            )}
          </button>
        ))}

      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 20-20 Dragon Tiger (dt20)
// --------------------------------------------------------------------------
function TableDt20({ isMobile, isSuspended, openBetSlip, markets }) {
  const topMarkets = [
    { name: 'Dragon', odds: markets?.dragon?.back || '1.98', flex: 'flex-[2.5]' },
    { name: 'Tie', odds: markets?.tie?.back || '11', flex: 'flex-1' },
    { name: 'Tiger', odds: markets?.tiger?.back || '1.98', flex: 'flex-[2.5]' },
    { name: 'Pair', odds: markets?.pair?.back || '12', flex: 'flex-[2.5]' },
  ];

  const sideMarkets = [
    { name: 'Even', odds: '2.10' },
    { name: 'Odd', odds: '1.79' },
    { name: 'Red Suits', odds: '1.95', label: '♥ ♦' },
    { name: 'Black Suits', odds: '1.95', label: '♠ ♣' },
  ];

  const placeBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  const buttonClass =
    'w-full min-h-[48px] md:min-h-[86px] flex items-center justify-center bg-gradient-to-r from-[#078bc5] to-[#293d50] text-white text-lg md:text-2xl font-bold shadow-md hover:brightness-105 disabled:opacity-60';

  const renderSide = (side) => (
    <div className="min-w-0 bg-[#f1f1f1] p-2 md:p-3">
      <h3 className="text-center font-bold text-xl md:text-3xl mb-3">
        {side.toUpperCase()}
      </h3>

      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {sideMarkets.map((market) => (
          <div key={`${side}-${market.name}`} className="min-w-0">
            <div className="text-center font-bold text-base md:text-2xl mb-1">
              {market.odds}
            </div>

            <button
              type="button"
              disabled={isSuspended}
              onClick={() =>
                placeBet(`${side} ${market.name}`, market.odds)
              }
              className={`${buttonClass} ${
                market.label ? 'text-2xl md:text-4xl' : ''
              }`}
            >
              {market.label ? (
                <span
                  className={
                    market.name === 'Red Suits'
                      ? 'text-red-500'
                      : 'text-black'
                  }
                >
                  {market.label}
                </span>
              ) : (
                market.name
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#f5f5f5] p-1 md:p-2 space-y-3">

      {/* Dragon / Tie / Tiger / Pair */}
      <div className="flex items-end gap-1.5 md:gap-2">
        {topMarkets.map((market, index) => (
          <div
            key={market.name}
            className={`${market.flex} min-w-0 ${
              index === 3 ? 'border-l-[7px] border-[#293d50] pl-2' : ''
            }`}
          >
            <div className="text-center font-bold text-lg md:text-3xl mb-1">
              {market.odds}
            </div>

            <button
              type="button"
              disabled={isSuspended}
              onClick={() => placeBet(market.name, market.odds)}
              className={buttonClass}
            >
              {market.name}
            </button>
          </div>
        ))}
      </div>

      {/* Dragon and Tiger Markets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        {renderSide('Dragon')}
        {renderSide('Tiger')}
      </div>

    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 1 Day Dragon Tiger (dt6)
// --------------------------------------------------------------------------
function TableDt6({ isMobile, isSuspended, openBetSlip, markets }) {
  const bet = (name, odds) =>
    openBetSlip(name, odds, 'back', isMobile);

  const blue = 'bg-[#72b9e8]';
  const pink = 'bg-[#f5a5b8]';
  const gray = 'bg-[#f1f1f1]';
  const border = 'border border-[#c9c9c9]';

  const label = (name) => (
    <div className={`${gray} ${border} flex items-center px-2 min-h-[36px] md:min-h-[44px] text-sm md:text-base font-bold`}>
      {name}
    </div>
  );

  const header = (name, color = blue) => (
    <div className={`${color} ${border} flex items-center justify-center min-h-[30px] md:min-h-[34px] text-sm md:text-base font-bold`}>
      {name}
    </div>
  );

  const odd = (name, value, color = blue) => (
    <button
      type="button"
      onClick={() => bet(name, value)}
      className={`${color} ${border} min-h-[36px] md:min-h-[44px] w-full flex items-center justify-center text-base md:text-xl font-bold text-[#30343a] hover:brightness-95`}
    >
      {value}
    </button>
  );

  const twoRow = (first, second, rows) => (
    <div className="min-w-0">
      <div className="grid grid-cols-3">
        <div className={`${gray} ${border}`} />
        {header(first)}
        {header(second)}
      </div>

      {rows.map((row) => (
        <div key={row.name} className="grid grid-cols-3">
          {label(row.name)}
          {odd(`${row.name} ${row.firstName}`, row.first)}
          {odd(`${row.name} ${row.secondName}`, row.second)}
        </div>
      ))}
    </div>
  );

  const suits = [
    { name: 'Spade', icon: '♠', value: '3.72', color: 'text-black' },
    { name: 'Heart', icon: '♥', value: '3.72', color: 'text-red-600' },
    { name: 'Club', icon: '♣', value: '4', color: 'text-black' },
    { name: 'Diamond', icon: '♦', value: '3.72', color: 'text-red-600' },
  ];

  return (
    <div className="w-full bg-[#f5f5f5] p-1 space-y-2">

      {/* Dragon / Tiger / Pair */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <div className="grid grid-cols-3">
            <div className={`${gray} ${border}`} />
            {header('Back')}
            {header('Lay', pink)}
          </div>

          {[
            {
              name: 'Dragon',
              back: markets?.dragon?.back || '0',
              lay: markets?.dragon?.lay || '0',
            },
            {
              name: 'Tiger',
              back: markets?.tiger?.back || '1.01',
              lay: markets?.tiger?.lay || '1.03',
            },
          ].map((item) => (
            <div key={item.name} className="grid grid-cols-3">
              {label(item.name)}
              {odd(`${item.name} Back`, item.back)}
              {odd(`${item.name} Lay`, item.lay, pink)}
            </div>
          ))}
        </div>

        <div className={`${gray} ${border} p-2 flex flex-col justify-center`}>
          <div className="text-center text-lg md:text-xl font-bold mb-1">
            {markets?.pair?.back || '12'}
          </div>
          <button
            type="button"
            onClick={() => bet('Pair', markets?.pair?.back || '12')}
            className="h-[36px] md:h-[44px] bg-gradient-to-r from-[#078bc5] to-[#293d50] text-white font-bold text-base md:text-xl shadow-sm"
          >
            Pair
          </button>
        </div>
      </div>

      {/* Even / Odd and Red / Black */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {twoRow('Even', 'Odd', [
          {
            name: 'Dragon',
            firstName: 'Even',
            secondName: 'Odd',
            first: markets?.dragon?.even || '0',
            second: markets?.dragon?.odd || '0',
          },
          {
            name: 'Tiger',
            firstName: 'Even',
            secondName: 'Odd',
            first: markets?.tiger?.even || '2.07',
            second: markets?.tiger?.odd || '1.83',
          },
        ])}

        {twoRow(
          <span>Red <span className="text-red-600">♥ ♦</span></span>,
          <span>Black <span className="text-black">♠ ♣</span></span>,
          [
            {
              name: 'Dragon',
              firstName: 'Red',
              secondName: 'Black',
              first: markets?.dragon?.red || '0',
              second: markets?.dragon?.black || '0',
            },
            {
              name: 'Tiger',
              firstName: 'Red',
              secondName: 'Black',
              first: markets?.tiger?.red || '1.93',
              second: markets?.tiger?.black || '2',
            },
          ]
        )}
      </div>

      {/* Suits */}
      <div>
        <div className="grid grid-cols-5">
          <div className={`${gray} ${border}`} />
          {suits.map((suit) => (
            <div
              key={suit.name}
              className={`${gray} ${border} h-[30px] flex items-center justify-center text-lg ${suit.color}`}
            >
              {suit.icon}
            </div>
          ))}
        </div>

        {['Dragon', 'Tiger'].map((side) => (
          <div key={side} className="grid grid-cols-5">
            {label(side)}
            {suits.map((suit) => {
              const value =
                markets?.[side.toLowerCase()]?.[suit.name.toLowerCase()] ||
                (side === 'Dragon' ? '0' : suit.value);

              return odd(`${side} ${suit.name}`, value);
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 20-20 D T L (dtl20)
// --------------------------------------------------------------------------

function TableDtl20({ isMobile, isSuspended, openBetSlip, markets }) {
  const columns = ['Dragon', 'Tiger', 'Lion'];

  const leftRows = [
    { label: 'Winner', key: 'winner', odds: '2.94' },
    { label: 'Black', key: 'black', odds: '1.97' },
    { label: 'Red', key: 'red', odds: '1.97' },
    { label: 'Odd', key: 'odd', odds: '1.83' },
    { label: 'Even', key: 'even', odds: '2.12' },
    { label: 'A', key: 'A', odds: '12', card: true },
    { label: '2', key: '2', odds: '12', card: true },
    { label: '3', key: '3', odds: '12', card: true },
    { label: '4', key: '4', odds: '12', card: true },
  ];

  const rightRows = [
    { label: '5', key: '5', odds: '12', card: true },
    { label: '6', key: '6', odds: '12', card: true },
    { label: '7', key: '7', odds: '12', card: true },
    { label: '8', key: '8', odds: '12', card: true },
    { label: '9', key: '9', odds: '12', card: true },
    { label: '10', key: '10', odds: '12', card: true },
    { label: 'J', key: 'J', odds: '12', card: true },
    { label: 'Q', key: 'Q', odds: '12', card: true },
    { label: 'K', key: 'K', odds: '12', card: true },
  ];

  const getOdds = (column, row) => {
    const market = markets?.[column.toLowerCase()];

    return (
      market?.[row.key]?.back ??
      market?.[row.key] ??
      (row.key === 'winner' ? market?.back : undefined) ??
      row.odds
    );
  };

  const renderCard = (value) => (
    <div className="flex h-[35px] w-[27px] flex-col justify-between border border-yellow-400 bg-white px-[2px] py-[1px] leading-none sm:h-[42px] sm:w-[32px]">
      <span className="text-[15px] font-semibold text-black sm:text-[19px]">
        {value}
      </span>

      <div className="grid grid-cols-2 gap-x-[1px] text-[10px] leading-[9px] sm:text-[12px]">
        <span className="text-black">♠</span>
        <span className="text-red-600">♦</span>
        <span className="text-black">♣</span>
        <span className="text-red-600">♥</span>
      </div>
    </div>
  );

  const renderLabel = (row) => {
    if (row.card) {
      return renderCard(row.label);
    }

    if (row.key === 'black') {
      return (
        <span>
          Black <span className="text-black">♠ ♣</span>
        </span>
      );
    }

    if (row.key === 'red') {
      return (
        <span>
          Red <span className="text-red-600">♥ ♦</span>
        </span>
      );
    }

    return row.label;
  };

  const renderTable = (rows) => (
    <div className="min-w-0 w-full">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="h-[30px] border border-[#c9c9c9] bg-[#f1f1f1]" />

        {columns.map((column) => (
          <div
            key={column}
            className="flex h-[30px] items-center justify-center border border-[#c9c9c9] bg-[#72b9e8] text-[13px] font-bold text-[#30343a] sm:text-base"
          >
            {column}
          </div>
        ))}

        {rows.map((row) => (
          <React.Fragment key={row.key}>
            <div className="flex h-[43px] items-center border border-[#c9c9c9] bg-[#f1f1f1] px-1.5 text-[13px] font-bold text-[#30343a] sm:h-[48px] sm:px-2 sm:text-base">
              {renderLabel(row)}
            </div>

            {columns.map((column) => {
              const odds = getOdds(column, row);
              const nation = `${column} ${row.label}`;

              return (
                <button
                  key={`${row.key}-${column}`}
                  type="button"
                  onClick={() =>
                    openBetSlip(nation, odds, 'back', isMobile)
                  }
                  className="flex h-[43px] w-full items-center justify-center border border-[#c9c9c9] bg-[#72b9e8] text-[15px] font-bold text-[#30343a] transition-colors hover:bg-[#5da9dc] active:bg-[#4899d0] sm:h-[48px] sm:text-xl"
                >
                  {odds}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#f5f5f5] p-1">
      <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2">
        {renderTable(leftRows)}
        {renderTable(rightRows)}
      </div>
    </div>
  );
}


// --------------------------------------------------------------------------
// Game: 20-20 Dragon Tiger 2 (dt202)
// --------------------------------------------------------------------------

function TableDt202({ isMobile, isSuspended, openBetSlip, markets }) {
  const gradient =
    "bg-gradient-to-r from-[#078bc5] to-[#293e52] text-white shadow-md";

  const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const topMarkets = [
    { name: "Dragon", key: "dragon", odds: "2" },
    { name: "Tie", key: "tie", odds: "50" },
    { name: "Tiger", key: "tiger", odds: "2" },
    { name: "Pair", key: "pair", odds: "12" },
  ];

  const sections = [
    {
      name: "DRAGON",
      key: "dragon",
      items: [
        { name: "Even", key: "even", odds: "2.1" },
        { name: "Odd", key: "odd", odds: "1.79" },
        { name: "♥ ♦", key: "red", odds: "1.95" },
        { name: "♠ ♣", key: "black", odds: "1.95" },
      ],
    },
    {
      name: "TIGER",
      key: "tiger",
      items: [
        { name: "Even", key: "even", odds: "2.1" },
        { name: "Odd", key: "odd", odds: "1.79" },
        { name: "♥ ♦", key: "red", odds: "1.95" },
        { name: "♠ ♣", key: "black", odds: "1.95" },
      ],
    },
  ];

  const placeBet = (name, odds) => {
    openBetSlip(name, odds, "back", isMobile);
  };

  const getOdds = (side, key, fallback) => {
    const value = markets?.[side]?.[key];
    if (value && typeof value === "object") return value.back ?? fallback;
    return value ?? fallback;
  };

  const renderCard = (card) => (
    <div
      key={card}
      className="flex h-[58px] w-[43px] shrink-0 flex-col justify-between border-2 border-yellow-400 bg-white px-1 py-0.5 sm:h-[66px] sm:w-[53px]"
    >
      <span className="text-[27px] font-bold leading-none text-black sm:text-[34px]">
        {card}
      </span>
      <div className="grid grid-cols-2 text-center text-[15px] font-bold leading-[13px] sm:text-[18px]">
        <span className="text-black">♠</span>
        <span className="text-red-600">♦</span>
        <span className="text-black">♣</span>
        <span className="text-red-600">♥</span>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-2 bg-[#f5f5f5] p-1">

      {/* Top Dragon / Tie / Tiger / Pair */}
      <div className="grid grid-cols-4 gap-1.5">
        {topMarkets.map((item) => {
          const odds = getOdds(item.key, "back", item.odds);

          return (
            <div key={item.key} className="min-w-0 text-center">
              <div className="h-[24px] text-[15px] font-bold text-[#333] sm:text-[18px]">
                {odds}
              </div>
              <button
                type="button"
                onClick={() => placeBet(item.name, odds)}
                className={`${gradient} flex h-[38px] w-full items-center justify-center text-[14px] font-bold sm:h-[44px] sm:text-[18px]`}
              >
                {item.name}
              </button>
            </div>
          );
        })}
      </div>

      {/* Dragon and Tiger markets */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {sections.map((section) => (
          <div key={section.key} className="min-w-0 bg-[#f1f1f1] px-0.5 py-1">
            <h3 className="mb-1 text-center text-[17px] font-bold text-[#333] sm:text-[20px]">
              {section.name}
            </h3>

            <div className="grid grid-cols-4 gap-1.5">
              {section.items.map((item) => {
                const odds = getOdds(section.key, item.key, item.odds);
                const isRed = item.key === "red";
                const isBlack = item.key === "black";

                return (
                  <div key={item.key} className="min-w-0 text-center">
                    <div className="flex h-[24px] items-center justify-center text-[15px] font-bold text-[#333] sm:text-[18px]">
                      {odds}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        placeBet(`${section.name} ${item.name}`, odds)
                      }
                      className={`${gradient} flex h-[39px] w-full items-center justify-center text-[15px] font-bold sm:h-[44px] sm:text-[18px]`}
                    >
                      <span
                        className={
                          isRed
                            ? "text-red-500"
                            : isBlack
                              ? "text-black"
                              : ""
                        }
                      >
                        {item.name}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dragon 12 / Tiger 12 Cards */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {["Dragon", "Tiger"].map((side) => (
          <div
            key={side}
            className="border border-[#ccc] bg-[#f1f1f1] px-1.5 py-2"
          >
            <h3 className="mb-2 text-center text-[19px] font-bold text-[#333] sm:text-[22px]">
              {side.toUpperCase()} 12
            </h3>

            <div className="flex flex-wrap justify-center gap-1.5">
              {cards.map((card) => renderCard(card))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: 32 Cards A (card32)
// --------------------------------------------------------------------------

function TableCard32({ isMobile, isSuspended, openBetSlip, markets }) {
  const panels = [
    [
      {
        name: "Player 8",
        key: "player8",
        back: "12.2",
        lay: "13.7",
      },
      {
        name: "Player 9",
        key: "player9",
        back: "5.95",
        lay: "6.45",
      },
    ],
    [
      {
        name: "Player 10",
        key: "player10",
        back: "3.2",
        lay: "3.45",
      },
      {
        name: "Player 11",
        key: "player11",
        back: "2.08",
        lay: "2.18",
      },
    ],
  ];

  const getOdds = (player, type) =>
    markets?.[player.key]?.[type] ?? player[type];

  const headerClass =
    "flex h-[29px] items-center justify-center border border-[#c8c8c8] text-[13px] font-bold sm:h-[32px] sm:text-[15px]";

  const cellClass =
    "flex h-[45px] items-center justify-center border border-[#c8c8c8] text-[15px] font-bold text-[#30343a] sm:h-[47px] sm:text-[17px]";

  const renderPanel = (players, panelIndex) => (
    <div key={panelIndex} className="min-w-0 flex-1">
      <div className="grid grid-cols-[minmax(0,3fr)_repeat(2,minmax(0,1fr))]">
        <div className="border border-[#c8c8c8] bg-[#f1f1f1]" />

        <div className={`${headerClass} border-[#c8c8c8] bg-[#72b9e8]`}>
          Back
        </div>

        <div className={`${headerClass} border-[#c8c8c8] bg-[#f5a5b8]`}>
          Lay
        </div>

        {players.map((player) => {
          const backOdds = getOdds(player, "back");
          const layOdds = getOdds(player, "lay");

          return (
            <React.Fragment key={player.key}>
              <div className="flex h-[45px] items-center border border-[#c8c8c8] bg-[#f1f1f1] px-2 sm:h-[47px]">
                <span className="truncate text-[14px] font-bold text-[#333] sm:text-[16px]">
                  {player.name}
                </span>
              </div>

              <button
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(player.name, backOdds, "back", isMobile)
                }
                className={`${cellClass} border-[#c8c8c8] bg-[#72b9e8] transition-colors hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isSuspended ? "-" : backOdds}
              </button>

              <button
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(player.name, layOdds, "lay", isMobile)
                }
                className={`${cellClass} border-[#c8c8c8] bg-[#f5a5b8] transition-colors hover:bg-[#ed91a7] disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isSuspended ? "-" : layOdds}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#f5f5f5] p-1">
      <div className="flex flex-col gap-1.5 md:flex-row md:gap-2">
        {panels.map((players, index) => renderPanel(players, index))}
      </div>
    </div>
  );
}


// --------------------------------------------------------------------------
// Game: 32 Cards B (card32eu)
// --------------------------------------------------------------------------

function TableCard32eu({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    { name: "Player 8", key: "player8", back: "12.2", lay: "13.7" },
    { name: "Player 9", key: "player9", back: "5.95", lay: "6.45" },
    { name: "Player 10", key: "player10", back: "3.2", lay: "3.45" },
    { name: "Player 11", key: "player11", back: "2.08", lay: "2.18" },
  ];

  const patterns = [
    { name: "Any 3 Card Black", key: "any3Black", back: "3.25", lay: "3.45" },
    { name: "Any 3 Card Red", key: "any3Red", back: "3.25", lay: "3.45" },
    { name: "Two Black Two Red", key: "twoBlackTwoRed", back: "2.44", lay: "2.54" },
  ];

  const totals = [
    { name: "8 & 9 Total", key: "total89", odds: "1.97" },
    { name: "10 & 11 Total", key: "total1011", odds: "1.97" },
  ];

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  const getOdds = (key, type, fallback) =>
    markets?.[key]?.[type] ?? fallback;

  const headerCell =
    "flex h-[29px] items-center justify-center border border-[#c8c8c8] text-[13px] font-bold sm:h-[32px] sm:text-[15px]";

  const nameCell =
    "flex min-h-[38px] items-center border border-[#c8c8c8] bg-[#f1f1f1] px-1.5 text-[13px] font-bold text-[#333] sm:min-h-[40px] sm:text-[15px]";

  const oddsCell =
    "flex min-h-[38px] items-center justify-center border border-[#c8c8c8] text-[14px] font-bold text-[#30343a] sm:min-h-[40px] sm:text-[16px]";

  const renderButton = (name, odds, type = "back", color = "back") => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() =>
        openBetSlip(name, odds, type, isMobile)
      }
      className={`${oddsCell} ${
        color === "lay" ? "bg-[#f5a5b8] hover:bg-[#ed91a7]" : "bg-[#72b9e8] hover:bg-[#5da9dc]"
      } transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isSuspended ? "-" : odds}
    </button>
  );

  const renderBackLayTable = (items, isPlayer = false) => (
    <div className="min-w-0">
      <div className="grid grid-cols-[minmax(0,3fr)_repeat(2,minmax(0,1fr))]">
        <div className="border border-[#c8c8c8] bg-[#f1f1f1]" />
        <div className={`${headerCell} bg-[#72b9e8]`}>Back</div>
        <div className={`${headerCell} bg-[#f5a5b8]`}>Lay</div>

        {items.map((item) => {
          const back = getOdds(item.key, "back", item.back);
          const lay = getOdds(item.key, "lay", item.lay);

          return (
            <React.Fragment key={item.key}>
              <div className={nameCell}>{item.name}</div>
              {renderButton(item.name, back, "back", "back")}
              {renderButton(item.name, lay, "lay", "lay")}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderOddEvenTable = () => (
    <div className="min-w-0">
      <div className="grid grid-cols-[minmax(0,3fr)_repeat(2,minmax(0,1fr))]">
        <div className="border border-[#c8c8c8] bg-[#f1f1f1]" />
        <div className={`${headerCell} bg-[#72b9e8]`}>Odd</div>
        <div className={`${headerCell} bg-[#72b9e8]`}>Even</div>

        {players.map((player) => (
          <React.Fragment key={player.key}>
            <div className={nameCell}>{player.name}</div>
            {renderButton(
              `${player.name} Odd`,
              getOdds(player.key, "odd", "1.97")
            )}
            {renderButton(
              `${player.name} Even`,
              getOdds(player.key, "even", "1.97")
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderTotalsTable = () => (
    <div className="min-w-0">
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="border border-[#c8c8c8] bg-[#f1f1f1]" />
        <div className={`${headerCell} bg-[#72b9e8]`}>Back</div>

        {totals.map((item) => {
          const odds = getOdds(item.key, "back", item.odds);

          return (
            <React.Fragment key={item.key}>
              <div className={nameCell}>{item.name}</div>
              {renderButton(item.name, odds)}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#f5f5f5] p-1">
      {/* Top two tables */}
      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2">
        {renderBackLayTable(players, true)}
        {renderOddEvenTable()}
      </div>

      {/* Middle two tables */}
      <div className="mt-1.5 grid grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2">
        {renderBackLayTable(patterns)}
        {renderTotalsTable()}
      </div>

      {/* Number section */}
      <div className="mt-1.5">
        <div className="flex h-[29px] items-center justify-center border border-[#c8c8c8] bg-[#f1f1f1] text-[14px] font-bold text-[#333] sm:h-[32px] sm:text-[16px]">
          {getOdds("numberMarket", "back", "9.5")}
        </div>

        <div className="grid grid-cols-5">
          {numbers.map((number) => {
            const odds = getOdds(`number${number}`, "back", "9.5");

            return (
              <button
                type="button"
                key={number}
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(`Number ${number}`, odds, "back", isMobile)
                }
                className="flex h-[42px] items-center justify-center border border-[#c8c8c8] bg-[#72b9e8] text-[30px] font-bold leading-none text-[#30343a] hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[48px] sm:text-[36px]"
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Andar Bahar (ab20)
// --------------------------------------------------------------------------
function TableAb20({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  return (
    <div className="casino-table andar-bahar">
      <div className="casino-table-box">
        <div className="d-flex justify-content-between w-100 gap-2 mb-3">
          <div className="andar-box w-50 p-2 border rounded">
            <div className="ab-title text-center fw-bold text-primary mb-2">ANDAR</div>
            <div className="d-flex justify-content-center gap-2">
              <OddsBox nation="Andar Main" odds={markets?.andar?.back || '1.98'} type="back" className="w-100" />
            </div>
            <div className="ab-cards d-flex flex-wrap justify-content-center gap-1 mt-2">
              {cards13.map((c) => (
                <div
                  key={c}
                  className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                  onClick={isSuspended ? undefined : () => openBetSlip(`Andar ${c}`, '12.5', 'back', isMobile)}
                  style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '35px', textAlign: 'center' }}
                >
                  <div className="casino-odds">{isSuspended ? '-' : '12.5'}</div>
                  <div className="fw-bold">{c}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bahar-box w-50 p-2 border rounded">
            <div className="ab-title text-center fw-bold text-danger mb-2">BAHAR</div>
            <div className="d-flex justify-content-center gap-2">
              <OddsBox nation="Bahar Main" odds={markets?.bahar?.back || '1.98'} type="back" className="w-100" />
            </div>
            <div className="ab-cards d-flex flex-wrap justify-content-center gap-1 mt-2">
              {cards13.map((c) => (
                <div
                  key={c}
                  className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                  onClick={isSuspended ? undefined : () => openBetSlip(`Bahar ${c}`, '12.5', 'back', isMobile)}
                  style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '35px', textAlign: 'center' }}
                >
                  <div className="casino-odds">{isSuspended ? '-' : '12.5'}</div>
                  <div className="fw-bold">{c}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Andar Bahar 2 (abj)
// --------------------------------------------------------------------------
function TableAbj({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  return (
    <div className="casino-table andar-bahar">
      <div className="casino-table-box">
        <div className="d-flex justify-content-between w-100 gap-2 mb-3">
          <div className="andar-box w-50 p-2 border rounded">
            <div className="ab-title text-center fw-bold text-primary mb-2">ANDAR</div>
            <div className="d-flex justify-content-center gap-2">
              <OddsBox nation="Andar Main" odds={markets?.andar?.back || '1.98'} type="back" className="w-100" />
            </div>
            <div className="ab-cards d-flex flex-wrap justify-content-center gap-1 mt-2">
              {cards13.map((c) => (
                <div
                  key={c}
                  className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                  onClick={isSuspended ? undefined : () => openBetSlip(`Andar ${c}`, '12.5', 'back', isMobile)}
                  style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '35px', textAlign: 'center' }}
                >
                  <div className="casino-odds">{isSuspended ? '-' : '12.5'}</div>
                  <div className="fw-bold">{c}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bahar-box w-50 p-2 border rounded">
            <div className="ab-title text-center fw-bold text-danger mb-2">BAHAR</div>
            <div className="d-flex justify-content-center gap-2">
              <OddsBox nation="Bahar Main" odds={markets?.bahar?.back || '1.98'} type="back" className="w-100" />
            </div>
            <div className="ab-cards d-flex flex-wrap justify-content-center gap-1 mt-2">
              {cards13.map((c) => (
                <div
                  key={c}
                  className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                  onClick={isSuspended ? undefined : () => openBetSlip(`Bahar ${c}`, '12.5', 'back', isMobile)}
                  style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '35px', textAlign: 'center' }}
                >
                  <div className="casino-odds">{isSuspended ? '-' : '12.5'}</div>
                  <div className="fw-bold">{c}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Lucky 7 - A (lucky7)
// --------------------------------------------------------------------------
function TableLucky7({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className="casino-table lucky7a">
      <div className="casino-table-box">
        <div className="casino-table-full-box">
          <div className="lucky7low">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.low?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Low Card', markets?.low?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Low Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.seven?.back || '12')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Exact 7', markets?.seven?.back || '12', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Exact 7</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7high">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.high?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('High Card', markets?.high?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">High Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>
        </div>

        <div className="casino-table-box mt-3">
          <div className="casino-table-left-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.even?.back || '2.10')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Even', markets?.even?.back || '2.10', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Even</span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.odd?.back || '1.79')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Odd', markets?.odd?.back || '1.79', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Odd</span>
              </div>
            </div>
          </div>

          <div className="casino-table-right-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.red?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Red', markets?.red?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-red">Red</span></span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.black?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Black', markets?.black?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-black">Black</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="casino-table-box mt-3 d-flex justify-content-between gap-2">
          {[
            { label: 'A-2-3', odds: '4.00' },
            { label: '4-5-6', odds: '4.00' },
            { label: '8-9-10', odds: '4.00' },
            { label: 'J-Q-K', odds: '4.00' },
          ].map((grp) => (
            <div key={grp.label} className="lucky7cards flex-fill text-center">
              <div className="casino-odds w-100 text-center fw-bold">{isSuspended ? '-' : grp.odds}</div>
              <div
                className={`card-odd-box-container p-1 border rounded ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Group ${grp.label}`, grp.odds, 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', background: '#273646' }}
              >
                <span className="fw-bold text-white">{grp.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="casino-table-full-box lucky7acards mt-3">
          <div className="casino-odds w-100 text-center fw-bold mb-1">Cards 1 to 13 (Payout 12.0)</div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '40px', textAlign: 'center' }}
              >
                <div className="casino-odds">{isSuspended ? '-' : '12'}</div>
                <div className="fw-bold">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Lucky 7 - B (lucky7eu)
// --------------------------------------------------------------------------
function TableLucky7eu({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className="casino-table lucky7a">
      <div className="casino-table-box">
        <div className="casino-table-full-box">
          <div className="lucky7low">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.low?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Low Card', markets?.low?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Low Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.seven?.back || '12')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Exact 7', markets?.seven?.back || '12', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Exact 7</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7high">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.high?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('High Card', markets?.high?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">High Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>
        </div>

        <div className="casino-table-box mt-3">
          <div className="casino-table-left-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.even?.back || '2.10')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Even', markets?.even?.back || '2.10', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Even</span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.odd?.back || '1.79')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Odd', markets?.odd?.back || '1.79', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Odd</span>
              </div>
            </div>
          </div>

          <div className="casino-table-right-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.red?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Red', markets?.red?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-red">Red</span></span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.black?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Black', markets?.black?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-black">Black</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="casino-table-box mt-3 d-flex justify-content-between gap-2">
          {[
            { label: 'A-2-3', odds: '4.00' },
            { label: '4-5-6', odds: '4.00' },
            { label: '8-9-10', odds: '4.00' },
            { label: 'J-Q-K', odds: '4.00' },
          ].map((grp) => (
            <div key={grp.label} className="lucky7cards flex-fill text-center">
              <div className="casino-odds w-100 text-center fw-bold">{isSuspended ? '-' : grp.odds}</div>
              <div
                className={`card-odd-box-container p-1 border rounded ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Group ${grp.label}`, grp.odds, 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', background: '#273646' }}
              >
                <span className="fw-bold text-white">{grp.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="casino-table-full-box lucky7acards mt-3">
          <div className="casino-odds w-100 text-center fw-bold mb-1">Cards 1 to 13 (Payout 12.0)</div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '40px', textAlign: 'center' }}
              >
                <div className="casino-odds">{isSuspended ? '-' : '12'}</div>
                <div className="fw-bold">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 3 Cards Judgement (3cardj)
// --------------------------------------------------------------------------
function Table3cardj({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table trio">
      <div className="casino-table-box">
        <div className="d-flex justify-content-between gap-2 mb-3">
          <div className="w-100 border p-2 rounded">
            <div className="fw-bold">Player 1</div>
            <div className="d-flex gap-2 mt-1">
              <OddsBox nation="Player 1" odds="2.95" type="back" className="w-50" />
              <OddsBox nation="Player 1" odds="3.05" type="lay" className="w-50" />
            </div>
          </div>
          <div className="w-100 border p-2 rounded">
            <div className="fw-bold">Player 2</div>
            <div className="d-flex gap-2 mt-1">
              <OddsBox nation="Player 2" odds="2.95" type="back" className="w-50" />
              <OddsBox nation="Player 2" odds="3.05" type="lay" className="w-50" />
            </div>
          </div>
          <div className="w-100 border p-2 rounded">
            <div className="fw-bold">Player 3</div>
            <div className="d-flex gap-2 mt-1">
              <OddsBox nation="Player 3" odds="2.95" type="back" className="w-50" />
              <OddsBox nation="Player 3" odds="3.05" type="lay" className="w-50" />
            </div>
          </div>
        </div>

        <div className="casino-table-box triocards mt-3">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Side Bets (Hand Combinations)</div>
            <div className="casino-odds-box back">Back Rate</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail">Pair (Payout 5.5)</div>
              <OddsBox nation="Pair" odds="5.5" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Flush (Payout 17.0)</div>
              <OddsBox nation="Flush" odds="17.0" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Straight (Payout 24.0)</div>
              <OddsBox nation="Straight" odds="24.0" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Trio (Payout 201.0)</div>
              <OddsBox nation="Trio" odds="201.0" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Straight Flush (Payout 226.0)</div>
              <OddsBox nation="Straight Flush" odds="226.0" type="back" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Instant Worli (worli)
// --------------------------------------------------------------------------
function TableWorli({ isMobile, isSuspended, openBetSlip }) {
  const [activeTab, setActiveTab] = React.useState('jodi');
  const [jodiStakes, setJodiStakes] = React.useState({});
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleJodiClick = (numStr) => {
    if (isSuspended) return;
    openBetSlip(`Jodi ${numStr}`, '95.0', 'back', isMobile);
    setJodiStakes((prev) => ({
      ...prev,
      [numStr]: (prev[numStr] || 0) + 100,
    }));
  };

  const handleClear = () => {
    setJodiStakes({});
  };

  const totalAmount = Object.values(jodiStakes).reduce((a, b) => a + b, 0);

  return (
    <div className="casino-table worli">
      <div className="casino-table-box p-3 border rounded">
        {/* Worli sub-tabs */}
        <div className="worli-tabs mb-3 overflow-auto" id="worli-tabs">
          <ul className="nav nav-pills flex-nowrap gap-1 pb-1">
            {[{"id":"single","name":"Single Ank"},{"id":"jodi","name":"Jodi"},{"id":"singlepatti","name":"Single Patti"},{"id":"doublepatti","name":"Double Patti"},{"id":"triplepatti","name":"Triple Patti"},{"id":"halfsangam","name":"Half Sangam"},{"id":"fullsangam","name":"Full Sangam"},{"id":"spmotor","name":"SP Motor"},{"id":"dpmotor","name":"DP Motor"},{"id":"cyclepana","name":"Cycle Pana"},{"id":"fdpana","name":"FD Pana"},{"id":"sdpana","name":"SD Pana"},{"id":"tdpana","name":"TD Pana"}].map((t) => (
              <li key={t.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-link py-1 px-2 small ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tab 1: Jodi 10x10 Matrix */}
        {activeTab === 'jodi' && (
          <div className="jodi-matrix-container mb-3">
            <h6 className="fw-bold mb-2 text-center">Jodi 00 to 99 (Odds: 95.00)</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered text-center align-middle mb-0">
                <tbody>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((row) => (
                    <tr key={row}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => {
                        const num = `${row}${col}`;
                        const stake = jodiStakes[num];
                        return (
                          <td
                            key={num}
                            className={`p-1 ${stake ? 'table-warning fw-bold' : ''} ${isSuspended ? 'bg-light text-muted' : ''}`}
                            onClick={() => handleJodiClick(num)}
                            style={{
                              cursor: isSuspended ? 'not-allowed' : 'pointer',
                              minWidth: '34px',
                              height: '38px',
                              userSelect: 'none',
                            }}
                          >
                            <div className="small">{num}</div>
                            {stake ? <div className="text-danger" style={{ fontSize: '9px' }}>{stake}</div> : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Single Digit (0-9) */}
        {activeTab === 'single' && (
          <div className="single-digit-container mb-3 text-center">
            <h6 className="fw-bold mb-2">Single Ank (0 to 9) - Odds: 9.50</h6>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {digits.map((d) => (
                <div
                  key={d}
                  className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
                  onClick={isSuspended ? undefined : () => openBetSlip(`Single ${d}`, '9.5', 'back', isMobile)}
                  style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '60px', textAlign: 'center' }}
                >
                  <div className="casino-odds">{isSuspended ? '-' : '9.5'}</div>
                  <div className="fw-bold h5 mb-0">{d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Pana / Patti combinations */}
        {activeTab !== 'jodi' && activeTab !== 'single' && (
          <div className="pana-container mb-3 text-center p-3 bg-light rounded">
            <h6 className="fw-bold mb-2">{activeTab.toUpperCase()} Matrix - Odds: 150.00</h6>
            <p className="text-muted small mb-3">Quick combination selector for {activeTab}</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {['120', '123', '124', '125', '126', '127', '128', '129', '130', '134'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={isSuspended ? undefined : () => openBetSlip(`Pana ${p}`, '150.0', 'back', isMobile)}
                  disabled={isSuspended}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Worli Action Box */}
        <div className="worli-clear-box d-flex justify-content-between align-items-center p-2 bg-light border rounded">
          <div className="total-amount fw-bold">
            Total Amount: <span className="text-primary">{totalAmount}</span>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-danger px-3"
              onClick={handleClear}
              disabled={totalAmount === 0}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-sm btn-success px-3"
              disabled={totalAmount === 0 || isSuspended}
              onClick={() => {
                Object.entries(jodiStakes).forEach(([num, st]) => {
                  openBetSlip(`Jodi ${num}`, '95.0', 'back', isMobile);
                });
              }}
            >
              Place Bet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Worli 2 (worli2)
// --------------------------------------------------------------------------
function TableWorli2({ isMobile, isSuspended, openBetSlip }) {
  const [activeTab, setActiveTab] = React.useState('jodi');
  const [jodiStakes, setJodiStakes] = React.useState({});
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleJodiClick = (numStr) => {
    if (isSuspended) return;
    openBetSlip(`Jodi ${numStr}`, '95.0', 'back', isMobile);
    setJodiStakes((prev) => ({
      ...prev,
      [numStr]: (prev[numStr] || 0) + 100,
    }));
  };

  const handleClear = () => {
    setJodiStakes({});
  };

  const totalAmount = Object.values(jodiStakes).reduce((a, b) => a + b, 0);

  return (
    <div className="casino-table worli">
      <div className="casino-table-box p-3 border rounded">
        {/* Worli sub-tabs */}
        <div className="worli-tabs mb-3 overflow-auto" id="worli-tabs">
          <ul className="nav nav-pills flex-nowrap gap-1 pb-1">
            {[{"id":"single","name":"Single Ank"},{"id":"jodi","name":"Jodi"},{"id":"singlepatti","name":"Single Patti"},{"id":"doublepatti","name":"Double Patti"},{"id":"triplepatti","name":"Triple Patti"},{"id":"halfsangam","name":"Half Sangam"},{"id":"fullsangam","name":"Full Sangam"},{"id":"spmotor","name":"SP Motor"},{"id":"dpmotor","name":"DP Motor"},{"id":"cyclepana","name":"Cycle Pana"},{"id":"fdpana","name":"FD Pana"},{"id":"sdpana","name":"SD Pana"},{"id":"tdpana","name":"TD Pana"}].map((t) => (
              <li key={t.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-link py-1 px-2 small ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tab 1: Jodi 10x10 Matrix */}
        {activeTab === 'jodi' && (
          <div className="jodi-matrix-container mb-3">
            <h6 className="fw-bold mb-2 text-center">Jodi 00 to 99 (Odds: 95.00)</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered text-center align-middle mb-0">
                <tbody>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((row) => (
                    <tr key={row}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => {
                        const num = `${row}${col}`;
                        const stake = jodiStakes[num];
                        return (
                          <td
                            key={num}
                            className={`p-1 ${stake ? 'table-warning fw-bold' : ''} ${isSuspended ? 'bg-light text-muted' : ''}`}
                            onClick={() => handleJodiClick(num)}
                            style={{
                              cursor: isSuspended ? 'not-allowed' : 'pointer',
                              minWidth: '34px',
                              height: '38px',
                              userSelect: 'none',
                            }}
                          >
                            <div className="small">{num}</div>
                            {stake ? <div className="text-danger" style={{ fontSize: '9px' }}>{stake}</div> : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Single Digit (0-9) */}
        {activeTab === 'single' && (
          <div className="single-digit-container mb-3 text-center">
            <h6 className="fw-bold mb-2">Single Ank (0 to 9) - Odds: 9.50</h6>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {digits.map((d) => (
                <div
                  key={d}
                  className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
                  onClick={isSuspended ? undefined : () => openBetSlip(`Single ${d}`, '9.5', 'back', isMobile)}
                  style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '60px', textAlign: 'center' }}
                >
                  <div className="casino-odds">{isSuspended ? '-' : '9.5'}</div>
                  <div className="fw-bold h5 mb-0">{d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Pana / Patti combinations */}
        {activeTab !== 'jodi' && activeTab !== 'single' && (
          <div className="pana-container mb-3 text-center p-3 bg-light rounded">
            <h6 className="fw-bold mb-2">{activeTab.toUpperCase()} Matrix - Odds: 150.00</h6>
            <p className="text-muted small mb-3">Quick combination selector for {activeTab}</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {['120', '123', '124', '125', '126', '127', '128', '129', '130', '134'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={isSuspended ? undefined : () => openBetSlip(`Pana ${p}`, '150.0', 'back', isMobile)}
                  disabled={isSuspended}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Worli Action Box */}
        <div className="worli-clear-box d-flex justify-content-between align-items-center p-2 bg-light border rounded">
          <div className="total-amount fw-bold">
            Total Amount: <span className="text-primary">{totalAmount}</span>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-danger px-3"
              onClick={handleClear}
              disabled={totalAmount === 0}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-sm btn-success px-3"
              disabled={totalAmount === 0 || isSuspended}
              onClick={() => {
                Object.entries(jodiStakes).forEach(([num, st]) => {
                  openBetSlip(`Jodi ${num}`, '95.0', 'back', isMobile);
                });
              }}
            >
              Place Bet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Amar Akbar Anthony (aaa)
// --------------------------------------------------------------------------
function TableAaa({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className="casino-table aaa">
      <div className="casino-table-box">
        <div className="d-flex justify-content-between w-100 gap-2 mb-3">
          <div className="casino-odd-box-container w-100">
            <div className="casino-nation-name">A. Amar</div>
            <OddsBox nation="A. Amar" odds={markets?.amar?.back || '2.95'} type="back" />
            <OddsBox nation="A. Amar" odds={markets?.amar?.lay || '3.05'} type="lay" />
          </div>
          <div className="casino-odd-box-container w-100">
            <div className="casino-nation-name">B. Akbar</div>
            <OddsBox nation="B. Akbar" odds={markets?.akbar?.back || '2.95'} type="back" />
            <OddsBox nation="B. Akbar" odds={markets?.akbar?.lay || '3.05'} type="lay" />
          </div>
          <div className="casino-odd-box-container w-100">
            <div className="casino-nation-name">C. Anthony</div>
            <OddsBox nation="C. Anthony" odds={markets?.anthony?.back || '2.95'} type="back" />
            <OddsBox nation="C. Anthony" odds={markets?.anthony?.lay || '3.05'} type="lay" />
          </div>
        </div>

        <div className="casino-table-box mt-3 d-flex justify-content-between w-100 gap-2">
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Even', '2.10', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold">Even</div><div className="casino-odds">{isSuspended ? '-' : '2.10'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Odd', '1.79', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold">Odd</div><div className="casino-odds">{isSuspended ? '-' : '1.79'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Red', '1.95', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold text-danger">Red</div><div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Black', '1.95', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold text-dark">Black</div><div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
          </div>
        </div>

        <div className="casino-table-full-box aaacards mt-3">
          <div className="casino-odds w-100 text-center fw-bold mb-1">13 Cards Market (Payout 12.0)</div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '40px', textAlign: 'center' }}
              >
                <div className="casino-odds">{isSuspended ? '-' : '12'}</div>
                <div className="fw-bold">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Bollywood Casino (btable)
// --------------------------------------------------------------------------
function TableBtable({ isMobile, isSuspended, openBetSlip, markets }) {
  const chars = [
    { key: 'A', name: 'Don', back: '15', lay: '17' },
    { key: 'B', name: 'Amar Akbar Anthony', back: '5.15', lay: '5.5' },
    { key: 'C', name: 'Sahib Bibi Aur Ghulam', back: '5.15', lay: '5.5' },
    { key: 'D', name: 'Dharam Veer', back: '7.65', lay: '8.35' },
    { key: 'E', name: 'Kis Kis ko Pyaar Karoon', back: '3.85', lay: '4.15' },
    { key: 'F', name: 'Ghulam', back: '5.15', lay: '5.5' },
  ];

  const cardButton = (nation, odds, type = 'back', extra = '') => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() =>
        !isSuspended && openBetSlip(nation, odds, type, isMobile)
      }
      className={`flex min-w-0 flex-1 items-center justify-center min-h-[52px] text-xl md:text-2xl font-bold text-[#30343a] ${
        type === 'back' ? 'bg-[#72b9e8]' : 'bg-[#f5a5b8]'
      } ${isSuspended ? 'opacity-60' : 'hover:brightness-95'} ${extra}`}
    >
      {odds}
    </button>
  );

  const gradientButton = (nation, odds, label, extra = '') => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() =>
        !isSuspended && openBetSlip(nation, odds, 'back', isMobile)
      }
      className={`w-full min-h-[52px] bg-gradient-to-r from-[#078bc5] to-[#293d50] text-white font-bold text-lg md:text-xl shadow-md hover:brightness-105 disabled:opacity-60 ${extra}`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full bg-[#f5f5f5] p-1 md:p-1.5 text-[#30343a]">

      {/* Top Character Markets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-5 md:gap-y-7">
        {chars.map((char) => (
          <div key={char.key} className="min-w-0">
            <div className="text-center font-bold text-base md:text-xl mb-1 truncate">
              {char.key}.{char.name}
            </div>

            <div className="flex gap-1.5">
              {cardButton(
                `${char.key}.${char.name}`,
                char.back,
                'back'
              )}
              {cardButton(
                `${char.key}.${char.name}`,
                char.lay,
                'lay'
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 md:grid-cols-[0.75fr_2.25fr] gap-2 mt-7">

        {/* Odd */}
        <div className="border border-[#c9c9c9] p-2">
          <div className="text-center font-bold text-lg md:text-xl mb-1">
            Odd
          </div>

          <div className="flex gap-1.5">
            {cardButton('Odd Back', '1.32', 'back')}
            {cardButton('Odd Lay', '1.36', 'lay')}
          </div>
        </div>

        {/* Dulha / Barati */}
        <div className="border border-[#c9c9c9] p-2 grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="font-bold text-lg md:text-2xl mb-1">1.97</div>
            {gradientButton('Dulha Dulhan K-Q', '1.97', 'Dulha Dulhan K-Q')}
          </div>

          <div className="text-center">
            <div className="font-bold text-lg md:text-2xl mb-1">1.97</div>
            {gradientButton('Barati J-A', '1.97', 'Barati J-A')}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">

        {/* Suits */}
        <div className="border border-[#c9c9c9] p-2">
          <div className="grid grid-cols-2 gap-2">

            <div className="text-center">
              <div className="font-bold text-lg md:text-2xl mb-1">1.97</div>
              {gradientButton(
                'Red Suits',
                '1.97',
                <span className="text-3xl">
                  <span className="text-red-500">♥ ♦</span>
                </span>
              )}
            </div>

            <div className="text-center">
              <div className="font-bold text-lg md:text-2xl mb-1">1.97</div>
              {gradientButton(
                'Black Suits',
                '1.97',
                <span className="text-3xl text-black">♠ ♣</span>
              )}
            </div>

          </div>
        </div>

        {/* Cards */}
        <div className="border border-[#c9c9c9] p-2">
          <div className="text-center font-bold text-lg md:text-2xl mb-2">
            3.75
          </div>

          <button
            type="button"
            disabled={isSuspended}
            onClick={() =>
              !isSuspended &&
              openBetSlip('JQKA Cards', '3.75', 'back', isMobile)
            }
            className="w-full flex justify-center items-center gap-1.5 md:gap-2 py-1 disabled:opacity-60"
          >
            {['J', 'Q', 'K', 'A'].map((card) => (
              <div
                key={card}
                className="w-10 h-[58px] md:w-[54px] md:h-[76px] border-2 border-yellow-400 bg-white rounded-[2px] flex flex-col items-center justify-between py-0.5 shadow-sm"
              >
                <span className="text-2xl md:text-4xl font-bold leading-none text-black">
                  {card}
                </span>

                <div className="flex justify-between w-full px-0.5 text-base md:text-xl leading-none">
                  <span className="text-black">♠</span>
                  <span className="text-red-500">♦</span>
                </div>

                <div className="flex justify-between w-full px-0.5 text-base md:text-xl leading-none">
                  <span className="text-black">♣</span>
                  <span className="text-red-500">♥</span>
                </div>
              </div>
            ))}
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Lottery (lottcard)
// --------------------------------------------------------------------------
function TableLottcard({ isMobile, isSuspended, openBetSlip }) {
  const [selectedNumbers, setSelectedNumbers] = React.useState([]);

  const toggleNumber = (num) => {
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
    openBetSlip(`Card ${num}`, '9.00', 'back', isMobile);
  };

  return (
    <div className="casino-table lottery lottcard">
      <div className="casino-table-box p-3 border rounded text-center">
        <h5 className="fw-bold mb-3">Lottery Cards (Pick 0 - 9)</h5>
        
        {/* Number Selector Grid 0-9 */}
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isPicked = selectedNumbers.includes(num);
            return (
              <button
                key={num}
                type="button"
                className={`btn btn-lg ${isPicked ? 'btn-warning text-dark' : 'btn-outline-primary'} fw-bold px-3 py-2`}
                onClick={() => toggleNumber(num)}
                disabled={isSuspended}
                style={{ minWidth: '55px', borderRadius: '8px' }}
              >
                {num}
                <div style={{ fontSize: '10px' }}>9.00</div>
              </button>
            );
          })}
        </div>

        {/* Quick Prop Bets: Low, High, Even, Odd */}
        <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openBetSlip('Low (0-4)', '1.95', 'back', isMobile)}
            disabled={isSuspended}
          >
            Low (0-4) @ 1.95
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openBetSlip('High (5-9)', '1.95', 'back', isMobile)}
            disabled={isSuspended}
          >
            High (5-9) @ 1.95
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openBetSlip('Even Numbers', '1.95', 'back', isMobile)}
            disabled={isSuspended}
          >
            Even @ 1.95
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openBetSlip('Odd Numbers', '1.95', 'back', isMobile)}
            disabled={isSuspended}
          >
            Odd @ 1.95
          </button>
        </div>

        {/* Action Buttons */}
        <div className="lottery-buttons d-flex justify-content-center gap-3">
          <button
            type="button"
            className="btn btn-danger px-4"
            onClick={() => setSelectedNumbers([])}
          >
            Clear Picks
          </button>
          <button
            type="button"
            className="btn btn-success px-4"
            disabled={selectedNumbers.length === 0 || isSuspended}
            onClick={() => {
              selectedNumbers.forEach((n) => openBetSlip(`Card ${n}`, '9.00', 'back', isMobile));
            }}
          >
            Bet Selected ({selectedNumbers.length})
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 5Five Cricket (cricketv3)
// --------------------------------------------------------------------------
function TableCricketv3({ isMobile, isSuspended, openBetSlip }) {
  const outcomes = [
    { label: '0 Runs (Dot)', odds: '2.50' },
    { label: '1 Run', odds: '2.20' },
    { label: '2 Runs', odds: '4.50' },
    { label: '3 Runs', odds: '12.00' },
    { label: '4 Runs (Boundary)', odds: '5.50' },
    { label: '6 Runs (Sixer)', odds: '8.00' },
    { label: 'Wicket', odds: '4.00' },
    { label: 'Wide / No Ball', odds: '6.00' },
  ];

  return (
    <div className="casino-table cricket cricketv3">
      <div className="casino-table-box text-center p-3 border rounded">
        <h5 className="fw-bold mb-3">5Five Cricket - Live Ball Prediction</h5>
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
          {outcomes.map((o) => (
            <div
              key={o.label}
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip(o.label, o.odds, 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '110px', textAlign: 'center' }}
            >
              <div className="casino-odds">{isSuspended ? '-' : o.odds}</div>
              <div className="fw-bold small">{o.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Cricket Match 20-20 (cmatch20)
// --------------------------------------------------------------------------
function TableCmatch20({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table cmatch20">
      <div className="casino-table-box p-3 border rounded">
        <h5 className="fw-bold text-center mb-3">Cricket Match 20-20 (Batsman vs Bowler)</h5>
        
        {/* Main Duel: Batsman vs Bowler */}
        <div className="row mb-3">
          <div className="col-6">
            <div
              className={`card-odd-box p-3 border rounded bg-white text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Batsman (Runs >= 11)', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Batsman (Runs &ge; 11)</div>
              <div className="casino-odds text-primary fs-5">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6">
            <div
              className={`card-odd-box p-3 border rounded bg-white text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Bowler (Runs <= 10)', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Bowler (Runs &le; 10)</div>
              <div className="casino-odds text-primary fs-5">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
        </div>

        {/* Side Markets: Over Total & Boundary / Wicket */}
        <div className="row g-2">
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Runs Over 10.5', '1.90', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="small text-muted">Total Over Runs</div>
              <div className="fw-bold">Over 10.5</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.90'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Runs Under 10.5', '1.90', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="small text-muted">Total Over Runs</div>
              <div className="fw-bold">Under 10.5</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.90'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Boundary In Over (YES)', '1.65', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="small text-muted">Boundary In Over</div>
              <div className="fw-bold">YES</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.65'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white text-center ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Wicket In Over (YES)', '2.20', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="small text-muted">Wicket In Over</div>
              <div className="fw-bold">YES</div>
              <div className="casino-odds">{isSuspended ? '-' : '2.20'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Teenpatti - 2.0 (teen6)
// --------------------------------------------------------------------------
function TableTeen6({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.31',
      lay: markets?.playerA?.lay || '1.36',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.31',
      lay: markets?.playerB?.lay || '1.36',
    },
  ];

  const sideMarkets = [
    { name: 'Player A Under 21', odds: markets?.under21A?.back || '0' },
    { name: 'Player A Over 22', odds: markets?.over22A?.back || '0' },
    { name: 'Player B Under 21', odds: markets?.under21B?.back || '0' },
    { name: 'Player B Over 22', odds: markets?.over22B?.back || '0' },
  ];

  const suitMarkets = [
    { name: 'Spade', icon: '♠', odds: markets?.spade?.back || '4.61' },
    { name: 'Heart', icon: '♥', odds: markets?.heart?.back || '3.56' },
    { name: 'Club', icon: '♣', odds: markets?.club?.back || '3.56' },
    { name: 'Diamond', icon: '♦', odds: markets?.diamond?.back || '3.85' },
    { name: 'Odd', icon: 'Odd', odds: markets?.odd?.back || '1.97' },
    { name: 'Even', icon: 'Even', odds: markets?.even?.back || '1.97' },
  ];

  const cardValues = [
    { value: 'A', odds: '11.12' },
    { value: '2', odds: '11.12' },
    { value: '3', odds: '22.16' },
    { value: '4', odds: '11.12' },
    { value: '5', odds: '11.12' },
    { value: '6', odds: '11.12' },
    { value: '7', odds: '14.8' },
    { value: '8', odds: '11.12' },
    { value: '9', odds: '11.12' },
    { value: '10', odds: '11.12' },
    { value: 'J', odds: '14.8' },
    { value: 'Q', odds: '11.12' },
    { value: 'K', odds: '11.12' },
  ];

  const PlayerSection = ({ player }) => (
    <div className="min-w-0 overflow-hidden border border-[#c9c9c9]">
      {/* Player Header */}
      <div className="grid h-[48px] grid-cols-[3fr_1fr_1fr]">
        <div className="flex items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          {player.name}
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base">
          Back
        </div>

        <div className="flex items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base">
          Lay
        </div>
      </div>

      {/* Main Market */}
      <div className="grid grid-cols-[3fr_1fr_1fr]">
        <div className="flex h-[48px] items-center border-t border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          Main
        </div>

        <button
          type="button"
          onClick={() =>
            openBetSlip(player.name, player.back, 'back', isMobile)
          }
          className="flex h-[48px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base"
        >
          {player.back}
        </button>

        <button
          type="button"
          onClick={() =>
            openBetSlip(player.name, player.lay, 'lay', isMobile)
          }
          className="flex h-[48px] items-center justify-center bg-[#f5a5b8] text-sm font-bold text-[#333333] hover:bg-[#ed91a7] sm:text-base"
        >
          {player.lay}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-3">

      {/* Player A & Player B */}
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => (
          <PlayerSection key={player.name} player={player} />
        ))}
      </div>

      {/* Under 21 / Over 22 */}
      <div className="grid grid-cols-2 gap-2">
        {sideMarkets.map((market) => (
          <div
            key={market.name}
            className="grid min-w-0 grid-cols-[minmax(0,3fr)_minmax(0,1.25fr)] overflow-hidden border border-[#c9c9c9]"
          >
            <div className="flex h-[48px] items-center bg-[#f1f1f1] px-2 text-xs font-bold text-[#333333] sm:text-base">
              {market.name}
            </div>

            <button
              type="button"
              onClick={() =>
                openBetSlip(market.name, market.odds, 'back', isMobile)
              }
              className="flex h-[48px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base"
            >
              {market.odds}
            </button>
          </div>
        ))}
      </div>

      {/* Suit Markets */}
      <div className="grid grid-cols-6 gap-2">
        {suitMarkets.map((market) => (
          <button
            key={market.name}
            type="button"
            onClick={() =>
              openBetSlip(market.name, market.odds, 'back', isMobile)
            }
            className="flex h-[48px] min-w-0 items-center justify-between gap-1 bg-[#72b9e8] px-2 hover:bg-[#5da9dc]"
          >
            <span
              className={`truncate text-xl font-bold sm:text-2xl ${
                market.name === 'Heart' || market.name === 'Diamond'
                  ? 'text-[#e52c32]'
                  : market.name === 'Odd' || market.name === 'Even'
                    ? 'text-[#333333] text-sm sm:text-base'
                    : 'text-[#222222]'
              }`}
            >
              {market.icon}
            </span>

            <span className="truncate text-xs font-bold text-[#333333] sm:text-base">
              {market.odds}
            </span>
          </button>
        ))}
      </div>

      {/* Card Odds */}
      <div className="w-full overflow-x-auto bg-[#f1f1f1] px-2 py-2">
        <div className="mx-auto flex w-max items-end justify-center gap-1.5">
          {cardValues.map((card) => (
            <button
              key={card.value}
              type="button"
              onClick={() =>
                openBetSlip(
                  `Card ${card.value}`,
                  card.odds,
                  'back',
                  isMobile
                )
              }
              className="flex w-[58px] shrink-0 flex-col items-center gap-1"
            >
              {/* Card Odds */}
              <span className="text-xs font-bold text-[#333333]">
                {card.odds}
              </span>

              {/* Card */}
              <div className="flex h-[126px] w-[58px] flex-col items-center justify-between border-2 border-[#f2e600] bg-white py-1">
                <span className="text-[35px] font-bold leading-[38px] text-black">
                  {card.value}
                </span>

                <div className="grid w-full grid-cols-2 px-1 text-[24px] font-bold leading-[25px]">
                  <span className="text-black">♠</span>
                  <span className="text-red-600">♦</span>
                  <span className="text-black">♣</span>
                  <span className="text-red-600">♥</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Queen (queen)
// --------------------------------------------------------------------------
function TableQueen({ isMobile, isSuspended, openBetSlip }) {
  const cards = [
    { label: 'Card 1', odds: '2.85' },
    { label: 'Card 2', odds: '2.85' },
    { label: 'Card 3', odds: '2.85' },
  ];

  return (
    <div className="casino-table queen">
      <div className="casino-table-box p-3 border rounded text-center">
        <h5 className="fw-bold mb-3">Queen (Find the Queen)</h5>
        
        {/* 3 Positions */}
        <div className="row g-3 mb-3">
          {cards.map((c) => (
            <div key={c.label} className="col-4">
              <div
                className={`card-odd-box p-3 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(c.label, c.odds, 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <div className="fw-bold fs-5">{c.label}</div>
                <div className="casino-odds text-primary fs-4">{isSuspended ? '-' : c.odds}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Color and Suits */}
        <div className="row g-2 justify-content-center">
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Red Queen (♥/♦)', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold text-danger">Red Queen</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Black Queen (♠/♣)', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold text-dark">Black Queen</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Race20 (race20)
// --------------------------------------------------------------------------
function TableRace20({ isMobile, isSuspended, openBetSlip }) {
  const kings = [
    { id: 'spade', name: 'Spade King', code: 'KSS', symbol: '♠', color: '#000', oddsYes: '3.75', oddsNo: '1.25' },
    { id: 'heart', name: 'Heart King', code: 'KHH', symbol: '♥', color: '#e53935', oddsYes: '3.75', oddsNo: '1.25' },
    { id: 'club', name: 'Club King', code: 'KCC', symbol: '♣', color: '#000', oddsYes: '3.75', oddsNo: '1.25' },
    { id: 'diamond', name: 'Diamond King', code: 'KDD', symbol: '♦', color: '#e53935', oddsYes: '3.75', oddsNo: '1.25' },
  ];

  return (
    <div className="casino-table race race20">
      <div className="casino-table-box p-3 border rounded">
        <h5 className="fw-bold text-center mb-3">4 Kings Race to 20</h5>
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>King</th>
                <th>Card</th>
                <th style={{ width: '120px' }}>YES (Back)</th>
                <th style={{ width: '120px' }}>NO (Lay)</th>
              </tr>
            </thead>
            <tbody>
              {kings.map((k) => (
                <tr key={k.id}>
                  <td className="fw-bold text-start ps-3" style={{ color: k.color }}>
                    <span className="fs-5 me-2">{k.symbol}</span>
                    {k.name}
                  </td>
                  <td>
                    <img
                      src={`/assets/img/cards/${k.code}.jpg`}
                      onError={(e) => {
                        e.currentTarget.src = `https://cdn.926assets.com/g3ver/v107/static/front/img/cards/${k.code}.jpg`;
                      }}
                      alt={k.name}
                      style={{ height: '36px', borderRadius: '4px' }}
                    />
                  </td>
                  <td>
                    <OddsBox nation={`${k.name} YES`} odds={k.oddsYes} type="back" />
                  </td>
                  <td>
                    <OddsBox nation={`${k.name} NO`} odds={k.oddsNo} type="lay" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Lucky 7 - C (lucky7eu2)
// --------------------------------------------------------------------------
function TableLucky7eu2({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className="casino-table lucky7a">
      <div className="casino-table-box">
        <div className="casino-table-full-box">
          <div className="lucky7low">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.low?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Low Card', markets?.low?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Low Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.seven?.back || '12')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Exact 7', markets?.seven?.back || '12', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Exact 7</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7high">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.high?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('High Card', markets?.high?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">High Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>
        </div>

        <div className="casino-table-box mt-3">
          <div className="casino-table-left-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.even?.back || '2.10')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Even', markets?.even?.back || '2.10', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Even</span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.odd?.back || '1.79')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Odd', markets?.odd?.back || '1.79', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Odd</span>
              </div>
            </div>
          </div>

          <div className="casino-table-right-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.red?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Red', markets?.red?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-red">Red</span></span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.black?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Black', markets?.black?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-black">Black</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="casino-table-box mt-3 d-flex justify-content-between gap-2">
          {[
            { label: 'A-2-3', odds: '4.00' },
            { label: '4-5-6', odds: '4.00' },
            { label: '8-9-10', odds: '4.00' },
            { label: 'J-Q-K', odds: '4.00' },
          ].map((grp) => (
            <div key={grp.label} className="lucky7cards flex-fill text-center">
              <div className="casino-odds w-100 text-center fw-bold">{isSuspended ? '-' : grp.odds}</div>
              <div
                className={`card-odd-box-container p-1 border rounded ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Group ${grp.label}`, grp.odds, 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', background: '#273646' }}
              >
                <span className="fw-bold text-white">{grp.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="casino-table-full-box lucky7acards mt-3">
          <div className="casino-odds w-100 text-center fw-bold mb-1">Cards 1 to 13 (Payout 12.0)</div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '40px', textAlign: 'center' }}
              >
                <div className="casino-odds">{isSuspended ? '-' : '12'}</div>
                <div className="fw-bold">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Super Over (superover)
// --------------------------------------------------------------------------
function TableSuperover({ isMobile, isSuspended, openBetSlip }) {
  const outcomes = [
    { label: '0 Runs (Dot)', odds: '2.50' },
    { label: '1 Run', odds: '2.20' },
    { label: '2 Runs', odds: '4.50' },
    { label: '3 Runs', odds: '12.00' },
    { label: '4 Runs (Boundary)', odds: '5.50' },
    { label: '6 Runs (Sixer)', odds: '8.00' },
    { label: 'Wicket', odds: '4.00' },
    { label: 'Wide / No Ball', odds: '6.00' },
  ];

  return (
    <div className="casino-table cricket superover">
      <div className="casino-table-box text-center p-3 border rounded">
        <h5 className="fw-bold mb-3">Super Over - Live Ball Prediction</h5>
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
          {outcomes.map((o) => (
            <div
              key={o.label}
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip(o.label, o.odds, 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '110px', textAlign: 'center' }}
            >
              <div className="casino-odds">{isSuspended ? '-' : o.odds}</div>
              <div className="fw-bold small">{o.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: The Trap (trap)
// --------------------------------------------------------------------------
function TableTrap({ isMobile, isSuspended, openBetSlip }) {
  return (
    <div className="casino-table trap">
      <div className="casino-table-box p-3 border rounded text-center">
        <h5 className="fw-bold mb-3">The Trap - Escape Duel</h5>
        
        {/* Core Inside vs Outside vs Trap Hit */}
        <div className="row g-3 mb-3">
          <div className="col-4">
            <div
              className={`card-odd-box p-3 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Inside (Between Limits)', '2.00', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Inside</div>
              <div className="small text-muted">Falls Between</div>
              <div className="casino-odds text-primary fs-5">{isSuspended ? '-' : '2.00'}</div>
            </div>
          </div>
          <div className="col-4">
            <div
              className={`card-odd-box p-3 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Outside (Beyond Limits)', '2.00', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Outside</div>
              <div className="small text-muted">Falls Outside</div>
              <div className="casino-odds text-primary fs-5">{isSuspended ? '-' : '2.00'}</div>
            </div>
          </div>
          <div className="col-4">
            <div
              className={`card-odd-box p-3 border rounded bg-warning bg-opacity-25 border-warning ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Trap Hit (Exact Match)', '15.00', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold text-danger">Trap Hit</div>
              <div className="small text-muted">Matches Limit</div>
              <div className="casino-odds text-danger fs-5">{isSuspended ? '-' : '15.00'}</div>
            </div>
          </div>
        </div>

        {/* Seven Up-Down Trap Box */}
        <div className="seven-up-down-box p-2 bg-light border rounded mb-2">
          <h6 className="fw-bold text-muted mb-2">The Trap 7 High/Low</h6>
          <div className="row g-2">
            <div className="col-4">
              <div
                className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Down (< 7)', '2.00', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <div className="fw-bold">Down (&lt; 7)</div>
                <div className="casino-odds">{isSuspended ? '-' : '2.00'}</div>
              </div>
            </div>
            <div className="col-4">
              <div
                className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Trap Seven (= 7)', '12.00', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <div className="fw-bold text-danger">Trap Seven (= 7)</div>
                <div className="casino-odds text-danger">{isSuspended ? '-' : '12.00'}</div>
              </div>
            </div>
            <div className="col-4">
              <div
                className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Up (> 7)', '2.00', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <div className="fw-bold">Up (&gt; 7)</div>
                <div className="casino-odds">{isSuspended ? '-' : '2.00'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 2 Cards Teenpatti (patti2)
// --------------------------------------------------------------------------
function TablePatti2({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      mainBack: markets?.playerA?.back || '1.96',
      mainLay: markets?.playerA?.lay || '0',
      miniBaccarat: markets?.miniBaccaratA?.back || '2.59',
      totalBack: markets?.totalA?.back || '34',
      totalLay: markets?.totalA?.lay || '43',
      totalBackTop: '14',
      totalLayTop: '15',
    },
    {
      name: 'Player B',
      mainBack: markets?.playerB?.back || '1.96',
      mainLay: markets?.playerB?.lay || '0',
      miniBaccarat: markets?.miniBaccaratB?.back || '1.85',
      totalBack: markets?.totalB?.back || '95',
      totalLay: markets?.totalB?.lay || '105',
      totalBackTop: '14',
      totalLayTop: '15',
    },
  ];

  const PlayerSection = ({ player }) => (
    <div className="min-w-0 overflow-hidden border border-[#c9c9c9]">

      {/* Main */}
      <div className="grid grid-cols-[3fr_1fr_1fr] border-b border-[#c9c9c9]">
        <div className="flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          {player.name}
        </div>

        <button
          type="button"
          onClick={() =>
            openBetSlip(player.name, player.mainBack, 'back', isMobile)
          }
          className="flex h-[48px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base"
        >
          {player.mainBack}
        </button>

        <button
          type="button"
          onClick={() =>
            openBetSlip(player.name, player.mainLay, 'lay', isMobile)
          }
          className="flex h-[48px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] hover:bg-[#ed91a7] sm:text-base"
        >
          {player.mainLay}
        </button>
      </div>

      {/* Mini Baccarat */}
      <div className="grid grid-cols-[3fr_2fr] border-b border-[#c9c9c9]">
        <div className="flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          Mini Baccarat {player.name.slice(-1)}
        </div>

        <button
          type="button"
          onClick={() =>
            openBetSlip(
              `Mini Baccarat ${player.name.slice(-1)}`,
              player.miniBaccarat,
              'back',
              isMobile
            )
          }
          className="flex h-[48px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base"
        >
          {player.miniBaccarat}
        </button>
      </div>

      {/* Total */}
      <div className="grid grid-cols-[3fr_1fr_1fr]">
        <div className="flex h-[48px] items-center bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          Total {player.name.slice(-1)}
        </div>

        {/* Total Back */}
        <button
          type="button"
          onClick={() =>
            openBetSlip(
              `Total ${player.name.slice(-1)}`,
              player.totalBack,
              'lay',
              isMobile
            )
          }
          className="flex h-[48px] flex-col items-center justify-center bg-[#f5a5b8] text-[#333333] hover:brightness-95"
        >
          <span className="text-xs leading-4">
            {player.totalBackTop}
          </span>
          <span className="text-sm font-bold leading-4 sm:text-base">
            {player.totalBack}
          </span>
        </button>

        {/* Total Lay */}
        <button
          type="button"
          onClick={() =>
            openBetSlip(
              `Total ${player.name.slice(-1)}`,
              player.totalLay,
              'back',
              isMobile
            )
          }
          className="flex h-[48px] flex-col items-center justify-center bg-[#72b9e8] text-[#333333] hover:brightness-95"
        >
          <span className="text-xs leading-4">
            {player.totalLayTop}
          </span>
          <span className="text-sm font-bold leading-4 sm:text-base">
            {player.totalLay}
          </span>
        </button>
      </div>
    </div>
  );

  const colorPlusOdds = markets?.colorPlus?.back || '0';

  return (
    <div className="w-full space-y-2">

      {/* Player A & Player B */}
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => (
          <PlayerSection
            key={player.name}
            player={player}
          />
        ))}
      </div>

      {/* Color Plus */}
      <button
        type="button"
        onClick={() =>
          openBetSlip('Color Plus', colorPlusOdds, 'back', isMobile)
        }
        className="flex h-[48px] w-full items-center justify-center bg-[#414b54] text-sm font-bold text-white transition-colors hover:bg-[#35414a] sm:text-base"
      >
        Color Plus
      </button>

    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 29Card Baccarat (teensin)
// --------------------------------------------------------------------------
function TableTeensin({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table teensin">
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Nation</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player A</div></div>
              <OddsBox nation="Player A" odds={markets?.playerA?.back || '1.98'} type="back" />
              <OddsBox nation="Player A" odds={markets?.playerA?.lay || '2.02'} type="lay" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player B</div></div>
              <OddsBox nation="Player B" odds={markets?.playerB?.back || '1.98'} type="back" />
              <OddsBox nation="Player B" odds={markets?.playerB?.lay || '2.02'} type="lay" />
            </div>
          </div>
        </div>

        <div className="casino-table-right-box mt-3 mt-md-0">
          <div className="teenpatti20-other-oods">
            <div className="casino-table-header">
              <div className="casino-nation-detail">Side Bets</div>
              <div className="casino-odds-box back">Back</div>
            </div>
            <div className="casino-table-body">
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus A</div>
                <OddsBox nation="Pair Plus A" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus B</div>
                <OddsBox nation="Pair Plus B" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat A</div>
                <OddsBox nation="3 Baccarat A" odds="1.95" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat B</div>
                <OddsBox nation="3 Baccarat B" odds="1.95" type="back" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Muflis Teenpatti (teenmuf)
// --------------------------------------------------------------------------
function TableTeenmuf({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      suffix: 'A',
      winner: markets?.playerA?.back || '1.98',
      top9: 'A',
      baccarat: markets?.miniBaccaratA?.back || '1.95',
    },
    {
      name: 'Player B',
      suffix: 'B',
      winner: markets?.playerB?.back || '1.98',
      top9: 'B',
      baccarat: markets?.miniBaccaratB?.back || '1.95',
    },
  ];

  const PlayerSection = ({ player }) => {
    const marketsList = [
      {
        name: 'Winner',
        value: player.winner,
        marketName: `Winner ${player.suffix}`,
      },
      {
        name: 'Top 9',
        value: player.top9,
        marketName: `Top 9 ${player.suffix}`,
      },
      {
        name: `M Baccarat ${player.suffix}`,
        value: player.baccarat,
        marketName: `M Baccarat ${player.suffix}`,
      },
    ];

    return (
      <div className="min-w-0 overflow-hidden border border-[#c9c9c9]">
        {/* Player Header */}
        <div className="flex h-[48px] items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2">
          <span className="text-sm font-bold text-[#333333] sm:text-base">
            {player.name}
          </span>
        </div>

        {/* Market Names */}
        <div className="grid grid-cols-3">
          {marketsList.map((market, index) => (
            <div
              key={market.name}
              className={`flex h-[48px] min-w-0 items-center justify-center bg-[#f1f1f1] px-1 text-center text-xs font-bold text-[#333333] sm:text-base ${
                index !== 0 ? 'border-l border-[#c9c9c9]' : ''
              }`}
            >
              {market.name}
            </div>
          ))}
        </div>

        {/* Odds */}
        <div className="grid grid-cols-3">
          {marketsList.map((market, index) => (
            <button
              key={market.marketName}
              type="button"
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(
                  market.marketName,
                  market.value,
                  'back',
                  isMobile
                )
              }
              className={`flex h-[48px] min-w-0 items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#333333] transition-colors hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base ${
                index !== 0 ? 'border-l border-[#c9c9c9]' : ''
              }`}
            >
              {market.value}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => (
          <PlayerSection key={player.name} player={player} />
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Race To 17 (race17)
// --------------------------------------------------------------------------
function TableRace17({ isMobile, isSuspended, openBetSlip }) {
  const kings = [
    { id: 'spade', name: 'Spade King', code: 'KSS', symbol: '♠', color: '#000', oddsYes: '3.75', oddsNo: '1.25' },
    { id: 'heart', name: 'Heart King', code: 'KHH', symbol: '♥', color: '#e53935', oddsYes: '3.75', oddsNo: '1.25' },
    { id: 'club', name: 'Club King', code: 'KCC', symbol: '♣', color: '#000', oddsYes: '3.75', oddsNo: '1.25' },
    { id: 'diamond', name: 'Diamond King', code: 'KDD', symbol: '♦', color: '#e53935', oddsYes: '3.75', oddsNo: '1.25' },
  ];

  return (
    <div className="casino-table race race17">
      <div className="casino-table-box p-3 border rounded">
        <h5 className="fw-bold text-center mb-3">4 Kings Race to 20</h5>
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>King</th>
                <th>Card</th>
                <th style={{ width: '120px' }}>YES (Back)</th>
                <th style={{ width: '120px' }}>NO (Lay)</th>
              </tr>
            </thead>
            <tbody>
              {kings.map((k) => (
                <tr key={k.id}>
                  <td className="fw-bold text-start ps-3" style={{ color: k.color }}>
                    <span className="fs-5 me-2">{k.symbol}</span>
                    {k.name}
                  </td>
                  <td>
                    <img
                      src={`/assets/img/cards/${k.code}.jpg`}
                      onError={(e) => {
                        e.currentTarget.src = `https://cdn.926assets.com/g3ver/v107/static/front/img/cards/${k.code}.jpg`;
                      }}
                      alt={k.name}
                      style={{ height: '36px', borderRadius: '4px' }}
                    />
                  </td>
                  <td>
                    <OddsBox nation={`${k.name} YES`} odds={k.oddsYes} type="back" />
                  </td>
                  <td>
                    <OddsBox nation={`${k.name} NO`} odds={k.oddsNo} type="lay" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 20-20 Teenpatti B (teen20b)
// --------------------------------------------------------------------------
function TableTeen20b({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      suffix: 'A',
      markets: [
        {
          name: 'Player A',
          odds: markets?.playerA?.back || '1.98',
        },
        {
          name: '3 Baccarat A',
          odds: markets?.baccaratA?.back || '1.98',
        },
        {
          name: 'Total A',
          odds: markets?.totalA?.back || '2',
        },
        {
          name: 'Pair Plus A',
          odds: 'A',
        },
      ],
      suits: [
        {
          name: 'Spade Club A',
          icons: ['♠', '♣'],
          odds: markets?.spadeClubA?.back || '1.98',
        },
        {
          name: 'Heart Diamond A',
          icons: ['♥', '♦'],
          odds: markets?.heartDiamondA?.back || '1.98',
        },
      ],
    },
    {
      name: 'Player B',
      suffix: 'B',
      markets: [
        {
          name: 'Player B',
          odds: markets?.playerB?.back || '1.98',
        },
        {
          name: '3 Baccarat B',
          odds: markets?.baccaratB?.back || '1.98',
        },
        {
          name: 'Total B',
          odds: markets?.totalB?.back || '2',
        },
        {
          name: 'Pair Plus B',
          odds: 'B',
        },
      ],
      suits: [
        {
          name: 'Spade Club B',
          icons: ['♠', '♣'],
          odds: markets?.spadeClubB?.back || '1.98',
        },
        {
          name: 'Heart Diamond B',
          icons: ['♥', '♦'],
          odds: markets?.heartDiamondB?.back || '1.98',
        },
      ],
    },
  ];

  const PlayerSection = ({ player }) => (
    <div className="min-w-0">
      {/* Player Heading */}
      <div className="flex h-[48px] items-center border border-[#c9c9c9] bg-[#f1f1f1] px-2">
        <span className="text-sm font-bold text-[#333333] sm:text-base">
          {player.name}
        </span>
      </div>

      {/* Market Names */}
      <div className="grid grid-cols-4">
        {player.markets.map((market) => (
          <div
            key={market.name}
            className="flex h-[46px] min-w-0 items-center justify-center border border-[#c9c9c9] bg-[#f1f1f1] px-1 text-center text-xs font-bold text-[#333333] sm:text-sm"
          >
            {market.name}
          </div>
        ))}
      </div>

      {/* Market Odds */}
      <div className="grid grid-cols-4">
        {player.markets.map((market) => (
          <button
            key={market.name}
            type="button"
            onClick={() =>
              openBetSlip(market.name, market.odds, 'back', isMobile)
            }
            className="flex h-[46px] min-w-0 items-center justify-center border border-[#c9c9c9] bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base"
          >
            {market.odds}
          </button>
        ))}
      </div>

      {/* Suit Bets */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {player.suits.map((suit) => (
          <button
            key={suit.name}
            type="button"
            onClick={() =>
              openBetSlip(suit.name, suit.odds, 'back', isMobile)
            }
            className="flex h-[48px] min-w-0 items-center justify-between bg-[#72b9e8] px-2 hover:bg-[#5da9dc]"
          >
            <div className="flex items-center gap-1 text-2xl">
              {suit.icons.map((icon) => (
                <span
                  key={icon}
                  className={
                    icon === '♥' || icon === '♦'
                      ? 'text-[#e52c32]'
                      : 'text-black'
                  }
                >
                  {icon}
                </span>
              ))}
            </div>

            <span className="text-sm font-bold text-[#333333] sm:text-base">
              {suit.odds}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => (
          <PlayerSection key={player.name} player={player} />
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Trio (trio)
// --------------------------------------------------------------------------
function TableTrio({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table trio">
      <div className="casino-table-box">
        <div className="d-flex justify-content-between gap-2 mb-3">
          <div className="w-100 border p-2 rounded">
            <div className="fw-bold">Player 1</div>
            <div className="d-flex gap-2 mt-1">
              <OddsBox nation="Player 1" odds="2.95" type="back" className="w-50" />
              <OddsBox nation="Player 1" odds="3.05" type="lay" className="w-50" />
            </div>
          </div>
          <div className="w-100 border p-2 rounded">
            <div className="fw-bold">Player 2</div>
            <div className="d-flex gap-2 mt-1">
              <OddsBox nation="Player 2" odds="2.95" type="back" className="w-50" />
              <OddsBox nation="Player 2" odds="3.05" type="lay" className="w-50" />
            </div>
          </div>
          <div className="w-100 border p-2 rounded">
            <div className="fw-bold">Player 3</div>
            <div className="d-flex gap-2 mt-1">
              <OddsBox nation="Player 3" odds="2.95" type="back" className="w-50" />
              <OddsBox nation="Player 3" odds="3.05" type="lay" className="w-50" />
            </div>
          </div>
        </div>

        <div className="casino-table-box triocards mt-3">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Side Bets (Hand Combinations)</div>
            <div className="casino-odds-box back">Back Rate</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail">Pair (Payout 5.5)</div>
              <OddsBox nation="Pair" odds="5.5" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Flush (Payout 17.0)</div>
              <OddsBox nation="Flush" odds="17.0" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Straight (Payout 24.0)</div>
              <OddsBox nation="Straight" odds="24.0" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Trio (Payout 201.0)</div>
              <OddsBox nation="Trio" odds="201.0" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Straight Flush (Payout 226.0)</div>
              <OddsBox nation="Straight Flush" odds="226.0" type="back" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Note Number (notenum)
// --------------------------------------------------------------------------
function TableNotenum({ isMobile, isSuspended, openBetSlip }) {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="casino-table notenum">
      <div className="casino-table-box p-3 border rounded text-center">
        <h5 className="fw-bold mb-3">Note Number (Ending Digit 0 - 9)</h5>
        
        {/* Digits 0-9 */}
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
          {digits.map((n) => (
            <div
              key={n}
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip(`Number ${n}`, '9.50', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '55px' }}
            >
              <div className="casino-odds">{isSuspended ? '-' : '9.50'}</div>
              <div className="fw-bold h5 mb-0">{n}</div>
            </div>
          ))}
        </div>

        {/* Odd/Even, Low/High */}
        <div className="row g-2 justify-content-center">
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Even Digit', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Even</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Odd Digit', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Odd</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Low (0-4)', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Low (0-4)</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('High (5-9)', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">High (5-9)</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 1 CARD 20-20 (teen120)
// --------------------------------------------------------------------------
function TableTeen120({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.95',
      lay: markets?.playerA?.lay || '2.00',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.95',
      lay: markets?.playerB?.lay || '2.00',
    },
  ];

  const sideBets = [
    {
      name: 'Pair Plus A',
      odds: markets?.pairPlusA?.back || '2.0',
    },
    {
      name: 'Pair Plus B',
      odds: markets?.pairPlusB?.back || '2.0',
    },
    {
      name: '3 Baccarat A',
      odds: markets?.baccaratA?.back || '1.95',
    },
    {
      name: '3 Baccarat B',
      odds: markets?.baccaratB?.back || '1.95',
    },
  ];

  return (
    <div className="grid w-full grid-cols-2 items-start gap-3">

      {/* LEFT: Player A / Player B */}
      <div className="min-w-0 overflow-hidden rounded-lg border border-[#d8dee5] bg-white shadow-sm">

        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_68px_68px] bg-[#4b5b6b]">
          <div className="flex h-[44px] items-center px-3 text-sm font-bold text-white">
            Nation
          </div>

          <div className="flex h-[44px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#253746]">
            Back
          </div>

          <div className="flex h-[44px] items-center justify-center bg-[#f5a5b8] text-sm font-bold text-[#253746]">
            Lay
          </div>
        </div>

        {/* Player Rows */}
        {players.map((player, index) => (
          <div
            key={player.name}
            className={`grid grid-cols-[minmax(0,1fr)_68px_68px] ${
              index % 2 === 0 ? 'bg-white' : 'bg-[#f6f7f8]'
            }`}
          >
            <div className="flex h-[56px] items-center px-3 text-sm font-bold text-[#343a40]">
              {player.name}
            </div>

            <button
              type="button"
              onClick={() =>
                openBetSlip(player.name, player.back, 'back', isMobile)
              }
              className="flex h-[56px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#253746] hover:bg-[#5da9dc]"
            >
              {player.back}
            </button>

            <button
              type="button"
              onClick={() =>
                openBetSlip(player.name, player.lay, 'lay', isMobile)
              }
              className="flex h-[56px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#253746] hover:bg-[#ed91a7]"
            >
              {player.lay}
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT: Side Bets */}
      <div className="min-w-0 overflow-hidden rounded-lg border border-[#d8dee5] bg-white shadow-sm">

        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_76px] bg-[#4b5b6b]">
          <div className="flex h-[44px] items-center px-3 text-sm font-bold text-white">
            Side Bets
          </div>

          <div className="flex h-[44px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#253746]">
            Back
          </div>
        </div>

        {/* Side Bet Rows */}
        {sideBets.map((bet, index) => (
          <div
            key={bet.name}
            className={`grid grid-cols-[minmax(0,1fr)_76px] ${
              index % 2 === 0 ? 'bg-white' : 'bg-[#f6f7f8]'
            }`}
          >
            <div className="flex h-[56px] min-w-0 items-center px-3 text-sm font-bold text-[#343a40]">
              {bet.name}
            </div>

            <button
              type="button"
              onClick={() =>
                openBetSlip(bet.name, bet.odds, 'back', isMobile)
              }
              className="flex h-[56px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#253746] hover:bg-[#5da9dc]"
            >
              {bet.odds}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
// --------------------------------------------------------------------------
// Game: 1 CARD ONE-DAY (teen1)
// --------------------------------------------------------------------------
function TableTeen1({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideBets = [
    {
      name: 'Pair Plus A',
      odds: markets?.pairPlusA?.back || '2.0',
    },
    {
      name: 'Pair Plus B',
      odds: markets?.pairPlusB?.back || '2.0',
    },
    {
      name: '3 Baccarat A',
      odds: markets?.baccaratA?.back || '1.95',
    },
    {
      name: '3 Baccarat B',
      odds: markets?.baccaratB?.back || '1.95',
    },
  ];

  return (
    <div className="grid w-full grid-cols-2 items-start gap-3">

      {/* LEFT: Players */}
      <div className="min-w-0 overflow-hidden rounded-lg border border-[#d8dee5] bg-white shadow-sm">

        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_68px_68px] bg-[#4b5b6b]">
          <div className="flex h-[44px] items-center px-3 text-sm font-bold text-white">
            Nation
          </div>

          <div className="flex h-[44px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#253746]">
            Back
          </div>

          <div className="flex h-[44px] items-center justify-center bg-[#f5a5b8] text-sm font-bold text-[#253746]">
            Lay
          </div>
        </div>

        {/* Player Rows */}
        {players.map((player, index) => (
          <div
            key={player.name}
            className={`grid grid-cols-[minmax(0,1fr)_68px_68px] ${
              index % 2 === 0 ? 'bg-white' : 'bg-[#f6f7f8]'
            }`}
          >
            <div className="flex h-[56px] items-center px-3 text-sm font-bold text-[#343a40]">
              {player.name}
            </div>

            <button
              type="button"
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(player.name, player.back, 'back', isMobile)
              }
              className="flex h-[56px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#253746] hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {player.back}
            </button>

            <button
              type="button"
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(player.name, player.lay, 'lay', isMobile)
              }
              className="flex h-[56px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#253746] hover:bg-[#ed91a7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {player.lay}
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT: Side Bets */}
      <div className="min-w-0 overflow-hidden rounded-lg border border-[#d8dee5] bg-white shadow-sm">

        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_76px] bg-[#4b5b6b]">
          <div className="flex h-[44px] items-center px-3 text-sm font-bold text-white">
            Side Bets
          </div>

          <div className="flex h-[44px] items-center justify-center bg-[#72b9e8] text-sm font-bold text-[#253746]">
            Back
          </div>
        </div>

        {/* Side Bet Rows */}
        {sideBets.map((bet, index) => (
          <div
            key={bet.name}
            className={`grid grid-cols-[minmax(0,1fr)_76px] ${
              index % 2 === 0 ? 'bg-white' : 'bg-[#f6f7f8]'
            }`}
          >
            <div className="flex h-[56px] min-w-0 items-center px-3 text-sm font-bold text-[#343a40]">
              {bet.name}
            </div>

            <button
              type="button"
              disabled={isSuspended}
              onClick={() =>
                openBetSlip(bet.name, bet.odds, 'back', isMobile)
              }
              className="flex h-[56px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#253746] hover:bg-[#5da9dc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bet.odds}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: ANDAR BAHAR 50 cards (ab3)
// --------------------------------------------------------------------------

function TableAb3({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
  ];

  const odds = ["1", "2", "2", "1", "1", "1", "1", "2", "2", "0", "3", "0", "2"];

  const renderCard = (card, index, type) => {
    const cardOdds =
      markets?.[type.toLowerCase()]?.cards?.[index]?.back ?? odds[index];

    // Screenshot mein 10 aur Q card backs hain
    const isCardBack = index === 9 || index === 11;

    return (
      <button
        key={`${type}-${card}`}
        type="button"
        disabled={isSuspended}
        onClick={() =>
          openBetSlip(`${type} ${card}`, cardOdds, "back", isMobile)
        }
        className="flex w-[54px] shrink-0 flex-col items-center gap-1 border-0 bg-transparent p-0 disabled:cursor-not-allowed sm:w-[58px]"
      >
        <span className="h-[22px] text-[14px] font-bold leading-[22px] text-[#333] sm:text-[16px]">
          {isSuspended ? "-" : cardOdds}
        </span>

        {isCardBack ? (
          <div
            className="h-[64px] w-full border-2 border-yellow-300 p-[3px]"
            style={{
              backgroundColor: "#fff",
              backgroundImage:
                "radial-gradient(#2879c5 1px, transparent 1px), radial-gradient(#2879c5 1px, transparent 1px)",
              backgroundPosition: "0 0, 3px 3px",
              backgroundSize: "6px 6px",
            }}
          >
            <div className="h-full w-full border border-[#7ba8d0]" />
          </div>
        ) : (
          <div className="flex h-[64px] w-full flex-col justify-between border-2 border-yellow-300 bg-white px-1 py-0.5">
            <span className="text-left text-[27px] font-bold leading-[27px] text-black">
              {card}
            </span>

            <div className="flex justify-between text-[19px] font-bold leading-[17px]">
              <span className="text-black">♠</span>
              <span className="text-red-600">♦</span>
            </div>

            <div className="flex justify-between text-[19px] font-bold leading-[17px]">
              <span className="text-black">♣</span>
              <span className="text-red-600">♥</span>
            </div>
          </div>
        )}
      </button>
    );
  };

  const renderRow = (type) => (
    <div
      className={`grid min-h-[112px] grid-cols-[100px_minmax(0,1fr)] border-2 border-black sm:min-h-[125px] sm:grid-cols-[205px_minmax(0,1fr)] ${
        type === "ANDAR" ? "bg-[#fca3a3]" : "bg-[#ffe59a]"
      }`}
    >
      <div className="flex items-center justify-center border-r-2 border-black">
        <span className="text-[17px] font-bold text-[#333] sm:text-[21px]">
          {type}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-center gap-1 overflow-x-auto px-1 py-2 sm:gap-2 sm:px-2">
        {cards.map((card, index) => renderCard(card, index, type))}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-0 bg-white">
      {renderRow("ANDAR")}
      {renderRow("BAHAR")}
    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Amar Akbar Anthony 2 (aaa2)
// --------------------------------------------------------------------------
function TableAaa2({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className="casino-table aaa">
      <div className="casino-table-box">
        <div className="d-flex justify-content-between w-100 gap-2 mb-3">
          <div className="casino-odd-box-container w-100">
            <div className="casino-nation-name">A. Amar</div>
            <OddsBox nation="A. Amar" odds={markets?.amar?.back || '2.95'} type="back" />
            <OddsBox nation="A. Amar" odds={markets?.amar?.lay || '3.05'} type="lay" />
          </div>
          <div className="casino-odd-box-container w-100">
            <div className="casino-nation-name">B. Akbar</div>
            <OddsBox nation="B. Akbar" odds={markets?.akbar?.back || '2.95'} type="back" />
            <OddsBox nation="B. Akbar" odds={markets?.akbar?.lay || '3.05'} type="lay" />
          </div>
          <div className="casino-odd-box-container w-100">
            <div className="casino-nation-name">C. Anthony</div>
            <OddsBox nation="C. Anthony" odds={markets?.anthony?.back || '2.95'} type="back" />
            <OddsBox nation="C. Anthony" odds={markets?.anthony?.lay || '3.05'} type="lay" />
          </div>
        </div>

        <div className="casino-table-box mt-3 d-flex justify-content-between w-100 gap-2">
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Even', '2.10', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold">Even</div><div className="casino-odds">{isSuspended ? '-' : '2.10'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Odd', '1.79', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold">Odd</div><div className="casino-odds">{isSuspended ? '-' : '1.79'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Red', '1.95', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold text-danger">Red</div><div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Black', '1.95', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold text-dark">Black</div><div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
          </div>
        </div>

        <div className="casino-table-full-box aaacards mt-3">
          <div className="casino-odds w-100 text-center fw-bold mb-1">13 Cards Market (Payout 12.0)</div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '40px', textAlign: 'center' }}
              >
                <div className="casino-odds">{isSuspended ? '-' : '12'}</div>
                <div className="fw-bold">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Race to 2nd (race2)
// --------------------------------------------------------------------------
function TableRace2({ isMobile, isSuspended, openBetSlip }) {
  const kings = [
    { id: 'spade', name: 'Spade King', code: 'KSS', symbol: '♠', color: '#000', oddsYes: '3.75', oddsNo: '1.25' },
    { id: 'heart', name: 'Heart King', code: 'KHH', symbol: '♥', color: '#e53935', oddsYes: '3.75', oddsNo: '1.25' },
    { id: 'club', name: 'Club King', code: 'KCC', symbol: '♣', color: '#000', oddsYes: '3.75', oddsNo: '1.25' },
    { id: 'diamond', name: 'Diamond King', code: 'KDD', symbol: '♦', color: '#e53935', oddsYes: '3.75', oddsNo: '1.25' },
  ];

  return (
    <div className="casino-table race race2">
      <div className="casino-table-box p-3 border rounded">
        <h5 className="fw-bold text-center mb-3">4 Kings Race to 20</h5>
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>King</th>
                <th>Card</th>
                <th style={{ width: '120px' }}>YES (Back)</th>
                <th style={{ width: '120px' }}>NO (Lay)</th>
              </tr>
            </thead>
            <tbody>
              {kings.map((k) => (
                <tr key={k.id}>
                  <td className="fw-bold text-start ps-3" style={{ color: k.color }}>
                    <span className="fs-5 me-2">{k.symbol}</span>
                    {k.name}
                  </td>
                  <td>
                    <img
                      src={`/assets/img/cards/${k.code}.jpg`}
                      onError={(e) => {
                        e.currentTarget.src = `https://cdn.926assets.com/g3ver/v107/static/front/img/cards/${k.code}.jpg`;
                      }}
                      alt={k.name}
                      style={{ height: '36px', borderRadius: '4px' }}
                    />
                  </td>
                  <td>
                    <OddsBox nation={`${k.name} YES`} odds={k.oddsYes} type="back" />
                  </td>
                  <td>
                    <OddsBox nation={`${k.name} NO`} odds={k.oddsNo} type="lay" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Instant Teenpatti (teen3)
// --------------------------------------------------------------------------
function TableTeen3({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.96',
      lay: markets?.playerA?.lay || '0',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.96',
      lay: markets?.playerB?.lay || '0',
    },
  ];

  const PlayerSection = ({ player }) => (
    <div className="min-w-0 overflow-hidden border border-[#c9c9c9]">
      {/* Header */}
      <div className="grid grid-cols-[3fr_1fr_1fr]">
        <div className="flex h-[48px] items-center border-b border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          {player.name}
        </div>

        <div className="flex h-[48px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] sm:text-base">
          Back
        </div>

        <div className="flex h-[48px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] sm:text-base">
          Lay
        </div>
      </div>

      {/* Main Market */}
      <div className="grid grid-cols-[3fr_1fr_1fr]">
        <div className="flex h-[48px] items-center border-t border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333333] sm:text-base">
          Main
        </div>

        <button
          type="button"
          onClick={() =>
            openBetSlip(player.name, player.back, 'back', isMobile)
          }
          className="flex h-[48px] items-center justify-center border-l border-white bg-[#72b9e8] text-sm font-bold text-[#333333] hover:bg-[#5da9dc] sm:text-base"
        >
          {player.back}
        </button>

        <button
          type="button"
          onClick={() =>
            openBetSlip(player.name, player.lay, 'lay', isMobile)
          }
          className="flex h-[48px] items-center justify-center border-l border-white bg-[#f5a5b8] text-sm font-bold text-[#333333] hover:bg-[#ed91a7] sm:text-base"
        >
          {player.lay}
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid w-full grid-cols-2 gap-2">
      {players.map((player) => (
        <PlayerSection key={player.name} player={player} />
      ))}
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: 10 Dosh / Dum 10 (dum10)
// --------------------------------------------------------------------------
function TableDum10({ isMobile, isSuspended, openBetSlip }) {
  const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="casino-table dum10">
      <div className="casino-table-box p-3 border rounded text-center">
        <h5 className="fw-bold mb-3">10 Dosh / Dum 10 (Pick 1 to 10)</h5>
        
        {/* Card 1 to 10 Grid */}
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
          {cards.map((c) => (
            <div
              key={c}
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip(`Card ${c}`, '9.50', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '60px' }}
            >
              <div className="casino-odds">{isSuspended ? '-' : '9.50'}</div>
              <div className="fw-bold h5 mb-0">{c}</div>
            </div>
          ))}
        </div>

        {/* Low/High, Even/Odd, Red/Black */}
        <div className="row g-2 justify-content-center">
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Low (1-5)', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Low (1-5)</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('High (6-10)', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">High (6-10)</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Even Cards', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Even</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Odd Cards', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Odd</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Card Meter 1 (cmeter1)
// --------------------------------------------------------------------------
function TableCmeter1({ isMobile, isSuspended, openBetSlip }) {
  return (
    <div className="casino-table cmeter1">
      <div className="casino-table-box p-3 border rounded text-center">
        <h5 className="fw-bold mb-3">Card Meter 1 (1-Card Meter Battle)</h5>
        <div className="row g-3 mb-3">
          <div className="col-6">
            <div
              className={`card-odd-box p-3 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Fighter 1', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold fs-5">Fighter 1</div>
              <div className="casino-odds text-primary fs-4">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6">
            <div
              className={`card-odd-box p-3 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Fighter 2', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold fs-5">Fighter 2</div>
              <div className="casino-odds text-primary fs-4">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
        </div>

        {/* Meter Over / Under 10.5 */}
        <div className="row g-2 justify-content-center">
          <div className="col-6 col-md-4">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Meter Under 10.5', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Meter Under 10.5</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
          <div className="col-6 col-md-4">
            <div
              className={`card-odd-box p-2 border rounded bg-white ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Meter Over 10.5', '1.95', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <div className="fw-bold">Meter Over 10.5</div>
              <div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Premium Teenpatti 1Day (pteen)
// --------------------------------------------------------------------------
function TablePteen({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table pteen">
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Nation</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player A</div></div>
              <OddsBox nation="Player A" odds={markets?.playerA?.back || '1.98'} type="back" />
              <OddsBox nation="Player A" odds={markets?.playerA?.lay || '2.02'} type="lay" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player B</div></div>
              <OddsBox nation="Player B" odds={markets?.playerB?.back || '1.98'} type="back" />
              <OddsBox nation="Player B" odds={markets?.playerB?.lay || '2.02'} type="lay" />
            </div>
          </div>
        </div>

        <div className="casino-table-right-box mt-3 mt-md-0">
          <div className="teenpatti20-other-oods">
            <div className="casino-table-header">
              <div className="casino-nation-detail">Side Bets</div>
              <div className="casino-odds-box back">Back</div>
            </div>
            <div className="casino-table-body">
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus A</div>
                <OddsBox nation="Pair Plus A" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus B</div>
                <OddsBox nation="Pair Plus B" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat A</div>
                <OddsBox nation="3 Baccarat A" odds="1.95" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat B</div>
                <OddsBox nation="3 Baccarat B" odds="1.95" type="back" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Premium Teenpatti 20-20 (pteen20)
// --------------------------------------------------------------------------
function TablePteen20({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table pteen20">
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Nation</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player A</div></div>
              <OddsBox nation="Player A" odds={markets?.playerA?.back || '1.98'} type="back" />
              <OddsBox nation="Player A" odds={markets?.playerA?.lay || '2.02'} type="lay" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player B</div></div>
              <OddsBox nation="Player B" odds={markets?.playerB?.back || '1.98'} type="back" />
              <OddsBox nation="Player B" odds={markets?.playerB?.lay || '2.02'} type="lay" />
            </div>
          </div>
        </div>

        <div className="casino-table-right-box mt-3 mt-md-0">
          <div className="teenpatti20-other-oods">
            <div className="casino-table-header">
              <div className="casino-nation-detail">Side Bets</div>
              <div className="casino-odds-box back">Back</div>
            </div>
            <div className="casino-table-body">
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus A</div>
                <OddsBox nation="Pair Plus A" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus B</div>
                <OddsBox nation="Pair Plus B" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat A</div>
                <OddsBox nation="3 Baccarat A" odds="1.95" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat B</div>
                <OddsBox nation="3 Baccarat B" odds="1.95" type="back" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Premium Baccarat (pbaccarat)
// --------------------------------------------------------------------------
function TablePbaccarat({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table baccarat">
      <div className="casino-table-full-box">
        <div className="baccarat-main-odds">
          <div
            className={`player-box ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Player', markets?.player?.back || '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className="fw-bold">Player</div>
            <div className="casino-odds">{isSuspended ? '-' : (markets?.player?.back || '1.98')}</div>
          </div>

          <div
            className={`tie-box ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Tie', markets?.tie?.back || '9.0', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className="fw-bold">Tie</div>
            <div className="casino-odds">{isSuspended ? '-' : (markets?.tie?.back || '9.0')}</div>
          </div>

          <div
            className={`banker-box ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Banker', markets?.banker?.back || '1.95', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <div className="fw-bold">Banker</div>
            <div className="casino-odds">{isSuspended ? '-' : (markets?.banker?.back || '1.95')}</div>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-3 gap-2">
          <div
            className={`baccarat-other-odd-box w-50 p-2 text-center rounded ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Player Pair', '11.0', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', background: '#d68910', color: '#fff' }}
          >
            <div className="fw-bold">Player Pair</div>
            <div className="casino-odds">{isSuspended ? '-' : '11.0'}</div>
          </div>
          <div
            className={`baccarat-other-odd-box w-50 p-2 text-center rounded ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Banker Pair', '11.0', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', background: '#d68910', color: '#fff' }}
          >
            <div className="fw-bold">Banker Pair</div>
            <div className="casino-odds">{isSuspended ? '-' : '11.0'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Premium Dragon Tiger 20-20 (pdt20)
// --------------------------------------------------------------------------
function TablePdt20({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table dt20">
      <div className="casino-table-full-box">
        <div className="dt20-odd-box dt20dragon">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.dragon?.back || '1.98')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Dragon', markets?.dragon?.back || '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Dragon</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>

        <div className="dt20-odd-box dt20tie">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.tie?.back || '11')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Tie', markets?.tie?.back || '11', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Tie</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>

        <div className="dt20-odd-box dt20tiger">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.tiger?.back || '1.98')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Tiger', markets?.tiger?.back || '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Tiger</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>

        <div className="dt20-odd-box dt20pair">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.pair?.back || '12')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Pair', markets?.pair?.back || '12', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Pair</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>
      </div>

      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '2.10'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Dragon Even', '2.10', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Even
            </div>
          </div>
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '1.79'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Dragon Odd', '1.79', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Odd
            </div>
          </div>
        </div>

        <div className="casino-table-right-box">
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '2.10'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Tiger Even', '2.10', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Even
            </div>
          </div>
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '1.79'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Tiger Odd', '1.79', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Odd
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Premium Dragon Tiger 1Day (pdt6)
// --------------------------------------------------------------------------
function TablePdt6({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table dt20">
      <div className="casino-table-full-box">
        <div className="dt20-odd-box dt20dragon">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.dragon?.back || '1.98')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Dragon', markets?.dragon?.back || '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Dragon</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>

        <div className="dt20-odd-box dt20tie">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.tie?.back || '11')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Tie', markets?.tie?.back || '11', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Tie</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>

        <div className="dt20-odd-box dt20tiger">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.tiger?.back || '1.98')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Tiger', markets?.tiger?.back || '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Tiger</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>

        <div className="dt20-odd-box dt20pair">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.pair?.back || '12')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Pair', markets?.pair?.back || '12', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Pair</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>
      </div>

      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '2.10'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Dragon Even', '2.10', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Even
            </div>
          </div>
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '1.79'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Dragon Odd', '1.79', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Odd
            </div>
          </div>
        </div>

        <div className="casino-table-right-box">
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '2.10'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Tiger Even', '2.10', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Even
            </div>
          </div>
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '1.79'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Tiger Odd', '1.79', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Odd
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Premium 32 Cards (pcard32)
// --------------------------------------------------------------------------
function TablePcard32({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table cards32">
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Nation</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player 8 (8 pts)</div></div>
              <OddsBox nation="Player 8" odds={markets?.player8?.back || '2.10'} type="back" />
              <OddsBox nation="Player 8" odds={markets?.player8?.lay || '2.20'} type="lay" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player 9 (9 pts)</div></div>
              <OddsBox nation="Player 9" odds={markets?.player9?.back || '2.40'} type="back" />
              <OddsBox nation="Player 9" odds={markets?.player9?.lay || '2.50'} type="lay" />
            </div>
          </div>
        </div>

        <div className="casino-table-box-divider"></div>

        <div className="casino-table-right-box">
          <div className="casino-table-header d-none d-md-flex">
            <div className="casino-nation-detail">Nation</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player 10 (10 pts)</div></div>
              <OddsBox nation="Player 10" odds={markets?.player10?.back || '2.90'} type="back" />
              <OddsBox nation="Player 10" odds={markets?.player10?.lay || '3.00'} type="lay" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player 11 (11 pts)</div></div>
              <OddsBox nation="Player 11" odds={markets?.player11?.back || '3.50'} type="back" />
              <OddsBox nation="Player 11" odds={markets?.player11?.lay || '3.60'} type="lay" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Premium Lucky 7 (plucky7)
// --------------------------------------------------------------------------
function TablePlucky7({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className="casino-table lucky7a">
      <div className="casino-table-box">
        <div className="casino-table-full-box">
          <div className="lucky7low">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.low?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Low Card', markets?.low?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Low Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.seven?.back || '12')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Exact 7', markets?.seven?.back || '12', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Exact 7</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7high">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.high?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('High Card', markets?.high?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">High Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>
        </div>

        <div className="casino-table-box mt-3">
          <div className="casino-table-left-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.even?.back || '2.10')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Even', markets?.even?.back || '2.10', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Even</span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.odd?.back || '1.79')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Odd', markets?.odd?.back || '1.79', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Odd</span>
              </div>
            </div>
          </div>

          <div className="casino-table-right-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.red?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Red', markets?.red?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-red">Red</span></span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.black?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Black', markets?.black?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-black">Black</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="casino-table-box mt-3 d-flex justify-content-between gap-2">
          {[
            { label: 'A-2-3', odds: '4.00' },
            { label: '4-5-6', odds: '4.00' },
            { label: '8-9-10', odds: '4.00' },
            { label: 'J-Q-K', odds: '4.00' },
          ].map((grp) => (
            <div key={grp.label} className="lucky7cards flex-fill text-center">
              <div className="casino-odds w-100 text-center fw-bold">{isSuspended ? '-' : grp.odds}</div>
              <div
                className={`card-odd-box-container p-1 border rounded ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Group ${grp.label}`, grp.odds, 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', background: '#273646' }}
              >
                <span className="fw-bold text-white">{grp.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="casino-table-full-box lucky7acards mt-3">
          <div className="casino-odds w-100 text-center fw-bold mb-1">Cards 1 to 13 (Payout 12.0)</div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '40px', textAlign: 'center' }}
              >
                <div className="casino-odds">{isSuspended ? '-' : '12'}</div>
                <div className="fw-bold">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Virtual Lucky 7 (vlucky7)
// --------------------------------------------------------------------------
function TableVlucky7({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className="casino-table lucky7a">
      <div className="casino-table-box">
        <div className="casino-table-full-box">
          <div className="lucky7low">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.low?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Low Card', markets?.low?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Low Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.seven?.back || '12')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Exact 7', markets?.seven?.back || '12', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">Exact 7</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>

          <div className="lucky7high">
            <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.high?.back || '2')}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('High Card', markets?.high?.back || '2', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              <span className="casino-odds">High Card</span>
            </div>
            <div className="casino-nation-book text-center"></div>
          </div>
        </div>

        <div className="casino-table-box mt-3">
          <div className="casino-table-left-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.even?.back || '2.10')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Even', markets?.even?.back || '2.10', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Even</span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.odd?.back || '1.79')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Odd', markets?.odd?.back || '1.79', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="casino-odds">Odd</span>
              </div>
            </div>
          </div>

          <div className="casino-table-right-box">
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.red?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Red', markets?.red?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-red">Red</span></span>
              </div>
            </div>
            <div className="lucky7odds">
              <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.black?.back || '1.95')}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip('Black', markets?.black?.back || '1.95', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
              >
                <span className="card-icon ms-1"><span className="card-black">Black</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="casino-table-box mt-3 d-flex justify-content-between gap-2">
          {[
            { label: 'A-2-3', odds: '4.00' },
            { label: '4-5-6', odds: '4.00' },
            { label: '8-9-10', odds: '4.00' },
            { label: 'J-Q-K', odds: '4.00' },
          ].map((grp) => (
            <div key={grp.label} className="lucky7cards flex-fill text-center">
              <div className="casino-odds w-100 text-center fw-bold">{isSuspended ? '-' : grp.odds}</div>
              <div
                className={`card-odd-box-container p-1 border rounded ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Group ${grp.label}`, grp.odds, 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', background: '#273646' }}
              >
                <span className="fw-bold text-white">{grp.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="casino-table-full-box lucky7acards mt-3">
          <div className="casino-odds w-100 text-center fw-bold mb-1">Cards 1 to 13 (Payout 12.0)</div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '40px', textAlign: 'center' }}
              >
                <div className="casino-odds">{isSuspended ? '-' : '12'}</div>
                <div className="fw-bold">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Virtual Trio (vtrio)
// --------------------------------------------------------------------------
function TableVtrio({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table trio">
      <div className="casino-table-box">
        <div className="d-flex justify-content-between gap-2 mb-3">
          <div className="w-100 border p-2 rounded">
            <div className="fw-bold">Player 1</div>
            <div className="d-flex gap-2 mt-1">
              <OddsBox nation="Player 1" odds="2.95" type="back" className="w-50" />
              <OddsBox nation="Player 1" odds="3.05" type="lay" className="w-50" />
            </div>
          </div>
          <div className="w-100 border p-2 rounded">
            <div className="fw-bold">Player 2</div>
            <div className="d-flex gap-2 mt-1">
              <OddsBox nation="Player 2" odds="2.95" type="back" className="w-50" />
              <OddsBox nation="Player 2" odds="3.05" type="lay" className="w-50" />
            </div>
          </div>
          <div className="w-100 border p-2 rounded">
            <div className="fw-bold">Player 3</div>
            <div className="d-flex gap-2 mt-1">
              <OddsBox nation="Player 3" odds="2.95" type="back" className="w-50" />
              <OddsBox nation="Player 3" odds="3.05" type="lay" className="w-50" />
            </div>
          </div>
        </div>

        <div className="casino-table-box triocards mt-3">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Side Bets (Hand Combinations)</div>
            <div className="casino-odds-box back">Back Rate</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail">Pair (Payout 5.5)</div>
              <OddsBox nation="Pair" odds="5.5" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Flush (Payout 17.0)</div>
              <OddsBox nation="Flush" odds="17.0" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Straight (Payout 24.0)</div>
              <OddsBox nation="Straight" odds="24.0" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Trio (Payout 201.0)</div>
              <OddsBox nation="Trio" odds="201.0" type="back" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail">Straight Flush (Payout 226.0)</div>
              <OddsBox nation="Straight Flush" odds="226.0" type="back" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Virtual 20-20 DTL (vdtl20)
// --------------------------------------------------------------------------
function TableVdtl20({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table dtl20">
      <div className="casino-table-box">
        <div className="casino-table-header">
          <div className="casino-nation-detail">Nation</div>
          <div className="casino-odds-box back">Back</div>
          <div className="casino-odds-box lay">Lay</div>
        </div>
        <div className="casino-table-body">
          <div className="casino-table-row">
            <div className="casino-nation-detail"><div className="casino-nation-name">Dragon</div></div>
            <OddsBox nation="Dragon" odds={markets?.dragon?.back || '2.95'} type="back" />
            <OddsBox nation="Dragon" odds={markets?.dragon?.lay || '3.05'} type="lay" />
          </div>
          <div className="casino-table-row">
            <div className="casino-nation-detail"><div className="casino-nation-name">Tiger</div></div>
            <OddsBox nation="Tiger" odds={markets?.tiger?.back || '2.95'} type="back" />
            <OddsBox nation="Tiger" odds={markets?.tiger?.lay || '3.05'} type="lay" />
          </div>
          <div className="casino-table-row">
            <div className="casino-nation-detail"><div className="casino-nation-name">Lion</div></div>
            <OddsBox nation="Lion" odds={markets?.lion?.back || '2.95'} type="back" />
            <OddsBox nation="Lion" odds={markets?.lion?.lay || '3.05'} type="lay" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Virtual Muflis Teenpatti (vteenmuf)
// --------------------------------------------------------------------------
function TableVteenmuf({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table vteenmuf">
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Nation</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player A</div></div>
              <OddsBox nation="Player A" odds={markets?.playerA?.back || '1.98'} type="back" />
              <OddsBox nation="Player A" odds={markets?.playerA?.lay || '2.02'} type="lay" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player B</div></div>
              <OddsBox nation="Player B" odds={markets?.playerB?.back || '1.98'} type="back" />
              <OddsBox nation="Player B" odds={markets?.playerB?.lay || '2.02'} type="lay" />
            </div>
          </div>
        </div>

        <div className="casino-table-right-box mt-3 mt-md-0">
          <div className="teenpatti20-other-oods">
            <div className="casino-table-header">
              <div className="casino-nation-detail">Side Bets</div>
              <div className="casino-odds-box back">Back</div>
            </div>
            <div className="casino-table-body">
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus A</div>
                <OddsBox nation="Pair Plus A" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus B</div>
                <OddsBox nation="Pair Plus B" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat A</div>
                <OddsBox nation="3 Baccarat A" odds="1.95" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat B</div>
                <OddsBox nation="3 Baccarat B" odds="1.95" type="back" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Virtual Amar Akbar Anthony (vaaa)
// --------------------------------------------------------------------------
function TableVaaa({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  return (
    <div className="casino-table aaa">
      <div className="casino-table-box">
        <div className="d-flex justify-content-between w-100 gap-2 mb-3">
          <div className="casino-odd-box-container w-100">
            <div className="casino-nation-name">A. Amar</div>
            <OddsBox nation="A. Amar" odds={markets?.amar?.back || '2.95'} type="back" />
            <OddsBox nation="A. Amar" odds={markets?.amar?.lay || '3.05'} type="lay" />
          </div>
          <div className="casino-odd-box-container w-100">
            <div className="casino-nation-name">B. Akbar</div>
            <OddsBox nation="B. Akbar" odds={markets?.akbar?.back || '2.95'} type="back" />
            <OddsBox nation="B. Akbar" odds={markets?.akbar?.lay || '3.05'} type="lay" />
          </div>
          <div className="casino-odd-box-container w-100">
            <div className="casino-nation-name">C. Anthony</div>
            <OddsBox nation="C. Anthony" odds={markets?.anthony?.back || '2.95'} type="back" />
            <OddsBox nation="C. Anthony" odds={markets?.anthony?.lay || '3.05'} type="lay" />
          </div>
        </div>

        <div className="casino-table-box mt-3 d-flex justify-content-between w-100 gap-2">
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Even', '2.10', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold">Even</div><div className="casino-odds">{isSuspended ? '-' : '2.10'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Odd', '1.79', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold">Odd</div><div className="casino-odds">{isSuspended ? '-' : '1.79'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Red', '1.95', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold text-danger">Red</div><div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Black', '1.95', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold text-dark">Black</div><div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
          </div>
        </div>

        <div className="casino-table-full-box aaacards mt-3">
          <div className="casino-odds w-100 text-center fw-bold mb-1">13 Cards Market (Payout 12.0)</div>
          <div className="d-flex flex-wrap justify-content-center w-100 gap-2">
            {cards13.map((c) => (
              <div
                key={c}
                className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
                onClick={isSuspended ? undefined : () => openBetSlip(`Card ${c}`, '12', 'back', isMobile)}
                style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', minWidth: '40px', textAlign: 'center' }}
              >
                <div className="casino-odds">{isSuspended ? '-' : '12'}</div>
                <div className="fw-bold">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Virtual Bollywood Casino (vbtable)
// --------------------------------------------------------------------------
function TableVbtable({ isMobile, isSuspended, openBetSlip, markets }) {
  const chars = [
    { key: 'A', name: 'Don' },
    { key: 'B', name: 'Amar' },
    { key: 'C', name: 'Anthony' },
    { key: 'D', name: 'Vijay' },
    { key: 'E', name: 'Shehenshah' },
    { key: 'F', name: 'Gabbar' },
  ];
  return (
    <div className="casino-table bollywood">
      <div className="casino-table-box">
        <div className="row g-2 mb-3">
          {chars.map((char) => (
            <div key={char.key} className="col-12 col-md-4">
              <div className="casino-odd-box-container p-2 border rounded">
                <div className="casino-nation-name fw-bold">{char.key}. {char.name}</div>
                <div className="d-flex gap-2 mt-1">
                  <OddsBox nation={`${char.key}. ${char.name}`} odds="5.5" type="back" className="w-50" />
                  <OddsBox nation={`${char.key}. ${char.name}`} odds="6.0" type="lay" className="w-50" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="casino-table-box mt-2 d-flex justify-content-between gap-2">
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Odd', '1.79', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold">Odd</div><div className="casino-odds">{isSuspended ? '-' : '1.79'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Even', '2.10', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold">Even</div><div className="casino-odds">{isSuspended ? '-' : '2.10'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Red', '1.95', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold text-danger">Red</div><div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
          </div>
          <div className="aaa-odd-box w-100 p-2 text-center rounded border" onClick={isSuspended ? undefined : () => openBetSlip('Black', '1.95', 'back', isMobile)} style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}>
            <div className="fw-bold text-dark">Black</div><div className="casino-odds">{isSuspended ? '-' : '1.95'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Virtual 1 Day Dragon Tiger (vdt6)
// --------------------------------------------------------------------------
function TableVdt6({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table dt20">
      <div className="casino-table-full-box">
        <div className="dt20-odd-box dt20dragon">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.dragon?.back || '1.98')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Dragon', markets?.dragon?.back || '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Dragon</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>

        <div className="dt20-odd-box dt20tie">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.tie?.back || '11')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Tie', markets?.tie?.back || '11', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Tie</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>

        <div className="dt20-odd-box dt20tiger">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.tiger?.back || '1.98')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Tiger', markets?.tiger?.back || '1.98', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Tiger</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>

        <div className="dt20-odd-box dt20pair">
          <div className="casino-odds text-center fw-bold">{isSuspended ? '-' : (markets?.pair?.back || '12')}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
            onClick={isSuspended ? undefined : () => openBetSlip('Pair', markets?.pair?.back || '12', 'back', isMobile)}
            style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
          >
            <span className="casino-odds">Pair</span>
          </div>
          <div className="casino-nation-book text-center"></div>
        </div>
      </div>

      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '2.10'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Dragon Even', '2.10', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Even
            </div>
          </div>
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '1.79'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Dragon Odd', '1.79', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Odd
            </div>
          </div>
        </div>

        <div className="casino-table-right-box">
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '2.10'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Tiger Even', '2.10', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Even
            </div>
          </div>
          <div className="dt20-odd-box dt20odds">
            <div className="casino-odds text-center">{isSuspended ? '-' : '1.79'}</div>
            <div
              className={`casino-odds-box back ${isSuspended ? 'suspended-box' : ''}`}
              onClick={isSuspended ? undefined : () => openBetSlip('Tiger Odd', '1.79', 'back', isMobile)}
              style={{ cursor: isSuspended ? 'not-allowed' : 'pointer' }}
            >
              Odd
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Virtual 1 Day Teenpatti (vteen)
// --------------------------------------------------------------------------
function TableVteen({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className="casino-table vteen">
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-header">
            <div className="casino-nation-detail">Nation</div>
            <div className="casino-odds-box back">Back</div>
            <div className="casino-odds-box lay">Lay</div>
          </div>
          <div className="casino-table-body">
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player A</div></div>
              <OddsBox nation="Player A" odds={markets?.playerA?.back || '1.98'} type="back" />
              <OddsBox nation="Player A" odds={markets?.playerA?.lay || '2.02'} type="lay" />
            </div>
            <div className="casino-table-row">
              <div className="casino-nation-detail"><div className="casino-nation-name">Player B</div></div>
              <OddsBox nation="Player B" odds={markets?.playerB?.back || '1.98'} type="back" />
              <OddsBox nation="Player B" odds={markets?.playerB?.lay || '2.02'} type="lay" />
            </div>
          </div>
        </div>

        <div className="casino-table-right-box mt-3 mt-md-0">
          <div className="teenpatti20-other-oods">
            <div className="casino-table-header">
              <div className="casino-nation-detail">Side Bets</div>
              <div className="casino-odds-box back">Back</div>
            </div>
            <div className="casino-table-body">
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus A</div>
                <OddsBox nation="Pair Plus A" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">Pair Plus B</div>
                <OddsBox nation="Pair Plus B" odds="2.0" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat A</div>
                <OddsBox nation="3 Baccarat A" odds="1.95" type="back" />
              </div>
              <div className="casino-table-row">
                <div className="casino-nation-detail">3 Baccarat B</div>
                <OddsBox nation="3 Baccarat B" odds="1.95" type="back" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Virtual 20-20 Teen Patti (vteen20)
// --------------------------------------------------------------------------


function TableVteen20({ isMobile, isSuspended, openBetSlip, markets }) {
  const mainMarkets = [
    {
      name: 'Player A',
      back: markets?.playerA?.back || '1.98',
      lay: markets?.playerA?.lay || '2.02',
    },
    {
      name: 'Player B',
      back: markets?.playerB?.back || '1.98',
      lay: markets?.playerB?.lay || '2.02',
    },
  ];

  const sideMarkets = [
    { name: 'Pair Plus A', odds: '2.0' },
    { name: 'Pair Plus B', odds: '2.0' },
    { name: '3 Baccarat A', odds: '1.95' },
    { name: '3 Baccarat B', odds: '1.95' },
  ];

  // Reusable Odds Button
  const OddsButton = ({ nation, odds, type }) => {
    const isBack = type === 'back';

    return (
      <button
        type="button"
        disabled={isSuspended}
        onClick={() => {
          if (!isSuspended) {
            openBetSlip(nation, odds, type, isMobile);
          }
        }}
        className={`
          flex min-h-[54px] w-full min-w-0 flex-col
          items-center justify-center gap-0.5
          px-1 py-2 text-center
          text-[#263747] transition-all duration-150
          ${
            isBack
              ? 'bg-[#78bce9] hover:bg-[#60abe0]'
              : 'bg-[#f5a6ba] hover:bg-[#ed91a9]'
          }
          ${
            isSuspended
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer active:brightness-95'
          }
        `}
      >
        <span className="text-base font-bold leading-5">
          {isSuspended ? '-' : odds}
        </span>
      </button>
    );
  };

  // Main Bets Section
  const MainBets = () => (
    <section className="min-w-0 overflow-hidden rounded-md border border-[#d5d9de] bg-white shadow-sm">

      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_80px_80px] bg-[#4b5b6b] text-white">

        <div className="flex items-center px-3 py-3">
          <span className="text-sm font-bold">
            Nation
          </span>
        </div>

        <div className="flex items-center justify-center border-l border-white/20 bg-[#72b9e8] py-3 text-sm font-bold text-[#263747]">
          Back
        </div>

        <div className="flex items-center justify-center border-l border-white/20 bg-[#f5a6ba] py-3 text-sm font-bold text-[#263747]">
          Lay
        </div>

      </div>

      {/* Players */}
      <div>
        {mainMarkets.map((item, index) => (
          <div
            key={item.name}
            className={`
              grid grid-cols-[minmax(0,1fr)_80px_80px]
              min-h-[66px] border-t border-[#dfe2e6]
              ${index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}
            `}
          >

            {/* Player Name */}
            <div className="flex min-w-0 items-center px-3 py-3">
              <span className="break-words text-sm font-semibold text-[#343a40] sm:text-base">
                {item.name}
              </span>
            </div>

            {/* Back */}
            <div className="flex items-stretch border-l border-white/60">
              <OddsButton
                nation={item.name}
                odds={item.back}
                type="back"
              />
            </div>

            {/* Lay */}
            <div className="flex items-stretch border-l border-white/60">
              <OddsButton
                nation={item.name}
                odds={item.lay}
                type="lay"
              />
            </div>

          </div>
        ))}
      </div>

    </section>
  );

  // Side Bets Section
  const SideBets = () => (
    <section className="min-w-0 overflow-hidden rounded-md border border-[#d5d9de] bg-white shadow-sm">

      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_90px] bg-[#4b5b6b] text-white">

        <div className="flex items-center px-3 py-3">
          <span className="text-sm font-bold">
            Side Bets
          </span>
        </div>

        <div className="flex items-center justify-center border-l border-white/20 bg-[#72b9e8] py-3 text-sm font-bold text-[#263747]">
          Back
        </div>

      </div>

      {/* Side Bets Rows */}
      <div>
        {sideMarkets.map((item, index) => (
          <div
            key={item.name}
            className={`
              grid grid-cols-[minmax(0,1fr)_90px]
              min-h-[66px] border-t border-[#dfe2e6]
              ${index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}
            `}
          >

            {/* Name */}
            <div className="flex min-w-0 items-center px-3 py-3">
              <span className="break-words text-sm font-medium text-[#343a40] sm:text-base">
                {item.name}
              </span>
            </div>

            {/* Odds */}
            <div className="flex items-stretch border-l border-white/60">
              <OddsButton
                nation={item.name}
                odds={item.odds}
                type="back"
              />
            </div>

          </div>
        ))}
      </div>

    </section>
  );

  return (
    <div className="w-full min-w-0 bg-[#f5f6f8] p-2 sm:p-3">

      {/* Main Layout */}
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2 lg:gap-4">

        {/* Left: Main Bets */}
        <MainBets />

        {/* Right: Side Bets */}
        <SideBets />

      </div>

    </div>
  );
}


// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// Master Market Table Dispatcher with 93 Dedicated Cases (Zero Grouping)
// --------------------------------------------------------------------------
export const TABLE_COMPONENTS = {
  goal2: Goal2Table,
  worli3: TableWorli3,
  dolidana: TableDolidana,
  mogambo: TableMogambo,
  lucky5: TableLucky5,
  roulette12: TableRoulette12,
  roulette13: TableRoulette13,
  roulette11: TableRoulette11,
  poison: TablePoison,
  teenunique: TableTeenunique,
  poison20: TablePoison20,
  joker120: TableJoker120,
  joker20: TableJoker20,
  joker1: TableJoker1,
  teen20c: TableTeen20c,
  btable2: TableBtable2,
  ourroullete: TableOurroullete,
  superover3: TableSuperover3,
  goal: TableGoal,
  ab4: TableAb4,
  lucky15: TableLucky15,
  superover2: TableSuperover2,
  teen41: TableTeen41,
  teen42: TableTeen42,
  sicbo2: TableSicbo2,
  teen33: TableTeen33,
  sicbo: TableSicbo,
  ballbyball: TableBallbyball,
  teen32: TableTeen32,
  teen: TableTeen,
  teen20: TableTeen20,
  teen9: TableTeen9,
  teen8: TableTeen8,
  poker: TablePoker,
  poker20: TablePoker20,
  poker6: TablePoker6,
  baccarat: TableBaccarat,
  baccarat2: TableBaccarat2,
  dt20: TableDt20,
  dt6: TableDt6,
  dtl20: TableDtl20,
  dt202: TableDt202,
  card32: TableCard32,
  card32eu: TableCard32eu,
  ab20: TableAb20,
  abj: TableAbj,
  lucky7: TableLucky7,
  lucky7eu: TableLucky7eu,
  '3cardj': Table3cardj,
  worli: TableWorli,
  worli2: TableWorli2,
  aaa: TableAaa,
  btable: TableBtable,
  lottcard: TableLottcard,
  cricketv3: TableCricketv3,
  cmatch20: TableCmatch20,
  teen6: TableTeen6,
  queen: TableQueen,
  race20: TableRace20,
  lucky7eu2: TableLucky7eu2,
  superover: TableSuperover,
  trap: TableTrap,
  patti2: TablePatti2,
  teensin: TableTeensin,
  teenmuf: TableTeenmuf,
  race17: TableRace17,
  teen20b: TableTeen20b,
  trio: TableTrio,
  notenum: TableNotenum,
  teen120: TableTeen120,
  teen1: TableTeen1,
  ab3: TableAb3,
  aaa2: TableAaa2,
  race2: TableRace2,
  teen3: TableTeen3,
  dum10: TableDum10,
  cmeter1: TableCmeter1,
  pteen: TablePteen,
  pteen20: TablePteen20,
  pbaccarat: TablePbaccarat,
  pdt20: TablePdt20,
  pdt6: TablePdt6,
  pcard32: TablePcard32,
  plucky7: TablePlucky7,
  vlucky7: Vlucky7Table,
  vtrio: TableVtrio,
  vdtl20: TableVdtl20,
  vteenmuf: TableVteenmuf,
  vaaa: TableVaaa,
  vbtable: TableVbtable,
  vdt6: TableVdt6,
  vteen: TableVteen,
  vteen20: TableVteen20,
};

export default function GameMarketTable() {
  const { selectedGame, roundData, isSuspended, openBetSlip } = useCasino();
  const markets = roundData?.markets || {};
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1200;

  switch (selectedGame) {
    case 'goal2':
      return <Goal2Table />;
    case 'vlucky7':
      return <Vlucky7Table />;
    case 'worli3':
      return <TableWorli3 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'dolidana':
      return <TableDolidana isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'mogambo':
      return <TableMogambo isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'lucky5':
      return <TableLucky5 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'roulette12':
      return <TableRoulette12 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'roulette13':
      return <TableRoulette13 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'roulette11':
      return <TableRoulette11 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'poison':
      return <TablePoison isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teenunique':
      return <TableTeenunique isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'poison20':
      return <TablePoison20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'joker120':
      return <TableJoker120 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'joker20':
      return <TableJoker20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'joker1':
      return <TableJoker1 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen20c':
      return <TableTeen20c isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'btable2':
      return <TableBtable2 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'ourroullete':
      return <TableOurroullete isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'superover3':
      return <TableSuperover3 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'goal':
      return <TableGoal isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'ab4':
      return <TableAb4 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'lucky15':
      return <TableLucky15 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'superover2':
      return <TableSuperover2 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen41':
      return <TableTeen41 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen42':
      return <TableTeen42 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'sicbo2':
      return <TableSicbo2 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen33':
      return <TableTeen33 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'sicbo':
      return <TableSicbo isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'ballbyball':
      return <TableBallbyball isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen32':
      return <TableTeen32 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen':
      return <TableTeen isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen20':
      return <TableTeen20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen9':
      return <TableTeen9 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen8':
      return <TableTeen8 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'poker':
      return <TablePoker isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'poker20':
      return <TablePoker20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'poker6':
      return <TablePoker6 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'baccarat':
      return <TableBaccarat isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'baccarat2':
      return <TableBaccarat2 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'dt20':
      return <TableDt20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'dt6':
      return <TableDt6 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'dtl20':
      return <TableDtl20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'dt202':
      return <TableDt202 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'card32':
      return <TableCard32 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'card32eu':
      return <TableCard32eu isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'ab20':
      return <TableAb20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'abj':
      return <TableAbj isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'lucky7':
      return <TableLucky7 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'lucky7eu':
      return <TableLucky7eu isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case '3cardj':
      return <Table3cardj isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'worli':
      return <TableWorli isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'worli2':
      return <TableWorli2 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'aaa':
      return <TableAaa isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'btable':
      return <TableBtable isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'lottcard':
      return <TableLottcard isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'cricketv3':
      return <TableCricketv3 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'cmatch20':
      return <TableCmatch20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen6':
      return <TableTeen6 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'queen':
      return <TableQueen isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'race20':
      return <TableRace20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'lucky7eu2':
      return <TableLucky7eu2 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'superover':
      return <TableSuperover isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'trap':
      return <TableTrap isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'patti2':
      return <TablePatti2 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teensin':
      return <TableTeensin isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teenmuf':
      return <TableTeenmuf isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'race17':
      return <TableRace17 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen20b':
      return <TableTeen20b isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'trio':
      return <TableTrio isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'notenum':
      return <TableNotenum isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen120':
      return <TableTeen120 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen1':
      return <TableTeen1 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'ab3':
      return <TableAb3 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'aaa2':
      return <TableAaa2 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'race2':
      return <TableRace2 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'teen3':
      return <TableTeen3 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'dum10':
      return <TableDum10 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'cmeter1':
      return <TableCmeter1 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'pteen':
      return <TablePteen isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'pteen20':
      return <TablePteen20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'pbaccarat':
      return <TablePbaccarat isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'pdt20':
      return <TablePdt20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'pdt6':
      return <TablePdt6 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'pcard32':
      return <TablePcard32 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'plucky7':
      return <TablePlucky7 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'vtrio':
      return <TableVtrio isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'vdtl20':
      return <TableVdtl20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'vteenmuf':
      return <TableVteenmuf isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'vaaa':
      return <TableVaaa isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'vbtable':
      return <TableVbtable isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'vdt6':
      return <TableVdt6 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'vteen':
      return <TableVteen isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    case 'vteen20':
      return <TableVteen20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
    default:
      return <TableVteen20 isMobile={isMobile} isSuspended={isSuspended} openBetSlip={openBetSlip} markets={markets} />;
  }
}

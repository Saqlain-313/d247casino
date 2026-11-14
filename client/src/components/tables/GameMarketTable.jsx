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
  const playerOdds = [
    {
      name: 'Player A',
      odds: markets?.playerA?.back || '1.97',
      stake: '500000',
    },
    {
      name: 'Player B',
      odds: markets?.playerB?.back || '1.97',
      stake: '500000',
    },
  ];

  const particularPairs = [
    { name: '1-1 Pair', odds: '29.5' },
    { name: '2-2 Pair', odds: '29.5' },
    { name: '3-3 Pair', odds: '29.5' },
    { name: '4-4 Pair', odds: '29.5' },
    { name: '5-5 Pair', odds: '29.5' },
    { name: '6-6 Pair', odds: '29.5' },
  ];

  const sumOdds = [
    { sum: 2, odds: '29.8' },
    { sum: 3, odds: '15.4' },
    { sum: 4, odds: '10.6' },
    { sum: 5, odds: '8.2' },
    { sum: 6, odds: '6.76' },
    { sum: 7, odds: '5.8' },
    { sum: 8, odds: '6.76' },
    { sum: 9, odds: '8.2' },
    { sum: 10, odds: '10.6' },
    { sum: 11, odds: '15.4' },
    { sum: 12, odds: '29.8' },
  ];

  const placeBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  const OddsButton = ({ name, odds, className = '' }) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() => placeBet(name, odds)}
      className={`flex min-w-0 items-center justify-center rounded-md bg-[#72b9e8] font-bold text-[#263746] transition-colors ${
        isSuspended
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:bg-[#5da9dc]'
      } ${className}`}
    >
      {isSuspended ? '-' : odds}
    </button>
  );

  return (
    <div className="w-full space-y-2 bg-white text-[#333]">

      {/* TOP MARKETS */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1.35fr_0.65fr_1.15fr_1.5fr]">

        {/* PLAYER A / PLAYER B */}
        <div className="overflow-hidden border border-[#d1d1d1] bg-[#f4f4f4]">
          {playerOdds.map((player) => (
            <div
              key={player.name}
              className="grid min-h-[58px] grid-cols-[minmax(0,1fr)_80px] border-b border-[#c9c9c9] last:border-b-0"
            >
              <div className="flex items-center px-3 text-lg font-extrabold">
                {player.name}
              </div>

              <button
                type="button"
                disabled={isSuspended}
                onClick={() => placeBet(player.name, player.odds)}
                className={`flex flex-col items-center justify-center bg-[#72b9e8] text-[#263746] ${
                  isSuspended
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:bg-[#5da9dc]'
                }`}
              >
                <span className="text-lg font-extrabold">
                  {isSuspended ? '-' : player.odds}
                </span>
                <span className="text-xs font-medium">
                  {player.stake}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* ANY PAIR */}
        <div className="flex flex-col items-center justify-center rounded-md bg-[#eeeeee] p-2">
          <div className="mb-1 text-sm font-extrabold">
            Any Pair
          </div>

          <OddsButton
            name="Any Pair"
            odds="5.75"
            className="min-h-[85px] w-full text-2xl"
          />
        </div>

        {/* ODD / EVEN */}
        <div className="grid grid-cols-2 gap-2 rounded-md bg-[#eeeeee] p-2">
          {[
            { name: 'Odd', odds: '1.95' },
            { name: 'Even', odds: '1.95' },
          ].map((item) => (
            <div
              key={item.name}
              className="flex min-w-0 flex-col items-center justify-center"
            >
              <div className="mb-2 text-base font-extrabold">
                {item.name}
              </div>

              <OddsButton
                name={item.name}
                odds={item.odds}
                className="min-h-[70px] w-full text-xl"
              />
            </div>
          ))}
        </div>

        {/* LESS THAN 7 / SEVEN / GREATER THAN 7 */}
        <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-2 rounded-md bg-[#eeeeee] p-2">
          <div className="flex min-w-0 flex-col items-center">
            <div className="mb-2 text-base font-extrabold">
              {'< 7'}
            </div>

            <OddsButton
              name="Less than 7"
              odds="2"
              className="min-h-[70px] w-full text-xl"
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#ffcc16]">
              <span
                className="text-[58px] font-black leading-none text-[#a90020]"
                style={{
                  WebkitTextStroke: '1.5px #222',
                  textShadow: '2px 2px 0 #222',
                }}
              >
                7
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col items-center">
            <div className="mb-2 text-base font-extrabold">
              {'> 7'}
            </div>

            <OddsButton
              name="Greater than 7"
              odds="2"
              className="min-h-[70px] w-full text-xl"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM MARKETS */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[0.95fr_1.8fr]">

        {/* PARTICULAR PAIR */}
        <div className="rounded-md bg-[#eeeeee] p-3">
          <h3 className="mb-3 text-xl font-extrabold">
            Particular Pair
          </h3>

          <div className="grid grid-cols-3 gap-x-2 gap-y-3">
            {particularPairs.map((pair) => (
              <div key={pair.name} className="min-w-0">
                <div className="mb-1 text-center text-sm font-bold">
                  {pair.name}
                </div>

                <OddsButton
                  name={pair.name}
                  odds={pair.odds}
                  className="min-h-[58px] w-full text-xl"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ODDS OF SUM TOTAL */}
        <div className="rounded-md bg-[#eeeeee] p-3">
          <h3 className="mb-3 text-xl font-extrabold">
            Odds of Sum Total
          </h3>

          {/* FIRST ROW: SUM 2 TO 7 */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
            {sumOdds.slice(0, 6).map((item) => (
              <div key={item.sum} className="min-w-0">
                <div className="mb-1 text-center text-sm font-bold">
                  Sum Total {item.sum}
                </div>

                <OddsButton
                  name={`Sum Total ${item.sum}`}
                  odds={item.odds}
                  className="min-h-[58px] w-full text-xl"
                />
              </div>
            ))}
          </div>

          {/* SECOND ROW: SUM 8 TO 12 */}
          <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-3 lg:grid-cols-5 lg:mx-auto lg:max-w-[88%]">
            {sumOdds.slice(6).map((item) => (
              <div key={item.sum} className="min-w-0">
                <div className="mb-1 text-center text-sm font-bold">
                  Sum Total {item.sum}
                </div>

                <OddsButton
                  name={`Sum Total ${item.sum}`}
                  odds={item.odds}
                  className="min-h-[58px] w-full text-xl"
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
// Game: Mogambo (mogambo)
// --------------------------------------------------------------------------





function TableMogambo({ isMobile, isSuspended, openBetSlip, markets }) {
  const rawMarkets = Array.isArray(markets)
    ? markets
    : markets?.data?.sub || markets?.sub ||
      (markets && typeof markets === 'object'
        ? Object.values(markets).filter(
            (item) => item && typeof item === 'object' && item.sid != null
          )
        : []);

  // Remove duplicate SID entries
  const marketMap = new Map();

  rawMarkets.forEach((market) => {
    if (market?.sid != null) {
      marketMap.set(String(market.sid), market);
    }
  });

  const marketList = [...marketMap.values()];

  // Find markets by API SID
  const dagaMarket = marketList.find(
    (market) => String(market.sid) === '2'
  );

  const mogamboMarket = marketList.find(
    (market) => String(market.sid) === '1'
  );

  const totalMarket = marketList.find(
    (market) => String(market.sid) === '3'
  );

  const LockIcon = () => (
    <svg
      width="22"
      height="24"
      viewBox="0 0 24 24"
      fill="white"
      className="absolute z-20"
    >
      <path d="M18 9h-1V7a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2ZM9 7a3 3 0 0 1 6 0v2H9V7Zm4 9v2a1 1 0 0 1-2 0v-2a2 2 0 1 1 2 0Z" />
    </svg>
  );

  const getSuspended = (market) => {
    if (!market) return true;

    const status = String(
      market.gstatus ?? market.status ?? ''
    ).toUpperCase();

    return status
      ? status !== 'OPEN'
      : Boolean(isSuspended);
  };

  const OddsBox = ({ market, type }) => {
    if (!market) {
      return (
        <div className="relative flex min-h-[82px] items-center justify-center bg-[#414c55]">
          <LockIcon />
        </div>
      );
    }

    const suspended = getSuspended(market);

    const odds = type === 'back'
      ? market.back ?? market.b
      : market.lay ?? market.l;

    const stake = type === 'back'
      ? market.bs ?? market.bhav
      : market.ls ?? market.lbhav;

    const hasOdds =
      odds !== undefined && odds !== null && odds !== '';

    const disabled =
      suspended || !hasOdds || Number(odds) <= 0;

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            openBetSlip(
              market.nat,
              String(odds),
              type,
              isMobile
            );
          }
        }}
        className={`relative flex min-h-[82px] w-full flex-col items-center justify-center overflow-hidden transition-colors ${
          suspended
            ? 'cursor-not-allowed bg-[#414c55]'
            : type === 'lay'
              ? 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
              : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
        }`}
      >
        {/* Odds remain faintly visible behind lock */}
        <span
          className={`relative z-0 text-[23px] font-extrabold text-[#263746] ${
            suspended ? 'opacity-30' : ''
          }`}
        >
          {hasOdds ? odds : '-'}
        </span>

        {stake !== undefined && stake !== null && (
          <span
            className={`relative z-0 text-sm text-[#263746] ${
              suspended ? 'opacity-25' : ''
            }`}
          >
            {stake}
          </span>
        )}

        {suspended && (
          <>
            <span className="absolute inset-0 z-10 bg-[#414c55]/15" />
            <LockIcon />
          </>
        )}
      </button>
    );
  };

  const MarketName = ({ market, fallback }) => (
    <div className="flex min-w-0 items-center bg-[#f1f0f0] px-2">
      <span className="truncate text-base font-extrabold text-[#333]">
        {market?.nat || fallback}
      </span>
    </div>
  );

  return (
    <div className="w-full overflow-hidden bg-[#f5f5f5]">

      {/* FIRST ROW: DAGA / TEJA + MOGAMBO */}
      <div className="grid grid-cols-2 gap-0 border border-[#c9c9c9]">
        <div className="grid min-w-0 grid-cols-[60%_40%] border-r border-[#c9c9c9]">
          <MarketName market={dagaMarket} fallback="Daga / Teja" />
          <OddsBox market={dagaMarket} type="back" />
        </div>

        <div className="grid min-w-0 grid-cols-[60%_40%]">
          <MarketName market={mogamboMarket} fallback="Mogambo" />
          <OddsBox market={mogamboMarket} type="back" />
        </div>
      </div>

      {/* SECOND ROW: 3 CARD TOTAL */}
      <div className="mx-auto mt-2 grid w-[75%] grid-cols-[minmax(0,1fr)_180px_180px] overflow-hidden border border-[#c9c9c9] max-sm:w-full max-sm:grid-cols-[minmax(0,1fr)_90px_90px]">
        <MarketName market={totalMarket} fallback="3 Card Total" />

        <OddsBox market={totalMarket} type="lay" />
        <OddsBox market={totalMarket} type="back" />
      </div>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Lucky 6 / Lucky 5 (lucky5)
// --------------------------------------------------------------------------
function TableLucky5({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards11 = [
    { label: 'A', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7', value: 7 },
    { label: '8', value: 8 },
    { label: '9', value: 9 },
    { label: '10', value: 10 },
    { label: 'J', value: 11 },
  ];

  const placeBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  const OddsButton = ({ name, odds, className = '', children }) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() => placeBet(name, odds)}
      className={`flex min-w-0 items-center justify-center rounded-sm bg-gradient-to-r from-[#008bc9] to-[#293f53] font-bold text-white shadow-sm transition-colors ${
        isSuspended
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:brightness-110'
      } ${className}`}
    >
      {children || (isSuspended ? '-' : odds)}
    </button>
  );

  const CardFace = ({ label }) => (
    <div className="relative flex h-[64px] w-[46px] shrink-0 flex-col justify-between border border-yellow-400 bg-white px-1 py-0.5 text-left shadow-sm">
      <span className="text-[25px] font-bold leading-none text-black">
        {label}
      </span>

      <div className="flex items-center justify-between text-[18px] font-bold leading-none">
        <span className="text-black">♠</span>
        <span className="text-red-600">♦</span>
      </div>

      <div className="flex items-center justify-between text-[18px] font-bold leading-none">
        <span className="text-black">♣</span>
        <span className="text-red-600">♥</span>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-2 bg-white p-1">

      {/* LOW CARD / EXACT 6 / HIGH CARD */}
      <div className="grid grid-cols-[1fr_54px_1fr] items-center gap-2 bg-[#f1f1f1] px-1 py-1">
        {/* LOW CARD */}
        <div className="min-w-0">
          <div className="mb-0.5 text-center text-sm font-bold text-[#333]">
            {isSuspended ? '-' : markets?.low?.back || '2'}
          </div>

          <OddsButton
            name="Low Card (1-5)"
            odds={markets?.low?.back || '2'}
            className="h-[46px] w-full text-base"
          >
            Low Card
          </OddsButton>
        </div>

        {/* EXACT 6 CARD */}
        <div className="flex flex-col items-center justify-center">
          <div className="mb-0.5 text-center text-sm font-bold text-[#333]">
            {isSuspended ? '-' : markets?.six?.back || '11'}
          </div>

          <button
            type="button"
            disabled={isSuspended}
            onClick={() =>
              placeBet('Exact 6', markets?.six?.back || '11')
            }
            className={`flex h-[68px] w-[50px] flex-col items-center justify-center border border-yellow-400 bg-white text-black shadow-sm ${
              isSuspended
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            }`}
          >
            <span className="text-[30px] font-bold leading-none">6</span>
            <span className="text-[17px] leading-[15px]">
              ♠<span className="text-red-600">♦</span>
            </span>
            <span className="text-[17px] leading-[15px]">
              ♣<span className="text-red-600">♥</span>
            </span>
          </button>
        </div>

        {/* HIGH CARD */}
        <div className="min-w-0">
          <div className="mb-0.5 text-center text-sm font-bold text-[#333]">
            {isSuspended ? '-' : markets?.high?.back || '2'}
          </div>

          <OddsButton
            name="High Card (7-11)"
            odds={markets?.high?.back || '2'}
            className="h-[46px] w-full text-base"
          >
            High Card
          </OddsButton>
        </div>
      </div>

      {/* EVEN / ODD / RED / BLACK */}
      <div className="grid grid-cols-2 gap-2 bg-[#f1f1f1] p-2 sm:grid-cols-4">
        {[
          {
            name: 'Even',
            odds: markets?.even?.back || '2.05',
            color: 'text-white',
          },
          {
            name: 'Odd',
            odds: markets?.odd?.back || '1.85',
            color: 'text-white',
          },
          {
            name: 'Red',
            odds: markets?.red?.back || '1.95',
            color: 'text-red-500',
            icon: '♥ ♦',
          },
          {
            name: 'Black',
            odds: markets?.black?.back || '1.95',
            color: 'text-black',
            icon: '♠ ♣',
          },
        ].map((market) => (
          <div key={market.name} className="min-w-0">
            <div className="mb-0.5 text-center text-sm font-bold text-[#333]">
              {isSuspended ? '-' : market.odds}
            </div>

            <OddsButton
              name={market.name}
              odds={market.odds}
              className="h-[46px] w-full text-base"
            >
              <span className={market.icon ? market.color : ''}>
                {market.icon || market.name}
              </span>
            </OddsButton>
          </div>
        ))}
      </div>

      {/* 11 CARDS MARKET */}
      <div className="bg-[#f1f1f1] px-2 py-3">
        <div className="mb-2 text-center text-sm font-bold text-[#333]">
          {isSuspended ? '-' : '11'}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {cards11.map((card) => (
            <button
              key={card.value}
              type="button"
              disabled={isSuspended}
              onClick={() =>
                placeBet(`Card ${card.value}`, '11')
              }
              className={`rounded-sm transition-transform ${
                isSuspended
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:-translate-y-1'
              }`}
            >
              <CardFace label={card.label} />
            </button>
          ))}
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
    { name: 'Player A', market: markets?.playera },
    { name: 'Player B', market: markets?.playerb },
  ];

  const sideMarkets = [
    { name: 'Pair Plus A', market: markets?.pairplusa },
    { name: 'Pair Plus B', market: markets?.pairplusb },
    { name: '3 Baccarat A', market: markets?.['3baccarata'] },
    { name: '3 Baccarat B', market: markets?.['3baccaratb'] },
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

  const OddsButton = ({ nation, market, type }) => {
    const isBack = type === 'back';
    const rawOdds = type === 'lay' ? market?.lay : market?.back;
    const numericOdds = Number(rawOdds);
    const status = String(market?.gstatus || '').toUpperCase();
    const available =
      !isSuspended &&
      market?.visible === true &&
      ['OPEN', 'ACTIVE'].includes(status) &&
      Number.isFinite(numericOdds) &&
      numericOdds > 1;
    const shownOdds = available ? numericOdds : null;

    return (
      <button
        type="button"
        disabled={!available}
        onClick={() => {
          if (available) openBetSlip(nation, shownOdds, type, isMobile);
        }}
        className={`flex min-h-[58px] w-full items-center justify-center border-l border-white/50 transition-colors ${
          !available
            ? 'cursor-not-allowed bg-[#414c56]'
            : isBack
              ? 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
              : 'cursor-pointer bg-[#f5a5b8] hover:bg-[#ed91a7]'
        }`}
      >
        {!available ? (
          <LockIcon />
        ) : (
          <span className="text-lg font-bold text-[#303b45]">
            {shownOdds.toFixed(2)}
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
              <OddsButton nation={player.name} market={player.market} type="back" />
              <OddsButton nation={player.name} market={player.market} type="lay" />
            </div>
          ))}
        </section>

        {/* SIDE BETS */}
        <section className="min-w-0 overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f1f1f1]">
          <div className="grid grid-cols-[minmax(0,1fr)_90px] bg-[#4b5b6b] text-white">
            <div className="flex items-center px-3 py-3">
              <span className="text-sm font-bold">Side Bets</span>
            </div>
            <div className="flex items-center justify-center bg-[#72b9e8] py-3 text-sm font-bold text-[#303b45]">
              Back
            </div>
          </div>

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
              <OddsButton nation={item.name} market={item.market} type="back" />
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

  const MarketCell = ({ label, odds, type = 'back' }) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() =>
        !isSuspended &&
        openBetSlip(label, odds, type, isMobile)
      }
      className={`relative flex min-w-0 flex-col items-center justify-center
        h-[46px] sm:h-[52px] w-full px-1
        ${type === 'back' ? 'bg-[#72b9e8]' : 'bg-[#f5a5b8]'}
        ${isSuspended ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:brightness-95'}
      `}
    >
      <span className="text-[12px] sm:text-[14px] font-bold text-[#263746]">
        {isSuspended ? '-' : odds}
      </span>
      <span className="text-[9px] text-[#34495e] leading-none">
        100
      </span>
      {isSuspended && (
        <span className="absolute inset-0 flex items-center justify-center bg-[#263746]/80 text-[11px] font-bold text-red-500">
          SUSPENDED
        </span>
      )}
    </button>
  );

  const SectionHeader = ({ children }) => (
    <div className="bg-[#4b5b6b] px-2 py-1 text-[12px] sm:text-[13px] font-bold text-white">
      {children}
    </div>
  );

  return (
    <div className="w-full min-w-0 overflow-hidden bg-white text-[#333]">
      {/* BOOKMAKER */}
      <SectionHeader>Bookmaker</SectionHeader>

      <div className="flex justify-end bg-[#f4f4f4] border-b border-gray-300">
        <div className="w-[78px] sm:w-[90px] bg-[#72b9e8] py-1 text-center text-[12px] font-bold">
          Back
        </div>
        <div className="w-[78px] sm:w-[90px] bg-[#f5a5b8] py-1 text-center text-[12px] font-bold">
          Lay
        </div>
      </div>

      {[
        { label: 'IND', back: '1.60', lay: '1.64' },
        { label: 'AUS', back: '-', lay: '-' },
      ].map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[minmax(0,1fr)_78px_78px] sm:grid-cols-[minmax(0,1fr)_90px_90px] border-b border-gray-300 bg-[#f1f1f1]"
        >
          <div className="flex items-center px-2 text-[12px]">
            {item.label}
          </div>
          <MarketCell
            label={item.label}
            odds={item.back}
            type="back"
          />
          <MarketCell
            label={item.label}
            odds={item.lay}
            type="lay"
          />
        </div>
      ))}

      {/* TIE */}
      <div className="mt-1">
        <SectionHeader>Tie</SectionHeader>

        <div className="grid grid-cols-[minmax(0,1fr)_78px_78px] sm:grid-cols-[minmax(0,1fr)_90px_90px] border-b border-gray-300 bg-[#f1f1f1]">
          <div className="flex items-center px-2 text-[12px]">
            Tie
          </div>
          <MarketCell label="Tie" odds="11.93" type="back" />
          <MarketCell label="Tie" odds="14.43" type="lay" />
        </div>
      </div>

      {/* FANCY */}
      <div className="mt-1">
        <SectionHeader>Fancy1</SectionHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-1 bg-white">
          {outcomes.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[minmax(0,1fr)_68px_68px_58px] sm:grid-cols-[minmax(0,1fr)_76px_76px_78px] border-b border-gray-300 bg-[#f1f1f1]"
            >
              <div className="flex min-w-0 items-center px-1 text-[11px] sm:text-[12px]">
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex flex-col items-center justify-center bg-[#72b9e8] h-[44px]">
                <span className="text-[12px] font-bold">
                  {isSuspended ? '-' : item.odds}
                </span>
                <span className="text-[9px] leading-none">100</span>
              </div>

              <div className="flex flex-col items-center justify-center bg-[#f5a5b8] h-[44px]">
                <span className="text-[12px] font-bold">
                  {isSuspended ? '-' : '-'}
                </span>
                <span className="text-[9px] leading-none">100</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center text-[10px] font-bold text-[#0085a8] leading-tight">
                <span>Min: 100</span>
                <span>Max: 10K</span>
              </div>

              {isSuspended && (
                <div className="col-span-4 bg-[#263746] py-1 text-center text-[11px] font-bold text-red-500">
                  SUSPENDED
                </div>
              )}

              {!isSuspended && (
                <button
                  type="button"
                  onClick={() =>
                    openBetSlip(item.label, item.odds, 'back', isMobile)
                  }
                  className="hidden"
                />
              )}

              <button
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  !isSuspended &&
                  openBetSlip(item.label, item.odds, 'back', isMobile)
                }
                className="absolute hidden"
              />
            </div>
          ))}
        </div>
      </div>

      {/* LAST RESULT */}
      <div className="mt-1">
        <SectionHeader>
          <div className="flex items-center justify-between">
            <span>Last Result</span>
            <span className="font-normal">View All</span>
          </div>
        </SectionHeader>

        <div className="flex justify-end gap-1 overflow-hidden py-1">
          {['A', 'I', 'I', 'I', 'A', 'I', 'A', 'I', 'I', 'I'].map(
            (result, index) => (
              <div
                key={index}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#315d3b] text-[11px] font-bold text-yellow-300"
              >
                {result}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Goal (goal)
// --------------------------------------------------------------------------
function TableGoal({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    { label: 'Cristiano Ronaldo', odds: '5.05', max: '1L' },
    { label: 'Lionel Messi', odds: '5.54', max: '1L' },
    { label: 'Robert Lewandowski', odds: '6.6', max: '1L' },
    { label: 'Neymar', odds: '7.63', max: '1L' },
    { label: 'Harry Kane', odds: '9.04', max: '1L' },
    { label: 'Zlatan Ibrahimovic', odds: '11.84', max: '50K' },
    { label: 'Romelu Lukaku', odds: '13.21', max: '50K' },
    { label: 'Kylian Mbappe', odds: '15.61', max: '50K' },
    { label: 'Erling Haaland', odds: '15.61', max: '50K' },
    { label: 'No Goal', odds: '38.16', stake: '30000', max: '25K' },
  ];

  const methods = [
    { label: 'Shot Goal', odds: '1.73' },
    { label: 'Header Goal', odds: '4.4' },
    { label: 'Penalty Goal', odds: '7.01' },
    { label: 'Free Kick Goal', odds: '11.45', max: '50K' },
    { label: 'No Goal', odds: '38.16', stake: '30000', max: '25K' },
  ];

  const renderMarket = (title, items, marketType) => (
    <div className="min-w-0 w-full">
      {/* Market Header */}
      <div className="bg-[#4b5b6b] px-2 py-2 text-white font-bold text-[13px] sm:text-[15px]">
        {title}
      </div>

      {/* Column Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_78px_95px] sm:grid-cols-[minmax(0,1fr)_90px_98px] bg-[#f1f1f1] border-b border-gray-300">
        <div />
        <div className="bg-[#72b9e8] text-center py-1 font-bold text-[12px] sm:text-[14px]">
          Back
        </div>
        <div />
      </div>

      {/* Market Rows */}
      {items.map((item, index) => {
        const marketOdds =
          marketType === 'players'
            ? markets?.[item.key]?.back
            : markets?.[item.key]?.back;

        const odds = marketOdds || item.odds;
        const stake = item.stake || '100000';
        const max = item.max || '1L';

        return (
          <div
            key={item.label}
            className="grid grid-cols-[minmax(0,1fr)_78px_95px] sm:grid-cols-[minmax(0,1fr)_90px_98px] min-h-[43px] border-b border-[#c9c9c9] bg-[#f1f1f1]"
          >
            {/* Name */}
            <div className="flex items-center min-w-0 px-2 py-1 text-[12px] sm:text-[14px]">
              <span className="truncate">{item.label}</span>
            </div>

            {/* Back Odds */}
            <button
              type="button"
              disabled={isSuspended}
              onClick={() =>
                !isSuspended &&
                openBetSlip(item.label, odds, 'back', isMobile)
              }
              className={`flex flex-col items-center justify-center min-w-0 bg-[#72b9e8] text-[#263746] ${
                isSuspended
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:brightness-95'
              }`}
            >
              <span className="text-[14px] sm:text-[17px] font-bold leading-tight">
                {isSuspended ? '-' : odds}
              </span>
              <span className="text-[10px] leading-tight">
                {stake}
              </span>
              {isSuspended && (
                <span className="text-[8px] font-bold text-red-600">
                  SUSPENDED
                </span>
              )}
            </button>

            {/* Min Max */}
            <div className="flex flex-col justify-center items-end pr-1 sm:pr-2 text-[10px] sm:text-[12px] font-bold text-[#0085a8] leading-[16px]">
              <span>Min: 100</span>
              <span>Max: {max}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full min-w-0 overflow-hidden bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px] items-start">
        {renderMarket(
          'Who Will Goal Next?',
          players,
          'players'
        )}

        {renderMarket(
          'Method Of Next Goal',
          methods,
          'methods'
        )}
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
  const cricketRuns = [
    { label: '0 Runs', odds: '3.2' },
    { label: '1 Run', odds: '3.2' },
    { label: '2 Runs', odds: '3.2' },
    { label: '3 Runs', odds: '3.2' },
    { label: '4 Runs', odds: '5.5' },
    { label: '6 Runs', odds: '8.0' },
    { label: 'Wicket', odds: '4.5', danger: true },
  ];

  const teams = [
    {
      name: 'Team A',
      market: markets?.playerA,
    },
    {
      name: 'Team B',
      market: markets?.playerB,
    },
  ];

  const renderOutcome = (item) => (
    <button
      key={item.label}
      type="button"
      disabled={isSuspended}
      onClick={() =>
        !isSuspended &&
        openBetSlip(item.label, item.odds, 'back', isMobile)
      }
      className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-md border border-[#d2d6da] px-1 py-2 transition-colors ${
        item.danger
          ? 'bg-[#fff0f0] hover:bg-[#ffe0e0]'
          : 'bg-white hover:bg-[#edf6fc]'
      } ${isSuspended ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span
        className={`text-[15px] font-bold ${
          item.danger ? 'text-red-600' : 'text-[#263746]'
        }`}
      >
        {item.odds}
      </span>
      <span
        className={`text-[11px] font-semibold text-center leading-tight ${
          item.danger ? 'text-red-600' : 'text-[#424b54]'
        }`}
      >
        {item.label}
      </span>
    </button>
  );

  return (
    <div className="w-full space-y-2">

      {/* Match Odds */}
      <div className="overflow-hidden rounded-md border border-[#d1d5d9] bg-white">
        <div className="grid grid-cols-[minmax(0,1fr)_76px_76px] bg-[#4b5b6b] text-white">
          <div className="flex h-[34px] items-center px-3 text-[13px] font-bold">
            15-Ball Cricket Match Odds
          </div>
          <div className="flex h-[34px] items-center justify-center bg-[#72b9e8] text-[12px] font-bold text-[#263746]">
            Back
          </div>
          <div className="flex h-[34px] items-center justify-center bg-[#f5a5b8] text-[12px] font-bold text-[#263746]">
            Lay
          </div>
        </div>

        {teams.map((team, index) => (
          <div
            key={team.name}
            className={`grid grid-cols-[minmax(0,1fr)_76px_76px] items-center ${
              index !== 0 ? 'border-t border-[#d9dde1]' : ''
            }`}
          >
            <div className="min-w-0 px-3 py-3">
              <div className="text-[13px] font-bold text-[#303943]">
                {team.name}
              </div>
              <div className="text-[10px] text-gray-500">
                15 Balls
              </div>
            </div>

            {['back', 'lay'].map((type) => {
              const odds =
                team.market?.[type] || (type === 'back' ? '1.98' : '2.02');

              return (
                <button
                  key={type}
                  type="button"
                  disabled={isSuspended}
                  onClick={() =>
                    !isSuspended &&
                    openBetSlip(team.name, odds, type, isMobile)
                  }
                  className={`flex h-[48px] items-center justify-center border-l border-white text-[16px] font-bold text-[#263746] ${
                    type === 'back'
                      ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
                      : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
                  } ${isSuspended ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  {odds}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Next Ball Outcome */}
      <div className="overflow-hidden rounded-md border border-[#d1d5d9] bg-[#f5f6f7]">
        <div className="flex min-h-[36px] items-center justify-between bg-[#4b5b6b] px-3">
          <span className="text-[13px] font-bold text-white">
            Next Ball Outcome
          </span>
          <span className="text-[10px] font-medium text-gray-200">
            Runs / Wicket
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-2 sm:grid-cols-7">
          {cricketRuns.map(renderOutcome)}
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
  const topBets = [
    { name: 'ODD', odds: '1:1' },
    { name: '4', odds: '50:1' },
    { name: '5', odds: '20:1' },
    { name: '6', odds: '15:1' },
    { name: '7', odds: '12:1' },
    { name: '8', odds: '8:1' },
    { name: '9', odds: '6:1' },
    { name: '10', odds: '6:1' },
    { name: 'ANY TRIPLE', odds: '30:1', span: true },
    { name: '11', odds: '6:1' },
    { name: '12', odds: '6:1' },
    { name: '13', odds: '8:1' },
    { name: '14', odds: '12:1' },
    { name: '15', odds: '15:1' },
    { name: '16', odds: '20:1' },
    { name: '17', odds: '50:1' },
    { name: 'EVEN', odds: '1:1' },
  ];

  const diceBets = [
    { name: '1', dice: [1] },
    { name: '2', dice: [2] },
    { name: '3', dice: [3] },
    { name: '4', dice: [4] },
    { name: '5', dice: [5] },
    { name: '6', dice: [6] },
    { name: '1-1', dice: [1, 1] },
    { name: '1-2', dice: [1, 2] },
    { name: '1-3', dice: [1, 3] },
    { name: '1-4', dice: [1, 4] },
    { name: '1-5', dice: [1, 5] },
    { name: '1-6', dice: [1, 6] },
    { name: '2-2', dice: [2, 2] },
    { name: '2-3', dice: [2, 3] },
    { name: '2-4', dice: [2, 4] },
    { name: '2-5', dice: [2, 5] },
    { name: '2-6', dice: [2, 6] },
    { name: '3-3', dice: [3, 3] },
  ];

  const twoDiceBets = [
    [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
    [1, 6], [2, 2], [2, 3], [2, 4], [2, 5],
    [2, 6], [3, 3], [3, 4], [3, 5], [3, 6],
    [4, 4], [4, 5], [4, 6], [5, 5], [5, 6],
    [6, 6],
  ];

  const pipPositions = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };

  const positionClasses = {
    'top-left': 'top-[17%] left-[17%]',
    'top-right': 'top-[17%] right-[17%]',
    'middle-left': 'top-1/2 left-[17%] -translate-y-1/2',
    'middle-right': 'top-1/2 right-[17%] -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-[17%] left-[17%]',
    'bottom-right': 'bottom-[17%] right-[17%]',
  };

  const placeBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  const renderDie = (number, key, size = 'h-6 w-6') => (
    <div
      key={key}
      className={`relative shrink-0 rounded-[4px] bg-[#a90032] ${size}`}
    >
      {pipPositions[number].map((position, index) => (
        <span
          key={index}
          className={`absolute h-[4px] w-[4px] rounded-full bg-white ${
            positionClasses[position]
          }`}
        />
      ))}
    </div>
  );

  const BetBox = ({
    name,
    odds,
    children,
    className = '',
    onClick,
  }) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={onClick || (() => placeBet(name, odds))}
      className={`flex min-w-0 items-center justify-center rounded-md border border-[#c8c0bb] bg-[#bdb5af] text-center text-[#202033] transition-colors ${
        isSuspended
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover:bg-[#aaa29c]'
      } ${className}`}
    >
      {children || (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[12px] font-semibold leading-tight">
            {name}
          </span>
          <span className="text-[13px] font-extrabold leading-tight">
            {isSuspended ? '-' : odds}
          </span>
        </div>
      )}
    </button>
  );

  return (
    <div className="w-full overflow-x-auto rounded-md bg-[#f7f7f7] p-1">
      <div className="min-w-[900px]">
        {/* TOP PAYOUT LABELS */}
        <div className="mb-1 grid grid-cols-[66px_minmax(0,1fr)_66px] gap-1">
          <div className="rounded-full bg-[#666] px-1.5 py-1 text-center text-[10px] font-bold leading-tight text-white">
            1:1 Lose if Any Triple
          </div>

          <div className="flex justify-center">
            <div className="w-[76px] rounded-full bg-[#666] py-1 text-center text-[11px] font-bold text-white">
              30:1
            </div>
          </div>

          <div className="rounded-full bg-[#666] px-1.5 py-1 text-center text-[10px] font-bold leading-tight text-white">
            1:1 Lose if Any Triple
          </div>
        </div>

        {/* MAIN NUMBERS */}
        <div className="grid grid-cols-[66px_minmax(0,1fr)_66px] gap-1">
          <button
            type="button"
            disabled={isSuspended}
            onClick={() => placeBet('Small (4-10)', '1.98')}
            className="flex flex-col items-center justify-center gap-1 rounded-md border border-[#c8c0bb] bg-[#bdb5af] text-[#202033]"
          >
            <span className="text-[14px] font-extrabold">SMALL</span>
            <span className="text-[14px] font-bold">4-10</span>
            <span className="text-[12px] font-bold">
              {isSuspended ? '-' : '1:1'}
            </span>
          </button>

          <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
            {topBets.map((bet) => (
              <BetBox
                key={bet.name}
                name={bet.name}
                odds={bet.odds}
                className={`h-[58px] px-0.5 ${
                  bet.span ? 'col-span-2' : ''
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={isSuspended}
            onClick={() => placeBet('Big (11-17)', '1.98')}
            className="flex flex-col items-center justify-center gap-1 rounded-md border border-[#c8c0bb] bg-[#bdb5af] text-[#202033]"
          >
            <span className="text-[14px] font-extrabold">BIG</span>
            <span className="text-[14px] font-bold">11-17</span>
            <span className="text-[12px] font-bold">
              {isSuspended ? '-' : '1:1'}
            </span>
          </button>

          {/* PAYOUT GROUPS */}
          <div />

          <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
            {[
              { label: '1:1 on Single', span: 1 },
              { label: '2:1 on Double', span: 1 },
              { label: '3:1 on Triple', span: 1 },
              { label: '8:1 Each Double', span: 6 },
              { label: '150:1 Each Triple', span: 9 },
            ].map((item) => (
              <div
                key={item.label}
                style={{ gridColumn: `span ${item.span}` }}
                className="flex h-[25px] items-center justify-center rounded-full bg-[#666] px-1 text-center text-[10px] font-bold text-white"
              >
                {item.label}
              </div>
            ))}
          </div>

          <div />

          {/* DICE COMBINATIONS */}
          <div />

          <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
            {diceBets.map((bet) => (
              <BetBox
                key={bet.name}
                name={bet.name}
                odds="8:1"
                className="h-[48px] flex-row gap-0.5 px-0.5"
              >
                <div className="flex items-center gap-0.5">
                  {bet.dice.map((die, index) =>
                    renderDie(die, index, 'h-5 w-5')
                  )}
                </div>
              </BetBox>
            ))}
          </div>

          <div />
        </div>

        {/* TWO DICE */}
        <div className="mx-auto mt-3 max-w-[650px]">
          <div className="mb-1 rounded-full bg-[#666] py-1 text-center text-[11px] font-bold text-white">
            5:1 Two Dice
          </div>

          <div className="grid grid-cols-15 gap-1">
            {twoDiceBets.map((pair, index) => (
              <BetBox
                key={`${pair[0]}-${pair[1]}-${index}`}
                name={`Two Dice ${pair[0]}-${pair[1]}`}
                odds="5:1"
                className="min-h-[52px] flex-col gap-0.5 p-1"
              >
                <div className="flex flex-col gap-0.5">
                  {renderDie(pair[0], 'first', 'h-5 w-5')}
                  {renderDie(pair[1], 'second', 'h-5 w-5')}
                </div>
              </BetBox>
            ))}
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
  const bets = [
    {
      name: 'Small',
      range: '4 - 10',
      odds: '1.98',
      subtitle: 'Lose to Any Triple',
      onClick: () =>
        openBetSlip('Small (4-10)', '1.98', 'back', isMobile),
    },
    {
      name: 'Big',
      range: '11 - 17',
      odds: '1.98',
      subtitle: 'Lose to Any Triple',
      onClick: () =>
        openBetSlip('Big (11-17)', '1.98', 'back', isMobile),
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {bets.map((bet) => (
          <button
            key={bet.name}
            type="button"
            disabled={isSuspended}
            onClick={bet.onClick}
            className={`min-w-0 rounded-lg border border-[#d1d5d9] bg-white p-3 text-center transition-colors ${
              isSuspended
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:border-[#72b9e8]'
            }`}
          >
            <div className="mb-2 text-[13px] font-bold text-[#4b5b6b] sm:text-sm">
              {bet.name} ({bet.range})
            </div>

            <div className="mb-2 text-[11px] text-[#7b8794]">
              {bet.subtitle}
            </div>

            <div className="rounded-md bg-[#72b9e8] px-2 py-2 text-base font-bold text-[#263746]">
              {isSuspended ? '-' : bet.odds}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          disabled={isSuspended}
          onClick={() =>
            openBetSlip('Any Triple', '31.0', 'back', isMobile)
          }
          className={`w-full max-w-[220px] rounded-lg border border-[#d1d5d9] bg-white p-3 text-center transition-colors ${
            isSuspended
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:border-[#72b9e8]'
          }`}
        >
          <div className="mb-2 text-sm font-bold text-[#4b5b6b]">
            Any Triple
          </div>

          <div className="rounded-md bg-[#72b9e8] px-2 py-2 text-base font-bold text-[#263746]">
            {isSuspended ? '-' : '31.0'}
          </div>
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Ball by Ball (ballbyball)
// --------------------------------------------------------------------------
function TableBallbyball({ isMobile, isSuspended, openBetSlip }) {
  const groups = [
    [
      { label: '0 Runs', odds: '2.50', min: '50', max: '25K' },
      { label: '3 Runs', odds: '12.00', min: '50', max: '25K' },
      { label: 'Boundary', odds: '5.50', min: '50', max: '25K' },
    ],
    [
      { label: '1 Runs', odds: '2.20', min: '50', max: '25K' },
      { label: '4 Runs', odds: '5.50', min: '50', max: '25K' },
      { label: 'Wicket', odds: '4.00', min: '50', max: '25K' },
    ],
    [
      { label: '2 Runs', odds: '4.50', min: '50', max: '25K' },
      { label: '6 Runs', odds: '8.00', min: '50', max: '20K' },
      { label: 'Extra Runs', odds: '6.00', min: '50', max: '25K' },
    ],
  ];

  const message =
    'Results are based on stream only. Score board may be different or updated later.';

  const LockIcon = () => (
    <svg
      width="22"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="mx-auto"
    >
      <path
        d="M7 10V7a5 5 0 0 1 10 0v3"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="4" y="9" width="16" height="13" rx="2.5" fill="white" />
      <circle cx="12" cy="15" r="1.8" fill="#414c55" />
      <path
        d="M12 16v2"
        stroke="#414c55"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div className="w-full overflow-hidden bg-white">
      <style>{`
        @keyframes ballbyball-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ballbyball-marquee {
          display: flex;
          width: max-content;
          animation: ballbyball-marquee 18s linear infinite;
        }

        .ballbyball-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* HEADER */}
      <div className="bg-[#4b5968] px-2 py-2 text-[15px] font-bold text-white">
        Runs
      </div>

      {/* RUNS TABLE */}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-3 md:gap-2">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="min-w-0">
            {/* BACK HEADER */}
            <div className="grid grid-cols-[minmax(0,1fr)_82px_105px] border-b border-[#c9c9c9] bg-[#f1f1f1]">
              <div />
              <div className="bg-[#72b9e8] py-2 text-center text-sm font-bold text-[#263746]">
                Back
              </div>
              <div />
            </div>

            {/* OUTCOME ROWS */}
            {group.map((item) => (
              <div
                key={item.label}
                className="grid min-h-[50px] grid-cols-[minmax(0,1fr)_82px_105px] border-b border-[#c9c9c9] bg-[#f1f1f1]"
              >
                <div className="flex items-center px-2 text-[14px] font-medium text-[#333]">
                  {item.label}
                </div>

                <button
                  type="button"
                  disabled={isSuspended}
                  onClick={() =>
                    !isSuspended &&
                    openBetSlip(item.label, item.odds, 'back', isMobile)
                  }
                  className={`flex items-center justify-center bg-[#414c55] ${
                    isSuspended
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer hover:bg-[#34404a]'
                  }`}
                >
                  {isSuspended ? (
                    <LockIcon />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {item.odds}
                    </span>
                  )}
                </button>

                <div className="flex flex-col items-end justify-center px-2 text-[13px] font-bold leading-5 text-[#00819a]">
                  <span>Min: {item.min}</span>
                  <span>Max: {item.max}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* INFINITE SCROLLING FOOTER */}
      <div className="mt-1 flex h-[44px] items-center overflow-hidden bg-[#087343] text-white">
        <div className="z-10 flex h-full shrink-0 items-center px-4">
          <svg
            width="27"
            height="27"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-4.7A8.5 8.5 0 1 1 21 11.5Z"
              stroke="white"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="ballbyball-marquee">
            {[0, 1, 2, 3].map((item) => (
              <span
                key={item}
                className="whitespace-nowrap px-8 text-[13px] font-bold"
              >
                {message}
              </span>
            ))}
          </div>
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
  const mainPlayers = [
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
    { name: 'Pair Plus A', odds: '2.0' },
    { name: 'Pair Plus B', odds: '2.0' },
    { name: '3 Baccarat A', odds: '1.95' },
    { name: '3 Baccarat B', odds: '1.95' },
  ];

  const backStyle =
    'bg-[#72b9e8] hover:bg-[#5da9dc]';

  const layStyle =
    'bg-[#f5a5b8] hover:bg-[#ed91a7]';

  const buttonBase =
    'flex min-h-[42px] w-full items-center justify-center rounded-md px-2 text-sm font-bold text-[#263746] transition-colors';

  const renderOdds = (nation, odds, type) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() =>
        !isSuspended &&
        openBetSlip(nation, odds, type, isMobile)
      }
      className={`${buttonBase} ${
        type === 'back' ? backStyle : layStyle
      } ${
        isSuspended
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer'
      }`}
    >
      {isSuspended ? '-' : odds}
    </button>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr]">

        {/* MAIN PLAYER ODDS */}
        <div className="overflow-hidden rounded-lg border border-[#d1d5d9] bg-white">
          <div className="grid grid-cols-[minmax(0,1fr)_76px_76px] items-center gap-2 border-b border-[#d1d5d9] bg-[#f3f5f7] px-3 py-2">
            <div className="text-sm font-bold text-[#4b5b6b]">
              Players
            </div>
            <div className="rounded-md bg-[#72b9e8] py-1.5 text-center text-xs font-bold text-[#263746]">
              Back
            </div>
            <div className="rounded-md bg-[#f5a5b8] py-1.5 text-center text-xs font-bold text-[#263746]">
              Lay
            </div>
          </div>

          <div className="divide-y divide-[#e5e7eb]">
            {mainPlayers.map((player) => (
              <div
                key={player.name}
                className="grid grid-cols-[minmax(0,1fr)_76px_76px] items-center gap-2 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#263746]">
                    {player.name}
                  </div>
                </div>

                {renderOdds(player.name, player.back, 'back')}
                {renderOdds(player.name, player.lay, 'lay')}
              </div>
            ))}
          </div>
        </div>

        {/* SIDE BETS */}
        <div className="overflow-hidden rounded-lg border border-[#d1d5d9] bg-white">
          <div className="grid grid-cols-[minmax(0,1fr)_76px] items-center gap-2 border-b border-[#d1d5d9] bg-[#f3f5f7] px-3 py-2">
            <div className="text-sm font-bold text-[#4b5b6b]">
              Side Bets
            </div>
            <div className="rounded-md bg-[#72b9e8] py-1.5 text-center text-xs font-bold text-[#263746]">
              Back
            </div>
          </div>

          <div className="divide-y divide-[#e5e7eb]">
            {sideBets.map((bet) => (
              <div
                key={bet.name}
                className="grid grid-cols-[minmax(0,1fr)_76px] items-center gap-2 px-3 py-2"
              >
                <div className="min-w-0 truncate text-sm font-semibold text-[#263746]">
                  {bet.name}
                </div>

                {renderOdds(bet.name, bet.odds, 'back')}
              </div>
            ))}
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
    {
      name: 'Dragon',
      odds: markets?.dragon?.back || '1.98',
      flex: 'flex-[2.5]',
    },
    {
      name: 'Tie',
      odds: markets?.tie?.back || '11',
      flex: 'flex-1',
    },
    {
      name: 'Tiger',
      odds: markets?.tiger?.back || '1.98',
      flex: 'flex-[2.5]',
    },
    {
      name: 'Pair',
      odds: markets?.pair?.back || '12',
      flex: 'flex-[2.5]',
    },
  ];

  const sideMarkets = [
    { name: 'Even', odds: '2.10' },
    { name: 'Odd', odds: '1.79' },
    { name: 'Red Suits', odds: '1.95', label: '♥ ♦', color: 'text-red-500' },
    { name: 'Black Suits', odds: '1.95', label: '♠ ♣', color: 'text-black' },
  ];

  const cardRanks = [
    { label: 'A', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7', value: 7 },
    { label: '8', value: 8 },
    { label: '9', value: 9 },
    { label: '10', value: 10 },
    { label: 'J', value: 11 },
    { label: 'Q', value: 12 },
    { label: 'K', value: 13 },
  ];

  const placeBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, 'back', isMobile);
    }
  };

  const buttonClass = `
    flex w-full min-w-0 items-center justify-center
    rounded-sm bg-gradient-to-r from-[#078bc5] to-[#293f50]
    font-bold text-white shadow-sm transition-all
    ${
      isSuspended
        ? 'cursor-not-allowed opacity-50'
        : 'cursor-pointer hover:brightness-110 active:scale-[0.99]'
    }
  `;

  const renderSide = (side) => (
    <div className="min-w-0 bg-[#f1f1f1] p-2">
      <h3 className="mb-2 text-center text-lg font-extrabold text-[#333]">
        {side.toUpperCase()}
      </h3>

      <div className="grid grid-cols-4 gap-1">
        {sideMarkets.map((market) => (
          <div key={`${side}-${market.name}`} className="min-w-0">
            <div className="mb-1 text-center text-sm font-bold text-[#333]">
              {isSuspended ? '-' : market.odds}
            </div>

            <button
              type="button"
              disabled={isSuspended}
              onClick={() =>
                placeBet(`${side} ${market.name}`, market.odds)
              }
              className={`${buttonClass} h-[46px] text-sm sm:text-base`}
            >
              {market.label ? (
                <span className={`text-xl sm:text-2xl ${market.color}`}>
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

  // Playing card design
  const renderCard = (card, side) => (
    <button
      key={`${side}-${card.value}`}
      type="button"
      disabled={isSuspended}
      onClick={() => placeBet(`${side} ${card.label}`, '12')}
      className={`relative flex h-[68px] w-[47px] shrink-0 flex-col justify-between border border-yellow-400 bg-white p-1 text-left shadow-sm transition-transform ${
        isSuspended
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:-translate-y-1'
      }`}
    >
      <span className="text-[25px] font-bold leading-none text-black">
        {card.label}
      </span>

      <div className="flex items-center justify-between text-[18px] font-bold leading-none">
        <span className="text-black">♠</span>
        <span className="text-red-600">♦</span>
      </div>

      <div className="flex items-center justify-between text-[18px] font-bold leading-none">
        <span className="text-black">♣</span>
        <span className="text-red-600">♥</span>
      </div>
    </button>
  );

  const renderCardMarket = (side) => (
    <div className="min-w-0 border border-[#d1d1d1] bg-[#f1f1f1] p-2">
      <h3 className="mb-2 text-center text-lg font-extrabold text-[#333]">
        {side.toUpperCase()} 12
      </h3>

      <div className="flex flex-wrap justify-center gap-1.5">
        {cardRanks.map((card) => renderCard(card, side))}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-2 bg-white p-1">

      {/* DRAGON / TIE / TIGER / PAIR */}
      <div className="flex items-end gap-1.5 sm:gap-2">
        {topMarkets.map((market, index) => (
          <div
            key={market.name}
            className={`${market.flex} min-w-0 ${
              index === 3
                ? 'border-l-[4px] border-[#293d50] pl-1.5 sm:pl-2'
                : ''
            }`}
          >
            <div className="mb-1 text-center text-base font-extrabold text-[#333] sm:text-lg">
              {isSuspended ? '-' : market.odds}
            </div>

            <button
              type="button"
              disabled={isSuspended}
              onClick={() => placeBet(market.name, market.odds)}
              className={`${buttonClass} h-[48px] text-sm sm:h-[52px] sm:text-lg`}
            >
              {market.name}
            </button>
          </div>
        ))}
      </div>

      {/* DRAGON / TIGER SIDE MARKETS */}
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
        {renderSide('Dragon')}
        {renderSide('Tiger')}
      </div>

      {/* DRAGON 12 / TIGER 12 CARD MARKETS */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {renderCardMarket('Dragon')}
        {renderCardMarket('Tiger')}
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
  const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const andarFaceUp = ["3", "5", "8"];
  const baharFaceUp = ["7", "9", "J", "Q"];

  const renderCard = (card, type, faceUp) => {
    const visible = faceUp.includes(card);

    const odds =
      markets?.[type.toLowerCase()]?.[card]?.back ||
      markets?.[type.toLowerCase()]?.back ||
      "12.5";

    return (
      <button
        key={`${type}-${card}`}
        type="button"
        disabled={isSuspended}
        onClick={() =>
          openBetSlip(`${type} ${card}`, odds, "back", isMobile)
        }
        className="flex aspect-[0.70] w-full min-w-0 flex-col overflow-hidden border-2 border-yellow-300 bg-white p-[2px] disabled:cursor-not-allowed"
      >
        {visible ? (
          <div className="flex h-full flex-col justify-between bg-white px-[2px] py-0.5">
            <span className="text-left text-[clamp(10px,2.2vw,30px)] font-bold leading-none text-black">
              {card}
            </span>

            <div className="flex justify-between text-[clamp(9px,1.6vw,22px)] font-bold leading-none">
              <span className="text-black">♠</span>
              <span className="text-red-600">♦</span>
            </div>

            <div className="flex justify-between text-[clamp(9px,1.6vw,22px)] font-bold leading-none">
              <span className="text-black">♣</span>
              <span className="text-red-600">♥</span>
            </div>
          </div>
        ) : (
          <div
            className="h-full w-full border border-[#d4e6f5]"
            style={{
              backgroundColor: "#eaf3fc",
              backgroundImage: `
                radial-gradient(#2878c2 1px, transparent 1px),
                radial-gradient(#2878c2 1px, transparent 1px)
              `,
              backgroundPosition: "0 0, 3px 3px",
              backgroundSize: "5px 5px",
            }}
          />
        )}
      </button>
    );
  };

  const renderRow = (type, background, faceUp) => (
    <div
      className="grid grid-cols-[10%_90%] items-center border-2 border-black"
      style={{
        backgroundColor: background,
        minHeight: "clamp(100px, 9.3vw, 140px)",
      }}
    >
      <div className="flex h-full items-center justify-center border-r-2 border-black">
        <span className="text-[clamp(10px,1.5vw,22px)] font-bold text-[#333]">
          {type}
        </span>
      </div>

      <div className="mx-auto grid w-full max-w-[920px] grid-cols-13 items-center gap-[3px] px-1 py-2 sm:gap-[7px] sm:px-2">
        {cards.map((card) => renderCard(card, type, faceUp))}
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-hidden bg-white">
      {renderRow("ANDAR", "#ff9b78", andarFaceUp)}
      {renderRow("BAHAR", "#83e985", baharFaceUp)}
    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Andar Bahar 2 (abj)
// --------------------------------------------------------------------------

function TableAbj({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const defaultOdds = ["4", "4", "4", "4", "4", "4", "4", "2", "3", "4", "4", "3", "4"];

  const renderCard = (card, type, index) => {
    const odds =
      markets?.[type.toLowerCase()]?.[card]?.back ||
      markets?.[type.toLowerCase()]?.back ||
      defaultOdds[index];

    return (
      <button
        key={`${type}-${card}`}
        type="button"
        disabled={isSuspended}
        onClick={() =>
          openBetSlip(`${type} ${card}`, odds, "back", isMobile)
        }
        className="flex min-w-0 flex-col items-center justify-center gap-[3px] bg-transparent p-0 disabled:cursor-not-allowed"
      >
        {/* Odds */}
        <span className="h-[19px] text-[12px] font-bold leading-[19px] text-[#333] sm:text-[15px]">
          {isSuspended ? "-" : odds}
        </span>

        {/* Playing Card */}
        <div className="flex aspect-[0.72] w-full flex-col justify-between border-2 border-yellow-300 bg-white p-[2px] sm:p-[3px]">
          <span className="text-left text-[clamp(12px,2vw,29px)] font-bold leading-none text-black">
            {card}
          </span>

          <div className="flex justify-between text-[clamp(10px,1.5vw,21px)] font-bold leading-none">
            <span className="text-black">♠</span>
            <span className="text-red-600">♦</span>
          </div>

          <div className="flex justify-between text-[clamp(10px,1.5vw,21px)] font-bold leading-none">
            <span className="text-black">♣</span>
            <span className="text-red-600">♥</span>
          </div>
        </div>
      </button>
    );
  };

  const renderRow = (type, background) => (
    <div
      className="grid grid-cols-[10%_90%] items-center border-2 border-black"
      style={{ backgroundColor: background }}
    >
      {/* Row Label */}
      <div className="flex h-full items-center justify-center border-r-2 border-black">
        <span className="text-[clamp(10px,1.5vw,22px)] font-bold text-[#333]">
          {type}
        </span>
      </div>

      {/* Cards Grid */}
      <div className="mx-auto grid w-full max-w-[900px] grid-cols-13 items-center gap-[3px] px-1 py-2 sm:gap-[5px] sm:px-2">
        {cards.map((card, index) => renderCard(card, type, index))}
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-hidden bg-white">
      {renderRow("ANDAR", "#fca3a3")}
      {renderRow("BAHAR", "#ffe59a")}
    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Lucky 7 - A (lucky7)
// --------------------------------------------------------------------------

function TableLucky7({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const groups = [
    { label: "A-2-3", cards: ["A", "2", "3"] },
    { label: "4-5-6", cards: ["4", "5", "6"] },
    { label: "8-9-10", cards: ["8", "9", "10"] },
    { label: "J-Q-K", cards: ["J", "Q", "K"] },
  ];

  const getOdds = (key, fallback) =>
    markets?.[key]?.back || fallback;

  const Card = ({ value, compact = false }) => (
    <div
      className={`flex aspect-[0.72] flex-col justify-between border-2 border-yellow-400 bg-white ${
        compact
          ? "w-[clamp(25px,5vw,48px)] p-[2px]"
          : "w-[clamp(29px,4.5vw,43px)] p-[2px]"
      }`}
    >
      <span className="text-left text-[clamp(17px,2.5vw,32px)] font-bold leading-none text-black">
        {value}
      </span>
      <div className="flex justify-between text-[clamp(11px,1.5vw,19px)] font-bold leading-none">
        <span className="text-black">♠</span>
        <span className="text-red-600">♦</span>
      </div>
      <div className="flex justify-between text-[clamp(11px,1.5vw,19px)] font-bold leading-none">
        <span className="text-black">♣</span>
        <span className="text-red-600">♥</span>
      </div>
    </div>
  );

  const BetButton = ({ label, odds, nation, className = "" }) => (
    <button
      type="button"
      disabled={isSuspended}
      onClick={() =>
        openBetSlip(nation, odds, "back", isMobile)
      }
      className={`flex min-h-[40px] flex-col items-center justify-center bg-gradient-to-r from-[#078bc5] to-[#29445a] px-1 py-1 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span className="text-[clamp(12px,1.5vw,20px)] font-bold">
        {label}
      </span>
    </button>
  );

  const MarketBox = ({ label, odds, nation, color }) => (
    <div className="flex min-w-0 flex-col items-center gap-1 bg-[#f1f1f1] p-1 sm:p-2">
      <span className="text-[clamp(12px,1.5vw,19px)] font-bold text-[#333]">
        {isSuspended ? "-" : odds}
      </span>
      <BetButton
        label={label}
        odds={odds}
        nation={nation}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="w-full overflow-hidden bg-white text-[#333]">

      {/* Low Card - Current Card - High Card */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-[#f3f3f3] px-1 py-2">
        <MarketBox
          label="Low Card"
          odds={getOdds("low", "2")}
          nation="Low Card"
        />

        <div className="flex flex-col items-center">
          <Card value="7" />
        </div>

        <MarketBox
          label="High Card"
          odds={getOdds("high", "2")}
          nation="High Card"
        />
      </div>

      {/* Even / Odd / Red / Black */}
      <div className="mt-2 grid grid-cols-2 gap-1 bg-[#f3f3f3] p-1 sm:gap-2 sm:p-2">
        <div className="grid grid-cols-2 gap-1">
          <MarketBox
            label="Even"
            odds={getOdds("even", "2.1")}
            nation="Even"
          />
          <MarketBox
            label="Odd"
            odds={getOdds("odd", "1.79")}
            nation="Odd"
          />
        </div>

        <div className="grid grid-cols-2 gap-1">
          <MarketBox
            label={<span className="text-red-500">♥ ♦</span>}
            odds={getOdds("red", "1.95")}
            nation="Red"
          />
          <MarketBox
            label={<span className="text-black">♠ ♣</span>}
            odds={getOdds("black", "1.95")}
            nation="Black"
          />
        </div>
      </div>

      {/* Card Groups */}
      <div className="mt-2 grid grid-cols-4 gap-1 sm:gap-2">
        {groups.map((group, index) => {
          const odds =
            markets?.groups?.[group.label]?.back || "4";

          return (
            <div
              key={group.label}
              className="flex min-w-0 flex-col items-center justify-center gap-1 bg-[#f1f1f1] px-1 py-2 sm:py-3"
            >
              <button
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(
                    `Group ${group.label}`,
                    odds,
                    "back",
                    isMobile
                  )
                }
                className="flex flex-col items-center gap-1 disabled:opacity-50"
              >
                <span className="text-[clamp(12px,1.5vw,18px)] font-bold">
                  {isSuspended ? "-" : odds}
                </span>

                <div className="flex items-center justify-center gap-[2px]">
                  {group.cards.map((card) => (
                    <Card key={card} value={card} compact />
                  ))}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* All 13 Cards */}
      <div className="mt-2 bg-[#f3f3f3] px-1 py-2 sm:py-3">
        <div className="mb-2 text-center text-[clamp(13px,1.5vw,19px)] font-bold">
          {isSuspended ? "-" : getOdds("cards", "12")}
        </div>

        <div className="grid grid-cols-13 gap-[2px] sm:gap-2">
          {cards.map((card) => {
            const odds =
              markets?.card?.[card]?.back ||
              markets?.cards?.[card]?.back ||
              "12";

            return (
              <button
                key={card}
                type="button"
                disabled={isSuspended}
                onClick={() =>
                  openBetSlip(
                    `Card ${card}`,
                    odds,
                    "back",
                    isMobile
                  )
                }
                className="flex min-w-0 justify-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Card value={card} compact />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Lucky 7 - B (lucky7eu)
// --------------------------------------------------------------------------

function TableLucky7eu({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const groups = [
    { label: "A-2-3", cards: ["A", "2", "3"] },
    { label: "4-5-6", cards: ["4", "5", "6"] },
    { label: "8-9-10", cards: ["8", "9", "10"] },
    { label: "J-Q-K", cards: ["J", "Q", "K"] },
  ];

  const getOdds = (key, fallback) =>
    markets?.[key]?.back || fallback;

  const placeBet = (nation, odds) => {
    if (!isSuspended) {
      openBetSlip(nation, odds, "back", isMobile);
    }
  };

  const Card = ({ value, small = false }) => (
    <div
      className={`flex shrink-0 flex-col justify-between border border-yellow-400 bg-white ${
        small
          ? "h-[45px] w-[32px] p-[2px] sm:h-[58px] sm:w-[43px] sm:p-[3px]"
          : "h-[55px] w-[37px] p-[2px] sm:h-[68px] sm:w-[46px] sm:p-[3px]"
      }`}
    >
      <span className="text-[20px] font-bold leading-none text-black sm:text-[27px]">
        {value}
      </span>

      <div className="flex justify-between text-[13px] font-bold leading-[12px] sm:text-[17px] sm:leading-[15px]">
        <span className="text-black">♠</span>
        <span className="text-red-600">♦</span>
      </div>

      <div className="flex justify-between text-[13px] font-bold leading-[12px] sm:text-[17px] sm:leading-[15px]">
        <span className="text-black">♣</span>
        <span className="text-red-600">♥</span>
      </div>
    </div>
  );

  const Market = ({ label, odds, nation, children }) => (
    <div className="flex min-w-0 flex-col items-center justify-center gap-1 bg-[#f1f1f1] p-1 sm:p-2">
      <span className="text-[12px] font-bold leading-tight text-[#333] sm:text-[16px]">
        {isSuspended ? "-" : odds}
      </span>

      <button
        type="button"
        disabled={isSuspended}
        onClick={() => placeBet(nation, odds)}
        className="flex min-h-[32px] w-full items-center justify-center bg-gradient-to-r from-[#078bc5] to-[#29445a] px-1 py-1 text-[12px] font-bold text-white shadow-sm disabled:opacity-50 sm:min-h-[43px] sm:text-[16px]"
      >
        {children || label}
      </button>
    </div>
  );

  return (
    <div className="w-full overflow-hidden bg-[#f5f5f5]">

      {/* LOW CARD / 7 / HIGH CARD */}
      <div className="grid grid-cols-[1fr_42px_1fr] items-center gap-1 px-1 py-2 sm:grid-cols-[1fr_55px_1fr] sm:gap-2">
        <Market
          label="Low Card"
          odds={getOdds("low", "2")}
          nation="Low Card"
        />

        <button
          type="button"
          disabled={isSuspended}
          onClick={() => placeBet("Exact 7", getOdds("seven", "12"))}
          className="flex justify-center disabled:opacity-50"
        >
          <Card value="7" />
        </button>

        <Market
          label="High Card"
          odds={getOdds("high", "2")}
          nation="High Card"
        />
      </div>

      {/* EVEN / ODD / RED / BLACK */}
      <div className="mt-1 grid grid-cols-2 gap-1">
        <div className="grid grid-cols-2 gap-1">
          <Market
            label="Even"
            odds={getOdds("even", "2.1")}
            nation="Even"
          />

          <Market
            label="Odd"
            odds={getOdds("odd", "1.79")}
            nation="Odd"
          />
        </div>

        <div className="grid grid-cols-2 gap-1">
          <Market
            odds={getOdds("red", "1.95")}
            nation="Red"
          >
            <span className="text-red-500">♥ ♦</span>
          </Market>

          <Market
            odds={getOdds("black", "1.95")}
            nation="Black"
          >
            <span className="text-black">♠ ♣</span>
          </Market>
        </div>
      </div>

      {/* FOUR CARD GROUPS */}
      <div className="mt-1 grid grid-cols-4 gap-1">
        {groups.map((group) => {
          const odds = "4";

          return (
            <button
              key={group.label}
              type="button"
              disabled={isSuspended}
              onClick={() =>
                placeBet(`Group ${group.label}`, odds)
              }
              className="flex min-w-0 flex-col items-center justify-center gap-1 bg-[#f1f1f1] py-2 disabled:opacity-50 sm:py-3"
            >
              <span className="text-[12px] font-bold sm:text-[16px]">
                {isSuspended ? "-" : odds}
              </span>

              <div className="flex items-center justify-center gap-[2px]">
                {group.cards.map((card) => (
                  <Card key={card} value={card} small />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* ALL 13 CARDS */}
      <div className="mt-1 bg-[#f1f1f1] px-1 py-2 sm:py-3">
        <div className="mb-1 text-center text-[12px] font-bold sm:text-[16px]">
          {isSuspended ? "-" : getOdds("cards", "12")}
        </div>

        <div
          className="grid w-full gap-[2px] sm:gap-2"
          style={{
            gridTemplateColumns: "repeat(13, minmax(0, 1fr))",
          }}
        >
          {cards.map((card) => {
            const odds = "12";

            return (
              <button
                key={card}
                type="button"
                disabled={isSuspended}
                onClick={() => placeBet(`Card ${card}`, odds)}
                className="flex min-w-0 justify-center disabled:opacity-50"
              >
                <Card value={card} small />
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: 3 Cards Judgement (3cardj)
// --------------------------------------------------------------------------

function Table3cardj({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const rows = [
    {
      label: "Yes",
      odds: markets?.yes?.back || "1.78",
      bg: "#72b9e8",
    },
    {
      label: "No",
      odds: markets?.no?.back || "1.84",
      bg: "#f5a5b8",
    },
  ];

  const renderCard = (value) => (
    <div className="flex aspect-[0.72] w-full flex-col justify-between border-2 border-yellow-400 bg-white p-[2px] sm:p-[3px]">
      <span className="text-[clamp(15px,2.2vw,29px)] font-bold leading-none text-black">
        {value}
      </span>

      <div className="grid grid-cols-2 text-[clamp(10px,1.5vw,19px)] font-bold leading-[0.9]">
        <span className="text-black">♠</span>
        <span className="text-center text-red-600">♦</span>
        <span className="text-black">♣</span>
        <span className="text-center text-red-600">♥</span>
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-hidden border border-[#c8c8c8] bg-white">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid min-h-[105px] grid-cols-[76px_minmax(0,1fr)] border-b-2 border-black last:border-b-0 sm:min-h-[126px] sm:grid-cols-[124px_minmax(0,1fr)]"
          style={{ backgroundColor: row.bg }}
        >
          {/* YES / NO */}
          <div className="flex items-center justify-center border-r-2 border-black">
            <span className="text-[14px] font-bold text-[#303030] sm:text-[18px]">
              {row.label}
            </span>
          </div>

          {/* ODDS + CARDS */}
          <div className="flex min-w-0 flex-col items-center justify-center gap-2 px-1 py-2 sm:gap-3 sm:px-3">
            <div className="text-[16px] font-bold leading-none text-[#333] sm:text-[22px]">
              {isSuspended ? "-" : row.odds}
            </div>

            <div className="grid w-full max-w-[780px] grid-cols-[repeat(13,minmax(0,1fr))] gap-[3px] sm:gap-[5px]">
              {cards.map((card) => (
                <button
                  key={`${row.label}-${card}`}
                  type="button"
                  disabled={isSuspended}
                  onClick={() =>
                    openBetSlip(
                      `${row.label} ${card}`,
                      row.odds,
                      "back",
                      isMobile
                    )
                  }
                  className="min-w-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {renderCard(card)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
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
  const [activeTab, setActiveTab] = React.useState('single');
  const [selectedNumbers, setSelectedNumbers] = React.useState([]);
  const [selectedAmount, setSelectedAmount] = React.useState(null);

  const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  const randomAmounts = {
    single: [],
    double: [5, 10, 15, 20, 25, 50, 75],
    triple: [5, 10, 15, 20, 25, 50, 100],
  };

  const toggleNumber = (card) => {
    if (isSuspended) return;

    setSelectedNumbers((prev) => {
      const exists = prev.includes(card);

      if (exists) {
        return prev.filter((item) => item !== card);
      }

      return [...prev, card];
    });

    openBetSlip(`Card ${card}`, '9.00', 'back', isMobile);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSelectedNumbers([]);
    setSelectedAmount(null);
  };

  const handleRandomBet = (amount) => {
    if (isSuspended) return;
    setSelectedAmount(amount);
  };

  const tabs = [
    { id: 'single', label: 'Single' },
    { id: 'double', label: 'Double' },
    { id: 'triple', label: 'Tripple' },
  ];

  const renderCard = (card) => {
    const selected = selectedNumbers.includes(card);

    return (
      <button
        key={card}
        type="button"
        disabled={isSuspended}
        onClick={() => toggleNumber(card)}
        className={`flex h-[76px] w-[54px] sm:h-[150px] sm:w-[108px] shrink-0 flex-col justify-between border-2 border-[#fff000] bg-[#f5f5f5] p-1 sm:p-2 transition-all ${
          selected ? 'ring-2 ring-blue-500' : ''
        } ${isSuspended ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <span className="w-full text-center text-[24px] sm:text-[58px] font-bold leading-none text-black">
          {card}
        </span>

        <div className="grid grid-cols-2 w-full">
          <div className="flex flex-col items-center text-black">
            <span className="text-[17px] sm:text-[35px] leading-none">♠</span>
            <span className="text-[17px] sm:text-[35px] leading-none">♣</span>
          </div>

          <div className="flex flex-col items-center text-red-600">
            <span className="text-[17px] sm:text-[35px] leading-none">♦</span>
            <span className="text-[17px] sm:text-[35px] leading-none">♥</span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full overflow-hidden bg-[#c6c8ca] p-2 sm:p-3">

      {/* Tabs */}
      <div className="flex items-center w-fit max-w-full mb-3">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => changeTab(tab.id)}
            className={`px-3 sm:px-7 py-2 sm:py-3 text-[14px] sm:text-[27px] font-medium border-r border-[#263746] transition-colors ${
              activeTab === tab.id
                ? 'bg-[#293d50] text-white'
                : 'bg-[#d0d0d0] text-black hover:bg-[#b8b8b8]'
            } ${index === 0 ? 'rounded-tl' : ''}`}
          >
            {tab.label} ({selectedNumbers.length})
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-x-2 gap-y-3 sm:gap-x-0 sm:gap-y-2 justify-items-center">
        {cards.map((card) => renderCard(card))}
      </div>

      {/* Random Bets */}
      {activeTab !== 'single' && (
        <div className="mx-auto mt-4 sm:mt-5 w-full sm:w-[75%] rounded-[22px] bg-[#5c6877] px-3 py-3 sm:px-6 sm:py-3">
          <h3 className="mb-2 text-center text-[17px] sm:text-[27px] font-semibold text-white">
            Random Bets
          </h3>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {randomAmounts[activeTab].map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={isSuspended}
                onClick={() => handleRandomBet(amount)}
                className={`flex h-[42px] min-w-[52px] sm:h-[78px] sm:min-w-[98px] items-center justify-center rounded-xl border border-[#008bd0] text-[17px] sm:text-[28px] font-semibold text-white transition-all ${
                  selectedAmount === amount
                    ? 'bg-[#174d73] ring-2 ring-blue-300'
                    : 'bg-[#3284b2] hover:bg-[#2475a3]'
                } ${isSuspended ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>
      )}
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
  const totals = [
    {
      label: 'Total 0',
      back: '0',
      lay: '0',
    },
    {
      label: 'Total 1',
      back: '0',
      lay: '0',
    },
    {
      label: 'Total 2',
      back: '2.44',
      lay: '2.56',
    },
    {
      label: 'Total 3',
      back: '1.65',
      lay: '1.69',
    },
  ];

  const renderOdds = (item, type) => {
    const odds = type === 'back' ? item.back : item.lay;

    return (
      <button
        type="button"
        disabled={isSuspended || Number(odds) <= 0}
        onClick={() =>
          openBetSlip(item.label, odds, type, isMobile)
        }
        className={`flex h-[60px] sm:h-[62px] w-full items-center justify-center text-[18px] sm:text-[22px] font-bold text-[#263746] transition-all ${
          type === 'back'
            ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
            : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
        } ${
          isSuspended || Number(odds) <= 0
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer'
        }`}
      >
        {isSuspended ? '-' : odds}
      </button>
    );
  };

  return (
    <div className="w-full bg-white">

      {/* Queen Bottom Place Bet Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-3">

        {totals.map((item) => (
          <div
            key={item.label}
            className="min-w-0 bg-[#f5f5f5]"
          >
            {/* Total Heading */}
            <div className="h-[32px] flex items-center justify-center text-[17px] sm:text-[20px] font-bold text-[#333]">
              {item.label}
            </div>

            {/* Back & Lay */}
            <div className="grid grid-cols-2 gap-1.5">

              {renderOdds(item, 'back')}

              {renderOdds(item, 'lay')}

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Race20 (race20)
// --------------------------------------------------------------------------
function TableRace20({ isMobile, isSuspended, openBetSlip }) {
  const kings = [
    {
      id: 'spade',
      name: 'Spade King',
      symbol: '♠',
      color: '#111111',
      oddsYes: '3.75',
      oddsNo: '1.25',
    },
    {
      id: 'heart',
      name: 'Heart King',
      symbol: '♥',
      color: '#e53935',
      oddsYes: '3.75',
      oddsNo: '1.25',
    },
    {
      id: 'club',
      name: 'Club King',
      symbol: '♣',
      color: '#111111',
      oddsYes: '3.75',
      oddsNo: '1.25',
    },
    {
      id: 'diamond',
      name: 'Diamond King',
      symbol: '♦',
      color: '#e53935',
      oddsYes: '3.75',
      oddsNo: '1.25',
    },
  ];

  const renderOdds = (king, type) => {
    const odds = type === 'back' ? king.oddsYes : king.oddsNo;

    return (
      <button
        key={type}
        type="button"
        disabled={isSuspended}
        onClick={() =>
          openBetSlip(
            `${king.name} ${type === 'back' ? 'YES' : 'NO'}`,
            odds,
            type,
            isMobile
          )
        }
        className={`flex h-[52px] sm:h-[58px] w-full items-center justify-center text-[17px] sm:text-[21px] font-bold text-[#263746] transition-colors ${
          type === 'back'
            ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
            : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
        } ${
          isSuspended
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer'
        }`}
      >
        {isSuspended ? '-' : odds}
      </button>
    );
  };

  return (
    <div className="w-full bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-3">

        {kings.map((king) => (
          <div key={king.id} className="min-w-0 bg-[#f5f5f5]">

            {/* King Name */}
            <div
              className="flex h-[30px] items-center justify-center gap-1 text-[15px] sm:text-[19px] font-bold text-[#333]"
            >
              <span style={{ color: king.color }}>
                {king.symbol}
              </span>
              {king.name}
            </div>

            {/* Back / Lay */}
            <div className="grid grid-cols-2 gap-1">
              {renderOdds(king, 'back')}
              {renderOdds(king, 'lay')}
            </div>

          </div>
        ))}

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
  const markets = [
    {
      id: 'race17',
      name: 'Race to 17',
      back: '1.45',
      lay: '1.49',
    },
    {
      id: 'bigCard',
      name: 'Big Card (7,8,9) - 4',
      back: '4.28',
      lay: '4.63',
    },
    {
      id: 'zeroCard',
      name: 'Zero Card - 4',
      back: '3.15',
      lay: '3.38',
    },
    {
      id: 'anyZero',
      name: 'Any Zero',
      back: null,
      lay: null,
      locked: true,
    },
  ];

  const renderOdds = (market, type) => {
    const odds = type === 'back' ? market.back : market.lay;
    const locked = isSuspended || market.locked;

    return (
      <button
        key={type}
        type="button"
        disabled={locked}
        onClick={() => {
          if (!locked && odds) {
            openBetSlip(market.name, odds, type, isMobile);
          }
        }}
        className={`flex h-[52px] sm:h-[58px] w-full items-center justify-center text-[17px] sm:text-[21px] font-bold text-[#263746] transition-colors ${
          type === 'back'
            ? 'bg-[#72b9e8] hover:bg-[#5da9dc]'
            : 'bg-[#f5a5b8] hover:bg-[#ed91a7]'
        } ${
          locked
            ? 'cursor-not-allowed bg-[#414c55] text-white opacity-100'
            : 'cursor-pointer'
        }`}
      >
        {locked ? (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-current"
            aria-hidden="true"
          >
            <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm3 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
          </svg>
        ) : (
          odds
        )}
      </button>
    );
  };

  return (
    <div className="w-full bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-3">

        {markets.map((market) => (
          <div key={market.id} className="min-w-0 bg-[#f5f5f5]">

            {/* Market Heading */}
            <div className="flex h-[30px] items-center justify-center whitespace-nowrap px-1 text-center text-[13px] sm:text-[17px] font-bold text-[#333]">
              {market.name}
            </div>

            {/* Back / Lay Odds */}
            <div className="grid grid-cols-2 gap-1">
              {renderOdds(market, 'back')}
              {renderOdds(market, 'lay')}
            </div>

          </div>
        ))}

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
  const players = [
    {
      id: 'A',
      name: 'Player A',
      back: null,
      lay: null,
      locked: true,
    },
    {
      id: 'B',
      name: 'Player B',
      back: '3.33',
      lay: '3.67',
    },
    {
      id: 'C',
      name: 'Player C',
      back: '1.62',
      lay: '1.67',
    },
    {
      id: 'D',
      name: 'Player D',
      back: '9.1',
      lay: '10.5',
    },
  ];

  const renderOdds = (player, type) => {
    const odds = type === 'back' ? player.back : player.lay;
    const locked = isSuspended || player.locked;

    return (
      <button
        key={type}
        type="button"
        disabled={locked}
        onClick={() => {
          if (!locked && odds) {
            openBetSlip(player.name, odds, type, isMobile);
          }
        }}
        className={`flex h-[52px] sm:h-[58px] w-full items-center justify-center text-[17px] sm:text-[21px] font-bold transition-colors ${
          type === 'back'
            ? 'bg-[#72b9e8] text-[#263746] hover:bg-[#5da9dc]'
            : 'bg-[#f5a5b8] text-[#263746] hover:bg-[#ed91a7]'
        } ${
          locked
            ? type === 'back'
              ? 'bg-[#414c55] text-white cursor-not-allowed'
              : 'bg-[#59494d] text-white cursor-not-allowed'
            : 'cursor-pointer'
        }`}
      >
        {locked ? (
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-current"
            aria-hidden="true"
          >
            <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm3 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
          </svg>
        ) : (
          odds
        )}
      </button>
    );
  };

  return (
    <div className="w-full bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-3">

        {players.map((player) => (
          <div key={player.id} className="min-w-0 bg-[#f5f5f5]">

            {/* Player Heading */}
            <div className="flex h-[30px] items-center justify-center text-[15px] sm:text-[19px] font-bold text-[#333]">
              {player.name}
            </div>

            {/* Back and Lay */}
            <div className="grid grid-cols-2 gap-1">
              {renderOdds(player, 'back')}
              {renderOdds(player, 'lay')}
            </div>

          </div>
        ))}

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


function TableCmeter1({ isMobile, isSuspended, openBetSlip, markets }) {
  // API response se markets extract karo
  const rawMarkets = Array.isArray(markets?.data?.sub)
    ? markets.data.sub
    : Array.isArray(markets?.sub)
      ? markets.sub
      : Array.isArray(markets)
        ? markets
        : markets && typeof markets === 'object'
          ? Object.values(markets).filter(
              (item) =>
                item &&
                typeof item === 'object' &&
                item.sid != null &&
                item.nat
            )
          : [];

  // Duplicate SID remove
  const uniqueMarkets = [
    ...new Map(
      rawMarkets
        .filter((market) => market?.sid != null)
        .map((market) => [String(market.sid), market])
    ).values(),
  ];

  const fighters = uniqueMarkets
    .filter((market) => ['1', '2'].includes(String(market.sid)))
    .sort((a, b) => Number(a.sid) - Number(b.sid));

  const BoxingGlove = ({ reverse = false }) => (
    <svg
      width="42"
      height="42"
      viewBox="0 0 48 48"
      fill="white"
      className={`shrink-0 ${reverse ? 'scale-x-[-1]' : ''}`}
    >
      <path d="M14 22V12a3.5 3.5 0 0 1 7 0v7-11a3.5 3.5 0 0 1 7 0v11-9a3.5 3.5 0 0 1 7 0v11-5a3.5 3.5 0 0 1 7 0v15c0 10-6 15-16 15h-5c-6 0-10-3-13-9l-5-10a4 4 0 0 1 7-4l4 6v-7Z" />
      <path d="M10 36h27v7H14a8 8 0 0 1-4-7Z" fill="white" opacity=".8" />
    </svg>
  );

  const placeBet = (market) => {
    const status = String(market.gstatus || '').toUpperCase();
    const suspended = status
      ? status !== 'OPEN'
      : Boolean(isSuspended);

    const odds = Number(market.b);

    if (
      suspended ||
      market.b === undefined ||
      market.b === null ||
      market.b === '' ||
      !Number.isFinite(odds) ||
      odds <= 0
    ) {
      return;
    }

    openBetSlip(
      market.nat,
      String(market.b),
      'back',
      isMobile
    );
  };

  return (
    <div className="w-full bg-[#f1f1f1] p-1">
      <div className="grid grid-cols-2 gap-1.5">
        {fighters.map((market, index) => {
          const status = String(market.gstatus || '').toUpperCase();

          const suspended = status
            ? status !== 'OPEN'
            : Boolean(isSuspended);

          const hasOdds =
            market.b !== undefined &&
            market.b !== null &&
            market.b !== '';

          const disabled =
            suspended || !hasOdds || Number(market.b) <= 0;

          return (
            <button
              key={market.sid}
              type="button"
              disabled={disabled}
              onClick={() => placeBet(market)}
              className={`relative flex min-h-[76px] items-center justify-center gap-2 border-[3px] px-2 py-3 text-[#263746] shadow-sm transition-colors ${
                index === 0
                  ? 'border-[#ff3b43]'
                  : 'border-[#ffdc00]'
              } ${
                suspended
                  ? 'cursor-not-allowed bg-[#414c55]'
                  : 'cursor-pointer bg-[#72b9e8] hover:bg-[#5da9dc]'
              }`}
            >
              {suspended && (
                <span className="absolute inset-0 z-10 flex items-center justify-center bg-[#414c55]/20">
                  <svg
                    width="27"
                    height="29"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M18 9h-1V7a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2ZM9 7a3 3 0 0 1 6 0v2H9V7Z" />
                  </svg>
                </span>
              )}

              {index === 0 && <BoxingGlove />}

              <span className="text-lg font-extrabold sm:text-2xl">
                {market.nat}
              </span>

              {index === 1 && <BoxingGlove reverse />}
            </button>
          );
        })}
      </div>

      {fighters.length === 0 && (
        <div className="py-4 text-center text-sm font-semibold text-gray-500">
          No markets available
        </div>
      )}
    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Premium Teenpatti 1Day (pteen)
// --------------------------------------------------------------------------

function TablePteen({ isMobile, isSuspended, openBetSlip, markets }) {
  const playerMarkets = [
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

  const headerText =
    'flex items-center justify-center text-[13px] font-bold text-[#263747]';

  const nationText =
    'flex min-w-0 items-center px-2 text-[13px] font-semibold text-[#333]';

  const backCell =
    'flex min-h-[36px] h-full items-stretch border-l border-white';

  const layCell =
    'flex min-h-[36px] h-full items-stretch border-l border-white';

  return (
    <div className="w-full min-w-0 bg-[#f5f5f5]">

      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-2">

        {/* PLAYER A / PLAYER B */}
        <div className="min-w-0 overflow-hidden border border-[#c7c8ca]">

          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_76px_76px] min-h-[34px] border-b border-[#c7c8ca] bg-[#f1f1f1]">

            <div className="flex items-center px-2 text-[13px] font-bold text-[#333]">
              Nation
            </div>

            <div className={`${headerText} border-l border-white bg-[#72bbef]`}>
              Back
            </div>

            <div className={`${headerText} border-l border-white bg-[#faa9ba]`}>
              Lay
            </div>
          </div>

          {/* Player Rows */}
          {playerMarkets.map((player, index) => (
            <div
              key={player.name}
              className={`grid grid-cols-[minmax(0,1fr)_76px_76px] min-h-[36px] border-b border-[#c7c8ca] last:border-b-0 ${
                index % 2 ? 'bg-[#f5f5f5]' : 'bg-[#f1f1f1]'
              }`}
            >
              <div className={nationText}>
                <span className="truncate">{player.name}</span>
              </div>

              <div className={backCell}>
                <OddsBox
                  nation={player.name}
                  odds={player.back}
                  type="back"
                  className="!m-0 !h-full !min-h-[36px] !w-full !rounded-none"
                />
              </div>

              <div className={layCell}>
                <OddsBox
                  nation={player.name}
                  odds={player.lay}
                  type="lay"
                  className="!m-0 !h-full !min-h-[36px] !w-full !rounded-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* SIDE BETS */}
        <div className="min-w-0 overflow-hidden border border-[#c7c8ca]">

          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_90px] min-h-[34px] border-b border-[#c7c8ca] bg-[#f1f1f1]">

            <div className="flex items-center px-2 text-[13px] font-bold text-[#333]">
              Side Bets
            </div>

            <div className={`${headerText} border-l border-white bg-[#72bbef]`}>
              Back
            </div>
          </div>

          {/* Side Bet Rows */}
          {sideMarkets.map((item, index) => (
            <div
              key={item.name}
              className={`grid grid-cols-[minmax(0,1fr)_90px] min-h-[36px] border-b border-[#c7c8ca] last:border-b-0 ${
                index % 2 ? 'bg-[#f5f5f5]' : 'bg-[#f1f1f1]'
              }`}
            >
              <div className={nationText}>
                <span className="truncate">{item.name}</span>
              </div>

              <div className={backCell}>
                <OddsBox
                  nation={item.name}
                  odds={item.odds}
                  type="back"
                  className="!m-0 !h-full !min-h-[36px] !w-full !rounded-none"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Premium Teenpatti 20-20 (pteen20)
// --------------------------------------------------------------------------

function TablePteen20({ isMobile, isSuspended, openBetSlip, markets }) {
  const playerMarkets = [
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

  const headerText =
    'flex min-h-[34px] items-center justify-center text-[13px] font-bold text-[#263747]';

  const nationText =
    'flex min-w-0 items-center px-2 text-[13px] font-semibold text-[#333]';

  const oddsClass =
    '!m-0 !flex !h-full !min-h-[36px] !w-full !items-center !justify-center !rounded-none !border-0 !text-[13px] !font-bold';

  return (
    <div className="w-full min-w-0 bg-[#f5f5f5]">

      <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-[1.5fr_1fr]">

        {/* MAIN PLAYER MARKETS */}
        <section className="min-w-0 overflow-hidden border border-[#c7c8ca]">

          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_76px_76px] border-b border-[#c7c8ca] bg-[#f1f1f1]">

            <div className="flex min-h-[34px] items-center px-2 text-[13px] font-bold text-[#333]">
              Nation
            </div>

            <div className={`${headerText} border-l border-white bg-[#72bbef]`}>
              Back
            </div>

            <div className={`${headerText} border-l border-white bg-[#faa9ba]`}>
              Lay
            </div>

          </div>

          {/* Player Rows */}
          {playerMarkets.map((player, index) => (
            <div
              key={player.name}
              className={`grid min-h-[36px] grid-cols-[minmax(0,1fr)_76px_76px] border-b border-[#c7c8ca] last:border-b-0 ${
                index % 2 === 0 ? 'bg-[#f1f1f1]' : 'bg-[#f7f7f7]'
              }`}
            >

              <div className={nationText}>
                <span className="truncate">{player.name}</span>
              </div>

              <div className="flex min-h-[36px] border-l border-white">
                <OddsBox
                  nation={player.name}
                  odds={player.back}
                  type="back"
                  className={oddsClass}
                />
              </div>

              <div className="flex min-h-[36px] border-l border-white">
                <OddsBox
                  nation={player.name}
                  odds={player.lay}
                  type="lay"
                  className={oddsClass}
                />
              </div>

            </div>
          ))}
        </section>

        {/* SIDE BETS */}
        <section className="min-w-0 overflow-hidden border border-[#c7c8ca]">

          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_90px] border-b border-[#c7c8ca] bg-[#f1f1f1]">

            <div className="flex min-h-[34px] items-center px-2 text-[13px] font-bold text-[#333]">
              Side Bets
            </div>

            <div className={`${headerText} border-l border-white bg-[#72bbef]`}>
              Back
            </div>

          </div>

          {/* Side Bet Rows */}
          {sideMarkets.map((item, index) => (
            <div
              key={item.name}
              className={`grid min-h-[36px] grid-cols-[minmax(0,1fr)_90px] border-b border-[#c7c8ca] last:border-b-0 ${
                index % 2 === 0 ? 'bg-[#f1f1f1]' : 'bg-[#f7f7f7]'
              }`}
            >

              <div className={nationText}>
                <span className="truncate">{item.name}</span>
              </div>

              <div className="flex min-h-[36px] border-l border-white">
                <OddsBox
                  nation={item.name}
                  odds={item.odds}
                  type="back"
                  className={oddsClass}
                />
              </div>

            </div>
          ))}
        </section>

      </div>
    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Premium Baccarat (pbaccarat)
// --------------------------------------------------------------------------
function TablePbaccarat({ isMobile, isSuspended, openBetSlip, markets }) {
  const mainMarkets = [
    {
      name: 'Player',
      odds: markets?.player?.back || '1.98',
      color: '#72bbef',
      textColor: '#172b3a',
    },
    {
      name: 'Tie',
      odds: markets?.tie?.back || '9.0',
      color: '#d6d6d6',
      textColor: '#222',
    },
    {
      name: 'Banker',
      odds: markets?.banker?.back || '1.95',
      color: '#faa9ba',
      textColor: '#54202b',
    },
  ];

  const pairMarkets = [
    { name: 'Player Pair', odds: '11.0' },
    { name: 'Banker Pair', odds: '11.0' },
  ];

  const handleBet = (nation, odds) => {
    if (isSuspended) return;
    openBetSlip(nation, odds, 'back', isMobile);
  };

  return (
    <div className="w-full overflow-hidden rounded-md border border-gray-300 bg-white p-2">
      {/* Main Baccarat Markets */}
      <div className="grid grid-cols-3 gap-1.5">
        {mainMarkets.map((market) => (
          <button
            key={market.name}
            type="button"
            disabled={isSuspended}
            onClick={() => handleBet(market.name, market.odds)}
            className={`relative flex h-[58px] flex-col items-center justify-center gap-0.5 rounded-sm px-1 text-center transition-colors ${
              isSuspended
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer active:brightness-95'
            }`}
            style={{
              backgroundColor: market.color,
              color: market.textColor,
            }}
          >
            <span className="text-xs font-bold leading-tight sm:text-sm">
              {market.name}
            </span>

            <span className="text-sm font-extrabold leading-tight sm:text-base">
              {isSuspended ? '-' : market.odds}
            </span>
          </button>
        ))}
      </div>

      {/* Pair Markets */}
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {pairMarkets.map((market) => (
          <button
            key={market.name}
            type="button"
            disabled={isSuspended}
            onClick={() => handleBet(market.name, market.odds)}
            className={`flex h-[48px] flex-col items-center justify-center gap-0.5 rounded-sm bg-[#d68910] px-2 text-center text-white transition-colors ${
              isSuspended
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer active:brightness-95'
            }`}
          >
            <span className="text-xs font-bold leading-tight sm:text-sm">
              {market.name}
            </span>

            <span className="text-sm font-extrabold leading-tight sm:text-base">
              {isSuspended ? '-' : market.odds}
            </span>
          </button>
        ))}
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
  const playerGroups = [
    [
      {
        nation: 'Player 8',
        label: 'Player 8 (8 pts)',
        back: markets?.player8?.back || '2.10',
        lay: markets?.player8?.lay || '2.20',
      },
      {
        nation: 'Player 9',
        label: 'Player 9 (9 pts)',
        back: markets?.player9?.back || '2.40',
        lay: markets?.player9?.lay || '2.50',
      },
    ],
    [
      {
        nation: 'Player 10',
        label: 'Player 10 (10 pts)',
        back: markets?.player10?.back || '2.90',
        lay: markets?.player10?.lay || '3.00',
      },
      {
        nation: 'Player 11',
        label: 'Player 11 (11 pts)',
        back: markets?.player11?.back || '3.50',
        lay: markets?.player11?.lay || '3.60',
      },
    ],
  ];

  return (
    <div className="w-full overflow-hidden rounded-md border border-gray-300 bg-white">
      <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2 md:gap-3">
        {playerGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="min-w-0">
            {/* Header */}
            <div className="mb-1 grid grid-cols-[minmax(0,1fr)_76px_76px] items-center gap-1 rounded-sm bg-[#4b5b6b] px-2 py-1.5 text-xs font-bold text-white sm:grid-cols-[minmax(0,1fr)_84px_84px]">
              <div>Nation</div>
              <div className="text-center">Back</div>
              <div className="text-center">Lay</div>
            </div>

            {/* Player Rows */}
            <div className="flex flex-col gap-1">
              {group.map((player) => (
                <div
                  key={player.nation}
                  className="grid h-[40px] grid-cols-[minmax(0,1fr)_76px_76px] items-center gap-1 sm:grid-cols-[minmax(0,1fr)_84px_84px]"
                >
                  <div className="flex h-full min-w-0 items-center rounded-sm bg-[#f2f2f2] px-2">
                    <span className="truncate text-xs font-semibold text-gray-800 sm:text-sm">
                      {player.label}
                    </span>
                  </div>

                  <OddsBox
                    nation={player.nation}
                    odds={player.back}
                    type="back"
                    className="!m-0 !h-full !min-h-[40px] !w-full !rounded-sm"
                  />

                  <OddsBox
                    nation={player.nation}
                    odds={player.lay}
                    type="lay"
                    className="!m-0 !h-full !min-h-[40px] !w-full !rounded-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Game: Premium Lucky 7 (plucky7)
// --------------------------------------------------------------------------
function TablePlucky7({ isMobile, isSuspended, openBetSlip, markets }) {
  const cards13 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];

  const mainMarkets = [
    { name: 'Low Card', key: 'low', odds: markets?.low?.back || '2' },
    { name: 'Exact 7', key: 'seven', odds: markets?.seven?.back || '12' },
    { name: 'High Card', key: 'high', odds: markets?.high?.back || '2' },
  ];

  const numberMarkets = [
    { name: 'Even', key: 'even', odds: markets?.even?.back || '2.10' },
    { name: 'Odd', key: 'odd', odds: markets?.odd?.back || '1.79' },
    { name: 'Red', key: 'red', odds: markets?.red?.back || '1.95' },
    { name: 'Black', key: 'black', odds: markets?.black?.back || '1.95' },
  ];

  const groups = [
    { label: 'A-2-3', odds: '4.00' },
    { label: '4-5-6', odds: '4.00' },
    { label: '8-9-10', odds: '4.00' },
    { label: 'J-Q-K', odds: '4.00' },
  ];

  const handleBet = (nation, odds) => {
    if (isSuspended) return;
    openBetSlip(nation, odds, 'back', isMobile);
  };

  const marketButton = (name, odds, className = '') => (
    <button
      key={name}
      type="button"
      disabled={isSuspended}
      onClick={() => handleBet(name, odds)}
      className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-sm px-1 transition-colors ${
        isSuspended
          ? 'cursor-not-allowed opacity-70'
          : 'cursor-pointer active:brightness-95'
      } ${className}`}
    >
      <span className="text-xs font-extrabold leading-tight sm:text-sm">
        {isSuspended ? '-' : odds}
      </span>
      <span className="text-xs font-semibold leading-tight">{name}</span>
    </button>
  );

  return (
    <div className="w-full overflow-hidden rounded-md border border-gray-300 bg-white p-2">
      {/* Low Card / Exact 7 / High Card */}
      <div className="grid grid-cols-3 gap-1.5">
        {mainMarkets.map((market, index) => (
          <div key={market.key} className="min-w-0">
            <button
              type="button"
              disabled={isSuspended}
              onClick={() => handleBet(market.name, market.odds)}
              className={`flex h-[58px] w-full flex-col items-center justify-center gap-1 rounded-sm px-1 text-white ${
                isSuspended
                  ? 'cursor-not-allowed opacity-70'
                  : 'cursor-pointer active:brightness-95'
              } ${
                index === 1
                  ? 'bg-[#d68910]'
                  : 'bg-[#273646]'
              }`}
            >
              <span className="text-sm font-extrabold">
                {isSuspended ? '-' : market.odds}
              </span>
              <span className="text-xs font-bold">{market.name}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Even / Odd / Red / Black */}
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        {numberMarkets.map((market) => (
          <div key={market.key} className="min-w-0">
            <button
              type="button"
              disabled={isSuspended}
              onClick={() => handleBet(market.name, market.odds)}
              className={`flex h-[46px] w-full flex-col items-center justify-center gap-0.5 rounded-sm ${
                isSuspended
                  ? 'cursor-not-allowed opacity-70'
                  : 'cursor-pointer active:brightness-95'
              } ${
                market.name === 'Red'
                  ? 'bg-[#d9534f] text-white'
                  : market.name === 'Black'
                    ? 'bg-[#252525] text-white'
                    : 'bg-[#72bbef] text-[#172b3a]'
              }`}
            >
              <span className="text-xs font-extrabold">
                {isSuspended ? '-' : market.odds}
              </span>
              <span className="text-xs font-bold">{market.name}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Card Groups */}
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {groups.map((group) => (
          <button
            key={group.label}
            type="button"
            disabled={isSuspended}
            onClick={() => handleBet(`Group ${group.label}`, group.odds)}
            className={`flex h-[48px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-sm bg-[#273646] px-1 text-white ${
              isSuspended
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer active:brightness-95'
            }`}
          >
            <span className="text-xs font-extrabold">
              {isSuspended ? '-' : group.odds}
            </span>
            <span className="text-[11px] font-bold sm:text-xs">
              {group.label}
            </span>
          </button>
        ))}
      </div>

      {/* Cards 1 to 13 */}
      <div className="mt-3">
        <div className="mb-2 rounded-sm bg-[#4b5b6b] px-2 py-2 text-center text-xs font-bold text-white sm:text-sm">
          Cards 1 to 13 (Payout 12.0)
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7 md:grid-cols-13">
          {cards13.map((card) => (
            <button
              key={card}
              type="button"
              disabled={isSuspended}
              onClick={() => handleBet(`Card ${card}`, '12')}
              className={`flex h-[48px] flex-col items-center justify-center gap-0.5 rounded-sm border border-gray-300 bg-[#f2f2f2] text-gray-900 ${
                isSuspended
                  ? 'cursor-not-allowed opacity-70'
                  : 'cursor-pointer active:bg-gray-200'
              }`}
            >
              <span className="text-xs font-extrabold text-gray-600">
                {isSuspended ? '-' : '12'}
              </span>
              <span className="text-sm font-extrabold">{card}</span>
            </button>
          ))}
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
  const topMarkets = [
    {
      name: "Session",
      back: "21",
      lay: "21",
      backVolume: "80",
      layVolume: "100",
      info: true,
    },
    {
      name: "3 Card Judgement (1 2 4)",
      back: "1.78",
      lay: "1.83",
    },
    {
      name: "3 Card Judgement (J Q K)",
      back: "1.78",
      lay: "1.83",
    },
  ];

  const middleMarkets = [
    { name: "Two Red Only", back: "2.52", lay: "2.72" },
    { name: "Two Black Only", back: "2.52", lay: "2.72" },
    { name: "Two Odd Only", back: "2.33", lay: "2.53" },
    { name: "Two Even Only", back: "2.75", lay: "2.95" },
  ];

  const sideMarkets = [
    { name: "Pair", odds: "5.5" },
    { name: "Flush", odds: "17" },
    { name: "Straight", odds: "24" },
    { name: "Trio", odds: "201" },
    { name: "Straight Flush", odds: "226" },
  ];

  const OddsCell = ({ nation, odds, type, volume }) => (
    <div className="min-w-0 flex-1">
      <OddsBox
        nation={nation}
        odds={odds}
        volume={volume}
        type={type}
        className="!flex !min-h-[63px] !w-full !flex-col !items-center !justify-center !rounded-none !border-0 !px-1 !py-1 !text-center"
      />
    </div>
  );

  const MarketGroup = ({ item }) => (
    <div className="min-w-0">
      {/* Market Title */}
      <div className="flex min-h-[33px] items-center justify-center gap-1 px-1 text-center text-sm font-bold text-[#333] sm:text-base">
        {item.name}

        {item.info && (
          <span
            title="Session information"
            className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-[#333] text-xs font-bold text-white"
          >
            i
          </span>
        )}
      </div>

      {/* Back / Lay */}
      <div className="flex gap-1">
        <OddsCell
          nation={item.name}
          odds={item.back}
          type="back"
          volume={item.backVolume}
        />

        <OddsCell
          nation={item.name}
          odds={item.lay}
          type="lay"
          volume={item.layVolume}
        />
      </div>
    </div>
  );

  return (
    <div className="trio w-full min-w-0 bg-[#f6f6f6] p-1">

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-1.5">
        {topMarkets.map((item) => (
          <MarketGroup key={item.name} item={item} />
        ))}
      </div>

      {/* MIDDLE SECTION */}
      <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-1.5">
        {middleMarkets.map((item) => (
          <MarketGroup key={item.name} item={item} />
        ))}
      </div>

      {/* BOTTOM SECTION - HAND COMBINATIONS */}
      <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-1.5">
        {sideMarkets.map((item) => (
          <div key={item.name} className="min-w-0">

            <div className="flex min-h-[33px] items-center justify-center px-1 text-center text-sm font-bold text-[#333] sm:text-base">
              {item.name}
            </div>

            <OddsCell
              nation={item.name}
              odds={item.odds}
              type="back"
            />

          </div>
        ))}
      </div>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Virtual 20-20 DTL (vdtl20)
// --------------------------------------------------------------------------

function TableVdtl20({ isMobile, isSuspended, openBetSlip, markets }) {
  const marketList = (() => {
    if (Array.isArray(markets)) return markets;
    if (Array.isArray(markets?.markets)) return markets.markets;
    if (Array.isArray(markets?.data)) return markets.data;

    return Object.values(markets || {}).flatMap((value) =>
      Array.isArray(value)
        ? value
        : Array.isArray(value?.markets)
          ? value.markets
          : Array.isArray(value?.data)
            ? value.data
            : value?.name
              ? [value]
              : []
    );
  })();

  const players = [
    { name: "Dragon", suffix: "D" },
    { name: "Tiger", suffix: "T" },
    { name: "Lion", suffix: "L" },
  ];

  const commonRows = [
    { label: "Winner", market: "Winner" },
    { label: "Black", market: "Black", suit: "black" },
    { label: "Red", market: "Red", suit: "red" },
    { label: "Odd", market: "Odd" },
    { label: "Even", market: "Even" },
  ];

  const leftCards = ["A", "2", "3", "4"];
  const rightCards = ["5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const getMarket = (name) =>
    marketList.find(
      (item) =>
        item?.name?.trim().toLowerCase() === name.toLowerCase()
    );

  const CardLabel = ({ value }) => (
    <div className="flex h-[42px] w-[30px] shrink-0 flex-col items-center justify-center border border-[#d9e0e8] bg-white shadow-sm">
      <span className="text-[18px] font-bold leading-5 text-black">
        {value}
      </span>
      <span className="text-[12px] leading-[11px]">
        <span className="text-black">♠</span>
        <span className="text-red-600">♦</span>
      </span>
    </div>
  );

  const RowLabel = ({ row }) => (
    <div className="flex min-h-[51px] min-w-0 items-center gap-1.5 border-b border-r border-[#c9c9c9] bg-[#f1efef] px-2">
      {row.card ? (
        <CardLabel value={row.card} />
      ) : (
        <>
          <span className="text-sm font-bold text-[#333] sm:text-base">
            {row.label}
          </span>

          {row.suit === "black" && (
            <span className="text-[21px] leading-none text-black">
              ♠ ♣
            </span>
          )}

          {row.suit === "red" && (
            <span className="text-[21px] leading-none text-red-600">
              ♥ ♦
            </span>
          )}
        </>
      )}
    </div>
  );

  const OddsCell = ({ marketName }) => {
    const market = getMarket(marketName);

    // Hidden market
    if (market?.visible === false) {
      return (
        <div className="min-h-[51px] border-b border-r border-[#c9c9c9] bg-[#f1efef]" />
      );
    }

    // Closed market
    if (market && market.status !== "OPEN") {
      return (
        <div className="flex min-h-[51px] items-center justify-center border-b border-r border-[#c9c9c9] bg-[#414d57] text-white">
          -
        </div>
      );
    }

    // Open market or temporarily missing market data
    return (
      <div className="min-w-0 border-b border-r border-[#c9c9c9] bg-[#72b9e8]">
        {market ? (
          <OddsBox
            nation={market.name}
            odds={market.back ?? "-"}
            type="back"
            className="!flex !min-h-[51px] !w-full !items-center !justify-center !rounded-none !border-0 !bg-[#72b9e8] !px-1 !text-base !font-bold !text-[#263747]"
          />
        ) : (
          <div className="flex min-h-[51px] items-center justify-center text-base font-bold text-[#263747]">
            -
          </div>
        )}
      </div>
    );
  };

  const MarketRow = ({ row }) => (
    <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,0.9fr))]">
      <RowLabel row={row} />

      {players.map((player) => {
        const marketName = row.card
          ? `${player.name} ${row.card}`
          : `${row.market} ${player.suffix}`;

        return (
          <OddsCell key={marketName} marketName={marketName} />
        );
      })}
    </div>
  );

  const TableHeader = () => (
    <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,0.9fr))]">
      <div className="min-h-[50px] border-b border-r border-[#c9c9c9] bg-[#f1efef]" />

      {players.map((player) => (
        <div
          key={player.name}
          className="flex min-h-[50px] items-center justify-center border-b border-r border-[#c9c9c9] bg-[#72b9e8] text-sm font-bold text-[#263747] sm:text-lg"
        >
          {player.name}
        </div>
      ))}
    </div>
  );

  const leftRows = [
    ...commonRows,
    ...leftCards.map((card) => ({ card })),
  ];

  const rightRows = rightCards.map((card) => ({ card }));

  return (
    <div className="casino-table dtl20 w-full min-w-0 overflow-hidden bg-white">

      <div className="grid grid-cols-2 gap-[6px]">

        {/* LEFT TABLE */}
        <div className="min-w-0">
          <TableHeader />

          {leftRows.map((row) => (
            <MarketRow
              key={row.market || row.card}
              row={row}
            />
          ))}
        </div>

        {/* RIGHT TABLE */}
        <div className="min-w-0">
          <TableHeader />

          {rightRows.map((row) => (
            <MarketRow key={row.card} row={row} />
          ))}
        </div>

      </div>

      {/* LAST RESULT */}
      <div className="flex min-h-[50px] items-center justify-between bg-[#293e50] px-2 text-white">
        <span className="text-lg font-bold">
          Last Result
        </span>

        <button
          type="button"
          className="text-base font-bold text-blue-500"
        >
          View All
        </button>
      </div>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Virtual Muflis Teenpatti (vteenmuf)
// --------------------------------------------------------------------------

function TableVteenmuf({
  isMobile,
  isSuspended,
  openBetSlip,
  markets
}) {
  return (
    <div className="casino-table vteenmuf">
      <div className="grid grid-cols-2 gap-1.5 w-full">

        {/* PLAYER A */}
        <div className="min-w-0 border border-gray-300 bg-[#f1f1f1]">
          <div className="border-b border-gray-300 px-2 py-1.5 text-lg font-bold text-[#333]">
            Player A
          </div>

          <div className="grid grid-cols-3">
            <div className="flex min-h-[63px] items-center justify-center border-b border-r border-gray-300 px-1 text-center text-[17px] font-bold text-[#333]">
              Winner
            </div>

            <div className="flex min-h-[63px] items-center justify-center border-b border-r border-gray-300 px-1 text-center text-[17px] font-bold text-[#333]">
              Top 9
            </div>

            <div className="flex min-h-[63px] items-center justify-center border-b border-gray-300 px-1 text-center text-[17px] font-bold text-[#333]">
              M Baccarat A
            </div>

            <div className="min-w-0 min-h-16 border-r border-gray-300 bg-[#72b9e8]">
              <OddsBox
                nation="Player A Winner"
                odds={markets?.playerA?.back || "1.98"}
                type="back"
              />
            </div>

            <div className="min-w-0 min-h-16 border-r border-gray-300 bg-[#72b9e8]">
              <OddsBox
                nation="Player A Top 9"
                odds={markets?.top9A?.back || "A"}
                type="back"
              />
            </div>

            <div className="min-w-0 min-h-16 bg-[#72b9e8]">
              <OddsBox
                nation="M Baccarat A"
                odds={markets?.baccaratA?.back || "1.98"}
                type="back"
              />
            </div>
          </div>
        </div>

        {/* PLAYER B */}
        <div className="min-w-0 border border-gray-300 bg-[#f1f1f1]">
          <div className="border-b border-gray-300 px-2 py-1.5 text-lg font-bold text-[#333]">
            Player B
          </div>

          <div className="grid grid-cols-3">
            <div className="flex min-h-[63px] items-center justify-center border-b border-r border-gray-300 px-1 text-center text-[17px] font-bold text-[#333]">
              Winner
            </div>

            <div className="flex min-h-[63px] items-center justify-center border-b border-r border-gray-300 px-1 text-center text-[17px] font-bold text-[#333]">
              Top 9
            </div>

            <div className="flex min-h-[63px] items-center justify-center border-b border-gray-300 px-1 text-center text-[17px] font-bold text-[#333]">
              M Baccarat B
            </div>

            <div className="min-w-0 min-h-16 border-r border-gray-300 bg-[#72b9e8]">
              <OddsBox
                nation="Player B Winner"
                odds={markets?.playerB?.back || "1.98"}
                type="back"
              />
            </div>

            <div className="min-w-0 min-h-16 border-r border-gray-300 bg-[#72b9e8]">
              <OddsBox
                nation="Player B Top 9"
                odds={markets?.top9B?.back || "B"}
                type="back"
              />
            </div>

            <div className="min-w-0 min-h-16 bg-[#72b9e8]">
              <OddsBox
                nation="M Baccarat B"
                odds={markets?.baccaratB?.back || "1.98"}
                type="back"
              />
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
  const cards13 = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

  const players = [
    {
      name: "A. Amar",
      key: "amar",
      back: "2.95",
      lay: "3.05",
    },
    {
      name: "B. Akbar",
      key: "akbar",
      back: "2.95",
      lay: "3.05",
    },
    {
      name: "C. Anthony",
      key: "anthony",
      back: "2.95",
      lay: "3.05",
    },
  ];

  const panels = [
    [
      { name: "Even", odds: markets?.even?.back || "2.10" },
      { name: "Odd", odds: markets?.odd?.back || "1.79" },
    ],
    [
      { name: "♥ ♦", odds: markets?.red?.back || "1.95", color: "text-red-500" },
      { name: "♠ ♣", odds: markets?.black?.back || "1.95", color: "text-black" },
    ],
    [
      { name: "Under 7", odds: markets?.under7?.back || "2" },
      { name: "Over 7", odds: markets?.over7?.back || "2" },
    ],
  ];

  const placeBet = (name, odds) => {
    if (!isSuspended) {
      openBetSlip(name, odds, "back", isMobile);
    }
  };

  return (
    <div className="w-full min-w-0 bg-[#f5f5f5] p-1">

      {/* TOP: THREE PLAYERS */}
      <div className="grid grid-cols-3 gap-2">

        {players.map((player) => (
          <div key={player.key} className="min-w-0">

            <div className="flex h-[35px] items-center justify-center text-center text-lg font-bold text-[#333]">
              {player.name}
            </div>

            <div className="grid grid-cols-2 gap-2">

              <OddsBox
                nation={player.name}
                odds={markets?.[player.key]?.back || player.back}
                type="back"
                className="!flex !h-[63px] !min-h-[63px] !w-full !items-center !justify-center !rounded-none !border-0 !text-lg !font-bold"
              />

              <OddsBox
                nation={player.name}
                odds={markets?.[player.key]?.lay || player.lay}
                type="lay"
                className="!flex !h-[63px] !min-h-[63px] !w-full !items-center !justify-center !rounded-none !border-0 !text-lg !font-bold"
              />

            </div>
          </div>
        ))}

      </div>

      {/* MIDDLE: THREE BETTING PANELS */}
      <div className="mt-4 grid grid-cols-3 gap-1.5">

        {panels.map((panel, index) => (
          <div
            key={index}
            className="min-w-0 border border-[#c9c9c9] bg-[#f1f1f1] p-1.5 sm:p-2"
          >

            <div className="flex flex-col gap-6">

              {panel.map((item) => (
                <div key={item.name} className="min-w-0">

                  {/* Odds */}
                  <div className="flex h-[29px] items-center justify-center text-lg font-bold text-[#333]">
                    {isSuspended ? "-" : item.odds}
                  </div>

                  {/* Gradient Bet Button */}
                  <button
                    type="button"
                    disabled={isSuspended}
                    onClick={() => placeBet(item.name, item.odds)}
                    className={`
                      flex h-[63px] w-full items-center justify-center
                      border border-[#31536c]
                      bg-gradient-to-r from-[#008dcc] to-[#293e50]
                      px-1 text-sm font-bold text-white
                      shadow-md sm:text-lg
                      ${
                        isSuspended
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:brightness-110 active:scale-[0.99]"
                      }
                    `}
                  >
                    <span className={item.color || ""}>
                      {isSuspended ? "-" : item.name}
                    </span>
                  </button>

                </div>
              ))}

            </div>

          </div>
        ))}

      </div>

      {/* BOTTOM: 13 CARDS */}
      <div className="mt-5 w-full bg-[#f1efef] px-2 py-3">

        <div className="mb-3 text-center text-[27px] font-bold text-[#333]">
          12
        </div>

        {/* All cards stay in one horizontal row */}
        <div className="mx-auto grid w-full max-w-[900px] grid-cols-[repeat(13,minmax(0,1fr))] gap-1.5">

          {cards13.map((card) => (
            <button
              key={card}
              type="button"
              disabled={isSuspended}
              onClick={() => placeBet(`Card ${card}`, "12")}
              className={`
                flex h-[88px] min-w-0 flex-col
                items-center justify-center
                border-2 border-[#f5d943]
                bg-white text-[#777]
                shadow-sm transition-all
                ${
                  isSuspended
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-yellow-50 active:scale-95"
                }
              `}
            >

              <span className="text-[clamp(16px,2.5vw,35px)] font-bold leading-[1.05]">
                {card}
              </span>

              <div className="grid grid-cols-2 gap-x-0.5 text-[clamp(10px,1.4vw,19px)] leading-[1.05]">
                <span className="text-[#777]">♠</span>
                <span className="text-[#ef8585]">♦</span>
                <span className="text-[#777]">♣</span>
                <span className="text-[#ef8585]">♥</span>
              </div>

            </button>
          ))}

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
    { key: "A", name: "Don" },
    { key: "B", name: "Amar" },
    { key: "C", name: "Anthony" },
    { key: "D", name: "Vijay" },
    { key: "E", name: "Shehenshah" },
    { key: "F", name: "Gabbar" },
  ];

  const placeBet = (name, odds, type = "back") => {
    if (!isSuspended) {
      openBetSlip(name, odds, type, isMobile);
    }
  };

  const gradientButton =
    "flex min-h-[49px] w-full items-center justify-center border border-[#31536c] bg-gradient-to-r from-[#008dcc] to-[#293e50] px-2 text-center text-sm font-bold text-white shadow-md sm:text-base";

  return (
    <div className="w-full min-w-0 bg-[#f5f5f5] p-1">

      {/* TOP: SIX PLAYERS */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-4">

        {chars.map((char) => (
          <div key={char.key} className="min-w-0">

            <div className="flex min-h-[30px] items-center justify-center px-1 text-center text-sm font-bold text-[#333] sm:text-base">
              {char.key}. {char.name}
            </div>

            <div className="grid grid-cols-2 gap-1">

              <OddsBox
                nation={`${char.key}. ${char.name}`}
                odds={markets?.[char.key.toLowerCase()]?.back || "5.5"}
                type="back"
                className="!flex !min-h-[49px] !w-full !items-center !justify-center !rounded-none !border-0 !text-base !font-bold"
              />

              <OddsBox
                nation={`${char.key}. ${char.name}`}
                odds={markets?.[char.key.toLowerCase()]?.lay || "6.0"}
                type="lay"
                className="!flex !min-h-[49px] !w-full !items-center !justify-center !rounded-none !border-0 !text-base !font-bold"
              />

            </div>
          </div>
        ))}

      </div>

      {/* MIDDLE SECTION */}
      <div className="mt-5 grid grid-cols-12 gap-1.5">

        {/* ODD BACK / LAY */}
        <div className="col-span-3 min-w-0 border border-[#ccc] bg-[#f1f1f1] p-1">
          <div className="mb-1 text-center text-sm font-bold text-[#333]">
            Odd
          </div>

          <div className="grid grid-cols-2 gap-1">
            <OddsBox
              nation="Odd"
              odds={markets?.odd?.back || "1.32"}
              type="back"
              className="!flex !min-h-[49px] !w-full !items-center !justify-center !rounded-none !border-0 !text-base !font-bold"
            />

            <OddsBox
              nation="Odd"
              odds={markets?.odd?.lay || "1.36"}
              type="lay"
              className="!flex !min-h-[49px] !w-full !items-center !justify-center !rounded-none !border-0 !text-base !font-bold"
            />
          </div>
        </div>

        {/* DULHA DULHAN */}
        <div className="col-span-4 min-w-0 border border-[#ccc] bg-[#f1f1f1] p-1">
          <div className="mb-1 text-center text-base font-bold text-[#333]">
            {isSuspended ? "-" : "1.97"}
          </div>

          <button
            type="button"
            disabled={isSuspended}
            onClick={() => placeBet("Dulha Dulhan K-Q", "1.97")}
            className={`${gradientButton} ${isSuspended ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            Dulha Dulhan K-Q
          </button>
        </div>

        {/* BARATI */}
        <div className="col-span-5 min-w-0 border border-[#ccc] bg-[#f1f1f1] p-1">
          <div className="mb-1 text-center text-base font-bold text-[#333]">
            {isSuspended ? "-" : "1.97"}
          </div>

          <button
            type="button"
            disabled={isSuspended}
            onClick={() => placeBet("Barati J-A", "1.97")}
            className={`${gradientButton} ${isSuspended ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            Barati J-A
          </button>
        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">

        {/* RED / BLACK */}
        <div className="grid grid-cols-2 gap-1.5 border border-[#ccc] bg-[#f1f1f1] p-1.5">

          <div className="min-w-0">
            <div className="mb-1 text-center text-base font-bold text-[#333]">
              {isSuspended ? "-" : "1.97"}
            </div>

            <button
              type="button"
              disabled={isSuspended}
              onClick={() => placeBet("Red ♥ ♦", "1.97")}
              className={`${gradientButton} ${isSuspended ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span className="text-xl text-red-500">♥ ♦</span>
            </button>
          </div>

          <div className="min-w-0">
            <div className="mb-1 text-center text-base font-bold text-[#333]">
              {isSuspended ? "-" : "1.97"}
            </div>

            <button
              type="button"
              disabled={isSuspended}
              onClick={() => placeBet("Black ♠ ♣", "1.97")}
              className={`${gradientButton} ${isSuspended ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span className="text-xl text-black">♠ ♣</span>
            </button>
          </div>

        </div>

        {/* CARD MARKET */}
        <div className="min-w-0 border border-[#ccc] bg-[#f1f1f1] p-2">

          <div className="mb-2 text-center text-lg font-bold text-[#333]">
            {isSuspended ? "-" : "3.75"}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1">

            {["J", "Q", "K", "A"].map((card) => (
              <button
                key={card}
                type="button"
                disabled={isSuspended}
                onClick={() => placeBet(`Card ${card}`, "3.75")}
                className={`
                  flex h-[68px] w-[44px] flex-col
                  items-center justify-center
                  border-2 border-yellow-400 bg-white
                  text-[#333] shadow-sm
                  ${
                    isSuspended
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-yellow-50"
                  }
                `}
              >
                <span className="text-[27px] font-bold leading-7">
                  {card}
                </span>

                <span className="text-[13px] leading-[13px]">
                  <span className="text-black">♠</span>
                  <span className="text-red-600">♦</span>
                </span>

                <span className="text-[13px] leading-[13px]">
                  <span className="text-black">♣</span>
                  <span className="text-red-600">♥</span>
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
// Game: Virtual 1 Day Dragon Tiger (vdt6)
// --------------------------------------------------------------------------

function TableVdt6({ isMobile, isSuspended, openBetSlip, markets }) {
  const blue = "bg-[#72b9e8]";
  const pink = "bg-[#f5a6ba]";
  const labelStyle =
    "flex min-h-[58px] items-center border border-[#c9c9c9] bg-[#f1f1f1] px-2 text-sm font-bold text-[#333] sm:text-lg";

  const market = (key, fallback) => ({
    ...(markets?.[key] || {}),
    back: markets?.[key]?.back ?? fallback,
  });

  const dragon = markets?.dragon || {};
  const tiger = markets?.tiger || {};

  const getMarket = (key, fallback) => markets?.[key] || {
    back: fallback,
  };

  const LockedIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 fill-white"
      aria-hidden="true"
    >
      <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Zm4 10.73V19h-2v-2.27a2 2 0 1 1 2 0Z" />
    </svg>
  );

  const OddsCell = ({
    nation,
    odds,
    type = "back",
    marketData,
  }) => {
    const locked =
      isSuspended ||
      (marketData?.status != null && marketData.status !== "OPEN") ||
      marketData?.visible === false;

    const isLay = type === "lay";

    return (
      <button
        type="button"
        disabled={locked}
        onClick={() => {
          if (!locked) {
            openBetSlip(nation, odds, type, isMobile);
          }
        }}
        className={`
          relative flex min-h-[58px] w-full min-w-0
          items-center justify-center border border-[#c9c9c9]
          text-base font-bold text-[#263747] sm:text-lg
          ${locked
            ? isLay
              ? "bg-[#57484d]"
              : "bg-[#414d57]"
            : isLay
              ? pink
              : blue
          }
          ${locked ? "cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {locked ? (
          <span className="flex flex-col items-center justify-center">
            <LockedIcon />
            <span className="text-sm leading-none text-[#333]">0</span>
          </span>
        ) : (
          odds
        )}
      </button>
    );
  };

  const TableHeading = ({ children, className = "" }) => (
    <div
      className={`flex min-h-[55px] items-center justify-center border border-[#c9c9c9] bg-[#f1f1f1] px-1 text-center text-sm font-bold text-[#333] sm:text-lg ${className}`}
    >
      {children}
    </div>
  );

  // Dragon / Tiger table
  const MainTable = () => (
    <div className="grid grid-cols-[minmax(0,1fr)_repeat(2,minmax(65px,0.33fr))]">
      <TableHeading />
      <TableHeading className={blue}>Back</TableHeading>
      <TableHeading className={pink}>Lay</TableHeading>

      {["Dragon", "Tiger"].map((name) => {
        const data = name === "Dragon" ? dragon : tiger;

        return (
          <React.Fragment key={name}>
            <div className={labelStyle}>{name}</div>

            <OddsCell
              nation={name}
              odds={data?.back ?? (name === "Dragon" ? "1.58" : "1.58")}
              type="back"
              marketData={data}
            />

            <OddsCell
              nation={name}
              odds={data?.lay ?? (name === "Dragon" ? "1.61" : "1.61")}
              type="lay"
              marketData={data}
            />
          </React.Fragment>
        );
      })}
    </div>
  );

  // Pair market
  const PairMarket = () => {
    const pair = getMarket("pair", "12");

    return (
      <div className="flex flex-col border border-[#c9c9c9] bg-[#f1f1f1] p-2">
        <div className="flex min-h-[50px] items-center justify-center text-lg font-bold text-[#333]">
          {isSuspended ? "-" : pair.back}
        </div>

        <button
          type="button"
          disabled={isSuspended || pair.status && pair.status !== "OPEN"}
          onClick={() => openBetSlip("Pair", pair.back, "back", isMobile)}
          className="flex min-h-[86px] w-full items-center justify-center border border-[#31536c] bg-gradient-to-r from-[#008dcc] to-[#293e50] text-xl font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          Pair
        </button>
      </div>
    );
  };

  // Dragon / Tiger Even-Odd and Red-Black tables
  const TwoMarketTable = ({
    headings,
    rows,
    getData,
  }) => (
    <div className="grid grid-cols-[minmax(0,1fr)_repeat(2,minmax(65px,0.33fr))]">
      <TableHeading />

      {headings.map((heading) => (
        <TableHeading key={heading.key} className={blue}>
          {heading.label}
        </TableHeading>
      ))}

      {rows.map((row) => (
        <React.Fragment key={row}>
          <div className={labelStyle}>{row}</div>

          {headings.map((heading) => {
            const item = getData(row, heading.key);

            return (
              <OddsCell
                key={heading.key}
                nation={`${row} ${heading.label}`}
                odds={item.back}
                marketData={item}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );

  const bottomSuits = [
    { key: "spade", label: "♠", color: "text-black" },
    { key: "heart", label: "♥", color: "text-red-600" },
    { key: "club", label: "♣", color: "text-black" },
    { key: "diamond", label: "♦", color: "text-red-600" },
  ];

  return (
    <div className="w-full min-w-0 space-y-3 bg-[#f5f5f5] p-1">

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-2">

        <MainTable />

        <PairMarket />

      </div>

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-2">

        {/* EVEN / ODD */}
        <TwoMarketTable
          headings={[
            { key: "even", label: "Even" },
            { key: "odd", label: "Odd" },
          ]}
          rows={["Dragon", "Tiger"]}
          getData={(row, key) =>
            getMarket(
              `${row.toLowerCase()}${key.charAt(0).toUpperCase()}${key.slice(1)}`,
              row === "Tiger"
                ? key === "even" ? "2.07" : "1.83"
                : "2.07"
            )
          }
        />

        {/* RED / BLACK */}
        <TwoMarketTable
          headings={[
            { key: "red", label: <>Red <span className="text-red-600">♥ ♦</span></> },
            { key: "black", label: <>Black <span className="text-black">♠ ♣</span></> },
          ]}
          rows={["Dragon", "Tiger"]}
          getData={(row, key) =>
            getMarket(
              `${row.toLowerCase()}${key.charAt(0).toUpperCase()}${key.slice(1)}`,
              row === "Tiger"
                ? key === "red" ? "2" : "1.93"
                : "2"
            )
          }
        />

      </div>

      {/* BOTTOM SUIT TABLE */}
      <div className="grid grid-cols-[minmax(0,0.8fr)_repeat(4,minmax(0,1fr))]">

        <TableHeading />

        {bottomSuits.map((suit) => (
          <TableHeading key={suit.key} className="text-2xl">
            <span className={suit.color}>{suit.label}</span>
          </TableHeading>
        ))}

        {["Dragon", "Tiger"].map((row) => (
          <React.Fragment key={row}>
            <div className={labelStyle}>{row}</div>

            {bottomSuits.map((suit) => {
              const key = `${row.toLowerCase()}${suit.key.charAt(0).toUpperCase()}${suit.key.slice(1)}`;

              const item = getMarket(
                key,
                "3.72"
              );

              return (
                <OddsCell
                  key={key}
                  nation={`${row} ${suit.key}`}
                  odds={item.back}
                  marketData={item}
                />
              );
            })}
          </React.Fragment>
        ))}

      </div>

    </div>
  );
}


// --------------------------------------------------------------------------
// Game: Virtual 1 Day Teenpatti (vteen)
// --------------------------------------------------------------------------

function TableVteen({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    {
      name: "Player A",
      key: "playerA",
    },
    {
      name: "Player B",
      key: "playerB",
    },
  ];

  const cards = [1, 2, 3, 4, 5, 6];

  const renderLockedCard = () => (
    <div className="flex min-h-[55px] items-center justify-center border-r border-gray-300 bg-[#414d57]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5 text-white"
      >
        <path
          fillRule="evenodd"
          d="M7.5 8.25V6a4.5 4.5 0 119 0v2.25h.75A2.25 2.25 0 0119.5 10.5v9a2.25 2.25 0 01-2.25 2.25h-10.5A2.25 2.25 0 014.5 19.5v-9A2.25 2.25 0 016.75 8.25h.75zM9 6a3 3 0 116 0v2.25H9V6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  return (
    <div className="casino-table vteen">
      <div className="flex flex-col gap-2">

        {/* PLAYER A & PLAYER B MARKETS */}
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">

          {players.map((player) => (
            <div
              key={player.key}
              className="min-w-0 border border-gray-300 bg-[#f1f1f1]"
            >
              {/* Header */}
              <div className="grid grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,124px))]">
                <div className="flex items-center border-r border-gray-300 px-2 py-1.5 text-base font-bold text-[#333]">
                  {player.name}
                </div>

                <div className="flex min-h-[35px] items-center justify-center border-r border-gray-300 bg-[#72b9e8] text-base font-bold text-[#333]">
                  Back
                </div>

                <div className="flex min-h-[35px] items-center justify-center bg-[#f5a7ba] text-base font-bold text-[#333]">
                  Lay
                </div>
              </div>

              {/* Main */}
              <div className="grid grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,124px))]">
                <div className="flex min-h-[55px] items-center border-r border-t border-gray-300 px-2 font-bold text-[#333]">
                  Main
                </div>

                <div className="min-w-0 border-r border-t border-gray-300 bg-[#72b9e8]">
                  <OddsBox
                    nation={`${player.name} Main`}
                    odds={
                      markets?.[player.key]?.main?.back ||
                      markets?.[player.key]?.back ||
                      "1.98"
                    }
                    type="back"
                    className="!flex !h-full !min-h-[55px] !w-full !items-center !justify-center !rounded-none !border-0 !text-lg !font-bold"
                  />
                </div>

                <div className="min-w-0 border-t border-gray-300 bg-[#f5a7ba]">
                  <OddsBox
                    nation={`${player.name} Main`}
                    odds={
                      markets?.[player.key]?.main?.lay ||
                      markets?.[player.key]?.lay ||
                      "0"
                    }
                    type="lay"
                    className="!flex !h-full !min-h-[55px] !w-full !items-center !justify-center !rounded-none !border-0 !text-lg !font-bold"
                  />
                </div>
              </div>

              {/* Consecutive */}
              <div className="grid grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,124px))]">
                <div className="flex min-h-[55px] items-center border-r border-t border-gray-300 px-2 font-bold text-[#333]">
                  Consecutive
                </div>

                <div className="min-w-0 border-r border-t border-gray-300 bg-[#72b9e8]">
                  <OddsBox
                    nation={`${player.name} Consecutive`}
                    odds={
                      markets?.[player.key]?.consecutive?.back ||
                      "2.43"
                    }
                    type="back"
                    className="!flex !h-full !min-h-[55px] !w-full !items-center !justify-center !rounded-none !border-0 !text-lg !font-bold"
                  />
                </div>

                <div className="min-w-0 border-t border-gray-300 bg-[#f5a7ba]">
                  <OddsBox
                    nation={`${player.name} Consecutive`}
                    odds={
                      markets?.[player.key]?.consecutive?.lay ||
                      "2.53"
                    }
                    type="lay"
                    className="!flex !h-full !min-h-[55px] !w-full !items-center !justify-center !rounded-none !border-0 !text-lg !font-bold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CARD ODD / EVEN MARKETS */}
        <div className="w-full overflow-x-auto border border-gray-300 bg-[#f1f1f1]">
          <div className="min-w-[650px]">

            {/* Card Headers */}
            <div className="grid grid-cols-[minmax(100px,1.2fr)_repeat(6,minmax(0,1fr))]">
              <div className="min-h-[35px] border-b border-r border-gray-300" />

              {cards.map((card) => (
                <div
                  key={card}
                  className="flex min-h-[35px] items-center justify-center border-b border-r border-gray-300 text-base font-bold text-[#333]"
                >
                  Card {card}
                </div>
              ))}
            </div>

            {/* Odd Row */}
            <div className="grid grid-cols-[minmax(100px,1.2fr)_repeat(6,minmax(0,1fr))]">
              <div className="flex min-h-[55px] items-center border-b border-r border-gray-300 px-2 font-bold text-[#333]">
                Odd
              </div>

              {cards.map((card) => (
                <div
                  key={`odd-${card}`}
                  className="min-w-0 border-b border-r border-gray-300"
                >
                  {card === 1 ? (
                    <div className="bg-[#72b9e8]">
                      <OddsBox
                        nation="Card 1 Odd"
                        odds={markets?.card1?.odd?.back || "1.83"}
                        type="back"
                        className="!flex !h-full !min-h-[55px] !w-full !items-center !justify-center !rounded-none !border-0 !text-lg !font-bold"
                      />
                    </div>
                  ) : (
                    renderLockedCard()
                  )}
                </div>
              ))}
            </div>

            {/* Even Row */}
            <div className="grid grid-cols-[minmax(100px,1.2fr)_repeat(6,minmax(0,1fr))]">
              <div className="flex min-h-[55px] items-center border-r border-gray-300 px-2 font-bold text-[#333]">
                Even
              </div>

              {cards.map((card) => (
                <div
                  key={`even-${card}`}
                  className="min-w-0 border-r border-gray-300"
                >
                  {card === 1 ? (
                    <div className="bg-[#72b9e8]">
                      <OddsBox
                        nation="Card 1 Even"
                        odds={markets?.card1?.even?.back || "2.13"}
                        type="back"
                        className="!flex !h-full !min-h-[55px] !w-full !items-center !justify-center !rounded-none !border-0 !text-lg !font-bold"
                      />
                    </div>
                  ) : (
                    renderLockedCard()
                  )}
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
// Game: Virtual 20-20 Teen Patti (vteen20)
// --------------------------------------------------------------------------



function TableVteen20({ isMobile, isSuspended, openBetSlip, markets }) {

  const players = [
    {
      name: "Player A",
      key: "playerA",
      columns: [
        { label: "Player A", market: "playerA", odds: "1.98" },
        { label: "3 Baccarat A", market: "baccaratA", odds: "1.98" },
        { label: "Total A", market: "totalA", odds: "2" },
        { label: "Pair Plus A", market: "pairPlusA", odds: "A" },
      ],
      suits: [
        { label: "Spade Club A", icons: ["♠️", "♣️"], odds: "1.98" },
        { label: "Heart Diamond A", icons: ["♥️", "♦️"], odds: "1.98" },
      ],
    },
    {
      name: "Player B",
      key: "playerB",
      columns: [
        { label: "Player B", market: "playerB", odds: "1.98" },
        { label: "3 Baccarat B", market: "baccaratB", odds: "1.98" },
        { label: "Total B", market: "totalB", odds: "2" },
        { label: "Pair Plus B", market: "pairPlusB", odds: "B" },
      ],
      suits: [
        { label: "Spade Club B", icons: ["♠️", "♣️"], odds: "1.98" },
        { label: "Heart Diamond B", icons: ["♥️", "♦️"], odds: "1.98" },
      ],
    },
  ];

  const OddsButton = ({ nation, odds, type = "back" }) => {
    const isBack = type === "back";

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
          flex min-h-[64px] w-full min-w-0
          items-center justify-center
          px-1 py-2 text-center
          text-lg font-bold text-[#263747]
          transition-all duration-150
          ${isBack
            ? "bg-[#78bce9] hover:bg-[#60abe0]"
            : "bg-[#f5a6ba] hover:bg-[#ed91a9]"
          }
          ${isSuspended
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer active:brightness-95"
          }
        `}
      >
        {isSuspended ? "-" : odds}
      </button>
    );
  };

  return (
    <div className="w-full min-w-0 bg-white">

      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">

        {players.map((player) => (
          <div
            key={player.key}
            className="min-w-0 border border-[#d0d0d0] bg-[#f1f1f1]"
          >

            {/* Player Title */}
            <div className="border-b border-[#c7c7c7] px-2 py-1 text-lg font-bold text-[#333]">
              {player.name}
            </div>

            {/* Market Headers */}
            <div className="grid grid-cols-4">
              {player.columns.map((column, index) => (
                <div
                  key={column.market}
                  className={`
                    flex min-h-[63px] min-w-0
                    items-center justify-center
                    border-r border-[#c7c7c7]
                    px-1 text-center
                    text-sm font-bold text-[#333]
                    sm:text-base
                    ${index === 3 ? "border-r-0" : ""}
                  `}
                >
                  {column.label}
                </div>
              ))}
            </div>

            {/* Main Odds */}
            <div className="grid grid-cols-4 border-t border-[#c7c7c7]">
              {player.columns.map((column, index) => {
                const odds =
                  markets?.[column.market]?.back ?? column.odds;

                return (
                  <div
                    key={column.market}
                    className={`
                      min-w-0 border-r border-[#c7c7c7]
                      ${index === 3 ? "border-r-0" : ""}
                    `}
                  >
                    <OddsButton
                      nation={column.label}
                      odds={odds}
                      type="back"
                    />
                  </div>
                );
              })}
            </div>

            {/* Suit Combination Bets */}
            <div className="mt-3 grid grid-cols-2 gap-1.5 pb-0.5">

              {player.suits.map((suit) => {
                const marketKey =
                  suit.label === `Spade Club ${player.key === "playerA" ? "A" : "B"}`
                    ? "spadeClub"
                    : "heartDiamond";

                const odds =
                  markets?.[player.key]?.[marketKey]?.back ??
                  suit.odds;

                return (
                  <div
                    key={suit.label}
                    className="min-w-0"
                  >
                    <button
                      type="button"
                      disabled={isSuspended}
                      onClick={() => {
                        if (!isSuspended) {
                          openBetSlip(
                            suit.label,
                            odds,
                            "back",
                            isMobile
                          );
                        }
                      }}
                      className={`
                        flex min-h-[63px] w-full
                        items-center justify-between
                        gap-1 px-3 py-2
                        text-[#263747]
                        transition-all duration-150
                        ${isSuspended
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer active:brightness-95"
                        }
                        bg-[#78bce9]
                        hover:bg-[#60abe0]
                      `}
                    >
                      <span className="flex items-center gap-1 text-[25px] leading-none sm:text-[32px]">
                        {suit.icons.map((icon, index) => (
                          <span key={index}>{icon}</span>
                        ))}
                      </span>

                      <span className="text-base font-bold sm:text-lg">
                        {isSuspended ? "-" : odds}
                      </span>
                    </button>
                  </div>
                );
              })}

            </div>

          </div>
        ))}

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

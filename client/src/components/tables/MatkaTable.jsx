import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { getUser } from '../../redux/reducer/authReducer';
import {
  getMyCasinoBets,
  placeCasinoBet,
} from '../../redux/reducer/casinoBetSlice';
import { useCasino } from '../../context/CasinoContext';
import MatkaCalendar from './MatkaCalendar';

// D247 Matka specification:
// 1-Click chip bar (Reset, 0=, 25, 50, 100, 200, 500, 1K)
// Left vertical tablist (Jodi, Single, Pana, SP, DP, Trio, Cycle, Motor SP, 56 Charts, 64 Charts, ABR, Common SP, Common DP, Color DP)
// Right tab-content pane (exact worlibox / worli-left / worli-right layout)
const COINS = [25, 50, 100, 200, 500, 1000];
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const LOCAL_ODDS = { single: 9.5, jodi: 95, sp: 140, dp: 240, tp: 700 };

const spPana = (d) => {
  const out = [];
  for (let a = 0; a < 8; a++)
    for (let b = a + 1; b < 9; b++)
      for (let c = b + 1; c < 10; c++)
        if ((a + b + c) % 10 === d) out.push(`${a}${b}${c}`);
  return out;
};
const dpPana = (d) => {
  const out = [];
  for (let x = 0; x < 10; x++)
    for (let y = 0; y < 10; y++)
      if (x !== y && (2 * x + y) % 10 === d) out.push(`${x}${x}${y}`);
  return out.sort();
};
const dpKey = (combo) => {
  const [a, b, c] = String(combo).split('');
  return a === b ? `${a}${c}` : b === c ? `${b}${a}` : `${a}${b}`;
};

const coinLabel = (v) => (v >= 1000 ? `${v / 1000}K` : String(v));

const Chip = ({ label, color, selected, onClick }) => (
  <div
    className={`casino-coin ${selected ? 'selected' : ''}`}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className='bet-chip-holder' style={{ '--g-chip-inner-color': color }}>
      <div className='bet-chip'>
        <div className='bet-chip-front'></div>
        <div className='bet-chip-top'></div>
        <div className='bet-chip-amount'>
          <svg
            className='bet-chip-amount-in'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 108 108'
          >
            <text
              className='bet-chip-amount-label'
              x='50%'
              y='53.5%'
              dominantBaseline='middle'
              textAnchor='middle'
              fill='#fff'
              fontSize='32'
              fontWeight='700'
            >
              {label}
            </text>
          </svg>
        </div>
      </div>
    </div>
  </div>
);

export default function MatkaTable({
  isMobile,
  isSuspended,
  activeMid: propActiveMid,
}) {
  const dispatch = useDispatch();
  const { roundData, openBetSlip, selectedGame } = useCasino();
  const isWorli3 = selectedGame === 'worli3';
  const isWorli2 = selectedGame === 'worli2';
  const isWorliRegular = selectedGame === 'worli' || isWorli2;
  const [pane, setPane] = useState('single');
  const [panaMode, setPanaMode] = useState('sp');
  const [coinTotal, setCoinTotal] = useState(0);
  const [showCal, setShowCal] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);

  const rounds = roundData?.rounds || [];

  const mid =
    propActiveMid ||
    (rounds.length > 0 ? rounds[0]?.mid : null) ||
    roundData?.mid;

  const round =
    roundData?.subs?.[String(mid)] ||
    (String(roundData?.mid) === String(mid) ? roundData : null) ||
    roundData;

  const sub = Array.isArray(round?.sub) ? round.sub : [];
  const markets = useMemo(() => {
    const map = {};
    for (const m of sub) map[String(m.sid)] = m;
    return map;
  }, [sub]);

  const digitMarket = (d) =>
    Object.values(markets).find(
      (x) => Number(x.sr) % 10 === d && Number(x.sid) <= 10
    );

  const localMarket = (key) => ({
    sid: key,
    nat: key,
    b: LOCAL_ODDS[key.split(':')[0]] || 9.5,
    gstatus: 'OPEN',
    min: 10,
    max: 20000,
  });

  const effectiveOdds = (market) => {
    const b = Number(market?.b ?? 0);
    if (b > 1) return b;
    const status = String(market?.gstatus ?? '').toUpperCase();
    if (isWorli3 && (!status || status === 'OPEN' || status === 'ACTIVE')) {
      return LOCAL_ODDS.single;
    }
    return b;
  };

  const clickBox = (market, label) => {
    if (isSuspended || !market) return;
    const odds = effectiveOdds(market);
    if (!(odds > 1)) return;
    const sel = String(market.sid);
    setSelectedBet({ sel, label, odds, market });

    if (coinTotal > 0) {
      dispatch(
        placeCasinoBet({
          slug: selectedGame,
          roundId: String(mid),
          side: 'back',
          selection: sel,
          odds,
          stake: coinTotal,
        })
      )
        .unwrap()
        .then(() => {
          dispatch(getUser());
          dispatch(getMyCasinoBets(selectedGame));
        })
        .catch(() => {});
      return;
    }
    openBetSlip(sel.includes(':') ? sel : label, odds, 'back', isMobile);
  };

  const Box = ({ label, subLabel, market, sel }) => {
    const m = market || (sel ? localMarket(sel) : null);
    const oddsVal = effectiveOdds(m);
    const dead = isSuspended || (m && !(oddsVal > 1));
    const isSelected =
      selectedBet &&
      m &&
      (selectedBet.sel === String(m.sid) || selectedBet.label === label);
    return (
      <div
        className={`worli-odd-box back ${isSelected ? 'selected' : ''} ${dead && m ? 'suspended-box' : ''}`}
        onClick={m && !dead ? () => clickBox(m, label) : undefined}
        style={{ cursor: m && !dead ? 'pointer' : 'not-allowed' }}
        title={m ? `odds ${oddsVal}` : 'Provider market unavailable'}
      >
        <span className='worli-odd'>{label}</span>
        {subLabel && <span className='d-block'>{subLabel}</span>}
      </div>
    );
  };

  const PANES = isWorliRegular
    ? [
        { id: 'single', name: 'Single' },
        { id: 'pana', name: 'Pana' },
        { id: 'sp', name: 'SP' },
        { id: 'dp', name: 'DP' },
        { id: 'trio', name: 'Trio' },
        { id: 'cycle', name: 'Cycle' },
        { id: 'motor', name: 'Motor SP' },
        { id: 'chart56', name: '56 Charts' },
        { id: 'chart64', name: '64 Charts' },
        { id: 'abr', name: 'ABR' },
        { id: 'commonsp', name: 'Common SP' },
        { id: 'commondp', name: 'Common DP' },
        { id: 'colordp', name: 'Color DP' },
      ]
    : [
        { id: 'jodi', name: 'Jodi' },
        { id: 'single', name: 'Single' },
        { id: 'pana', name: 'Pana' },
        { id: 'sp', name: 'SP' },
        { id: 'dp', name: 'DP' },
        { id: 'trio', name: 'Trio' },
        { id: 'cycle', name: 'Cycle' },
        { id: 'motor', name: 'Motor SP' },
        { id: 'chart56', name: '56 Charts' },
        { id: 'chart64', name: '64 Charts' },
        { id: 'abr', name: 'ABR' },
        { id: 'commonsp', name: 'Common SP' },
        { id: 'commondp', name: 'Common DP' },
        { id: 'colordp', name: 'Color DP' },
      ];

  return (
    <div className='casino-table'>
      {/* 1. matka-coins: 1-click chip bar (worli3 Matka Market only) */}
      {isWorli3 && (
        <div className='matka-coins'>
          <div className='matka-coin-title'>
            <span className='d-none d-md-flex'>
              SET YOUR COIN AMOUNT
              <br /> AND START 1-CLICK BET!
            </span>
            <span className='d-md-none'>
              SET YOUR COIN AMOUNT AND START 1-CLICK BET!
            </span>
            <button
              type='button'
              className='btn btn-danger btn-sm'
              onClick={() => setCoinTotal(0)}
            >
              Reset
            </button>
          </div>
          <div className='matka-total-coin'>
            <Chip label={String(coinTotal)} color='#502b63' />
            <div>=</div>
          </div>
          <div className='matka-other-coins'>
            {COINS.map((c, i) => (
              <React.Fragment key={c}>
                {i > 0 && <div>+</div>}
                <Chip
                  label={coinLabel(c)}
                  color='#1f6179'
                  selected={coinTotal > 0 && coinTotal % c === 0}
                  onClick={() => setCoinTotal((prev) => prev + c)}
                />
              </React.Fragment>
            ))}
            <button
              type='button'
              className='btn btn-sm btn-outline-secondary ms-2'
              onClick={() => setShowCal(true)}
            >
              Calendar
            </button>
          </div>
        </div>
      )}

      {showCal && (
        <MatkaCalendar slug={selectedGame} onClose={() => setShowCal(false)} />
      )}

      {/* 2. Pane tabs (vertical in worli3 .matka, horizontal in worli, hidden in worli2) */}
      {!isWorli2 && (
        <div className='nav nav-pills' role='tablist'>
          {PANES.map((p) => (
            <div className='nav-item' key={p.id}>
              <a
                role='tab'
                id={`worli-tabs-tab-${p.id}`}
                className={`nav-link ${pane === p.id ? 'active' : ''}`}
                href='#'
                onClick={(e) => {
                  e.preventDefault();
                  setPane(p.id);
                }}
              >
                {p.name}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* 3. Tab content on right (.casino-box.tab-content) */}
      <div className='casino-box tab-content tab-content w-100'>
        {/* Single Tab Pane */}
        {pane === 'single' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-single'
            aria-labelledby='worli-tabs-tab-single'
            className='fade single tab-pane active show'
          >
            <div className='worlibox'>
              <div className='worli-left'>
                <div className='worli-box-title'>
                  {isWorliRegular && (
                    <b>
                      {digitMarket(1)?.b ??
                        (selectedGame === 'worli' ? '9.5' : '9')}
                    </b>
                  )}
                </div>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <Box
                      key={d}
                      label={String(d)}
                      market={digitMarket(d) || localMarket(`single:${d}`)}
                    />
                  ))}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) => (
                    <Box
                      key={d}
                      label={String(d)}
                      market={digitMarket(d) || localMarket(`single:${d}`)}
                    />
                  ))}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-title'>
                  {isWorliRegular && (
                    <b>
                      {digitMarket(1)?.b ??
                        (selectedGame === 'worli' ? '9.5' : '9')}
                    </b>
                  )}
                </div>
                <div className='worli-box-row'>
                  <Box
                    label='Line 1'
                    subLabel='1|2|3|4|5'
                    market={markets['11'] || localMarket('single:line1')}
                  />
                  <Box
                    label='ODD'
                    subLabel='1|3|5|7|9'
                    market={markets['13'] || localMarket('single:odd')}
                  />
                </div>
                <div className='worli-box-row'>
                  <Box
                    label='Line 2'
                    subLabel='6|7|8|9|0'
                    market={markets['12'] || localMarket('single:line2')}
                  />
                  <Box
                    label='EVEN'
                    subLabel='2|4|6|8|0'
                    market={markets['14'] || localMarket('single:even')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jodi Tab Pane */}
        {pane === 'jodi' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-jodi'
            aria-labelledby='worli-tabs-tab-jodi'
            className='fade jodi tab-pane active show'
          >
            <div className='casino-table-full-box'>
              <div className={`worlibox ${isSuspended ? 'suspended-box' : ''}`}>
                <div className='worli-full'>
                  <div className='worli-box-title'></div>
                  {Array.from({ length: 10 }, (_, row) => (
                    <div className='worli-box-row' key={row}>
                      {Array.from({ length: 10 }, (_, col) => {
                        const label = `${row}-${col}`;
                        const sel = `jodi:${row}${col}`;
                        return <Box key={label} label={label} sel={sel} />;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pana Tab Pane */}
        {pane === 'pana' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-pana'
            aria-labelledby='worli-tabs-tab-pana'
            className='fade pana tab-pane active show'
          >
            <div className='worlibox'>
              <div className='worli-full'>
                <ul className='nav nav-pills'>
                  <li className='nav-item'>
                    <button
                      type='button'
                      className={`nav-link ${panaMode === 'sp' ? 'active' : ''}`}
                      onClick={() => setPanaMode('sp')}
                    >
                      SP PANA ({LOCAL_ODDS.sp})
                    </button>
                  </li>
                  <li className='nav-item'>
                    <button
                      type='button'
                      className={`nav-link ${panaMode === 'dp' ? 'active' : ''}`}
                      onClick={() => setPanaMode('dp')}
                    >
                      DP PANA &amp; TRIO ({LOCAL_ODDS.dp})
                    </button>
                  </li>
                </ul>
                <div className='tab-content'>
                  <div
                    className='tab-pane active show'
                    id={panaMode === 'sp' ? 'sppana' : 'dppana'}
                  >
                    <div className='worli-box-row'>
                      {DIGITS.map((d) => (
                        <div className='worli-odd-box' key={d}>
                          <span className='worli-odd back'>{d}</span>
                          <div className='worli-sub-odd-box-container'>
                            {(panaMode === 'sp' ? spPana(d) : dpPana(d)).map(
                              (p) => (
                                <div
                                  className='worli-sub-odd-box back'
                                  key={p}
                                  onClick={() =>
                                    clickBox(
                                      localMarket(
                                        panaMode === 'sp'
                                          ? `sp:${p}`
                                          : `dp:${dpKey(p)}`
                                      ),
                                      p
                                    )
                                  }
                                  style={{ cursor: 'pointer' }}
                                  title={`odds ${panaMode === 'sp' ? LOCAL_ODDS.sp : LOCAL_ODDS.dp}`}
                                >
                                  <span className='worli-odd'>{p}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SP Tab Pane */}
        {pane === 'sp' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-sp'
            aria-labelledby='worli-tabs-tab-sp'
            className='fade sp tab-pane active show'
          >
            <div className='worlibox'>
              <div className='worli-box-title'></div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <Box key={d} label={String(d)} sel={`sp:${d}`} />
                  ))}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) => (
                    <Box key={d} label={String(d)} sel={`sp:${d}`} />
                  ))}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  <Box label='SP ALL' sel='sp:all' />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DP Tab Pane */}
        {pane === 'dp' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-dp'
            aria-labelledby='worli-tabs-tab-dp'
            className='fade dp tab-pane active show'
          >
            <div className='worlibox'>
              <div className='worli-box-title'></div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <Box key={d} label={String(d)} sel={`dp:${d}`} />
                  ))}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) => (
                    <Box key={d} label={String(d)} sel={`dp:${d}`} />
                  ))}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  <Box label='DP ALL' sel='dp:all' />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trio Tab Pane */}
        {pane === 'trio' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-trio'
            aria-labelledby='worli-tabs-tab-trio'
            className='fade trio tab-pane active show'
          >
            <div className='worli-full'>
              <div className='worli-box-title'></div>
              <div className='worli-box-row'>
                <Box label='ALL TRIO' sel='tp:all' />
              </div>
            </div>
          </div>
        )}

        {/* Cycle Tab Pane */}
        {pane === 'cycle' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-cycle'
            aria-labelledby='worli-tabs-tab-cycle'
            className='fade cycle tab-pane active show'
          >
            <div className='worlibox'>
              <div className='worli-full'>
                <div className='worli-box-title'>
                  <b>&nbsp;</b>
                </div>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <Box key={d} label={String(d)} sel={`cycle:${d}`} />
                  ))}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) => (
                    <Box key={d} label={String(d)} sel={`cycle:${d}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Motor SP Tab Pane */}
        {pane === 'motor' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-motor'
            aria-labelledby='worli-tabs-tab-motor'
            className='fade motor tab-pane active show'
          >
            <div className='worlibox'>
              <div className='worli-full'>
                <div className='worli-box-title'></div>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <Box key={d} label={String(d)} sel={`motor:${d}`} />
                  ))}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) => (
                    <Box key={d} label={String(d)} sel={`motor:${d}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 56 Charts Tab Pane */}
        {pane === 'chart56' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-chart56'
            aria-labelledby='worli-tabs-tab-chart56'
            className='fade chart56 tab-pane active show'
          >
            <div className='worlibox'>
              <div className='worli-box-title'></div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <Box key={d} label={String(d)} sel={`chart56:${d}`} />
                  ))}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) => (
                    <Box key={d} label={String(d)} sel={`chart56:${d}`} />
                  ))}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  <Box label='56 ALL' sel='chart56:all' />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 64 Charts Tab Pane */}
        {pane === 'chart64' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-chart64'
            aria-labelledby='worli-tabs-tab-chart64'
            className='fade chart64 tab-pane active show'
          >
            <div className='worlibox'>
              <div className='worli-box-title'></div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <Box key={d} label={String(d)} sel={`chart64:${d}`} />
                  ))}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) => (
                    <Box key={d} label={String(d)} sel={`chart64:${d}`} />
                  ))}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  <Box label='64 ALL' sel='chart64:all' />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABR Tab Pane */}
        {pane === 'abr' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-abr'
            aria-labelledby='worli-tabs-tab-abr'
            className='fade abr tab-pane active show'
          >
            <div className='worlibox'>
              <div className='worli-box-title'></div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  <Box label='A' sel='abr:a' />
                  <Box label='B' sel='abr:b' />
                  <Box label='R' sel='abr:r' />
                </div>
                <div className='worli-box-row'>
                  <Box label='AB' sel='abr:ab' />
                  <Box label='AR' sel='abr:ar' />
                  <Box label='BR' sel='abr:br' />
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  <Box label='ABR' sel='abr:abr' />
                </div>
                <div className='worli-box-row'>
                  <Box label='ABR CUT' sel='abr:abrcut' />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Common SP Tab Pane */}
        {pane === 'commonsp' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-commonsp'
            aria-labelledby='worli-tabs-tab-commonsp'
            className='fade commonsp tab-pane active show'
          >
            <div className='worli-full'>
              <div className='worli-box-title'></div>
              <div className='worli-box-row'>
                {[1, 2, 3, 4, 5].map((d) => (
                  <Box key={d} label={String(d)} sel={`commonsp:${d}`} />
                ))}
              </div>
              <div className='worli-box-row'>
                {[6, 7, 8, 9, 0].map((d) => (
                  <Box key={d} label={String(d)} sel={`commonsp:${d}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Common DP Tab Pane */}
        {pane === 'commondp' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-commondp'
            aria-labelledby='worli-tabs-tab-commondp'
            className='fade commondp tab-pane active show'
          >
            <div className='worli-full'>
              <div className='worli-box-title'></div>
              <div className='worli-box-row'>
                {[1, 2, 3, 4, 5].map((d) => (
                  <Box key={d} label={String(d)} sel={`commondp:${d}`} />
                ))}
              </div>
              <div className='worli-box-row'>
                {[6, 7, 8, 9, 0].map((d) => (
                  <Box key={d} label={String(d)} sel={`commondp:${d}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Color DP Tab Pane */}
        {pane === 'colordp' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-colordp'
            aria-labelledby='worli-tabs-tab-colordp'
            className='fade colordp tab-pane active show'
          >
            <div className='worlibox'>
              <div className='worli-box-title'></div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <Box key={d} label={String(d)} sel={`colordp:${d}`} />
                  ))}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) => (
                    <Box key={d} label={String(d)} sel={`colordp:${d}`} />
                  ))}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  <Box label='COLOR DP ALL' sel='colordp:all' />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Action / Clear Bar when clicked */}
      {selectedBet && (
        <div className='worli-clear-box container-fluid mt-2'>
          <div className='row row5 align-items-center'>
            <div className='col-6 text-center'>
              <span className='worli-place-card'>{selectedBet.label}</span>
            </div>
            <div className='col-6 pe-3 text-end'>
              <button
                type='button'
                className='btn btn-danger btn-sm me-1'
                onClick={() => setSelectedBet(null)}
              >
                Clear
              </button>
              <button
                type='button'
                className='btn btn-success btn-sm'
                onClick={() => {
                  if (coinTotal > 0) {
                    clickBox(selectedBet.market, selectedBet.label);
                  } else {
                    openBetSlip(
                      selectedBet.sel?.includes(':')
                        ? selectedBet.sel
                        : selectedBet.label,
                      selectedBet.odds,
                      'back',
                      isMobile
                    );
                  }
                }}
              >
                Place Bet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

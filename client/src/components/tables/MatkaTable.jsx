import React, { useMemo, useState } from 'react';

import { useDispatch } from 'react-redux';

import { getUser } from '../../redux/reducer/authReducer';
import {
  getMyCasinoBets,
  placeCasinoBet,
} from '../../redux/reducer/casinoBetSlice';
import { useCasino } from '../../context/CasinoContext';
import MatkaCalendar from './MatkaCalendar';

// worli/matka reference layout: matka-tabs (rounds + countdown + game-time),
// matka-coins 1-click chip bar, 14 pane tabs. Selection logic hamare end pe:
// jodi/pana/sp/dp/trio local keys (backend LOCAL_MATKA_ODDS se settleable).
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
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 108 108'
          >
            <text
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

export default function MatkaTable({ isMobile, isSuspended }) {
  const dispatch = useDispatch();
  const { roundData, openBetSlip, selectedGame } = useCasino();
  const [pane, setPane] = useState('single');
  const [panaMode, setPanaMode] = useState('sp');
  const [coins, setCoins] = useState([]);
  const [activeMid, setActiveMid] = useState(null);
  const [showCal, setShowCal] = useState(false);

  const rounds = useMemo(
    () => (roundData?.rounds || []).filter((r) => r.mtype === 'OPEN'),
    [roundData]
  );

  const mid = rounds.some((r) => String(r.mid) === String(activeMid))
    ? activeMid
    : rounds[0]?.mid;

  const round =
    roundData?.subs?.[String(mid)] ||
    (String(roundData?.mid) === String(mid) ? roundData : null);

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

  const coinTotal = coins.reduce((a, b) => a + b, 0);

  // Local matka market (selection logic hamare end pe): provider sid na ho
  // to synthetic market banayo — backend LOCAL_MATKA_ODDS se validate karta hy.
  const localMarket = (key) => ({
    sid: key,
    nat: key,
    b: LOCAL_ODDS[key.split(':')[0]] || 0,
    gstatus: 'OPEN',
    min: 10,
    max: 20000,
  });

  const clickBox = (market, label) => {
    if (isSuspended || !market) return;
    const odds = Number(market.b ?? 0);
    if (!(odds > 1)) return;
    const sel = String(market.sid);
    if (coinTotal > 0) {
      // 1-click coin bet (reference matka-coins behavior)
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
    const dead = isSuspended || (m && !(Number(m.b) > 1));
    return (
      <div
        className={`worli-odd-box back ${dead && m ? 'suspended-box' : ''}`}
        onClick={m ? () => clickBox(m, label) : undefined}
        style={{ cursor: m && !dead ? 'pointer' : 'not-allowed' }}
        title={m ? `odds ${m.b}` : 'Provider market unavailable'}
      >
        <span className='worli-odd'>{label}</span>
        {subLabel && <span className='d-block'>{subLabel}</span>}
      </div>
    );
  };

  const digitRow = (arr, mode = 'single') => (
    <div className='worli-box-row'>
      {arr.map((d) =>
        mode === 'display' ? (
          <Box key={d} label={String(d)} />
        ) : (
          <Box
            key={d}
            label={String(d)}
            market={digitMarket(d) || localMarket(`single:${d}`)}
          />
        )
      )}
    </div>
  );

  const specialBoxes = [
    { label: 'Line 1', sub: '1|2|3|4|5', sid: 11 },
    { label: 'ODD', sub: '1|3|5|7|9', sid: 13 },
    { label: 'Line 2', sub: '6|7|8|9|0', sid: 12 },
    { label: 'EVEN', sub: '2|4|6|8|0', sid: 14 },
  ];

  const PANES = [
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
    <div className='casino-table worli'>
      {/* Bazaar tabs = open rounds (reference matka-tabs) */}
      {rounds.length > 0 && (
        <div className='matka-tabs'>
          <ul className='nav nav-pills'>
            {rounds.map((r) => (
              <li className='nav-item' key={String(r.mid)}>
                <a
                  className={`nav-link ${
                    String(r.mid) === String(mid) ? 'active' : ''
                  }`}
                  href='javascript:void(0)'
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveMid(String(r.mid));
                  }}
                >
                  <span>{r.mname}</span>
                  <div className='remaining-time'>
                    <span>{r.ptime}</span>
                  </div>
                  <div className='game-time'>
                    <span>{r.mtime}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coin bar — reference matka-coins, 1-click betting */}
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
            onClick={() => setCoins([])}
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
                selected={coins.includes(c)}
                onClick={() =>
                  setCoins((prev) =>
                    prev.includes(c)
                      ? prev.filter((x) => x !== c)
                      : [...prev, c]
                  )
                }
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

      {showCal && (
        <MatkaCalendar slug={selectedGame} onClose={() => setShowCal(false)} />
      )}

      {/* Pane tabs (reference worli-tabs tablist) */}
      <div className='nav nav-pills' role='tablist'>
        {PANES.map((p) => (
          <div className='nav-item' key={p.id}>
            <a
              role='tab'
              className={`nav-link ${pane === p.id ? 'active' : ''}`}
              href='javascript:void(0)'
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

      <div className='casino-box tab-content tab-content w-100'>
        {pane === 'jodi' && (
          <div className='casino-table-full-box'>
            <div className={`worlibox ${isSuspended ? 'suspended-box' : ''}`}>
              <div className='worli-full'>
                <div className='worli-box-row'>
                  {Array.from({ length: 100 }, (_, i) => (
                    <Box
                      key={i}
                      label={`${Math.floor(i / 10)}-${i % 10}`}
                      sel={`jodi:${Math.floor(i / 10)}${i % 10}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {pane === 'single' && (
          <div className='worlibox'>
            <div className='worli-left'>
              <div className='worli-box-title'></div>
              {digitRow([1, 2, 3, 4, 5])}
              {digitRow([6, 7, 8, 9, 0])}
            </div>
            <div className='worli-right'>
              <div className='worli-box-title'></div>
              <div className='worli-box-row'>
                {specialBoxes.slice(0, 2).map((s) => (
                  <Box
                    key={s.sid}
                    label={s.label}
                    subLabel={s.sub}
                    market={markets[String(s.sid)]}
                  />
                ))}
              </div>
              <div className='worli-box-row'>
                {specialBoxes.slice(2).map((s) => (
                  <Box
                    key={s.sid}
                    label={s.label}
                    subLabel={s.sub}
                    market={markets[String(s.sid)]}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {pane === 'pana' && (
          <div className='worlibox'>
            <div className='worli-full'>
              <ul className='nav nav-pills'>
                <li className='nav-item'>
                  <button
                    type='button'
                    className={`nav-link ${panaMode === 'sp' ? 'active' : ''}`}
                    onClick={() => setPanaMode('sp')}
                  >
                    SP PANA()
                  </button>
                </li>
                <li className='nav-item'>
                  <button
                    type='button'
                    className={`nav-link ${panaMode === 'dp' ? 'active' : ''}`}
                    onClick={() => setPanaMode('dp')}
                  >
                    DP PANA &amp; TRIO()
                  </button>
                </li>
              </ul>
              <div className='tab-content'>
                <div
                  className={`tab-pane ${panaMode === 'sp' ? 'active' : ''}`}
                >
                  {panaMode === 'sp' && (
                    <div className='worli-box-row'>
                      {DIGITS.map((d) => (
                        <div className='worli-odd-box' key={d}>
                          <span className='worli-odd back'>{d}</span>
                          <div className='worli-sub-odd-box-container'>
                            {spPana(d).map((p) => (
                              <div
                                className='worli-sub-odd-box back'
                                key={p}
                                onClick={() =>
                                  clickBox(localMarket(`sp:${p}`), p)
                                }
                                style={{ cursor: 'pointer' }}
                                title={`odds ${LOCAL_ODDS.sp}`}
                              >
                                <span className='worli-odd'>{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {panaMode === 'dp' && (
                    <div className='worli-box-row'>
                      {DIGITS.map((d) => (
                        <div className='worli-odd-box' key={d}>
                          <span className='worli-odd back'>{d}</span>
                          <div className='worli-sub-odd-box-container'>
                            {dpPana(d).map((p) => (
                              <div
                                className='worli-sub-odd-box back'
                                key={p}
                                onClick={() =>
                                  clickBox(localMarket(`dp:${dpKey(p)}`), p)
                                }
                                style={{ cursor: 'pointer' }}
                                title={`odds ${LOCAL_ODDS.dp}`}
                              >
                                <span className='worli-odd'>{p}</span>
                              </div>
                            ))}
                            <div
                              className='worli-sub-odd-box back'
                              onClick={() =>
                                clickBox(
                                  localMarket(`tp:${d}`),
                                  String(d).repeat(3)
                                )
                              }
                              style={{ cursor: 'pointer' }}
                              title={`odds ${LOCAL_ODDS.tp}`}
                            >
                              <span className='worli-odd'>
                                {String(d).repeat(3)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {['sp', 'dp', 'chart56', 'chart64', 'colordp'].includes(pane) && (
          <div className='worlibox'>
            <div className='worli-box-title'></div>
            <div className='worli-left'>
              {digitRow([1, 2, 3, 4, 5], 'display')}
              {digitRow([6, 7, 8, 9, 0], 'display')}
            </div>
            <div className='worli-right'>
              <div className='worli-box-row'>
                <Box
                  label={
                    {
                      sp: 'SP ALL',
                      dp: 'DP ALL',
                      chart56: '56 ALL',
                      chart64: '64 ALL',
                      colordp: 'COLOR DP ALL',
                    }[pane]
                  }
                />
              </div>
            </div>
          </div>
        )}

        {pane === 'trio' && (
          <div className='worli-full'>
            <div className='worli-box-title'></div>
            <div className='worli-box-row'>
              <Box label='ALL TRIO' />
            </div>
          </div>
        )}

        {['cycle', 'motor', 'commonsp', 'commondp'].includes(pane) && (
          <div className='worlibox'>
            <div className='worli-full'>
              <div className='worli-box-title'></div>
              {digitRow([1, 2, 3, 4, 5], 'display')}
              {digitRow([6, 7, 8, 9, 0], 'display')}
            </div>
          </div>
        )}

        {pane === 'abr' && (
          <div className='worlibox'>
            <div className='worli-box-title'></div>
            <div className='worli-left'>
              <div className='worli-box-row'>
                <Box label='A' />
                <Box label='B' />
                <Box label='R' />
              </div>
              <div className='worli-box-row'>
                <Box label='AB' />
                <Box label='AR' />
                <Box label='BR' />
              </div>
            </div>
            <div className='worli-right'>
              <div className='worli-box-row'>
                <Box label='ABR' />
              </div>
              <div className='worli-box-row'>
                <Box label='ABR CUT' />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

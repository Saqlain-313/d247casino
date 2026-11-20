import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { useCasino } from '../../context/CasinoContext';
import { getUser } from '../../redux/reducer/authReducer';
import {
  getMyCasinoBets,
  placeCasinoBet,
} from '../../redux/reducer/casinoBetSlice';

// Exact D247 Worli / Instant Worli / Matka Market table (reference
// 776178602-new.devtools @2960000-3009000 & @9751500-9765500):
// - worli2 (Instant Worli): Single + Line1/2 + ODD/EVEN only, live API sections[1] rate (9)
// - worli  (Worli Matka):   13 horizontal tabs, live API sections[1..13] rates (9.5/140/240/700)
// - worli3 (Matka Market):  1-click coin bar (NO extra calendar button here — Calendar opens from
//                           Last Result bazaar chips per D247 @2953052) + vertical tabs (Jodi + 13)
const COINS = [25, 50, 100, 200, 500, 1000];
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

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

const ALL_SP = [];
const ALL_DP = [];
for (let a = 0; a < 8; a++)
  for (let b = a + 1; b < 9; b++)
    for (let c = b + 1; c < 10; c++) ALL_SP.push(`${a}${b}${c}`);
for (let x = 0; x < 10; x++)
  for (let y = 0; y < 10; y++)
    if (x !== y) {
      const s = [x, x, y].sort((u, v) => u - v).join('');
      if (!ALL_DP.includes(s)) ALL_DP.push(s);
    }

const panaDigit = (p) => (Number(p[0]) + Number(p[1]) + Number(p[2])) % 10;
const isAkiSp = (p) => p.split('').every((c) => Number(c) % 2 === 1);
const isBekiSp = (p) => p.split('').every((c) => Number(c) % 2 === 0);
const isRonSp = (p) => {
  const n = p.split('').map(Number);
  return (n[1] === n[0] + 1 && n[2] === n[1] + 1) || p === '089';
};
const isColorDp = (p) =>
  p.split('').every((c) => Number(c) % 2 === 1) ||
  p.split('').every((c) => Number(c) % 2 === 0);

const abrCount = (arg) =>
  ALL_SP.filter((p) => {
    const a = isAkiSp(p);
    const b = isBekiSp(p);
    const r = isRonSp(p);
    if (arg === 'a') return a;
    if (arg === 'b') return b;
    if (arg === 'r') return r;
    if (arg === 'ab') return a || b;
    if (arg === 'ar') return a || r;
    if (arg === 'br') return b || r;
    if (arg === 'abr') return a || b || r;
    if (arg === 'abrcut') return !a && !b && !r;
    return false;
  }).length;

const SECTION_SID = {
  single: 1,
  pana: 2,
  sp: 3,
  dp: 4,
  tp: 5,
  trio: 5,
  cycle: 6,
  motor: 7,
  chart56: 8,
  chart64: 9,
  abr: 10,
  commonsp: 11,
  commondp: 12,
  colordp: 13,
  jodi: 14,
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

  const rounds = roundData?.rounds || [];
  const activeRoundMeta =
    rounds.find((r) => String(r.mid) === String(propActiveMid)) ||
    rounds.find((r) => r.mtype === 'OPEN') ||
    rounds[0] ||
    null;
  const isClosedBazaar =
    isWorli3 && String(activeRoundMeta?.mtype || '').toUpperCase() === 'CLOSED';

  const [pane, setPane] = useState(isWorli3 ? 'jodi' : 'single');
  const [panaMode, setPanaMode] = useState('sp');
  const [coinTotal, setCoinTotal] = useState(0);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [cycleDigits, setCycleDigits] = useState([]);
  const [motorDigits, setMotorDigits] = useState([]);
  const [selectedBet, setSelectedBet] = useState(null);

  const activePane =
    isWorli2 || (isClosedBazaar && pane === 'jodi') ? 'single' : pane;

  const mid = propActiveMid || activeRoundMeta?.mid || roundData?.mid;

  const round =
    (isWorli3 && roundData?.subs?.[String(mid)]) ||
    (String(roundData?.mid) === String(mid) ? roundData : null) ||
    roundData;

  const sections = roundData?.sections || {};

  // Real live provider sections keyed by sid (1..14)
  const sectionBySid = useMemo(() => {
    const sub = Array.isArray(round?.sub) ? round.sub : [];
    const map = {};
    for (const m of sub) map[Number(m.sid)] = m;
    return map;
  }, [round]);

  const board = (sid) => sections?.[String(sid)]?.Table?.[0] || {};
  const fallbackSingle = isWorli2 ? 9 : 9.5;
  const singleRate =
    Number(board(1).single) > 1 ? Number(board(1).single) : fallbackSingle;
  const multiRate =
    Number(board(1).multi) > 1 ? Number(board(1).multi) : singleRate;
  const spRate = (sid = 3) =>
    Number(board(sid).sp) > 1
      ? Number(board(sid).sp)
      : Number(board(2).sp) > 1
        ? Number(board(2).sp)
        : 140;
  const dpRate = (sid = 4) =>
    Number(board(sid).dp ?? board(sid).sp) > 1
      ? Number(board(sid).dp ?? board(sid).sp)
      : Number(board(2).dp) > 1
        ? Number(board(2).dp)
        : 240;
  const tpRate =
    Number(board(5).tp) > 1
      ? Number(board(5).tp)
      : Number(board(2).tp) > 1
        ? Number(board(2).tp)
        : 700;
  const jodiRate = Number(board(14).sp) > 1 ? Number(board(14).sp) : 95;

  const isSectionOpen = (sectionKey) => {
    if (isSuspended || isClosedBazaar) return false;
    const sid = SECTION_SID[sectionKey];
    const sec = sectionBySid[sid];
    if (!sec) return false;
    const st = String(sec.gstatus ?? sec.status ?? '').toUpperCase();
    return st === 'OPEN' || st === 'ACTIVE';
  };

  // Compute exact fair effective odds matching backend casinoEngine.getMatkaBetPricing
  const computeOdds = (sel) => {
    const [k, arg] = String(sel).split(':');
    if (k === 'single') {
      return ['line1', 'line2', 'odd', 'even'].includes(arg)
        ? round2(multiRate / 5)
        : singleRate;
    }
    if (k === 'jodi') return jodiRate;
    if (k === 'pana') {
      const uniq = new Set(String(arg).split('')).size;
      return uniq === 1 ? tpRate : uniq === 2 ? dpRate(2) : spRate(2);
    }
    if (k === 'sp') {
      const rate = spRate(3);
      if (arg === 'all') return round2(rate / ALL_SP.length);
      if (/^[0-9]$/.test(arg)) return round2(rate / 12);
      return rate;
    }
    if (k === 'dp') {
      const rate = dpRate(4);
      if (arg === 'all') return round2(rate / ALL_DP.length);
      if (/^[0-9]$/.test(arg)) return round2(rate / 9);
      return rate;
    }
    if (k === 'tp' || k === 'trio') {
      return arg === 'all' ? round2(tpRate / 10) : tpRate;
    }
    if (k === 'cycle') {
      const [d1, d2] = String(arg).split('');
      const cnt = d1 === d2 ? 10 : 10; // exact count: 10 panas for distinct or same pair
      const allPanas = [
        ...ALL_SP,
        ...ALL_DP,
        ...Array.from({ length: 10 }, (_, i) => `${i}${i}${i}`),
      ];
      const exactCnt = allPanas.filter((p) =>
        d1 === d2
          ? p.split('').filter((x) => x === d1).length >= 2
          : p.includes(d1) && p.includes(d2)
      ).length;
      return round2(spRate(6) / (exactCnt || cnt));
    }
    if (k === 'motor') {
      const n = String(arg).length;
      const combos = (n * (n - 1) * (n - 2)) / 6;
      return combos > 0 ? round2(spRate(7) / combos) : 0;
    }
    if (k === 'chart56') {
      const chart = ALL_SP.filter((p) => !p.includes('0') && !p.includes('1'));
      const cnt =
        arg === 'all'
          ? chart.length
          : chart.filter((p) => panaDigit(p) === Number(arg)).length;
      return cnt > 0 ? round2(spRate(8) / cnt) : 0;
    }
    if (k === 'chart64') {
      const chart = ALL_SP.filter((p) => p.includes('0') || p.includes('1'));
      const cnt =
        arg === 'all'
          ? chart.length
          : chart.filter((p) => panaDigit(p) === Number(arg)).length;
      return cnt > 0 ? round2(spRate(9) / cnt) : 0;
    }
    if (k === 'abr') {
      const cnt = abrCount(arg);
      return cnt > 0 ? round2(spRate(10) / cnt) : 0;
    }
    if (k === 'commonsp') return round2(spRate(11) / 36);
    if (k === 'commondp') return round2(dpRate(12) / 18);
    if (k === 'colordp') {
      const colored = ALL_DP.filter(isColorDp);
      const cnt =
        arg === 'all'
          ? colored.length
          : colored.filter((p) => panaDigit(p) === Number(arg)).length;
      return cnt > 0 ? round2(dpRate(13) / cnt) : 0;
    }
    return 0;
  };

  const submitSelection = (sel, label) => {
    const sectionKey = String(sel).split(':')[0];
    if (!isSectionOpen(sectionKey)) return;
    const odds = computeOdds(sel);
    if (!(odds > 1)) return;

    setSelectedBet({ sel, label, odds });

    // worli3 1-click coin betting (exact D247 @9753000)
    if (isWorli3) {
      if (coinTotal <= 0) {
        toast.error('Please select coin!!!');
        return;
      }
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
          toast.success(`Bet placed: ${label} @ ${odds}`);
          dispatch(getUser());
          dispatch(getMyCasinoBets(selectedGame));
          window.dispatchEvent(new Event('casino:bet-placed'));
        })
        .catch((err) => {
          toast.error(err?.message || String(err) || 'Bet failed');
        });
      return;
    }

    // worli & worli2: open DesktopBetSlip / MobileBetDrawer with live API odds
    openBetSlip(sel, odds, 'back', isMobile);
  };

  const handleCycleDigit = (d) => {
    if (!isSectionOpen('cycle')) return;
    const s = String(d);
    if (cycleDigits.length >= 2) return;
    const next = [...cycleDigits, s].sort();
    setCycleDigits(next);
    if (next.length === 2) {
      const arg = next.join('');
      const sel = `cycle:${arg}`;
      const label = `${arg} Cycle`;
      setSelectedBet({ sel, label, odds: computeOdds(sel) });
    }
  };

  const handleMotorDigit = (d) => {
    if (!isSectionOpen('motor')) return;
    const s = String(d);
    const next = motorDigits.includes(s)
      ? motorDigits.filter((x) => x !== s)
      : motorDigits.length < 9
        ? [...motorDigits, s].sort()
        : motorDigits;
    setMotorDigits(next);
    if (next.length >= 4) {
      const arg = next.join('');
      const sel = `motor:${arg}`;
      const label = `${arg} Motor`;
      setSelectedBet({ sel, label, odds: computeOdds(sel) });
    } else {
      setSelectedBet(null);
    }
  };

  const switchPane = (nextPane) => {
    setPane(nextPane);
    setCycleDigits([]);
    setMotorDigits([]);
    setSelectedBet(null);
  };

  const renderBox = ({
    key,
    label,
    subLabel,
    sel,
    customSelected,
    onCustomClick,
  }) => {
    const sectionKey = String(sel).split(':')[0];
    const open = isSectionOpen(sectionKey);
    const oddsVal = computeOdds(sel);
    const dead = !open || !(oddsVal > 1);
    const isSelected =
      customSelected !== undefined ? customSelected : selectedBet?.sel === sel;

    return (
      <div
        key={key}
        className={`worli-odd-box back ${isSelected ? 'selected' : ''} ${dead ? 'suspended-box' : ''}`}
        onClick={
          !dead
            ? () =>
                onCustomClick ? onCustomClick() : submitSelection(sel, label)
            : undefined
        }
        style={{ cursor: !dead ? 'pointer' : 'not-allowed' }}
        title={dead ? 'Suspended' : `Rate ${oddsVal}`}
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
        ...(!isClosedBazaar ? [{ id: 'jodi', name: 'Jodi' }] : []),
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
      {/* 1. matka-coins: 1-click chip bar (worli3 Matka Market only — exact D247, NO Calendar button) */}
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
              onClick={() => {
                setCoinTotal(0);
                setSelectedCoin(null);
              }}
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
                  selected={selectedCoin === c}
                  onClick={() => {
                    setSelectedCoin(c);
                    setCoinTotal((prev) => prev + c);
                  }}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 2. Pane tabs (vertical in worli3 .matka, horizontal in worli, hidden in worli2) */}
      {!isWorli2 && (
        <div className='nav nav-pills' role='tablist'>
          {PANES.map((p) => (
            <div className='nav-item' key={p.id}>
              <a
                role='tab'
                id={`worli-tabs-tab-${p.id}`}
                className={`nav-link ${activePane === p.id ? 'active' : ''}`}
                href='#'
                onClick={(e) => {
                  e.preventDefault();
                  switchPane(p.id);
                }}
              >
                {p.name}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* 3. Tab content (.casino-box.tab-content) */}
      <div className='casino-box tab-content w-100'>
        {/* Single Tab Pane */}
        {activePane === 'single' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-single'
            aria-labelledby='worli-tabs-tab-single'
            className='fade single tab-pane active show'
          >
            <div
              className={`worlibox ${!isSectionOpen('single') ? 'suspended-box' : ''}`}
            >
              <div className='worli-left'>
                <div className='worli-box-title'>
                  {isWorliRegular && <b>{singleRate}</b>}
                </div>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `single:${d}` })
                  )}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `single:${d}` })
                  )}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-title'>
                  {isWorliRegular && <b>{multiRate}</b>}
                </div>
                <div className='worli-box-row'>
                  {renderBox({
                    label: 'Line 1',
                    subLabel: '1|2|3|4|5',
                    sel: 'single:line1',
                  })}
                  {renderBox({
                    label: 'ODD',
                    subLabel: '1|3|5|7|9',
                    sel: 'single:odd',
                  })}
                </div>
                <div className='worli-box-row'>
                  {renderBox({
                    label: 'Line 2',
                    subLabel: '6|7|8|9|0',
                    sel: 'single:line2',
                  })}
                  {renderBox({
                    label: 'EVEN',
                    subLabel: '2|4|6|8|0',
                    sel: 'single:even',
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jodi Tab Pane (worli3 OPEN rounds only) */}
        {activePane === 'jodi' && isWorli3 && !isClosedBazaar && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-jodi'
            aria-labelledby='worli-tabs-tab-jodi'
            className='fade jodi tab-pane active show'
          >
            <div className='casino-table-full-box'>
              <div
                className={`worlibox ${!isSectionOpen('jodi') ? 'suspended-box' : ''}`}
              >
                <div className='worli-full'>
                  <div className='worli-box-title'>
                    <b>{jodiRate}</b>
                  </div>
                  {Array.from({ length: 10 }, (_, row) => (
                    <div className='worli-box-row' key={row}>
                      {Array.from({ length: 10 }, (_, col) => {
                        const label = `${row}-${col}`;
                        const sel = `jodi:${row}${col}`;
                        return renderBox({ key: label, label, sel });
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pana Tab Pane */}
        {activePane === 'pana' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-pana'
            aria-labelledby='worli-tabs-tab-pana'
            className='fade pana tab-pane active show'
          >
            <div
              className={`worlibox ${!isSectionOpen('pana') ? 'suspended-box' : ''}`}
            >
              <div className='worli-full'>
                <ul className='nav nav-pills'>
                  <li className='nav-item'>
                    <button
                      type='button'
                      className={`nav-link ${panaMode === 'sp' ? 'active' : ''}`}
                      onClick={() => setPanaMode('sp')}
                    >
                      SP PANA ({spRate(2)})
                    </button>
                  </li>
                  <li className='nav-item'>
                    <button
                      type='button'
                      className={`nav-link ${panaMode === 'dp' ? 'active' : ''}`}
                      onClick={() => setPanaMode('dp')}
                    >
                      DP PANA ({dpRate(2)})
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
                              (p) => {
                                const open = isSectionOpen('pana');
                                return (
                                  <div
                                    className={`worli-sub-odd-box back ${!open ? 'suspended-box' : ''}`}
                                    key={p}
                                    onClick={
                                      open
                                        ? () =>
                                            submitSelection(
                                              `pana:${p}`,
                                              `${p} Pana`
                                            )
                                        : undefined
                                    }
                                    style={{
                                      cursor: open ? 'pointer' : 'not-allowed',
                                    }}
                                    title={`Rate ${panaMode === 'sp' ? spRate(2) : dpRate(2)}`}
                                  >
                                    <span className='worli-odd'>{p}</span>
                                  </div>
                                );
                              }
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
        {activePane === 'sp' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-sp'
            aria-labelledby='worli-tabs-tab-sp'
            className='fade sp tab-pane active show'
          >
            <div
              className={`worlibox ${!isSectionOpen('sp') ? 'suspended-box' : ''}`}
            >
              <div className='worli-box-title'>
                <b>{spRate(3)}</b>
              </div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `sp:${d}` })
                  )}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `sp:${d}` })
                  )}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  {renderBox({ label: 'SP ALL', sel: 'sp:all' })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DP Tab Pane */}
        {activePane === 'dp' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-dp'
            aria-labelledby='worli-tabs-tab-dp'
            className='fade dp tab-pane active show'
          >
            <div
              className={`worlibox ${!isSectionOpen('dp') ? 'suspended-box' : ''}`}
            >
              <div className='worli-box-title'>
                <b>{dpRate(4)}</b>
              </div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `dp:${d}` })
                  )}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `dp:${d}` })
                  )}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  {renderBox({ label: 'DP ALL', sel: 'dp:all' })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trio Tab Pane */}
        {activePane === 'trio' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-trio'
            aria-labelledby='worli-tabs-tab-trio'
            className='fade trio tab-pane active show'
          >
            <div
              className={`worli-full ${!isSectionOpen('tp') ? 'suspended-box' : ''}`}
            >
              <div className='worli-box-title'>
                <b>{tpRate}</b>
              </div>
              <div className='worli-box-row'>
                {renderBox({ label: 'ALL TRIO', sel: 'tp:all' })}
              </div>
            </div>
          </div>
        )}

        {/* Cycle Tab Pane (pick 2 digits per D247 @2964000) */}
        {activePane === 'cycle' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-cycle'
            aria-labelledby='worli-tabs-tab-cycle'
            className='fade cycle tab-pane active show'
          >
            <div
              className={`worlibox ${!isSectionOpen('cycle') ? 'suspended-box' : ''}`}
            >
              <div className='worli-full'>
                <div className='worli-box-title'>
                  <b>
                    {spRate(6)}
                    {cycleDigits.length > 0
                      ? ` · Selected: ${cycleDigits.join('')}`
                      : ' (Select 2 digits)'}
                  </b>
                </div>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) =>
                    renderBox({
                      key: d,
                      label: String(d),
                      sel: 'cycle:12',
                      customSelected: cycleDigits.includes(String(d)),
                      onCustomClick: () => handleCycleDigit(d),
                    })
                  )}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) =>
                    renderBox({
                      key: d,
                      label: String(d),
                      sel: 'cycle:12',
                      customSelected: cycleDigits.includes(String(d)),
                      onCustomClick: () => handleCycleDigit(d),
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Motor SP Tab Pane (pick 4-9 digits per D247 @2964000) */}
        {activePane === 'motor' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-motor'
            aria-labelledby='worli-tabs-tab-motor'
            className='fade motor tab-pane active show'
          >
            <div
              className={`worlibox ${!isSectionOpen('motor') ? 'suspended-box' : ''}`}
            >
              <div className='worli-full'>
                <div className='worli-box-title'>
                  <b>
                    {spRate(7)}
                    {motorDigits.length > 0
                      ? ` · Selected: ${motorDigits.join('')}`
                      : ' (Select 4-9 digits)'}
                  </b>
                </div>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) =>
                    renderBox({
                      key: d,
                      label: String(d),
                      sel: 'motor:1234',
                      customSelected: motorDigits.includes(String(d)),
                      onCustomClick: () => handleMotorDigit(d),
                    })
                  )}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) =>
                    renderBox({
                      key: d,
                      label: String(d),
                      sel: 'motor:1234',
                      customSelected: motorDigits.includes(String(d)),
                      onCustomClick: () => handleMotorDigit(d),
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 56 Charts Tab Pane */}
        {activePane === 'chart56' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-chart56'
            aria-labelledby='worli-tabs-tab-chart56'
            className='fade chart56 tab-pane active show'
          >
            <div
              className={`worlibox ${!isSectionOpen('chart56') ? 'suspended-box' : ''}`}
            >
              <div className='worli-box-title'>
                <b>{spRate(8)}</b>
              </div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `chart56:${d}` })
                  )}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `chart56:${d}` })
                  )}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  {renderBox({ label: '56 ALL', sel: 'chart56:all' })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 64 Charts Tab Pane */}
        {activePane === 'chart64' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-chart64'
            aria-labelledby='worli-tabs-tab-chart64'
            className='fade chart64 tab-pane active show'
          >
            <div
              className={`worlibox ${!isSectionOpen('chart64') ? 'suspended-box' : ''}`}
            >
              <div className='worli-box-title'>
                <b>{spRate(9)}</b>
              </div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `chart64:${d}` })
                  )}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `chart64:${d}` })
                  )}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  {renderBox({ label: '64 ALL', sel: 'chart64:all' })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABR Tab Pane */}
        {activePane === 'abr' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-abr'
            aria-labelledby='worli-tabs-tab-abr'
            className='fade abr tab-pane active show'
          >
            <div
              className={`worlibox ${!isSectionOpen('abr') ? 'suspended-box' : ''}`}
            >
              <div className='worli-box-title'>
                <b>{spRate(10)}</b>
              </div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {renderBox({ label: 'A', sel: 'abr:a' })}
                  {renderBox({ label: 'B', sel: 'abr:b' })}
                  {renderBox({ label: 'R', sel: 'abr:r' })}
                </div>
                <div className='worli-box-row'>
                  {renderBox({ label: 'AB', sel: 'abr:ab' })}
                  {renderBox({ label: 'AR', sel: 'abr:ar' })}
                  {renderBox({ label: 'BR', sel: 'abr:br' })}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  {renderBox({ label: 'ABR', sel: 'abr:abr' })}
                </div>
                <div className='worli-box-row'>
                  {renderBox({ label: 'ABR CUT', sel: 'abr:abrcut' })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Common SP Tab Pane */}
        {activePane === 'commonsp' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-commonsp'
            aria-labelledby='worli-tabs-tab-commonsp'
            className='fade commonsp tab-pane active show'
          >
            <div
              className={`worli-full ${!isSectionOpen('commonsp') ? 'suspended-box' : ''}`}
            >
              <div className='worli-box-title'>
                <b>{spRate(11)}</b>
              </div>
              <div className='worli-box-row'>
                {[1, 2, 3, 4, 5].map((d) =>
                  renderBox({ key: d, label: String(d), sel: `commonsp:${d}` })
                )}
              </div>
              <div className='worli-box-row'>
                {[6, 7, 8, 9, 0].map((d) =>
                  renderBox({ key: d, label: String(d), sel: `commonsp:${d}` })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Common DP Tab Pane */}
        {activePane === 'commondp' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-commondp'
            aria-labelledby='worli-tabs-tab-commondp'
            className='fade commondp tab-pane active show'
          >
            <div
              className={`worli-full ${!isSectionOpen('commondp') ? 'suspended-box' : ''}`}
            >
              <div className='worli-box-title'>
                <b>{dpRate(12)}</b>
              </div>
              <div className='worli-box-row'>
                {[1, 2, 3, 4, 5].map((d) =>
                  renderBox({ key: d, label: String(d), sel: `commondp:${d}` })
                )}
              </div>
              <div className='worli-box-row'>
                {[6, 7, 8, 9, 0].map((d) =>
                  renderBox({ key: d, label: String(d), sel: `commondp:${d}` })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Color DP Tab Pane */}
        {activePane === 'colordp' && (
          <div
            role='tabpanel'
            id='worli-tabs-tabpane-colordp'
            aria-labelledby='worli-tabs-tab-colordp'
            className='fade colordp tab-pane active show'
          >
            <div
              className={`worlibox ${!isSectionOpen('colordp') ? 'suspended-box' : ''}`}
            >
              <div className='worli-box-title'>
                <b>{dpRate(13)}</b>
              </div>
              <div className='worli-left'>
                <div className='worli-box-row'>
                  {[1, 2, 3, 4, 5].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `colordp:${d}` })
                  )}
                </div>
                <div className='worli-box-row'>
                  {[6, 7, 8, 9, 0].map((d) =>
                    renderBox({ key: d, label: String(d), sel: `colordp:${d}` })
                  )}
                </div>
              </div>
              <div className='worli-right'>
                <div className='worli-box-row'>
                  {renderBox({ label: 'COLOR DP ALL', sel: 'colordp:all' })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Action / Clear Bar for Cycle & Motor multi-digit builders */}
      {(activePane === 'cycle' || activePane === 'motor') &&
        (cycleDigits.length > 0 || motorDigits.length > 0) && (
          <div className='worli-clear-box container-fluid mt-2'>
            <div className='row row5 align-items-center'>
              <div className='col-6 text-center'>
                <span className='worli-place-card'>
                  {selectedBet?.label ||
                    (activePane === 'cycle'
                      ? `${cycleDigits.join('')} Cycle`
                      : `${motorDigits.join('')} Motor`)}
                </span>
              </div>
              <div className='col-6 pe-3 text-end'>
                <button
                  type='button'
                  className='btn btn-danger btn-sm me-1'
                  onClick={() => {
                    setCycleDigits([]);
                    setMotorDigits([]);
                    setSelectedBet(null);
                  }}
                >
                  Clear
                </button>
                <button
                  type='button'
                  className='btn btn-success btn-sm'
                  disabled={!selectedBet}
                  onClick={() => {
                    if (!selectedBet) return;
                    submitSelection(selectedBet.sel, selectedBet.label);
                    setCycleDigits([]);
                    setMotorDigits([]);
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

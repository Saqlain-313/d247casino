import { useState } from 'react';
import { normalizeSelection, useCasino } from '../../../context/CasinoContext';
import { formatInlineCard, NationBook } from './shared';

const isOpenEntry = (entry, isSuspended) => {
  if (isSuspended || !entry) return false;
  const gs = String(entry.gstatus ?? entry.status ?? '').toUpperCase();
  return ['OPEN', 'ACTIVE'].includes(gs);
};

const getBySidOrNat = (markets, sid, nat) =>
  markets?.[`sid:${sid}`] || markets?.[normalizeSelection(nat)] || null;

const getLiveRate = (entry, side, isSuspended) => {
  if (!isOpenEntry(entry, isSuspended)) return 0;
  const v = Number(
    side === 'lay' ? (entry.lay ?? entry.l) : (entry.back ?? entry.b)
  );
  return Number.isFinite(v) && v > 1 ? v : 0;
};

/* ==========================================================================
   1. 1-DAY POKER (poker) — Exact D247 rendered.html DOM
   Live API: 1:Player A (Back+Lay), 2:Player B (Back+Lay),
             3:Player A 2 card Bonus, 4:Player A 7 card bonus,
             5:Player B 2 card Bonus, 6:Player B 7 card bonus
   ========================================================================== */
function TablePoker({ isMobile, isSuspended, openBetSlip, markets }) {
  const players = [
    { name: 'Player A', sid: 1, b2: 3, b7: 4, bookId: 'playerA', code: 'A' },
    { name: 'Player B', sid: 2, b2: 5, b7: 6, bookId: 'playerB', code: 'B' },
  ];

  const renderMainSide = (p) => {
    const entry = getBySidOrNat(markets, p.sid, p.name);
    const backOdds = getLiveRate(entry, 'back', isSuspended);
    const layOdds = getLiveRate(entry, 'lay', isSuspended);
    return (
      <div className='casino-table-body'>
        <div className='casino-table-row'>
          <div className='casino-nation-detail'>
            <div className='casino-nation-name'>{p.name}</div>
            <NationBook id={p.bookId} />
          </div>
          <div
            className={`casino-odds-box back ${!backOdds ? 'suspended-box' : ''}`}
            style={{ cursor: backOdds ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              backOdds && openBetSlip(String(p.sid), backOdds, 'back', isMobile)
            }
          >
            <span className='casino-odds'>{backOdds || '0'}</span>
          </div>
          <div
            className={`casino-odds-box lay ${!layOdds ? 'suspended-box' : ''}`}
            style={{ cursor: layOdds ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              layOdds && openBetSlip(String(p.sid), layOdds, 'lay', isMobile)
            }
          >
            <span className='casino-odds'>{layOdds || '0'}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBonusSide = (p) => {
    const r2 = getLiveRate(markets?.[`sid:${p.b2}`], 'back', isSuspended);
    const r7 = getLiveRate(markets?.[`sid:${p.b7}`], 'back', isSuspended);
    return (
      <>
        <div className='d-xl-none mobile-nation-name w-100'>{p.name}</div>
        <div
          className={`casino-odds-box back ${!r2 ? 'suspended-box' : ''}`}
          style={{ cursor: r2 ? 'pointer' : 'not-allowed' }}
          onClick={() => r2 && openBetSlip(String(p.b2), r2, 'back', isMobile)}
        >
          <span className='casino-odds'>2 Cards Bonus</span>
          <NationBook id={`bonus2:${p.code}`} />
        </div>
        <div
          className={`casino-odds-box back ${!r7 ? 'suspended-box' : ''}`}
          style={{ cursor: r7 ? 'pointer' : 'not-allowed' }}
          onClick={() => r7 && openBetSlip(String(p.b7), r7, 'back', isMobile)}
        >
          <span className='casino-odds'>7 Cards Bonus</span>
          <NationBook id={`bonus7:${p.code}`} />
        </div>
      </>
    );
  };

  return (
    <div className='casino-table poker1day'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          {renderMainSide(players[0])}
        </div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>
          {renderMainSide(players[1])}
        </div>
      </div>

      <div className='poker1day-other-odds mt-2'>
        <div className='casino-table-left-box'>
          {renderBonusSide(players[0])}
        </div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>
          {renderBonusSide(players[1])}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. 20-20 POKER (poker20) — Exact D247 rendered.html DOM
   Live API: sid 11..19 (Player A), sid 21..29 (Player B) — DUPLICATE nats!
   ========================================================================== */
const POKER20_HANDS = [
  { offset: 0, label: 'Winner', key: (w) => `winner:${w}` },
  { offset: 1, label: 'One Pair', key: (w) => `hand:${w}:onepair` },
  { offset: 2, label: 'Two Pair', key: (w) => `hand:${w}:twopair` },
  { offset: 3, label: 'Three of a Kind', key: (w) => `hand:${w}:threeofakind` },
  { offset: 4, label: 'Straight', key: (w) => `hand:${w}:straight` },
  { offset: 5, label: 'Flush', key: (w) => `hand:${w}:flush` },
  { offset: 6, label: 'Full House', key: (w) => `hand:${w}:fullhouse` },
  { offset: 7, label: 'Four of a Kind', key: (w) => `hand:${w}:fourofakind` },
  { offset: 8, label: 'Straight Flush', key: (w) => `hand:${w}:straightflush` },
];

function TablePoker20({ isMobile, isSuspended, openBetSlip, markets }) {
  const renderPlayerGrid = (title, code, baseSid) => (
    <>
      <div className='d-xl-none mobile-nation-name w-100'>{title}</div>
      {POKER20_HANDS.map((h) => {
        const sid = baseSid + h.offset;
        const rate = getLiveRate(markets?.[`sid:${sid}`], 'back', isSuspended);
        return (
          <div className='casino-odds-box-container' key={sid}>
            <div className='casino-nation-name text-center'>{h.label}</div>
            <div
              className={`casino-odds-box back ${!rate ? 'suspended-box' : ''}`}
              style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                rate && openBetSlip(String(sid), rate, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{rate || '0'}</span>
            </div>
            <NationBook id={h.key(code)} />
          </div>
        );
      })}
    </>
  );

  return (
    <div className='casino-table poker20'>
      <div className='poker20-other-odds'>
        <div className='casino-table-box'>
          <div className='casino-table-left-box'>
            {renderPlayerGrid('Player A', 'A', 11)}
          </div>
          <div className='casino-table-box-divider' />
          <div className='casino-table-right-box'>
            {renderPlayerGrid('Player B', 'B', 21)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. 6-PLAYER POKER (poker6) — Exact D247 rendered.html DOM
   Live API: sid 11..16 (Player 1..6), sid 21..29 (High Card..Straight Flush),
             card = 17 cards (P1..P6 hole cards = indices 0..11, board = 12..16)
   ========================================================================== */
const POKER6_PATTERNS = [
  { sid: 21, label: 'High Card', key: 'pattern:highcard' },
  { sid: 22, label: 'Pair', key: 'pattern:pair' },
  { sid: 23, label: 'Two Pair', key: 'pattern:twopair' },
  { sid: 24, label: 'Three of a Kind', key: 'pattern:threeofakind' },
  { sid: 25, label: 'Straight', key: 'pattern:straight' },
  { sid: 26, label: 'Flush', key: 'pattern:flush' },
  { sid: 27, label: 'Full House', key: 'pattern:fullhouse' },
  { sid: 28, label: 'Four of a Kind', key: 'pattern:fourofakind' },
  { sid: 29, label: 'Straight Flush', key: 'pattern:straightflush' },
];

function TablePoker6({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();
  const [activeTab, setActiveTab] = useState('hands');
  const rawCards = String(roundData?.card || '')
    .split(',')
    .map((x) => x.trim());

  return (
    <div className='casino-table poker6player'>
      <ul className='nav nav-pills mb-1' role='tablist'>
        <li className='nav-item' role='presentation'>
          <button
            type='button'
            role='tab'
            aria-selected={activeTab === 'hands'}
            className={`nav-link ${activeTab === 'hands' ? 'active' : ''}`}
            onClick={() => setActiveTab('hands')}
          >
            Hands
          </button>
        </li>
        <li className='nav-item' role='presentation'>
          <button
            type='button'
            role='tab'
            aria-selected={activeTab === 'pattern'}
            className={`nav-link ${activeTab === 'pattern' ? 'active' : ''}`}
            onClick={() => setActiveTab('pattern')}
          >
            Pattern
          </button>
        </li>
      </ul>

      <div className='tab-content'>
        {activeTab === 'hands' && (
          <div className='hands tab-pane active show'>
            <div className='row row5'>
              {[1, 2, 3, 4, 5, 6].map((pNum) => {
                const sid = 10 + pNum;
                const rate = getLiveRate(
                  markets?.[`sid:${sid}`],
                  'back',
                  isSuspended
                );
                const c1 = formatInlineCard(rawCards[(pNum - 1) * 2]);
                const c2 = formatInlineCard(rawCards[(pNum - 1) * 2 + 1]);
                return (
                  <div className='col-md-6 mb-1' key={sid}>
                    <div
                      className={`casino-odds-box back ${!rate ? 'suspended-box' : ''}`}
                      style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                      onClick={() =>
                        rate && openBetSlip(String(sid), rate, 'back', isMobile)
                      }
                    >
                      <div className='casino-nation-name'>
                        Player {pNum}
                        {(c1 || c2) && (
                          <div className='patern-name ms-3 inline-flex gap-1.5 rounded bg-white/80 px-1.5 py-0.5 text-xs font-bold'>
                            {c1 && (
                              <span className={c1.cls}>
                                {c1.rank}
                                {c1.sym}
                              </span>
                            )}
                            {c2 && (
                              <span className={c2.cls}>
                                {c2.rank}
                                {c2.sym}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className='casino-odds'>{rate || '0'}</span>
                      </div>
                    </div>
                    <NationBook id={`player:${pNum}`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'pattern' && (
          <div className='pattern tab-pane active show'>
            <div className='row row5'>
              {POKER6_PATTERNS.map((pt) => {
                const rate = getLiveRate(
                  markets?.[`sid:${pt.sid}`],
                  'back',
                  isSuspended
                );
                return (
                  <div className='col-md-4 col-6 mb-1' key={pt.sid}>
                    <div
                      className={`casino-odds-box back ${!rate ? 'suspended-box' : ''}`}
                      style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                      onClick={() =>
                        rate &&
                        openBetSlip(String(pt.sid), rate, 'back', isMobile)
                      }
                    >
                      <div className='casino-nation-name'>{pt.label}</div>
                      <div>
                        <span className='casino-odds'>{rate || '0'}</span>
                      </div>
                    </div>
                    <NationBook id={pt.key} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   4. 32 CARDS A & PREMIUM (card32, pcard32) — Exact D247 rendered.html DOM
   Live API: 1:Player 8, 2:Player 9, 3:Player 10, 4:Player 11 (Back+Lay)
   ========================================================================== */
function TableCard32({ isMobile, isSuspended, openBetSlip, markets }) {
  const left = [
    { sid: 1, label: 'Player 8', bookId: 'player8' },
    { sid: 2, label: 'Player 9', bookId: 'player9' },
  ];
  const right = [
    { sid: 3, label: 'Player 10', bookId: 'player10' },
    { sid: 4, label: 'Player 11', bookId: 'player11' },
  ];

  const renderHalf = (list, hideHeaderMobile = false) => (
    <>
      <div
        className={`casino-table-header ${hideHeaderMobile ? 'd-none d-md-flex' : ''}`}
      >
        <div className='casino-nation-detail' />
        <div className='casino-odds-box back'>Back</div>
        <div className='casino-odds-box lay'>Lay</div>
      </div>
      <div className='casino-table-body'>
        {list.map((p) => {
          const entry = getBySidOrNat(markets, p.sid, p.label);
          const backOdds = getLiveRate(entry, 'back', isSuspended);
          const layOdds = getLiveRate(entry, 'lay', isSuspended);
          return (
            <div className='casino-table-row' key={p.sid}>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>{p.label}</div>
                <NationBook id={p.bookId} />
              </div>
              <div
                className={`casino-odds-box back ${!backOdds ? 'suspended-box' : ''}`}
                style={{ cursor: backOdds ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  backOdds &&
                  openBetSlip(String(p.sid), backOdds, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{backOdds || '0'}</span>
              </div>
              <div
                className={`casino-odds-box lay ${!layOdds ? 'suspended-box' : ''}`}
                style={{ cursor: layOdds ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  layOdds &&
                  openBetSlip(String(p.sid), layOdds, 'lay', isMobile)
                }
              >
                <span className='casino-odds'>{layOdds || '0'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className='casino-table cards32a'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>{renderHalf(left, false)}</div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>{renderHalf(right, true)}</div>
      </div>
    </div>
  );
}

/* ==========================================================================
   5. 32 CARDS B (card32eu) — Exact D247 27-sub Layout
   Live API: 1..4 Players (B+L), 5..12 Odd/Even, 13..14 Any 3 Black/Red (B+L),
             15..24 Single 1..9,0, 25:8 & 9 Total, 26:10 & 11 Total,
             27:Two Black Two Red (B+L)
   ========================================================================== */
const CARD32EU_PLAYERS = [
  { sid: 1, p: 8, oddSid: 5, evenSid: 6 },
  { sid: 2, p: 9, oddSid: 7, evenSid: 8 },
  { sid: 3, p: 10, oddSid: 9, evenSid: 10 },
  { sid: 4, p: 11, oddSid: 11, evenSid: 12 },
];

const CARD32EU_PATTERNS = [
  { sid: 13, label: 'Any Three Card Black', bookId: 'any3black' },
  { sid: 14, label: 'Any Three Card Red', bookId: 'any3red' },
  { sid: 27, label: 'Two Black Two Red', bookId: 'twoblacktwored' },
];

const CARD32EU_SINGLES = [
  { sid: 15, digit: '1' },
  { sid: 16, digit: '2' },
  { sid: 17, digit: '3' },
  { sid: 18, digit: '4' },
  { sid: 19, digit: '5' },
  { sid: 20, digit: '6' },
  { sid: 21, digit: '7' },
  { sid: 22, digit: '8' },
  { sid: 23, digit: '9' },
  { sid: 24, digit: '0' },
];

function TableCard32eu({ isMobile, isSuspended, openBetSlip, markets }) {
  const singleRate = getLiveRate(markets?.['sid:15'], 'back', isSuspended);

  return (
    <div className='casino-table cards32b'>
      {/* Row 1: Players Back/Lay | Odd/Even */}
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            {CARD32EU_PLAYERS.map((pl) => {
              const entry = markets?.[`sid:${pl.sid}`];
              const b = getLiveRate(entry, 'back', isSuspended);
              const l = getLiveRate(entry, 'lay', isSuspended);
              return (
                <div className='casino-table-row' key={pl.sid}>
                  <div className='casino-nation-detail'>
                    <div className='casino-nation-name'>Player {pl.p}</div>
                    <NationBook id={`player${pl.p}`} />
                  </div>
                  <div
                    className={`casino-odds-box back ${!b ? 'suspended-box' : ''}`}
                    style={{ cursor: b ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      b && openBetSlip(String(pl.sid), b, 'back', isMobile)
                    }
                  >
                    <span className='casino-odds'>{b || '0'}</span>
                  </div>
                  <div
                    className={`casino-odds-box lay ${!l ? 'suspended-box' : ''}`}
                    style={{ cursor: l ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      l && openBetSlip(String(pl.sid), l, 'lay', isMobile)
                    }
                  >
                    <span className='casino-odds'>{l || '0'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='casino-table-box-divider' />

        <div className='casino-table-right-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Odd</div>
            <div className='casino-odds-box back'>Even</div>
          </div>
          <div className='casino-table-body'>
            {CARD32EU_PLAYERS.map((pl) => {
              const oddR = getLiveRate(
                markets?.[`sid:${pl.oddSid}`],
                'back',
                isSuspended
              );
              const evenR = getLiveRate(
                markets?.[`sid:${pl.evenSid}`],
                'back',
                isSuspended
              );
              return (
                <div className='casino-table-row' key={pl.p}>
                  <div className='casino-nation-detail'>
                    <div className='casino-nation-name'>Player {pl.p}</div>
                  </div>
                  <div
                    className={`casino-odds-box back ${!oddR ? 'suspended-box' : ''}`}
                    style={{ cursor: oddR ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      oddR &&
                      openBetSlip(String(pl.oddSid), oddR, 'back', isMobile)
                    }
                  >
                    <span className='casino-odds'>{oddR || '0'}</span>
                    <NationBook id={`parity:${pl.p}:odd`} />
                  </div>
                  <div
                    className={`casino-odds-box back ${!evenR ? 'suspended-box' : ''}`}
                    style={{ cursor: evenR ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      evenR &&
                      openBetSlip(String(pl.evenSid), evenR, 'back', isMobile)
                    }
                  >
                    <span className='casino-odds'>{evenR || '0'}</span>
                    <NationBook id={`parity:${pl.p}:even`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Color patterns Back/Lay | 8&9 / 10&11 Totals */}
      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            {CARD32EU_PATTERNS.map((pt) => {
              const entry = markets?.[`sid:${pt.sid}`];
              const b = getLiveRate(entry, 'back', isSuspended);
              const l = getLiveRate(entry, 'lay', isSuspended);
              return (
                <div className='casino-table-row' key={pt.sid}>
                  <div className='casino-nation-detail'>
                    <div className='casino-nation-name'>{pt.label}</div>
                    <NationBook id={pt.bookId} />
                  </div>
                  <div
                    className={`casino-odds-box back ${!b ? 'suspended-box' : ''}`}
                    style={{ cursor: b ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      b && openBetSlip(String(pt.sid), b, 'back', isMobile)
                    }
                  >
                    <span className='casino-odds'>{b || '0'}</span>
                  </div>
                  <div
                    className={`casino-odds-box lay ${!l ? 'suspended-box' : ''}`}
                    style={{ cursor: l ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      l && openBetSlip(String(pt.sid), l, 'lay', isMobile)
                    }
                  >
                    <span className='casino-odds'>{l || '0'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='casino-table-box-divider' />

        <div className='casino-table-right-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Back</div>
          </div>
          <div className='casino-table-body'>
            {[
              { sid: 25, label: '8 & 9 Total', bookId: 'total89' },
              { sid: 26, label: '10 & 11 Total', bookId: 'total1011' },
            ].map((tot) => {
              const r = getLiveRate(
                markets?.[`sid:${tot.sid}`],
                'back',
                isSuspended
              );
              return (
                <div className='casino-table-row' key={tot.sid}>
                  <div className='casino-nation-detail'>
                    <div className='casino-nation-name'>{tot.label}</div>
                    <NationBook id={tot.bookId} />
                  </div>
                  <div
                    className={`casino-odds-box back ${!r ? 'suspended-box' : ''}`}
                    style={{ cursor: r ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      r && openBetSlip(String(tot.sid), r, 'back', isMobile)
                    }
                  >
                    <span className='casino-odds'>{r || '0'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Single 1..9, 0 */}
      <div className='casino-table-full-box cards32bnumbers mt-3'>
        <div className='casino-odds mb-1 w-100 text-center'>
          {singleRate || '0'}
        </div>
        <div className='grid w-full grid-cols-5 gap-1'>
          {CARD32EU_SINGLES.map((item) => {
            const r = getLiveRate(
              markets?.[`sid:${item.sid}`],
              'back',
              isSuspended
            );
            return (
              <div
                key={item.sid}
                className={`casino-odds-box back ${!r ? 'suspended-box' : ''}`}
                style={{ cursor: r ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  r && openBetSlip(String(item.sid), r, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{item.digit}</span>
                <NationBook id={`single:${item.digit}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   6. 3 CARDS JUDGEMENT (3cardj) — Exact D247 3-Card Picker on Yes / No
   Live API: 1:Yes (b=1.78), 2:No (b=1.84)
   ========================================================================== */
const J3_CARDS = Array.from({ length: 13 }, (_, i) => ({
  rank: i + 1,
  label: { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[i + 1] || String(i + 1),
}));

function Table3cardj({ isMobile, isSuspended, openBetSlip, markets }) {
  const [yesPicks, setYesPicks] = useState([]);
  const [noPicks, setNoPicks] = useState([]);

  const yesRate = getLiveRate(
    getBySidOrNat(markets, 1, 'Yes'),
    'back',
    isSuspended
  );
  const noRate = getLiveRate(
    getBySidOrNat(markets, 2, 'No'),
    'back',
    isSuspended
  );

  const togglePick = (mode, rank) => {
    const rate = mode === 'yes' ? yesRate : noRate;
    if (!rate) return;
    const cur = mode === 'yes' ? yesPicks : noPicks;
    const setter = mode === 'yes' ? setYesPicks : setNoPicks;
    if (cur.includes(rank)) {
      setter(cur.filter((r) => r !== rank));
      return;
    }
    const next = [...cur, rank];
    if (next.length === 3) {
      openBetSlip(`3cj:${mode}:${next.join('-')}`, rate, 'back', isMobile);
      setter([]);
    } else {
      setter(next);
    }
  };

  const rows = [
    {
      mode: 'yes',
      title: 'Yes',
      boxCls: 'back',
      rate: yesRate,
      picks: yesPicks,
    },
    { mode: 'no', title: 'No', boxCls: 'lay', rate: noRate, picks: noPicks },
  ];

  return (
    <div className='casino-table threecardj'>
      {rows.map((row) => (
        <div
          key={row.mode}
          className={`threecardjbox ${row.boxCls} ${!row.rate ? 'suspended-box' : ''}`}
        >
          <div className='threecard-title'>
            {row.title}
            <div className='casino-odds'>
              {row.picks.length ? `${row.picks.length}/3` : ''}
            </div>
          </div>
          <div className='threecardj-cards'>
            <h4 className='mb-2 w-100 text-center'>
              <b>{row.rate || '0'}</b>
            </h4>
            {J3_CARDS.map((c) => {
              const selected = row.picks.includes(c.rank);
              return (
                <div className='card-odd-box' key={c.rank}>
                  <div
                    className={selected ? 'rounded ring-2 ring-yellow-400' : ''}
                    style={{ cursor: row.rate ? 'pointer' : 'not-allowed' }}
                    onClick={() => togglePick(row.mode, c.rank)}
                  >
                    <img
                      src={`/assets/img/andar-bahar-cards/${c.rank}.jpg`}
                      alt={c.label}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   7. QUEEN (queen) — Exact D247 rendered.html DOM
   Live API: 1:Total 0, 2:Total 1, 3:Total 2, 4:Total 3 (Back + Lay)
   ========================================================================== */
const QUEEN_TOTALS = [
  { sid: 1, label: 'Total 0', bookId: 'total0' },
  { sid: 2, label: 'Total 1', bookId: 'total1' },
  { sid: 3, label: 'Total 2', bookId: 'total2' },
  { sid: 4, label: 'Total 3', bookId: 'total3' },
];

function TableQueen({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();

  return (
    <div className='casino-table queen'>
      <div className='casino-table-box'>
        {QUEEN_TOTALS.map((item) => {
          const entry = getBySidOrNat(markets, item.sid, item.label);
          const backOdds = getLiveRate(entry, 'back', isSuspended);
          const layOdds = getLiveRate(entry, 'lay', isSuspended);
          return (
            <div className='casino-odd-box-container' key={item.sid}>
              <div className='casino-nation-name'>{item.label}</div>
              <div
                className={`casino-odds-box back ${!backOdds ? 'suspended-box' : ''}`}
                style={{ cursor: backOdds ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  backOdds &&
                  openBetSlip(String(item.sid), backOdds, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{backOdds || '0'}</span>
              </div>
              <div
                className={`casino-odds-box lay ${!layOdds ? 'suspended-box' : ''}`}
                style={{ cursor: layOdds ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  layOdds &&
                  openBetSlip(String(item.sid), layOdds, 'lay', isMobile)
                }
              >
                <span className='casino-odds'>{layOdds || '0'}</span>
              </div>
              <NationBook id={item.bookId} />
            </div>
          );
        })}
      </div>
      {roundData?.remark ? (
        <div className='casino-remark mt-1'>
          <marquee scrollAmount='3'>{roundData.remark}</marquee>
        </div>
      ) : null}
    </div>
  );
}

/* ==========================================================================
   8. THE TRAP (trap) — Exact D247 rendered.html DOM
   Live API: 1:Player A (B+L), 2:Player B (B+L),
             3..16:Card 1..14 (st=highlow, nested High/Low),
             17..30:Card 1..14 (st=jqk, nested JQK B+L)
   ========================================================================== */
function TableTrap({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  const activeHL =
    subs.find(
      (s) =>
        String(s.subtype).toLowerCase() === 'highlow' &&
        isOpenEntry(s, isSuspended)
    ) || subs.find((s) => String(s.subtype).toLowerCase() === 'highlow');
  const activeJQK =
    subs.find(
      (s) =>
        String(s.subtype).toLowerCase() === 'jqk' && isOpenEntry(s, isSuspended)
    ) || subs.find((s) => String(s.subtype).toLowerCase() === 'jqk');

  const hlOpen = isOpenEntry(activeHL, isSuspended);
  const lowChild = activeHL?.odds?.find(
    (o) => String(o?.nat || '').toLowerCase() === 'low'
  );
  const highChild = activeHL?.odds?.find(
    (o) => String(o?.nat || '').toLowerCase() === 'high'
  );
  const lowRate = hlOpen && Number(lowChild?.b) > 1 ? Number(lowChild.b) : 0;
  const highRate = hlOpen && Number(highChild?.b) > 1 ? Number(highChild.b) : 0;

  const jqkOpen = isOpenEntry(activeJQK, isSuspended);
  const jqkChild = activeJQK?.odds?.[0];
  const jqkBack = jqkOpen && Number(jqkChild?.b) > 1 ? Number(jqkChild.b) : 0;
  const jqkLay = jqkOpen && Number(jqkChild?.l) > 1 ? Number(jqkChild.l) : 0;

  const renderPlayer = (sid, label, bookId) => {
    const entry = getBySidOrNat(markets, sid, label);
    const b = getLiveRate(entry, 'back', isSuspended);
    const l = getLiveRate(entry, 'lay', isSuspended);
    return (
      <div className='casino-table-body'>
        <div className='casino-table-row'>
          <div className='casino-nation-detail'>
            <div className='casino-nation-name'>{label}</div>
            <NationBook id={bookId} />
          </div>
          <div
            className={`casino-odds-box back ${!b ? 'suspended-box' : ''}`}
            style={{ cursor: b ? 'pointer' : 'not-allowed' }}
            onClick={() => b && openBetSlip(String(sid), b, 'back', isMobile)}
          >
            <span className='casino-odds'>{b || '0'}</span>
          </div>
          <div
            className={`casino-odds-box lay ${!l ? 'suspended-box' : ''}`}
            style={{ cursor: l ? 'pointer' : 'not-allowed' }}
            onClick={() => l && openBetSlip(String(sid), l, 'lay', isMobile)}
          >
            <span className='casino-odds'>{l || '0'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='casino-table trap'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          {renderPlayer(1, 'Player A', 'playerA')}
        </div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>
          {renderPlayer(2, 'Player B', 'playerB')}
        </div>
      </div>

      <div className='casino-table-box sevenupbox mt-3'>
        <div className='casino-table-left-box'>
          <div className='seven-up-down-box'>
            <div
              className={`up-box ${!lowRate ? 'suspended-box' : ''}`}
              style={{ cursor: lowRate ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                lowRate &&
                activeHL &&
                openBetSlip(`${activeHL.sid}:low`, lowRate, 'back', isMobile)
              }
            >
              <div className='up-down-book' />
              <div className='text-end'>
                <div className='up-down-odds'>{lowRate || '0'}</div>
                <span>Low {activeHL?.nat ? `(${activeHL.nat})` : ''}</span>
              </div>
            </div>
            <div
              className={`down-box ${!highRate ? 'suspended-box' : ''}`}
              style={{ cursor: highRate ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                highRate &&
                activeHL &&
                openBetSlip(`${activeHL.sid}:high`, highRate, 'back', isMobile)
              }
            >
              <div className='up-down-book' />
              <div className='text-start'>
                <div className='up-down-odds'>{highRate || '0'}</div>
                <span>High</span>
              </div>
            </div>
            <div className='seven-box'>
              <img src='/assets/img/trape-seven.png' alt='7' />
            </div>
          </div>
        </div>

        <div className='casino-table-box-divider' />

        <div className='casino-table-right-box'>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>
                  <img src='/assets/img/cards/J.png' alt='J' />
                  <img src='/assets/img/cards/Q.png' alt='Q' />
                  <img src='/assets/img/cards/K.png' alt='K' />
                </div>
              </div>
              <div
                className={`casino-odds-box back ${!jqkBack ? 'suspended-box' : ''}`}
                style={{ cursor: jqkBack ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  jqkBack &&
                  activeJQK &&
                  openBetSlip(`${activeJQK.sid}:jqk`, jqkBack, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{jqkBack || '0'}</span>
              </div>
              <div
                className={`casino-odds-box lay ${!jqkLay ? 'suspended-box' : ''}`}
                style={{ cursor: jqkLay ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  jqkLay &&
                  activeJQK &&
                  openBetSlip(`${activeJQK.sid}:jqk`, jqkLay, 'lay', isMobile)
                }
              >
                <span className='casino-odds'>{jqkLay || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {roundData?.remark ? (
        <div className='casino-remark mt-3'>
          <marquee scrollAmount='3'>{roundData.remark}</marquee>
        </div>
      ) : null}
    </div>
  );
}

/* ==========================================================================
   9. NOTE NUMBER (notenum) — Exact D247 Live Sub & Nested Card Layout
   Live API: subtype odd/even/black/red/low/high (B+L), bacc (37/38),
             card (nested 10 cards A..10)
   ========================================================================== */
const NOTENUM_PAIRS = [
  ['odd', 'even'],
  ['black', 'red'],
  ['low', 'high'],
];

function TableNotenum({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const bySt = (st) =>
    subs.find((s) => String(s?.subtype || '').toLowerCase() === st);
  const baccSubs = subs.filter(
    (s) => String(s?.subtype || '').toLowerCase() === 'bacc'
  );
  const cardSub = bySt('card');
  const cardSubOpen = isOpenEntry(cardSub, isSuspended);

  return (
    <div className='casino-table notenum'>
      <div className='casino-table-box'>
        {NOTENUM_PAIRS.map(([leftSt, rightSt]) => (
          <div className='casino-odd-box-container-box' key={leftSt}>
            {[leftSt, rightSt].map((st) => {
              const item = bySt(st);
              const b = getLiveRate(item, 'back', isSuspended);
              const l = getLiveRate(item, 'lay', isSuspended);
              return (
                <div className='casino-odd-box-container' key={st}>
                  <div className='casino-nation-name'>
                    <span className='me-2'>
                      {item?.nat || st.toUpperCase()}
                    </span>
                  </div>
                  <div
                    className={`casino-odds-box back ${!b ? 'suspended-box' : ''}`}
                    style={{ cursor: b ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      b &&
                      item &&
                      openBetSlip(String(item.sid), b, 'back', isMobile)
                    }
                  >
                    <span className='casino-odds'>{b || '0'}</span>
                  </div>
                  <div
                    className={`casino-odds-box lay ${!l ? 'suspended-box' : ''}`}
                    style={{ cursor: l ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      l &&
                      item &&
                      openBetSlip(String(item.sid), l, 'lay', isMobile)
                    }
                  >
                    <span className='casino-odds'>{l || '0'}</span>
                  </div>
                  <NationBook id={normalizeSelection(item?.nat || st)} />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {baccSubs.length > 0 && (
        <div className='casino-table-box mt-3'>
          {baccSubs.map((item) => {
            const b = getLiveRate(item, 'back', isSuspended);
            const bookId = String(item.sid) === '37' ? 'bacc1' : 'bacc2';
            return (
              <div className='casino-odd-box-container' key={item.sid}>
                <div className='casino-nation-name'>{item.nat}</div>
                <div
                  className={`casino-odds-box back ${!b ? 'suspended-box' : ''}`}
                  style={{ cursor: b ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    b && openBetSlip(String(item.sid), b, 'back', isMobile)
                  }
                >
                  <span className='casino-odds'>{b || '0'}</span>
                </div>
                <NationBook id={bookId} />
              </div>
            );
          })}
        </div>
      )}

      {cardSub && Array.isArray(cardSub.odds) && (
        <div className='casino-table-full-box lucky7acards mt-3'>
          <div className='casino-odds mb-1 w-100 text-center'>
            {cardSub.nat} ({cardSubOpen ? Number(cardSub.odds[0]?.b || 0) : 0})
          </div>
          {cardSub.odds.map((o) => {
            const rank = Number(o.ssid ?? o.sno);
            const img = rank === 1 ? 'A' : String(rank);
            const r = cardSubOpen && Number(o.b) > 1 ? Number(o.b) : 0;
            return (
              <div className='card-odd-box' key={rank}>
                <div
                  className={!r ? 'suspended-box' : ''}
                  style={{ cursor: r ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    r &&
                    openBetSlip(
                      `${cardSub.sid}:card:${rank}`,
                      r,
                      'back',
                      isMobile
                    )
                  }
                >
                  <img src={`/assets/img/cards/${img}.png`} alt={o.nat} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   10. DUS KA DUM (dum10) — Exact D247 rendered.html DOM
   Live API: 1/2:Next Total N or More (B+L), 3:Red, 4:Black, 5:Even, 6:Odd
   ========================================================================== */
function TableDum10({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const mainSub =
    subs.find(
      (s) =>
        String(s?.subtype || '').toLowerCase() === 'dum10' &&
        isOpenEntry(s, isSuspended)
    ) ||
    subs.find((s) => String(s?.sid) === '1') ||
    subs[0];

  const mainBack = getLiveRate(mainSub, 'back', isSuspended);
  const mainLay = getLiveRate(mainSub, 'lay', isSuspended);
  const evenRate = getLiveRate(
    getBySidOrNat(markets, 5, 'Even'),
    'back',
    isSuspended
  );
  const oddRate = getLiveRate(
    getBySidOrNat(markets, 6, 'Odd'),
    'back',
    isSuspended
  );
  const redRate = getLiveRate(
    getBySidOrNat(markets, 3, 'Red'),
    'back',
    isSuspended
  );
  const blackRate = getLiveRate(
    getBySidOrNat(markets, 4, 'Black'),
    'back',
    isSuspended
  );

  return (
    <div className='casino-table dum10'>
      <div className='casino-table-box'>
        <div className='casino-table-full-box w-100'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>
                  {mainSub?.nat || 'Next Total'}
                </div>
                <NationBook id='nexttotal' />
              </div>
              <div
                className={`casino-odds-box back ${!mainBack ? 'suspended-box' : ''}`}
                style={{ cursor: mainBack ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  mainBack &&
                  mainSub &&
                  openBetSlip(String(mainSub.sid), mainBack, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{mainBack || '0'}</span>
              </div>
              <div
                className={`casino-odds-box lay ${!mainLay ? 'suspended-box' : ''}`}
                style={{ cursor: mainLay ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  mainLay &&
                  mainSub &&
                  openBetSlip(String(mainSub.sid), mainLay, 'lay', isMobile)
                }
              >
                <span className='casino-odds'>{mainLay || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{evenRate || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!evenRate ? 'suspended-box' : ''}`}
              style={{ cursor: evenRate ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                evenRate && openBetSlip('5', evenRate, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Even</span>
            </div>
            <NationBook id='even' />
          </div>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{oddRate || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!oddRate ? 'suspended-box' : ''}`}
              style={{ cursor: oddRate ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                oddRate && openBetSlip('6', oddRate, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Odd</span>
            </div>
            <NationBook id='odd' />
          </div>
        </div>

        <div className='casino-table-right-box'>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{redRate || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!redRate ? 'suspended-box' : ''}`}
              style={{ cursor: redRate ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                redRate && openBetSlip('3', redRate, 'back', isMobile)
              }
            >
              <div className='casino-odds'>
                <span className='card-icon ms-1'>
                  <span className='card-red'>{'{'}</span>
                </span>
                <span className='card-icon ms-1'>
                  <span className='card-red'>{'['}</span>
                </span>
              </div>
            </div>
            <NationBook id='red' />
          </div>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{blackRate || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!blackRate ? 'suspended-box' : ''}`}
              style={{ cursor: blackRate ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                blackRate && openBetSlip('4', blackRate, 'back', isMobile)
              }
            >
              <div className='casino-odds'>
                <span className='card-icon ms-1'>
                  <span className='card-black'>{'}'}</span>
                </span>
                <span className='card-icon ms-1'>
                  <span className='card-black'>{']'}</span>
                </span>
              </div>
            </div>
            <NationBook id='black' />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   11. 1-CARD METER (cmeter1) — Exact D247 rendered.html DOM
   Live API: 1:Fighter A (b=13), 2:Fighter B (b=13)
   ========================================================================== */
function TableCmeter1({ isMobile, isSuspended, openBetSlip, markets }) {
  const fA = getLiveRate(
    getBySidOrNat(markets, 1, 'Fighter A'),
    'back',
    isSuspended
  );
  const fB = getLiveRate(
    getBySidOrNat(markets, 2, 'Fighter B'),
    'back',
    isSuspended
  );

  return (
    <div className='casino-table cmeter1'>
      <div className='casino-table-full-box'>
        <div className='meter-btns'>
          <div className='meter-btn'>
            <div className={`meter-btn-box ${!fA ? 'suspended-box' : ''}`}>
              <button
                type='button'
                disabled={!fA}
                className='btn btn-fighter-1 back'
                onClick={() => fA && openBetSlip('1', fA, 'back', isMobile)}
              >
                Fighter A
              </button>
            </div>
            <NationBook id='fighterA' />
          </div>

          <div className='meter-btn'>
            <div className={`meter-btn-box ${!fB ? 'suspended-box' : ''}`}>
              <button
                type='button'
                disabled={!fB}
                className='btn btn-fighter-2 back'
                onClick={() => fB && openBetSlip('2', fB, 'back', isMobile)}
              >
                Fighter B
              </button>
            </div>
            <NationBook id='fighterB' />
          </div>
        </div>
      </div>
    </div>
  );
}

export const TABLES = {
  poker: TablePoker,
  poker20: TablePoker20,
  poker6: TablePoker6,
  card32: TableCard32,
  pcard32: TableCard32,
  card32eu: TableCard32eu,
  '3cardj': Table3cardj,
  queen: TableQueen,
  trap: TableTrap,
  notenum: TableNotenum,
  dum10: TableDum10,
  cmeter1: TableCmeter1,
};

export default TABLES;

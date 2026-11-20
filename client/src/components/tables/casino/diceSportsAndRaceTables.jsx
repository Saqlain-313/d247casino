import { useCasino, normalizeSelection } from '../../../context/CasinoContext';
import { NationBook } from './shared';

// Pure D247 live-API helpers (ZERO hardcoded odds/stakes/selections)
const isSubOpen = (item, isSuspended) => {
  if (isSuspended || !item) return false;
  const gs = String(item.gstatus ?? item.status ?? '').toUpperCase();
  return !gs || ['OPEN', 'ACTIVE'].includes(gs);
};

const formatMax = (max) => {
  const n = Number(max || 0);
  if (!n) return '';
  if (n >= 100000) return `${+(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
};

const findSub = (subs, markets, nat) => {
  const norm = normalizeSelection(nat);
  const direct = subs.find((s) => normalizeSelection(s?.nat) === norm);
  if (direct) return direct;
  const e = markets?.[norm];
  if (!e) return null;
  return {
    sid: e.sid,
    nat: e.nat,
    b: e.back,
    l: e.lay,
    gstatus: e.gstatus,
    min: e.min,
    max: e.max,
  };
};

// =========================================================================
// 1. Doli Dana (dolidana) — 100% live API subs (25 markets) + D247 DOM
// =========================================================================
function TableDolidana({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  const getItem = (nat) => findSub(subs, markets, nat);

  const renderBox = (nat, bookId, extraCls = '') => {
    const item = getItem(nat);
    const odds = Number(item?.b ?? 0);
    const open = isSubOpen(item, isSuspended) && odds > 1;
    const sidKey = item?.sid != null ? String(item.sid) : nat;
    return (
      <div
        className={`casino-odds-box back ${open ? '' : 'suspended-box'} ${extraCls}`}
        style={{ cursor: open ? 'pointer' : 'not-allowed' }}
        onClick={() => open && openBetSlip(sidKey, odds, 'back', isMobile)}
      >
        <span className='casino-odds'>{open ? item.b : '0'}</span>
        {open && item?.bs ? (
          <span className='casino-volume'>{item.bs}</span>
        ) : null}
        {bookId && <NationBook id={bookId} />}
      </div>
    );
  };

  const pairs = [1, 2, 3, 4, 5, 6].map((d) => `${d}-${d} Pair`);
  const sums = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        <div className='doli-main'>
          <div className='players-bet'>
            {['Player A', 'Player B'].map((p) => (
              <div className='casino-table-row' key={p}>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>{p}</div>
                  <NationBook id={p === 'Player A' ? 'playerA' : 'playerB'} />
                </div>
                <div className='doli-odds-box'>{renderBox(p)}</div>
              </div>
            ))}
          </div>

          <div className='side-bets'>
            <div className='any-pair'>
              <div className='doli-odds-box'>
                <div className='odd-name'>Any Pair</div>
                {renderBox('Any Pair', 'anypair')}
              </div>
            </div>

            <div className='odd-even-pair'>
              <div className='bets-box'>
                <div className='doli-odds-box'>
                  <div className='odd-name'>Odd</div>
                  {renderBox('Odd', 'odd')}
                </div>
                <div className='doli-odds-box'>
                  <div className='odd-name'>Even</div>
                  {renderBox('Even', 'even')}
                </div>
              </div>
            </div>

            <div className='lucky7-pair'>
              <div className='bets-box'>
                <div className='doli-odds-box'>
                  <div className='odd-name'>&lt; 7</div>
                  {renderBox('Less than 7', 'lt7')}
                </div>
                <div className='doli-odds-box'>
                  <div className='seven-box'>
                    <img src='/cards-rank/7.png' alt='7' />
                  </div>
                </div>
                <div className='doli-odds-box'>
                  <div className='odd-name'>&gt; 7</div>
                  {renderBox('Greater than 7', 'gt7')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='doli-other-bets'>
          <div className='particular-pair'>
            <h4>Particular Pair</h4>
            <div className='bets-box'>
              {pairs.map((p, idx) => (
                <div className='doli-odds-box' key={p}>
                  <div className='odd-name'>{p}</div>
                  {renderBox(p, `pair:${idx + 1}`)}
                </div>
              ))}
            </div>
          </div>

          <div className='sum-total-odds'>
            <h4>Odds of Sum Total</h4>
            <div className='bets-box'>
              {sums.map((n) => (
                <div className='doli-odds-box' key={n}>
                  <div className='odd-name'>Sum Total {n}</div>
                  {renderBox(`Sum Total ${n}`, `sum:${n}`)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2 & 3. Sic Bo & Sic Bo 2 (sicbo, sicbo2) — 100% live 52 provider markets
// Provider `b` is profit-to-1 ratio (X:1 -> decimal X + 1)
// =========================================================================
const PIP_POS = {
  1: ['center'],
  2: ['top-left', 'bottom-right'],
  3: ['top-left', 'center', 'bottom-right'],
  4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
  6: [
    'top-left',
    'top-right',
    'middle-left',
    'middle-right',
    'bottom-left',
    'bottom-right',
  ],
};
const PIP_CLS = {
  'top-left': 'top-[17%] left-[17%]',
  'top-right': 'top-[17%] right-[17%]',
  'middle-left': 'top-1/2 left-[17%] -translate-y-1/2',
  'middle-right': 'top-1/2 right-[17%] -translate-y-1/2',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'bottom-left': 'bottom-[17%] left-[17%]',
  'bottom-right': 'bottom-[17%] right-[17%]',
};

function DieFace({ n, size = 'h-5 w-5' }) {
  return (
    <span
      className={`relative inline-block shrink-0 rounded-[3px] bg-[#a90032] ${size}`}
    >
      {(PIP_POS[n] || []).map((pos, i) => (
        <span
          key={i}
          className={`absolute h-[3.5px] w-[3.5px] rounded-full bg-white ${PIP_CLS[pos]}`}
        />
      ))}
    </span>
  );
}

function TableSicboCommon({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  const getItem = (nat) => findSub(subs, markets, nat);

  const clickSub = (item, fallbackNat) => {
    const ratio = Number(item?.b ?? 0);
    if (!isSubOpen(item, isSuspended) || !(ratio > 0)) return;
    const sidKey = item?.sid != null ? String(item.sid) : fallbackNat;
    openBetSlip(sidKey, ratio + 1, 'back', isMobile);
  };

  const cellProps = (nat) => {
    const item = getItem(nat);
    const ratio = Number(item?.b ?? 0);
    const open = isSubOpen(item, isSuspended) && ratio > 0;
    return {
      item,
      open,
      ratioText: open ? `${ratio}:1` : '0',
      onClick: () => clickSub(item, nat),
    };
  };

  const totalsLow = [4, 5, 6, 7, 8, 9, 10];
  const totalsHigh = [11, 12, 13, 14, 15, 16, 17];
  const combos = [];
  for (let a = 1; a <= 6; a++) {
    for (let b = a + 1; b <= 6; b++) combos.push([a, b]);
  }

  const small = cellProps('Small');
  const big = cellProps('BIG');
  const odd = cellProps('ODD');
  const even = cellProps('Even');
  const anyTriple = cellProps('Any Triple');

  return (
    <div className='casino-table'>
      <div className='w-full overflow-x-auto bg-[#f7f7f7] p-1'>
        <div className='min-w-[820px]'>
          <div className='sicbo-top'>
            <div className='sicbo-top-box sicbo-title-box'>
              1:1 Lose to Any Triple
            </div>
            <div className='sicbo-top-box sicbo-title-box'>
              {anyTriple.open ? anyTriple.ratioText : '30:1'}
            </div>
            <div className='sicbo-top-box sicbo-title-box'>
              1:1 Lose to Any Triple
            </div>
          </div>

          <div className='sicbo-middle'>
            <div
              className={`sicbo-middle-small sicbo-square-box ${small.open ? '' : 'suspended-box'}`}
              style={{ cursor: small.open ? 'pointer' : 'not-allowed' }}
              onClick={small.onClick}
            >
              <div>Small</div>
              <div className='sicbo-box-value'>4-10</div>
              <NationBook id='small' />
            </div>

            <div className='sicbo-middle-midle'>
              <div className='sicbo-middle-top-row'>
                <div
                  className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd ${odd.open ? '' : 'suspended-box'}`}
                  style={{ cursor: odd.open ? 'pointer' : 'not-allowed' }}
                  onClick={odd.onClick}
                >
                  <div>ODD</div>
                  <div className='sicbo-box-value'>{odd.ratioText}</div>
                  <NationBook id='odd' />
                </div>

                {totalsLow.map((t) => {
                  const p = cellProps(`Total ${t}`);
                  return (
                    <div
                      key={t}
                      className={`sicbo-middle-top-box sicbo-square-box ${p.open ? '' : 'suspended-box'}`}
                      style={{ cursor: p.open ? 'pointer' : 'not-allowed' }}
                      onClick={p.onClick}
                    >
                      <div>{t}</div>
                      <div className='sicbo-box-value'>{p.ratioText}</div>
                      <NationBook id={`sum:${t}`} />
                    </div>
                  );
                })}

                <div
                  className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd ${anyTriple.open ? '' : 'suspended-box'}`}
                  style={{ cursor: anyTriple.open ? 'pointer' : 'not-allowed' }}
                  onClick={anyTriple.onClick}
                >
                  <div>Any Triple</div>
                  <NationBook id='anytriple' />
                </div>

                {totalsHigh.map((t) => {
                  const p = cellProps(`Total ${t}`);
                  return (
                    <div
                      key={t}
                      className={`sicbo-middle-top-box sicbo-square-box ${p.open ? '' : 'suspended-box'}`}
                      style={{ cursor: p.open ? 'pointer' : 'not-allowed' }}
                      onClick={p.onClick}
                    >
                      <div>{t}</div>
                      <div className='sicbo-box-value'>{p.ratioText}</div>
                      <NationBook id={`sum:${t}`} />
                    </div>
                  );
                })}

                <div
                  className={`sicbo-middle-top-box sicbo-square-box sicbo-middle-top-box-odd ${even.open ? '' : 'suspended-box'}`}
                  style={{ cursor: even.open ? 'pointer' : 'not-allowed' }}
                  onClick={even.onClick}
                >
                  <div>EVEN</div>
                  <div className='sicbo-box-value'>{even.ratioText}</div>
                  <NationBook id='even' />
                </div>
              </div>

              {/* Singles (1..6), Doubles (1..6), Triples (1..6) */}
              <div className='mt-2 grid grid-cols-18 gap-1'>
                {[1, 2, 3, 4, 5, 6].map((d) => {
                  const p = cellProps(`Single ${d}`);
                  return (
                    <div
                      key={`s-${d}`}
                      className={`sicbo-square-box flex flex-col items-center justify-center p-1 ${p.open ? '' : 'suspended-box'}`}
                      style={{ cursor: p.open ? 'pointer' : 'not-allowed' }}
                      onClick={p.onClick}
                      title={`Single ${d}`}
                    >
                      <DieFace n={d} size='h-4 w-4' />
                      <span className='text-[10px] font-bold'>
                        {p.ratioText}
                      </span>
                    </div>
                  );
                })}
                {[1, 2, 3, 4, 5, 6].map((d) => {
                  const p = cellProps(`Double ${d}`);
                  return (
                    <div
                      key={`d-${d}`}
                      className={`sicbo-square-box flex flex-col items-center justify-center p-1 ${p.open ? '' : 'suspended-box'}`}
                      style={{ cursor: p.open ? 'pointer' : 'not-allowed' }}
                      onClick={p.onClick}
                      title={`Double ${d}`}
                    >
                      <div className='flex gap-0.5'>
                        <DieFace n={d} size='h-3.5 w-3.5' />
                        <DieFace n={d} size='h-3.5 w-3.5' />
                      </div>
                      <span className='text-[10px] font-bold'>
                        {p.ratioText}
                      </span>
                    </div>
                  );
                })}
                {[1, 2, 3, 4, 5, 6].map((d) => {
                  const p = cellProps(`Triple ${d}`);
                  return (
                    <div
                      key={`t-${d}`}
                      className={`sicbo-square-box flex flex-col items-center justify-center p-1 ${p.open ? '' : 'suspended-box'}`}
                      style={{ cursor: p.open ? 'pointer' : 'not-allowed' }}
                      onClick={p.onClick}
                      title={`Triple ${d}`}
                    >
                      <div className='flex gap-0.5'>
                        <DieFace n={d} size='h-3 w-3' />
                        <DieFace n={d} size='h-3 w-3' />
                        <DieFace n={d} size='h-3 w-3' />
                      </div>
                      <span className='text-[10px] font-bold'>
                        {p.ratioText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={`sicbo-middle-big sicbo-square-box ${big.open ? '' : 'suspended-box'}`}
              style={{ cursor: big.open ? 'pointer' : 'not-allowed' }}
              onClick={big.onClick}
            >
              <div>Big</div>
              <div className='sicbo-box-value'>11-17</div>
              <NationBook id='big' />
            </div>
          </div>

          {/* 15 Two-Dice Combinations (5:1) */}
          <div className='mt-2'>
            <div className='sicbo-title-box mb-1 text-center text-xs font-bold'>
              5:1 Two Dice Combination
            </div>
            <div className='grid grid-cols-15 gap-1'>
              {combos.map(([a, b]) => {
                const nat = `Combination ${a} and ${b}`;
                const p = cellProps(nat);
                return (
                  <div
                    key={nat}
                    className={`sicbo-square-box flex flex-col items-center justify-center gap-0.5 p-1 ${p.open ? '' : 'suspended-box'}`}
                    style={{ cursor: p.open ? 'pointer' : 'not-allowed' }}
                    onClick={p.onClick}
                    title={nat}
                  >
                    <DieFace n={a} size='h-4 w-4' />
                    <DieFace n={b} size='h-4 w-4' />
                    <span className='text-[10px] font-bold'>{p.ratioText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. Ball By Ball (ballbyball) — 100% live API subs (9 outcomes)
// =========================================================================
function TableBallbyball({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  return (
    <div className='detail-page-container position-relative w-full'>
      <div className='game-market market-6 container-fluid container-fluid-5'>
        <div className='market-title row row5'>Runs</div>
        <div className='market-header row row5'>
          <div className='col-md-4 d-none d-md-block col-12'>
            <div className='market-row'>
              <div className='market-nation-detail' />
              <div className='market-odd-box back'>
                <b>Back</b>
              </div>
            </div>
          </div>
          <div className='col-md-4 d-none d-md-block col-12'>
            <div className='market-row'>
              <div className='market-nation-detail' />
              <div className='market-odd-box back'>
                <b>Back</b>
              </div>
            </div>
          </div>
          <div className='col-md-4 col-12'>
            <div className='market-row'>
              <div className='market-nation-detail' />
              <div className='market-odd-box back'>
                <b>Back</b>
              </div>
            </div>
          </div>
        </div>
        <div className='market-body row row5'>
          {subs.map((item) => {
            const odds = Number(item?.b ?? 0);
            const open = isSubOpen(item, isSuspended) && odds > 1;
            const sidKey = item?.sid != null ? String(item.sid) : item?.nat;
            return (
              <div className='col-md-4 col-12' key={sidKey}>
                <div
                  className='fancy-market'
                  data-title={open ? 'OPEN' : 'SUSPENDED'}
                >
                  <div className='market-row'>
                    <div className='market-nation-detail'>
                      <span className='market-nation-name pointer'>
                        {item.nat}
                      </span>
                      <NationBook id={normalizeSelection(item.nat)} />
                    </div>
                    <div className={`blb-box ${open ? '' : 'suspended-box'}`}>
                      <div
                        className='market-odd-box back'
                        style={{ cursor: open ? 'pointer' : 'not-allowed' }}
                        onClick={() =>
                          open && openBetSlip(sidKey, odds, 'back', isMobile)
                        }
                      >
                        <span className='market-odd'>
                          {open ? item.b : '-'}
                        </span>
                        {open && item?.bs ? (
                          <span className='market-volume'>{item.bs}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className='fancy-min-max-box'>
                      <div className='fancy-min-max'>
                        <span className='d-block w-100'>
                          Min: {Number(item.min || 50).toFixed(2)}
                        </span>
                        <span className='d-block w-100'>
                          Max: {formatMax(item.max || 25000)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5. Cricket Match 20-20 (cmatch20) — exact D247 .cricket20-container
// 9 live markets: Run 2 .. Run 10 with Back + Lay & ball icons
// =========================================================================
function TableCmatch20({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const left = subs.slice(0, 5);
  const right = subs.slice(5);

  const renderScoreBox = (item) => {
    const runNum = Number(String(item?.nat || '').replace(/\D/g, '')) || 2;
    const bOdds = Number(item?.b ?? 0);
    const lOdds = Number(item?.l ?? 0);
    const open = isSubOpen(item, isSuspended);
    const bOpen = open && bOdds > 1;
    const lOpen = open && lOdds > 1;
    const sidKey = item?.sid != null ? String(item.sid) : item?.nat;

    return (
      <div className='score-box' key={sidKey}>
        <div className='team-score'>
          <div>
            <div className='text-center'>
              <b>{item.nat}</b>
            </div>
            <NationBook id={`run:${runNum}`} />
          </div>
        </div>
        <div className='ball-icon'>
          <img src={`/balls/cricket20/ball${runNum}.png`} alt={item.nat} />
        </div>
        <div className='blbox'>
          <div
            className={`casino-odds-box back ${bOpen ? '' : 'suspended-box'}`}
            style={{ cursor: bOpen ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              bOpen && openBetSlip(sidKey, bOdds, 'back', isMobile)
            }
          >
            <span className='casino-odds'>{bOpen ? item.b : '0'}</span>
          </div>
          <div
            className={`casino-odds-box lay ${lOpen ? '' : 'suspended-box'}`}
            style={{ cursor: lOpen ? 'pointer' : 'not-allowed' }}
            onClick={() => lOpen && openBetSlip(sidKey, lOdds, 'lay', isMobile)}
          >
            <span className='casino-odds'>{lOpen ? item.l : '0'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='casino-table'>
      <div className='cricket20-container'>
        <div className='cricket20-left'>{left.map(renderScoreBox)}</div>
        <div className='cricket20-right'>{right.map(renderScoreBox)}</div>
      </div>
    </div>
  );
}

// =========================================================================
// 6. Goal (goal) — 100% live API subs (10 players + 5 methods, SID-safe!)
// =========================================================================
function TableGoal({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const players = subs.filter(
    (s) => s.subtype === 'player' || (!s.subtype && Number(s.sid) <= 10)
  );
  const methods = subs.filter(
    (s) => s.subtype === 'goal' || (!s.subtype && Number(s.sid) > 10)
  );

  const renderSection = (title, items) => (
    <div className='game-market market-6 container-fluid container-fluid-5'>
      <div className='market-title row row5'>{title}</div>
      <div className='market-header row row5'>
        <div className='col-md-12 col-12'>
          <div className='market-row'>
            <div className='market-nation-detail' />
            <div className='market-odd-box back'>
              <b>Back</b>
            </div>
            <div className='fancy-min-max-box' />
          </div>
        </div>
      </div>
      <div className='market-body row'>
        <div className='col-md-12 col-12'>
          {items.map((item) => {
            const odds = Number(item?.b ?? 0);
            const open = isSubOpen(item, isSuspended) && odds > 1;
            const sidKey = item?.sid != null ? String(item.sid) : item?.nat;
            return (
              <div
                className='fancy-market'
                key={sidKey}
                data-title={open ? 'OPEN' : 'SUSPENDED'}
              >
                <div className='market-row'>
                  <div className='market-nation-detail'>
                    <span className='market-nation-name pointer'>
                      {item.nat}
                    </span>
                    <NationBook id={`player:${item.sid}`} />
                  </div>
                  <div className={`blb-box ${open ? '' : 'suspended-box'}`}>
                    <div
                      className='market-odd-box back'
                      style={{ cursor: open ? 'pointer' : 'not-allowed' }}
                      onClick={() =>
                        open && openBetSlip(sidKey, odds, 'back', isMobile)
                      }
                    >
                      <span className='market-odd'>{open ? item.b : '-'}</span>
                      {open && item?.bs ? (
                        <span className='market-volume'>{item.bs}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className='fancy-min-max-box'>
                    <div className='fancy-min-max'>
                      <span className='d-block w-100'>
                        Min: {Number(item.min || 100).toFixed(2)}
                      </span>
                      <span className='d-block w-100'>
                        Max: {formatMax(item.max || 100000)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className='detail-page-container position-relative grid grid-cols-1 items-start gap-1 md:grid-cols-2'>
      {renderSection('Who Will Goal Next?', players)}
      {renderSection('Method Of Next Goal', methods)}
    </div>
  );
}

// =========================================================================
// 7. Race 20-20 (race20) — 100% live API subs + exact D247 .race20 DOM
// =========================================================================
const KING_CARD = {
  spade: '/assets/img/cards/KSS.jpg',
  heart: '/assets/img/cards/KHH.jpg',
  club: '/assets/img/cards/KCC.jpg',
  diamond: '/assets/img/cards/KDD.jpg',
};

function TableRace20({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const kings = subs.filter(
    (s) => s.subtype === 'race20' || Number(s.sid) <= 4
  );
  const fancies = subs.filter(
    (s) => s.subtype === 'race20fancy' || Number(s.sid) > 4
  );

  const renderBL = (item, type) => {
    const odds = Number(type === 'lay' ? item?.l : item?.b);
    const vol = type === 'lay' ? item?.ls : item?.bs;
    const open = isSubOpen(item, isSuspended) && odds > 1;
    const sidKey = item?.sid != null ? String(item.sid) : item?.nat;
    return (
      <div
        className={`casino-odds-box ${type} ${open ? '' : 'suspended-box'}`}
        style={{ cursor: open ? 'pointer' : 'not-allowed' }}
        onClick={() => open && openBetSlip(sidKey, odds, type, isMobile)}
      >
        <span className='casino-odds'>
          {open ? (type === 'lay' ? item.l : item.b) : '0'}
        </span>
        {open && vol ? <div className='casino-volume'>{vol}</div> : null}
      </div>
    );
  };

  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        {kings.map((item) => {
          const suit = String(item.nat || '')
            .toLowerCase()
            .replace('k of ', '')
            .trim();
          const cardSrc = KING_CARD[suit];
          return (
            <div
              className='casino-odd-box-container'
              key={item.sid ?? item.nat}
            >
              <div className='casino-nation-name'>
                {cardSrc ? <img src={cardSrc} alt={item.nat} /> : item.nat}
              </div>
              {renderBL(item, 'back')}
              {renderBL(item, 'lay')}
              <NationBook id={suit} />
            </div>
          );
        })}
      </div>

      {fancies.length > 0 && (
        <div className='casino-table-box mt-3'>
          {fancies.map((item) => {
            const hasLay = Number(item?.l ?? 0) > 1;
            return (
              <div
                className='casino-odd-box-container'
                key={item.sid ?? item.nat}
              >
                <div className='casino-nation-name'>{item.nat}</div>
                {renderBL(item, 'back')}
                {hasLay && renderBL(item, 'lay')}
                <NationBook id={normalizeSelection(item.nat)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 8. Race to 17 (race17) — 100% live API subs (dynamic card # in labels!)
// =========================================================================
function TableRace17({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  const renderBL = (item, type) => {
    const odds = Number(type === 'lay' ? item?.l : item?.b);
    const open = isSubOpen(item, isSuspended) && odds > 1;
    const sidKey = item?.sid != null ? String(item.sid) : item?.nat;
    return (
      <div
        className={`casino-odds-box ${type} ${open ? '' : 'suspended-box'}`}
        style={{ cursor: open ? 'pointer' : 'not-allowed' }}
        onClick={() => open && openBetSlip(sidKey, odds, type, isMobile)}
      >
        <span className='casino-odds'>
          {open ? (type === 'lay' ? item.l : item.b) : '0'}
        </span>
      </div>
    );
  };

  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        {subs.map((item) => (
          <div className='casino-odd-box-container' key={item.sid ?? item.nat}>
            <div className='casino-nation-name'>{item.nat}</div>
            {renderBL(item, 'back')}
            {renderBL(item, 'lay')}
            <NationBook id={normalizeSelection(item.nat)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// 9. Race to 2nd (race2) — 100% live API subs (Player A..D Back + Lay)
// =========================================================================
function TableRace2({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  const renderBL = (item, type) => {
    const odds = Number(type === 'lay' ? item?.l : item?.b);
    const open = isSubOpen(item, isSuspended) && odds > 1;
    const sidKey = item?.sid != null ? String(item.sid) : item?.nat;
    return (
      <div
        className={`casino-odds-box ${type} ${open ? '' : 'suspended-box'}`}
        style={{ cursor: open ? 'pointer' : 'not-allowed' }}
        onClick={() => open && openBetSlip(sidKey, odds, type, isMobile)}
      >
        <span className='casino-odds'>
          {open ? (type === 'lay' ? item.l : item.b) : '0'}
        </span>
      </div>
    );
  };

  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        {subs.map((item) => {
          const bk = String(item.nat || '').replace(/\s+/g, '');
          const bookKey = bk ? bk[0].toLowerCase() + bk.slice(1) : '';
          return (
            <div
              className='casino-odd-box-container'
              key={item.sid ?? item.nat}
            >
              <div className='casino-nation-name'>{item.nat}</div>
              {renderBL(item, 'back')}
              {renderBL(item, 'lay')}
              <NationBook id={bookKey} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const TABLES = {
  dolidana: TableDolidana,
  goal: TableGoal,
  sicbo2: TableSicboCommon,
  sicbo: TableSicboCommon,
  ballbyball: TableBallbyball,
  cmatch20: TableCmatch20,
  race20: TableRace20,
  race17: TableRace17,
  race2: TableRace2,
};

export default TABLES;

import { useState } from 'react';
import { normalizeSelection, useCasino } from '../../../context/CasinoContext';
import { NationBook } from './shared';

const formatMax = (v) => {
  const n = Number(v || 0);
  if (!n) return '';
  if (n >= 100000) return `${+(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `${+(n / 1000).toFixed(2)}K`;
  return String(n);
};

const isOpenEntry = (entry, isSuspended) => {
  if (isSuspended || !entry) return false;
  const gs = String(entry.gstatus || '').toUpperCase();
  return ['OPEN', 'ACTIVE'].includes(gs);
};

const getBySidOrNat = (markets, sid, nat) =>
  markets?.[`sid:${sid}`] || markets?.[normalizeSelection(nat)] || null;

const getLiveRate = (entry, side, isSuspended) => {
  if (!isOpenEntry(entry, isSuspended)) return 0;
  const v = Number(side === 'lay' ? entry.lay : entry.back);
  return Number.isFinite(v) && v > 1 ? v : 0;
};

/* ==========================================================================
   1. LUCKY 5 (11-card deck A..J, pivot Card 6 -> half-loss on Low/High)
   Live API: 1:Low Card, 2:High Card, 3:Even, 4:Odd, 5:Red, 6:Black,
             7..16:Card 1..10, 17:Card J
   ========================================================================== */
const LUCKY5_CARDS = [
  { sid: 7, nat: 'Card 1', img: 'A', rank: 1 },
  { sid: 8, nat: 'Card 2', img: '2', rank: 2 },
  { sid: 9, nat: 'Card 3', img: '3', rank: 3 },
  { sid: 10, nat: 'Card 4', img: '4', rank: 4 },
  { sid: 11, nat: 'Card 5', img: '5', rank: 5 },
  { sid: 12, nat: 'Card 6', img: '6', rank: 6 },
  { sid: 13, nat: 'Card 7', img: '7', rank: 7 },
  { sid: 14, nat: 'Card 8', img: '8', rank: 8 },
  { sid: 15, nat: 'Card 9', img: '9', rank: 9 },
  { sid: 16, nat: 'Card 10', img: '10', rank: 10 },
  { sid: 17, nat: 'Card J', img: 'J', rank: 11 },
];

function TableLucky5({ isMobile, isSuspended, openBetSlip, markets }) {
  const lowM = getBySidOrNat(markets, 1, 'Low Card');
  const highM = getBySidOrNat(markets, 2, 'High Card');
  const evenM = getBySidOrNat(markets, 3, 'Even');
  const oddM = getBySidOrNat(markets, 4, 'Odd');
  const redM = getBySidOrNat(markets, 5, 'Red');
  const blackM = getBySidOrNat(markets, 6, 'Black');
  const firstCardM = getBySidOrNat(markets, 7, 'Card 1');

  const lowOdds = getLiveRate(lowM, 'back', isSuspended);
  const highOdds = getLiveRate(highM, 'back', isSuspended);
  const evenOdds = getLiveRate(evenM, 'back', isSuspended);
  const oddOdds = getLiveRate(oddM, 'back', isSuspended);
  const redOdds = getLiveRate(redM, 'back', isSuspended);
  const blackOdds = getLiveRate(blackM, 'back', isSuspended);
  const cardHeaderRate = getLiveRate(firstCardM, 'back', isSuspended);

  return (
    <div className='casino-table lucky7a'>
      <div className='casino-table-full-box'>
        <div className='lucky7low'>
          <div className='casino-odds text-center'>{lowOdds || '0'}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${!lowOdds ? 'suspended-box' : ''}`}
            style={{ cursor: lowOdds ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              lowOdds && openBetSlip('1', lowOdds, 'back', isMobile)
            }
          >
            <span className='casino-odds'>Low Card</span>
          </div>
          <NationBook id='low' />
        </div>

        <div className='lucky7'>
          <img src='/assets/img/cards/6.png' alt='6' />
        </div>

        <div className='lucky7high'>
          <div className='casino-odds text-center'>{highOdds || '0'}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${!highOdds ? 'suspended-box' : ''}`}
            style={{ cursor: highOdds ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              highOdds && openBetSlip('2', highOdds, 'back', isMobile)
            }
          >
            <span className='casino-odds'>High Card</span>
          </div>
          <NationBook id='high' />
        </div>
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <div className='lucky7odds'>
            <div className='casino-odds text-center'>{evenOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!evenOdds ? 'suspended-box' : ''}`}
              style={{ cursor: evenOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                evenOdds && openBetSlip('3', evenOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Even</span>
            </div>
            <NationBook id='even' />
          </div>
          <div className='lucky7odds'>
            <div className='casino-odds text-center'>{oddOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!oddOdds ? 'suspended-box' : ''}`}
              style={{ cursor: oddOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                oddOdds && openBetSlip('4', oddOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Odd</span>
            </div>
            <NationBook id='odd' />
          </div>
        </div>

        <div className='casino-table-right-box'>
          <div className='lucky7odds'>
            <div className='casino-odds text-center'>{redOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!redOdds ? 'suspended-box' : ''}`}
              style={{ cursor: redOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                redOdds && openBetSlip('5', redOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>
                <span className='card-icon ms-1'>
                  <span className='card-red'>{'{'}</span>
                </span>
                <span className='card-icon ms-1'>
                  <span className='card-red'>{'['}</span>
                </span>
              </span>
            </div>
            <NationBook id='red' />
          </div>
          <div className='lucky7odds'>
            <div className='casino-odds text-center'>{blackOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!blackOdds ? 'suspended-box' : ''}`}
              style={{ cursor: blackOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                blackOdds && openBetSlip('6', blackOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>
                <span className='card-icon ms-1'>
                  <span className='card-black'>{'}'}</span>
                </span>
                <span className='card-icon ms-1'>
                  <span className='card-black'>{']'}</span>
                </span>
              </span>
            </div>
            <NationBook id='black' />
          </div>
        </div>
      </div>

      <div className='casino-table-full-box lucky7acards mt-3'>
        <div className='casino-odds mb-1 w-100 text-center'>
          {cardHeaderRate || '0'}
        </div>
        {LUCKY5_CARDS.map((c) => {
          const entry = getBySidOrNat(markets, c.sid, c.nat);
          const rate = getLiveRate(entry, 'back', isSuspended);
          return (
            <div className='card-odd-box' key={c.sid}>
              <div
                className={!rate ? 'suspended-box' : ''}
                style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  rate && openBetSlip(String(c.sid), rate, 'back', isMobile)
                }
              >
                <img src={`/assets/img/cards/${c.img}.png`} alt={c.nat} />
              </div>
              <NationBook id={`card:${c.rank}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   2. LUCKY 7 LIVE FAMILY (lucky7, lucky7eu, lucky7eu2, plucky7)
   Live API: 1:Low Card, 2:High Card, 3:Even, 4:Odd, 5:Red, 6:Black,
             7..19:Card 1..Card K, 20..23:Line 1..Line 4
   ========================================================================== */
const LUCKY7_CARDS = [
  { sid: 7, nat: 'Card 1', img: 'A', rank: 1 },
  { sid: 8, nat: 'Card 2', img: '2', rank: 2 },
  { sid: 9, nat: 'Card 3', img: '3', rank: 3 },
  { sid: 10, nat: 'Card 4', img: '4', rank: 4 },
  { sid: 11, nat: 'Card 5', img: '5', rank: 5 },
  { sid: 12, nat: 'Card 6', img: '6', rank: 6 },
  { sid: 13, nat: 'Card 7', img: '7', rank: 7 },
  { sid: 14, nat: 'Card 8', img: '8', rank: 8 },
  { sid: 15, nat: 'Card 9', img: '9', rank: 9 },
  { sid: 16, nat: 'Card 10', img: '10', rank: 10 },
  { sid: 17, nat: 'Card J', img: 'J', rank: 11 },
  { sid: 18, nat: 'Card Q', img: 'Q', rank: 12 },
  { sid: 19, nat: 'Card K', img: 'K', rank: 13 },
];

const LUCKY7_LINES = [
  { sid: 20, nat: 'Line 1', group: 1, imgs: ['A', '2', '3'] },
  { sid: 21, nat: 'Line 2', group: 2, imgs: ['4', '5', '6'] },
  { sid: 22, nat: 'Line 3', group: 3, imgs: ['8', '9', '10'] },
  { sid: 23, nat: 'Line 4', group: 4, imgs: ['J', 'Q', 'K'] },
];

function TableLucky7Live({ isMobile, isSuspended, openBetSlip, markets }) {
  const lowM = getBySidOrNat(markets, 1, 'Low Card');
  const highM = getBySidOrNat(markets, 2, 'High Card');
  const evenM = getBySidOrNat(markets, 3, 'Even');
  const oddM = getBySidOrNat(markets, 4, 'Odd');
  const redM = getBySidOrNat(markets, 5, 'Red');
  const blackM = getBySidOrNat(markets, 6, 'Black');
  const firstCardM = getBySidOrNat(markets, 7, 'Card 1');

  const lowOdds = getLiveRate(lowM, 'back', isSuspended);
  const highOdds = getLiveRate(highM, 'back', isSuspended);
  const evenOdds = getLiveRate(evenM, 'back', isSuspended);
  const oddOdds = getLiveRate(oddM, 'back', isSuspended);
  const redOdds = getLiveRate(redM, 'back', isSuspended);
  const blackOdds = getLiveRate(blackM, 'back', isSuspended);
  const cardHeaderRate = getLiveRate(firstCardM, 'back', isSuspended);

  return (
    <div className='casino-table lucky7a'>
      <div className='casino-table-full-box'>
        <div className='lucky7low'>
          <div className='casino-odds text-center'>{lowOdds || '0'}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${!lowOdds ? 'suspended-box' : ''}`}
            style={{ cursor: lowOdds ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              lowOdds && openBetSlip('1', lowOdds, 'back', isMobile)
            }
          >
            <span className='casino-odds'>Low Card</span>
          </div>
          <NationBook id='low' />
        </div>

        <div className='lucky7'>
          <img src='/assets/img/cards/7.png' alt='7' />
        </div>

        <div className='lucky7high'>
          <div className='casino-odds text-center'>{highOdds || '0'}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${!highOdds ? 'suspended-box' : ''}`}
            style={{ cursor: highOdds ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              highOdds && openBetSlip('2', highOdds, 'back', isMobile)
            }
          >
            <span className='casino-odds'>High Card</span>
          </div>
          <NationBook id='high' />
        </div>
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <div className='lucky7odds'>
            <div className='casino-odds text-center'>{evenOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!evenOdds ? 'suspended-box' : ''}`}
              style={{ cursor: evenOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                evenOdds && openBetSlip('3', evenOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Even</span>
            </div>
            <NationBook id='even' />
          </div>
          <div className='lucky7odds'>
            <div className='casino-odds text-center'>{oddOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!oddOdds ? 'suspended-box' : ''}`}
              style={{ cursor: oddOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                oddOdds && openBetSlip('4', oddOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Odd</span>
            </div>
            <NationBook id='odd' />
          </div>
        </div>

        <div className='casino-table-right-box'>
          <div className='lucky7odds'>
            <div className='casino-odds text-center'>{redOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!redOdds ? 'suspended-box' : ''}`}
              style={{ cursor: redOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                redOdds && openBetSlip('5', redOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>
                <span className='card-icon ms-1'>
                  <span className='card-red'>{'{'}</span>
                </span>
                <span className='card-icon ms-1'>
                  <span className='card-red'>{'['}</span>
                </span>
              </span>
            </div>
            <NationBook id='red' />
          </div>
          <div className='lucky7odds'>
            <div className='casino-odds text-center'>{blackOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!blackOdds ? 'suspended-box' : ''}`}
              style={{ cursor: blackOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                blackOdds && openBetSlip('6', blackOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>
                <span className='card-icon ms-1'>
                  <span className='card-black'>{'}'}</span>
                </span>
                <span className='card-icon ms-1'>
                  <span className='card-black'>{']'}</span>
                </span>
              </span>
            </div>
            <NationBook id='black' />
          </div>
        </div>
      </div>

      <div className='casino-table-full-box lucky7acards mt-3'>
        <div className='casino-odds mb-1 w-100 text-center'>
          {cardHeaderRate || '0'}
        </div>
        {LUCKY7_CARDS.map((c) => {
          const entry = getBySidOrNat(markets, c.sid, c.nat);
          const rate = getLiveRate(entry, 'back', isSuspended);
          return (
            <div className='card-odd-box' key={c.sid}>
              <div
                className={!rate ? 'suspended-box' : ''}
                style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  rate && openBetSlip(String(c.sid), rate, 'back', isMobile)
                }
              >
                <img src={`/assets/img/cards/${c.img}.png`} alt={c.nat} />
              </div>
              <NationBook id={`card:${c.rank}`} />
            </div>
          );
        })}
      </div>

      <div className='casino-table-box mt-3'>
        {LUCKY7_LINES.map((ln) => {
          const entry = getBySidOrNat(markets, ln.sid, ln.nat);
          const rate = getLiveRate(entry, 'back', isSuspended);
          return (
            <div className='card-odd-box-container' key={ln.sid}>
              <div className='casino-odds text-center'>{rate || '0'}</div>
              <div
                className={`card-odd-box ${!rate ? 'suspended-box' : ''}`}
                style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  rate && openBetSlip(String(ln.sid), rate, 'back', isMobile)
                }
              >
                {ln.imgs.map((img) => (
                  <img
                    key={img}
                    src={`/assets/img/cards/${img}.png`}
                    alt={img}
                  />
                ))}
              </div>
              <NationBook id={`group:${ln.group}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   3. LUCKY 15 (Exact D247 .game-market.market-6 Runs Grid)
   Live API: 1:0 Runs, 2:1 Runs, 3:2 Runs, 4:4 Runs, 5:6 Runs, 6:Wicket
   ========================================================================== */
const LUCKY15_BOOK_KEY = {
  1: 'runs:0',
  2: 'runs:1',
  3: 'runs:2',
  4: 'runs:4',
  5: 'runs:6',
  6: 'wicket',
};

function TableLucky15({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  return (
    <div className='detail-page-container position-relative w-full min-w-0'>
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
          <div className='fancy-min-max-box' />
        </div>

        <div className='market-body row row5'>
          {subs.map((item) => {
            const sid = Number(item.sid ?? item.i);
            const gs = String(item.gstatus ?? item.status ?? '').toUpperCase();
            const rate = Number(item.b ?? 0);
            const open =
              !isSuspended && ['OPEN', 'ACTIVE'].includes(gs) && rate > 1;
            const bookId =
              LUCKY15_BOOK_KEY[sid] || normalizeSelection(item.nat);
            return (
              <div className='col-md-4 col-12' key={sid || item.nat}>
                <div
                  className='fancy-market'
                  data-title={open ? 'OPEN' : 'SUSPENDED'}
                >
                  <div className='market-row'>
                    <div className='market-nation-detail'>
                      <span className='market-nation-name pointer'>
                        {item.nat}
                      </span>
                      <NationBook id={bookId} />
                    </div>
                    <div className='blb-box'>
                      <div
                        className={`market-odd-box back ${!open ? 'suspended-box' : ''}`}
                        style={{ cursor: open ? 'pointer' : 'not-allowed' }}
                        onClick={() =>
                          open &&
                          openBetSlip(String(sid), rate, 'back', isMobile)
                        }
                      >
                        <span className='market-odd'>{open ? rate : '0'}</span>
                        {open && item.bs ? (
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

/* ==========================================================================
   4. AMAR AKBAR ANTHONY LIVE FAMILY (aaa, aaa2)
   Live API: 1:Amar, 2:Akbar, 3:Anthony, 4:Even, 5:Odd, 6:Red, 7:Black,
             8..20:Card A..Card K, 21:Under 7, 22:Over 7
   ========================================================================== */
const AAA_MAIN = [
  { sid: 1, nat: 'Amar', label: 'A. Amar', bookId: 'amar' },
  { sid: 2, nat: 'Akbar', label: 'B. Akbar', bookId: 'akbar' },
  { sid: 3, nat: 'Anthony', label: 'C. Anthony', bookId: 'anthony' },
];

const AAA_CARDS = [
  { sid: 8, nat: 'Card A', img: 'A', rank: 1 },
  { sid: 9, nat: 'Card 2', img: '2', rank: 2 },
  { sid: 10, nat: 'Card 3', img: '3', rank: 3 },
  { sid: 11, nat: 'Card 4', img: '4', rank: 4 },
  { sid: 12, nat: 'Card 5', img: '5', rank: 5 },
  { sid: 13, nat: 'Card 6', img: '6', rank: 6 },
  { sid: 14, nat: 'Card 7', img: '7', rank: 7 },
  { sid: 15, nat: 'Card 8', img: '8', rank: 8 },
  { sid: 16, nat: 'Card 9', img: '9', rank: 9 },
  { sid: 17, nat: 'Card 10', img: '10', rank: 10 },
  { sid: 18, nat: 'Card J', img: 'J', rank: 11 },
  { sid: 19, nat: 'Card Q', img: 'Q', rank: 12 },
  { sid: 20, nat: 'Card K', img: 'K', rank: 13 },
];

function TableAaaLive({ isMobile, isSuspended, openBetSlip, markets }) {
  const evenM = getBySidOrNat(markets, 4, 'Even');
  const oddM = getBySidOrNat(markets, 5, 'Odd');
  const redM = getBySidOrNat(markets, 6, 'Red');
  const blackM = getBySidOrNat(markets, 7, 'Black');
  const underM = getBySidOrNat(markets, 21, 'Under 7');
  const overM = getBySidOrNat(markets, 22, 'Over 7');
  const firstCardM = getBySidOrNat(markets, 8, 'Card A');

  const evenOdds = getLiveRate(evenM, 'back', isSuspended);
  const oddOdds = getLiveRate(oddM, 'back', isSuspended);
  const redOdds = getLiveRate(redM, 'back', isSuspended);
  const blackOdds = getLiveRate(blackM, 'back', isSuspended);
  const underOdds = getLiveRate(underM, 'back', isSuspended);
  const overOdds = getLiveRate(overM, 'back', isSuspended);
  const cardHeaderRate = getLiveRate(firstCardM, 'back', isSuspended);

  return (
    <div className='casino-table aaa'>
      <div className='casino-table-box'>
        {AAA_MAIN.map((p) => {
          const entry = getBySidOrNat(markets, p.sid, p.nat);
          const backOdds = getLiveRate(entry, 'back', isSuspended);
          const layOdds = getLiveRate(entry, 'lay', isSuspended);
          return (
            <div className='casino-odd-box-container' key={p.sid}>
              <div className='casino-nation-name'>
                {p.label}
                <div className='d-md-none'>
                  <NationBook id={p.bookId} />
                </div>
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
              <div className='d-none d-md-block w-100'>
                <NationBook id={p.bookId} />
              </div>
            </div>
          );
        })}
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{evenOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!evenOdds ? 'suspended-box' : ''}`}
              style={{ cursor: evenOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                evenOdds && openBetSlip('4', evenOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Even</span>
            </div>
            <NationBook id='even' />
          </div>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{oddOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!oddOdds ? 'suspended-box' : ''}`}
              style={{ cursor: oddOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                oddOdds && openBetSlip('5', oddOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Odd</span>
            </div>
            <NationBook id='odd' />
          </div>
        </div>

        <div className='casino-table-center-box'>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{redOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!redOdds ? 'suspended-box' : ''}`}
              style={{ cursor: redOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                redOdds && openBetSlip('6', redOdds, 'back', isMobile)
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
            <div className='casino-odds text-center'>{blackOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!blackOdds ? 'suspended-box' : ''}`}
              style={{ cursor: blackOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                blackOdds && openBetSlip('7', blackOdds, 'back', isMobile)
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

        <div className='casino-table-right-box'>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{underOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!underOdds ? 'suspended-box' : ''}`}
              style={{ cursor: underOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                underOdds && openBetSlip('21', underOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Under 7</span>
            </div>
            <NationBook id='under7' />
          </div>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{overOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!overOdds ? 'suspended-box' : ''}`}
              style={{ cursor: overOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                overOdds && openBetSlip('22', overOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Over 7</span>
            </div>
            <NationBook id='over7' />
          </div>
        </div>
      </div>

      <div className='casino-table-full-box aaacards mt-3'>
        <div className='casino-odds mb-1 w-100 text-center'>
          {cardHeaderRate || '0'}
        </div>
        {AAA_CARDS.map((c) => {
          const entry = getBySidOrNat(markets, c.sid, c.nat);
          const rate = getLiveRate(entry, 'back', isSuspended);
          return (
            <div className='card-odd-box' key={c.sid}>
              <div
                className={!rate ? 'suspended-box' : ''}
                style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  rate && openBetSlip(String(c.sid), rate, 'back', isMobile)
                }
              >
                <img src={`/assets/img/cards/${c.img}.png`} alt={c.nat} />
              </div>
              <NationBook id={`card:${c.rank}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   5. BOLLYWOOD TABLE LIVE FAMILY (btable, btable2)
   Live API: 1..6 characters (Back+Lay), 7:Odd (Back+Lay), 8:Red, 9:Black,
             10:Card J, 11:Card Q, 12:card K, 13:card A,
             14:Dulha Dulhan K-Q, 15:Barati J-A
   ========================================================================== */
const BTABLE_MAIN = [
  { sid: 1, label: 'A.Don', bookId: 'don' },
  { sid: 2, label: 'B.Amar Akbar Anthony', bookId: 'aaa' },
  { sid: 3, label: 'C.Sahib Bibi Aur Ghulam', bookId: 'sbg' },
  { sid: 4, label: 'D.Dharam Veer', bookId: 'dv' },
  { sid: 5, label: 'E.Kis Kis Ko Pyaar Karoon', bookId: 'kkpk' },
  { sid: 6, label: 'F.Ghulam', bookId: 'ghulam' },
];

const BTABLE_CARDS = [
  { sid: 10, img: 'J', rank: 11, label: 'Card J' },
  { sid: 11, img: 'Q', rank: 12, label: 'Card Q' },
  { sid: 12, img: 'K', rank: 13, label: 'Card K' },
  { sid: 13, img: 'A', rank: 1, label: 'Card A' },
];

function TableBtableLive({ isMobile, isSuspended, openBetSlip, markets }) {
  const oddM = getBySidOrNat(markets, 7, 'Odd');
  const redM = getBySidOrNat(markets, 8, 'Red');
  const blackM = getBySidOrNat(markets, 9, 'Black');
  const dulhaM = getBySidOrNat(markets, 14, 'Dulha Dulhan K-Q');
  const baratiM = getBySidOrNat(markets, 15, 'Barati J-A');
  const cardJM = getBySidOrNat(markets, 10, 'Card J');

  const oddBack = getLiveRate(oddM, 'back', isSuspended);
  const oddLay = getLiveRate(oddM, 'lay', isSuspended);
  const redOdds = getLiveRate(redM, 'back', isSuspended);
  const blackOdds = getLiveRate(blackM, 'back', isSuspended);
  const dulhaOdds = getLiveRate(dulhaM, 'back', isSuspended);
  const baratiOdds = getLiveRate(baratiM, 'back', isSuspended);
  const cardRate = getLiveRate(cardJM, 'back', isSuspended);

  return (
    <div className='casino-table bollywood'>
      <div className='casino-table-box'>
        {BTABLE_MAIN.map((m) => {
          const entry = markets?.[`sid:${m.sid}`];
          const backOdds = getLiveRate(entry, 'back', isSuspended);
          const layOdds = getLiveRate(entry, 'lay', isSuspended);
          return (
            <div className='casino-odd-box-container' key={m.sid}>
              <div className='casino-nation-name'>
                {m.label}
                <div className='d-md-none'>
                  <NationBook id={m.bookId} />
                </div>
              </div>
              <div
                className={`casino-odds-box back ${!backOdds ? 'suspended-box' : ''}`}
                style={{ cursor: backOdds ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  backOdds &&
                  openBetSlip(String(m.sid), backOdds, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{backOdds || '0'}</span>
              </div>
              <div
                className={`casino-odds-box lay ${!layOdds ? 'suspended-box' : ''}`}
                style={{ cursor: layOdds ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  layOdds &&
                  openBetSlip(String(m.sid), layOdds, 'lay', isMobile)
                }
              >
                <span className='casino-odds'>{layOdds || '0'}</span>
              </div>
              <div className='d-none d-md-block w-100'>
                <NationBook id={m.bookId} />
              </div>
            </div>
          );
        })}
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box left-odd-box'>
          <div className='casino-odd-box-container'>
            <div className='casino-nation-name'>
              Odd
              <div className='d-md-none'>
                <NationBook id='odd' />
              </div>
            </div>
            <div
              className={`casino-odds-box back ${!oddBack ? 'suspended-box' : ''}`}
              style={{ cursor: oddBack ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                oddBack && openBetSlip('7', oddBack, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{oddBack || '0'}</span>
            </div>
            <div
              className={`casino-odds-box lay ${!oddLay ? 'suspended-box' : ''}`}
              style={{ cursor: oddLay ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                oddLay && openBetSlip('7', oddLay, 'lay', isMobile)
              }
            >
              <span className='casino-odds'>{oddLay || '0'}</span>
            </div>
            <div className='d-none d-md-block w-100'>
              <NationBook id='odd' />
            </div>
          </div>
        </div>

        <div className='casino-table-right-box right-odd-box'>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{dulhaOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!dulhaOdds ? 'suspended-box' : ''}`}
              style={{ cursor: dulhaOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                dulhaOdds && openBetSlip('14', dulhaOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Dulha Dulhan K-Q</span>
            </div>
            <NationBook id='dulhadulhan' />
          </div>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{baratiOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!baratiOdds ? 'suspended-box' : ''}`}
              style={{ cursor: baratiOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                baratiOdds && openBetSlip('15', baratiOdds, 'back', isMobile)
              }
            >
              <span className='casino-odds'>Barati J-A</span>
            </div>
            <NationBook id='barati' />
          </div>
        </div>
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <div className='aaa-odd-box'>
            <div className='casino-odds text-center'>{redOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!redOdds ? 'suspended-box' : ''}`}
              style={{ cursor: redOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                redOdds && openBetSlip('8', redOdds, 'back', isMobile)
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
            <div className='casino-odds text-center'>{blackOdds || '0'}</div>
            <div
              className={`casino-odds-box back casino-odds-box-theme ${!blackOdds ? 'suspended-box' : ''}`}
              style={{ cursor: blackOdds ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                blackOdds && openBetSlip('9', blackOdds, 'back', isMobile)
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

        <div className='casino-table-right-box right-cards'>
          <div className='casino-odds mb-1 w-100 text-center'>
            {cardRate || '0'}
          </div>
          {BTABLE_CARDS.map((c) => {
            const entry = markets?.[`sid:${c.sid}`];
            const rate = getLiveRate(entry, 'back', isSuspended);
            return (
              <div className='card-odd-box' key={c.sid}>
                <div
                  className={!rate ? 'suspended-box' : ''}
                  style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    rate && openBetSlip(String(c.sid), rate, 'back', isMobile)
                  }
                >
                  <img src={`/assets/img/cards/${c.img}.png`} alt={c.label} />
                </div>
                <NationBook id={`card:${c.rank}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   6. MOGAMBO (Exact D247 rendered.html DOM)
   Live API: 1:Mogambo (Back), 2:Daga / Teja (Back),
             3:3 Card Total (Fancy2: b/bbhav & l/lbhav)
   ========================================================================== */
function TableMogambo({ isMobile, isSuspended, openBetSlip, markets }) {
  const mogamboM = getBySidOrNat(markets, 1, 'Mogambo');
  const dagaM = getBySidOrNat(markets, 2, 'Daga / Teja');
  const totalM = getBySidOrNat(markets, 3, '3 Card Total');

  const mogOdds = getLiveRate(mogamboM, 'back', isSuspended);
  const dagaOdds = getLiveRate(dagaM, 'back', isSuspended);

  const totalOpen = isOpenEntry(totalM, isSuspended);
  const tLayLine = Number(totalM?.lay || 0);
  const tLayBhav = Number(totalM?.lbhav || 0);
  const tLayDec =
    totalOpen && tLayLine > 0 && tLayBhav > 0
      ? Math.round((1 + tLayBhav / 100) * 100) / 100
      : 0;
  const tBackLine = Number(totalM?.back || 0);
  const tBackBhav = Number(totalM?.bbhav || 0);
  const tBackDec =
    totalOpen && tBackLine > 0 && tBackBhav > 0
      ? Math.round((1 + tBackBhav / 100) * 100) / 100
      : 0;

  return (
    <div className='casino-table mogambo'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          <div className='casino-table-body'>
            <div className='casino-table-row mini-baccarat'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Daga / Teja</div>
                <NationBook id='dagateja' />
              </div>
              <div
                className={`casino-odds-box back ${!dagaOdds ? 'suspended-box' : ''}`}
                style={{ cursor: dagaOdds ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  dagaOdds && openBetSlip('2', dagaOdds, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{dagaOdds || '0'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='casino-table-right-box'>
          <div className='casino-table-body'>
            <div className='casino-table-row mini-baccarat'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Mogambo</div>
                <NationBook id='mogambo' />
              </div>
              <div
                className={`casino-odds-box back ${!mogOdds ? 'suspended-box' : ''}`}
                style={{ cursor: mogOdds ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  mogOdds && openBetSlip('1', mogOdds, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{mogOdds || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='casino-table-box three-card-total mt-2'>
        <div className='casino-table-left-box'>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>3 Card Total</div>
                <NationBook id={`total:${tBackLine || tLayLine || 21}`} />
              </div>
              <div
                className={`casino-odds-box lay ${!tLayDec ? 'suspended-box' : ''}`}
                style={{ cursor: tLayDec ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  tLayDec && openBetSlip('3', tLayDec, 'lay', isMobile)
                }
              >
                <span className='casino-odds'>{tLayDec ? tLayLine : '0'}</span>
                {tLayDec ? (
                  <span className='casino-volume'>{tLayBhav}</span>
                ) : null}
              </div>
              <div
                className={`casino-odds-box back ${!tBackDec ? 'suspended-box' : ''}`}
                style={{ cursor: tBackDec ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  tBackDec && openBetSlip('3', tBackDec, 'back', isMobile)
                }
              >
                <span className='casino-odds'>
                  {tBackDec ? tBackLine : '0'}
                </span>
                {tBackDec ? (
                  <span className='casino-volume'>{tBackBhav}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   7. LOTTCARD (Exact D247 Single / Double / Tripple Card Picker)
   Live API: 1:Single (b=9.5), 2:Double (b=95), 3:Triple (b=900)
   Cards A..9 -> digits 1..9, Card 10 -> digit 0
   ========================================================================== */
const LOTT_CARDS = [
  { img: 'A', digit: '1', label: '1' },
  { img: '2', digit: '2', label: '2' },
  { img: '3', digit: '3', label: '3' },
  { img: '4', digit: '4', label: '4' },
  { img: '5', digit: '5', label: '5' },
  { img: '6', digit: '6', label: '6' },
  { img: '7', digit: '7', label: '7' },
  { img: '8', digit: '8', label: '8' },
  { img: '9', digit: '9', label: '9' },
  { img: '10', digit: '0', label: '0' },
];

const LOTT_TABS = [
  { key: 'single', label: 'Single', sid: 1, len: 1 },
  { key: 'double', label: 'Double', sid: 2, len: 2 },
  { key: 'triple', label: 'Tripple', sid: 3, len: 3 },
];

function TableLottcard({ isMobile, isSuspended, openBetSlip, markets }) {
  const [tab, setTab] = useState('single');
  const [picked, setPicked] = useState([]);

  const activeTab = LOTT_TABS.find((t) => t.key === tab) || LOTT_TABS[0];
  const entry = markets?.[`sid:${activeTab.sid}`];
  const liveRate = getLiveRate(entry, 'back', isSuspended);

  const handleCardClick = (digit) => {
    if (!liveRate) return;
    if (activeTab.len === 1) {
      openBetSlip(`lott:single:${digit}`, liveRate, 'back', isMobile);
      return;
    }
    const next = [...picked, digit].slice(0, activeTab.len);
    if (next.length === activeTab.len) {
      openBetSlip(
        `lott:${activeTab.key}:${next.join('')}`,
        liveRate,
        'back',
        isMobile
      );
      setPicked([]);
    } else {
      setPicked(next);
    }
  };

  return (
    <div className='casino-table lottery'>
      <div className='nav nav-pills' role='tablist'>
        {LOTT_TABS.map((t) => {
          const m = markets?.[`sid:${t.sid}`];
          const r = getLiveRate(m, 'back', isSuspended);
          return (
            <div className='nav-item' key={t.key}>
              <button
                type='button'
                role='tab'
                aria-selected={tab === t.key}
                className={`nav-link ${tab === t.key ? 'active' : ''}`}
                onClick={() => {
                  setTab(t.key);
                  setPicked([]);
                }}
              >
                {t.label} ({r || 0})
              </button>
            </div>
          );
        })}
      </div>

      {activeTab.len > 1 && (
        <div className='mt-2 flex items-center justify-between rounded bg-[#f2f2f2] px-3 py-1.5 text-xs'>
          <span>
            Select {activeTab.len} cards:{' '}
            <b>
              {picked.length
                ? picked.join(' - ')
                : Array(activeTab.len).fill('_').join(' - ')}
            </b>
          </span>
          {picked.length > 0 && (
            <button
              type='button'
              className='rounded bg-[#d9534f] px-2 py-0.5 text-[11px] text-white'
              onClick={() => setPicked([])}
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div className='tab-content mt-2 w-100'>
        <div className={activeTab.key === 'triple' ? 'tripple' : activeTab.key}>
          <div className={`lottery-box ${!liveRate ? 'suspended-box' : ''}`}>
            {LOTT_CARDS.map((c) => (
              <div
                className='lottery-card'
                key={c.digit}
                style={{ cursor: liveRate ? 'pointer' : 'not-allowed' }}
                onClick={() => handleCardClick(c.digit)}
              >
                <img src={`/assets/img/cards/${c.img}.png`} alt={c.label} />
                {activeTab.len === 1 && (
                  <NationBook id={`lott:single:${c.digit}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const TABLES = {
  lucky5: TableLucky5,
  lucky7: TableLucky7Live,
  lucky7eu: TableLucky7Live,
  lucky7eu2: TableLucky7Live,
  plucky7: TableLucky7Live,
  lucky15: TableLucky15,
  aaa: TableAaaLive,
  aaa2: TableAaaLive,
  btable: TableBtableLive,
  btable2: TableBtableLive,
  mogambo: TableMogambo,
  lottcard: TableLottcard,
};

export default TABLES;

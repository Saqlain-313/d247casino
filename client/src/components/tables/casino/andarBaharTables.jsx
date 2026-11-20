import { useCasino } from '../../../context/CasinoContext';
import { NationBook } from './shared';

const RANKS = [
  { rank: 1, img: 'A', label: 'A' },
  { rank: 2, img: '2', label: '2' },
  { rank: 3, img: '3', label: '3' },
  { rank: 4, img: '4', label: '4' },
  { rank: 5, img: '5', label: '5' },
  { rank: 6, img: '6', label: '6' },
  { rank: 7, img: '7', label: '7' },
  { rank: 8, img: '8', label: '8' },
  { rank: 9, img: '9', label: '9' },
  { rank: 10, img: '10', label: '10' },
  { rank: 11, img: 'J', label: 'J' },
  { rank: 12, img: 'Q', label: 'Q' },
  { rank: 13, img: 'K', label: 'K' },
];

const isOpenEntry = (entry, isSuspended) => {
  if (isSuspended || !entry) return false;
  const gs = String(entry.gstatus ?? entry.status ?? '').toUpperCase();
  return ['OPEN', 'ACTIVE'].includes(gs);
};

const getLiveBack = (entry, isSuspended) => {
  if (!isOpenEntry(entry, isSuspended)) return 0;
  const v = Number(entry?.back ?? entry?.b ?? 0);
  return Number.isFinite(v) && v > 1 ? v : 0;
};

/* ==========================================================================
   1. ANDAR BAHAR 50 / 150 CARDS (ab3, ab4) — Exact D247 rendered.html DOM
   Live API: sub[0] = active Card N ({ sid, nat: "Card N", b: 2, gstatus })
             child = 26 entries (sid 1..13 Andar A..K, sid 21..33 Bahar A..K)
             child.b === 1 => side open, child.l => remaining count in deck
   ========================================================================== */
function TableAbChild({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const child = Array.isArray(roundData?.child) ? roundData.child : [];
  const active = subs[0] || null;
  const activeRate = getLiveBack(active, isSuspended);

  const andar = child.filter((c) => Number(c.sid) >= 1 && Number(c.sid) <= 13);
  const bahar = child.filter((c) => Number(c.sid) >= 21 && Number(c.sid) <= 33);

  const renderSide = (title, boxCls, sideKey, list) => {
    const anyOpen =
      Boolean(activeRate) &&
      list.some((item) => Number(item.b) === 1 && Number(item.l) > 0);
    return (
      <div className={`${boxCls} ${!anyOpen ? 'suspended-box' : ''}`}>
        <div className='ab-title'>{title}</div>
        <div className='ab-cards'>
          {RANKS.map((rk, idx) => {
            const item =
              list.find(
                (c) =>
                  Number(c.sid) ===
                  (sideKey === 'andar' ? rk.rank : 20 + rk.rank)
              ) || list[idx];
            const rem = Number(item?.l ?? 0);
            const open =
              Boolean(activeRate) && Number(item?.b) === 1 && rem > 0;
            const imgNum = open ? rk.rank : 0;
            const selKey = active
              ? `abchild:${active.sid}:${sideKey}:${rk.rank}`
              : '';
            return (
              <div className='card-odd-box' key={rk.rank}>
                <div className='casino-odds'>{rem}</div>
                <div
                  style={{ cursor: open ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    open && openBetSlip(selKey, activeRate, 'back', isMobile)
                  }
                >
                  <img
                    src={`/assets/img/andar-bahar-cards/${imgNum}.jpg`}
                    alt={`${title} ${rk.label}`}
                  />
                </div>
                {selKey ? <NationBook id={selKey} /> : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className='casino-table ab3'>
      <div className='casino-table-box'>
        {renderSide('ANDAR', 'andar-box', 'andar', andar)}
        {renderSide('BAHAR', 'bahar-box', 'bahar', bahar)}
      </div>
    </div>
  );
}

/* ==========================================================================
   2. ANDAR BAHAR 2020 (ab20) — Exact D247 rendered.html DOM
   Live API: 26 subs (sid 1..13 Andar A..K, sid 21..33 Bahar A..K) + ares/bres
   ========================================================================== */
function TableAb20({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const ares = String(roundData?.ares || '')
    .split(',')
    .map((x) => Number(x.trim()));
  const bres = String(roundData?.bres || '')
    .split(',')
    .map((x) => Number(x.trim()));

  const renderRow = (title, boxCls, sideKey, baseSid, resArr) => (
    <div className={boxCls}>
      <div className='ab-title'>{title}</div>
      <div className='ab-cards'>
        {RANKS.map((rk, idx) => {
          const targetSid = baseSid + rk.rank;
          const m = subs.find((s) => Number(s.sid) === targetSid);
          const rate = getLiveBack(m, isSuspended);
          const revealed = Number(resArr[idx]) > 0;
          const imgNum = revealed || rate ? rk.rank : 0;
          return (
            <div className='card-odd-box' key={targetSid}>
              <div
                className={!rate && !revealed ? 'suspended-box' : ''}
                style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  rate && openBetSlip(String(targetSid), rate, 'back', isMobile)
                }
              >
                <img
                  src={`/assets/img/andar-bahar-cards/${imgNum}.jpg`}
                  alt={`${title} ${rk.label}`}
                />
              </div>
              <NationBook id={`ab20:${sideKey}:${rk.rank}`} />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className='casino-table ab20'>
      <div className='casino-table-box'>
        {renderRow('ANDAR', 'andar-box', 'andar', 0, ares)}
        {renderRow('BAHAR', 'bahar-box', 'bahar', 20, bres)}
      </div>
    </div>
  );
}

/* ==========================================================================
   3. ANDAR BAHAR 2 (abj) — Exact D247 rendered.html DOM
   Live API: 1:SA, 2:1st Bet (A), 3:2nd Bet (A),
             4:SB, 5:1st Bet (B), 6:2nd Bet (B),
             7..19:Joker A..K, 20:Joker Spade, 21:Joker Club,
             22:Joker Heart, 23:Joker Diamond, 24:Joker Odd, 25:Joker Even
   ========================================================================== */
const ABJ_SUITS = [
  { sid: 20, name: 'spade', img: 'spade.png' },
  { sid: 21, name: 'club', img: 'club.png' },
  { sid: 22, name: 'heart', img: 'heart.png' },
  { sid: 23, name: 'diamond', img: 'diamond.png' },
];

function TableAbj({ isMobile, isSuspended, openBetSlip, markets }) {
  const bySid = (sid) => markets?.[`sid:${sid}`];

  const renderPlayerRow = (letter, saSid, saLbl, firstSid, secondSid, keys) => {
    const saRate = getLiveBack(bySid(saSid), isSuspended);
    const f1Rate = getLiveBack(bySid(firstSid), isSuspended);
    const f2Rate = getLiveBack(bySid(secondSid), isSuspended);
    return (
      <div className='playera-bets'>
        <div className='playera-title'>{letter}</div>
        <div className='player-sa'>
          <div
            className={`player-sa-box ${!saRate ? 'suspended-box' : ''}`}
            style={{ cursor: saRate ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              saRate && openBetSlip(String(saSid), saRate, 'back', isMobile)
            }
          >
            <div className='casino-odds'>{saLbl}</div>
            <div className='casino-volume'>{saRate || '0'}</div>
          </div>
          <NationBook id={keys[0]} />
        </div>

        <div className='player-bet'>
          <div
            className={`player-bet-box ${!f1Rate ? 'suspended-box' : ''}`}
            style={{ cursor: f1Rate ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              f1Rate && openBetSlip(String(firstSid), f1Rate, 'back', isMobile)
            }
          >
            <div className='casino-odds'>First Bet</div>
            <div className='casino-volume'>{f1Rate || '0'}</div>
          </div>
          <NationBook id={keys[1]} />
        </div>

        <div className='player-bet'>
          <div
            className={`player-bet-box ${!f2Rate ? 'suspended-box' : ''}`}
            style={{ cursor: f2Rate ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              f2Rate && openBetSlip(String(secondSid), f2Rate, 'back', isMobile)
            }
          >
            <div className='casino-odds'>Second Bet</div>
            <div className='casino-volume'>{f2Rate || '0'}</div>
          </div>
          <NationBook id={keys[2]} />
        </div>
        <div className='playera-title'>{letter}</div>
      </div>
    );
  };

  const oddRate = getLiveBack(bySid(24), isSuspended);
  const evenRate = getLiveBack(bySid(25), isSuspended);
  const jokerCardRate = getLiveBack(bySid(7), isSuspended);

  return (
    <div className='casino-table ab2'>
      <div className='casino-table-full-box'>
        {renderPlayerRow('A', 1, 'SA', 2, 3, ['abj:sa', 'abj:a1', 'abj:a2'])}
        {renderPlayerRow('B', 4, 'SB', 5, 6, ['abj:sb', 'abj:b1', 'abj:b2'])}
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <div className='ab2-box'>
            <div className='casino-odds text-center'>ODD</div>
            <div
              className={`casino-odds-box back ${!oddRate ? 'suspended-box' : ''}`}
              style={{ cursor: oddRate ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                oddRate && openBetSlip('24', oddRate, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{oddRate || '0'}</span>
            </div>
            <NationBook id='joker:odd' />
          </div>
          <div className='ab2-box'>
            <div className='casino-odds text-center'>EVEN</div>
            <div
              className={`casino-odds-box back ${!evenRate ? 'suspended-box' : ''}`}
              style={{ cursor: evenRate ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                evenRate && openBetSlip('25', evenRate, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{evenRate || '0'}</span>
            </div>
            <NationBook id='joker:even' />
          </div>
        </div>

        <div className='casino-table-right-box'>
          {ABJ_SUITS.map((st) => {
            const rate = getLiveBack(bySid(st.sid), isSuspended);
            return (
              <div className='ab2-box' key={st.sid}>
                <div className='casino-odds text-center'>
                  <img src={`/assets/img/icons/${st.img}`} alt={st.name} />
                </div>
                <div
                  className={`casino-odds-box back ${!rate ? 'suspended-box' : ''}`}
                  style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    rate && openBetSlip(String(st.sid), rate, 'back', isMobile)
                  }
                >
                  <span className='casino-odds'>{rate || '0'}</span>
                </div>
                <NationBook id={`joker:suit:${st.name}`} />
              </div>
            );
          })}
        </div>
      </div>

      <div className='casino-table-full-box ab2cards mt-3'>
        <div className='casino-odds mb-1 w-100 text-center'>
          {jokerCardRate || '0'}
        </div>
        {RANKS.map((rk) => {
          const sid = 6 + rk.rank; // 7..19
          const rate = getLiveBack(bySid(sid), isSuspended);
          return (
            <div className='card-odd-box' key={sid}>
              <div
                className={!rate ? 'suspended-box' : ''}
                style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  rate && openBetSlip(String(sid), rate, 'back', isMobile)
                }
              >
                <img
                  src={`/assets/img/cards/${rk.img}.png`}
                  alt={`Joker ${rk.label}`}
                />
              </div>
              <NationBook id={`joker:card:${rk.rank}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const TABLES = {
  ab3: TableAbChild,
  ab4: TableAbChild,
  ab20: TableAb20,
  abj: TableAbj,
};

export default TABLES;

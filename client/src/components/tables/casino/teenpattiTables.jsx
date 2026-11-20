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
   1. CLASSIC & PREMIUM 1-DAY TEENPATTI (teen, pteen)
   Live API: 1:Player A (B+L), 2:Player B (B+L), 17:Player A Consec (B+L),
             18:Player B Consec (B+L), 11..16:Card 1..6 (nested Odd/Even),
             3..6:Player A Suits, 7..10:Player B Suits
   ========================================================================== */
function TableTeen1Day({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  const renderPlayerPanel = (title, mainSid, conSid, mainBook, conBook) => {
    const mainM = markets?.[`sid:${mainSid}`];
    const conM = markets?.[`sid:${conSid}`];
    const mB = getLiveRate(mainM, 'back', isSuspended);
    const mL = getLiveRate(mainM, 'lay', isSuspended);
    const cB = getLiveRate(conM, 'back', isSuspended);
    const cL = getLiveRate(conM, 'lay', isSuspended);
    return (
      <>
        <div className='casino-table-header'>
          <div className='casino-nation-detail'>{title}</div>
          <div className='casino-odds-box back'>Back</div>
          <div className='casino-odds-box lay'>Lay</div>
        </div>
        <div className='casino-table-body'>
          <div
            className={`casino-table-row ${!mB && !mL ? 'suspended-row' : ''}`}
          >
            <div className='casino-nation-detail'>
              <div className='casino-nation-name'>Main</div>
              <NationBook id={mainBook} />
            </div>
            <div
              className={`casino-odds-box back ${!mB ? 'suspended-box' : ''}`}
              style={{ cursor: mB ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                mB && openBetSlip(String(mainSid), mB, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{mB || '0'}</span>
            </div>
            <div
              className={`casino-odds-box lay ${!mL ? 'suspended-box' : ''}`}
              style={{ cursor: mL ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                mL && openBetSlip(String(mainSid), mL, 'lay', isMobile)
              }
            >
              <span className='casino-odds'>{mL || '0'}</span>
            </div>
          </div>

          <div
            className={`casino-table-row ${!cB && !cL ? 'suspended-row' : ''}`}
          >
            <div className='casino-nation-detail'>
              <div className='casino-nation-name'>Consecutive</div>
              <NationBook id={conBook} />
            </div>
            <div
              className={`casino-odds-box back ${!cB ? 'suspended-box' : ''}`}
              style={{ cursor: cB ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                cB && openBetSlip(String(conSid), cB, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{cB || '0'}</span>
            </div>
            <div
              className={`casino-odds-box lay ${!cL ? 'suspended-box' : ''}`}
              style={{ cursor: cL ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                cL && openBetSlip(String(conSid), cL, 'lay', isMobile)
              }
            >
              <span className='casino-odds'>{cL || '0'}</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  const cardSubs = [11, 12, 13, 14, 15, 16].map(
    (sid, idx) =>
      subs.find((s) => Number(s.sid) === sid) || {
        sid,
        nat: `Card ${idx + 1}`,
        gstatus: 'SUSPENDED',
        odds: [],
      }
  );

  const getNestedRate = (parent, parity) => {
    if (!isOpenEntry(parent, isSuspended)) return 0;
    const child = parent?.odds?.find(
      (o) =>
        String(o?.nat || '')
          .trim()
          .toLowerCase() === parity
    );
    const v = Number(child?.b ?? 0);
    return Number.isFinite(v) && v > 1 ? v : 0;
  };

  return (
    <div className='casino-table teenpatti1day'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          {renderPlayerPanel('Player A', 1, 17, 'A', 'consec:A')}
        </div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>
          {renderPlayerPanel('Player B', 2, 18, 'B', 'consec:B')}
        </div>
      </div>

      {/* Card 1..6 Odd / Even */}
      <div className='casino-table-full-box teenpatti1day-other-odds mt-3'>
        <div className='casino-table-header'>
          <div className='casino-nation-detail' />
          {cardSubs.map((c, idx) => (
            <div className='casino-odds-box back' key={c.sid}>
              Card {idx + 1}
            </div>
          ))}
        </div>
        <div className='casino-table-body'>
          {['odd', 'even'].map((parity) => (
            <div className='casino-table-row' key={parity}>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>
                  {parity === 'odd' ? 'Odd' : 'Even'}
                </div>
              </div>
              {cardSubs.map((c, idx) => {
                const r = getNestedRate(c, parity);
                return (
                  <div
                    key={`${c.sid}-${parity}`}
                    className={`casino-odds-box back ${!r ? 'suspended-box' : ''}`}
                    style={{ cursor: r ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      r &&
                      openBetSlip(`${c.sid}:${parity}`, r, 'back', isMobile)
                    }
                  >
                    <span className='casino-odds'>{r || '0'}</span>
                    <NationBook id={`cardparity:${idx + 1}:${parity}`} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. 20-20 TEENPATTI FAMILY (teen20, teen20b, teen20c, pteen20)
   Live API: 1:Player A, 2:Player B, 3:Pair Plus A, 4:Pair Plus B,
             5:3 Baccarat A, 6:3 Baccarat B, 7:Black A, 8:Red A,
             9:Black B, 10:Red B, 11:Total A, 12:Total B
   ========================================================================== */
function TableTeen20({ isMobile, isSuspended, openBetSlip, markets }) {
  const renderPanel = (who, label, sids) => {
    const winR = getLiveRate(markets?.[`sid:${sids.win}`], 'back', isSuspended);
    const bacR = getLiveRate(markets?.[`sid:${sids.bac}`], 'back', isSuspended);
    const totR = getLiveRate(markets?.[`sid:${sids.tot}`], 'back', isSuspended);
    const ppR = getLiveRate(markets?.[`sid:${sids.pp}`], 'back', isSuspended);
    const redR = getLiveRate(markets?.[`sid:${sids.red}`], 'back', isSuspended);
    const blkR = getLiveRate(markets?.[`sid:${sids.blk}`], 'back', isSuspended);

    return (
      <>
        <div className='casino-table-header'>
          <div className='casino-nation-detail'>{label}</div>
        </div>
        <div className='casino-table-body'>
          <div className='casino-table-row'>
            <div className='casino-odds-box'>Player {who}</div>
            <div className='casino-odds-box'>3 Baccarat {who}</div>
            <div className='casino-odds-box'>Total {who}</div>
            <div className='casino-odds-box'>Pair Plus {who}</div>
          </div>
          <div className='casino-table-row'>
            <div
              className={`casino-odds-box back ${!winR ? 'suspended-box' : ''}`}
              style={{ cursor: winR ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                winR && openBetSlip(String(sids.win), winR, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{winR || '0'}</span>
              <NationBook id={who} />
            </div>
            <div
              className={`casino-odds-box back ${!bacR ? 'suspended-box' : ''}`}
              style={{ cursor: bacR ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                bacR && openBetSlip(String(sids.bac), bacR, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{bacR || '0'}</span>
              <NationBook id={`baccarat:${who}`} />
            </div>
            <div
              className={`casino-odds-box back ${!totR ? 'suspended-box' : ''}`}
              style={{ cursor: totR ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                totR && openBetSlip(String(sids.tot), totR, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{totR || '0'}</span>
              <NationBook id={`total:${who}`} />
            </div>
            <div
              className={`casino-odds-box back ${!ppR ? 'suspended-box' : ''}`}
              style={{ cursor: ppR ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                ppR && openBetSlip(String(sids.pp), ppR, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{ppR ? who : '0'}</span>
              <NationBook id={`pairplus:${who}`} />
            </div>
          </div>

          <div className='casino-table-row teenpatti20-other-oods mt-1'>
            <div
              className={`casino-odds-box back ${!redR ? 'suspended-box' : ''}`}
              style={{ cursor: redR ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                redR && openBetSlip(String(sids.red), redR, 'back', isMobile)
              }
            >
              <span className='casino-odds'>
                <span className='card-icon me-1'>
                  <span className='card-red'>{'{'}</span>
                </span>
                <span className='card-icon me-1'>
                  <span className='card-red'>{'['}</span>
                </span>
                {redR || '0'}
              </span>
              <NationBook id={`redblack:${who}:red`} />
            </div>
            <div
              className={`casino-odds-box back ${!blkR ? 'suspended-box' : ''}`}
              style={{ cursor: blkR ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                blkR && openBetSlip(String(sids.blk), blkR, 'back', isMobile)
              }
            >
              <span className='casino-odds'>
                <span className='card-icon me-1'>
                  <span className='card-black'>{'}'}</span>
                </span>
                <span className='card-icon me-1'>
                  <span className='card-black'>{']'}</span>
                </span>
                {blkR || '0'}
              </span>
              <NationBook id={`redblack:${who}:black`} />
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className='casino-table teenpatti20'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          {renderPanel('A', 'Player A', {
            win: 1,
            pp: 3,
            bac: 5,
            blk: 7,
            red: 8,
            tot: 11,
          })}
        </div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>
          {renderPanel('B', 'Player B', {
            win: 2,
            pp: 4,
            bac: 6,
            blk: 9,
            red: 10,
            tot: 12,
          })}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. MUFLIS TEENPATTI (teenmuf) — Exact D247 rendered.html DOM
   Live API: 1:Player A, 2:Player B, 3:Top 9 A, 4:Top 9 B,
             5:M Baccarat A, 6:M Baccarat B
   ========================================================================== */
function TableTeenmuf({ isMobile, isSuspended, openBetSlip, markets }) {
  const renderSide = (who, wSid, t9Sid, mbSid) => {
    const wR = getLiveRate(markets?.[`sid:${wSid}`], 'back', isSuspended);
    const t9R = getLiveRate(markets?.[`sid:${t9Sid}`], 'back', isSuspended);
    const mbR = getLiveRate(markets?.[`sid:${mbSid}`], 'back', isSuspended);
    return (
      <>
        <div className='casino-table-header'>
          <div className='casino-nation-detail'>Player {who}</div>
        </div>
        <div className='casino-table-body'>
          <div className='casino-table-row'>
            <div className='casino-odds-box'>Winner</div>
            <div className='casino-odds-box'>Top 9</div>
            <div className='casino-odds-box'>M Baccarat {who}</div>
          </div>
          <div className='casino-table-row'>
            <div
              className={`casino-odds-box back ${!wR ? 'suspended-box' : ''}`}
              style={{ cursor: wR ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                wR && openBetSlip(String(wSid), wR, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{wR || '0'}</span>
              <NationBook id={who} />
            </div>
            <div
              className={`casino-odds-box back ${!t9R ? 'suspended-box' : ''}`}
              style={{ cursor: t9R ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                t9R && openBetSlip(String(t9Sid), t9R, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{t9R ? who : '0'}</span>
              <NationBook id={`top9:${who}`} />
            </div>
            <div
              className={`casino-odds-box back ${!mbR ? 'suspended-box' : ''}`}
              style={{ cursor: mbR ? 'pointer' : 'not-allowed' }}
              onClick={() =>
                mbR && openBetSlip(String(mbSid), mbR, 'back', isMobile)
              }
            >
              <span className='casino-odds'>{mbR || '0'}</span>
              <NationBook id={`baccarat:${who}`} />
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className='casino-table teenpatti20'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>{renderSide('A', 1, 3, 5)}</div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>{renderSide('B', 2, 4, 6)}</div>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. INSTANT TEENPATTI (teen3, teen32, teen33) & JOKER 1 / 120 (joker1, joker120)
   Live API: 2 main runners (Player A & Player B — note joker1/joker120 use sid 14 & 140!)
   ========================================================================== */
function TableTwoPlayerMain({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const pA = subs[0] || { sid: 1, nat: 'Player A', gstatus: 'SUSPENDED' };
  const pB = subs[1] || { sid: 2, nat: 'Player B', gstatus: 'SUSPENDED' };

  const renderBox = (item, bookId) => {
    const b = getLiveRate(item, 'back', isSuspended);
    const l = getLiveRate(item, 'lay', isSuspended);
    return (
      <div className='casino-table-body'>
        <div className='casino-table-row'>
          <div className='casino-nation-detail'>
            <div className='casino-nation-name'>{item.nat}</div>
            <NationBook id={bookId} />
          </div>
          <div
            className={`casino-odds-box back ${!b ? 'suspended-box' : ''}`}
            style={{ cursor: b ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              b && openBetSlip(String(item.sid), b, 'back', isMobile)
            }
          >
            <span className='casino-odds'>{b || '0'}</span>
          </div>
          <div
            className={`casino-odds-box lay ${!l ? 'suspended-box' : ''}`}
            style={{ cursor: l ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              l && openBetSlip(String(item.sid), l, 'lay', isMobile)
            }
          >
            <span className='casino-odds'>{l || '0'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='casino-table teenpatti1day'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>{renderBox(pA, 'A')}</div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>{renderBox(pB, 'B')}</div>
      </div>
    </div>
  );
}

/* ==========================================================================
   5. QUEEN TOP / JACK TOP OPEN TEENPATTI (teen41, teen42)
   Live API: 1:Player A (B+L), 2:Player B (B+L),
             3:Player B Under 21 (B), 4:Player B Over 21 (B)
   ========================================================================== */
function TableTeen41({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();
  const aM = markets?.['sid:1'];
  const bM = markets?.['sid:2'];
  const uM = markets?.['sid:3'];
  const oM = markets?.['sid:4'];

  const aB = getLiveRate(aM, 'back', isSuspended);
  const aL = getLiveRate(aM, 'lay', isSuspended);
  const bB = getLiveRate(bM, 'back', isSuspended);
  const bL = getLiveRate(bM, 'lay', isSuspended);
  const uR = getLiveRate(uM, 'back', isSuspended);
  const oR = getLiveRate(oM, 'back', isSuspended);

  return (
    <div className='casino-table teenpatti1day'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail'>Player A</div>
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Main</div>
                <NationBook id='A' />
              </div>
              <div
                className={`casino-odds-box back ${!aB ? 'suspended-box' : ''}`}
                style={{ cursor: aB ? 'pointer' : 'not-allowed' }}
                onClick={() => aB && openBetSlip('1', aB, 'back', isMobile)}
              >
                <span className='casino-odds'>{aB || '0'}</span>
              </div>
              <div
                className={`casino-odds-box lay ${!aL ? 'suspended-box' : ''}`}
                style={{ cursor: aL ? 'pointer' : 'not-allowed' }}
                onClick={() => aL && openBetSlip('1', aL, 'lay', isMobile)}
              >
                <span className='casino-odds'>{aL || '0'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='casino-table-box-divider' />

        <div className='casino-table-right-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail'>Player B</div>
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Main</div>
                <NationBook id='B' />
              </div>
              <div
                className={`casino-odds-box back ${!bB ? 'suspended-box' : ''}`}
                style={{ cursor: bB ? 'pointer' : 'not-allowed' }}
                onClick={() => bB && openBetSlip('2', bB, 'back', isMobile)}
              >
                <span className='casino-odds'>{bB || '0'}</span>
              </div>
              <div
                className={`casino-odds-box lay ${!bL ? 'suspended-box' : ''}`}
                style={{ cursor: bL ? 'pointer' : 'not-allowed' }}
                onClick={() => bL && openBetSlip('2', bL, 'lay', isMobile)}
              >
                <span className='casino-odds'>{bL || '0'}</span>
              </div>
            </div>

            <div className='casino-table-row under-over-row'>
              <div className='uo-box'>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>
                    {uM?.nat || 'Player B Under 21'}
                  </div>
                  <NationBook id='under21:B' />
                </div>
                <div
                  className={`casino-odds-box back ${!uR ? 'suspended-box' : ''}`}
                  style={{ cursor: uR ? 'pointer' : 'not-allowed' }}
                  onClick={() => uR && openBetSlip('3', uR, 'back', isMobile)}
                >
                  <span className='casino-odds'>{uR || '0'}</span>
                </div>
              </div>
              <div className='uo-box'>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>
                    {oM?.nat || 'Player B Over 21'}
                  </div>
                  <NationBook id='over21:B' />
                </div>
                <div
                  className={`casino-odds-box back ${!oR ? 'suspended-box' : ''}`}
                  style={{ cursor: oR ? 'pointer' : 'not-allowed' }}
                  onClick={() => oR && openBetSlip('4', oR, 'back', isMobile)}
                >
                  <span className='casino-odds'>{oR || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
   6. TEENPATTI 2.0 (teen6) — Main A/B + Active Card Suit / Odd-Even / Card
   Live API: 1:Player A, 2:Player B, 3..8:Suit (nested), 13..18:Odd/Even (nested),
             19..24:Cards (nested A..K)
   ========================================================================== */
function TableTeen6({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  const aM = markets?.['sid:1'];
  const bM = markets?.['sid:2'];
  const aB = getLiveRate(aM, 'back', isSuspended);
  const aL = getLiveRate(aM, 'lay', isSuspended);
  const bB = getLiveRate(bM, 'back', isSuspended);
  const bL = getLiveRate(bM, 'lay', isSuspended);

  const activeBySt = (st) =>
    subs.find(
      (s) =>
        String(s?.subtype || '').toLowerCase() === st &&
        isOpenEntry(s, isSuspended) &&
        Array.isArray(s.odds) &&
        s.odds.length > 0
    ) ||
    subs.find(
      (s) =>
        String(s?.subtype || '').toLowerCase() === st &&
        Array.isArray(s.odds) &&
        s.odds.length > 0
    );

  const suitSub = activeBySt('suit');
  const oeSub = activeBySt('oddeven');
  const cardsSub = activeBySt('cards');

  return (
    <div className='casino-table teenpatti1day'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail'>Player A</div>
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Main</div>
                <NationBook id='A' />
              </div>
              <div
                className={`casino-odds-box back ${!aB ? 'suspended-box' : ''}`}
                style={{ cursor: aB ? 'pointer' : 'not-allowed' }}
                onClick={() => aB && openBetSlip('1', aB, 'back', isMobile)}
              >
                <span className='casino-odds'>{aB || '0'}</span>
              </div>
              <div
                className={`casino-odds-box lay ${!aL ? 'suspended-box' : ''}`}
                style={{ cursor: aL ? 'pointer' : 'not-allowed' }}
                onClick={() => aL && openBetSlip('1', aL, 'lay', isMobile)}
              >
                <span className='casino-odds'>{aL || '0'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail'>Player B</div>
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Main</div>
                <NationBook id='B' />
              </div>
              <div
                className={`casino-odds-box back ${!bB ? 'suspended-box' : ''}`}
                style={{ cursor: bB ? 'pointer' : 'not-allowed' }}
                onClick={() => bB && openBetSlip('2', bB, 'back', isMobile)}
              >
                <span className='casino-odds'>{bB || '0'}</span>
              </div>
              <div
                className={`casino-odds-box lay ${!bL ? 'suspended-box' : ''}`}
                style={{ cursor: bL ? 'pointer' : 'not-allowed' }}
                onClick={() => bL && openBetSlip('2', bL, 'lay', isMobile)}
              >
                <span className='casino-odds'>{bL || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Card Suit & Odd/Even */}
      {(suitSub || oeSub) && (
        <div className='casino-table-box mt-3'>
          {suitSub && (
            <div className='casino-table-left-box'>
              <div className='casino-table-header'>
                <div className='casino-nation-detail'>Suit ({suitSub.nat})</div>
              </div>
              <div className='casino-table-body'>
                <div className='casino-table-row'>
                  {suitSub.odds.map((o) => {
                    const suitKey = String(o.nat || '').toLowerCase();
                    const open =
                      isOpenEntry(suitSub, isSuspended) && Number(o.b) > 1;
                    return (
                      <div
                        key={o.nat}
                        className={`casino-odds-box back ${!open ? 'suspended-box' : ''}`}
                        style={{ cursor: open ? 'pointer' : 'not-allowed' }}
                        onClick={() =>
                          open &&
                          openBetSlip(
                            `${suitSub.sid}:suit:${suitKey}`,
                            Number(o.b),
                            'back',
                            isMobile
                          )
                        }
                      >
                        <span className='casino-odds'>
                          {o.nat} {open ? o.b : '0'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {oeSub && (
            <div className='casino-table-right-box'>
              <div className='casino-table-header'>
                <div className='casino-nation-detail'>
                  Odd/Even ({oeSub.nat})
                </div>
              </div>
              <div className='casino-table-body'>
                <div className='casino-table-row'>
                  {oeSub.odds.map((o) => {
                    const key = String(o.nat || '').toLowerCase();
                    const open =
                      isOpenEntry(oeSub, isSuspended) && Number(o.b) > 1;
                    return (
                      <div
                        key={o.nat}
                        className={`casino-odds-box back ${!open ? 'suspended-box' : ''}`}
                        style={{ cursor: open ? 'pointer' : 'not-allowed' }}
                        onClick={() =>
                          open &&
                          openBetSlip(
                            `${oeSub.sid}:${key}`,
                            Number(o.b),
                            'back',
                            isMobile
                          )
                        }
                      >
                        <span className='casino-odds'>
                          {o.nat} {open ? o.b : '0'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Card Exact Rank */}
      {cardsSub && (
        <div className='casino-table-full-box lucky7acards mt-3'>
          <div className='casino-odds mb-1 w-100 text-center'>
            {cardsSub.nat} (
            {isOpenEntry(cardsSub, isSuspended)
              ? Number(cardsSub.odds[0]?.b || 0)
              : 0}
            )
          </div>
          {cardsSub.odds.map((o) => {
            const rankId = Number(o.sid ?? o.sno);
            const img =
              { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[rankId] || String(rankId);
            const open = isOpenEntry(cardsSub, isSuspended) && Number(o.b) > 1;
            return (
              <div className='card-odd-box' key={rankId}>
                <div
                  className={!open ? 'suspended-box' : ''}
                  style={{ cursor: open ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    open &&
                    openBetSlip(
                      `${cardsSub.sid}:card:${rankId}`,
                      Number(o.b),
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
   7. OPEN TEENPATTI (teen8) — Exact D247 rendered.html 8-Player Table
   Live API: 1..8:Player 1..8, 9..16:Pair Plus 1..8, 17..24:Total 1..8,
             25:Any Colour, 26:Any Straight, 27:Any Trio, 28:Any Straight Flush
   ========================================================================== */
function TableTeen8({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();
  const rawCards = String(roundData?.card || '')
    .split(',')
    .map((x) => x.trim());

  const others = [
    { sid: 25, label: 'Any Colour', bookId: 'anycolour' },
    { sid: 26, label: 'Any Straight', bookId: 'anystraight' },
    { sid: 27, label: 'Any Trio', bookId: 'anytrio' },
    { sid: 28, label: 'Any Straight Flush', bookId: 'anystraightflush' },
  ];

  return (
    <div className='casino-table teenpattiopen'>
      <div className='casino-table-full-box'>
        <div className='casino-table-header'>
          <div className='casino-nation-detail' />
          <div className='casino-odds-box back'>Odds</div>
          <div className='casino-odds-box back'>Pair Plus</div>
          <div className='casino-odds-box back'>Total</div>
        </div>
        <div className='casino-table-body'>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((pNum) => {
            const oddR = getLiveRate(
              markets?.[`sid:${pNum}`],
              'back',
              isSuspended
            );
            const ppR = getLiveRate(
              markets?.[`sid:${8 + pNum}`],
              'back',
              isSuspended
            );
            const totR = getLiveRate(
              markets?.[`sid:${16 + pNum}`],
              'back',
              isSuspended
            );
            const c1 = formatInlineCard(rawCards[(pNum - 1) * 2]);
            const c2 = formatInlineCard(rawCards[(pNum - 1) * 2 + 1]);
            return (
              <div className='casino-table-row' key={pNum}>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>
                    Player {pNum}
                    {(c1 || c2) && (
                      <div className='patern-name ms-2 inline-flex gap-1.5 text-xs'>
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
                </div>
                <div
                  className={`casino-odds-box back ${!oddR ? 'suspended-box' : ''}`}
                  style={{ cursor: oddR ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    oddR && openBetSlip(String(pNum), oddR, 'back', isMobile)
                  }
                >
                  <span className='casino-odds'>{oddR || '0'}</span>
                  <NationBook id={`player:${pNum}`} />
                </div>
                <div
                  className={`casino-odds-box back ${!ppR ? 'suspended-box' : ''}`}
                  style={{ cursor: ppR ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    ppR && openBetSlip(String(8 + pNum), ppR, 'back', isMobile)
                  }
                >
                  <span className='casino-odds'>
                    {ppR ? `Pair Plus ${pNum}` : '0'}
                  </span>
                  <NationBook id={`pairplus:${pNum}`} />
                </div>
                <div
                  className={`casino-odds-box back ${!totR ? 'suspended-box' : ''}`}
                  style={{ cursor: totR ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    totR &&
                    openBetSlip(String(16 + pNum), totR, 'back', isMobile)
                  }
                >
                  <span className='casino-odds'>{totR || '0'}</span>
                  <NationBook id={`total:${pNum}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className='casino-table-full-box mt-2'>
        <div className='casino-table-body'>
          <div className='casino-table-row'>
            {others.map((o) => {
              const r = getLiveRate(
                markets?.[`sid:${o.sid}`],
                'back',
                isSuspended
              );
              return (
                <div
                  key={o.sid}
                  className={`casino-odds-box back ${!r ? 'suspended-box' : ''}`}
                  style={{ cursor: r ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    r && openBetSlip(String(o.sid), r, 'back', isMobile)
                  }
                >
                  <span className='casino-odds'>
                    {o.label} ({r || '0'})
                  </span>
                  <NationBook id={o.bookId} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   8. TEENPATTI TEST (teen9) — Exact D247 Tiger / Lion / Dragon 6-Row Matrix
   Live API: 11..16 Tiger, 21..26 Lion, 31..36 Dragon
   ========================================================================== */
const TEEN9_ROWS = [
  { offset: 0, label: 'Winner', key: (w) => `winner:${w}` },
  { offset: 1, label: 'Pair', key: (w) => `cat:${w}:pair` },
  { offset: 2, label: 'Flush', key: (w) => `cat:${w}:flush` },
  { offset: 3, label: 'Straight', key: (w) => `cat:${w}:straight` },
  { offset: 4, label: 'Trio', key: (w) => `cat:${w}:trio` },
  { offset: 5, label: 'Straight Flush', key: (w) => `cat:${w}:straightflush` },
];

const TEEN9_COLS = [
  { key: 'tiger', label: 'Tiger', baseSid: 11 },
  { key: 'lion', label: 'Lion', baseSid: 21 },
  { key: 'dragon', label: 'Dragon', baseSid: 31 },
];

function TableTeen9({ isMobile, isSuspended, openBetSlip, markets }) {
  return (
    <div className='casino-table teenpattitest'>
      <div className='casino-table-full-box'>
        <div className='casino-table-header'>
          <div className='casino-nation-detail' />
          {TEEN9_COLS.map((c) => (
            <div className='casino-odds-box back' key={c.key}>
              {c.label}
            </div>
          ))}
        </div>
        <div className='casino-table-body'>
          {TEEN9_ROWS.map((row) => (
            <div className='casino-table-row' key={row.offset}>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>{row.label}</div>
              </div>
              {TEEN9_COLS.map((col) => {
                const sid = col.baseSid + row.offset;
                const r = getLiveRate(
                  markets?.[`sid:${sid}`],
                  'back',
                  isSuspended
                );
                return (
                  <div
                    key={sid}
                    className={`casino-odds-box back ${!r ? 'suspended-box' : ''}`}
                    style={{ cursor: r ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      r && openBetSlip(String(sid), r, 'back', isMobile)
                    }
                  >
                    <span className='casino-odds'>{r || '0'}</span>
                    <NationBook id={row.key(col.key)} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   9. 29 CARD BACCARAT / TEEN SIN (teensin) — Exact D247 rendered.html DOM
   Live API: 1:Player A, 2:Player B, 3:High Card A, 4:High Card B,
             5:Pair A, 6:Pair B, 7:Color Plus A, 8:Color Plus B, 9:Lucky 9 (B+L)
   ========================================================================== */
function TableTeensin({ isMobile, isSuspended, openBetSlip, markets }) {
  const l9M = markets?.['sid:9'];
  const l9B = getLiveRate(l9M, 'back', isSuspended);
  const l9L = getLiveRate(l9M, 'lay', isSuspended);

  const renderSide = (who, sids) => (
    <>
      <div className='casino-table-header'>
        <div className='casino-nation-detail'>Player {who}</div>
      </div>
      <div className='casino-table-body'>
        <div className='casino-table-row'>
          <div className='casino-odds-box'>Winner</div>
          <div className='casino-odds-box'>High Card</div>
          <div className='casino-odds-box'>Pair</div>
          <div className='casino-odds-box'>Color Plus</div>
        </div>
        <div className='casino-table-row'>
          {sids.map((it) => {
            const r = getLiveRate(
              markets?.[`sid:${it.sid}`],
              'back',
              isSuspended
            );
            return (
              <div
                key={it.sid}
                className={`casino-odds-box back ${!r ? 'suspended-box' : ''}`}
                style={{ cursor: r ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  r && openBetSlip(String(it.sid), r, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{r || '0'}</span>
                <NationBook id={it.bookId} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className='casino-table teenpatti20'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          {renderSide('A', [
            { sid: 1, bookId: 'A' },
            { sid: 3, bookId: 'highcard:A' },
            { sid: 5, bookId: 'pair:A' },
            { sid: 7, bookId: 'colorplus:A' },
          ])}
        </div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>
          {renderSide('B', [
            { sid: 2, bookId: 'B' },
            { sid: 4, bookId: 'highcard:B' },
            { sid: 6, bookId: 'pair:B' },
            { sid: 8, bookId: 'colorplus:B' },
          ])}
        </div>
      </div>

      <div className='casino-table-box mt-2'>
        <div className='casino-table-full-box w-100'>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Lucky 9</div>
                <NationBook id='lucky9' />
              </div>
              <div
                className={`casino-odds-box back ${!l9B ? 'suspended-box' : ''}`}
                style={{ cursor: l9B ? 'pointer' : 'not-allowed' }}
                onClick={() => l9B && openBetSlip('9', l9B, 'back', isMobile)}
              >
                <span className='casino-odds'>{l9B || '0'}</span>
              </div>
              <div
                className={`casino-odds-box lay ${!l9L ? 'suspended-box' : ''}`}
                style={{ cursor: l9L ? 'pointer' : 'not-allowed' }}
                onClick={() => l9L && openBetSlip('9', l9L, 'lay', isMobile)}
              >
                <span className='casino-odds'>{l9L || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   10. 1-CARD 1-DAY (teen1) & 1-CARD 20-20 (teen120) — Exact D247 DOM
   ========================================================================== */
function TableTeen1({ isMobile, isSuspended, openBetSlip, markets }) {
  const renderMain = (sid, label, bookId) => {
    const entry = markets?.[`sid:${sid}`];
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

  const renderUpDown = (title, downSid, upSid, who) => {
    const dR = getLiveRate(markets?.[`sid:${downSid}`], 'back', isSuspended);
    const uR = getLiveRate(markets?.[`sid:${upSid}`], 'back', isSuspended);
    return (
      <>
        <h4 className='d-md-none mb-2'>{title}</h4>
        <div className='seven-up-down-box'>
          <div
            className={`up-box ${!dR ? 'suspended-box' : ''}`}
            style={{ cursor: dR ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              dR && openBetSlip(String(downSid), dR, 'back', isMobile)
            }
          >
            <div className='up-down-book'>
              <NationBook id={`down7:${who}`} />
            </div>
            <div className='text-end'>
              <div className='up-down-odds'>{dR || '0'}</div>
              <span>DOWN</span>
            </div>
          </div>
          <div
            className={`down-box ${!uR ? 'suspended-box' : ''}`}
            style={{ cursor: uR ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              uR && openBetSlip(String(upSid), uR, 'back', isMobile)
            }
          >
            <div className='up-down-book'>
              <NationBook id={`up7:${who}`} />
            </div>
            <div className='text-start'>
              <div className='up-down-odds'>{uR || '0'}</div>
              <span>UP</span>
            </div>
          </div>
          <div className='seven-box'>
            <img src='/assets/img/trape-seven.png' alt='7' />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className='casino-table onecard1day'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          {renderMain(1, 'Player', 'player')}
        </div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>
          {renderMain(2, 'Dealer', 'dealer')}
        </div>
      </div>

      <div className='casino-table-box sevenupbox mt-3'>
        <div className='casino-table-left-box'>
          {renderUpDown('Player', 4, 3, 'player')}
        </div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>
          {renderUpDown('Dealer', 6, 5, 'dealer')}
        </div>
      </div>
    </div>
  );
}

function TableTeen120({ isMobile, isSuspended, openBetSlip, markets }) {
  const items = [
    { sid: 1, label: 'Player', cls: 'onecard20player', bookId: 'player' },
    { sid: 3, label: 'Tie', cls: 'onecard20tie', bookId: 'tie' },
    { sid: 2, label: 'Dealer', cls: 'onecard20dealer', bookId: 'dealer' },
    { sid: 4, label: 'Pair', cls: 'onecard20pair', bookId: 'pair' },
  ];
  return (
    <div className='casino-table onecard20'>
      <div className='casino-table-full-box'>
        {items.map((it) => {
          const r = getLiveRate(
            markets?.[`sid:${it.sid}`],
            'back',
            isSuspended
          );
          return (
            <div className={`onecard20oddbox ${it.cls}`} key={it.sid}>
              <div className='casino-odds text-center'>{r || '0'}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${!r ? 'suspended-box' : ''}`}
                style={{ cursor: r ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  r && openBetSlip(String(it.sid), r, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{it.label}</span>
              </div>
              <NationBook id={it.bookId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   11. 2 CARDS TEENPATTI (patti2) — Exact D247 rendered.html DOM
   Live API: 1:Player A (B+L), 2:Player B (B+L), 3:Total A (Fancy2),
             4:Total B (Fancy2), 5:Mini Baccarat A, 6:Mini Baccarat B, 7:Color Plus
   ========================================================================== */
function TablePatti2({ isMobile, isSuspended, openBetSlip, markets }) {
  const renderSide = (who, pSid, mbSid, totSid) => {
    const pM = markets?.[`sid:${pSid}`];
    const pB = getLiveRate(pM, 'back', isSuspended);
    const pL = getLiveRate(pM, 'lay', isSuspended);
    const mbR = getLiveRate(markets?.[`sid:${mbSid}`], 'back', isSuspended);

    const tM = markets?.[`sid:${totSid}`];
    const tOpen = isOpenEntry(tM, isSuspended);
    const lLine = Number(tM?.lay || 0);
    const lBhav = Number(tM?.lbhav || 0);
    const lDec =
      tOpen && lLine > 0 && lBhav > 0
        ? Math.round((1 + lBhav / 100) * 100) / 100
        : 0;
    const bLine = Number(tM?.back || 0);
    const bBhav = Number(tM?.bbhav || 0);
    const bDec =
      tOpen && bLine > 0 && bBhav > 0
        ? Math.round((1 + bBhav / 100) * 100) / 100
        : 0;

    return (
      <div className='casino-table-body'>
        <div className='casino-table-row'>
          <div className='casino-nation-detail'>
            <div className='casino-nation-name'>Player {who}</div>
            <NationBook id={`player${who}`} />
          </div>
          <div
            className={`casino-odds-box back ${!pB ? 'suspended-box' : ''}`}
            style={{ cursor: pB ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              pB && openBetSlip(String(pSid), pB, 'back', isMobile)
            }
          >
            <span className='casino-odds'>{pB || '0'}</span>
          </div>
          <div
            className={`casino-odds-box lay ${!pL ? 'suspended-box' : ''}`}
            style={{ cursor: pL ? 'pointer' : 'not-allowed' }}
            onClick={() => pL && openBetSlip(String(pSid), pL, 'lay', isMobile)}
          >
            <span className='casino-odds'>{pL || '0'}</span>
          </div>
        </div>

        <div className='casino-table-row mini-baccarat'>
          <div className='casino-nation-detail'>
            <div className='casino-nation-name'>Mini Baccarat {who}</div>
            <NationBook id={`minibacc:${who}`} />
          </div>
          <div
            className={`casino-odds-box back ${!mbR ? 'suspended-box' : ''}`}
            style={{ cursor: mbR ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              mbR && openBetSlip(String(mbSid), mbR, 'back', isMobile)
            }
          >
            <span className='casino-odds'>{mbR || '0'}</span>
          </div>
        </div>

        <div className='casino-table-row'>
          <div className='casino-nation-detail'>
            <div className='casino-nation-name'>Total {who}</div>
          </div>
          <div
            className={`casino-odds-box lay ${!lDec ? 'suspended-box' : ''}`}
            style={{ cursor: lDec ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              lDec && openBetSlip(String(totSid), lDec, 'lay', isMobile)
            }
          >
            <span className='casino-volume'>{lDec ? lLine : '0'}</span>
            <span className='casino-odds'>{lDec ? lBhav : '0'}</span>
          </div>
          <div
            className={`casino-odds-box back ${!bDec ? 'suspended-box' : ''}`}
            style={{ cursor: bDec ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              bDec && openBetSlip(String(totSid), bDec, 'back', isMobile)
            }
          >
            <span className='casino-volume'>{bDec ? bLine : '0'}</span>
            <span className='casino-odds'>{bDec ? bBhav : '0'}</span>
          </div>
        </div>
      </div>
    );
  };

  const cpR = getLiveRate(markets?.['sid:7'], 'back', isSuspended);

  return (
    <div className='casino-table teenpatti2cards'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>{renderSide('A', 1, 5, 3)}</div>
        <div className='casino-table-box-divider' />
        <div className='casino-table-right-box'>{renderSide('B', 2, 6, 4)}</div>
      </div>

      <div className='casino-table-full-box mt-2'>
        <div
          className={`casino-odds-box back casino-odds-box-theme w-100 ${!cpR ? 'suspended-box' : ''}`}
          style={{ cursor: cpR ? 'pointer' : 'not-allowed' }}
          onClick={() => cpR && openBetSlip('7', cpR, 'back', isMobile)}
        >
          <span className='casino-odds'>Color Plus ({cpR || '0'})</span>
          <NationBook id='colorplus' />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   12. POISON / POISON 20 / JOKER 20 (poison, poison20, joker20)
   Live API: 1:Player A, 2:Player B, 3:Even, 4:Odd, 5:Red, 6:Black,
             7:Spade, 8:Heart, 9:Diamond, 10:Club
   ========================================================================== */
function TablePoisonJokerBase({
  rowLabel = 'Poison',
  isMobile,
  isSuspended,
  openBetSlip,
  markets,
}) {
  const renderCell = (sid, bookId) => {
    const r = getLiveRate(markets?.[`sid:${sid}`], 'back', isSuspended);
    return (
      <div
        className={`casino-odds-box back ${!r ? 'suspended-box' : ''}`}
        style={{ cursor: r ? 'pointer' : 'not-allowed' }}
        onClick={() => r && openBetSlip(String(sid), r, 'back', isMobile)}
      >
        <span className='casino-odds'>{r || '0'}</span>
        <NationBook id={bookId} />
      </div>
    );
  };

  return (
    <div className='casino-table teenpattijoker'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            {[
              { sid: 1, label: 'Player A', bookId: 'A' },
              { sid: 2, label: 'Player B', bookId: 'B' },
            ].map((p) => {
              const entry = markets?.[`sid:${p.sid}`];
              const b = getLiveRate(entry, 'back', isSuspended);
              const l = getLiveRate(entry, 'lay', isSuspended);
              return (
                <div className='casino-table-row' key={p.sid}>
                  <div className='casino-nation-detail'>
                    <div className='casino-nation-name'>{p.label}</div>
                    <NationBook id={p.bookId} />
                  </div>
                  <div
                    className={`casino-odds-box back ${!b ? 'suspended-box' : ''}`}
                    style={{ cursor: b ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      b && openBetSlip(String(p.sid), b, 'back', isMobile)
                    }
                  >
                    <span className='casino-odds'>{b || '0'}</span>
                  </div>
                  <div
                    className={`casino-odds-box lay ${!l ? 'suspended-box' : ''}`}
                    style={{ cursor: l ? 'pointer' : 'not-allowed' }}
                    onClick={() =>
                      l && openBetSlip(String(p.sid), l, 'lay', isMobile)
                    }
                  >
                    <span className='casino-odds'>{l || '0'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='casino-table-right-box joker-other-odds'>
          <div className='joker-other-odds'>
            <div className='casino-table-header'>
              <div className='casino-nation-detail' />
              <div className='casino-odds-box'>Even</div>
              <div className='casino-odds-box'>Odd</div>
              <div className='casino-odds-box'>
                <span>Red</span>
                <span className='card-icon ms-1'>
                  <span className='card-red'>{'{'}</span>
                  <span className='card-red'>{'['}</span>
                </span>
              </div>
              <div className='casino-odds-box'>
                <span>Black</span>
                <span className='card-icon ms-1'>
                  <span className='card-black'>{'}'}</span>
                  <span className='card-black'>{']'}</span>
                </span>
              </div>
            </div>
            <div className='casino-table-body'>
              <div className='casino-table-row'>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>{rowLabel}</div>
                </div>
                {renderCell(3, 'special:even')}
                {renderCell(4, 'special:odd')}
                {renderCell(5, 'special:red')}
                {renderCell(6, 'special:black')}
              </div>
            </div>
          </div>

          <div className='joker-other-odds mt-2'>
            <div className='casino-table-header'>
              <div className='casino-nation-detail' />
              <div className='casino-odds-box'>
                <span className='card-icon'>
                  <span className='card-black'>{'}'}</span>
                </span>
              </div>
              <div className='casino-odds-box'>
                <span className='card-icon'>
                  <span className='card-red'>{'{'}</span>
                </span>
              </div>
              <div className='casino-odds-box'>
                <span className='card-icon'>
                  <span className='card-red'>{'['}</span>
                </span>
              </div>
              <div className='casino-odds-box'>
                <span className='card-icon'>
                  <span className='card-black'>{']'}</span>
                </span>
              </div>
            </div>
            <div className='casino-table-body'>
              <div className='casino-table-row'>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>{rowLabel}</div>
                </div>
                {renderCell(7, 'special:spade')}
                {renderCell(8, 'special:heart')}
                {renderCell(9, 'special:diamond')}
                {renderCell(10, 'special:club')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TablePoison(props) {
  return <TablePoisonJokerBase rowLabel='Poison' {...props} />;
}

function TableJoker20(props) {
  return <TablePoisonJokerBase rowLabel='Joker' {...props} />;
}

/* ==========================================================================
   13. UNIQUE TEENPATTI (teenunique) — Exact D247 6-Slot 3-Card Picker
   Live API: sub[0] = { b: 1.98, gstatus: "OPEN" }, card = 6 cards
   ========================================================================== */
function TableTeenunique({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const [picks, setPicks] = useState([]);
  const baseSub = Array.isArray(roundData?.sub) ? roundData.sub[0] : null;
  const rate = getLiveRate(baseSub, 'back', isSuspended);
  const cards = String(roundData?.card || '')
    .split(',')
    .map((x) => x.trim());

  const toggleSlot = (slot) => {
    if (!rate) return;
    if (picks.includes(slot)) {
      setPicks(picks.filter((p) => p !== slot));
      return;
    }
    const next = [...picks, slot];
    if (next.length === 3) {
      openBetSlip(`unique:${next.join('-')}`, rate, 'back', isMobile);
      setPicks([]);
    } else {
      setPicks(next);
    }
  };

  return (
    <div className='casino-table unique-teen'>
      <h4 className='unique-teen-title'>
        Select any 3 cards of your choice ({rate || '0'}) — Selected:{' '}
        <b>{picks.length}/3</b>
      </h4>
      <div className={`unique-teen20-box ${!rate ? 'suspended' : ''}`}>
        {[1, 2, 3, 4, 5, 6].map((slot) => {
          const code = cards[slot - 1] || '1';
          const selected = picks.includes(slot);
          return (
            <div
              key={slot}
              className={`unique-teen20-card ${selected ? 'rounded ring-2 ring-yellow-400' : ''}`}
              style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
              onClick={() => toggleSlot(slot)}
            >
              <img
                src={`/assets/img/sequence/s${slot}-icon.png`}
                alt={`Slot ${slot}`}
              />
              <img
                src={`/assets/img/cards/${code === '1' || !code ? '1' : code}.jpg`}
                alt={`Card ${slot}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   14. TRIO (trio) — Exact D247 rendered.html DOM (matches verified TableVtrio)
   Live API: 1:Session (Fancy2), 2..7 (Back+Lay), 8..12 (Back-only)
   ========================================================================== */
function TableTrio({ isMobile, isSuspended, openBetSlip, markets }) {
  const sessM = getBySidOrNat(markets, 1, 'Session');
  const sOpen = isOpenEntry(sessM, isSuspended);
  const sBackLine = Number(sessM?.back || 0);
  const sBackBhav = Number(sessM?.bbhav || 0);
  const sBackDec =
    sOpen && sBackLine > 0 && sBackBhav > 0
      ? Math.round((1 + sBackBhav / 100) * 100) / 100
      : 0;
  const sLayLine = Number(sessM?.lay || 0);
  const sLayBhav = Number(sessM?.lbhav || 0);
  const sLayDec =
    sOpen && sLayLine > 0 && sLayBhav > 0
      ? Math.round((1 + sLayBhav / 100) * 100) / 100
      : 0;

  const row1BL = [
    { sid: 2, label: '3 Card Judgement(1 2 4)', bookId: 'judge:124' },
    { sid: 3, label: '3 Card Judgement(J Q K)', bookId: 'judge:jqk' },
  ];
  const row2BL = [
    { sid: 4, label: 'Two Red Only', bookId: 'twored' },
    { sid: 5, label: 'Two Black Only', bookId: 'twoblack' },
    { sid: 6, label: 'Two Odd Only', bookId: 'twoodd' },
    { sid: 7, label: 'Two Even Only', bookId: 'twoeven' },
  ];
  const row3BackOnly = [
    { sid: 8, label: 'Pair', bookId: 'pair' },
    { sid: 9, label: 'Flush', bookId: 'flush' },
    { sid: 10, label: 'Straight', bookId: 'straight' },
    { sid: 11, label: 'Trio', bookId: 'trio' },
    { sid: 12, label: 'Straight Flush', bookId: 'straightflush' },
  ];

  const renderBLBox = (it) => {
    const entry = markets?.[`sid:${it.sid}`];
    const b = getLiveRate(entry, 'back', isSuspended);
    const l = getLiveRate(entry, 'lay', isSuspended);
    return (
      <div className='casino-odd-box-container' key={it.sid}>
        <div className='casino-nation-name'>{it.label}</div>
        <div
          className={`casino-odds-box back ${!b ? 'suspended-box' : ''}`}
          style={{ cursor: b ? 'pointer' : 'not-allowed' }}
          onClick={() => b && openBetSlip(String(it.sid), b, 'back', isMobile)}
        >
          <span className='casino-odds'>{b || '0'}</span>
        </div>
        <div
          className={`casino-odds-box lay ${!l ? 'suspended-box' : ''}`}
          style={{ cursor: l ? 'pointer' : 'not-allowed' }}
          onClick={() => l && openBetSlip(String(it.sid), l, 'lay', isMobile)}
        >
          <span className='casino-odds'>{l || '0'}</span>
        </div>
        <NationBook id={it.bookId} />
      </div>
    );
  };

  return (
    <div className='casino-table trio'>
      <div className='casino-table-box'>
        <div className='casino-odd-box-container'>
          <div className='casino-nation-name'>Session</div>
          <div
            className={`casino-odds-box back ${!sBackDec ? 'suspended-box' : ''}`}
            style={{ cursor: sBackDec ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              sBackDec && openBetSlip('1', sBackDec, 'back', isMobile)
            }
          >
            <span className='casino-odds'>{sBackDec ? sBackLine : '0'}</span>
            {sBackDec ? (
              <span className='casino-volume'>{sBackBhav}</span>
            ) : null}
          </div>
          <div
            className={`casino-odds-box lay ${!sLayDec ? 'suspended-box' : ''}`}
            style={{ cursor: sLayDec ? 'pointer' : 'not-allowed' }}
            onClick={() =>
              sLayDec && openBetSlip('1', sLayDec, 'lay', isMobile)
            }
          >
            <span className='casino-odds'>{sLayDec ? sLayLine : '0'}</span>
            {sLayDec ? <span className='casino-volume'>{sLayBhav}</span> : null}
          </div>
          <NationBook id={`session:${sBackLine || sLayLine || 21}`} />
        </div>
        {row1BL.map(renderBLBox)}
      </div>

      <div className='casino-table-box triocards mt-3'>
        {row2BL.map(renderBLBox)}
      </div>

      <div className='casino-table-box trioodds mt-3'>
        {row3BackOnly.map((it) => {
          const b = getLiveRate(
            markets?.[`sid:${it.sid}`],
            'back',
            isSuspended
          );
          return (
            <div className='casino-odd-box-container' key={it.sid}>
              <div className='casino-nation-name'>{it.label}</div>
              <div
                className={`casino-odds-box back ${!b ? 'suspended-box' : ''}`}
                style={{ cursor: b ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  b && openBetSlip(String(it.sid), b, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{b || '0'}</span>
              </div>
              <NationBook id={it.bookId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const TABLES = {
  teen: TableTeen1Day,
  pteen: TableTeen1Day,
  teen20: TableTeen20,
  teen20b: TableTeen20,
  teen20c: TableTeen20,
  pteen20: TableTeen20,
  teenmuf: TableTeenmuf,
  teen3: TableTwoPlayerMain,
  teen32: TableTwoPlayerMain,
  teen33: TableTwoPlayerMain,
  joker1: TableTwoPlayerMain,
  joker120: TableTwoPlayerMain,
  teen41: TableTeen41,
  teen42: TableTeen41,
  teen6: TableTeen6,
  teen8: TableTeen8,
  teen9: TableTeen9,
  teensin: TableTeensin,
  teen1: TableTeen1,
  teen120: TableTeen120,
  patti2: TablePatti2,
  poison: TablePoison,
  poison20: TablePoison,
  joker20: TableJoker20,
  teenunique: TableTeenunique,
  trio: TableTrio,
};

export default TABLES;

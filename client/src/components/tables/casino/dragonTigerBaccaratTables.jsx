import { useState } from 'react';
import { normalizeSelection, useCasino } from '../../../context/CasinoContext';
import { NationBook } from './shared';

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

const getLiveRatio = (entry, isSuspended) => {
  if (!isOpenEntry(entry, isSuspended)) return 0;
  const v = Number(entry?.back ?? entry?.b ?? 0);
  return Number.isFinite(v) && v > 0 ? v : 0;
};

/* ==========================================================================
   1. BACCARAT & BACCARAT 2 (baccarat, pbaccarat, baccarat2)
   Provider sends profit-to-1 ratio `b` (e.g. Player=1, Big=0.54, Tie=8).
   UI displays `{b}:1`; decimal payout = `b + 1`.
   ========================================================================== */
const BACCARAT1_TOP = [
  { sid: 6, label: 'Perfect Pair', bookId: 'perfectPair' },
  { sid: 7, label: 'Big', bookId: 'big' },
  { sid: 8, label: 'Small', bookId: 'small' },
  { sid: 9, label: 'Either Pair', bookId: 'eitherPair' },
];

const BACCARAT2_TOP = [
  { sid: 6, label: 'Score 1-4', bookId: 'score:1-4' },
  { sid: 7, label: 'Score 5-6', bookId: 'score:5-6' },
  { sid: 8, label: 'Score 7', bookId: 'score:7' },
  { sid: 9, label: 'Score 8', bookId: 'score:8' },
  { sid: 10, label: 'Score 9', bookId: 'score:9' },
];

function BaccaratCardIcons({ cards, fallbackCount = 2 }) {
  const valid = (cards || []).filter((c) => c && c !== '1');
  if (valid.length > 0) {
    return (
      <div className='mt-1 flex gap-1'>
        {valid.map((c, idx) => (
          <img
            key={`${c}-${idx}`}
            src={`/assets/img/cards/${c}.jpg`}
            alt={c}
            className='h-[28px] w-auto rounded-[2px]'
          />
        ))}
      </div>
    );
  }
  return (
    <div className='mt-1 flex gap-1'>
      {Array.from({ length: fallbackCount }, (_, idx) => (
        <img
          key={idx}
          src='/assets/img/cards/1.jpg'
          alt='Card'
          className='h-[28px] w-auto rounded-[2px]'
        />
      ))}
    </div>
  );
}

function TableBaccaratBase({
  variant = 1,
  isMobile,
  isSuspended,
  openBetSlip,
  markets,
}) {
  const { roundData } = useCasino();
  const topList = variant === 2 ? BACCARAT2_TOP : BACCARAT1_TOP;

  // Live dealt cards (player: indices 0,2,4 | banker: indices 1,3,5)
  const rawCards = String(roundData?.card || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const pCards = [rawCards[0], rawCards[2], rawCards[4]].filter(
    (c) => c && c !== '1'
  );
  const bCards = [rawCards[1], rawCards[3], rawCards[5]].filter(
    (c) => c && c !== '1'
  );

  // Live statistics from roundData.res if present, else neutral 45/45/10
  const recent = Array.isArray(roundData?.res) ? roundData.res : [];
  let pPct = 45;
  let bPct = 45;
  let tPct = 10;
  if (recent.length > 0) {
    const pCnt = recent.filter((r) => String(r?.win) === '1').length;
    const bCnt = recent.filter((r) => String(r?.win) === '2').length;
    const tCnt = recent.filter((r) => String(r?.win) === '3').length;
    const tot = pCnt + bCnt + tCnt || 1;
    pPct = Math.round((pCnt / tot) * 100);
    bPct = Math.round((bCnt / tot) * 100);
    tPct = Math.max(0, 100 - pPct - bPct);
  }

  const ratioOf = (sid, nat) =>
    getLiveRatio(getBySidOrNat(markets, sid, nat), isSuspended);

  const clickRatio = (sid, ratio) => {
    if (!ratio) return;
    const dec = Math.round((ratio + 1) * 100) / 100;
    openBetSlip(String(sid), dec, 'back', isMobile);
  };

  const pPairR = ratioOf(4, 'Player Pair');
  const pR = ratioOf(1, 'Player');
  const tieR = ratioOf(3, 'Tie');
  const bR = ratioOf(2, 'Banker');
  const bPairR = ratioOf(5, 'Banker Pair');

  return (
    <div className='casino-table baccarat'>
      <div className='casino-table-full-box'>
        <div className='baccarat-graph text-center'>
          <h4>Statistics</h4>
          <div className='flex flex-col items-center justify-center gap-2 py-1'>
            <div
              className='relative h-[96px] w-[96px] shrink-0 rounded-full'
              style={{
                background: `conic-gradient(#086cb8 0% ${pPct}%, #ae2130 ${pPct}% ${pPct + bPct}%, #279532 ${pPct + bPct}% 100%)`,
              }}
            >
              {variant === 2 && (
                <div className='absolute inset-0 m-auto h-[50px] w-[50px] rounded-full bg-[#f1f1f1]' />
              )}
            </div>
            <div className='flex flex-wrap justify-center gap-2 text-[11px] font-semibold text-[#333]'>
              <span className='flex items-center gap-1'>
                <span className='inline-block h-2.5 w-2.5 rounded-full bg-[#086cb8]' />
                P {pPct}%
              </span>
              <span className='flex items-center gap-1'>
                <span className='inline-block h-2.5 w-2.5 rounded-full bg-[#ae2130]' />
                B {bPct}%
              </span>
              <span className='flex items-center gap-1'>
                <span className='inline-block h-2.5 w-2.5 rounded-full bg-[#279532]' />
                T {tPct}%
              </span>
            </div>
          </div>
        </div>

        <div className='baccarat-odds-container'>
          <div className='baccarat-other-odds'>
            {topList.map((item) => {
              const r = ratioOf(item.sid, item.label);
              return (
                <div
                  className='baccarat-other-odd-box-container'
                  key={item.sid}
                >
                  <div
                    className={`baccarat-other-odd-box ${!r ? 'suspended-box' : ''}`}
                    style={{ cursor: r ? 'pointer' : 'not-allowed' }}
                    onClick={() => clickRatio(item.sid, r)}
                  >
                    <span>{item.label}</span>
                    <span>{r ? `${r}:1` : '0:1'}</span>
                  </div>
                  <NationBook id={item.bookId} />
                </div>
              );
            })}
          </div>

          <div className='baccarat-main-odds mt-3'>
            <div className='player-pair-box-container'>
              <div
                className={`player-pair-box ${!pPairR ? 'suspended-box' : ''}`}
                style={{ cursor: pPairR ? 'pointer' : 'not-allowed' }}
                onClick={() => clickRatio(4, pPairR)}
              >
                <div>Player Pair</div>
                <div>{pPairR ? `${pPairR}:1` : '0:1'}</div>
              </div>
              <NationBook id='playerPair' />
            </div>

            <div className='player-box-container'>
              <div
                className={`player-box ${!pR ? 'suspended-box' : ''}`}
                style={{ cursor: pR ? 'pointer' : 'not-allowed' }}
                onClick={() => clickRatio(1, pR)}
              >
                <div>Player</div>
                <div>{pR ? `${pR}:1` : '0:1'}</div>
                <BaccaratCardIcons cards={pCards} />
              </div>
              <NationBook id='player' />
            </div>

            <div className='tie-box-container'>
              <div
                className={`tie-box ${!tieR ? 'suspended-box' : ''}`}
                style={{ cursor: tieR ? 'pointer' : 'not-allowed' }}
                onClick={() => clickRatio(3, tieR)}
              >
                <div>Tie</div>
                <div>{tieR ? `${tieR}:1` : '0:1'}</div>
              </div>
              <NationBook id='tie' />
            </div>

            <div className='banker-box-container'>
              <div
                className={`banker-box ${!bR ? 'suspended-box' : ''}`}
                style={{ cursor: bR ? 'pointer' : 'not-allowed' }}
                onClick={() => clickRatio(2, bR)}
              >
                <div>Banker</div>
                <div>{bR ? `${bR}:1` : '0:1'}</div>
                <BaccaratCardIcons cards={bCards} />
              </div>
              <NationBook id='banker' />
            </div>

            <div className='banker-pair-box-container'>
              <div
                className={`banker-pair-box ${!bPairR ? 'suspended-box' : ''}`}
                style={{ cursor: bPairR ? 'pointer' : 'not-allowed' }}
                onClick={() => clickRatio(5, bPairR)}
              >
                <div>Banker Pair</div>
                <div>{bPairR ? `${bPairR}:1` : '0:1'}</div>
              </div>
              <NationBook id='bankerPair' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableBaccarat(props) {
  return <TableBaccaratBase variant={1} {...props} />;
}

function TableBaccarat2(props) {
  return <TableBaccaratBase variant={2} {...props} />;
}

/* ==========================================================================
   2. 20-20 DRAGON TIGER (dt20, dt202, pdt20) — Exact D247 rendered.html DOM
   Live API: 1:Dragon, 2:Tiger, 3:Tie, 4:Pair,
             5..8:Dragon Even/Odd/Red/Black, 9..12:Tiger Even/Odd/Red/Black,
             13..25:Dragon Card 1..K, 26..38:Tiger Card 1..K
   ========================================================================== */
const DT20_RANKS = [
  { offset: 0, img: 'A', rank: 1, label: 'Card 1' },
  { offset: 1, img: '2', rank: 2, label: 'Card 2' },
  { offset: 2, img: '3', rank: 3, label: 'Card 3' },
  { offset: 3, img: '4', rank: 4, label: 'Card 4' },
  { offset: 4, img: '5', rank: 5, label: 'Card 5' },
  { offset: 5, img: '6', rank: 6, label: 'Card 6' },
  { offset: 6, img: '7', rank: 7, label: 'Card 7' },
  { offset: 7, img: '8', rank: 8, label: 'Card 8' },
  { offset: 8, img: '9', rank: 9, label: 'Card 9' },
  { offset: 9, img: '10', rank: 10, label: 'Card 10' },
  { offset: 10, img: 'J', rank: 11, label: 'Card J' },
  { offset: 11, img: 'Q', rank: 12, label: 'Card Q' },
  { offset: 12, img: 'K', rank: 13, label: 'Card K' },
];

function TableDt20({ isMobile, isSuspended, openBetSlip, markets }) {
  const topItems = [
    { sid: 1, nat: 'Dragon', cls: 'dt20dragon', bookId: 'dragon' },
    { sid: 3, nat: 'Tie', cls: 'dt20tie', bookId: 'tie' },
    { sid: 2, nat: 'Tiger', cls: 'dt20tiger', bookId: 'tiger' },
    { sid: 4, nat: 'Pair', cls: 'dt20pair', bookId: 'pair' },
  ];

  const renderSideBox = (side, startSid) => {
    const who = side.toLowerCase();
    const items = [
      { sid: startSid, label: 'Even', bookId: `parity:${who}:even` },
      { sid: startSid + 1, label: 'Odd', bookId: `parity:${who}:odd` },
      {
        sid: startSid + 2,
        label: 'Red',
        bookId: `color:${who}:red`,
        icons: [
          { ch: '{', cls: 'card-red' },
          { ch: '[', cls: 'card-red' },
        ],
      },
      {
        sid: startSid + 3,
        label: 'Black',
        bookId: `color:${who}:black`,
        icons: [
          { ch: '}', cls: 'card-black' },
          { ch: ']', cls: 'card-black' },
        ],
      },
    ];
    return (
      <>
        <h4 className='mb-2 w-100 text-center'>
          <b>{side.toUpperCase()}</b>
        </h4>
        {items.map((it) => {
          const rate = getLiveRate(
            getBySidOrNat(markets, it.sid, `${side} ${it.label}`),
            'back',
            isSuspended
          );
          return (
            <div className='dt20-odd-box dt20odds' key={it.sid}>
              <div className='casino-odds text-center'>{rate || '0'}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${!rate ? 'suspended-box' : ''}`}
                style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  rate && openBetSlip(String(it.sid), rate, 'back', isMobile)
                }
              >
                <span className='casino-odds'>
                  {it.icons
                    ? it.icons.map((ic, idx) => (
                        <span className='card-icon ms-1' key={idx}>
                          <span className={ic.cls}>{ic.ch}</span>
                        </span>
                      ))
                    : it.label}
                </span>
              </div>
              <NationBook id={it.bookId} />
            </div>
          );
        })}
      </>
    );
  };

  const renderCardsBox = (side, startSid) => {
    const who = side.toLowerCase();
    const firstRate = getLiveRate(
      getBySidOrNat(markets, startSid, `${side} Card 1`),
      'back',
      isSuspended
    );
    return (
      <>
        <h4 className='mb-2 w-100 text-center'>
          <b>
            {side.toUpperCase()} {firstRate || '0'}
          </b>
        </h4>
        {DT20_RANKS.map((rk) => {
          const sid = startSid + rk.offset;
          const rate = getLiveRate(
            getBySidOrNat(markets, sid, `${side} ${rk.label}`),
            'back',
            isSuspended
          );
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
                  alt={`${side} ${rk.label}`}
                />
              </div>
              <NationBook id={`card:${who}:${rk.rank}`} />
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className='casino-table dt20'>
      <div className='casino-table-full-box'>
        {topItems.map((item) => {
          const rate = getLiveRate(
            getBySidOrNat(markets, item.sid, item.nat),
            'back',
            isSuspended
          );
          return (
            <div className={`dt20-odd-box ${item.cls}`} key={item.sid}>
              <div className='casino-odds text-center'>{rate || '0'}</div>
              <div
                className={`casino-odds-box back casino-odds-box-theme ${!rate ? 'suspended-box' : ''}`}
                style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                onClick={() =>
                  rate && openBetSlip(String(item.sid), rate, 'back', isMobile)
                }
              >
                <span className='casino-odds'>{item.nat}</span>
              </div>
              <NationBook id={item.bookId} />
            </div>
          );
        })}
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          {renderSideBox('Dragon', 5)}
        </div>
        <div className='casino-table-right-box'>
          {renderSideBox('Tiger', 9)}
        </div>
      </div>

      <div className='casino-table-box dt20cards mt-3'>
        <div className='casino-table-left-box'>
          {renderCardsBox('Dragon', 13)}
        </div>
        <div className='casino-table-right-box'>
          {renderCardsBox('Tiger', 26)}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. 1-DAY DRAGON TIGER (dt6, pdt6) — Exact D247 rendered.html DOM
   Live API: 1:Dragon (Back+Lay), 2:Tiger (Back+Lay), 3:Pair,
             4..11:Dragon Even/Odd/Red/Black/Spade/Heart/Diamond/Club,
             12..19:Tiger Even/Odd/Red/Black/Spade/Heart/Diamond/Club
   ========================================================================== */
function TableDt1Day({ isMobile, isSuspended, openBetSlip, markets }) {
  const { roundData } = useCasino();

  const renderCell = (sid, nat, bookId) => {
    const rate = getLiveRate(
      getBySidOrNat(markets, sid, nat),
      'back',
      isSuspended
    );
    return (
      <div
        className={`casino-odds-box back ${!rate ? 'suspended-box' : ''}`}
        onClick={() => rate && openBetSlip(String(sid), rate, 'back', isMobile)}
        style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
      >
        <span className='casino-odds'>{rate || '0'}</span>
        <NationBook id={bookId} />
      </div>
    );
  };

  const mainRows = [
    { sid: 1, nat: 'Dragon', bookId: 'dragon' },
    { sid: 2, nat: 'Tiger', bookId: 'tiger' },
  ];
  const pairRate = getLiveRate(
    getBySidOrNat(markets, 3, 'Pair'),
    'back',
    isSuspended
  );

  return (
    <div className='casino-table dt1day'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            {mainRows.map((row) => {
              const entry = getBySidOrNat(markets, row.sid, row.nat);
              const backOdds = getLiveRate(entry, 'back', isSuspended);
              const layOdds = getLiveRate(entry, 'lay', isSuspended);
              return (
                <div className='casino-table-row' key={row.sid}>
                  <div className='casino-nation-detail'>
                    <div className='casino-nation-name'>{row.nat}</div>
                    <NationBook id={row.bookId} />
                  </div>
                  <div
                    className={`casino-odds-box back ${!backOdds ? 'suspended-box' : ''}`}
                    onClick={() =>
                      backOdds &&
                      openBetSlip(String(row.sid), backOdds, 'back', isMobile)
                    }
                    style={{ cursor: backOdds ? 'pointer' : 'not-allowed' }}
                  >
                    <span className='casino-odds'>{backOdds || '0'}</span>
                  </div>
                  <div
                    className={`casino-odds-box lay ${!layOdds ? 'suspended-box' : ''}`}
                    onClick={() =>
                      layOdds &&
                      openBetSlip(String(row.sid), layOdds, 'lay', isMobile)
                    }
                    style={{ cursor: layOdds ? 'pointer' : 'not-allowed' }}
                  >
                    <span className='casino-odds'>{layOdds || '0'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='casino-table-right-box dtpair'>
          <div className='casino-odds text-center'>{pairRate || '0'}</div>
          <div
            className={`casino-odds-box back casino-odds-box-theme ${!pairRate ? 'suspended-box' : ''}`}
            onClick={() =>
              pairRate && openBetSlip('3', pairRate, 'back', isMobile)
            }
            style={{ cursor: pairRate ? 'pointer' : 'not-allowed' }}
          >
            <span className='casino-odds'>Pair</span>
          </div>
          <NationBook id='pair' />
        </div>
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Even</div>
            <div className='casino-odds-box back'>Odd</div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Dragon</div>
              </div>
              {renderCell(4, 'Dragon Even', 'parity:dragon:even')}
              {renderCell(5, 'Dragon Odd', 'parity:dragon:odd')}
            </div>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Tiger</div>
              </div>
              {renderCell(12, 'Tiger Even', 'parity:tiger:even')}
              {renderCell(13, 'Tiger Odd', 'parity:tiger:odd')}
            </div>
          </div>
        </div>

        <div className='casino-table-right-box dtredblack'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>
              <span>Red</span>
              <span className='card-icon ms-1'>
                <span className='card-red'>{'{'}</span>
              </span>
              <span className='card-icon ms-1'>
                <span className='card-red'>[</span>
              </span>
            </div>
            <div className='casino-odds-box back'>
              <span>Black</span>
              <span className='card-icon ms-1'>
                <span className='card-black'>{'}'}</span>
              </span>
              <span className='card-icon ms-1'>
                <span className='card-black'>]</span>
              </span>
            </div>
          </div>
          <div className='casino-table-body'>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Dragon</div>
              </div>
              {renderCell(6, 'Dragon Red', 'color:dragon:red')}
              {renderCell(7, 'Dragon Black', 'color:dragon:black')}
            </div>
            <div className='casino-table-row'>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>Tiger</div>
              </div>
              {renderCell(14, 'Tiger Red', 'color:tiger:red')}
              {renderCell(15, 'Tiger Black', 'color:tiger:black')}
            </div>
          </div>
        </div>
      </div>

      <div className='casino-table-full-box dt1day-other-odds mt-3'>
        <div className='casino-table-header'>
          <div className='casino-nation-detail' />
          <div className='casino-odds-box'>
            <span className='card-icon ms-1'>
              <span className='card-black'>{'}'}</span>
            </span>
          </div>
          <div className='casino-odds-box'>
            <span className='card-icon ms-1'>
              <span className='card-red'>{'{'}</span>
            </span>
          </div>
          <div className='casino-odds-box'>
            <span className='card-icon ms-1'>
              <span className='card-black'>]</span>
            </span>
          </div>
          <div className='casino-odds-box'>
            <span className='card-icon ms-1'>
              <span className='card-red'>[</span>
            </span>
          </div>
        </div>
        <div className='casino-table-body'>
          <div className='casino-table-row'>
            <div className='casino-nation-detail'>
              <div className='casino-nation-name'>Dragon</div>
            </div>
            {renderCell(8, 'Dragon Spade', 'suit:dragon:spade')}
            {renderCell(9, 'Dragon Heart', 'suit:dragon:heart')}
            {renderCell(11, 'Dragon Club', 'suit:dragon:club')}
            {renderCell(10, 'Dragon Diamond', 'suit:dragon:diamond')}
          </div>
          <div className='casino-table-row'>
            <div className='casino-nation-detail'>
              <div className='casino-nation-name'>Tiger</div>
            </div>
            {renderCell(16, 'Tiger Spade', 'suit:tiger:spade')}
            {renderCell(17, 'Tiger Heart', 'suit:tiger:heart')}
            {renderCell(19, 'Tiger Club', 'suit:tiger:club')}
            {renderCell(18, 'Tiger Diamond', 'suit:tiger:diamond')}
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
   4. 20-20 DTL (dtl20) — Exact D247 Desktop 9+9 Grid + Mobile D/T/L Tabs
   Live API: Dragon sid 1..18, Tiger sid 21..38, Lion sid 41..58
   ========================================================================== */
const DTL_ROWS = [
  { offset: 0, label: 'Winner', bookKey: (w) => `winner:${w}` },
  {
    offset: 1,
    label: 'Black',
    icons: [
      { ch: '}', cls: 'card-black' },
      { ch: ']', cls: 'card-black' },
    ],
    bookKey: (w) => `color:${w}:black`,
  },
  {
    offset: 2,
    label: 'Red',
    icons: [
      { ch: '{', cls: 'card-red' },
      { ch: '[', cls: 'card-red' },
    ],
    bookKey: (w) => `color:${w}:red`,
  },
  { offset: 3, label: 'Odd', bookKey: (w) => `parity:${w}:odd` },
  { offset: 4, label: 'Even', bookKey: (w) => `parity:${w}:even` },
  { offset: 5, img: 'A', label: 'A', bookKey: (w) => `card:${w}:1` },
  { offset: 6, img: '2', label: '2', bookKey: (w) => `card:${w}:2` },
  { offset: 7, img: '3', label: '3', bookKey: (w) => `card:${w}:3` },
  { offset: 8, img: '4', label: '4', bookKey: (w) => `card:${w}:4` },
  { offset: 9, img: '5', label: '5', bookKey: (w) => `card:${w}:5` },
  { offset: 10, img: '6', label: '6', bookKey: (w) => `card:${w}:6` },
  { offset: 11, img: '7', label: '7', bookKey: (w) => `card:${w}:7` },
  { offset: 12, img: '8', label: '8', bookKey: (w) => `card:${w}:8` },
  { offset: 13, img: '9', label: '9', bookKey: (w) => `card:${w}:9` },
  { offset: 14, img: '10', label: '10', bookKey: (w) => `card:${w}:10` },
  { offset: 15, img: 'J', label: 'J', bookKey: (w) => `card:${w}:11` },
  { offset: 16, img: 'Q', label: 'Q', bookKey: (w) => `card:${w}:12` },
  { offset: 17, img: 'K', label: 'K', bookKey: (w) => `card:${w}:13` },
];

const DTL_COLS = [
  { key: 'dragon', label: 'Dragon', baseSid: 1 },
  { key: 'tiger', label: 'Tiger', baseSid: 21 },
  { key: 'lion', label: 'Lion', baseSid: 41 },
];

function TableDtl20({ isMobile, isSuspended, openBetSlip, markets }) {
  const [mobTab, setMobTab] = useState('dragon');
  const activeCol = DTL_COLS.find((c) => c.key === mobTab) || DTL_COLS[0];

  const renderLabel = (row) => (
    <div className='casino-nation-name'>
      {row.img ? (
        <img
          src={`/assets/img/cards/${row.img}.png`}
          alt={row.label}
          className='h-[28px] w-auto'
        />
      ) : (
        <>
          {row.label}
          {row.icons &&
            row.icons.map((ic, i) => (
              <span className='card-icon ms-1' key={i}>
                <span className={ic.cls}>{ic.ch}</span>
              </span>
            ))}
        </>
      )}
    </div>
  );

  const renderHalf = (rows) => (
    <>
      <div className='casino-table-header'>
        <div className='casino-nation-detail' />
        {DTL_COLS.map((c) => (
          <div className='casino-odds-box back' key={c.key}>
            {c.label}
          </div>
        ))}
      </div>
      <div className='casino-table-body'>
        {rows.map((row) => (
          <div className='casino-table-row' key={row.offset}>
            <div className='casino-nation-detail'>{renderLabel(row)}</div>
            {DTL_COLS.map((c) => {
              const sid = c.baseSid + row.offset;
              const rate = getLiveRate(
                markets?.[`sid:${sid}`],
                'back',
                isSuspended
              );
              return (
                <div
                  key={sid}
                  className={`casino-odds-box back ${!rate ? 'suspended-box' : ''}`}
                  style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    rate && openBetSlip(String(sid), rate, 'back', isMobile)
                  }
                >
                  <span className='casino-odds'>{rate || '0'}</span>
                  <NationBook id={row.bookKey(c.key)} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className='casino-table dtl20'>
      {/* Desktop 9 + 9 side-by-side */}
      <div className='casino-table-box d-none d-md-flex'>
        <div className='casino-table-left-box'>
          {renderHalf(DTL_ROWS.slice(0, 9))}
        </div>
        <div className='casino-table-right-box'>
          {renderHalf(DTL_ROWS.slice(9, 18))}
        </div>
      </div>

      {/* Mobile D / T / L tabs */}
      <div className='d-md-none'>
        <div className='nav nav-pills mb-2 flex gap-1'>
          {DTL_COLS.map((c) => (
            <button
              key={c.key}
              type='button'
              className={`nav-link flex-1 ${mobTab === c.key ? 'active' : ''}`}
              onClick={() => setMobTab(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className='casino-table-body'>
          {DTL_ROWS.map((row) => {
            const sid = activeCol.baseSid + row.offset;
            const rate = getLiveRate(
              markets?.[`sid:${sid}`],
              'back',
              isSuspended
            );
            return (
              <div className='casino-table-row' key={sid}>
                <div className='casino-nation-detail'>
                  {renderLabel(row)}
                  <NationBook id={row.bookKey(activeCol.key)} />
                </div>
                <div
                  className={`casino-odds-box back ${!rate ? 'suspended-box' : ''}`}
                  style={{ cursor: rate ? 'pointer' : 'not-allowed' }}
                  onClick={() =>
                    rate && openBetSlip(String(sid), rate, 'back', isMobile)
                  }
                >
                  <span className='casino-odds'>{rate || '0'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const TABLES = {
  baccarat: TableBaccarat,
  pbaccarat: TableBaccarat,
  baccarat2: TableBaccarat2,
  dt20: TableDt20,
  dt202: TableDt20,
  pdt20: TableDt20,
  dt6: TableDt1Day,
  pdt6: TableDt1Day,
  dtl20: TableDtl20,
};

export default TABLES;

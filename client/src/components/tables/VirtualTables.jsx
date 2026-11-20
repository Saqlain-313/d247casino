import React, { useState } from 'react';
import { useCasino, normalizeSelection } from '../../context/CasinoContext';
import OddsBox from './OddsBox';

// Virtual casino tables — exact D247 rendered.html DOM + style.css contracts.
// Root `.casino-page-container` already carries the game class (`lucky7a vcasino`,
// `trio vcasino`, `dtl20 vcasino`, `dt1day vcasino`, `teenpatti1day vcasino`,
// `teenpatti20 vcasino`, `teenpattimuflis vcasino`, `aaa vcasino`, `bollywood vcasino`).
const RANK_SRC = (r) => `/cards-rank/${r}.png`;
const RANKS = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

const useV = () => {
  const { roundData, isSuspended, openBetSlip, nationBook } = useCasino();
  return {
    markets: roundData?.markets || {},
    sub: Array.isArray(roundData?.sub) ? roundData.sub : [],
    isSuspended,
    openBetSlip,
    nationBook: nationBook || {},
  };
};

const entryOf = (markets, natOrSid) => {
  if (!markets) return null;
  const s = String(natOrSid ?? '');
  if (markets[`sid:${s}`]) return markets[`sid:${s}`];
  return markets[normalizeSelection(s)] || null;
};

const isEntryOpen = (entry) => {
  if (!entry) return false;
  const gs = String(entry.gstatus || '').toUpperCase();
  return !gs || ['OPEN', 'ACTIVE'].includes(gs);
};

const oddsOf = (entry, type = 'back') => {
  if (!isEntryOpen(entry)) return null;
  const v = entry?.[type];
  return Number(v) > 1 ? v : null;
};

const fancy2OddsOf = (entry, type = 'back') => {
  if (!isEntryOpen(entry)) return null;
  const line = entry?.[type];
  const bhav = Number(type === 'lay' ? entry?.lbhav : entry?.bbhav);
  if (!(Number(line) > 0) || !(bhav > 0)) return null;
  return {
    line: String(line),
    bhav: String(bhav),
    decimal: Math.round((1 + bhav / 100) * 100) / 100,
  };
};

const bookValOf = (nationBook, keys) => {
  if (!nationBook) return null;
  for (const k of keys) {
    if (k == null || k === '') continue;
    if (nationBook[k] !== undefined && Number(nationBook[k]) !== 0) {
      return Number(nationBook[k]);
    }
    const nk = normalizeSelection(k);
    if (nk && nationBook[nk] !== undefined && Number(nationBook[nk]) !== 0) {
      return Number(nationBook[nk]);
    }
  }
  return null;
};

const BookLabel = ({ nationBook, keys = [], className = '' }) => {
  const v = bookValOf(nationBook, keys);
  if (v === null) return <div className={`casino-nation-book ${className}`} />;
  return (
    <div
      className={`casino-nation-book ${v >= 0 ? 'text-success' : 'text-danger'} ${className}`}
    >
      {v > 0 ? `+${v}` : String(v)}
    </div>
  );
};

const Box = ({ markets, nat, type = 'back', displayOdds, sid }) => {
  const lookup = sid != null ? String(sid) : nat;
  const entry = entryOf(markets, lookup);
  const odds = oddsOf(entry, type);
  const { isSuspended } = useV();
  if (!odds || isSuspended) {
    return (
      <div className={`casino-odds-box ${type} suspended-box`}>
        <span className='casino-odds'>0</span>
      </div>
    );
  }
  return (
    <OddsBox
      nation={lookup}
      odds={odds}
      displayOdds={displayOdds}
      type={type}
    />
  );
};

const Fancy2Box = ({ markets, nat, type = 'back' }) => {
  const entry = entryOf(markets, nat);
  const f = fancy2OddsOf(entry, type);
  const { isSuspended } = useV();
  if (!f || isSuspended) {
    return (
      <div className={`casino-odds-box ${type} suspended-box`}>
        <span className='casino-odds'>0</span>
      </div>
    );
  }
  return (
    <OddsBox
      nation={nat}
      odds={f.decimal}
      displayOdds={f.line}
      volume={f.bhav}
      type={type}
    />
  );
};

// Odds on top + themed back box (label / suit icons)
const ThemeBox = ({
  markets,
  nat,
  bookKeys,
  wrap = 'aaa-odd-box',
  wrapStyle,
  children,
}) => {
  const { isSuspended, openBetSlip, nationBook } = useV();
  const odds = oddsOf(entryOf(markets, nat));
  const dead = !odds || isSuspended;
  return (
    <div className={wrap} style={wrapStyle}>
      <div className='casino-odds text-center'>{dead ? '0' : odds}</div>
      <div
        className={`casino-odds-box back casino-odds-box-theme ${dead ? 'suspended-box' : ''}`}
        onClick={
          dead
            ? undefined
            : () => openBetSlip(nat, odds, 'back', window.innerWidth < 1200)
        }
        style={{ width: '100%', cursor: dead ? 'not-allowed' : 'pointer' }}
      >
        <span className='casino-odds'>{children}</span>
      </div>
      <BookLabel
        nationBook={nationBook}
        keys={bookKeys || [nat]}
        className='text-center'
      />
    </div>
  );
};

// D247 casino-odd-box-container — DIRECT child of casino-table-box
const MainBox = ({
  markets,
  nat,
  label,
  bookKeys,
  lay = true,
  isFancy2 = false,
}) => {
  const { nationBook } = useV();
  const keys = bookKeys || [nat];
  return (
    <div className='casino-odd-box-container'>
      <div className='casino-nation-name'>
        {label}
        <BookLabel nationBook={nationBook} keys={keys} className='d-md-none' />
      </div>
      {isFancy2 ? (
        <>
          <Fancy2Box markets={markets} nat={nat} type='back' />
          {lay && <Fancy2Box markets={markets} nat={nat} type='lay' />}
        </>
      ) : (
        <>
          <Box markets={markets} nat={nat} type='back' />
          {lay && <Box markets={markets} nat={nat} type='lay' />}
        </>
      )}
      <BookLabel
        nationBook={nationBook}
        keys={keys}
        className='d-none d-md-block w-100 text-center'
      />
    </div>
  );
};

const RedSuits = () => (
  <>
    <span className='card-icon ms-1'>
      <span className='card-red'>♥</span>
    </span>
    <span className='card-icon ms-1'>
      <span className='card-red'>♦</span>
    </span>
  </>
);

const BlackSuits = () => (
  <>
    <span className='card-icon ms-1'>
      <span className='card-black'>♠</span>
    </span>
    <span className='card-icon ms-1'>
      <span className='card-black'>♣</span>
    </span>
  </>
);

const GroupCards = ({ markets, nat, bookKey, cards }) => {
  const { isSuspended, openBetSlip, nationBook } = useV();
  const odds = oddsOf(entryOf(markets, nat));
  const dead = !odds || isSuspended;
  return (
    <div className='lucky7cards'>
      <div className='casino-odds w-100 text-center'>{dead ? '0' : odds}</div>
      <div
        className={`card-odd-box-container ${dead ? 'suspended-box' : ''}`}
        onClick={
          dead
            ? undefined
            : () => openBetSlip(nat, odds, 'back', window.innerWidth < 1200)
        }
        style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
      >
        {cards.map((c) => (
          <div key={c} className='card-odd-box'>
            <div>
              <img src={RANK_SRC(c)} alt={c} />
            </div>
          </div>
        ))}
      </div>
      <BookLabel
        nationBook={nationBook}
        keys={[bookKey, nat]}
        className='w-100 text-center'
      />
    </div>
  );
};

const CardRow = ({ markets, nats, extraClass = '', useHeading = false }) => {
  const { isSuspended, openBetSlip, nationBook } = useV();
  const firstNat = nats ? nats[0] : 'Card A';
  const headerOdds = oddsOf(entryOf(markets, firstNat));
  const headerText = !headerOdds || isSuspended ? '0' : headerOdds;

  return (
    <div className={`casino-table-full-box ${extraClass} mt-3`}>
      {useHeading ? (
        <h4 className='mb-2 w-100 text-center'>
          <b>{headerText}</b>
        </h4>
      ) : (
        <div className='casino-odds w-100 text-center'>{headerText}</div>
      )}
      {RANKS.map((r, i) => {
        const nat = nats ? nats[i] : `Card ${r}`;
        const odds = oddsOf(entryOf(markets, nat));
        const dead = !odds || isSuspended;
        const rankNum = i + 1;
        return (
          <div
            key={r}
            className='card-odd-box'
            onClick={
              dead
                ? undefined
                : () => openBetSlip(nat, odds, 'back', window.innerWidth < 1200)
            }
            style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
          >
            <div className={dead ? 'suspended-box' : ''}>
              <img src={RANK_SRC(r)} alt={r} />
            </div>
            <BookLabel
              nationBook={nationBook}
              keys={[`card:${rankNum}`, rankNum === 7 ? 'seven' : null, nat]}
            />
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- vlucky7
// Live API uses "Card 1" (not "Card A") for Ace; center 7.png is static per D247 rendered.html
export function TableVlucky7() {
  const { markets } = useV();
  const cardNats = ['Card 1', ...RANKS.slice(1).map((r) => `Card ${r}`)];

  return (
    <div className='casino-table'>
      <div className='casino-table-full-box'>
        <ThemeBox
          markets={markets}
          nat='Low Card'
          bookKeys={['low', 'Low Card']}
          wrap='lucky7low'
        >
          Low Card
        </ThemeBox>
        <div className='lucky7'>
          <img src={RANK_SRC('7')} alt='7' />
        </div>
        <ThemeBox
          markets={markets}
          nat='High Card'
          bookKeys={['high', 'High Card']}
          wrap='lucky7high'
        >
          High Card
        </ThemeBox>
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <ThemeBox markets={markets} nat='Even' wrap='lucky7odds'>
            Even
          </ThemeBox>
          <ThemeBox markets={markets} nat='Odd' wrap='lucky7odds'>
            Odd
          </ThemeBox>
        </div>
        <div className='casino-table-right-box'>
          <ThemeBox markets={markets} nat='Red' wrap='lucky7odds'>
            <RedSuits />
          </ThemeBox>
          <ThemeBox markets={markets} nat='Black' wrap='lucky7odds'>
            <BlackSuits />
          </ThemeBox>
        </div>
      </div>

      <div className='casino-table-box mt-3'>
        {[
          { nat: 'Line 1', bookKey: 'group:1', cards: ['A', '2', '3'] },
          { nat: 'Line 2', bookKey: 'group:2', cards: ['4', '5', '6'] },
          { nat: 'Line 3', bookKey: 'group:3', cards: ['8', '9', '10'] },
          { nat: 'Line 4', bookKey: 'group:4', cards: ['J', 'Q', 'K'] },
        ].map((g) => (
          <GroupCards
            key={g.nat}
            markets={markets}
            nat={g.nat}
            bookKey={g.bookKey}
            cards={g.cards}
          />
        ))}
      </div>

      <CardRow markets={markets} nats={cardNats} extraClass='lucky7acards' />
    </div>
  );
}

// ---------------------------------------------------------------- vtrio
// D247: Row 1 Session (Fancy2 line + bbhav/lbhav) + 3 Card Judgement x2;
// Row 2 `.triocards` (4 Back+Lay); Row 3 `.trioodds` (5 Back-only)
export function TableVtrio() {
  const { markets } = useV();
  const mid = [
    { nat: 'Two Red Only', bk: 'twored' },
    { nat: 'Two Black Only', bk: 'twoblack' },
    { nat: 'Two Odd Only', bk: 'twoodd' },
    { nat: 'Two Even Only', bk: 'twoeven' },
  ];
  const side = [
    { nat: 'Pair', bk: 'pair' },
    { nat: 'Flush', bk: 'flush' },
    { nat: 'Straight', bk: 'straight' },
    { nat: 'Trio', bk: 'trio' },
    { nat: 'Straight Flush', bk: 'straightflush' },
  ];
  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        <MainBox
          markets={markets}
          nat='Session'
          label='Session'
          bookKeys={['session:21', 'Session']}
          isFancy2
        />
        <MainBox
          markets={markets}
          nat='3 Card Judgement (1 2 4)'
          label='3 Card Judgement (1 2 4)'
          bookKeys={['judge:124', '3 Card Judgement (1 2 4)']}
        />
        <MainBox
          markets={markets}
          nat='3 Card Judgement (J Q K)'
          label='3 Card Judgement (J Q K)'
          bookKeys={['judge:jqk', '3 Card Judgement (J Q K)']}
        />
      </div>
      <div className='casino-table-box triocards mt-3'>
        {mid.map((m) => (
          <MainBox
            key={m.nat}
            markets={markets}
            nat={m.nat}
            label={m.nat}
            bookKeys={[m.bk, m.nat]}
          />
        ))}
      </div>
      <div className='casino-table-box trioodds mt-3'>
        {side.map((m) => (
          <MainBox
            key={m.nat}
            markets={markets}
            nat={m.nat}
            label={m.nat}
            bookKeys={[m.bk, m.nat]}
            lay={false}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vdtl20
// Exact D247: Desktop balanced 9-row Left (Winner, Black, Red, Odd, Even, A..4)
// + 9-row Right (5..K) with rank card images; Mobile Dragon/Tiger/Lion pill tabs
export function TableVdtl20() {
  const { markets, nationBook } = useV();
  const [mobileTab, setMobileTab] = useState(0);

  const players = [
    { name: 'Dragon', s: 'D', key: 'dragon' },
    { name: 'Tiger', s: 'T', key: 'tiger' },
    { name: 'Lion', s: 'L', key: 'lion' },
  ];
  const leftRows = [
    { type: 'side', label: 'Winner', key: 'Winner', icon: null },
    { type: 'side', label: 'Black', key: 'Black', icon: 'black' },
    { type: 'side', label: 'Red', key: 'Red', icon: 'red' },
    { type: 'side', label: 'Odd', key: 'Odd', icon: null },
    { type: 'side', label: 'Even', key: 'Even', icon: null },
    ...['A', '2', '3', '4'].map((r) => ({ type: 'card', rank: r })),
  ];
  const rightRows = ['5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map((r) => ({
    type: 'card',
    rank: r,
  }));

  const renderLabel = (row) => {
    if (row.type === 'card') {
      return <img src={RANK_SRC(row.rank)} alt={row.rank} />;
    }
    return (
      <>
        {row.label}
        {row.icon === 'black' && <BlackSuits />}
        {row.icon === 'red' && <RedSuits />}
      </>
    );
  };

  const natFor = (row, p) =>
    row.type === 'card' ? `${p.name} ${row.rank}` : `${row.key} ${p.s}`;

  const activePlayer = players[mobileTab] || players[0];

  return (
    <div className='casino-table'>
      {/* Desktop balanced 9+9 matrix */}
      <div className='casino-table-box d-none d-md-flex'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Dragon</div>
            <div className='casino-odds-box back'>Tiger</div>
            <div className='casino-odds-box back'>Lion</div>
          </div>
          <div className='casino-table-body'>
            {leftRows.map((row) => (
              <div
                className='casino-table-row'
                key={row.type === 'card' ? row.rank : row.key}
              >
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>{renderLabel(row)}</div>
                </div>
                {players.map((p) => (
                  <Box key={p.s} markets={markets} nat={natFor(row, p)} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className='casino-table-right-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Dragon</div>
            <div className='casino-odds-box back'>Tiger</div>
            <div className='casino-odds-box back'>Lion</div>
          </div>
          <div className='casino-table-body'>
            {rightRows.map((row) => (
              <div className='casino-table-row' key={row.rank}>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>{renderLabel(row)}</div>
                </div>
                {players.map((p) => (
                  <Box key={p.s} markets={markets} nat={natFor(row, p)} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Dragon / Tiger / Lion pill tabs */}
      <ul className='d-md-none nav nav-pills' role='tablist'>
        {players.map((p, idx) => (
          <li className='nav-item' key={p.s} role='presentation'>
            <button
              type='button'
              role='tab'
              className={`nav-link ${mobileTab === idx ? 'active' : ''}`}
              onClick={() => setMobileTab(idx)}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
      <div className='d-md-none'>
        <div className='casino-table-box'>
          <div className='casino-table-left-box'>
            <div className='casino-table-body'>
              {leftRows.map((row) => (
                <div
                  className='casino-table-row'
                  key={row.type === 'card' ? row.rank : row.key}
                >
                  <div className='casino-nation-detail'>
                    <div className='casino-nation-name'>{renderLabel(row)}</div>
                    {row.key === 'Winner' && (
                      <BookLabel
                        nationBook={nationBook}
                        keys={[activePlayer.key]}
                      />
                    )}
                  </div>
                  <Box markets={markets} nat={natFor(row, activePlayer)} />
                </div>
              ))}
            </div>
          </div>
          <div className='casino-table-right-box'>
            <div className='casino-table-body'>
              {rightRows.map((row) => (
                <div className='casino-table-row' key={row.rank}>
                  <div className='casino-nation-detail'>
                    <div className='casino-nation-name'>{renderLabel(row)}</div>
                  </div>
                  <Box markets={markets} nat={natFor(row, activePlayer)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vdt6
// Exact D247: Row 1 Dragon/Tiger Back+Lay + dtpair; Row 2 Even/Odd + Red/Black;
// Row 3 single full-width dt1day-other-odds suit matrix [♠, ♥, ♣, ♦]
export function TableVdt6() {
  const { markets, nationBook } = useV();
  const suitCols = [
    { name: 'Spade', sym: '♠', cls: 'card-black' },
    { name: 'Heart', sym: '♥', cls: 'card-red' },
    { name: 'Club', sym: '♣', cls: 'card-black' },
    { name: 'Diamond', sym: '♦', cls: 'card-red' },
  ];

  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Back</div>
            <div className='casino-odds-box lay'>Lay</div>
          </div>
          <div className='casino-table-body'>
            {['Dragon', 'Tiger'].map((p) => (
              <div className='casino-table-row' key={p}>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>{p}</div>
                  <BookLabel
                    nationBook={nationBook}
                    keys={[p.toLowerCase(), p]}
                  />
                </div>
                <Box markets={markets} nat={p} type='back' />
                <Box markets={markets} nat={p} type='lay' />
              </div>
            ))}
          </div>
        </div>
        <div className='casino-table-right-box dtpair'>
          <ThemeBox markets={markets} nat='Pair' wrap='w-100'>
            Pair
          </ThemeBox>
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
            {['Dragon', 'Tiger'].map((p) => (
              <div className='casino-table-row' key={p}>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>{p}</div>
                </div>
                <Box markets={markets} nat={`${p} Even`} />
                <Box markets={markets} nat={`${p} Odd`} />
              </div>
            ))}
          </div>
        </div>
        <div className='casino-table-right-box dtredblack'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>
              <span>Red</span>
              <RedSuits />
            </div>
            <div className='casino-odds-box back'>
              <span>Black</span>
              <BlackSuits />
            </div>
          </div>
          <div className='casino-table-body'>
            {['Dragon', 'Tiger'].map((p) => (
              <div className='casino-table-row' key={p}>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>{p}</div>
                </div>
                <Box markets={markets} nat={`${p} Red`} />
                <Box markets={markets} nat={`${p} Black`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='casino-table-full-box dt1day-other-odds mt-3'>
        <div className='casino-table-header'>
          <div className='casino-nation-detail' />
          {suitCols.map((sc) => (
            <div className='casino-odds-box' key={sc.name}>
              <span className='card-icon ms-1'>
                <span className={sc.cls}>{sc.sym}</span>
              </span>
            </div>
          ))}
        </div>
        <div className='casino-table-body'>
          {['Dragon', 'Tiger'].map((p) => (
            <div className='casino-table-row' key={p}>
              <div className='casino-nation-detail'>
                <div className='casino-nation-name'>{p}</div>
              </div>
              {suitCols.map((sc) => (
                <Box key={sc.name} markets={markets} nat={`${p} ${sc.name}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vteen20
// Exact D247: Player A/B 4-column table + Pair Plus displays A/B when open +
// `.teenpatti20-other-oods` (mobile under each player, desktop row below both)
export function TableVteen20() {
  const { markets, isSuspended, openBetSlip, nationBook } = useV();

  const renderSuitBtn = (nat, suits, bookKey) => {
    const odds = oddsOf(entryOf(markets, nat));
    const dead = !odds || isSuspended;
    return (
      <div
        className={`casino-odds-box back ${dead ? 'suspended-box' : ''}`}
        onClick={
          dead
            ? undefined
            : () => openBetSlip(nat, odds, 'back', window.innerWidth < 1200)
        }
        style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
      >
        <div>{suits === 'black' ? <BlackSuits /> : <RedSuits />}</div>
        <div>
          <span className='casino-odds'>{dead ? '0' : odds}</span>
          <BookLabel nationBook={nationBook} keys={[bookKey, nat]} />
        </div>
      </div>
    );
  };

  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        {['A', 'B'].map((p, idx) => (
          <React.Fragment key={p}>
            <div
              className={
                idx === 0 ? 'casino-table-left-box' : 'casino-table-right-box'
              }
            >
              <div className='casino-table-header'>
                <div className='casino-nation-detail'>Player {p}</div>
                <BookLabel nationBook={nationBook} keys={[p, `player${p}`]} />
              </div>
              <div className='casino-table-body'>
                <div className='casino-table-row'>
                  <div className='casino-odds-box'>Player {p}</div>
                  <div className='casino-odds-box'>3 Baccarat {p}</div>
                  <div className='casino-odds-box'>Total {p}</div>
                  <div className='casino-odds-box'>Pair Plus {p}</div>
                </div>
                <div className='casino-table-row'>
                  <Box markets={markets} nat={`Player ${p}`} />
                  <Box markets={markets} nat={`3 Baccarat ${p}`} />
                  <Box markets={markets} nat={`Total ${p}`} />
                  <Box
                    markets={markets}
                    nat={`Pair Plus ${p}`}
                    displayOdds={p}
                  />
                </div>
              </div>
            </div>
            <div className='teenpatti20-other-oods d-md-none'>
              <div
                className={
                  idx === 0 ? 'casino-table-left-box' : 'casino-table-right-box'
                }
              >
                {renderSuitBtn(`Black ${p}`, 'black', `redblack:${p}:black`)}
                {renderSuitBtn(`Red ${p}`, 'red', `redblack:${p}:red`)}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className='teenpatti20-other-oods d-none d-md-flex'>
        <div className='casino-table-left-box'>
          {renderSuitBtn('Black A', 'black', 'redblack:A:black')}
          {renderSuitBtn('Red A', 'red', 'redblack:A:red')}
        </div>
        <div className='casino-table-right-box'>
          {renderSuitBtn('Black B', 'black', 'redblack:B:black')}
          {renderSuitBtn('Red B', 'red', 'redblack:B:red')}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vteenmuf
export function TableVteenmuf() {
  const { markets, nationBook } = useV();
  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        {['A', 'B'].map((p, idx) => (
          <React.Fragment key={p}>
            {idx === 1 && <div className='casino-table-box-divider' />}
            <div
              className={
                idx === 0 ? 'casino-table-left-box' : 'casino-table-right-box'
              }
            >
              <div className='casino-table-header'>
                <div className='casino-nation-detail'>Player {p}</div>
                <BookLabel nationBook={nationBook} keys={[p, `player${p}`]} />
              </div>
              <div className='casino-table-body'>
                <div className='casino-table-row'>
                  <div className='casino-odds-box'>Winner</div>
                  <div className='casino-odds-box'>Top 9</div>
                  <div className='casino-odds-box'>M Baccarat {p}</div>
                </div>
                <div className='casino-table-row'>
                  <Box markets={markets} nat={`Player ${p}`} />
                  <Box markets={markets} nat={`Top 9 ${p}`} displayOdds={p} />
                  <Box markets={markets} nat={`M Baccarat ${p}`} />
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vteen
// Exact D247: Top Left/Right (Player A & B Back/Lay) have ONLY 2 rows:
// Main (sid 1/2) & Consecutive (sid 17/18, subtype "vcon").
// Bottom (teenpatti1day-other-odds): Card 1..6 (sid 11..16) with 2 rows:
// Odd & Even from live nested `entry.odds` array!
export function TableVteen() {
  const { markets, sub, isSuspended, openBetSlip, nationBook } = useV();

  const findMainSid = (p) => {
    const targetNat = `player ${p.toLowerCase()}`;
    const item = sub.find(
      (s) =>
        String(s?.nat || '')
          .trim()
          .toLowerCase() === targetNat &&
        String(s?.subtype || '').toLowerCase() !== 'vcon'
    );
    return item ? String(item.sid ?? item.i) : p === 'A' ? '1' : '2';
  };

  const findConsecSid = (p) => {
    const targetNat = `player ${p.toLowerCase()}`;
    const item = sub.find(
      (s) =>
        String(s?.nat || '')
          .trim()
          .toLowerCase() === targetNat &&
        String(s?.subtype || '').toLowerCase() === 'vcon'
    );
    return item ? String(item.sid ?? item.i) : p === 'A' ? '17' : '18';
  };

  const cardSubFor = (cardNum) =>
    sub.find(
      (s) =>
        String(s?.nat || '')
          .trim()
          .toLowerCase() === `card ${cardNum}` && Array.isArray(s?.odds)
    ) || entryOf(markets, `Card ${cardNum}`);

  const renderCardParityBox = (cardNum, parity) => {
    const item = cardSubFor(cardNum);
    const open = isEntryOpen(item);
    const child = Array.isArray(item?.odds)
      ? item.odds.find(
          (o) =>
            String(o?.nat || '')
              .trim()
              .toLowerCase() === parity
        )
      : null;
    const odds = open && Number(child?.b) > 1 ? Number(child.b) : null;
    const dead = !odds || isSuspended;
    const sidKey =
      item?.sid != null ? `${item.sid}:${parity}` : `${10 + cardNum}:${parity}`;
    return (
      <div
        key={`${cardNum}-${parity}`}
        className={`casino-odds-box back ${dead ? 'suspended-box' : ''}`}
        onClick={
          dead
            ? undefined
            : () => openBetSlip(sidKey, odds, 'back', window.innerWidth < 1200)
        }
        style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
      >
        <span className='casino-odds'>{dead ? '0' : odds}</span>
      </div>
    );
  };

  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        {['A', 'B'].map((p, idx) => {
          const mainSid = findMainSid(p);
          const consecSid = findConsecSid(p);
          const mainDead =
            isSuspended ||
            (!oddsOf(entryOf(markets, mainSid), 'back') &&
              !oddsOf(entryOf(markets, mainSid), 'lay'));
          const consecDead =
            isSuspended ||
            (!oddsOf(entryOf(markets, consecSid), 'back') &&
              !oddsOf(entryOf(markets, consecSid), 'lay'));

          return (
            <React.Fragment key={p}>
              {idx === 1 && <div className='casino-table-box-divider' />}
              <div
                className={
                  idx === 0 ? 'casino-table-left-box' : 'casino-table-right-box'
                }
              >
                <div className='casino-table-header'>
                  <div className='casino-nation-detail'>Player {p}</div>
                  <div className='casino-odds-box back'>Back</div>
                  <div className='casino-odds-box lay'>Lay</div>
                </div>
                <div className='casino-table-body'>
                  <div
                    className={`casino-table-row ${mainDead ? 'suspended-row' : ''}`}
                  >
                    <div className='casino-nation-detail'>
                      <div className='casino-nation-name'>Main</div>
                      <BookLabel
                        nationBook={nationBook}
                        keys={[p, `player${p}`]}
                      />
                    </div>
                    <Box markets={markets} sid={mainSid} type='back' />
                    <Box markets={markets} sid={mainSid} type='lay' />
                  </div>
                  <div
                    className={`casino-table-row ${consecDead ? 'suspended-row' : ''}`}
                  >
                    <div className='casino-nation-detail'>
                      <div className='casino-nation-name'>Consecutive</div>
                      <BookLabel
                        nationBook={nationBook}
                        keys={[`consec:${p}`]}
                      />
                    </div>
                    <Box markets={markets} sid={consecSid} type='back' />
                    <Box markets={markets} sid={consecSid} type='lay' />
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className='casino-table-full-box teenpatti1day-other-odds mt-3'>
        <div className='casino-table-header'>
          <div className='casino-nation-detail' />
          {[1, 2, 3, 4, 5, 6].map((c) => (
            <div className='casino-odds-box' key={c}>
              Card {c}
            </div>
          ))}
        </div>
        <div className='casino-table-body'>
          <div className='casino-table-row'>
            <div className='casino-nation-detail'>
              <div className='casino-nation-name'>Odd</div>
            </div>
            {[1, 2, 3, 4, 5, 6].map((c) => renderCardParityBox(c, 'odd'))}
          </div>
          <div className='casino-table-row'>
            <div className='casino-nation-detail'>
              <div className='casino-nation-name'>Even</div>
            </div>
            {[1, 2, 3, 4, 5, 6].map((c) => renderCardParityBox(c, 'even'))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vaaa
export function TableVaaa() {
  const { markets } = useV();
  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        <MainBox
          markets={markets}
          nat='Amar'
          label='A. Amar'
          bookKeys={['amar', 'Amar']}
        />
        <MainBox
          markets={markets}
          nat='Akbar'
          label='B. Akbar'
          bookKeys={['akbar', 'Akbar']}
        />
        <MainBox
          markets={markets}
          nat='Anthony'
          label='C. Anthony'
          bookKeys={['anthony', 'Anthony']}
        />
      </div>
      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <ThemeBox markets={markets} nat='Even'>
            Even
          </ThemeBox>
          <ThemeBox markets={markets} nat='Odd'>
            Odd
          </ThemeBox>
        </div>
        <div className='casino-table-center-box'>
          <ThemeBox markets={markets} nat='Red'>
            <RedSuits />
          </ThemeBox>
          <ThemeBox markets={markets} nat='Black'>
            <BlackSuits />
          </ThemeBox>
        </div>
        <div className='casino-table-right-box'>
          <ThemeBox
            markets={markets}
            nat='Under 7'
            bookKeys={['under7', 'Under 7']}
          >
            Under 7
          </ThemeBox>
          <ThemeBox
            markets={markets}
            nat='Over 7'
            bookKeys={['over7', 'Over 7']}
          >
            Over 7
          </ThemeBox>
        </div>
      </div>
      <CardRow
        markets={markets}
        useHeading
        extraClass='aaacards'
        nats={['Card A', ...RANKS.slice(1).map((r) => `Card ${r}`)]}
      />
    </div>
  );
}

// ---------------------------------------------------------------- vbtable
// Exact D247: Row 1 A.Don..F.Ghulam (Back+Lay);
// Row 2 left-odd-box (Odd Back+Lay) + right-odd-box (Dulha Dulhan K-Q, Barati J-A ThemeBox);
// Row 3 left (Red/Black ThemeBox with suits) + right-cards (live odds header + J,Q,K,A)
export function TableVbtable() {
  const { markets, isSuspended, openBetSlip, nationBook } = useV();
  const chars = [
    { nat: 'Don', label: 'A.Don', bk: 'don' },
    { nat: 'Amar Akbar Anthony', label: 'B.Amar Akbar Anthony', bk: 'aaa' },
    {
      nat: 'Sahib Bibi Aur Ghulam',
      label: 'C.Sahib Bibi Aur Ghulam',
      bk: 'sbg',
    },
    { nat: 'Dharam Veer', label: 'D.Dharam Veer', bk: 'dv' },
    {
      nat: 'Kis Kis ko Pyaar Karoon',
      label: 'E.Kis Kis ko Pyaar Karoon',
      bk: 'kkpk',
    },
    { nat: 'Ghulam', label: 'F.Ghulam', bk: 'ghulam' },
  ];
  const cards = [
    { nat: 'Card J', rank: 'J', num: 11 },
    { nat: 'Card Q', rank: 'Q', num: 12 },
    { nat: 'card K', rank: 'K', num: 13 },
    { nat: 'card A', rank: 'A', num: 1 },
  ];
  const cardHeaderOdds = oddsOf(entryOf(markets, 'Card J'));

  return (
    <div className='casino-table'>
      <div className='casino-table-box'>
        {chars.map((c) => (
          <MainBox
            key={c.nat}
            markets={markets}
            nat={c.nat}
            label={c.label}
            bookKeys={[c.bk, c.nat]}
          />
        ))}
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box left-odd-box'>
          <MainBox
            markets={markets}
            nat='Odd'
            label='Odd'
            bookKeys={['odd', 'Odd']}
          />
        </div>
        <div className='casino-table-right-box right-odd-box'>
          <ThemeBox
            markets={markets}
            nat='Dulha Dulhan K-Q'
            bookKeys={['dulhadulhan', 'Dulha Dulhan K-Q']}
          >
            Dulha Dulhan K-Q
          </ThemeBox>
          <ThemeBox
            markets={markets}
            nat='Barati J-A'
            bookKeys={['barati', 'Barati J-A']}
          >
            Barati J-A
          </ThemeBox>
        </div>
      </div>

      <div className='casino-table-box mt-3'>
        <div className='casino-table-left-box'>
          <ThemeBox markets={markets} nat='Red' bookKeys={['red', 'Red']}>
            <RedSuits />
          </ThemeBox>
          <ThemeBox markets={markets} nat='Black' bookKeys={['black', 'Black']}>
            <BlackSuits />
          </ThemeBox>
        </div>
        <div className='casino-table-right-box right-cards'>
          <h4 className='mb-2 w-100 text-center'>
            <b>{!cardHeaderOdds || isSuspended ? '0' : cardHeaderOdds}</b>
          </h4>
          {cards.map((c) => {
            const odds = oddsOf(entryOf(markets, c.nat));
            const dead = !odds || isSuspended;
            return (
              <div
                key={c.nat}
                className='card-odd-box'
                onClick={
                  dead
                    ? undefined
                    : () =>
                        openBetSlip(
                          c.nat,
                          odds,
                          'back',
                          window.innerWidth < 1200
                        )
                }
                style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
              >
                <div className={dead ? 'suspended-box' : ''}>
                  <img src={RANK_SRC(c.rank)} alt={c.rank} />
                </div>
                <BookLabel
                  nationBook={nationBook}
                  keys={[`card:${c.num}`, c.nat]}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const VIRTUAL_TABLES = {
  vlucky7: TableVlucky7,
  vtrio: TableVtrio,
  vdtl20: TableVdtl20,
  vteenmuf: TableVteenmuf,
  vaaa: TableVaaa,
  vbtable: TableVbtable,
  vdt6: TableVdt6,
  vteen: TableVteen,
  vteen20: TableVteen20,
  teen20v: TableVteen20,
  teen20v1: TableVteen20,
};

export default VIRTUAL_TABLES;

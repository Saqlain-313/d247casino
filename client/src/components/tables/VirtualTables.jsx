import React from 'react';
import { useCasino, normalizeSelection } from '../../context/CasinoContext';
import OddsBox from './OddsBox';

// Virtual casino felt tables — reference DOM + style.css contracts ke mutabiq:
// felt elements DIRECT children of .casino-table-box hone chahiye (game-scoped
// CSS widths: .aaa 33%, .trio 33%, .bollywood 33%, .lucky7a 45% etc.). Har cell
// live provider selection se bound (exact nat names).
// Rank card faces public/ se (dev-server glob cache se bachne ke liye)
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
  const { roundData, isSuspended, openBetSlip } = useCasino();
  return { markets: roundData?.markets || {}, isSuspended, openBetSlip };
};

const entryOf = (markets, nat) => markets[normalizeSelection(nat)];
const oddsOf = (entry, type = 'back') => {
  if (!entry) return null;
  const gs = String(entry.gstatus || '').toUpperCase();
  if (gs && !['OPEN', 'ACTIVE'].includes(gs)) return null;
  const v = entry?.[type];
  return Number(v) > 1 ? v : null;
};

const Box = ({ markets, nat, type = 'back', label }) => {
  const odds = oddsOf(entryOf(markets, nat), type);
  const { isSuspended } = useV();
  if (!odds || isSuspended) {
    return (
      <div className={`casino-odds-box ${type} suspended-box`}>
        <span className='casino-odds'>{label || '0'}</span>
      </div>
    );
  }
  return <OddsBox nation={nat} odds={odds} type={type} />;
};

// odds upar + themed back box (label / suit icons) — wrapper class game contract se
const ThemeBox = ({
  markets,
  nat,
  wrap = 'aaa-odd-box',
  wrapStyle,
  children,
}) => {
  const { isSuspended, openBetSlip } = useV();
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
      <div className='casino-nation-book text-center'></div>
    </div>
  );
};

// reference casino-odd-box-container — DIRECT child of casino-table-box
const MainBox = ({ markets, nat, label, lay = true }) => (
  <div className='casino-odd-box-container'>
    <div className='casino-nation-name'>
      {label}
      <div className='casino-nation-book d-md-none'></div>
    </div>
    <Box markets={markets} nat={nat} type='back' />
    {lay && <Box markets={markets} nat={nat} type='lay' />}
    <div className='casino-nation-book d-none d-md-block w-100 text-center'></div>
  </div>
);

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

const CardRow = ({ markets, nats, title, perBox = false, extraClass = '' }) => {
  const { isSuspended, openBetSlip } = useV();
  return (
    <div className={`casino-table-full-box ${extraClass} mt-3`}>
      {title && (
        <h4 className='mb-2 w-100 text-center'>
          <b>{title}</b>
        </h4>
      )}
      {RANKS.map((r, i) => {
        const nat = nats ? nats[i] : `Card ${r}`;
        const odds = oddsOf(entryOf(markets, nat));
        const dead = !odds || isSuspended;
        return (
          <div
            key={r}
            className={`card-odd-box ${dead ? 'suspended-box' : ''}`}
            onClick={
              dead
                ? undefined
                : () => openBetSlip(nat, odds, 'back', window.innerWidth < 1200)
            }
            style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
          >
            {perBox && (
              <div className='casino-odds fw-bold text-center'>
                {dead ? '0' : odds}
              </div>
            )}
            <div>
              <img src={RANK_SRC(r)} alt={r} />
            </div>
            <div className='casino-nation-book'></div>
          </div>
        );
      })}
    </div>
  );
};

// Uniform row table (tailwind grid) — sab odds boxes same width/height
const RowTable = ({ markets, title, rows, lay = false }) => (
  <div className='w-full min-w-0 border border-[#c7c8ca] bg-white'>
    {title && (
      <div className='bg-secondary text-secondary px-2 py-1 text-[13px] font-bold'>
        {title}
      </div>
    )}
    <div className='flex border-b border-[#c7c8ca] bg-[#f7f7f7] text-[13px] font-bold text-[#333]'>
      <div className='min-w-0 flex-1 px-2 py-1'>Nation</div>
      <div className='w-[38%] shrink-0 bg-[#72bbef] px-1 py-1 text-center text-[#333]'>
        Back
      </div>
      {lay && (
        <div className='w-[38%] shrink-0 bg-[#faa9ba] px-1 py-1 text-center text-[#333]'>
          Lay
        </div>
      )}
    </div>
    {rows.map((r) => (
      <div key={r.nat} className='flex items-stretch border-b border-[#e3e3e3]'>
        <div className='min-w-0 flex-1 px-2 py-1 text-[13px] font-semibold text-[#333]'>
          {r.label || r.nat}
        </div>
        <div className='w-[38%] shrink-0'>
          <Box markets={markets} nat={r.nat} type='back' />
        </div>
        {lay && (
          <div className='w-[38%] shrink-0'>
            <Box markets={markets} nat={r.nat} type='lay' />
          </div>
        )}
      </div>
    ))}
  </div>
);

// Reference matrix table: rows = selections, columns = market types
const MatrixTable = ({ markets, columns, rows, lay = false }) => {
  const colW = `${76 / columns.length}%`;
  return (
    <div className='w-full min-w-0 border border-[#c7c8ca] bg-white'>
      <div className='flex border-b border-[#c7c8ca] bg-[#f7f7f7]'>
        <div className='w-[24%] shrink-0 px-2 py-1 text-[13px] font-bold text-[#333]'>
          Nation
        </div>
        {columns.map((c) => (
          <div
            key={c}
            className='casino-odds-box back !min-h-[30px] shrink-0 px-1 text-[12px]'
            style={{ width: colW }}
          >
            <span className='casino-odds !text-[12px]'>{c}</span>
          </div>
        ))}
        {lay && (
          <div className='casino-odds-box lay !min-h-[30px] w-[19%] shrink-0 px-1 text-[12px]'>
            <span className='casino-odds !text-[12px]'>Lay</span>
          </div>
        )}
      </div>
      {rows.map((r) => (
        <div
          key={r.label}
          className='flex items-stretch border-b border-[#e3e3e3]'
        >
          <div className='w-[24%] shrink-0 px-2 py-1 text-[13px] font-semibold text-[#333]'>
            {r.label}
          </div>
          {r.nats.map((n) => (
            <div key={n} className='shrink-0' style={{ width: colW }}>
              <Box markets={markets} nat={n} />
            </div>
          ))}
          {lay && (
            <div className='w-[19%] shrink-0'>
              <Box markets={markets} nat={r.nats[0]} type='lay' />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// reference lucky7cards: odds upar + 3 card images + nation-book
const GroupCards = ({ markets, nat, cards }) => {
  const { isSuspended, openBetSlip } = useV();
  const odds = oddsOf(entryOf(markets, nat));
  const dead = !odds || isSuspended;
  return (
    <div
      className={`lucky7cards ${dead ? 'suspended-box' : ''}`}
      onClick={
        dead
          ? undefined
          : () => openBetSlip(nat, odds, 'back', window.innerWidth < 1200)
      }
      style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
    >
      <div className='casino-odds fw-bold text-center'>{dead ? '0' : odds}</div>
      <div className='d-flex justify-content-center gap-1'>
        {cards.map((c) => (
          <div key={c} className='card-odd-box'>
            <div>
              <img src={`/cards-rank/${c}.png`} alt={c} />
            </div>
          </div>
        ))}
      </div>
      <div className='casino-nation-book text-center'></div>
    </div>
  );
};

// ---------------------------------------------------------------- vlucky7
export function TableVlucky7() {
  const { markets } = useV();
  return (
    <div className='vfelt casino-table lucky7a'>
      <div className='casino-table-box'>
        <div className='casino-table-full-box'>
          <ThemeBox markets={markets} nat='Low Card' wrap='lucky7low'>
            Low Card
          </ThemeBox>
          <ThemeBox markets={markets} nat='Card 7' wrap='lucky7'>
            <img
              src='/cards-rank/seven.png'
              alt='7'
              className='h-[30px] w-auto'
            />
          </ThemeBox>
          <ThemeBox markets={markets} nat='High Card' wrap='lucky7high'>
            High Card
          </ThemeBox>
        </div>

        <div className='casino-table-box mt-3'>
          <div className='casino-table-left-box'>
            <ThemeBox
              markets={markets}
              nat='Even'
              wrap='lucky7odds'
              wrapStyle={{
                flex: '0 0 calc(50% - 5px)',
                width: 'calc(50% - 5px)',
                marginRight: 0,
              }}
            >
              Even
            </ThemeBox>
            <ThemeBox
              markets={markets}
              nat='Odd'
              wrap='lucky7odds'
              wrapStyle={{
                flex: '0 0 calc(50% - 5px)',
                width: 'calc(50% - 5px)',
                marginRight: 0,
              }}
            >
              Odd
            </ThemeBox>
          </div>
          <div className='casino-table-right-box'>
            <ThemeBox
              markets={markets}
              nat='Red'
              wrap='lucky7odds'
              wrapStyle={{
                flex: '0 0 calc(50% - 5px)',
                width: 'calc(50% - 5px)',
                marginRight: 0,
              }}
            >
              <RedSuits />
            </ThemeBox>
            <ThemeBox
              markets={markets}
              nat='Black'
              wrap='lucky7odds'
              wrapStyle={{
                flex: '0 0 calc(50% - 5px)',
                width: 'calc(50% - 5px)',
                marginRight: 0,
              }}
            >
              <BlackSuits />
            </ThemeBox>
          </div>
        </div>

        <div className='casino-table-box mt-3'>
          {[
            { nat: 'Line 1', cards: ['A', '2', '3'] },
            { nat: 'Line 2', cards: ['4', '5', '6'] },
            { nat: 'Line 3', cards: ['8', '9', '10'] },
            { nat: 'Line 4', cards: ['J', 'Q', 'K'] },
          ].map((g) => (
            <GroupCards
              key={g.nat}
              markets={markets}
              nat={g.nat}
              cards={g.cards}
            />
          ))}
        </div>

        <CardRow
          markets={markets}
          title='Cards 1 to 13 (Payout 12.0)'
          perBox
          extraClass='lucky7acards'
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vtrio
export function TableVtrio() {
  const { markets } = useV();
  const top = [
    'Session',
    '3 Card Judgement (1 2 4)',
    '3 Card Judgement (J Q K)',
  ];
  const mid = [
    'Two Red Only',
    'Two Black Only',
    'Two Odd Only',
    'Two Even Only',
  ];
  const side = ['Pair', 'Flush', 'Straight', 'Trio', 'Straight Flush'];
  return (
    <div className='vfelt casino-table trio'>
      <div className='casino-table-box'>
        {top.map((n) => (
          <MainBox key={n} markets={markets} nat={n} label={n} />
        ))}
      </div>
      <div className='casino-table-box mt-3'>
        {mid.map((n) => (
          <MainBox key={n} markets={markets} nat={n} label={n} />
        ))}
      </div>
      <div className='casino-table-box triocards mt-3'>
        {side.map((n) => (
          <MainBox key={n} markets={markets} nat={n} label={n} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vdtl20
export function TableVdtl20() {
  const { markets, isSuspended, openBetSlip } = useV();
  const players = [
    { name: 'Dragon', s: 'D' },
    { name: 'Tiger', s: 'T' },
    { name: 'Lion', s: 'L' },
  ];
  const leftSides = [
    { label: 'Winner', key: 'Winner', icon: null },
    { label: 'Black', key: 'Black', icon: 'black' },
    { label: 'Red', key: 'Red', icon: 'red' },
    { label: 'Odd', key: 'Odd', icon: null },
    { label: 'Even', key: 'Even', icon: null },
  ];

  return (
    <div className='vfelt casino-table'>
      <div className='casino-table-box'>
        <div className='casino-table-left-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Dragon</div>
            <div className='casino-odds-box back'>Tiger</div>
            <div className='casino-odds-box back'>Lion</div>
          </div>
          <div className='casino-table-body'>
            {leftSides.map((row) => (
              <div className='casino-table-row' key={row.key}>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>
                    {row.label}
                    {row.icon === 'black' && <BlackSuits />}
                    {row.icon === 'red' && <RedSuits />}
                  </div>
                </div>
                {players.map((p) => (
                  <Box key={p.s} markets={markets} nat={`${row.key} ${p.s}`} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className='casino-table-box-divider' />

        <div className='casino-table-right-box'>
          <div className='casino-table-header'>
            <div className='casino-nation-detail' />
            <div className='casino-odds-box back'>Dragon</div>
            <div className='casino-odds-box back'>Tiger</div>
            <div className='casino-odds-box back'>Lion</div>
          </div>
          <div className='casino-table-body'>
            {RANKS.map((r) => (
              <div className='casino-table-row' key={r}>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>Card {r}</div>
                </div>
                {players.map((p) => (
                  <Box key={p.s} markets={markets} nat={`${p.name} ${r}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vdt6
export function TableVdt6() {
  const { markets } = useV();
  return (
    <div className='vfelt casino-table'>
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
            <div className='casino-odds-box back'>Red</div>
            <div className='casino-odds-box back'>Black</div>
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

      <div className='casino-table-box mt-3'>
        {['Spade', 'Heart', 'Diamond', 'Club'].map((su) => (
          <div
            className='casino-table-left-box'
            style={{ width: 'calc(25% - 2px)' }}
            key={su}
          >
            <div className='casino-table-header'>
              <div className='casino-nation-detail'>{su}</div>
              <div className='casino-odds-box back'>D</div>
              <div className='casino-odds-box back'>T</div>
            </div>
            <div className='casino-table-body'>
              <div className='casino-table-row'>
                <div className='casino-nation-detail'>
                  <div className='casino-nation-name'>{su}</div>
                </div>
                <Box markets={markets} nat={`Dragon ${su}`} />
                <Box markets={markets} nat={`Tiger ${su}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vteen family
export function TableVteen20() {
  const { markets, isSuspended, openBetSlip } = useV();
  const renderSuitBtn = (nat, suits) => {
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
        style={{
          cursor: dead ? 'not-allowed' : 'pointer',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <div>{suits === 'black' ? <BlackSuits /> : <RedSuits />}</div>
        <div>
          <span className='casino-odds'>{dead ? '0' : odds}</span>
        </div>
      </div>
    );
  };

  return (
    <div className='vfelt casino-table'>
      <div className='casino-table-box'>
        {['A', 'B'].map((p, idx) => (
          <div
            key={p}
            className={
              idx === 0 ? 'casino-table-left-box' : 'casino-table-right-box'
            }
          >
            <div className='casino-table-header'>
              <div className='casino-nation-detail'>Player {p}</div>
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
                <Box markets={markets} nat={`Pair Plus ${p}`} label={p} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='casino-table-box mt-2' style={{ gap: '4px' }}>
        <div
          className='casino-table-left-box'
          style={{ display: 'flex', gap: '4px' }}
        >
          {renderSuitBtn('Black A', 'black')}
          {renderSuitBtn('Red A', 'red')}
        </div>
        <div
          className='casino-table-right-box'
          style={{ display: 'flex', gap: '4px' }}
        >
          {renderSuitBtn('Black B', 'black')}
          {renderSuitBtn('Red B', 'red')}
        </div>
      </div>
    </div>
  );
}

export function TableVteenmuf() {
  const { markets } = useV();
  return (
    <div className='vfelt casino-table'>
      <div className='casino-table-box'>
        {['A', 'B'].map((p, idx) => (
          <div
            key={p}
            className={
              idx === 0 ? 'casino-table-left-box' : 'casino-table-right-box'
            }
          >
            <div className='casino-table-header'>
              <div className='casino-nation-detail'>Player {p}</div>
            </div>
            <div className='casino-table-body'>
              <div className='casino-table-row'>
                <div className='casino-odds-box'>Winner</div>
                <div className='casino-odds-box'>Top 9</div>
                <div className='casino-odds-box'>M Baccarat {p}</div>
              </div>
              <div className='casino-table-row'>
                <Box markets={markets} nat={`Player ${p}`} />
                <Box markets={markets} nat={`Top 9 ${p}`} label={p} />
                <Box markets={markets} nat={`M Baccarat ${p}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableVteen() {
  const { markets } = useV();
  const suits = ['Spade', 'Diamond', 'Club', 'Heart'];
  return (
    <div className='vfelt casino-table'>
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
                <div className='casino-odds-box back'>Back</div>
                <div className='casino-odds-box lay'>Lay</div>
              </div>
              <div className='casino-table-body'>
                <div className='casino-table-row'>
                  <div className='casino-nation-detail'>
                    <div className='casino-nation-name'>Main</div>
                  </div>
                  <Box markets={markets} nat={`Player ${p}`} type='back' />
                  <Box markets={markets} nat={`Player ${p}`} type='lay' />
                </div>
                {suits.map((su) => (
                  <div className='casino-table-row' key={su}>
                    <div className='casino-nation-detail'>
                      <div className='casino-nation-name'>{su}</div>
                    </div>
                    <Box
                      markets={markets}
                      nat={`Player ${p} ${su}`}
                      type='back'
                    />
                    <Box
                      markets={markets}
                      nat={`Player ${p} ${su}`}
                      type='lay'
                    />
                  </div>
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className='casino-table-full-box teenpatti1day-other-odds mt-3'>
        <div className='casino-table-header'>
          <div className='casino-nation-detail' />
          {['1', '2', '3', '4', '5', '6'].map((c) => (
            <div className='casino-odds-box' key={c}>
              Card {c}
            </div>
          ))}
        </div>
        <div className='casino-table-body'>
          <div className='casino-table-row'>
            <div className='casino-nation-detail'>
              <div className='casino-nation-name'>Odd / Even</div>
            </div>
            {['1', '2', '3', '4', '5', '6'].map((c) => (
              <Box key={c} markets={markets} nat={`Card ${c}`} />
            ))}
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
    <div className='vfelt casino-table aaa'>
      <div className='casino-table-box'>
        <MainBox markets={markets} nat='Amar' label='A. Amar' />
        <MainBox markets={markets} nat='Akbar' label='B. Akbar' />
        <MainBox markets={markets} nat='Anthony' label='C. Anthony' />
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
          <ThemeBox markets={markets} nat='Under 7'>
            Under 7
          </ThemeBox>
          <ThemeBox markets={markets} nat='Over 7'>
            Over 7
          </ThemeBox>
        </div>
      </div>
      <CardRow
        markets={markets}
        title='12'
        extraClass='aaacards'
        nats={['Card A', ...RANKS.slice(1).map((r) => `Card ${r}`)]}
      />
    </div>
  );
}

// ---------------------------------------------------------------- vbtable
export function TableVbtable() {
  const { markets, isSuspended, openBetSlip } = useV();
  const chars = [
    'Don',
    'Amar Akbar Anthony',
    'Sahib Bibi Aur Ghulam',
    'Dharam Veer',
    'Kis Kis ko Pyaar Karoon',
    'Ghulam',
  ];
  const cards = ['Card J', 'Card Q', 'card K', 'card A'];
  return (
    <div className='vfelt casino-table bollywood'>
      <div className='casino-table-box'>
        {chars.map((n) => (
          <MainBox key={n} markets={markets} nat={n} label={n} />
        ))}
      </div>
      <div className='casino-table-box mt-3'>
        <MainBox markets={markets} nat='Odd' label='Odd' />
        <MainBox markets={markets} nat='Red' label='Red' />
        <MainBox markets={markets} nat='Black' label='Black' />
        <MainBox
          markets={markets}
          nat='Dulha Dulhan K-Q'
          label='Dulha Dulhan K-Q'
        />
        <MainBox markets={markets} nat='Barati J-A' label='Barati J-A' />
      </div>
      <div className='casino-table-full-box mt-3'>
        {cards.map((n) => {
          const rank = n.split(' ')[1].toUpperCase();
          const odds = oddsOf(entryOf(markets, n));
          const dead = !odds || isSuspended;
          return (
            <div
              key={n}
              className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
              onClick={
                dead
                  ? undefined
                  : () => openBetSlip(n, odds, 'back', window.innerWidth < 1200)
              }
              style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
            >
              <div>
                <img src={RANK_SRC(rank)} alt={rank} />
              </div>
              <div className='casino-nation-book'></div>
            </div>
          );
        })}
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

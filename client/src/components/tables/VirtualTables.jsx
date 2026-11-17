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
  const v = entry?.[type];
  return entry && Number(v) > 0 ? v : null;
};

const Box = ({ markets, nat, type = 'back' }) => {
  const odds = oddsOf(entryOf(markets, nat), type);
  if (!odds) {
    return (
      <div className={`casino-odds-box ${type}`}>
        <span className='casino-odds'>-</span>
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
      <div className='casino-odds text-center'>{dead ? '-' : odds}</div>
      <div
        className={`casino-odds-box back casino-odds-box-theme ${isSuspended ? 'suspended-box' : ''}`}
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
            className={`card-odd-box ${isSuspended ? 'suspended-box' : ''}`}
            onClick={
              dead
                ? undefined
                : () => openBetSlip(nat, odds, 'back', window.innerWidth < 1200)
            }
            style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
          >
            {perBox && (
              <div className='casino-odds fw-bold text-center'>
                {dead ? '-' : odds}
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
      className={`lucky7cards ${isSuspended ? 'suspended-box' : ''}`}
      onClick={
        dead
          ? undefined
          : () => openBetSlip(nat, odds, 'back', window.innerWidth < 1200)
      }
      style={{ cursor: dead ? 'not-allowed' : 'pointer' }}
    >
      <div className='casino-odds fw-bold text-center'>{dead ? '-' : odds}</div>
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
  const { markets } = useV();
  const players = [
    { name: 'Dragon', s: 'D' },
    { name: 'Tiger', s: 'T' },
    { name: 'Lion', s: 'L' },
  ];
  const sides = ['Winner', 'Black', 'Red', 'Odd', 'Even'];
  return (
    <div className='vfelt w-full min-w-0 bg-[#f6f6f6] p-1'>
      <MatrixTable
        markets={markets}
        columns={['Dragon', 'Tiger', 'Lion']}
        rows={sides.map((x) => ({
          label: x,
          nats: players.map((p) => `${x} ${p.s}`),
        }))}
      />
      <div className='mt-2 grid grid-cols-1 gap-2 md:grid-cols-3'>
        {players.map((p) => (
          <CardRow
            key={p.s}
            markets={markets}
            nats={RANKS.map((r) => `${p.name} ${r}`)}
            perBox
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vdt6
export function TableVdt6() {
  const { markets } = useV();
  const sides = [
    'Even',
    'Odd',
    'Red',
    'Black',
    'Spade',
    'Heart',
    'Diamond',
    'Club',
  ];
  return (
    <div className='vfelt w-full min-w-0 bg-[#f6f6f6] p-1'>
      <RowTable
        markets={markets}
        lay
        rows={[{ nat: 'Dragon' }, { nat: 'Tiger' }, { nat: 'Pair' }]}
      />
      <div className='mt-2 grid grid-cols-1 gap-2 md:grid-cols-2'>
        <RowTable
          markets={markets}
          title='Dragon'
          rows={sides.map((x) => ({ nat: `Dragon ${x}`, label: x }))}
        />
        <RowTable
          markets={markets}
          title='Tiger'
          rows={sides.map((x) => ({ nat: `Tiger ${x}`, label: x }))}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- vteen family
const TeenLayout = ({ markets, sideNames, lay = false }) => (
  <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
    <RowTable
      markets={markets}
      title='Main'
      lay={lay}
      rows={[{ nat: 'Player A' }, { nat: 'Player B' }]}
    />
    <RowTable
      markets={markets}
      title='Side Bets'
      rows={sideNames.map((n) => ({ nat: n }))}
    />
  </div>
);

export function TableVteen20() {
  const { markets } = useV();
  return (
    <div className='vfelt w-full min-w-0 bg-[#f6f6f6] p-1'>
      <MatrixTable
        markets={markets}
        columns={['Player', '3 Baccarat', 'Total', 'Pair Plus']}
        rows={['A', 'B'].map((p) => ({
          label: `Player ${p}`,
          nats: [
            `Player ${p}`,
            `3 Baccarat ${p}`,
            `Total ${p}`,
            `Pair Plus ${p}`,
          ],
        }))}
      />
      <div className='mt-2'>
        <MatrixTable
          markets={markets}
          columns={['Black', 'Red']}
          rows={['A', 'B'].map((p) => ({
            label: `Player ${p}`,
            nats: [`Black ${p}`, `Red ${p}`],
          }))}
        />
      </div>
    </div>
  );
}

export function TableVteenmuf() {
  const { markets } = useV();
  return (
    <div className='vfelt w-full min-w-0 bg-[#f6f6f6] p-1'>
      <MatrixTable
        markets={markets}
        columns={['Player', 'Top 9', 'M Baccarat']}
        rows={['A', 'B'].map((p) => ({
          label: `Player ${p}`,
          nats: [`Player ${p}`, `Top 9 ${p}`, `M Baccarat ${p}`],
        }))}
      />
    </div>
  );
}

export function TableVteen() {
  const { markets } = useV();
  const suits = ['Spade', 'Diamond', 'Club', 'Heart'];
  return (
    <div className='vfelt w-full min-w-0 bg-[#f6f6f6] p-1'>
      <RowTable
        markets={markets}
        lay
        rows={[{ nat: 'Player A' }, { nat: 'Player B' }]}
      />
      <div className='mt-2'>
        <MatrixTable
          markets={markets}
          columns={suits}
          rows={['A', 'B'].map((p) => ({
            label: `Player ${p}`,
            nats: suits.map((su) => `Player ${p} ${su}`),
          }))}
        />
      </div>
      <div className='mt-2'>
        <RowTable
          markets={markets}
          title='Cards'
          rows={['1', '2', '3', '4', '5', '6'].map((c) => ({
            nat: `Card ${c}`,
            label: `Card ${c}`,
          }))}
        />
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

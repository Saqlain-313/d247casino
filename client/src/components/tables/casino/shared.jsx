import { useCasino, normalizeSelection } from '../../../context/CasinoContext';
import OddsBox from '../OddsBox';

const NationBook = ({ id }) => {
  const { nationBook } = useCasino();
  const v = Math.round(Number(nationBook?.[id] ?? 0));
  return (
    <div
      className={`casino-nation-book text-center ${
        v > 0 ? 'text-success' : v < 0 ? 'text-danger' : ''
      }`}
    >
      {v !== 0 ? v : ''}
    </div>
  );
};

/* ==========================================================================
   AUTHENTIC 93 CASINO GAME DEDICATED MARKET TABLES
   100% INDIVIDUAL, ZERO GROUPING, ZERO FAMILY SPECIFICATION
   ========================================================================== */

const SUIT_META = {
  HH: { sym: '♥', cls: 'text-red-600' },
  DD: { sym: '♦', cls: 'text-red-600' },
  CC: { sym: '♣', cls: 'text-black' },
  SS: { sym: '♠', cls: 'text-black' },
};

const formatInlineCard = (code) => {
  const s = String(code || '')
    .trim()
    .toUpperCase();
  if (!s || s === '1') return null;
  const rank = s.length === 4 ? s.slice(0, 2) : s.slice(0, 1);
  const suit = SUIT_META[s.slice(-2)] || { sym: '', cls: 'text-black' };
  return { rank, ...suit };
};

function TableT2Generic() {
  const { roundData, isSuspended } = useCasino();
  const groups = roundData?.mgroups || [];
  const markets = roundData?.markets || {};
  if (!groups.length) return null;

  const Cell = ({ nat, type = 'back' }) => {
    const e = markets[normalizeSelection(nat)];
    const odds = type === 'lay' ? e?.lay : e?.back;
    const live = e && Number(odds) > 0;
    if (!live) {
      return (
        <div className={`casino-odds-box ${type} suspended-box`}>
          <span className='casino-odds'>0</span>
        </div>
      );
    }
    return <OddsBox nation={nat} odds={odds} type={type} />;
  };

  return (
    <div className='w-full min-w-0 bg-[#f6f6f6] p-1'>
      {groups.map((g, gi) => {
        const secs = g.section || [];
        const hasLay = secs.some(
          (x) => Number(markets[normalizeSelection(x.nat)]?.lay) > 0
        );
        return (
          <div
            key={g.mname || gi}
            className='mb-2 w-full min-w-0 border border-[#c7c8ca] bg-white'
          >
            <div className='bg-secondary text-secondary px-2 py-1 text-[13px] font-bold'>
              {g.mname}
            </div>
            <div className='flex border-b border-[#c7c8ca] bg-[#f7f7f7] text-[13px] font-bold text-[#333]'>
              <div className='min-w-0 flex-1 px-2 py-1'>Nation</div>
              <div className='w-[30%] shrink-0 bg-[#72bbef] px-1 py-1 text-center'>
                Back
              </div>
              {hasLay && (
                <div className='w-[30%] shrink-0 bg-[#faa9ba] px-1 py-1 text-center'>
                  Lay
                </div>
              )}
            </div>
            {secs.map((x) => (
              <div
                key={x.sid || x.nat}
                className='flex items-stretch border-b border-[#e3e3e3]'
              >
                <div className='min-w-0 flex-1 px-2 py-1 text-[13px] font-semibold text-[#333]'>
                  {x.nat}
                </div>
                <div className='w-[30%] shrink-0'>
                  <Cell nat={x.nat} />
                </div>
                {hasLay && (
                  <div className='w-[30%] shrink-0'>
                    <Cell nat={x.nat} type='lay' />
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

const LIVE_SUB_SLUGS = new Set([
  'cmatch20',
  'notenum',
  'dum10',
  'superover',
  'superover2',
  'superover3',
  'trap',
  'trio',
  'race20',
  'race17',
  'teen',
  'pteen',
  'teen1',
  'teen120',
  'cmeter1',
  'ab3',
  'ab4',
  'teen9',
  'teensin',
  'joker20',
  'poison',
  'poison20',
  'teen6',
  'teenmuf',
  'poker',
  'card32eu',
  'abj',
]);

function LiveSubMarketTable({ isMobile, isSuspended, openBetSlip }) {
  const { roundData } = useCasino();
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];

  if (!subs.length) {
    return (roundData?.mgroups || []).length ? <TableT2Generic /> : null;
  }

  // Group provider markets by subtype preserving provider sr order
  const groups = [];
  const bySubtype = new Map();
  const sorted = [...subs].sort(
    (a, b) => Number(a?.sr ?? 0) - Number(b?.sr ?? 0)
  );
  for (const item of sorted) {
    const key = String(item?.subtype || 'main');
    if (!bySubtype.has(key)) {
      const group = { key, items: [] };
      bySubtype.set(key, group);
      groups.push(group);
    }
    bySubtype.get(key).items.push(item);
  }

  const isOpen = (item) =>
    !isSuspended &&
    ['OPEN', 'ACTIVE'].includes(
      String(item?.gstatus ?? item?.status ?? '').toUpperCase()
    );

  const renderBox = (item, side, odds) => {
    const open = isOpen(item) && Number(odds) > 0;
    return (
      <div
        className={`casino-odds-box ${side} ${!open ? 'suspended-box' : ''}`}
        style={{
          width: '96px',
          flex: '0 0 96px',
          cursor: open ? 'pointer' : 'not-allowed',
        }}
        onClick={() =>
          open && openBetSlip(item.nat, String(odds), side, isMobile)
        }
      >
        <span className='casino-odds'>{open ? odds : '0'}</span>
      </div>
    );
  };

  return (
    <div className='casino-table live-sub-table'>
      {groups.map((group) => {
        const hasLay = group.items.some((x) => Number(x?.l ?? 0) > 0);
        return (
          <div
            key={group.key}
            className='casino-table-full-box mb-2'
            style={{ width: '100%' }}
          >
            <div className='casino-table-header'>
              <div
                className='casino-nation-detail'
                style={{ flex: '1 1 auto', width: 'auto' }}
              />
              <div
                className='casino-odds-box back'
                style={{ width: '96px', flex: '0 0 96px' }}
              >
                Back
              </div>
              {hasLay && (
                <div
                  className='casino-odds-box lay'
                  style={{ width: '96px', flex: '0 0 96px' }}
                >
                  Lay
                </div>
              )}
            </div>
            <div className='casino-table-body'>
              {group.items.map((item, idx) => (
                <div
                  className='casino-table-row'
                  key={`${item?.sid ?? item?.nat}-${idx}`}
                >
                  <div
                    className='casino-nation-detail'
                    style={{ flex: '1 1 auto', width: 'auto' }}
                  >
                    <div className='casino-nation-name'>{item?.nat}</div>
                    <NationBook id={normalizeSelection(item?.nat)} />
                  </div>
                  {renderBox(item, 'back', item?.b ?? 0)}
                  {hasLay && renderBox(item, 'lay', item?.l ?? 0)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export {
  NationBook,
  SUIT_META,
  formatInlineCard,
  TableT2Generic,
  LIVE_SUB_SLUGS,
  LiveSubMarketTable,
};

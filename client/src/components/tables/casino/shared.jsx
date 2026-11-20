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
  const { roundData, isSuspended, openBetSlip } = useCasino();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1200;
  const groups = roundData?.mgroups || [];
  const subs = Array.isArray(roundData?.sub) ? roundData.sub : [];
  const markets = roundData?.markets || {};
  if (!groups.length && !subs.length) return null;

  const effectiveGroups = groups.length
    ? groups
    : [{ mname: 'Bookmaker', section: subs }];

  const formatMax = (v) => {
    const n = Number(v || 0);
    if (!n) return '';
    if (n >= 100000) return `${+(n / 100000).toFixed(2)}L`;
    if (n >= 1000) return `${+(n / 1000).toFixed(2)}K`;
    return String(n);
  };

  const renderCell = (x, type = 'back') => {
    const key = x?.sid != null ? `sid:${x.sid}` : normalizeSelection(x?.nat);
    const e = markets[key] || markets[normalizeSelection(x?.nat)] || x;
    const gs = String(e?.gstatus ?? x?.gstatus ?? '').toUpperCase();
    const openStatus = !gs || ['OPEN', 'ACTIVE'].includes(gs);
    const isFancy2 =
      String(e?.etype ?? x?.etype ?? '').toLowerCase() === 'fancy2' &&
      (Number(e?.bbhav ?? x?.bbhav) > 0 || Number(e?.lbhav ?? x?.lbhav) > 0);
    const rawOdds = type === 'lay' ? (e?.lay ?? x?.l) : (e?.back ?? x?.b);
    const bhav =
      type === 'lay'
        ? Number(e?.lbhav ?? x?.lbhav)
        : Number(e?.bbhav ?? x?.bbhav);
    const decOdds = isFancy2
      ? bhav > 0
        ? Math.round((1 + bhav / 100) * 100) / 100
        : 0
      : Number(rawOdds);
    const live =
      !isSuspended &&
      openStatus &&
      (isFancy2 ? Number(rawOdds) > 0 && bhav > 0 : decOdds > 1);
    const sidOrNat = x?.sid != null ? String(x.sid) : x?.nat;
    const vol = isFancy2 ? bhav : type === 'lay' ? x?.ls || '' : x?.bs || '';
    return (
      <div
        className={`market-odd-box ${type} ${live ? '' : 'suspended-box'}`}
        style={{ cursor: live ? 'pointer' : 'not-allowed' }}
        onClick={() => live && openBetSlip(sidOrNat, decOdds, type, isMobile)}
      >
        <span className='market-odd'>{live ? rawOdds : '0'}</span>
        {live && vol ? <span className='market-volume'>{vol}</span> : null}
      </div>
    );
  };

  return (
    <div className='detail-page-container position-relative w-full min-w-0'>
      {effectiveGroups.map((g, gi) => {
        const secs = g.section || [];
        const hasLay = secs.some((x) => {
          const e =
            markets[`sid:${x?.sid}`] ||
            markets[normalizeSelection(x?.nat)] ||
            x;
          return Number(e?.lay ?? x?.l ?? 0) > 0;
        });
        const firstMin = secs[0]?.min;
        const firstMax = secs[0]?.max;
        return (
          <div key={g.mname || gi} className='game-market market-2 mb-2'>
            <div className='market-title'>
              <span>{g.mname}</span>
            </div>
            <div className='market-header'>
              <div className='market-nation-detail'>
                {firstMin || firstMax ? (
                  <span className='market-nation-name'>
                    Min: {Number(firstMin || 100).toFixed(2)}{' '}
                    {firstMax ? `Max: ${formatMax(firstMax)}` : ''}
                  </span>
                ) : null}
              </div>
              <div className='market-odd-box back'>
                <b>Back</b>
              </div>
              {hasLay && (
                <div className='market-odd-box lay'>
                  <b>Lay</b>
                </div>
              )}
            </div>
            <div className='market-body'>
              {secs.map((x, idx) => {
                const gs = String(x?.gstatus || '').toUpperCase();
                const rowSusp =
                  isSuspended || (gs && !['OPEN', 'ACTIVE'].includes(gs));
                return (
                  <div
                    key={`${x?.sid ?? x?.nat}-${idx}`}
                    className={`market-row ${rowSusp ? 'suspended-row' : ''}`}
                  >
                    <div className='market-nation-detail'>
                      <span className='market-nation-name'>{x.nat}</span>
                      <NationBook
                        id={
                          String(x?.sid) === '1'
                            ? 'team1'
                            : String(x?.sid) === '2'
                              ? 'team2'
                              : normalizeSelection(x?.nat)
                        }
                      />
                    </div>
                    {renderCell(x, 'back')}
                    {hasLay && renderCell(x, 'lay')}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const LIVE_SUB_SLUGS = new Set([]);

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
    const isFancy2 =
      String(item?.etype || '').toLowerCase() === 'fancy2' &&
      (Number(item?.bbhav) > 0 || Number(item?.lbhav) > 0);
    const bhav = side === 'lay' ? Number(item?.lbhav) : Number(item?.bbhav);
    const effectiveOdds = isFancy2
      ? bhav > 0
        ? Math.round((1 + bhav / 100) * 100) / 100
        : 0
      : Number(odds);
    const open =
      isOpen(item) &&
      (isFancy2 ? Number(odds) > 0 && bhav > 0 : effectiveOdds > 1);
    const keyOrNat = item?.sid != null ? String(item.sid) : item?.nat;
    return (
      <div
        className={`casino-odds-box ${side} ${!open ? 'suspended-box' : ''}`}
        style={{
          width: '96px',
          flex: '0 0 96px',
          cursor: open ? 'pointer' : 'not-allowed',
        }}
        onClick={() =>
          open && openBetSlip(keyOrNat, String(effectiveOdds), side, isMobile)
        }
      >
        <span className='casino-odds'>{open ? odds : '0'}</span>
        {isFancy2 && open && <span className='casino-volume'>{bhav}</span>}
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
